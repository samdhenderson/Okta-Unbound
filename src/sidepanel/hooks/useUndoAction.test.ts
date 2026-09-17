import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUndoAction, type UndoOutcome } from './useUndoAction';
import {
  logBulkProfileUpdateAction,
  logProfileUpdateAction,
  markActionUndone,
} from '../../shared/undoManager';
import type {
  ActionType,
  BulkProfileUserCapture,
  CapturedAttribute,
  UndoAction,
  UndoActionMetadata,
} from '../../shared/undoTypes';
import type { OktaUser } from '../../shared/types';

const calls: string[] = [];

const api = {
  getUserRaw: vi.fn(),
  updateUserProfile: vi.fn(),
  runOperation: vi.fn(async (_name: string, items: unknown[], task: never) => {
    const run = task as unknown as (item: unknown, index: number) => Promise<void>;
    for (const [index, item] of items.entries()) await run(item, index);
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
};

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

vi.mock('../../shared/undoManager', () => ({
  logProfileUpdateAction: vi.fn(),
  logBulkProfileUpdateAction: vi.fn(),
  markActionUndone: vi.fn(),
}));

const mockedLog = vi.mocked(logProfileUpdateAction);
const mockedBulkLog = vi.mocked(logBulkProfileUpdateAction);
const mockedMark = vi.mocked(markActionUndone);

const captured = (name: string, before: string, after: string): CapturedAttribute => ({
  name,
  label: name,
  beforeDisplay: before,
  beforeRaw: before,
  afterDisplay: after,
  restorable: true,
});

const omitted = (name: string, after: string): CapturedAttribute => ({
  name,
  label: name,
  afterDisplay: after,
  restorable: false,
  omitted: 'too-large',
});

const profileAction = (
  changes: CapturedAttribute[],
  status: UndoAction['status'] = 'completed',
): UndoAction => ({
  id: 'action_original',
  type: 'UPDATE_USER_PROFILE',
  timestamp: 1_700_000_000_000,
  description: 'Updated department on Ada Lovelace',
  status,
  metadata: {
    type: 'UPDATE_USER_PROFILE',
    userId: '00uFAKE0000000000001',
    userLogin: 'user@example.com',
    userName: 'Ada Lovelace',
    changes,
  },
});

const liveUser = (profile: Record<string, unknown>): OktaUser =>
  ({
    id: '00uFAKE0000000000001',
    status: 'ACTIVE',
    profile: {
      login: 'user@example.com',
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      ...profile,
    },
  }) as OktaUser;

const renderUndo = () => renderHook(() => useUndoAction({ targetTabId: 1 })).result;

async function runUndo(action: UndoAction): Promise<UndoOutcome> {
  const result = renderUndo();
  let outcome!: UndoOutcome;
  await act(async () => {
    outcome = await result.current.undo(action);
  });
  return outcome;
}

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;

  api.getUserRaw.mockImplementation(async () => liveUser({ department: 'Platform' }));
  api.updateUserProfile.mockImplementation(async () => {
    calls.push('updateUserProfile');
    return { kind: 'saved', user: liveUser({ department: 'Engineering' }) };
  });
  mockedLog.mockImplementation(async () => {
    calls.push('logProfileUpdateAction');
    return { id: 'action_undo' } as UndoAction;
  });
  mockedMark.mockImplementation(async () => {
    calls.push('markActionUndone');
    return true;
  });
  mockedBulkLog.mockImplementation(async () => {
    calls.push('logBulkProfileUpdateAction');
    return { id: 'action_undo' } as UndoAction;
  });
});

const capturedUser = (userId: string, before: unknown): BulkProfileUserCapture => ({
  userId,
  beforeRaw: before,
  restorable: true,
});

const omittedUser = (userId: string): BulkProfileUserCapture => ({
  userId,
  restorable: false,
  omitted: 'too-large',
});

const bulkAction = (
  users: BulkProfileUserCapture[],
  overrides: {
    afterDisplay?: string;
    unconfirmedUserIds?: string[];
    status?: UndoAction['status'];
  } = {},
): UndoAction => ({
  id: 'action_bulk',
  type: 'BULK_UPDATE_USER_PROFILE',
  timestamp: 1_700_000_000_000,
  description: 'Set Department on 2 users',
  status: overrides.status ?? 'completed',
  metadata: {
    type: 'BULK_UPDATE_USER_PROFILE',
    attributeName: 'department',
    attributeLabel: 'Department',
    afterDisplay: 'afterDisplay' in overrides ? overrides.afterDisplay : 'Advertising',
    users,
    unconfirmedUserIds: overrides.unconfirmedUserIds ?? [],
  },
});

const bulkUser = (id: string, department: unknown): OktaUser =>
  ({ id, status: 'ACTIVE', profile: { department } }) as unknown as OktaUser;

describe('undoability — only profile writes have an undo path', () => {
  const otherTypes: Array<[Exclude<ActionType, 'UPDATE_USER_PROFILE'>, UndoActionMetadata]> = [
    [
      'REMOVE_USER_FROM_GROUP',
      {
        type: 'REMOVE_USER_FROM_GROUP',
        userId: '00uFAKE1',
        userEmail: 'user@example.com',
        userName: 'Ada',
        groupId: '00gFAKE1',
        groupName: 'Engineering',
      },
    ],
    [
      'ADD_USER_TO_GROUP',
      {
        type: 'ADD_USER_TO_GROUP',
        userId: '00uFAKE1',
        userEmail: 'user@example.com',
        userName: 'Ada',
        groupId: '00gFAKE1',
        groupName: 'Engineering',
      },
    ],
    [
      'BULK_REMOVE_USERS_FROM_GROUP',
      {
        type: 'BULK_REMOVE_USERS_FROM_GROUP',
        users: [],
        groupId: '00gFAKE1',
        groupName: 'Engineering',
        operationType: 'deprovisioned',
      },
    ],
    [
      'BULK_ADD_USERS_TO_GROUP',
      {
        type: 'BULK_ADD_USERS_TO_GROUP',
        users: [],
        groupId: '00gFAKE1',
        groupName: 'Engineering',
      },
    ],
    ['ACTIVATE_RULE', { type: 'ACTIVATE_RULE', ruleId: '0prFAKE1', ruleName: 'Auto-add' }],
    ['DEACTIVATE_RULE', { type: 'DEACTIVATE_RULE', ruleId: '0prFAKE1', ruleName: 'Auto-add' }],
    [
      'CONSOLIDATE_RULE',
      {
        type: 'CONSOLIDATE_RULE',
        createdRuleId: '0prFAKE9',
        createdRuleName: 'Merged',
        createdGroupIds: ['00gFAKE1'],
        retiredRules: [],
      },
    ],
  ];

  it.each(otherTypes)('%s is not undoable, with a reason', async (type, metadata) => {
    const action: UndoAction = {
      id: `action_${type}`,
      type,
      timestamp: 1_700_000_000_000,
      description: 'Something happened',
      status: 'completed',
      metadata,
    };

    const result = renderUndo();

    const verdict = result.current.undoability(action);
    expect(verdict.undoable).toBe(false);
    expect(verdict.undoable === false && verdict.reason.length).toBeGreaterThan(20);

    expect(await runUndo(action)).toEqual({ kind: 'not-undoable', reason: expect.any(String) });
    expect(api.getUserRaw).not.toHaveBeenCalled();
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('refuses a `partial` entry — an unconfirmed write is not a known prior state', async () => {
    const action = profileAction([captured('department', 'Platform', 'Engineering')], 'partial');
    const result = renderUndo();

    expect(result.current.undoability(action).undoable).toBe(false);
    expect(await runUndo(action)).toEqual({
      kind: 'not-undoable',
      reason: expect.stringContaining('never confirmed'),
    });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('refuses a `failed` entry', () => {
    const action = profileAction([captured('department', 'Platform', 'Engineering')], 'failed');
    expect(renderUndo().current.undoability(action).undoable).toBe(false);
  });

  it('refuses when no change captured a prior value', () => {
    const action = profileAction([omitted('bio', 'a very long value')]);
    const verdict = renderUndo().current.undoability(action);

    expect(verdict.undoable).toBe(false);
    expect(verdict.undoable === false && verdict.reason).toContain('nothing to restore');
  });

  it('counts restorable against total for a mixed entry', () => {
    const action = profileAction([
      captured('department', 'Platform', 'Engineering'),
      omitted('bio', 'a very long value'),
      captured('title', 'Intern', 'Engineer'),
    ]);

    expect(renderUndo().current.undoability(action)).toEqual({
      undoable: true,
      restorable: 2,
      total: 3,
    });
  });
});

describe('drift', () => {
  it('refuses when an attribute is no longer what the write set', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Finance' }));
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toEqual({ kind: 'drifted', attributeNames: ['department'] });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('reports attribute names only — no value reaches the outcome', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Finance' }));
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    const serialized = JSON.stringify(outcome);
    expect(serialized).not.toContain('Finance');
    expect(serialized).not.toContain('Platform');
    expect(serialized).not.toContain('Engineering');
  });

  it('detects drift even when the live value equals the value before the edit', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Platform' }));
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toEqual({ kind: 'drifted', attributeNames: ['department'] });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('compares through `toDisplay`, so 5 and "5" agree', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ employeeNumber: 5 }));
    const action = profileAction([captured('employeeNumber', '4', '5')]);

    const outcome = await runUndo(action);

    expect(outcome).toMatchObject({ kind: 'undone' });
  });
});

describe('the restoring write', () => {
  it('writes the prior values and reports what it restored', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering', title: 'Engineer' }));
    const action = profileAction([
      captured('department', 'Platform', 'Engineering'),
      captured('title', 'Intern', 'Engineer'),
    ]);

    const outcome = await runUndo(action);

    expect(api.updateUserProfile).toHaveBeenCalledWith('00uFAKE0000000000001', {
      department: 'Platform',
      title: 'Intern',
    });
    expect(outcome).toEqual({
      kind: 'undone',
      restored: 2,
      skipped: 0,
      unit: 'attribute',
      actionId: 'action_undo',
    });
  });

  it('records the undo entry before marking the original undone', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering' }));
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    await runUndo(action);

    expect(calls).toEqual(['updateUserProfile', 'logProfileUpdateAction', 'markActionUndone']);
  });

  it('links the new entry to the original in both directions', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering' }));
    const action = profileAction([
      captured('department', 'Platform', 'Engineering'),
      omitted('bio', 'a very long value'),
    ]);

    await runUndo(action);

    expect(mockedLog).toHaveBeenCalledWith(
      '00uFAKE0000000000001',
      'user@example.com',
      'Ada Lovelace',
      expect.any(Array),
      { undoOfActionId: 'action_original', originalAttributeCount: 2 },
    );
    expect(mockedMark).toHaveBeenCalledWith('action_original', 'action_undo');
  });

  it('restores what it can and announces what it skipped', async () => {
    api.getUserRaw.mockResolvedValue(
      liveUser({ department: 'Engineering', title: 'Engineer', city: 'Berlin' }),
    );
    const action = profileAction([
      captured('department', 'Platform', 'Engineering'),
      omitted('bio', 'a very long value'),
      captured('title', 'Intern', 'Engineer'),
      omitted('notes', 'another very long value'),
      captured('city', 'London', 'Berlin'),
    ]);

    const outcome = await runUndo(action);

    expect(api.updateUserProfile).toHaveBeenCalledWith('00uFAKE0000000000001', {
      department: 'Platform',
      title: 'Intern',
      city: 'London',
    });
    expect(outcome).toEqual({
      kind: 'undone',
      restored: 3,
      skipped: 2,
      unit: 'attribute',
      actionId: 'action_undo',
    });
  });

  it('still reports success when the original was evicted by the history cap', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering' }));
    mockedMark.mockResolvedValue(false);
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toMatchObject({ kind: 'undone', restored: 1 });
  });

  it('fails when the user cannot be re-read, without writing anything', async () => {
    api.getUserRaw.mockResolvedValue(null);
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toMatchObject({ kind: 'failed' });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
    expect(mockedLog).not.toHaveBeenCalled();
  });

  it('does not mark the original undone when Okta rejects the write', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering' }));
    api.updateUserProfile.mockResolvedValue({ kind: 'failed', error: 'Okta said no' });
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toEqual({ kind: 'failed', error: 'Okta said no' });
    expect(mockedMark).not.toHaveBeenCalled();
    expect(mockedLog).not.toHaveBeenCalled();
  });

  it('records an unconfirmed write as `partial` but never marks the original undone', async () => {
    api.getUserRaw.mockResolvedValue(liveUser({ department: 'Engineering' }));
    api.updateUserProfile.mockResolvedValue({
      kind: 'unknown',
      error: 'The update could not be confirmed.',
    });
    const action = profileAction([captured('department', 'Platform', 'Engineering')]);

    const outcome = await runUndo(action);

    expect(outcome).toMatchObject({ kind: 'failed' });
    expect(mockedLog).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ status: 'partial' }),
    );
    expect(mockedMark).not.toHaveBeenCalled();
  });
});

describe('an already-undone entry', () => {
  it('short-circuits before any request', async () => {
    const action = profileAction([captured('department', 'Platform', 'Engineering')], 'undone');

    const outcome = await runUndo(action);

    expect(outcome).toEqual({ kind: 'already-undone' });
    expect(api.getUserRaw).not.toHaveBeenCalled();
    expect(api.updateUserProfile).not.toHaveBeenCalled();
    expect(calls).toEqual([]);
  });
});

describe('every ActionType is accounted for', () => {
  const everyType: Record<ActionType, UndoActionMetadata> = {
    REMOVE_USER_FROM_GROUP: {
      type: 'REMOVE_USER_FROM_GROUP',
      userId: '00uFAKE1',
      userEmail: 'user@example.com',
      userName: 'Ada',
      groupId: '00gFAKE1',
      groupName: 'Engineering',
    },
    ADD_USER_TO_GROUP: {
      type: 'ADD_USER_TO_GROUP',
      userId: '00uFAKE1',
      userEmail: 'user@example.com',
      userName: 'Ada',
      groupId: '00gFAKE1',
      groupName: 'Engineering',
    },
    BULK_REMOVE_USERS_FROM_GROUP: {
      type: 'BULK_REMOVE_USERS_FROM_GROUP',
      users: [],
      groupId: '00gFAKE1',
      groupName: 'Engineering',
      operationType: 'deprovisioned',
    },
    BULK_ADD_USERS_TO_GROUP: {
      type: 'BULK_ADD_USERS_TO_GROUP',
      users: [],
      groupId: '00gFAKE1',
      groupName: 'Engineering',
    },
    ACTIVATE_RULE: { type: 'ACTIVATE_RULE', ruleId: '0prFAKE1', ruleName: 'Auto-add' },
    DEACTIVATE_RULE: { type: 'DEACTIVATE_RULE', ruleId: '0prFAKE1', ruleName: 'Auto-add' },
    CONSOLIDATE_RULE: {
      type: 'CONSOLIDATE_RULE',
      createdRuleId: '0prFAKE9',
      createdRuleName: 'Merged',
      createdGroupIds: ['00gFAKE1'],
      retiredRules: [],
    },
    UPDATE_USER_PROFILE: {
      type: 'UPDATE_USER_PROFILE',
      userId: '00uFAKE1',
      userLogin: 'user@example.com',
      userName: 'Ada',
      changes: [captured('department', 'Platform', 'Engineering')],
    },
    BULK_UPDATE_USER_PROFILE: {
      type: 'BULK_UPDATE_USER_PROFILE',
      attributeName: 'department',
      attributeLabel: 'Department',
      afterDisplay: 'Advertising',
      users: [capturedUser('00uFAKE1', 'Marketing')],
      unconfirmedUserIds: [],
    },
    CHANGE_USER_PASSWORD: {
      type: 'CHANGE_USER_PASSWORD',
      userId: '00uFAKE1',
      userLogin: 'user@example.com',
      userName: 'Ada',
      mode: 'set',
    },
  };

  const undoable: ActionType[] = ['UPDATE_USER_PROFILE', 'BULK_UPDATE_USER_PROFILE'];

  it.each(Object.entries(everyType))('%s states an undo path or a reason', (type, metadata) => {
    const action: UndoAction = {
      id: `action_${type}`,
      type: type as ActionType,
      timestamp: 1_700_000_000_000,
      description: 'Something happened',
      status: 'completed',
      metadata,
    };

    const verdict = renderUndo().current.undoability(action);

    expect(verdict.undoable).toBe(undoable.includes(type as ActionType));
    if (!verdict.undoable) expect(verdict.reason.length).toBeGreaterThan(20);
  });
});

describe('undoing a bulk profile run', () => {
  beforeEach(() => {
    api.getUserRaw.mockImplementation(async (userId: string) => bulkUser(userId, 'Advertising'));
  });

  it('writes each user’s own previous value back', async () => {
    const action = bulkAction([
      capturedUser('00uFAKE1', 'Marketing'),
      capturedUser('00uFAKE2', 'Sales'),
    ]);

    const outcome = await runUndo(action);

    expect(api.updateUserProfile).toHaveBeenCalledWith('00uFAKE1', { department: 'Marketing' });
    expect(api.updateUserProfile).toHaveBeenCalledWith('00uFAKE2', { department: 'Sales' });
    expect(outcome).toEqual({
      kind: 'undone',
      restored: 2,
      skipped: 0,
      unit: 'user',
      actionId: 'action_undo',
    });
    expect(mockedMark).toHaveBeenCalledWith('action_bulk', 'action_undo');
  });

  it('records the undo entry before marking the original undone', async () => {
    await runUndo(bulkAction([capturedUser('00uFAKE1', 'Marketing')]));

    expect(calls).toEqual(['updateUserProfile', 'logBulkProfileUpdateAction', 'markActionUndone']);
  });

  it('counts the users it cannot restore rather than silently dropping them', async () => {
    const action = bulkAction([capturedUser('00uFAKE1', 'Marketing'), omittedUser('00uFAKE2')], {
      unconfirmedUserIds: ['00uFAKE3'],
    });

    const outcome = await runUndo(action);

    expect(outcome).toEqual({
      kind: 'undone',
      restored: 1,
      skipped: 2,
      unit: 'user',
      actionId: 'action_undo',
    });
    expect(api.updateUserProfile).toHaveBeenCalledTimes(1);
  });

  it('refuses whole when the attribute is no longer what the run set', async () => {
    api.getUserRaw.mockImplementation(async (userId: string) =>
      bulkUser(userId, userId === '00uFAKE2' ? 'Finance' : 'Advertising'),
    );
    const action = bulkAction([
      capturedUser('00uFAKE1', 'Marketing'),
      capturedUser('00uFAKE2', 'Sales'),
    ]);

    const outcome = await runUndo(action);

    expect(outcome).toEqual({ kind: 'drifted', attributeNames: ['department'] });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('detects drift even when a user was set back to the value they had before', async () => {
    api.getUserRaw.mockImplementation(async () => bulkUser('00uFAKE1', 'Marketing'));

    expect(await runUndo(bulkAction([capturedUser('00uFAKE1', 'Marketing')]))).toEqual({
      kind: 'drifted',
      attributeNames: ['department'],
    });
  });

  it('compares through `toDisplay`, so 5 and "5" agree', async () => {
    api.getUserRaw.mockImplementation(async () => bulkUser('00uFAKE1', 5));
    const action = bulkAction([capturedUser('00uFAKE1', 'Marketing')], { afterDisplay: '5' });

    expect(await runUndo(action)).toMatchObject({ kind: 'undone', restored: 1 });
  });

  it('writes nothing when part of the cohort cannot be re-read', async () => {
    api.getUserRaw.mockImplementation(async (userId: string) =>
      userId === '00uFAKE2' ? null : bulkUser(userId, 'Advertising'),
    );
    const action = bulkAction([
      capturedUser('00uFAKE1', 'Marketing'),
      capturedUser('00uFAKE2', 'Sales'),
    ]);

    const outcome = await runUndo(action);

    expect(outcome).toEqual({
      kind: 'failed',
      error: expect.stringContaining('could not be read'),
    });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('never marks the original undone when part of the restore did not land', async () => {
    api.updateUserProfile.mockImplementation(async (userId: string) => {
      calls.push('updateUserProfile');
      return userId === '00uFAKE2'
        ? { kind: 'unknown', error: 'could not be confirmed' }
        : { kind: 'saved', user: bulkUser(userId, 'Marketing') };
    });
    const action = bulkAction([
      capturedUser('00uFAKE1', 'Marketing'),
      capturedUser('00uFAKE2', 'Sales'),
    ]);

    const outcome = await runUndo(action);

    expect(outcome).toMatchObject({ kind: 'failed' });
    expect(outcome).toEqual({
      kind: 'failed',
      error: expect.stringContaining('could not be confirmed'),
    });
    expect(mockedMark).not.toHaveBeenCalled();
  });

  it('offers no undo of an entry that has no captured previous value', async () => {
    const action = bulkAction([omittedUser('00uFAKE1')]);

    expect(renderUndo().current.undoability(action).undoable).toBe(false);
    expect(await runUndo(action)).toMatchObject({ kind: 'not-undoable' });
    expect(api.updateUserProfile).not.toHaveBeenCalled();
  });

  it('offers no undo of a restore, which set no single value to check against', async () => {
    const action = bulkAction([capturedUser('00uFAKE1', 'Marketing')], {
      afterDisplay: undefined,
    });

    const verdict = renderUndo().current.undoability(action);

    expect(verdict.undoable).toBe(false);
    expect(verdict.undoable === false && verdict.reason).toContain('no single value');
    expect(await runUndo(action)).toMatchObject({ kind: 'not-undoable' });
    expect(api.getUserRaw).not.toHaveBeenCalled();
  });
});
