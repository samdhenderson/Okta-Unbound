import { describe, it, expect, vi } from 'vitest';
import verbs, { addUsersToGroups, removeUsersFromGroups } from './membership';
import type { VerbContext } from '../types';
import type { OktaUser } from '../../../../shared/types';
import type { SelectionBasket, SelectionRef } from '../../selectionStore';

const measureAdd = addUsersToGroups.preflight;
const measureRemove = removeUsersFromGroups.preflight;
if (!measureAdd) throw new Error('addUsersToGroups must declare a preflight');
if (!measureRemove) throw new Error('removeUsersFromGroups must declare a preflight');

function basketOf(userIds: string[], groupIds: string[]): SelectionBasket {
  const picked: SelectionRef[] = [];
  userIds.forEach((id, index) =>
    picked.push({ kind: 'user', id, name: `User ${index}`, pickedAt: 1_700_000_000_000 + index }),
  );
  groupIds.forEach((id, index) =>
    picked.push({ kind: 'group', id, name: `Group ${index}`, pickedAt: 1_700_000_001_000 + index }),
  );
  return { picked };
}

function member(id: string, embed?: { id: string; name: string }[] | 'absent'): OktaUser {
  const row = {
    id,
    status: 'ACTIVE',
    profile: {
      login: `${id}@example.com`,
      email: `${id}@example.com`,
      firstName: 'Ash',
      lastName: id.toUpperCase(),
    },
  } as unknown as Record<string, unknown>;
  if (embed !== 'absent') row._embedded = { 'group-rules': embed ?? [] };
  return row as unknown as OktaUser;
}

function fakeRunOperation() {
  return vi.fn(async (_name: string, items: unknown[], task: never) => {
    const run = task as unknown as (item: unknown, index: number, planId?: string) => Promise<void>;
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
  });
}

function contextOf(
  basket: SelectionBasket,
  overrides: Partial<Record<string, unknown>> = {},
): VerbContext {
  const api = {
    runOperation: fakeRunOperation(),
    getAllGroupMembers: vi.fn(async () => [] as OktaUser[]),
    batchGetUserDetails: vi.fn(async () => new Map<string, OktaUser>()),
    addUserToGroup: vi.fn(async () => ({ success: true })),
    removeUserFromGroup: vi.fn(async () => ({ success: true })),
    ...overrides,
  } as unknown as VerbContext['api'];

  const counts: VerbContext['counts'] = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;

  return {
    basket,
    counts,
    addMany: vi.fn(),
    report: vi.fn(),
    api,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values: {},
  };
}

function resolving(ids: string[]) {
  return {
    batchGetUserDetails: vi.fn(async () => new Map(ids.map((id) => [id, member(id)]))),
  };
}

function holding(membersByGroup: Record<string, OktaUser[]>) {
  return {
    getAllGroupMembers: vi.fn(async (groupId: string) => membersByGroup[groupId] ?? []),
  };
}

describe('the module', () => {
  it('exports both combination verbs, each needing a user and a group', () => {
    expect(verbs).toEqual([addUsersToGroups, removeUsersFromGroups]);
    for (const verb of verbs) {
      expect(verb.path).toBe('write');
      expect([...verb.needs].sort()).toEqual(['group', 'user']);
    }
  });
});

describe('add-users-to-groups', () => {
  it('prices the preflight — one user read each, and no writes yet', () => {
    expect(addUsersToGroups.cost(basketOf(['00u1', '00u2'], ['00g1']))).toEqual({
      requests: 2,
      writes: 0,
    });
  });

  it('quotes users × groups, having resolved the users first', async () => {
    const basket = basketOf(['00u1', '00u2', '00u3'], ['00g1', '00g2']);
    const preflight = await measureAdd(contextOf(basket, resolving(['00u1', '00u2', '00u3'])));

    expect(preflight.items).toBe(6);
    expect(preflight.cost).toEqual({ requests: 6, writes: 6 });
    expect(preflight.lines[0]).toBe('3 users × 2 groups — 6 memberships to write');
    expect(preflight.refusal).toBeUndefined();
  });

  it('leaves out a ticked id the org no longer answers for, and says so', async () => {
    const basket = basketOf(['00u1', '00uGONE'], ['00g1', '00g2']);
    const preflight = await measureAdd(contextOf(basket, resolving(['00u1'])));

    expect(preflight.cost.writes).toBe(2);
    expect(preflight.lines).toContain(
      '1 ticked user no longer resolves to an Okta account, and is left out of this run',
    );
  });

  it('states a write count past the run cap rather than flinching from it', async () => {
    const userIds = Array.from({ length: 340 }, (_, index) => `00u${index}`);
    const basket = basketOf(userIds, ['00g1', '00g2', '00g3']);
    const preflight = await measureAdd(contextOf(basket, resolving(userIds)));

    expect(preflight.cost.writes).toBe(1020);
    expect(preflight.items).toBe(1020);
  });

  it('refuses as nothing-to-do when no ticked id resolves', async () => {
    const basket = basketOf(['00uGONE'], ['00g1']);
    const preflight = await measureAdd(contextOf(basket, resolving([])));

    expect(preflight.refusal?.code).toBe('nothing-to-do');
    expect(preflight.cost.writes).toBe(0);
  });

  it('never implies the addition can be undone', async () => {
    const basket = basketOf(['00u1'], ['00g1']);
    const preflight = await measureAdd(contextOf(basket, resolving(['00u1'])));

    expect(preflight.lines.at(-1)).toContain('cannot be undone here');
  });

  it('writes one membership per pair and reports each in the detail', async () => {
    const basket = basketOf(['00u1', '00u2'], ['00g1']);
    const context = contextOf(basket, resolving(['00u1', '00u2']));
    const preflight = await measureAdd(context);

    const outcome = await addUsersToGroups.run(context, preflight);

    expect(context.api.addUserToGroup).toHaveBeenCalledTimes(2);
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe('Added 2 memberships across 1 group.');
    const detail = outcome.detail;
    if (!detail) throw new Error('the add run must report its rows');
    expect(detail.rows).toHaveLength(2);
    for (const row of detail.rows) expect(row).toHaveLength(detail.headers.length);
  });
});

describe('remove-users-from-groups', () => {
  it('prices the preflight — one membership walk per ticked group', () => {
    expect(removeUsersFromGroups.cost(basketOf(['00u1'], ['00g1', '00g2']))).toEqual({
      requests: 0,
      walks: [{ count: 2, kind: 'membership' }],
      writes: 0,
    });
  });

  it('counts only the ticked users that are actually members', async () => {
    const basket = basketOf(['00u1', '00u2', '00u3'], ['00g1', '00g2']);
    const context = contextOf(
      basket,
      holding({
        '00g1': [member('00u1'), member('00u2'), member('00uOTHER')],
        '00g2': [member('00u3')],
      }),
    );

    const preflight = await measureRemove(context);

    expect(preflight.items).toBe(3);
    expect(preflight.cost).toEqual({ requests: 3, writes: 3 });
  });

  it('splits each group’s removals by the source Okta itself reported', async () => {
    const rule = [{ id: '0pr1', name: 'Contractors to Payments' }];
    const basket = basketOf(['00u1', '00u2', '00u3'], ['00g1']);
    const context = contextOf(
      basket,
      holding({
        '00g1': [member('00u1', rule), member('00u2', []), member('00u3', 'absent')],
      }),
    );

    const preflight = await measureRemove(context);

    expect(preflight.lines[0]).toBe(
      'Group 0 — 3 memberships to remove: 1 fed by a rule, 1 added manually, 1 with no source stated by Okta',
    );
    expect(preflight.lines).toContain(
      'Okta stated no source for 1 membership, so this run cannot name the exclusion lists those removals would touch.',
    );
  });

  it('counts the exclusions this run would add, one stated line per rule', async () => {
    const payroll = { id: '0prPay', name: 'Payroll feed' };
    const contractors = { id: '0prCon', name: 'Contractor feed' };
    const basket = basketOf(['00u1', '00u2', '00u3'], ['00g1', '00g2']);
    const context = contextOf(
      basket,
      holding({
        '00g1': [member('00u1', [payroll]), member('00u2', [payroll, contractors])],
        '00g2': [member('00u3', [contractors])],
      }),
    );

    const preflight = await measureRemove(context);

    expect(preflight.lines).toContain(
      'Rule “Payroll feed” — this run adds 2 people to its exclusion list',
    );
    expect(preflight.lines).toContain(
      'Rule “Contractor feed” — this run adds 2 people to its exclusion list',
    );
  });

  it('states the exclusion list is a one-way door whenever a removal is rule-fed', async () => {
    const basket = basketOf(['00u1'], ['00g1']);
    const context = contextOf(
      basket,
      holding({ '00g1': [member('00u1', [{ id: '0pr1', name: 'Payroll feed' }])] }),
    );

    const preflight = await measureRemove(context);

    expect(
      preflight.lines.some((line) =>
        line.includes('An exclusion list cannot be cleared from here'),
      ),
    ).toBe(true);
  });

  it('says nothing of the sort when every removal is manual', async () => {
    const basket = basketOf(['00u1', '00u2'], ['00g1']);
    const context = contextOf(
      basket,
      holding({ '00g1': [member('00u1', []), member('00u2', [])] }),
    );

    const preflight = await measureRemove(context);

    expect(preflight.lines.some((line) => line.includes('exclusion list'))).toBe(false);
    expect(preflight.lines[0]).toBe('Group 0 — 2 memberships to remove: 2 added manually');
  });

  it('states a write count past the run cap rather than flinching from it', async () => {
    const userIds = Array.from({ length: 1200 }, (_, index) => `00u${index}`);
    const basket = basketOf(userIds, ['00g1']);
    const context = contextOf(basket, holding({ '00g1': userIds.map((id) => member(id, [])) }));

    const preflight = await measureRemove(context);

    expect(preflight.cost.writes).toBe(1200);
    expect(preflight.refusal).toBeUndefined();
  });

  it('refuses as nothing-to-do when no ticked user is a member', async () => {
    const basket = basketOf(['00u1'], ['00g1']);
    const context = contextOf(basket, holding({ '00g1': [member('00uOTHER')] }));

    const preflight = await measureRemove(context);

    expect(preflight.refusal?.code).toBe('nothing-to-do');
    expect(preflight.lines).toEqual([]);
  });

  it('deletes exactly what it measured, and names the source of each in the detail', async () => {
    const basket = basketOf(['00u1', '00u2'], ['00g1']);
    const context = contextOf(
      basket,
      holding({
        '00g1': [member('00u1', [{ id: '0pr1', name: 'Payroll feed' }]), member('00u2', [])],
      }),
    );
    const preflight = await measureRemove(context);

    const outcome = await removeUsersFromGroups.run(context, preflight);

    expect(context.api.removeUserFromGroup).toHaveBeenCalledTimes(2);
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toContain('exclusion list');
    const detail = outcome.detail;
    if (!detail) throw new Error('the remove run must report its rows');
    for (const row of detail.rows) expect(row).toHaveLength(detail.headers.length);
    expect(detail.rows[0]).toContain('rule-fed');
    expect(detail.rows[0]).toContain('Payroll feed');
    expect(detail.rows[1]).toContain('manual');
  });

  it('refuses to run without the preflight that measured it', async () => {
    const context = contextOf(basketOf(['00u1'], ['00g1']));
    await expect(removeUsersFromGroups.run(context)).rejects.toThrow(
      'remove-users-from-groups was run without its preflight',
    );
  });
});
