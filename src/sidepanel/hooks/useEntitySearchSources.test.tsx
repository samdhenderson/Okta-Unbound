import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEntitySearchSources, type EntitySearchApi } from './useEntitySearchSources';
import { NavigationProvider, type EntityType } from '../contexts/NavigationContext';
import { resetEntityCache } from '../cache/entityCache';
import type { OrgEntityIndex, IndexedEntity, IndexedKind } from './useOrgEntityIndex';
import type { JumpKind } from './useJumpResolver';
import type { OktaPolicyListItem } from '../../shared/schemas/okta';

const ALL_KINDS = ['group', 'app', 'rule', 'policy', 'user'] as const;

const api = {
  searchGroups: vi.fn(async () => [{ id: '00gFAKE1', name: 'Engineering' }]),
  searchUsers: vi.fn(async () => [{ id: '00uFAKE1', login: 'ada@example.com' }]),
  searchApps: vi.fn(async () => [{ id: '0oaFAKE9', label: 'Live Only App' }]),
  listPolicies: vi.fn(
    async () =>
      [
        { id: 'rstFAKE1', name: 'Any two factors' },
        { id: 'rstFAKE2', name: 'Default Policy' },
      ] as OktaPolicyListItem[],
  ),
  getGroupById: vi.fn(async () => null),
  getUserById: vi.fn(async () => null),
  getAppById: vi.fn(async () => ({ kind: 'missing' as const })),
  getRawGroupRule: vi.fn(async () => null),
} satisfies EntitySearchApi;

const SNAPSHOT_ROWS: Record<IndexedKind, IndexedEntity[]> = {
  rule: [{ kind: 'rule', id: '0prFAKE1', name: 'Feeds Engineering', secondary: 'Active' }],
  app: [{ kind: 'app', id: '0oaFAKE1', name: 'Salesforce' }],
  group: [],
};

function makeIndex(complete: Partial<Record<IndexedKind, boolean>> = {}): OrgEntityIndex {
  return {
    lookup: () => ({ status: 'unknown' }),
    searchByName: (kind, query) =>
      SNAPSHOT_ROWS[kind].filter((row) =>
        row.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    isAuthoritative: (kind) => complete[kind] ?? true,
    groups: {} as OrgEntityIndex['groups'],
    rules: {} as OrgEntityIndex['rules'],
    apps: {} as OrgEntityIndex['apps'],
    appGroups: {} as OrgEntityIndex['appGroups'],
  };
}

function renderSources(options: {
  kinds?: ReadonlyArray<JumpKind>;
  reachable?: ReadonlyArray<EntityType>;
  index?: OrgEntityIndex;
}) {
  const { kinds = ALL_KINDS, reachable = ['group', 'app', 'rule', 'policy', 'user'] } = options;
  const index = options.index ?? makeIndex();
  const handlers = Object.fromEntries(reachable.map((type) => [type, vi.fn()]));
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationProvider handlers={handlers}>{children}</NavigationProvider>
  );
  return renderHook(() => useEntitySearchSources({ api, index, kinds }), { wrapper });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
});

describe('useEntitySearchSources', () => {
  describe('stability', () => {
    it('keeps `searchers` referentially identical across re-renders', () => {
      const { result, rerender } = renderSources({});
      const first = result.current.searchers;

      rerender();
      rerender();

      expect(result.current.searchers).toBe(first);
    });
  });

  describe('the allow-list', () => {
    it('builds only the kinds the surface asked for', () => {
      const { result } = renderSources({ kinds: ['group', 'user'] });

      expect(Object.keys(result.current.searchers).sort()).toEqual(['group', 'user']);
    });

    it('drops a kind this build cannot open, even when the surface asked for it', () => {
      const { result } = renderSources({ kinds: ALL_KINDS, reachable: ['group', 'user'] });

      expect(Object.keys(result.current.searchers).sort()).toEqual(['group', 'user']);
    });
  });

  describe('what a search costs', () => {
    it('answers a rule search from the snapshot, with zero requests', async () => {
      const { result } = renderSources({});

      const rows = await result.current.searchers.rule!('feeds');

      expect(rows).toEqual([
        { kind: 'rule', id: '0prFAKE1', name: 'Feeds Engineering', secondary: 'Active' },
      ]);
      expect(api.searchGroups).not.toHaveBeenCalled();
      expect(api.searchApps).not.toHaveBeenCalled();
    });

    it('answers an app search from a complete snapshot without asking Okta', async () => {
      const { result } = renderSources({ index: makeIndex({ app: true }) });

      const rows = await result.current.searchers.app!('sales');

      expect(rows.map((row) => row.name)).toEqual(['Salesforce']);
      expect(api.searchApps).not.toHaveBeenCalled();
    });

    it('tops an app search up from Okta when the snapshot walk has not finished', async () => {
      const { result } = renderSources({ index: makeIndex({ app: false }) });

      const rows = await result.current.searchers.app!('a');

      expect(api.searchApps).toHaveBeenCalledWith('a');
      expect(rows.map((row) => row.id)).toEqual(['0oaFAKE1', '0oaFAKE9']);
    });

    it('walks the policy list once, however many searches run', async () => {
      const { result } = renderSources({});

      const first = await result.current.searchers.policy!('two');
      const second = await result.current.searchers.policy!('default');

      expect(api.listPolicies).toHaveBeenCalledTimes(1);
      expect(first.map((row) => row.name)).toEqual(['Any two factors']);
      expect(second.map((row) => row.name)).toEqual(['Default Policy']);
    });
  });

  describe('fetchers', () => {
    it('separates "no such app" from "the lookup did not complete" (D-007a)', async () => {
      const { result } = renderSources({});

      await expect(result.current.fetchers.app!('0oaFAKE1')).resolves.toBeNull();

      api.getAppById.mockResolvedValueOnce({ kind: 'failed', status: 429 } as never);
      await expect(result.current.fetchers.app!('0oaFAKE1')).rejects.toThrow();

      api.getAppById.mockResolvedValueOnce({ kind: 'session-expired' } as never);
      await expect(result.current.fetchers.app!('0oaFAKE1')).rejects.toThrow(/session has expired/);
    });
    it('reports an INVALID rule as broken, not as active (D-085)', async () => {
      const { result } = renderSources({});

      api.getRawGroupRule.mockResolvedValueOnce({
        id: '0prFAKE7',
        name: 'Feeds Contractors',
        status: 'INVALID',
      } as never);

      await expect(result.current.fetchers.rule!('0prFAKE7')).resolves.toMatchObject({
        kind: 'rule',
        secondary: 'Broken',
      });
    });
  });

  describe('mapping', () => {
    it('falls back to a login when a user has no name', async () => {
      const { result } = renderSources({});

      await waitFor(async () => {
        const rows = await result.current.searchers.user!('ada');
        expect(rows[0]).toMatchObject({ name: 'ada@example.com', secondary: 'ada@example.com' });
      });
    });
  });
});
