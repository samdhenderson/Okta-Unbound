import { describe, it, expect } from 'vitest';
import { groupMembershipsDescriptor, selectedGroupMembershipsDescriptor } from './groupMemberships';
import { userColumns, exportUserSchema } from '../columns/userColumns';

describe('groupMembershipsDescriptor', () => {
  it('has the stable registry id', () => {
    expect(groupMembershipsDescriptor.id).toBe('group-memberships');
  });

  it('scopes via search-to-select', () => {
    expect(groupMembershipsDescriptor.context.kind).toBe('search-to-select');
  });

  it('builds the group members endpoint from the chosen group id', () => {
    const { context } = groupMembershipsDescriptor;
    if (context.kind !== 'search-to-select') throw new Error('expected search-to-select context');
    expect(context.endpoint('00gFAKE1')).toBe('/api/v1/groups/00gFAKE1/users');
  });

  it('reuses the shared user column catalog', () => {
    expect(groupMembershipsDescriptor.columnCatalog).toBe(userColumns);
  });

  it('validates rows with the lenient export user schema', () => {
    expect(groupMembershipsDescriptor.schema).toBe(exportUserSchema);
    expect(exportUserSchema.safeParse({ id: '00uFAKE1' }).success).toBe(true);
  });
});

describe('selectedGroupMembershipsDescriptor', () => {
  it('walks the member list of every ticked group', () => {
    const { context } = selectedGroupMembershipsDescriptor;
    if (context.kind !== 'from-selection') throw new Error('expected from-selection context');

    expect(selectedGroupMembershipsDescriptor.id).toBe('group-memberships-selected');
    expect(context.kinds).toEqual(['group']);
    expect(context.rows).toBe('list');
    expect(context.endpoint({ kind: 'group', id: '00gFAKE1' })).toBe(
      '/api/v1/groups/00gFAKE1/users',
    );
  });

  it('de-duplicates by user id, since the catalog carries no group column', () => {
    const { context } = selectedGroupMembershipsDescriptor;
    if (context.kind !== 'from-selection') throw new Error('expected from-selection context');

    expect(context.identity?.({ id: '00uFAKE1' })).toBe('00uFAKE1');
  });

  it('reuses the shared user column catalog and schema', () => {
    expect(selectedGroupMembershipsDescriptor.columnCatalog).toBe(
      groupMembershipsDescriptor.columnCatalog,
    );
    expect(selectedGroupMembershipsDescriptor.schema).toBe(groupMembershipsDescriptor.schema);
  });
});
