import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupMerge } from './useGroupMerge';
import { auditStore } from '../../shared/storage/auditStore';
import type { GroupSummary, OktaUser } from '../../shared/types';

vi.mock('../../shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../contexts/ProgressContext', () => ({
  useProgress: () => ({
    startProgress: vi.fn(),
    updateProgress: vi.fn(),
    completeProgress: vi.fn(),
  }),
}));

const api = {
  getAllGroupMembers: vi.fn(),
  getGroupRulesForGroup: vi.fn(),
  getCurrentUser: vi.fn(),
  makeApiRequest: vi.fn(),
  removeUserFromGroup: vi.fn(),
};

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

const mockedAuditStore = vi.mocked(auditStore);

const user1: OktaUser = {
  id: 'u1',
  status: 'ACTIVE',
  profile: { login: 'u1@example.com', email: 'u1@example.com', firstName: 'U', lastName: 'One' },
} as OktaUser;

const survivor: GroupSummary = { id: 'surv', name: 'Survivor' } as GroupSummary;
const source: GroupSummary = { id: 's1', name: 'Source' } as GroupSummary;

async function runMerge() {
  const { result } = renderHook(() => useGroupMerge(1));

  await act(async () => {
    await result.current.preview(survivor, [source]);
  });
  await waitFor(() => expect(result.current.phase).toBe('preview'));

  await act(async () => {
    await result.current.execute();
  });
  await waitFor(() => expect(result.current.phase).toBe('done'));
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
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
