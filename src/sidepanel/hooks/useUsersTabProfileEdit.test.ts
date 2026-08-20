import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUsersTabProfileEdit } from './useUsersTabProfileEdit';
import type { ProfileSaveOutcome, UseProfileEditReturn } from './useProfileEdit';
import type { DraftChange } from '../components/users/profileDraft';
import type { UndoOutcome } from './useUndoAction';
import { getUndoHistory } from '../../shared/undoManager';
import type { AttributeDescriptor } from '../components/users/profileAttributes';
import type { AlertAction, AlertMessageData } from '../components/shared/AlertMessage';
import type { OktaUser } from '../../shared/types';
import type { UndoAction } from '../../shared/undoTypes';

const confirmSave = vi.fn<() => Promise<ProfileSaveOutcome>>();
const undo = vi.fn<(action: UndoAction) => Promise<UndoOutcome>>();
const getUserRaw = vi.fn();
const resetReport = vi.fn();
const analyze = vi.fn();

const change = (
  name: string,
  label: string,
  before = 'PRIOR_VALUE',
  after = 'NEW_VALUE',
): DraftChange => ({
  name,
  label,
  beforeDisplay: before,
  afterDisplay: after,
  afterRaw: after,
  changesSignIn: false,
});

const editState = {
  isEditing: false,
  changeCount: 0,
  hasInvalid: false,
  pendingSave: null as UseProfileEditReturn['pendingSave'],
  draftPatch: {} as Readonly<Record<string, unknown>>,
};

vi.mock('./useProfileEdit', () => ({
  useProfileEdit: (): UseProfileEditReturn => ({
    isEditing: editState.isEditing,
    begin: vi.fn(),
    cancel: vi.fn(),
    cells: {},
    changes: Array.from({ length: editState.changeCount }, (_, index) =>
      change(`attr${index}`, `Attr ${index}`),
    ),
    hasChanges: editState.changeCount > 0,
    hasInvalid: editState.hasInvalid,
    pendingSave: editState.pendingSave,
    requestSave: vi.fn(),
    dismissSave: vi.fn(),
    confirmSave,
    isSaving: false,
    draftPatch: editState.draftPatch,
  }),
}));

vi.mock('./useBlastRadius', () => ({
  useBlastRadius: () => ({
    report: { status: 'not-computed' },
    analyze,
    reset: resetReport,
    isAnalyzing: false,
  }),
}));

vi.mock('./useUndoAction', () => ({
  useUndoAction: () => ({ undo, undoingActionId: null, undoability: vi.fn() }),
}));

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => ({ getUserRaw }),
}));

vi.mock('../../shared/undoManager', () => ({
  getUndoHistory: vi.fn(),
}));

const mockedHistory = vi.mocked(getUndoHistory);

const user = {
  id: '00uFAKE0001',
  status: 'ACTIVE',
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'L',
  },
  credentials: { provider: { type: 'OKTA' } },
} as unknown as OktaUser;

const writable = (name: string): AttributeDescriptor => ({
  key: `profile.${name}`,
  name,
  label: name,
  kind: 'base',
  value: '',
  raw: '',
  isEmpty: true,
  property: { type: 'string', mutability: 'READ_WRITE' },
});

const readOnly = (name: string): AttributeDescriptor => ({
  ...writable(name),
  property: { type: 'string', mutability: 'READ_ONLY' },
});

const systemField = (name: string): AttributeDescriptor => ({
  key: name,
  name,
  label: name,
  kind: 'system',
  value: '',
  raw: '',
  isEmpty: true,
});

const savedEntry = (over: Partial<UndoAction> = {}): UndoAction =>
  ({
    id: 'action_1',
    type: 'UPDATE_USER_PROFILE',
    timestamp: 1,
    description: 'Updated department on Ada L',
    status: 'completed',
    metadata: {
      type: 'UPDATE_USER_PROFILE',
      userId: user.id,
      userLogin: user.profile.login,
      userName: 'Ada L',
      changes: [],
    },
    ...over,
  }) as UndoAction;

interface Published {
  message: AlertMessageData;
  action?: AlertAction;
}

function setup(attributes: AttributeDescriptor[] = [writable('department')]) {
  const published: Published[] = [];
  const lifted: OktaUser[] = [];

  const rendered = renderHook(() =>
    useUsersTabProfileEdit({
      user,
      attributes,
      memberships: [],
      rules: { status: 'unresolved' },
      targetTabId: 7,
      enabled: true,
      onUserUpdated: (next) => lifted.push(next),
      onResult: (message, action) => published.push({ message, action }),
    }),
  );

  return { ...rendered, published, lifted };
}

function last(published: Published[]): Published {
  const entry = published.at(-1);
  if (!entry) throw new Error('nothing was published');
  return entry;
}

beforeEach(() => {
  vi.clearAllMocks();
  editState.isEditing = false;
  editState.changeCount = 0;
  editState.hasInvalid = false;
  editState.pendingSave = null;
  editState.draftPatch = {};
  mockedHistory.mockResolvedValue({ actions: [], maxSize: 50 });
  getUserRaw.mockResolvedValue(null);
});

describe('the Edit affordance', () => {
  it('is offered when at least one attribute is writable', () => {
    const { result } = setup([systemField('id'), readOnly('created'), writable('department')]);
    expect(result.current.controls.canEdit).toBe(true);
  });

  it('is withheld when nothing on the profile can be edited', () => {
    const { result } = setup([systemField('id'), readOnly('department')]);
    expect(result.current.controls.canEdit).toBe(false);
  });

  it('withholds it for a duplicated name whose other descriptor is locked', () => {
    const { result } = setup([writable('status'), systemField('status')]);
    expect(result.current.controls.canEdit).toBe(false);
  });
});

describe('confirming a save', () => {
  it('reports an unconfirmed write as a warning, never as a failure, and offers no undo', async () => {
    editState.pendingSave = [change('department', 'Department')];
    confirmSave.mockResolvedValue({ kind: 'unknown' });

    const { result, published } = setup();
    await act(async () => {
      result.current.save.onConfirm();
    });

    expect(last(published).message.type).toBe('warning');
    expect(last(published).message.text).toBe(
      'The result of this change is unknown. Reload to check.',
    );
    expect(last(published).action).toBeUndefined();
  });

  it('reports a rejected write as danger, carrying Okta’s reason', async () => {
    editState.pendingSave = [change('department', 'Department')];
    confirmSave.mockResolvedValue({ kind: 'failed', error: 'Okta rejected the update.' });

    const { result, published } = setup();
    await act(async () => {
      result.current.save.onConfirm();
    });

    expect(last(published).message).toEqual({
      type: 'danger',
      text: 'Okta rejected the update.',
    });
    expect(last(published).action).toBeUndefined();
  });

  it('names the count on success and offers Undo from the recorded entry', async () => {
    editState.pendingSave = [change('department', 'Department'), change('title', 'Title')];
    confirmSave.mockResolvedValue({ kind: 'saved', user });
    mockedHistory.mockResolvedValue({ actions: [savedEntry()], maxSize: 50 });

    const { result, published } = setup();
    await act(async () => {
      result.current.save.onConfirm();
    });

    expect(last(published).message.type).toBe('success');
    expect(last(published).message.text).toContain('2 attributes');
    expect(last(published).action?.label).toBe('Undo');
  });

  it('still reports the save when the history entry cannot be identified', async () => {
    editState.pendingSave = [change('department', 'Department')];
    confirmSave.mockResolvedValue({ kind: 'saved', user });
    mockedHistory.mockResolvedValue({
      actions: [
        savedEntry({
          metadata: {
            type: 'UPDATE_USER_PROFILE',
            userId: user.id,
            userLogin: user.profile.login,
            userName: 'Ada L',
            changes: [],
            undoOfActionId: 'action_0',
          },
        }),
      ],
      maxSize: 50,
    });

    const { result, published } = setup();
    await act(async () => {
      result.current.save.onConfirm();
    });

    expect(last(published).message.type).toBe('success');
    expect(last(published).action).toBeUndefined();
  });

  it('offers no undo for an entry recorded as partial', async () => {
    editState.pendingSave = [change('department', 'Department')];
    confirmSave.mockResolvedValue({ kind: 'saved', user });
    mockedHistory.mockResolvedValue({ actions: [savedEntry({ status: 'partial' })], maxSize: 50 });

    const { result, published } = setup();
    await act(async () => {
      result.current.save.onConfirm();
    });

    expect(last(published).action).toBeUndefined();
  });
});

describe('undoing a save', () => {
  async function saveThenUndo(outcome: UndoOutcome) {
    editState.pendingSave = [change('department', 'Department')];
    confirmSave.mockResolvedValue({ kind: 'saved', user });
    mockedHistory.mockResolvedValue({ actions: [savedEntry()], maxSize: 50 });
    undo.mockResolvedValue(outcome);

    const harness = setup();
    await act(async () => {
      harness.result.current.save.onConfirm();
    });

    const action = last(harness.published).action;
    if (!action) throw new Error('no Undo was offered');
    await act(async () => {
      action.onClick();
    });

    return harness;
  }

  it('lifts the re-read user so the pane stops showing the replaced values', async () => {
    const restored = { ...user, lastUpdated: '2026-01-01T00:00:00.000Z' } as OktaUser;
    getUserRaw.mockResolvedValue(restored);

    const { published, lifted } = await saveThenUndo({
      kind: 'undone',
      restored: 1,
      skipped: 0,
      actionId: 'action_2',
    });

    expect(lifted).toContain(restored);
    expect(last(published).message.type).toBe('success');
    expect(last(published).message.text).toContain('1 attribute');
  });

  it('says how many attributes were left alone when some were never captured', async () => {
    const { published } = await saveThenUndo({
      kind: 'undone',
      restored: 2,
      skipped: 1,
      actionId: 'action_2',
    });

    expect(last(published).message.text).toContain('2 attributes');
    expect(last(published).message.text).toContain('1 attribute had no previous value recorded');
  });

  it('reports drift as a warning naming the attributes and nothing else', async () => {
    const { published } = await saveThenUndo({
      kind: 'drifted',
      attributeNames: ['department', 'title'],
    });

    const { message } = last(published);
    expect(message.type).toBe('warning');
    expect(message.text).toContain('department, title');
    expect(message.text).not.toContain('PRIOR_VALUE');
    expect(message.text).not.toContain('NEW_VALUE');
  });

  it('reports a failed restore as danger', async () => {
    const { published } = await saveThenUndo({ kind: 'failed', error: 'The write was refused.' });

    expect(last(published).message).toEqual({ type: 'danger', text: 'The write was refused.' });
  });

  it('withdraws the Undo button the moment it is pressed', async () => {
    const { published } = await saveThenUndo({
      kind: 'undone',
      restored: 1,
      skipped: 0,
      actionId: 'action_2',
    });

    expect(published.filter((entry) => entry.action !== undefined)).toHaveLength(1);
    expect(published.map((entry) => entry.message.text)).toContain(
      'Putting the previous values back…',
    );
  });
});

describe('the blast-radius report', () => {
  it('is retracted whenever the draft moves', () => {
    const { rerender } = setup();
    resetReport.mockClear();

    editState.draftPatch = { department: 'Platform' };
    rerender();

    expect(resetReport).toHaveBeenCalled();
  });

  it('is not retracted on a render that leaves the draft alone', () => {
    const { rerender } = setup();
    resetReport.mockClear();

    rerender();

    expect(resetReport).not.toHaveBeenCalled();
  });
});
