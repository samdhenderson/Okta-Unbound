import { describe, it, expect } from 'vitest';
import groupsDescriptor, { groupWithStatsSchema } from './groups';

describe('groups descriptor', () => {
  it('declares stable identity, endpoint, and expand=stats default query', () => {
    expect(groupsDescriptor.id).toBe('groups');
    expect(groupsDescriptor.endpoint).toBe('/api/v1/groups');
    expect(groupsDescriptor.defaultQuery.expand).toBe('stats');
  });

  it('parses a row with _embedded.stats and memberCount reads usersCount', () => {
    const row = {
      id: '00gFAKE1',
      type: 'OKTA_GROUP',
      profile: { name: 'Sales', description: 'Sales team' },
      _embedded: { stats: { usersCount: 42, appsCount: 3, groupPushMappingsCount: 1 } },
    };
    const parsed = groupWithStatsSchema.parse(row);
    const col = groupsDescriptor.columnCatalog.find((c) => c.id === 'memberCount');
    expect(col).toBeDefined();
    expect(col!.accessor(parsed)).toBe(42);
  });

  it('parses a lenient row missing _embedded (stats accessor → undefined)', () => {
    const row = { id: '00gFAKE2', profile: { name: 'Engineering' } };
    const parsed = groupWithStatsSchema.parse(row);
    const col = groupsDescriptor.columnCatalog.find((c) => c.id === 'memberCount');
    expect(col!.accessor(parsed)).toBeUndefined();
  });

  it('emits lastMembershipUpdated as its own column, distinct from lastUpdated', () => {
    const row = {
      id: '00gFAKE3',
      profile: { name: 'AWS Prod - Admin' },
      lastUpdated: '2026-08-01T00:00:00.000Z',
      lastMembershipUpdated: '2023-01-15T00:00:00.000Z',
    };
    const parsed = groupWithStatsSchema.parse(row);

    const membership = groupsDescriptor.columnCatalog.find((c) => c.id === 'lastMembershipUpdated');
    expect(membership).toBeDefined();
    expect(membership!.defaultEnabled).toBe(false);
    expect(membership!.format!(membership!.accessor(parsed), parsed)).toBe('2023-01-15');

    const profile = groupsDescriptor.columnCatalog.find((c) => c.id === 'lastUpdated');
    expect(profile!.format!(profile!.accessor(parsed), parsed)).toBe('2026-08-01');
  });

  it('formats an absent lastMembershipUpdated as N/A rather than dropping the row', () => {
    const parsed = groupWithStatsSchema.parse({ id: '00gFAKE4', profile: { name: 'Legal' } });
    const col = groupsDescriptor.columnCatalog.find((c) => c.id === 'lastMembershipUpdated');
    expect(col!.format!(col!.accessor(parsed), parsed)).toBe('N/A');
  });
});
