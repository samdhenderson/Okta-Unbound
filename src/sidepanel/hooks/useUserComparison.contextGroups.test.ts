import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { GroupMembership, OktaUser } from '../../shared/types';

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
    memberships: undefined,
    isLoading: false,
    error: null,
    rules: { status: 'unresolved' },
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
  useProfileDisplayConfig: () => ({ config: { hidden: [], order: [] }, update: vi.fn() }),
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
  },
};

const options = (contextGroups: GroupMembership[] | undefined) => ({
  isActive: true,
  contextUser,
  contextGroups,
  targetTabId: 1,
  oktaOrigin: 'https://example.okta.com',
  onGroupsChanged: vi.fn(),
});

describe("the baseline user's groups are evidence, not a default", () => {
  it('blocks the comparison when they were never read', () => {
    const { result } = renderHook(() => useUserComparison(options(undefined)));

    expect(result.current.loadError).toBe(
      'Alice Baseline’s groups could not be read, so there is nothing to compare against.',
    );
  });

  it('runs on a list that was read and came back empty', () => {
    const { result } = renderHook(() => useUserComparison(options([])));

    expect(result.current.loadError).toBeNull();
  });
});
