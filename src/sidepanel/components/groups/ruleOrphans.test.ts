import { describe, it, expect } from 'vitest';
import {
  appNamesByGroup,
  findCleanupCandidates,
  findUnmaintainedAppAccess,
  groupIdsFilledByRules,
  type OrphanCandidateGroup,
} from './ruleOrphans';

const group = (over: Partial<OrphanCandidateGroup> & { id: string }): OrphanCandidateGroup => ({
  name: over.id,
  memberCount: 0,
  type: 'OKTA_GROUP',
  ...over,
});

describe('groupIdsFilledByRules', () => {
  it('collects every group any rule assigns to', () => {
    const filled = groupIdsFilledByRules([
      { groupIds: ['00gFAKE1', '00gFAKE2'] },
      { groupIds: ['00gFAKE2'] },
      { groupIds: [] },
    ]);
    expect([...filled].sort()).toEqual(['00gFAKE1', '00gFAKE2']);
  });
});

describe('appNamesByGroup', () => {
  it('recovers the app from the compound record id, not from the entity', () => {
    const byGroup = appNamesByGroup(
      ['0oaFAKE1::00gFAKE1', '0oaFAKE2::00gFAKE1', '0oaFAKE1::00gFAKE2'],
      new Map([
        ['0oaFAKE1', 'Slack'],
        ['0oaFAKE2', 'Workday'],
      ]),
    );
    expect(byGroup.get('00gFAKE1')).toEqual(['Slack', 'Workday']);
    expect(byGroup.get('00gFAKE2')).toEqual(['Slack']);
  });

  it('falls back to the app id rather than dropping an unnamed app', () => {
    const byGroup = appNamesByGroup(['0oaFAKE9::00gFAKE1'], new Map());
    expect(byGroup.get('00gFAKE1')).toEqual(['0oaFAKE9']);
  });

  it('ignores a record id with no shard key', () => {
    expect(appNamesByGroup(['00gFAKE1'], new Map()).size).toBe(0);
  });
});

describe('findCleanupCandidates', () => {
  const groups = [
    group({ id: '00gFAKE1', name: 'Abandoned' }),
    group({ id: '00gFAKE2', name: 'Filled by a rule' }),
    group({ id: '00gFAKE3', name: 'Has members', memberCount: 4 }),
    group({ id: '00gFAKE4', name: 'Holds an app open' }),
    group({ id: '00gFAKE5', name: 'Sourced from an app', type: 'APP_GROUP' }),
    group({ id: '00gFAKE6', name: 'Everyone', type: 'BUILT_IN' }),
  ];

  it('finds only the groups that are empty, unfilled and unassigned', () => {
    const found = findCleanupCandidates(groups, new Set(['00gFAKE2']), new Set(['00gFAKE4']));
    expect(found.map((finding) => finding.id)).toEqual(['00gFAKE1']);
    expect(found[0].detail).toBe('No members · no rule fills it · no app assigned');
  });

  it('keeps an empty group that is holding app access open', () => {
    const found = findCleanupCandidates(groups, new Set(), new Set(['00gFAKE1', '00gFAKE4']));
    expect(found.map((finding) => finding.id)).not.toContain('00gFAKE4');
    expect(found.map((finding) => finding.id)).not.toContain('00gFAKE1');
  });

  it('leaves app-sourced and built-in groups alone', () => {
    const found = findCleanupCandidates(groups, new Set(), new Set());
    expect(found.map((finding) => finding.id)).toEqual(['00gFAKE1', '00gFAKE2', '00gFAKE4']);
  });

  it('orders by name, so the same org lists the same way twice running', () => {
    const found = findCleanupCandidates(
      [group({ id: 'b', name: 'Zulu' }), group({ id: 'a', name: 'Alpha' })],
      new Set(),
      new Set(),
    );
    expect(found.map((finding) => finding.name)).toEqual(['Alpha', 'Zulu']);
  });
});

describe('findUnmaintainedAppAccess', () => {
  const groups = [
    group({ id: '00gFAKE1', name: 'Sales tools', memberCount: 12 }),
    group({ id: '00gFAKE2', name: 'Engineering tools', memberCount: 40 }),
    group({ id: '00gFAKE3', name: 'Ruled', memberCount: 7 }),
    group({ id: '00gFAKE4', name: 'Empty but assigned', memberCount: 0 }),
    group({ id: '00gFAKE5', name: 'No app', memberCount: 9 }),
  ];
  const byGroup = new Map([
    ['00gFAKE1', ['Slack']],
    ['00gFAKE2', ['Slack', 'Workday']],
    ['00gFAKE3', ['Slack']],
    ['00gFAKE4', ['Slack']],
  ]);

  it('lists the unmanaged access, biggest blast radius first', () => {
    const found = findUnmaintainedAppAccess(groups, new Set(['00gFAKE3']), byGroup);
    expect(found.map((finding) => finding.id)).toEqual(['00gFAKE2', '00gFAKE1']);
    expect(found[0].detail).toBe('40 members · Slack, Workday');
  });

  it('leaves the empty ones to the cleanup report', () => {
    const found = findUnmaintainedAppAccess(groups, new Set(), byGroup);
    expect(found.map((finding) => finding.id)).not.toContain('00gFAKE4');
  });

  it('says "member" for one', () => {
    const found = findUnmaintainedAppAccess(
      [group({ id: '00gFAKE1', name: 'Solo', memberCount: 1 })],
      new Set(),
      new Map([['00gFAKE1', ['Slack']]]),
    );
    expect(found[0].detail).toBe('1 member · Slack');
  });

  it('carries no member count into the finding it returns', () => {
    const [found] = findUnmaintainedAppAccess(
      [group({ id: '00gFAKE1', name: 'Solo', memberCount: 1 })],
      new Set(),
      new Map([['00gFAKE1', ['Slack']]]),
    );
    expect(Object.keys(found).sort()).toEqual(['detail', 'id', 'name']);
  });
});
