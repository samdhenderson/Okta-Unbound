import { vi } from 'vitest';
import type { CoreApi } from '@/sidepanel/hooks/useOktaApi/core';

export const FAKE_ADMIN = { email: 'admin@example.com', id: 'admin' } as const;

export type FakeCoreOverrides = Partial<Omit<CoreApi, 'runOperation'>> & {
  runOperation?: unknown;
};

export function makeFakeCore(overrides: FakeCoreOverrides = {}): CoreApi {
  return {
    targetTabId: 1,
    sendMessage: vi.fn(),
    makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: [], headers: {} }),
    getCurrentUser: vi.fn().mockResolvedValue({ ...FAKE_ADMIN }),
    checkCancelled: vi.fn(),
    resetCancellation: vi.fn(),
    runOperation: vi.fn(),
    callbacks: {},
    ...overrides,
  } as unknown as CoreApi;
}

export function sequentialRunOperation() {
  return vi.fn(
    async (
      _name: string,
      items: unknown[],
      task: (item: unknown, index: number) => Promise<unknown>,
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
      for (let i = 0; i < items.length; i++) {
        try {
          const value = await task(items[i], i);
          results.push({ item: items[i], index: i, status: 'fulfilled', value });
          completed++;
        } catch (error) {
          results.push({ item: items[i], index: i, status: 'rejected', error });
          failed++;
        }
      }
      return {
        results,
        total: items.length,
        completed,
        failed,
        skipped: 0,
        stoppedByError: false,
        cancelled: false,
      };
    },
  );
}
