import { describe, it, expect, vi } from 'vitest';
import removeInactiveMembers from './cleanup';
import type { VerbContext } from '../types';
import type { SelectionBasket, SelectionRef } from '../../selectionStore';
import type { BulkOperation, BulkOperationResult } from '../../../../shared/types';

const measure = removeInactiveMembers.preflight;
if (!measure) throw new Error('removeInactiveMembers must declare a preflight');

function basketOf(names: string[]): SelectionBasket {
  const picked: SelectionRef[] = names.map((name, index) => ({
    kind: 'group',
    id: `00g${index}`,
    name,
    pickedAt: 1_700_000_000_000 + index,
  }));
  picked.push({ kind: 'user', id: '00uFAKE', name: 'Dana Example', pickedAt: 1_700_000_000_900 });
  return { picked };
}

const member = (status: string) => ({ id: `00u${status}`, status }) as never;

function contextOf(
  basket: SelectionBasket,
  membersByGroup: Record<string, ReturnType<typeof member>[]>,
  overrides: Partial<VerbContext['api']> = {},
): VerbContext {
  const api = {
    runOperation: vi.fn(async (_name: string, items: unknown[], task: never) => {
      const run = task as unknown as (
        item: unknown,
        index: number,
        planId?: string,
      ) => Promise<void>;
      for (const [index, item] of items.entries()) await run(item, index, 'plan-1');
      return {
        results: [],
        total: items.length,
        completed: items.length,
        failed: 0,
        skipped: 0,
        stoppedByError: false,
        cancelled: false,
      };
    }),
    getAllGroupMembers: vi.fn(async (groupId: string) => membersByGroup[groupId] ?? []),
    executeBulkOperation: vi.fn(async () => [] as BulkOperationResult[]),
    ...overrides,
  } as unknown as VerbContext['api'];

  return {
    basket,
    counts: { group: basket.picked.filter((ref) => ref.kind === 'group').length, user: 1 },
    addMany: vi.fn(),
    report: vi.fn(),
    api,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values: {},
  };
}

describe('cost', () => {
  it('prices the preflight — one membership walk per ticked group, and no writes', () => {
    const cost = removeInactiveMembers.cost(basketOf(['A', 'B', 'C']));
    expect(cost).toEqual({ requests: 0, walks: 3, writes: 0 });
  });

  it('counts only groups — a ticked user is not this verb’s object', () => {
    expect(removeInactiveMembers.cost(basketOf(['A'])).walks).toBe(1);
  });
});

describe('preflight', () => {
  it('quotes the run from what it counted, not from the basket', async () => {
    const context = contextOf(basketOf(['Payments', 'Contractors']), {
      '00g0': [member('ACTIVE'), member('DEPROVISIONED'), member('SUSPENDED')],
      '00g1': [member('ACTIVE'), member('LOCKED_OUT')],
    });

    const preflight = await measure(context);

    expect(preflight.items).toBe(3);
    expect(preflight.cost).toEqual({ requests: 5, walks: 2, writes: 3 });
  });

  it('states every group that contributes a removal, and omits the ones that do not', async () => {
    const context = contextOf(basketOf(['Payments', 'Clean']), {
      '00g0': [member('ACTIVE'), member('DEPROVISIONED')],
      '00g1': [member('ACTIVE'), member('ACTIVE')],
    });

    const preflight = await measure(context);

    expect(preflight.lines).toHaveLength(1);
    expect(preflight.lines[0]).toBe(
      'Payments — 1 of 2 members are deactivated, suspended or locked out',
    );
  });

  it('reports nothing to do rather than an empty run', async () => {
    const context = contextOf(basketOf(['Clean']), { '00g0': [member('ACTIVE')] });
    const preflight = await measure(context);

    expect(preflight.items).toBe(0);
    expect(preflight.cost.writes).toBe(0);
    expect(preflight.lines).toEqual([]);
  });

  it('keeps findings in basket order however the walks complete', async () => {
    const context = contextOf(basketOf(['First', 'Second']), {
      '00g0': [member('DEPROVISIONED')],
      '00g1': [member('SUSPENDED')],
    });
    const api = context.api as unknown as {
      runOperation: (name: string, items: unknown[], task: never) => Promise<unknown>;
    };
    const original = api.runOperation;
    api.runOperation = async (name, items, task) => original(name, [...items].reverse(), task);

    const preflight = await measure(context);
    expect(preflight.lines[0]).toContain('First');
    expect(preflight.lines[1]).toContain('Second');
  });
});

describe('run', () => {
  it('refuses to run without the preflight it declares', async () => {
    const context = contextOf(basketOf(['A']), {});
    await expect(removeInactiveMembers.run(context)).rejects.toThrow(/without its preflight/);
  });

  it('spends the bulk runner only on the groups that have something to remove', async () => {
    const executeBulkOperation = vi.fn(async (operation: BulkOperation) =>
      operation.targetGroups.map<BulkOperationResult>((groupId) => ({
        groupId,
        groupName: groupId,
        status: 'success',
        itemsProcessed: 2,
      })),
    );
    const context = contextOf(basketOf(['A', 'B']), {}, { executeBulkOperation });

    const outcome = await removeInactiveMembers.run(context, {
      cost: { requests: 0, writes: 2 },
      items: 2,
      lines: [],
      payload: {
        findings: [
          { id: '00g0', name: 'A', inactive: 2, total: 9 },
          { id: '00g1', name: 'B', inactive: 0, total: 4 },
        ],
      },
    });

    expect(executeBulkOperation.mock.calls[0]?.[0].targetGroups).toEqual(['00g0']);
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe('Removed 2 members from 1 group.');
  });

  it('reports a failed group as partly done, and says it kept every member', async () => {
    const executeBulkOperation = vi.fn(async () => [
      { groupId: '00g0', groupName: 'A', status: 'success' as const, itemsProcessed: 3 },
      {
        groupId: '00g1',
        groupName: 'B',
        status: 'failed' as const,
        itemsProcessed: 0,
        errors: ['403'],
      },
    ]);
    const context = contextOf(basketOf(['A', 'B']), {}, { executeBulkOperation });

    const outcome = await removeInactiveMembers.run(context, {
      cost: { requests: 0, writes: 4 },
      items: 4,
      lines: [],
      payload: {
        findings: [
          { id: '00g0', name: 'A', inactive: 3, total: 9 },
          { id: '00g1', name: 'B', inactive: 1, total: 4 },
        ],
      },
    });

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toBe('Removed 3 members; 1 group failed and kept every member.');
    expect(outcome.detail?.rows).toHaveLength(2);
    expect(outcome.detail?.headers).toHaveLength(outcome.detail?.rows[0]?.length ?? 0);
  });
});
