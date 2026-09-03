import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useGroupRuleReferences } from './useGroupRuleReferences';
import type { FormattedRule } from '../../shared/types';

const ensureGroupRulesLoaded = vi.fn<() => Promise<FormattedRule[] | null>>();

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => ({ ensureGroupRulesLoaded }),
}));

const GROUP_ID = '00gFAKEGROUP1';
const TAB_ID = 1;

function referencingRule(id: string, name: string): FormattedRule {
  return {
    id,
    name,
    status: 'ACTIVE',
    condition: `isMemberOfAnyGroup("${GROUP_ID}")`,
    conditionExpression: `isMemberOfAnyGroup("${GROUP_ID}")`,
    groupIds: [],
    userAttributes: [],
    created: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z',
  };
}

beforeEach(() => {
  ensureGroupRulesLoaded.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('useGroupRuleReferences', () => {
  it('resolves the rules that consult the group by id', async () => {
    ensureGroupRulesLoaded.mockResolvedValue([referencingRule('0prFAKERULE1', 'Contractors')]);

    const { result } = renderHook(() => useGroupRuleReferences(GROUP_ID, TAB_ID));

    await waitFor(() => expect(result.current.status).toBe('done'));
    expect(result.current.rules.map((rule) => rule.id)).toEqual(['0prFAKERULE1']);
  });

  describe('reload', () => {
    it('re-runs the resolution and republishes the new answer', async () => {
      ensureGroupRulesLoaded.mockResolvedValue([referencingRule('0prFAKERULE1', 'Contractors')]);

      const { result } = renderHook(() => useGroupRuleReferences(GROUP_ID, TAB_ID));
      await waitFor(() => expect(result.current.status).toBe('done'));
      expect(ensureGroupRulesLoaded).toHaveBeenCalledTimes(1);

      ensureGroupRulesLoaded.mockResolvedValue([
        referencingRule('0prFAKERULE1', 'Contractors'),
        referencingRule('0prFAKERULE2', 'Interns'),
      ]);
      act(() => result.current.reload());

      await waitFor(() => expect(result.current.rules).toHaveLength(2));
      expect(ensureGroupRulesLoaded).toHaveBeenCalledTimes(2);
      expect(result.current.status).toBe('done');
    });

    it('returns to the loading status while the re-read is in flight', async () => {
      ensureGroupRulesLoaded.mockResolvedValue([]);
      const { result } = renderHook(() => useGroupRuleReferences(GROUP_ID, TAB_ID));
      await waitFor(() => expect(result.current.status).toBe('done'));

      let release: () => void = () => {};
      ensureGroupRulesLoaded.mockReturnValue(
        new Promise((resolve) => {
          release = () => resolve([]);
        }),
      );
      act(() => result.current.reload());

      expect(result.current.status).toBe('loading');
      await act(async () => release());
      await waitFor(() => expect(result.current.status).toBe('done'));
    });

    it('clears a previous error rather than leaving it beside a fresh result', async () => {
      ensureGroupRulesLoaded.mockRejectedValueOnce(new Error('Rate limited'));

      const { result } = renderHook(() => useGroupRuleReferences(GROUP_ID, TAB_ID));
      await waitFor(() => expect(result.current.status).toBe('error'));
      expect(result.current.error).toBe('Rate limited');

      ensureGroupRulesLoaded.mockResolvedValue([]);
      act(() => result.current.reload());

      await waitFor(() => expect(result.current.status).toBe('done'));
      expect(result.current.error).toBeNull();
    });
  });
});
