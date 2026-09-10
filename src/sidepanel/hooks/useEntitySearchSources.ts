import { useMemo } from 'react';
import { useEntityNavigation } from '../contexts/NavigationContext';
import { navigationTarget } from '../components/home/jumpDestinations';
import { getOrFetch } from '../cache/entityCache';
import { AUTH_POLICY_TYPE, POLICIES_CACHE_KEY } from './usePoliciesData';
import { filterPolicies } from '../components/policies/policyFilters';
import type { JumpKind, JumpResult } from './useJumpResolver';
import { ruleSearchSecondary, type OrgEntityIndex } from './useOrgEntityIndex';
import type { GroupRuleStatus } from '../../shared/types';
import type { OktaIdKind } from '../../shared/utils/oktaId';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';
import type { OktaPolicyType } from './useOktaApi/policyOperations';

export interface EntitySearchApi {
  searchGroups: (
    query: string,
  ) => Promise<Array<{ id: string; name: string; description?: string }>>;
  searchUsers: (query: string) => Promise<
    Array<{
      id: string;
      firstName?: string;
      lastName?: string;
      login: string;
      email?: string;
    }>
  >;
  searchApps: (query: string) => Promise<Array<{ id: string; label: string; name?: string }>>;
  listPolicies: (type?: OktaPolicyType) => Promise<OktaPolicyListItem[]>;
  getGroupById: (id: string) => Promise<{ id: string; name: string; description?: string } | null>;
  getUserById: (id: string) => Promise<{
    id: string;
    firstName?: string;
    lastName?: string;
    login: string;
    email?: string;
  } | null>;
  getAppById: (
    id: string,
  ) => Promise<
    | { kind: 'found'; app: { id: string; label?: string; name?: string } }
    | { kind: 'missing' }
    | { kind: 'session-expired' }
    | { kind: 'failed'; status: number }
  >;
  getRawGroupRule: (
    id: string,
  ) => Promise<{ id: string; name?: string; status: GroupRuleStatus } | null>;
}

export interface UseEntitySearchSourcesOptions {
  api: EntitySearchApi;
  index: OrgEntityIndex;
  kinds: ReadonlyArray<JumpKind>;
}

export interface EntitySearchSources {
  searchers: Partial<Record<JumpKind, (query: string) => Promise<JumpResult[]>>>;
  fetchers: Partial<Record<OktaIdKind, (id: string) => Promise<JumpResult | null>>>;
}

const POLICY_RESULT_LIMIT = 20;

function userName(user: { firstName?: string; lastName?: string; login: string }): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.login;
}

export function useEntitySearchSources({
  api,
  index,
  kinds,
}: UseEntitySearchSourcesOptions): EntitySearchSources {
  const nav = useEntityNavigation();
  const { searchGroups, searchUsers, searchApps, listPolicies } = api;
  const { getGroupById, getUserById, getAppById, getRawGroupRule } = api;
  const { searchByName, isAuthoritative } = index;

  const searchers = useMemo(() => {
    const built: Partial<Record<JumpKind, (query: string) => Promise<JumpResult[]>>> = {};

    const wants = (kind: JumpKind) =>
      kinds.includes(kind) && nav.canNavigateTo(navigationTarget(kind));

    if (wants('group')) {
      built.group = async (query) =>
        (await searchGroups(query)).map((group) => ({
          kind: 'group' as const,
          id: group.id,
          name: group.name,
          secondary: group.description || undefined,
        }));
    }

    if (wants('user')) {
      built.user = async (query) =>
        (await searchUsers(query)).map((user) => ({
          kind: 'user' as const,
          id: user.id,
          name: userName(user),
          secondary: user.email || user.login,
        }));
    }

    if (wants('rule')) {
      built.rule = async (query) => searchByName('rule', query);
    }

    if (wants('app')) {
      built.app = async (query) => {
        const local = searchByName('app', query);
        if (isAuthoritative('app')) return local;
        const seen = new Set(local.map((row) => row.id));
        const live = (await searchApps(query))
          .filter((app) => !seen.has(app.id))
          .map((app) => ({ kind: 'app' as const, id: app.id, name: app.label, appName: app.name }));
        return [...local, ...live];
      };
    }

    if (wants('policy')) {
      built.policy = async (query) => {
        const policies = await getOrFetch<OktaPolicyListItem[]>(POLICIES_CACHE_KEY, () =>
          listPolicies(AUTH_POLICY_TYPE),
        );
        return filterPolicies(policies, query)
          .slice(0, POLICY_RESULT_LIMIT)
          .map((policy) => ({
            kind: 'policy' as const,
            id: policy.id,
            name: policy.name || policy.id,
            secondary: policy.description || undefined,
          }));
      };
    }

    return built;
  }, [
    kinds,
    nav,
    searchGroups,
    searchUsers,
    searchApps,
    listPolicies,
    searchByName,
    isAuthoritative,
  ]);

  const fetchers: Partial<Record<OktaIdKind, (id: string) => Promise<JumpResult | null>>> = {
    group: async (id) => {
      const group = await getGroupById(id);
      return group
        ? {
            kind: 'group',
            id: group.id,
            name: group.name,
            secondary: group.description || undefined,
          }
        : null;
    },
    user: async (id) => {
      const user = await getUserById(id);
      return user
        ? { kind: 'user', id: user.id, name: userName(user), secondary: user.email || user.login }
        : null;
    },
    app: async (id) => {
      const lookup = await getAppById(id);
      switch (lookup.kind) {
        case 'found':
          return {
            kind: 'app',
            id: lookup.app.id,
            name: lookup.app.label || lookup.app.name || lookup.app.id,
            appName: lookup.app.name,
          };
        case 'missing':
          return null;
        case 'session-expired':
          throw new Error('Your Okta session has expired. Sign in again on the Okta tab.');
        case 'failed':
          throw new Error('Could not look that app up. Try again.');
      }
    },
    rule: async (id) => {
      const rule = await getRawGroupRule(id);
      return rule
        ? {
            kind: 'rule',
            id: rule.id,
            name: rule.name || rule.id,
            secondary: ruleSearchSecondary(rule.status),
          }
        : null;
    },
  };

  return { searchers, fetchers };
}
