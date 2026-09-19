import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormattedRule, GroupSummary, OktaUser } from '../../shared/types';

const api = vi.hoisted(() => ({
  makeApiRequest: vi.fn(),
  loadQualificationSubject: vi.fn(),
}));

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

import { useGroupUserCheck } from './useGroupUserCheck';

const group = (over: Partial<GroupSummary> = {}): GroupSummary => ({
  id: '00gFAKEGROUP01',
  name: 'SecOps',
  type: 'OKTA_GROUP',
  memberCount: 3,
  hasRules: true,
  ruleCount: 1,
  ...over,
});

const subjectUser: OktaUser = {
  id: '00uFAKESUBJECT',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'L',
    department: 'Engineering',
  },
};

const feeding: FormattedRule = {
  id: '0prFAKE0001',
  name: 'Engineers into SecOps',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00gFAKEGROUP01'],
  userAttributes: ['department'],
  created: '',
  lastUpdated: '',
};

type Options = Parameters<typeof useGroupUserCheck>[0];
const setup = (over: Partial<Options> = {}) =>
  renderHook(
    (props: Partial<Options>) =>
      useGroupUserCheck({
        group: group(),
        feedingRules: [feeding],
        rulesStatus: 'done',
        targetTabId: 1,
        enabled: true,
        ...over,
        ...props,
      }),
    { initialProps: {} },
  );

beforeEach(() => {
  api.loadQualificationSubject.mockReset();
  api.loadQualificationSubject.mockResolvedValue({ ok: true, user: subjectUser, groups: [] });
});

describe('useGroupUserCheck', () => {
  it('omits the verb without a tab', () => {
    expect(setup({ targetTabId: null }).result.current.openPicker).toBeUndefined();
    expect(setup().result.current.openPicker).toBeDefined();
  });

  it('is none until a subject is loaded, then a verdict over the feeding rules', async () => {
    const { result } = setup();
    expect(result.current.check).toEqual({ kind: 'none' });
    await act(async () => result.current.picker.pick(subjectUser));
    expect(result.current.check).toMatchObject({
      kind: 'verdict',
      verdict: { kind: 'would-be-added', grantingRuleIds: [feeding.id] },
    });
  });

  it('is pending, never a verdict, while the rules are still loading', async () => {
    const { result, rerender } = setup({ feedingRules: [], rulesStatus: 'loading' });
    await act(async () => result.current.picker.pick(subjectUser));
    expect(result.current.check).toEqual({ kind: 'pending' });
    rerender({ feedingRules: [feeding], rulesStatus: 'done' });
    expect(result.current.check.kind).toBe('verdict');
  });

  it('reports a failed rules load as inventory-unavailable, not as no feeding rule', async () => {
    const { result } = setup({ feedingRules: [], rulesStatus: 'error' });
    await act(async () => result.current.picker.pick(subjectUser));
    expect(result.current.check).toMatchObject({ verdict: { kind: 'inventory-unavailable' } });
  });

  it('retracts the subject when the group changes, without another load', async () => {
    const { result, rerender } = setup();
    await act(async () => result.current.picker.pick(subjectUser));
    expect(result.current.subject.status).toBe('loaded');
    rerender({ group: group({ id: '00gFAKEGROUP02', name: 'Other' }) });
    expect(result.current.subject.status).toBe('idle');
    expect(result.current.check).toEqual({ kind: 'none' });
    expect(api.loadQualificationSubject).toHaveBeenCalledTimes(1);
  });
});
