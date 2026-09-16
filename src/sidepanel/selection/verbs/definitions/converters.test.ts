import { describe, it, expect, vi, beforeEach } from 'vitest';
import converters, {
  groupMembersToUsers,
  rulesToConditionGroups,
  rulesToFedGroups,
  rulesToUpstreamRules,
} from './converters';
import type { VerbApi, VerbContext } from '../types';
import {
  SelectionStore,
  countsByKind,
  type AddOutcome,
  type SelectionBasket,
  type SelectionKind,
} from '../../selectionStore';
import type { BatchItemResult, BatchOutcome } from '@/shared/scheduler/runBatch';
import type { OktaGroupRule, OktaUser, FormattedRule } from '@/shared/types';

vi.mock('@/sidepanel/hooks/fetchGroupRulesRequest', () => ({
  loadCachedGroupIndex: vi.fn(),
}));
const { loadCachedGroupIndex } = await import('@/sidepanel/hooks/fetchGroupRulesRequest');
const mockedGroupIndex = vi.mocked(loadCachedGroupIndex);

function snapshotNames(nameById: Record<string, string>): void {
  mockedGroupIndex.mockResolvedValue({
    nameById: new Map(Object.entries(nameById)),
    idsHeld: new Set(Object.keys(nameById)),
    complete: true,
  });
}

const runOperation = vi.fn(
  async <T, R>(
    _name: string,
    items: T[],
    task: (item: T, index: number, planId?: string) => Promise<R>,
  ): Promise<BatchOutcome<T, R>> => {
    const results: BatchItemResult<T, R>[] = [];
    for (const [index, item] of items.entries()) {
      try {
        results.push({
          item,
          index,
          status: 'fulfilled',
          value: await task(item, index, 'plan-1'),
        });
      } catch (error) {
        results.push({ item, index, status: 'rejected', error });
      }
    }
    return {
      results,
      total: items.length,
      completed: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      skipped: 0,
      stoppedByError: false,
      cancelled: false,
    };
  },
);

function apiWith(members: Partial<VerbApi>): VerbApi {
  return { runOperation, ...members } as unknown as VerbApi;
}

function user(id: string, firstName: string, lastName: string): OktaUser {
  return {
    id,
    status: 'ACTIVE',
    profile: { login: `${id}@example.com`, email: `${id}@example.com`, firstName, lastName },
  };
}

function rawRule(
  id: string,
  options: { expression?: string; feeds?: string[] } = {},
): OktaGroupRule {
  return {
    id,
    name: `Rule ${id}`,
    status: 'ACTIVE',
    type: 'group_rule',
    created: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z',
    conditions: options.expression
      ? { expression: { value: options.expression, type: 'urn:okta:expression:1.0' } }
      : undefined,
    actions: options.feeds ? { assignUserToGroups: { groupIds: options.feeds } } : undefined,
  };
}

function formattedRule(id: string, groupIds: string[]): FormattedRule {
  return {
    id,
    name: `Rule ${id}`,
    status: 'ACTIVE',
    condition: '',
    groupIds,
    userAttributes: [],
    created: '2026-01-01T00:00:00.000Z',
    lastUpdated: '2026-01-01T00:00:00.000Z',
  };
}

function storeOf(entries: Array<[SelectionKind, string]>): SelectionStore {
  const store = new SelectionStore();
  store.addMany(entries.map(([kind, id]) => ({ kind, id, name: `${kind} ${id}` })));
  return store;
}

const report = vi.fn();

function contextFor(store: SelectionStore, api: VerbApi): VerbContext {
  const basket = store.getSnapshot();
  return {
    basket,
    counts: countsByKind(basket),
    addMany: (refs) => store.addMany(refs),
    report,
    api,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values: {},
  };
}

function idsOfKind(basket: SelectionBasket, kind: SelectionKind): string[] {
  return basket.picked.filter((ref) => ref.kind === kind).map((ref) => ref.id);
}

beforeEach(() => {
  vi.clearAllMocks();
  snapshotNames({});
});

describe('the converter set', () => {
  it('registers four additive converters, none of which writes to Okta', () => {
    expect(converters).toHaveLength(4);
    for (const verb of converters) {
      expect(verb.path).toBe('convert');
      expect(verb.cost({ picked: [] }).writes).toBe(0);
    }
  });
});

describe('group-members-to-users', () => {
  it('quotes one request and one membership walk per ticked group', () => {
    const basket = storeOf([
      ['group', 'g1'],
      ['group', 'g2'],
      ['user', 'u9'],
    ]).getSnapshot();
    expect(groupMembersToUsers.cost(basket)).toEqual({ requests: 2, walks: 2, writes: 0 });
  });

  it('ticks every member once, and leaves the groups it read exactly as they were', async () => {
    const store = storeOf([
      ['group', 'g1'],
      ['group', 'g2'],
    ]);
    const getAllGroupMembers = vi.fn(async (groupId: string) =>
      groupId === 'g1'
        ? [user('u1', 'Ada', 'Lovelace'), user('u2', 'Grace', 'Hopper')]
        : [user('u2', 'Grace', 'Hopper'), user('u3', 'Alan', 'Turing')],
    );

    const outcome = await groupMembersToUsers.run(
      contextFor(store, apiWith({ getAllGroupMembers })),
    );

    expect(getAllGroupMembers).toHaveBeenCalledTimes(2);
    expect(idsOfKind(store.getSnapshot(), 'user')).toEqual(['u1', 'u2', 'u3']);
    expect(store.getSnapshot().picked.find((ref) => ref.id === 'u1')?.name).toBe('Ada Lovelace');
    expect(idsOfKind(store.getSnapshot(), 'group')).toEqual(['g1', 'g2']);
    expect(outcome).toEqual({ status: 'done', summary: 'Added 3 users to the selection.' });
  });

  it('counts the groups it could not read and says so', async () => {
    const store = storeOf([
      ['group', 'g1'],
      ['group', 'g2'],
    ]);
    const getAllGroupMembers = vi.fn(async (groupId: string) => {
      if (groupId === 'g2') throw new Error('403');
      return [user('u1', 'Ada', 'Lovelace')];
    });

    const outcome = await groupMembersToUsers.run(
      contextFor(store, apiWith({ getAllGroupMembers })),
    );

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toBe('Added 1 user to the selection; 1 group could not be read.');
    expect(idsOfKind(store.getSnapshot(), 'user')).toEqual(['u1']);
  });

  it('states a refusal whole, never as a partial success', async () => {
    const store = storeOf([['group', 'g1']]);
    const refused: AddOutcome = {
      basket: store.getSnapshot(),
      added: 0,
      alreadyPicked: 0,
      refused: 2100,
    };
    const context = {
      ...contextFor(
        store,
        apiWith({
          getAllGroupMembers: vi.fn(async () => [user('u1', 'Ada', 'Lovelace')]),
        }),
      ),
      addMany: () => refused,
    };

    const outcome = await groupMembersToUsers.run(context);

    expect(outcome.status).toBe('refused');
    expect(outcome.summary).toBe('Added nothing: the selection cap refused all 2,100 users.');
    expect(outcome.summary).not.toMatch(/Added \d/);
  });

  it('reports having nothing to add rather than adding zero', async () => {
    const store = storeOf([['group', 'g1']]);
    const outcome = await groupMembersToUsers.run(
      contextFor(store, apiWith({ getAllGroupMembers: vi.fn(async () => []) })),
    );
    expect(outcome).toEqual({ status: 'nothing-to-do', summary: 'Found no users to add.' });
  });
});

describe('rules-to-fed-groups', () => {
  it('quotes one rule read per ticked rule', () => {
    const basket = storeOf([
      ['rule', 'r1'],
      ['rule', 'r2'],
      ['group', 'g1'],
    ]).getSnapshot();
    expect(rulesToFedGroups.cost(basket)).toEqual({ requests: 2, writes: 0 });
  });

  it('ticks the groups the rules assign into, named from the org snapshot', async () => {
    snapshotNames({ g1: 'Engineering', g2: 'Contractors' });
    const store = storeOf([
      ['rule', 'r1'],
      ['rule', 'r2'],
    ]);
    const getRawGroupRule = vi.fn(async (id: string) =>
      id === 'r1' ? rawRule('r1', { feeds: ['g1', 'g2'] }) : rawRule('r2', { feeds: ['g2'] }),
    );

    const outcome = await rulesToFedGroups.run(contextFor(store, apiWith({ getRawGroupRule })));

    expect(getRawGroupRule).toHaveBeenCalledTimes(2);
    expect(idsOfKind(store.getSnapshot(), 'group')).toEqual(['g1', 'g2']);
    expect(store.getSnapshot().picked.find((ref) => ref.id === 'g1')?.name).toBe('Engineering');
    expect(idsOfKind(store.getSnapshot(), 'rule')).toEqual(['r1', 'r2']);
    expect(outcome).toEqual({ status: 'done', summary: 'Added 2 groups to the selection.' });
  });

  it('leaves out a group the snapshot cannot name, and states how many', async () => {
    snapshotNames({ g1: 'Engineering' });
    const store = storeOf([['rule', 'r1']]);
    const getRawGroupRule = vi.fn(async () => rawRule('r1', { feeds: ['g1', 'gUnknown'] }));

    const outcome = await rulesToFedGroups.run(contextFor(store, apiWith({ getRawGroupRule })));

    expect(idsOfKind(store.getSnapshot(), 'group')).toEqual(['g1']);
    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toBe(
      'Added 1 group to the selection; 1 group the org snapshot does not name was left out.',
    );
  });
});

describe('rules-to-condition-groups', () => {
  it('quotes one rule read per ticked rule', () => {
    expect(rulesToConditionGroups.cost(storeOf([['rule', 'r1']]).getSnapshot())).toEqual({
      requests: 1,
      writes: 0,
    });
  });

  it('ticks the groups an expression asks about by id, and not the ones it names', async () => {
    snapshotNames({ g1: 'Engineering', g2: 'Contractors' });
    const store = storeOf([['rule', 'r1']]);
    const getRawGroupRule = vi.fn(async () =>
      rawRule('r1', {
        expression: 'isMemberOfAnyGroup("g1", "g2") && !isMemberOfGroupName("Vendors")',
        feeds: ['gFed'],
      }),
    );

    const outcome = await rulesToConditionGroups.run(
      contextFor(store, apiWith({ getRawGroupRule })),
    );

    expect(idsOfKind(store.getSnapshot(), 'group')).toEqual(['g1', 'g2']);
    expect(idsOfKind(store.getSnapshot(), 'rule')).toEqual(['r1']);
    expect(outcome).toEqual({ status: 'done', summary: 'Added 2 groups to the selection.' });
  });

  it('counts a rule it could not read', async () => {
    snapshotNames({ g1: 'Engineering' });
    const store = storeOf([
      ['rule', 'r1'],
      ['rule', 'r2'],
    ]);
    const getRawGroupRule = vi.fn(async (id: string) =>
      id === 'r1' ? rawRule('r1', { expression: 'isMemberOfGroup("g1")' }) : null,
    );

    const outcome = await rulesToConditionGroups.run(
      contextFor(store, apiWith({ getRawGroupRule })),
    );

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toBe('Added 1 group to the selection; 1 group rule could not be read.');
  });
});

describe('rules-to-upstream-rules', () => {
  it('quotes a rule read per ticked rule plus the org-wide rules listing walk', () => {
    const basket = storeOf([
      ['rule', 'r1'],
      ['rule', 'r2'],
    ]).getSnapshot();
    expect(rulesToUpstreamRules.cost(basket)).toEqual({ requests: 3, walks: 1, writes: 0 });
  });

  it('walks both hops: condition groups first, then the rules that feed them', async () => {
    const store = storeOf([['rule', 'r1']]);
    const getRawGroupRule = vi.fn(async () =>
      rawRule('r1', { expression: 'isMemberOfAnyGroup("gContractors")', feeds: ['gStaff'] }),
    );
    const ensureGroupRulesLoaded = vi.fn(async () => [
      formattedRule('rUp', ['gContractors']),
      formattedRule('rElsewhere', ['gFinance']),
      formattedRule('rDownstream', ['gStaff']),
    ]);

    const outcome = await rulesToUpstreamRules.run(
      contextFor(store, apiWith({ getRawGroupRule, ensureGroupRulesLoaded })),
    );

    expect(getRawGroupRule).toHaveBeenCalledWith('r1');
    expect(ensureGroupRulesLoaded).toHaveBeenCalledTimes(1);
    expect(idsOfKind(store.getSnapshot(), 'rule')).toEqual(['r1', 'rUp']);
    expect(store.getSnapshot().picked.find((ref) => ref.id === 'rUp')?.name).toBe('Rule rUp');
    expect(outcome).toEqual({ status: 'done', summary: 'Added 1 group rule to the selection.' });
  });

  it('counts an upstream rule that is already ticked rather than adding it twice', async () => {
    const store = storeOf([
      ['rule', 'r1'],
      ['rule', 'rUp'],
    ]);
    const getRawGroupRule = vi.fn(async (id: string) =>
      rawRule(id, { expression: 'isMemberOfGroup("gContractors")' }),
    );
    const ensureGroupRulesLoaded = vi.fn(async () => [formattedRule('rUp', ['gContractors'])]);

    const outcome = await rulesToUpstreamRules.run(
      contextFor(store, apiWith({ getRawGroupRule, ensureGroupRulesLoaded })),
    );

    expect(idsOfKind(store.getSnapshot(), 'rule')).toEqual(['r1', 'rUp']);
    expect(outcome.summary).toBe(
      'Added 0 group rules to the selection; 1 group rule was already ticked.',
    );
  });

  it('adds nothing and names the reason when the rules listing could not be read', async () => {
    const store = storeOf([['rule', 'r1']]);
    const getRawGroupRule = vi.fn(async () =>
      rawRule('r1', { expression: 'isMemberOfGroup("gContractors")' }),
    );
    const ensureGroupRulesLoaded = vi.fn(async () => null);

    const outcome = await rulesToUpstreamRules.run(
      contextFor(store, apiWith({ getRawGroupRule, ensureGroupRulesLoaded })),
    );

    expect(outcome).toEqual({
      status: 'partly-done',
      summary: 'Added no rules: the org-wide rules listing could not be read.',
    });
    expect(idsOfKind(store.getSnapshot(), 'rule')).toEqual(['r1']);
  });
});
