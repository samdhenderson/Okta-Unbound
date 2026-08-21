import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRuleImpact } from './useRuleImpact';
import type { RuleImpactInput } from './useOktaApi/ruleImpact';
import type { RuleImpactSummary } from '../../shared/membership/ruleImpact';

const RULE_A: RuleImpactInput = {
  id: '0prFAKERULE001',
  name: 'Engineering auto-assign',
  groupIds: ['00gFAKEGROUP01'],
  groupNames: ['Engineering'],
};

const RULE_B: RuleImpactInput = {
  id: '0prFAKERULE002',
  name: 'Contractors auto-assign',
  groupIds: ['00gFAKEGROUP02', '00gFAKEGROUP03'],
  groupNames: ['Contractors', 'Vendors'],
};

function summaryFor(rule: RuleImpactInput, losing: number): RuleImpactSummary {
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    targetGroups: rule.groupIds.map((groupId, i) => ({
      groupId,
      groupName: rule.groupNames?.[i] ?? groupId,
      memberCount: 10,
      losingCount: losing,
      losing: [],
    })),
    distinctMemberCount: 10,
    totalLosing: losing,
  };
}

interface Capture {
  rule: RuleImpactInput;
  onProgress?: (current: number, total: number, message: string) => void;
  resolve: (summary: RuleImpactSummary) => void;
  reject: (err: unknown) => void;
}

function setup() {
  const captures: Capture[] = [];
  const captureRuleImpact = vi.fn(
    (
      rule: RuleImpactInput,
      opts?: { onProgress?: (current: number, total: number, message: string) => void },
    ) =>
      new Promise<RuleImpactSummary>((resolve, reject) => {
        captures.push({ rule, onProgress: opts?.onProgress, resolve, reject });
      }),
  );
  const { result } = renderHook(() => useRuleImpact(captureRuleImpact));
  return { result, captures, captureRuleImpact };
}

async function flush(fn: () => void) {
  await act(async () => {
    fn();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useRuleImpact happy path', () => {
  it('starts idle with no rule under examination', () => {
    const { result } = setup();

    expect(result.current.rule).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });

  it('opens into a loading state with a seeded progress total, then publishes the summary', async () => {
    const { result, captures, captureRuleImpact } = setup();

    act(() => result.current.open(RULE_B, 'deactivate'));

    expect(captureRuleImpact).toHaveBeenCalledTimes(1);
    expect(result.current.rule).toEqual(RULE_B);
    expect(result.current.mode).toBe('deactivate');
    expect(result.current.status).toBe('loading');
    expect(result.current.progress).toEqual({
      current: 0,
      total: 2,
      message: 'Starting analysis…',
    });

    await flush(() => captures[0].resolve(summaryFor(RULE_B, 4)));

    expect(result.current.status).toBe('done');
    expect(result.current.summary?.ruleId).toBe(RULE_B.id);
    expect(result.current.summary?.totalLosing).toBe(4);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });

  it('forwards progress from the live capture', () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_B, 'preview'));
    act(() => captures[0].onProgress?.(1, 2, 'Loading members for Contractors…'));

    expect(result.current.progress).toEqual({
      current: 1,
      total: 2,
      message: 'Loading members for Contractors…',
    });
  });

  it('close() resets every field after a completed capture', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    await flush(() => captures[0].resolve(summaryFor(RULE_A, 3)));
    expect(result.current.status).toBe('done');

    act(() => result.current.close());

    expect(result.current.rule).toBeNull();
    expect(result.current.status).toBe('idle');
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });
});

describe('useRuleImpact error path', () => {
  it("surfaces a thrown Error's message and clears progress", async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'deactivate'));
    await flush(() => captures[0].reject(new Error('Failed to fetch group rules')));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Failed to fetch group rules');
    expect(result.current.summary).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(result.current.rule).toEqual(RULE_A);
    expect(console.error).toHaveBeenCalled();
  });

  it('falls back to a generic message when a non-Error value is thrown', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    await flush(() => captures[0].reject('cancelled'));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Failed to analyze rule impact');
  });

  it('clears a previous error when reopened for another rule', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    await flush(() => captures[0].reject(new Error('boom')));
    expect(result.current.status).toBe('error');

    act(() => result.current.open(RULE_B, 'preview'));

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
  });
});

describe('useRuleImpact stale-capture guards (reopened for another rule)', () => {
  it('ignores a superseded capture that resolves after a reopen (.then guard)', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    act(() => result.current.open(RULE_B, 'deactivate'));
    expect(captures).toHaveLength(2);

    await flush(() => captures[0].resolve(summaryFor(RULE_A, 99)));

    expect(result.current.status).toBe('loading');
    expect(result.current.summary).toBeNull();
    expect(result.current.rule).toEqual(RULE_B);
    expect(result.current.progress).toEqual({
      current: 0,
      total: 2,
      message: 'Starting analysis…',
    });

    await flush(() => captures[1].resolve(summaryFor(RULE_B, 4)));

    expect(result.current.status).toBe('done');
    expect(result.current.summary?.ruleId).toBe(RULE_B.id);
    expect(result.current.summary?.totalLosing).toBe(4);
  });

  it('ignores a superseded capture that rejects after a reopen (.catch guard)', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    act(() => result.current.open(RULE_B, 'preview'));

    await flush(() => captures[0].reject(new Error('Rule A capture failed')));

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
    expect(result.current.rule).toEqual(RULE_B);
    expect(result.current.progress).not.toBeNull();

    await flush(() => captures[1].reject(new Error('Rule B capture failed')));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Rule B capture failed');
  });

  it('ignores progress from a superseded capture after a reopen (onProgress guard)', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    act(() => result.current.open(RULE_B, 'preview'));

    act(() => captures[0].onProgress?.(1, 1, 'Loading members for Engineering…'));

    expect(result.current.progress).toEqual({
      current: 0,
      total: 2,
      message: 'Starting analysis…',
    });

    act(() => captures[1].onProgress?.(2, 2, 'Loading members for Vendors…'));

    expect(result.current.progress).toEqual({
      current: 2,
      total: 2,
      message: 'Loading members for Vendors…',
    });
  });

  it('ignores a capture that resolves after close()', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    act(() => result.current.close());

    await flush(() => captures[0].resolve(summaryFor(RULE_A, 7)));

    expect(result.current.status).toBe('idle');
    expect(result.current.summary).toBeNull();
    expect(result.current.rule).toBeNull();
    expect(result.current.progress).toBeNull();
  });

  it('ignores a capture that rejects after close()', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'deactivate'));
    act(() => result.current.close());

    await flush(() => captures[0].reject(new Error('Rule A capture failed')));

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('ignores progress from a capture that is still running after close()', async () => {
    const { result, captures } = setup();

    act(() => result.current.open(RULE_A, 'preview'));
    act(() => result.current.close());

    act(() => captures[0].onProgress?.(1, 1, 'Loading members for Engineering…'));

    expect(result.current.progress).toBeNull();
  });
});
