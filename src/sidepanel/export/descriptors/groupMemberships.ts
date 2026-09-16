import type { EntityExport } from '../types';
import { userColumns, exportUserSchema, type ExportUser } from '../columns/userColumns';

export const groupMembershipsDescriptor: EntityExport<ExportUser> = {
  id: 'group-memberships',
  displayName: 'Group Memberships',
  icon: 'users',
  description: 'Members of a chosen group, with user identity + profile columns.',
  context: {
    kind: 'search-to-select',
    label: 'Group',
    placeholder: 'Search groups by name…',
    endpoint: (groupId) => `/api/v1/groups/${groupId}/users`,
  },
  defaultQuery: { limit: 200 },
  schema: exportUserSchema,
  filter: { kind: 'none' },
  linkify: { idColumnId: 'id', target: (u) => ({ type: 'user', id: u.id }) },
  columnCatalog: userColumns,
};

export const selectedGroupMembershipsDescriptor: EntityExport<ExportUser> = {
  id: 'group-memberships-selected',
  displayName: 'Selected Group Memberships',
  icon: 'users',
  description: 'Members of every group ticked in the selection basket, de-duplicated by user.',
  context: {
    kind: 'from-selection',
    kinds: ['group'],
    label: 'groups',
    rows: 'list',
    endpoint: (ref) => `/api/v1/groups/${ref.id}/users`,
    query: { limit: 200 },
    identity: (u) => u.id,
  },
  defaultQuery: {},
  schema: exportUserSchema,
  filter: { kind: 'none' },
  linkify: { idColumnId: 'id', target: (u) => ({ type: 'user', id: u.id }) },
  columnCatalog: userColumns,
};

export default [groupMembershipsDescriptor, selectedGroupMembershipsDescriptor];
