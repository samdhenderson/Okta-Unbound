import { describe, it, expect, vi } from 'vitest';
import { createGroupBulkOperations } from './groupBulkOps';
import type { CoreApi } from './core';
import { OperationCancelledError } from '../../../shared/scheduler/cancellation';
import type { BulkOperation } from '../../../shared/types';

function makeCore(overrides: Partial<CoreApi> = {}): CoreApi {
  return {
    targetTabId: 1,
    sendMessage: vi.fn(),
    makeApiRequest: vi
      .fn()
      .mockResolvedValue({ success: true, data: { profile: { name: 'Group' } } }),
    getCurrentUser: vi.fn().mockResolvedValue({ email: 'admin', id: 'admin' }),
    checkCancelled: vi.fn(),
    resetCancellation: vi.fn(),
    runOperation: vi.fn(),
    callbacks: {},
    ...overrides,
  } as CoreApi;
}

function removeUserOp(targetGroups: string[]): BulkOperation {
  return {
    id: 'op1',
    type: 'remove_user',
    targetGroups,
    status: 'pending',
    progress: 0,
    results: [],
    config: { userId: 'u1' },
  };
}

describe('executeBulkOperation cancellation', () => {
  it('processes every group when never cancelled', async () => {
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(removeUserOp(['g1', 'g2']));

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.groupId)).toEqual(['g1', 'g2']);
    expect(core.checkCancelled).toHaveBeenCalled();
  });

  it('stops issuing requests for later groups once cancellation trips', async () => {
    let checks = 0;
    const core = makeCore({
      checkCancelled: vi.fn(() => {
        checks += 1;
        if (checks >= 2) throw new OperationCancelledError();
      }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    await expect(executeBulkOperation(removeUserOp(['g1', 'g2', 'g3']))).rejects.toBeInstanceOf(
      OperationCancelledError,
    );

    const paths = (core.makeApiRequest as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(paths.some((p: string) => p.includes('g1'))).toBe(true);
    expect(paths.some((p: string) => p.includes('g2'))).toBe(false);
    expect(paths.some((p: string) => p.includes('g3'))).toBe(false);
  });

  it('propagates an OperationCancelledError raised mid-group instead of marking it failed', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockRejectedValue(new OperationCancelledError()),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    await expect(executeBulkOperation(removeUserOp(['g1', 'g2']))).rejects.toBeInstanceOf(
      OperationCancelledError,
    );
  });

  it('still captures an ordinary per-group error and continues to the next group', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockImplementation((path: string) => {
        if (path.includes('g1')) return Promise.reject(new Error('boom'));
        return Promise.resolve({ success: true, data: { profile: { name: 'Group' } } });
      }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(removeUserOp(['g1', 'g2']));

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('failed');
    expect(results[1].groupId).toBe('g2');
  });
});
