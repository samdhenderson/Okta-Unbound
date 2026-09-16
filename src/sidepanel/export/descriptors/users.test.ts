import { describe, it, expect } from 'vitest';
import { usersDescriptor, selectedUsersDescriptor } from './users';
import { userColumns, exportUserSchema } from '../columns/userColumns';

describe('usersDescriptor', () => {
  it('declares stable identity and the whole-org endpoint', () => {
    expect(usersDescriptor.id).toBe('users');
    expect(usersDescriptor.context.kind).toBe('whole-org');
    expect(usersDescriptor.endpoint).toBe('/api/v1/users');
  });
});

describe('selectedUsersDescriptor', () => {
  it('has its own stable registry id', () => {
    expect(selectedUsersDescriptor.id).toBe('users-selected');
  });

  it('scopes to the ticked users and fetches one entity per tick', () => {
    const { context } = selectedUsersDescriptor;
    if (context.kind !== 'from-selection') throw new Error('expected from-selection context');

    expect(context.kinds).toEqual(['user']);
    expect(context.rows).toBe('entity');
    expect(context.endpoint({ kind: 'user', id: '00uFAKE1' })).toBe('/api/v1/users/00uFAKE1');
  });

  it('adds no column catalog of its own', () => {
    expect(selectedUsersDescriptor.columnCatalog).toBe(userColumns);
    expect(selectedUsersDescriptor.schema).toBe(exportUserSchema);
  });

  it('offers no filter box, so it cannot ship fewer rows than were ticked', () => {
    expect(selectedUsersDescriptor.filter.kind).toBe('none');
  });
});
