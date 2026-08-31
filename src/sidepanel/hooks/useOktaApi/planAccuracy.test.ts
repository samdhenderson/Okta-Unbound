import { describe, it, expect, vi } from 'vitest';
import { createExportEngineOperations } from './exportEngine';
import { createGroupMemberOperations } from './groupMembers';
import { makeFakeCore } from '@/test/factories/coreApi';
import type { PlanEstimate, PlanLegInput } from '@/shared/scheduler/plan';
import type { EntityExport } from '@/sidepanel/export/types';
import type { RequestResult } from '@/shared/scheduler/types';
import { z } from 'zod';

vi.mock('@/shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

function recordingWithPlan() {
  const state = {
    legs: [] as PlanLegInput[],
    refinements: [] as PlanEstimate[],
    finalEstimate(): PlanEstimate | undefined {
      return this.refinements.at(-1) ?? this.legs[0]?.estimate;
    },
  };

  const withPlan = vi.fn(
    async (
      _name: string,
      legs: PlanLegInput[],
      run: (handle: { planId: string; refine: (e: string, x: PlanEstimate) => void }) => unknown,
    ) => {
      state.legs = legs;
      return run({
        planId: 'plan-under-test',
        refine: (_endpoint, estimate) => state.refinements.push(estimate),
      });
    },
  );

  return { withPlan, state };
}

function nextLink(path: string): string {
  return `<https://example.okta.com${path}>; rel="next"`;
}

function paginatingTransport(pageCount: number, rowsPerPage: number, row: () => unknown) {
  const calls: string[] = [];
  const makeApiRequest = vi.fn(async (url: string, _options?: unknown): Promise<RequestResult> => {
    calls.push(url);
    const pageIndex = calls.length;
    const hasMore = pageIndex < pageCount;
    return {
      success: true,
      data: Array.from({ length: rowsPerPage }, row),
      headers: hasMore ? { link: nextLink(`/next?after=cursor${pageIndex}`) } : {},
    };
  });
  return { makeApiRequest, calls };
}

describe('export walk: declared cost matches spent cost', () => {
  const descriptor = {
    id: 'users',
    displayName: 'Users',
    schema: z.object({ id: z.string() }),
    columnCatalog: [],
  } as unknown as EntityExport<{ id: string }>;

  it.each([
    ['a single page', 1],
    ['two pages', 2],
    ['six pages', 6],
  ])('settles on an exact count matching the requests issued — %s', async (_label, pages) => {
    const { makeApiRequest, calls } = paginatingTransport(pages, 200, () => ({ id: '00uFAKE1' }));
    const { withPlan, state } = recordingWithPlan();
    const core = makeFakeCore({ makeApiRequest, withPlan });

    const result = await createExportEngineOperations(core).fetchAllRows(
      descriptor,
      '/api/v1/users?limit=200',
    );

    expect(calls).toHaveLength(pages);
    expect(state.finalEstimate()).toEqual({ kind: 'exact', requests: pages });
    expect(result.rows).toHaveLength(pages * 200);
  });

  it('opens at a floor of one page before anything is known', async () => {
    const { makeApiRequest } = paginatingTransport(3, 200, () => ({ id: '00uFAKE1' }));
    const { withPlan, state } = recordingWithPlan();

    await createExportEngineOperations(makeFakeCore({ makeApiRequest, withPlan })).fetchAllRows(
      descriptor,
      '/api/v1/users?limit=200',
    );

    expect(state.legs[0].estimate).toEqual({ kind: 'atLeast', requests: 1 });
  });

  it('raises the floor page by page rather than jumping to a guessed total', async () => {
    const { makeApiRequest } = paginatingTransport(3, 200, () => ({ id: '00uFAKE1' }));
    const { withPlan, state } = recordingWithPlan();

    await createExportEngineOperations(makeFakeCore({ makeApiRequest, withPlan })).fetchAllRows(
      descriptor,
      '/api/v1/users?limit=200',
    );

    expect(state.refinements).toEqual([
      { kind: 'atLeast', requests: 2 },
      { kind: 'atLeast', requests: 3 },
      { kind: 'exact', requests: 3 },
    ]);
  });

  it('stops promising pages the row cap just cancelled', async () => {
    const capped = { ...descriptor, maxRows: 200 } as unknown as EntityExport<{ id: string }>;
    const { makeApiRequest, calls } = paginatingTransport(5, 200, () => ({ id: '00uFAKE1' }));
    const { withPlan, state } = recordingWithPlan();

    const result = await createExportEngineOperations(
      makeFakeCore({ makeApiRequest, withPlan }),
    ).fetchAllRows(capped, '/api/v1/users?limit=200');

    expect(result.capped).toBe(true);
    expect(calls).toHaveLength(1);
    expect(state.finalEstimate()).toEqual({ kind: 'exact', requests: 1 });
  });

  it('attributes every page to the plan, not just the first', async () => {
    const { makeApiRequest } = paginatingTransport(4, 200, () => ({ id: '00uFAKE1' }));
    const { withPlan } = recordingWithPlan();

    await createExportEngineOperations(makeFakeCore({ makeApiRequest, withPlan })).fetchAllRows(
      descriptor,
      '/api/v1/users?limit=200',
    );

    expect(makeApiRequest).toHaveBeenCalledTimes(4);
    for (const call of makeApiRequest.mock.calls) {
      expect(call[1]).toMatchObject({ planId: 'plan-under-test' });
    }
  });
});

describe('group member walk: a free member count prices the walk exactly', () => {
  const member = () => ({
    id: '00uFAKE1',
    status: 'ACTIVE',
    profile: {
      login: 'ada@example.com',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Fake',
    },
  });

  it.each([
    ['200 members', 200, 1],
    ['201 members', 201, 2],
    ['1000 members', 1000, 5],
    ['an empty group', 0, 1],
  ])(
    'declares the exact page count from the expand=stats total — %s',
    async (_label, memberCount, expectedPages) => {
      const { makeApiRequest } = paginatingTransport(expectedPages, 200, member);
      const { withPlan, state } = recordingWithPlan();

      await createGroupMemberOperations(
        makeFakeCore({ makeApiRequest, withPlan }),
      ).getAllGroupMembers('00gFAKE1', { memberCount });

      expect(state.legs[0].estimate).toEqual({ kind: 'exact', requests: expectedPages });
      expect(makeApiRequest).toHaveBeenCalledTimes(expectedPages);
    },
  );

  it('falls back to a floor when no member count was supplied', async () => {
    const { makeApiRequest } = paginatingTransport(1, 200, member);
    const { withPlan, state } = recordingWithPlan();

    await createGroupMemberOperations(
      makeFakeCore({ makeApiRequest, withPlan }),
    ).getAllGroupMembers('00gFAKE1');

    expect(state.legs[0].estimate).toEqual({ kind: 'atLeast', requests: 1 });
  });

  it('joins a caller-s plan instead of opening a second one', async () => {
    const { makeApiRequest } = paginatingTransport(1, 200, member);
    const { withPlan } = recordingWithPlan();

    await createGroupMemberOperations(
      makeFakeCore({ makeApiRequest, withPlan }),
    ).getAllGroupMembers('00gFAKE1', { planId: 'callers-plan' });

    expect(withPlan).not.toHaveBeenCalled();
    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ planId: 'callers-plan' }),
    );
  });

  it('spends no probe request to learn what it declares', async () => {
    const { makeApiRequest } = paginatingTransport(1, 200, member);
    const { withPlan } = recordingWithPlan();

    await createGroupMemberOperations(
      makeFakeCore({ makeApiRequest, withPlan }),
    ).getAllGroupMembers('00gFAKE1', { memberCount: 200 });

    expect(makeApiRequest).toHaveBeenCalledTimes(1);
  });
});
