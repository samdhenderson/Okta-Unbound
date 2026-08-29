import { describe, it, expect, vi } from 'vitest';
import { createGroupCleanupOperations } from './groupCleanup';
import type { CoreApi } from './core';
import type { RequestResult } from '@/shared/scheduler/types';
import { makeFakeCore } from '@/test/factories/coreApi';

vi.mock('../../../shared/undoManager', () => ({
  logBulkRemoveAction: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    runOperation: vi.fn(
      async (_name, items: unknown[], task: (item: unknown, index: number) => unknown) => {
        const results: Array<{ status: string; item: unknown; error?: unknown }> = [];
        let completed = 0;
        let failed = 0;
        for (let i = 0; i < items.length; i++) {
          try {
            await task(items[i], i);
            results.push({ status: 'fulfilled', item: items[i] });
            completed++;
          } catch (error) {
            results.push({ status: 'rejected', item: items[i], error });
            failed++;
          }
        }
        return { results, completed, failed, cancelled: false, stoppedByError: false };
      },
    ),
    ...overrides,
  });

const deprovisionedMember = {
  id: '00uFAKE1',
  status: 'DEPROVISIONED',
  profile: {
    login: 'gone@example.com',
    email: 'gone@example.com',
    firstName: 'Gone',
    lastName: 'Fake',
  },
};

describe('removeDeprovisioned boundary validation', () => {
  it('drops malformed member rows leniently so only validated members are removed', async () => {
    const malformedDeprovisioned = { id: '00uFAKE2', status: 'DEPROVISIONED' };
    const makeApiRequest = vi.fn(async (endpoint: string): Promise<RequestResult> => {
      if (endpoint === '/api/v1/groups/00gFAKE1') {
        return { success: true, data: { type: 'OKTA_GROUP', profile: { name: 'Fake Group' } } };
      }
      if (endpoint.startsWith('/api/v1/groups/00gFAKE1/users')) {
        return {
          success: true,
          data: [deprovisionedMember, malformedDeprovisioned],
          headers: {},
        };
      }
      throw new Error(`Unrouted test endpoint: ${endpoint}`);
    });
    const core = makeCore({ makeApiRequest });
    const removeUserFromGroup = vi.fn().mockResolvedValue({ success: true });
    const { removeDeprovisioned } = createGroupCleanupOperations(core, removeUserFromGroup);

    await removeDeprovisioned('00gFAKE1');

    expect(removeUserFromGroup).toHaveBeenCalledTimes(1);
    expect(removeUserFromGroup).toHaveBeenCalledWith(
      '00gFAKE1',
      'Fake Group',
      expect.objectContaining({ id: '00uFAKE1' }),
      true,
    );
  });
});
