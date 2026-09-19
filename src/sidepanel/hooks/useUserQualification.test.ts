import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { FormattedRule, GroupMembership, OktaUser } from '../../shared/types';
import type { RuleInventoryState } from './useUserMemberships';
import type { GroupSearchResult } from './useAddToGroup';

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => ({ searchGroups: vi.fn() }),
}));

import { useUserQualification } from './useUserQualification';

const TARGET = '00gFAKETARGET1';

const user = (id = '00uFAKEONE'): OktaUser => ({
  id,
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'L',
    department: 'Engineering',
  },
});

const membership = (groupId: string): GroupMembership => ({
  group: { id: groupId, type: 'OKTA_GROUP', profile: { name: `Group ${groupId}` } },
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
});

const rule = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  id: '0prFAKE0001',
  name: 'Engineers',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: [TARGET],
  userAttributes: ['department'],
  created: '',
  lastUpdated: '',
  ...over,
});

const available: RuleInventoryState = { status: 'available', rules: [rule()] };
const group: GroupSearchResult = {
  id: TARGET,
  name: 'Target',
  description: '',
  type: 'OKTA_GROUP',
};

const setup = (over: Partial<Parameters<typeof useUserQualification>[0]> = {}) =>
  renderHook(
    (props: Partial<Parameters<typeof useUserQualification>[0]>) =>
      useUserQualification({
        user: user(),
        memberships: [],
        rules: available,
        targetTabId: 1,
        enabled: true,
        ...over,
        ...props,
      }),
    { initialProps: {} },
  );

describe('useUserQualification — verbs', () => {
  it('omits Check rule until the inventory is available, and Check membership without a tab', () => {
    const unresolved = setup({ rules: { status: 'unresolved' }, targetTabId: null });
    expect(unresolved.result.current.openRulePicker).toBeUndefined();
    expect(unresolved.result.current.openGroupPicker).toBeUndefined();
    const ready = setup();
    expect(ready.result.current.openRulePicker).toBeDefined();
    expect(ready.result.current.openGroupPicker).toBeDefined();
  });

  it('offers neither on the search rung', () => {
    const { result } = setup({ user: null });
    expect(result.current.openRulePicker).toBeUndefined();
    expect(result.current.openGroupPicker).toBeUndefined();
  });
});

describe('useUserQualification — check', () => {
  it('starts at none', () => {
    expect(setup().result.current.check).toEqual({ kind: 'none' });
  });

  it('is pending, never a verdict, while memberships are undefined', () => {
    const { result } = setup({ memberships: undefined });
    act(() => result.current.pickRule(rule()));
    expect(result.current.check).toEqual({ kind: 'pending', reason: 'memberships' });
  });

  it('assesses a picked rule against the rung user and the complete membership list', () => {
    const { result } = setup();
    act(() => result.current.pickRule(rule()));
    expect(result.current.check).toMatchObject({
      kind: 'rule',
      verdict: { headline: 'grants', coverage: 'none' },
    });
  });

  it('a group check is pending on an unresolved inventory and inventory-unavailable on a failed one', () => {
    const unresolved = setup({ rules: { status: 'unresolved' } });
    act(() => unresolved.result.current.groupPicker.pick(group));
    expect(unresolved.result.current.check).toEqual({ kind: 'pending', reason: 'inventory' });

    const failed = setup({ rules: { status: 'unavailable' } });
    act(() => failed.result.current.groupPicker.pick(group));
    expect(failed.result.current.check).toMatchObject({
      kind: 'group',
      verdict: { kind: 'inventory-unavailable' },
    });
  });

  it('feeds a group check only the rules that target it', () => {
    const elsewhere = rule({ id: '0prFAKEELSE', groupIds: ['00gFAKEOTHER'] });
    const { result } = setup({ rules: { status: 'available', rules: [elsewhere] } });
    act(() => result.current.groupPicker.pick(group));
    expect(result.current.check).toMatchObject({
      kind: 'group',
      verdict: { kind: 'no-feeding-rule' },
    });
  });

  it('an APP_GROUP is app-managed whatever the rules say', () => {
    const { result } = setup();
    act(() => result.current.groupPicker.pick({ ...group, type: 'APP_GROUP' }));
    expect(result.current.check).toMatchObject({ kind: 'group', verdict: { kind: 'app-managed' } });
  });

  it('follows the live memberships: an add flips would-be-added to already-member', () => {
    const { result, rerender } = setup();
    act(() => result.current.groupPicker.pick(group));
    expect(result.current.check).toMatchObject({ verdict: { kind: 'would-be-added' } });
    rerender({ memberships: [membership(TARGET)] });
    expect(result.current.check).toMatchObject({ verdict: { kind: 'already-member' } });
  });

  it('retracts the check when the user changes, and on clear', () => {
    const { result, rerender } = setup();
    act(() => result.current.pickRule(rule()));
    expect(result.current.check.kind).toBe('rule');
    rerender({ user: user('00uFAKETWO') });
    expect(result.current.check).toEqual({ kind: 'none' });

    rerender({});
    act(() => result.current.pickRule(rule()));
    act(() => result.current.clear());
    expect(result.current.check).toEqual({ kind: 'none' });
  });
});
