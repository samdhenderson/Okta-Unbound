import { describe, it, expect, vi } from 'vitest';
import { createGroupMemberOperations } from './groupMembers';
import type { CoreApi } from './core';
import { makeFakeCore } from '@/test/factories/coreApi';

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi => makeFakeCore(overrides);

const validMember = {
  id: '00uFAKE1',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Fake',
  },
};

describe('getAllGroupMembers boundary validation', () => {
  it('drops malformed member rows leniently instead of failing the fetch', async () => {
    const malformed = { id: '00uFAKE2', status: 'ACTIVE' };
    const makeApiRequest = vi.fn().mockResolvedValue({
      success: true,
      data: [validMember, malformed],
      headers: {},
    });
    const core = makeCore({ makeApiRequest });
    const { getAllGroupMembers } = createGroupMemberOperations(core);

    const members = await getAllGroupMembers('00gFAKE1');

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/groups/00gFAKE1/users?limit=200&expand=group-rules',
    );
    expect(members.map((m) => m.id)).toEqual(['00uFAKE1']);
  });
});

describe('getAllGroupMembers rule attribution', () => {
  function nextLink(path: string): string {
    return `<https://example.okta.com${path}>; rel="next"`;
  }

  it('requests expand=group-rules and preserves the embed on the row', async () => {
    const embedded = { 'group-rules': [{ id: '0prFAKE1', name: 'Eng feeder' }] };
    const makeApiRequest = vi.fn().mockResolvedValue({
      success: true,
      data: [{ ...validMember, _embedded: embedded }],
      headers: {},
    });
    const { getAllGroupMembers } = createGroupMemberOperations(makeCore({ makeApiRequest }));

    const members = await getAllGroupMembers('00gFAKE1');

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/groups/00gFAKE1/users?limit=200&expand=group-rules',
    );
    expect(members[0]).toMatchObject({ _embedded: embedded });
  });

  it('re-applies the dropped expand on every page after the first', async () => {
    const page1 = '/api/v1/groups/00gFAKE1/users?limit=200&expand=group-rules';
    const droppedNext = '/api/v1/groups/00gFAKE1/users?limit=200&after=cursor2';
    const makeApiRequest = vi.fn(async (url: string) => {
      const headers: Record<string, string> = url === page1 ? { link: nextLink(droppedNext) } : {};
      const data = url === page1 ? [validMember] : [{ ...validMember, id: '00uFAKE2' }];
      return { success: true, data, headers };
    });
    const { getAllGroupMembers } = createGroupMemberOperations(makeCore({ makeApiRequest }));

    const members = await getAllGroupMembers('00gFAKE1');

    expect(makeApiRequest).toHaveBeenNthCalledWith(2, `${droppedNext}&expand=group-rules`);
    expect(members.map((m) => m.id)).toEqual(['00uFAKE1', '00uFAKE2']);
  });
});
