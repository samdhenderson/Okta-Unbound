import { useCallback, useMemo } from 'react';
import { useOrgSnapshot, type UseOrgSnapshotResult } from '../cache/useOrgSnapshot';
import type { OktaIdKind } from '../../shared/utils/oktaId';
import type { OktaGroupRule } from '../../shared/types';
import type { OktaAppGroupAssignment, OktaAppListItem } from '../../shared/schemas/okta';
import type { RawOktaGroup } from '../components/groups/groupSummary';

export type IndexedKind = Extract<OktaIdKind, 'group' | 'rule' | 'app'>;

export interface IndexedEntity {
  kind: IndexedKind;
  id: string;
  name: string;
  secondary?: string;
}

export type LocalLookup =
  { status: 'hit'; entity: IndexedEntity } | { status: 'miss' } | { status: 'unknown' };

export interface OrgEntityIndex {
  lookup: (kind: OktaIdKind, id: string) => LocalLookup;
  isAuthoritative: (kind: IndexedKind) => boolean;
  groups: UseOrgSnapshotResult<RawOktaGroup>;
  rules: UseOrgSnapshotResult<OktaGroupRule>;
  apps: UseOrgSnapshotResult<OktaAppListItem>;
  appGroups: UseOrgSnapshotResult<OktaAppGroupAssignment>;
}

export interface UseOrgEntityIndexOptions {
  oktaOrigin: string | null | undefined;
  targetTabId: number | null;
  enabled?: boolean;
}

function groupName(group: RawOktaGroup): string {
  return group.profile?.name || group.id;
}

function appName(app: OktaAppListItem): string {
  return app.label || app.name || app.id;
}

export function useOrgEntityIndex({
  oktaOrigin,
  targetTabId,
  enabled = true,
}: UseOrgEntityIndexOptions): OrgEntityIndex {
  const groups = useOrgSnapshot<RawOktaGroup>('groups', oktaOrigin, targetTabId, { enabled });
  const rules = useOrgSnapshot<OktaGroupRule>('rules', oktaOrigin, targetTabId, { enabled });
  const apps = useOrgSnapshot<OktaAppListItem>('apps', oktaOrigin, targetTabId, { enabled });
  const appGroups = useOrgSnapshot<OktaAppGroupAssignment>('appGroups', oktaOrigin, targetTabId, {
    enabled,
  });

  const groupsById = useMemo(() => {
    const byId = new Map<string, IndexedEntity>();
    for (const group of groups.rows) {
      if (group.id) byId.set(group.id, { kind: 'group', id: group.id, name: groupName(group) });
    }
    return byId;
  }, [groups.rows]);

  const rulesById = useMemo(() => {
    const byId = new Map<string, IndexedEntity>();
    for (const rule of rules.rows) {
      if (!rule.id) continue;
      byId.set(rule.id, {
        kind: 'rule',
        id: rule.id,
        name: rule.name || rule.id,
        secondary: rule.status === 'INACTIVE' ? 'Paused' : 'Active',
      });
    }
    return byId;
  }, [rules.rows]);

  const appsById = useMemo(() => {
    const byId = new Map<string, IndexedEntity>();
    for (const app of apps.rows) {
      if (app.id) byId.set(app.id, { kind: 'app', id: app.id, name: appName(app) });
    }
    return byId;
  }, [apps.rows]);

  const isAuthoritative = useCallback(
    (kind: IndexedKind): boolean => {
      switch (kind) {
        case 'group':
          return groups.complete;
        case 'rule':
          return rules.complete;
        case 'app':
          return apps.complete;
      }
    },
    [groups.complete, rules.complete, apps.complete],
  );

  const lookup = useCallback(
    (kind: OktaIdKind, id: string): LocalLookup => {
      if (kind === 'user') return { status: 'unknown' };

      const byId = kind === 'group' ? groupsById : kind === 'rule' ? rulesById : appsById;
      const entity = byId.get(id.trim());
      if (entity) return { status: 'hit', entity };
      return isAuthoritative(kind) ? { status: 'miss' } : { status: 'unknown' };
    },
    [groupsById, rulesById, appsById, isAuthoritative],
  );

  return { lookup, isAuthoritative, groups, rules, apps, appGroups };
}
