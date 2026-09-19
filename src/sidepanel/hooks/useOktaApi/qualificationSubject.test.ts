import { describe, it, expect, vi } from 'vitest';
import { createQualificationSubjectOperations } from './qualificationSubject';
import { makeFakeCore } from '@/test/factories/coreApi';
import type { OktaUser } from '../../../shared/types';
import type { RequestResult } from '../../../shared/scheduler/types';

const USER_ID = '00uFAKESUBJECT';

const user: OktaUser = {
  id: USER_ID,
  status: 'ACTIVE',
  profile: {
    login: 'subject@example.com',
    email: 'subject@example.com',
    firstName: 'Sub',
    lastName: 'Ject',
  },
};

const group = (id: string) => ({ id, type: 'OKTA_GROUP', profile: { name: `Group ${id}` } });

const page = (data: unknown, link?: string): RequestResult =>
  ({ success: true, data, headers: link ? { link } : undefined }) as RequestResult;

const NEXT = `<https://acme.okta.com/api/v1/users/${USER_ID}/groups?after=CURSOR&limit=200>; rel="next"`;

function planSpy() {
  const refine = vi.fn();
  const withPlan = vi.fn(
    async (_name: string, _legs: unknown, run: (handle: unknown) => Promise<unknown>) =>
      run({ planId: 'plan-1', refine }),
  );
  return { withPlan, refine };
}

describe('loadQualificationSubject', () => {
  it('declares one two-leg plan and loads user then groups under it', async () => {
    const { withPlan, refine } = planSpy();
    const makeApiRequest = vi.fn().mockResolvedValueOnce(page([group('g1')]));
    const core = makeFakeCore({ withPlan, makeApiRequest });
    const getUserRaw = vi.fn().mockResolvedValue(user);

    const result = await createQualificationSubjectOperations(
      core,
      getUserRaw,
    ).loadQualificationSubject(USER_ID);

    expect(withPlan).toHaveBeenCalledTimes(1);
    const [, legs] = withPlan.mock.calls[0];
    expect(legs).toHaveLength(2);
    expect(getUserRaw).toHaveBeenCalledWith(USER_ID, expect.objectContaining({ planId: 'plan-1' }));
    expect(makeApiRequest).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/users/${USER_ID}/groups`),
      expect.objectContaining({ planId: 'plan-1' }),
    );
    expect(refine).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, user, groups: [group('g1')] });
  });

  it('refines the walk once per page', async () => {
    const { withPlan, refine } = planSpy();
    const makeApiRequest = vi
      .fn()
      .mockResolvedValueOnce(page([group('g1')], NEXT))
      .mockResolvedValueOnce(page([group('g2')]));
    const core = makeFakeCore({ withPlan, makeApiRequest });

    const result = await createQualificationSubjectOperations(
      core,
      vi.fn().mockResolvedValue(user),
    ).loadQualificationSubject(USER_ID);

    expect(refine).toHaveBeenCalledTimes(2);
    expect(result.ok && result.groups.map((g) => g.id)).toEqual(['g1', 'g2']);
  });

  it('reports user-not-found and never walks the groups', async () => {
    const { withPlan } = planSpy();
    const makeApiRequest = vi.fn();
    const core = makeFakeCore({ withPlan, makeApiRequest });

    const result = await createQualificationSubjectOperations(
      core,
      vi.fn().mockResolvedValue(null),
    ).loadQualificationSubject(USER_ID);

    expect(result).toEqual({ ok: false, reason: 'user-not-found' });
    expect(makeApiRequest).not.toHaveBeenCalled();
  });

  it('reports groups-failed without leaking the user', async () => {
    const { withPlan } = planSpy();
    const makeApiRequest = vi.fn().mockResolvedValue({ success: false, error: 'boom' });
    const core = makeFakeCore({ withPlan, makeApiRequest });

    const result = await createQualificationSubjectOperations(
      core,
      vi.fn().mockResolvedValue(user),
    ).loadQualificationSubject(USER_ID);

    expect(result).toEqual({ ok: false, reason: 'groups-failed' });
  });
});
