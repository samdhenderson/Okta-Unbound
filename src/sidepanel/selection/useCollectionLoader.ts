import { useCallback } from 'react';
import { useOktaApi } from '../hooks/useOktaApi';
import { useOrgEntityIndex } from '../contexts/OrgEntityIndexContext';
import { getOrFetch, peek } from '../cache/entityCache';
import { AUTH_POLICY_TYPE, POLICIES_CACHE_KEY } from '../hooks/usePoliciesData';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';
import type { Collection, CollectionRow } from './collectionStore';
import type { SelectionKind } from './selectionStore';
import {
  applyFetchedNames,
  planLoad,
  type LoadPlan,
  type LocalName,
  type UnstampedRef,
} from './collectionNames';

export interface LoadResult {
  refs: UnstampedRef[];
  unnamed: CollectionRow[];
}

export interface CollectionLoader {
  plan: (collection: Collection) => LoadPlan;
  load: (collection: Collection) => Promise<LoadResult>;
}

const nameKey = (kind: SelectionKind, id: string) => `${kind}:${id}`;

export function useCollectionLoader(options: {
  targetTabId: number | null;
  oktaOrigin?: string | null;
}): CollectionLoader {
  const { targetTabId, oktaOrigin } = options;
  const index = useOrgEntityIndex();
  const { getUserById, getGroupById, getAppById, listPolicies } = useOktaApi({
    targetTabId: targetTabId ?? null,
    oktaOrigin: oktaOrigin ?? undefined,
  });

  const localName = useCallback(
    (kind: SelectionKind, id: string): LocalName => {
      if (kind === 'group' || kind === 'rule' || kind === 'app') {
        const found = index.lookup(kind, id);
        if (found.status === 'hit') return { status: 'named', name: found.entity.name };
        return found.status === 'miss' ? { status: 'absent' } : { status: 'unknown' };
      }

      if (kind === 'policy') {
        const policies = peek<OktaPolicyListItem[]>(POLICIES_CACHE_KEY);
        if (!policies) return { status: 'unknown' };
        const found = policies.find((policy) => policy.id === id);
        if (!found) return { status: 'absent' };
        return found.name ? { status: 'named', name: found.name } : { status: 'unknown' };
      }

      return { status: 'unknown' };
    },
    [index],
  );

  const plan = useCallback(
    (collection: Collection) => planLoad(collection.rows, localName),
    [localName],
  );

  const load = useCallback(
    async (collection: Collection): Promise<LoadResult> => {
      const current = planLoad(collection.rows, localName);
      const fetched = new Map<string, string>();

      if (current.needsFetch.policy?.length) {
        const policies = await getOrFetch<OktaPolicyListItem[]>(POLICIES_CACHE_KEY, () =>
          listPolicies(AUTH_POLICY_TYPE),
        );
        for (const id of current.needsFetch.policy) {
          const found = policies?.find((policy) => policy.id === id);
          if (found?.name) fetched.set(nameKey('policy', id), found.name);
        }
      }

      for (const id of current.needsFetch.group ?? []) {
        const group = await getGroupById(id);
        if (group?.name) fetched.set(nameKey('group', id), group.name);
      }

      for (const id of current.needsFetch.app ?? []) {
        const app = await getAppById(id);
        if (app.kind === 'found' && app.app.label) fetched.set(nameKey('app', id), app.app.label);
      }

      for (const id of current.needsFetch.user ?? []) {
        const user = await getUserById(id);
        if (user) {
          const full = `${user.firstName} ${user.lastName}`.trim();
          fetched.set(nameKey('user', id), full.length > 0 ? full : user.login);
        }
      }

      const { refs, unnamed } = applyFetchedNames(current, collection.rows, fetched);
      return unnamed.length > 0 ? { refs: [], unnamed } : { refs, unnamed: [] };
    },
    [localName, listPolicies, getGroupById, getAppById, getUserById],
  );

  return { plan, load };
}
