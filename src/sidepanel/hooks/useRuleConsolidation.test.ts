import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRuleConsolidation, type RetireRuleRef } from './useRuleConsolidation';
import { auditStore } from '../../shared/storage/auditStore';
import type { OktaGroupRule } from '../../shared/types';

vi.mock('../../shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../shared/undoManager', () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
}));

const api = {
  getRawGroupRule: vi.fn(),
  createGroupRule: vi.fn(),
  deleteGroupRule: vi.fn(),
  activateGroupRule: vi.fn(),
  deactivateGroupRule: vi.fn(),
  getCurrentUser: vi.fn(),
};

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

const mockedAuditStore = vi.mocked(auditStore);

const rawRule: OktaGroupRule = {
  id: 'r1',
  name: 'Eng',
  type: 'group_rule',
  status: 'ACTIVE',
  conditions: { expression: { value: 'user.department=="Eng"' } },
  actions: { assignUserToGroups: { groupIds: ['g1'] } },
} as OktaGroupRule;

const cluster: RetireRuleRef[] = [{ id: 'r1', name: 'Eng', status: 'ACTIVE' }];

async function runMerge() {
  const { result } = renderHook(() =>
    useRuleConsolidation({
      targetTabId: 1,
      reload: vi.fn().mockResolvedValue(undefined),
      onError: vi.fn(),
    }),
  );

  act(() => {
    result.current.openMerge('r1', cluster, ['g1', 'g2']);
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
  api.getRawGroupRule.mockResolvedValue(rawRule);
  api.createGroupRule.mockResolvedValue({
    success: true,
    rule: { id: 'new', name: 'Eng (consolidated)' },
  });
  api.activateGroupRule.mockResolvedValue({ success: true });
  api.deactivateGroupRule.mockResolvedValue({ success: true });
  api.deleteGroupRule.mockResolvedValue({ success: true });
  api.getCurrentUser.mockResolvedValue({
    kind: 'resolved',
    email: 'admin@example.com',
    id: '00uFAKEADMIN',
  });
  mockedAuditStore.logOperation.mockResolvedValue(undefined);
});

describe('useRuleConsolidation audit attribution', () => {
  it('records the real signed-in admin as performedBy', async () => {
    await runMerge();

    expect(mockedAuditStore.logOperation).toHaveBeenCalledTimes(1);
    const entry = mockedAuditStore.logOperation.mock.calls[0][0];
    expect(entry.performedBy).toBe('admin@example.com');
    expect(entry.actorResolution).toBe('resolved');
    expect(api.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('records no actor, and still consolidates, when the lookup comes back unavailable', async () => {
    api.getCurrentUser.mockResolvedValue({ kind: 'unavailable', reason: 'threw' });

    const result = await runMerge();

    const entry = mockedAuditStore.logOperation.mock.calls[0][0];
    expect(entry.performedBy).toBeNull();
    expect(entry.actorResolution).toBe('unavailable');
    expect(result.current.phase).toBe('done');
  });
});
