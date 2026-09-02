import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupMerge } from './useGroupMerge';
import { auditStore } from '../../shared/storage/auditStore';
import { logAction } from '../../shared/undoManager';
import { runBatch, type BatchProgress } from '../../shared/scheduler/runBatch';
import { createCancellation } from '../../shared/scheduler/cancellation';
import type { GroupSummary, OktaUser } from '../../shared/types';

vi.mock('../../shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

const progressMock = vi.hoisted(() => {
  const log: Array<{
    kind: 'start' | 'tick' | 'complete';
    total?: number;
    current?: number;
    message?: string;
  }> = [];
  return {
    log,
    ctx: {
      startProgress: vi.fn((_name: string, message: string, total?: number) => {
        log.push({ kind: 'start', total, message });
      }),
      updateProgress: vi.fn((current: number, total?: number, message?: string) => {
        log.push({ kind: 'tick', current, total, message });
      }),
      updateBatch: vi.fn((p: BatchProgress, message?: string) => {
        log.push({ kind: 'tick', current: p.completed + p.failed, total: p.total, message });
      }),
      completeProgress: vi.fn(() => {
        log.push({ kind: 'complete' });
      }),
    },
  };
});

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: () => progressMock.ctx,
}));

const cancellation = createCancellation();

interface FakeRunOperationOptions<T> {
  concurrency?: number;
  stopOnError?: (error: unknown, item: T, index: number) => boolean;
  message?: (progress: BatchProgress) => string;
  plan?: { endpoint: string; method?: string };
}

const fakeRunOperation = vi.fn(
  async <T, R>(
    name: string,
    items: T[],
    task: (item: T, index: number, planId?: string) => Promise<R>,
    options: FakeRunOperationOptions<T> = {},
  ) => {
    cancellation.reset();
    progressMock.ctx.startProgress(name, `${name}…`, items.length);
    try {
      const planId = options.plan ? 'fake-plan' : undefined;
      return await runBatch(items, (item, index) => task(item, index, planId), {
        concurrency: options.concurrency,
        stopOnError: options.stopOnError,
        throwIfCancelled: () => cancellation.throwIfCancelled(),
        onProgress: (p) => progressMock.ctx.updateBatch(p, options.message?.(p)),
      });
    } finally {
      progressMock.ctx.completeProgress();
    }
  },
);

const api = {
  getAllGroupMembers: vi.fn(),
  getGroupRulesForGroup: vi.fn(),
  getCurrentUser: vi.fn(),
  makeApiRequest: vi.fn(),
  removeUserFromGroup: vi.fn(),
  runOperation: fakeRunOperation,
};

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

const mockedAuditStore = vi.mocked(auditStore);
const mockedLogAction = vi.mocked(logAction);

const user1: OktaUser = {
  id: 'u1',
  status: 'ACTIVE',
  profile: { login: 'u1@example.com', email: 'u1@example.com', firstName: 'U', lastName: 'One' },
} as OktaUser;

const user2: OktaUser = {
  id: 'u2',
  status: 'ACTIVE',
  profile: { login: 'u2@example.com', email: 'u2@example.com', firstName: 'U', lastName: 'Two' },
} as OktaUser;

const survivor: GroupSummary = { id: 'surv', name: 'Survivor' } as GroupSummary;
const source: GroupSummary = { id: 's1', name: 'Source' } as GroupSummary;

async function previewThenExecute() {
  const { result } = renderHook(() => useGroupMerge(1));

  await act(async () => {
    await result.current.preview(survivor, [source]);
  });
  await waitFor(() => expect(result.current.phase).toBe('preview'));

  await act(async () => {
    await result.current.execute();
  });
  return result;
}

async function runMerge() {
  const result = await previewThenExecute();
  await waitFor(() => expect(result.current.phase).toBe('done'));
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  progressMock.log.length = 0;
  cancellation.reset();
  api.getAllGroupMembers.mockImplementation(async (id: string) => (id === 's1' ? [user1] : []));
  api.getGroupRulesForGroup.mockResolvedValue([]);
  api.removeUserFromGroup.mockResolvedValue({ success: true });
  api.getCurrentUser.mockResolvedValue({
    kind: 'resolved',
    email: 'admin@example.com',
    id: '00uFAKEADMIN',
  });
  api.makeApiRequest.mockResolvedValue({ success: true });
  mockedAuditStore.logOperation.mockResolvedValue(undefined);
});

describe('useGroupMerge audit attribution', () => {
  it('records the real signed-in admin as performedBy on both entries', async () => {
    await runMerge();

    expect(mockedAuditStore.logOperation).toHaveBeenCalledTimes(2);
    for (const [entry] of mockedAuditStore.logOperation.mock.calls) {
      expect(entry.performedBy).toBe('admin@example.com');
      expect(entry.actorResolution).toBe('resolved');
    }
    expect(api.getCurrentUser).toHaveBeenCalledTimes(1);
    for (const [path] of api.makeApiRequest.mock.calls) {
      expect(path).not.toBe('/api/v1/users/me');
    }
  });

  it('records no actor on either entry, and still merges, when the lookup comes back unavailable', async () => {
    api.getCurrentUser.mockResolvedValue({ kind: 'unavailable', reason: 'threw' });

    const result = await runMerge();

    expect(mockedAuditStore.logOperation).toHaveBeenCalledTimes(2);
    for (const [entry] of mockedAuditStore.logOperation.mock.calls) {
      expect(entry.performedBy).toBeNull();
      expect(entry.actorResolution).toBe('unavailable');
    }
    expect(result.current.phase).toBe('done');
  });
});

describe('useGroupMerge actor-unavailable notice', () => {
  const NOTICE_TEXT =
    "Couldn't confirm your signed-in identity. This action will be recorded without an actor.";

  it('raises the notice and still merges when the actor is unavailable', async () => {
    api.getCurrentUser.mockResolvedValue({ kind: 'unavailable', reason: 'no-email' });

    const result = await runMerge();

    expect(result.current.actorNotice).toEqual({ text: NOTICE_TEXT, type: 'warning' });
    expect(api.makeApiRequest).toHaveBeenCalledTimes(1);
    expect(api.removeUserFromGroup).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe('done');
    expect(result.current.results).toEqual({
      copied: 1,
      copyFailed: 0,
      removed: 1,
      removeFailed: 0,
    });
  });

  it('raises no notice when the actor resolved', async () => {
    const result = await runMerge();

    expect(result.current.actorNotice).toBeNull();
  });

  it('clears the notice when the wizard is reset', async () => {
    api.getCurrentUser.mockResolvedValue({ kind: 'unavailable', reason: 'failed' });

    const result = await runMerge();
    expect(result.current.actorNotice).not.toBeNull();

    act(() => {
      result.current.reset();
    });
    expect(result.current.actorNotice).toBeNull();
  });
});

describe('useGroupMerge progress, undo bookkeeping and failure paths', () => {
  beforeEach(() => {
    api.getAllGroupMembers.mockImplementation(async (id: string) =>
      id === 's1' ? [user1, user2] : [],
    );
  });

  it('copies every distinct source member into the survivor, then empties the source', async () => {
    const result = await runMerge();

    expect(api.makeApiRequest).toHaveBeenCalledTimes(2);
    expect(api.makeApiRequest).toHaveBeenNthCalledWith(
      1,
      '/api/v1/groups/surv/users/u1',
      expect.objectContaining({
        method: 'PUT',
        reason: 'Merge groups: copy member into survivor',
      }),
    );
    expect(api.makeApiRequest).toHaveBeenNthCalledWith(
      2,
      '/api/v1/groups/surv/users/u2',
      expect.objectContaining({ method: 'PUT' }),
    );

    expect(api.removeUserFromGroup).toHaveBeenCalledTimes(2);
    expect(api.removeUserFromGroup).toHaveBeenCalledWith('s1', 'Source', user1, true, 'fake-plan');
    expect(api.removeUserFromGroup).toHaveBeenCalledWith('s1', 'Source', user2, true, 'fake-plan');

    expect(result.current.results).toEqual({
      copied: 2,
      copyFailed: 0,
      removed: 2,
      removeFailed: 0,
    });
  });

  it('logs one bulk-add undo for the survivor and one bulk-remove undo per source', async () => {
    await runMerge();

    expect(mockedLogAction).toHaveBeenCalledTimes(2);
    expect(mockedLogAction).toHaveBeenNthCalledWith(1, 'Merged 2 members into Survivor', {
      type: 'BULK_ADD_USERS_TO_GROUP',
      users: [
        { userId: 'u1', userEmail: 'u1@example.com', userName: 'U One' },
        { userId: 'u2', userEmail: 'u2@example.com', userName: 'U Two' },
      ],
      groupId: 'surv',
      groupName: 'Survivor',
    });
    expect(mockedLogAction).toHaveBeenNthCalledWith(
      2,
      'Emptied 2 members from Source (merge into Survivor)',
      {
        type: 'BULK_REMOVE_USERS_FROM_GROUP',
        users: [
          { userId: 'u1', userEmail: 'u1@example.com', userName: 'U One' },
          { userId: 'u2', userEmail: 'u2@example.com', userName: 'U Two' },
        ],
        groupId: 's1',
        groupName: 'Source',
        operationType: 'custom_status',
      },
    );
  });

  it('records only the users that actually landed in each undo entry', async () => {
    api.makeApiRequest.mockImplementation(async (endpoint: string) =>
      endpoint.endsWith('/u2') ? { success: false, error: 'nope' } : { success: true },
    );
    api.removeUserFromGroup.mockImplementation(async (_g: string, _n: string, user: OktaUser) =>
      user.id === 'u1' ? { success: false, error: 'nope' } : { success: true },
    );

    const result = await runMerge();

    expect(result.current.results).toEqual({
      copied: 1,
      copyFailed: 1,
      removed: 1,
      removeFailed: 1,
    });
    expect(mockedLogAction).toHaveBeenNthCalledWith(
      1,
      'Merged 1 member into Survivor',
      expect.objectContaining({
        users: [{ userId: 'u1', userEmail: 'u1@example.com', userName: 'U One' }],
      }),
    );
    expect(mockedLogAction).toHaveBeenNthCalledWith(
      2,
      'Emptied 1 member from Source (merge into Survivor)',
      expect.objectContaining({
        users: [{ userId: 'u2', userEmail: 'u2@example.com', userName: 'U Two' }],
      }),
    );

    const [[addEntry], [removeEntry]] = mockedAuditStore.logOperation.mock.calls;
    expect(addEntry.result).toBe('partial');
    expect(addEntry.details).toMatchObject({
      usersSucceeded: 1,
      usersFailed: 1,
      apiRequestCount: 2,
    });
    expect(removeEntry.result).toBe('partial');
    expect(removeEntry.details).toMatchObject({
      usersSucceeded: 1,
      usersFailed: 1,
      apiRequestCount: 2,
    });
  });

  it('logs no undo entry for a leg in which nothing succeeded', async () => {
    api.makeApiRequest.mockResolvedValue({ success: false, error: 'nope' });

    const result = await runMerge();

    expect(api.removeUserFromGroup).toHaveBeenCalledTimes(2);
    expect(result.current.results).toEqual({
      copied: 0,
      copyFailed: 2,
      removed: 2,
      removeFailed: 0,
    });
    expect(mockedLogAction).toHaveBeenCalledTimes(1);
    expect(mockedLogAction).toHaveBeenCalledWith(
      'Emptied 2 members from Source (merge into Survivor)',
      expect.objectContaining({ type: 'BULK_REMOVE_USERS_FROM_GROUP' }),
    );
    const [[addEntry]] = mockedAuditStore.logOperation.mock.calls;
    expect(addEntry.result).toBe('failed');
  });

  it('reports live progress across both legs and clears the bar when it ends', async () => {
    await runMerge();

    const ticks = progressMock.log.filter((e) => e.kind === 'tick');
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    const messages = ticks.map((t) => t.message);
    expect(messages).toContain('Copied 2/2 into Survivor');
    expect(messages).toContain('Emptying Source…');
    const lastTick = ticks.at(-1);
    expect(lastTick?.current).toBe(lastTick?.total);
    expect(progressMock.log.at(-1)).toEqual({ kind: 'complete' });
  });

  it('aborts the merge when a write throws, keeping the partial counts', async () => {
    api.makeApiRequest.mockImplementation(async (endpoint: string) => {
      if (endpoint.endsWith('/u2')) throw new Error('No target tab ID');
      return { success: true };
    });

    const result = await previewThenExecute();
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(result.current.error).toBe('No target tab ID');
    expect(result.current.results).toMatchObject({ copied: 1, removed: 0 });
    expect(api.removeUserFromGroup).not.toHaveBeenCalled();
    expect(mockedAuditStore.logOperation).not.toHaveBeenCalled();
    expect(progressMock.log.at(-1)).toEqual({ kind: 'complete' });
  });

  it('does nothing when the plan is blocked by an active feeding rule', async () => {
    api.getGroupRulesForGroup.mockResolvedValue([{ name: 'Feeds Source', status: 'ACTIVE' }]);

    const { result } = renderHook(() => useGroupMerge(1));
    await act(async () => {
      await result.current.preview(survivor, [source]);
    });
    await waitFor(() => expect(result.current.plan?.blocked).toBe(true));
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.phase).toBe('preview');
    expect(api.makeApiRequest).not.toHaveBeenCalled();
    expect(api.removeUserFromGroup).not.toHaveBeenCalled();
    expect(mockedLogAction).not.toHaveBeenCalled();
  });
});

describe('useGroupMerge runs its writes as tracked operations (D-034)', () => {
  beforeEach(() => {
    api.getAllGroupMembers.mockImplementation(async (id: string) =>
      id === 's1' ? [user1, user2] : [],
    );
  });

  it('declares the copy leg as one operation with its PUT budget', async () => {
    await runMerge();

    expect(fakeRunOperation).toHaveBeenCalledWith(
      'Merging groups',
      [user1, user2],
      expect.any(Function),
      expect.objectContaining({
        plan: { endpoint: '/api/v1/groups', method: 'PUT' },
      }),
    );
    for (const [, options] of api.makeApiRequest.mock.calls) {
      expect(options.planId).toBe('fake-plan');
    }
  });

  it('declares the emptying leg as one operation with its DELETE budget', async () => {
    await runMerge();

    expect(fakeRunOperation).toHaveBeenCalledWith(
      'Merging groups',
      [user1, user2],
      expect.any(Function),
      expect.objectContaining({
        plan: { endpoint: '/api/v1/groups', method: 'DELETE' },
      }),
    );
  });

  it('abandons a merge in flight when the admin cancels, keeping what already landed', async () => {
    const members: OktaUser[] = Array.from(
      { length: 8 },
      (_, i) =>
        ({
          id: `u${i}`,
          status: 'ACTIVE',
          profile: {
            login: `u${i}@example.com`,
            email: `u${i}@example.com`,
            firstName: 'U',
            lastName: `${i}`,
          },
        }) as OktaUser,
    );
    api.getAllGroupMembers.mockImplementation(async (id: string) => (id === 's1' ? members : []));
    api.makeApiRequest.mockImplementation(async () => {
      cancellation.cancel();
      return { success: true };
    });

    const result = await previewThenExecute();
    await waitFor(() => expect(result.current.phase).toBe('error'));

    expect(api.makeApiRequest.mock.calls.length).toBeLessThan(8);
    expect(result.current.error).toBe('Merge cancelled. The source groups were not emptied.');
    expect(api.removeUserFromGroup).not.toHaveBeenCalled();

    const copied = api.makeApiRequest.mock.calls.length;
    expect(result.current.results).toEqual({
      copied,
      copyFailed: 0,
      removed: 0,
      removeFailed: 0,
    });
    expect(mockedLogAction).toHaveBeenCalledTimes(1);
    const [[, undoEntry]] = mockedLogAction.mock.calls;
    expect(undoEntry).toMatchObject({ type: 'BULK_ADD_USERS_TO_GROUP', groupId: 'surv' });
    expect((undoEntry as { users: unknown[] }).users).toHaveLength(copied);
    expect(mockedAuditStore.logOperation).toHaveBeenCalledTimes(2);
    const [[addEntry], [removeEntry]] = mockedAuditStore.logOperation.mock.calls;
    expect(addEntry.details).toMatchObject({ usersSucceeded: copied, usersFailed: 0 });
    expect(removeEntry.details).toMatchObject({ usersSucceeded: 0, usersFailed: 0 });

    expect(progressMock.log.at(-1)).toEqual({ kind: 'complete' });
  });
});
