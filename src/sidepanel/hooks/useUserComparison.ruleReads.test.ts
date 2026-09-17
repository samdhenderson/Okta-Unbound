import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormattedRule, GroupMembership, OktaUser } from '../../shared/types';

const comparedSide: {
  memberships: GroupMembership[] | undefined;
  rules: { status: string; rules?: FormattedRule[] };
} = { memberships: undefined, rules: { status: 'unresolved' } };

vi.mock('./useUserSearch', () => ({
  useUserSearch: () => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    clearSearch: vi.fn(),
  }),
}));

vi.mock('./useUserMemberships', () => ({
  useUserMemberships: () => ({
    memberships: comparedSide.memberships,
    isLoading: false,
    error: null,
    rules: comparedSide.rules,
    loadMemberships: vi.fn(),
    clearMemberships: vi.fn(),
  }),
}));

vi.mock('./useComparisonApps', () => ({
  useComparisonApps: () => ({
    contextApps: [],
    comparedApps: [],
    isLoadingApps: false,
    appsLoaded: false,
    appsIncomplete: true,
    resetApps: vi.fn(),
  }),
}));

vi.mock('./useGroupCopy', () => ({
  useGroupCopy: () => ({
    addedToContextIds: new Set<string>(),
    addedToComparedIds: new Set<string>(),
    addingGroupId: null,
    addError: null,
    setAddError: vi.fn(),
    addToContext: vi.fn(),
    addToCompared: vi.fn(),
    resetCopyState: vi.fn(),
    resetForChangeUser: vi.fn(),
  }),
}));

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => ({ getUserProfileSchema: vi.fn(async () => null) }),
}));

vi.mock('./useProfileDisplayConfig', () => ({
  useProfileDisplayConfig: () => ({
    config: {
      layout: 'rows',
      showApiNames: false,
      showRuleChips: true,
      showEmpty: false,
      categories: [],
      assign: {},
      attrOrder: [],
      hidden: {},
    },
    update: vi.fn(),
  }),
}));

vi.mock('../cache/useEntityQuery', () => ({
  useEntityQuery: () => ({ data: null, isLoading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('./useGroupNameResolver', () => ({
  useGroupNameResolver: () => ({ resolveGroupName: () => undefined, request: vi.fn() }),
}));

vi.mock('./useComparisonProfileEdit', () => ({
  useComparisonProfileEdit: () => ({ context: null, compared: null, pending: null }),
}));

import { useUserComparison } from './useUserComparison';

const contextUser: OktaUser = {
  id: '00uFAKE0001',
  status: 'ACTIVE',
  profile: {
    login: 'alice@example.com',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Baseline',
    department: 'Engineering',
  },
};

const comparedUser: OktaUser = {
  id: '00uFAKE0002',
  status: 'ACTIVE',
  profile: {
    login: 'bob@example.com',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Compared',
    department: 'Engineering',
  },
};

const membership = (): GroupMembership => ({
  group: { id: '00gFAKE0001', profile: { name: 'VPN Access' }, type: 'OKTA_GROUP' },
  membershipType: 'RULE_BASED',
  rules: [],
  attribution: 'exact',
});

const departmentRule: FormattedRule = {
  id: '0prFAKE0001',
  name: 'Engineering → VPN Access',
  status: 'ACTIVE',
  condition: 'department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00gFAKE0001'],
  userAttributes: ['department'],
  created: '2026-01-01T00:00:00.000Z',
  lastUpdated: '2026-01-01T00:00:00.000Z',
};

const options = (contextGroups: GroupMembership[] | undefined) => ({
  isActive: true,
  contextUser,
  contextGroups,
  targetTabId: 1,
  oktaOrigin: 'https://example.okta.com',
  onGroupsChanged: vi.fn(),
});

beforeEach(() => {
  comparedSide.memberships = undefined;
  comparedSide.rules = { status: 'unresolved' };
});

describe('attributeRuleReads separates "no rule reads it" from "no rule was read"', () => {
  it('is not computed while the org rule inventory is unresolved', () => {
    const { result } = renderHook(() => useUserComparison(options([membership()])));

    expect(result.current.attributeRuleReads).toBeUndefined();
  });

  it('is not computed when the rule inventory could not be obtained', () => {
    comparedSide.rules = { status: 'unavailable' };
    const { result } = renderHook(() => useUserComparison(options([membership()])));

    expect(result.current.attributeRuleReads).toBeUndefined();
  });

  it("is not computed while the baseline user's group list is unread", () => {
    comparedSide.rules = { status: 'available', rules: [departmentRule] };
    const { result } = renderHook(() => useUserComparison(options(undefined)));

    expect(result.current.attributeRuleReads).toBeUndefined();
  });

  it('answers from the rules once they resolve', () => {
    comparedSide.rules = { status: 'available', rules: [departmentRule] };
    const { result } = renderHook(() => useUserComparison(options([membership()])));

    expect(result.current.attributeRuleReads).toEqual({
      department: ['Engineering → VPN Access'],
    });
  });

  it("is not computed when the compared user's group list is unread", () => {
    comparedSide.rules = { status: 'available', rules: [departmentRule] };
    comparedSide.memberships = undefined;
    const { result } = renderHook(() => useUserComparison(options([membership()])));

    act(() => result.current.selectUser(comparedUser));

    expect(result.current.attributeRuleReads).toBeUndefined();
  });
});
