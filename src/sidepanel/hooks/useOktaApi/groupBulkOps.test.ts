import { describe, it, expect, vi } from 'vitest';
import { createGroupBulkOperations } from './groupBulkOps';
import type { CoreApi } from './core';
import { makeFakeCore } from '@/test/factories/coreApi';
import type { OktaUser } from './types';
import { OperationCancelledError } from '../../../shared/scheduler/cancellation';
import type { BulkOperation } from '../../../shared/types';

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    makeApiRequest: vi
      .fn()
      .mockResolvedValue({ success: true, data: { profile: { name: 'Group' } } }),
    getCurrentUser: vi.fn().mockResolvedValue({ email: 'admin', id: 'admin' }),
    runOperation: vi.fn(
      async (
        _name: string,
        items: unknown[],
        task: (item: unknown, index: number) => Promise<unknown>,
        options?: { stopOnError?: (error: unknown, item: unknown, index: number) => boolean },
      ) => {
        const results: Array<{
          item: unknown;
          index: number;
          status: string;
          value?: unknown;
          error?: unknown;
        }> = [];
        let completed = 0;
        let failed = 0;
        let halted = false;
        for (let i = 0; i < items.length; i++) {
          if (halted) {
            results.push({ item: items[i], index: i, status: 'skipped' });
            continue;
          }
          try {
            const value = await task(items[i], i);
            results.push({ item: items[i], index: i, status: 'fulfilled', value });
            completed++;
          } catch (error) {
            results.push({ item: items[i], index: i, status: 'rejected', error });
            failed++;
            if (options?.stopOnError?.(error, items[i], i)) halted = true;
          }
        }
        return {
          results,
          total: items.length,
          completed,
          failed,
          skipped: items.length - completed - failed,
          stoppedByError: halted,
          cancelled: false,
        };
      },
    ),
    ...overrides,
  });

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

function bulkOp(
  type: BulkOperation['type'],
  targetGroups: string[],
  config?: BulkOperation['config'],
): BulkOperation {
  return {
    id: 'op1',
    type,
    targetGroups,
    status: 'pending',
    progress: 0,
    results: [],
    config,
  };
}

function user(id: string, status: OktaUser['status']): OktaUser {
  return {
    id,
    status,
    profile: {
      firstName: 'F',
      lastName: 'L',
      login: `${id}@example.okta.com`,
      email: `${id}@example.okta.com`,
    },
  } as OktaUser;
}

describe('executeBulkOperation group-name resolution', () => {
  it('uses the fetched group profile name when present', async () => {
    const core = makeCore({
      makeApiRequest: vi
        .fn()
        .mockResolvedValue({ success: true, data: { profile: { name: 'Engineering' } } }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(removeUserOp(['00gFAKE1']));

    expect(results[0].groupName).toBe('Engineering');
  });

  it('falls back to the group id when the profile name is missing', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(removeUserOp(['00gFAKE1']));

    expect(results[0].groupName).toBe('00gFAKE1');
  });

  it('reports progress per group with the resolved name', async () => {
    const onProgress = vi.fn();
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    await executeBulkOperation(removeUserOp(['00gFAKE1', '00gFAKE2']), onProgress);

    expect(onProgress).toHaveBeenCalledWith(1, 2, 'Group');
    expect(onProgress).toHaveBeenCalledWith(2, 2, 'Group');
  });
});

describe('executeBulkOperation cleanup_inactive', () => {
  it('removes only inactive members and counts them', async () => {
    const members = [
      user('00uFAKEA', 'ACTIVE'),
      user('00uFAKEB', 'DEPROVISIONED'),
      user('00uFAKEC', 'SUSPENDED'),
      user('00uFAKED', 'LOCKED_OUT'),
    ];
    const getAllGroupMembers = vi.fn().mockResolvedValue(members);
    const removeUserFromGroup = vi.fn().mockResolvedValue({ success: true });
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(
      core,
      removeUserFromGroup,
      getAllGroupMembers,
    );

    const results = await executeBulkOperation(bulkOp('cleanup_inactive', ['00gFAKE1']));

    expect(results[0].status).toBe('success');
    expect(results[0].itemsProcessed).toBe(3);
    expect(removeUserFromGroup).toHaveBeenCalledTimes(3);
    const removedIds = removeUserFromGroup.mock.calls.map((c) => (c[2] as OktaUser).id);
    expect(removedIds).not.toContain('00uFAKEA');
  });

  it('processes zero members when none are inactive', async () => {
    const getAllGroupMembers = vi.fn().mockResolvedValue([user('00uFAKEA', 'ACTIVE')]);
    const removeUserFromGroup = vi.fn();
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(
      core,
      removeUserFromGroup,
      getAllGroupMembers,
    );

    const results = await executeBulkOperation(bulkOp('cleanup_inactive', ['00gFAKE1']));

    expect(results[0].itemsProcessed).toBe(0);
    expect(removeUserFromGroup).not.toHaveBeenCalled();
  });

  it('aborts the whole bulk operation when the removal batch is cancelled', async () => {
    const members = [user('00uFAKEB', 'DEPROVISIONED')];
    const getAllGroupMembers = vi.fn().mockResolvedValue(members);
    const cancelledOutcome = {
      results: [{ item: members[0], index: 0, status: 'skipped' as const }],
      total: 1,
      completed: 0,
      failed: 0,
      skipped: 1,
      stoppedByError: false,
      cancelled: true,
    };
    const runOperation = vi
      .fn()
      .mockResolvedValue(cancelledOutcome) as unknown as CoreApi['runOperation'];
    const core = makeCore({ runOperation });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), getAllGroupMembers);

    await expect(
      executeBulkOperation(bulkOp('cleanup_inactive', ['00gFAKE1', '00gFAKE2'])),
    ).rejects.toBeInstanceOf(OperationCancelledError);

    expect(getAllGroupMembers).toHaveBeenCalledTimes(1);
  });

  it('marks the group failed when a removal rejects, and continues to the next group', async () => {
    const members = [user('00uFAKEB', 'DEPROVISIONED')];
    const getAllGroupMembers = vi.fn().mockResolvedValue(members);
    const removeUserFromGroup = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue({ success: true });
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(
      core,
      removeUserFromGroup,
      getAllGroupMembers,
    );

    const results = await executeBulkOperation(
      bulkOp('cleanup_inactive', ['00gFAKE1', '00gFAKE2']),
    );

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe('failed');
    expect(results[0].errors).toEqual(['boom']);
    expect(results[1].status).toBe('success');
  });
});

describe('executeBulkOperation export_all', () => {
  it('attaches the member list and counts it', async () => {
    const members = [user('00uFAKEA', 'ACTIVE'), user('00uFAKEB', 'ACTIVE')];
    const getAllGroupMembers = vi.fn().mockResolvedValue(members);
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), getAllGroupMembers);

    const results = await executeBulkOperation(bulkOp('export_all', ['00gFAKE1']));

    expect(results[0].status).toBe('success');
    expect(results[0].itemsProcessed).toBe(2);
    expect(results[0].members).toEqual(members);
  });

  it('handles an empty member list', async () => {
    const getAllGroupMembers = vi.fn().mockResolvedValue([]);
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), getAllGroupMembers);

    const results = await executeBulkOperation(bulkOp('export_all', ['00gFAKE1']));

    expect(results[0].itemsProcessed).toBe(0);
    expect(results[0].members).toEqual([]);
  });
});

describe('executeBulkOperation remove_user', () => {
  it('issues a DELETE for the configured user and marks success', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockImplementation((_path: string, options?: { method?: string }) => {
        if (options?.method === 'DELETE') return Promise.resolve({ success: true });
        return Promise.resolve({ success: true, data: { profile: { name: 'Group' } } });
      }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(
      bulkOp('remove_user', ['00gFAKE1'], { userId: '00uFAKEU' }),
    );

    expect(results[0].status).toBe('success');
    expect(results[0].itemsProcessed).toBe(1);
    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/groups/00gFAKE1/users/00uFAKEU', {
      method: 'DELETE',
      reason: 'Bulk remove user from group',
    });
  });

  it('marks failed and records the error when the DELETE fails', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockImplementation((_path: string, options?: { method?: string }) => {
        if (options?.method === 'DELETE')
          return Promise.resolve({ success: false, error: 'not allowed' });
        return Promise.resolve({ success: true, data: { profile: { name: 'Group' } } });
      }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(
      bulkOp('remove_user', ['00gFAKE1'], { userId: '00uFAKEU' }),
    );

    expect(results[0].status).toBe('failed');
    expect(results[0].itemsProcessed).toBe(0);
    expect(results[0].errors).toEqual(['not allowed']);
  });

  it('falls back to "Unknown error" when the failed DELETE omits an error', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockImplementation((_path: string, options?: { method?: string }) => {
        if (options?.method === 'DELETE') return Promise.resolve({ success: false });
        return Promise.resolve({ success: true, data: { profile: { name: 'Group' } } });
      }),
    });
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(
      bulkOp('remove_user', ['00gFAKE1'], { userId: '00uFAKEU' }),
    );

    expect(results[0].errors).toEqual(['Unknown error']);
  });

  it('does nothing but succeed when no userId is configured', async () => {
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(bulkOp('remove_user', ['00gFAKE1']));

    expect(results[0].status).toBe('success');
    expect(results[0].itemsProcessed).toBe(0);
    const methods = (core.makeApiRequest as ReturnType<typeof vi.fn>).mock.calls.map(
      (c) => (c[1] as { method?: string } | undefined)?.method,
    );
    expect(methods).not.toContain('DELETE');
  });
});

describe('executeBulkOperation unknown type', () => {
  it('marks the group failed with an unknown-operation error', async () => {
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const op = bulkOp('mystery' as BulkOperation['type'], ['00gFAKE1']);
    const results = await executeBulkOperation(op);

    expect(results[0].status).toBe('failed');
    expect(results[0].errors).toEqual(['Unknown operation type: mystery']);
  });
});

describe('executeBulkOperation empty input', () => {
  it('returns no results and never checks cancellation for an empty group list', async () => {
    const core = makeCore();
    const { executeBulkOperation } = createGroupBulkOperations(core, vi.fn(), vi.fn());

    const results = await executeBulkOperation(removeUserOp([]));

    expect(results).toEqual([]);
    expect(core.checkCancelled).not.toHaveBeenCalled();
  });
});
