import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  captureAttribute,
  captureAttributes,
  logPasswordChangeAction,
  logProfileUpdateAction,
  markActionUndone,
  logAction,
  getUndoHistory,
  MAX_CAPTURED_ATTRIBUTES,
  MAX_CAPTURED_VALUE_CHARS,
  type AttributeChange,
} from './undoManager';
import type { ChangeUserPasswordMetadata, UpdateUserProfileMetadata } from './undoTypes';

const storage = chrome.storage.local as unknown as {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

let store: Record<string, unknown> = {};

beforeEach(() => {
  vi.clearAllMocks();
  store = {};
  storage.get.mockImplementation(async (keys: string[]) =>
    Object.fromEntries(keys.filter((key) => key in store).map((key) => [key, store[key]])),
  );
  storage.set.mockImplementation(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });
});

const change = (overrides: Partial<AttributeChange> = {}): AttributeChange => ({
  name: 'department',
  label: 'Department',
  beforeDisplay: 'Support',
  beforeRaw: 'Support',
  afterDisplay: 'Engineering',
  ...overrides,
});

describe('captureAttribute', () => {
  it('captures prior state for an ordinary change', () => {
    const captured = captureAttribute(change(), 0);

    expect(captured).toMatchObject({
      name: 'department',
      label: 'Department',
      beforeDisplay: 'Support',
      beforeRaw: 'Support',
      afterDisplay: 'Engineering',
      restorable: true,
    });
    expect(captured.omitted).toBeUndefined();
  });

  it('captures a genuinely empty prior value as an empty string', () => {
    const captured = captureAttribute(change({ beforeDisplay: '', beforeRaw: '' }), 0);

    expect(captured.beforeDisplay).toBe('');
    expect(captured.restorable).toBe(true);
  });

  it('omits an over-long prior value entirely rather than truncating it', () => {
    const captured = captureAttribute(
      change({
        beforeDisplay: 'x'.repeat(MAX_CAPTURED_VALUE_CHARS + 1),
        beforeRaw: 'x'.repeat(MAX_CAPTURED_VALUE_CHARS + 1),
      }),
      0,
    );

    expect(captured.beforeDisplay).toBeUndefined();
    expect(captured.beforeRaw).toBeUndefined();
    expect(captured.restorable).toBe(false);
    expect(captured.omitted).toBe('too-large');
    expect(captured.afterDisplay).toBe('Engineering');
  });

  it('keeps a prior value exactly at the cap', () => {
    const captured = captureAttribute(
      change({ beforeDisplay: 'x'.repeat(MAX_CAPTURED_VALUE_CHARS) }),
      0,
    );

    expect(captured.restorable).toBe(true);
    expect(captured.beforeDisplay).toHaveLength(MAX_CAPTURED_VALUE_CHARS);
  });

  it('omits prior state for changes past the attribute cap', () => {
    const captured = captureAttribute(change(), MAX_CAPTURED_ATTRIBUTES);

    expect(captured.beforeDisplay).toBeUndefined();
    expect(captured.beforeRaw).toBeUndefined();
    expect(captured.restorable).toBe(false);
    expect(captured.omitted).toBe('too-many');
  });
});

describe('captureAttributes', () => {
  it('records every change, marking only the ones past the cap unrestorable', () => {
    const changes = Array.from({ length: MAX_CAPTURED_ATTRIBUTES + 2 }, (_, index) =>
      change({ name: `attr${index}` }),
    );

    const captured = captureAttributes(changes);

    expect(captured).toHaveLength(MAX_CAPTURED_ATTRIBUTES + 2);
    expect(captured.filter((entry) => entry.restorable)).toHaveLength(MAX_CAPTURED_ATTRIBUTES);
    expect(captured[MAX_CAPTURED_ATTRIBUTES].omitted).toBe('too-many');
    expect(captured[MAX_CAPTURED_ATTRIBUTES].beforeDisplay).toBeUndefined();
  });
});

describe('logProfileUpdateAction', () => {
  it('persists the capture policy, not the caller-supplied prior value', async () => {
    await logProfileUpdateAction('00uFAKE1', 'jane@example.com', 'Jane Doe', [
      change({ beforeDisplay: 'y'.repeat(MAX_CAPTURED_VALUE_CHARS + 1) }),
    ]);

    const history = await getUndoHistory();
    const metadata = history.actions[0].metadata as UpdateUserProfileMetadata;

    expect(metadata.changes[0].restorable).toBe(false);
    expect(metadata.changes[0].omitted).toBe('too-large');
    expect(metadata.changes[0].beforeDisplay).toBeUndefined();
    expect('beforeDisplay' in metadata.changes[0]).toBe(false);
  });

  it('describes up to three attributes and elides the rest', async () => {
    const names = ['department', 'title', 'division', 'costCenter', 'organization'];

    const action = await logProfileUpdateAction(
      '00uFAKE1',
      'jane@example.com',
      'Jane Doe',
      names.map((name) => change({ name })),
    );

    expect(action.description).toBe('Updated department, title, division and 2 more on Jane Doe');
    expect(action.status).toBe('completed');
  });

  it('describes an undo as a partial restore and records the link back', async () => {
    const action = await logProfileUpdateAction(
      '00uFAKE1',
      'jane@example.com',
      'Jane Doe',
      [change(), change({ name: 'title' }), change({ name: 'division' })],
      { undoOfActionId: 'action_original', originalAttributeCount: 5 },
    );

    expect(action.description).toBe('Restored 3 of 5 attributes on Jane Doe');
    expect((action.metadata as UpdateUserProfileMetadata).undoOfActionId).toBe('action_original');
  });

  it("records an unconfirmed write as 'partial' rather than completed", async () => {
    const action = await logProfileUpdateAction(
      '00uFAKE1',
      'jane@example.com',
      'Jane Doe',
      [change()],
      { status: 'partial' },
    );

    expect(action.status).toBe('partial');
    expect((await getUndoHistory()).actions[0].status).toBe('partial');
  });
});

describe('markActionUndone', () => {
  it('marks a known action undone', async () => {
    const original = await logProfileUpdateAction('00uFAKE1', 'jane@example.com', 'Jane Doe', [
      change(),
    ]);

    expect(await markActionUndone(original.id, 'action_undoing')).toBe(true);
    const history = await getUndoHistory();
    expect(history.actions.find((entry) => entry.id === original.id)?.status).toBe('undone');
  });

  it('returns false for an evicted action while leaving the history intact', async () => {
    const kept = await logAction('Something else', {
      type: 'ACTIVATE_RULE',
      ruleId: '0prFAKE1',
      ruleName: 'Rule',
    });

    expect(await markActionUndone('action_evicted', 'action_undoing')).toBe(false);

    const history = await getUndoHistory();
    expect(history.actions).toHaveLength(1);
    expect(history.actions[0].id).toBe(kept.id);
    expect(history.actions[0].status).toBe('completed');
  });
});

describe('logPasswordChangeAction', () => {
  const onlyEntry = async () => (await getUndoHistory()).actions[0];

  it('records the change with no prior state, because none exists', async () => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', 'Ada Lovelace', 'set');

    const entry = await onlyEntry();
    const metadata = entry.metadata as ChangeUserPasswordMetadata;

    expect(entry.type).toBe('CHANGE_USER_PASSWORD');
    expect(entry.status).toBe('completed');
    expect(metadata.mode).toBe('set');
    expect(metadata.userId).toBe('00uFAKE1');
    expect(metadata).not.toHaveProperty('changes');
  });

  it.each([
    ['email-reset', /reset email/i],
    ['set', /Set a password/i],
    ['temp', /temporary password/i],
  ] as const)('names the operation for mode %s', async (mode, matcher) => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', 'Ada Lovelace', mode);

    expect((await onlyEntry()).description).toMatch(matcher);
  });

  it('says so when the forced change did not land', async () => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', 'Ada', 'set-and-expire', {
      expired: false,
    });

    const entry = await onlyEntry();
    expect(entry.description).toMatch(/forced change was not applied/i);
    expect((entry.metadata as ChangeUserPasswordMetadata).expired).toBe(false);
  });

  it('carries an unconfirmed outcome as partial, not completed', async () => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', 'Ada', 'set', {
      status: 'partial',
    });

    expect((await onlyEntry()).status).toBe('partial');
  });

  it('falls back to the login when no display name is known', async () => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', '', 'set');

    expect((await onlyEntry()).description).toContain('ada@example.com');
  });

  it('stores no password value anywhere in the entry', async () => {
    await logPasswordChangeAction('00uFAKE1', 'ada@example.com', 'Ada', 'temp');

    expect(JSON.stringify(await onlyEntry())).not.toMatch(/password['"]?\s*:/i);
  });
});
