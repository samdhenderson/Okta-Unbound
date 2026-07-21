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
  linkify: { entityType: 'user', idColumnId: 'id' },
  columnCatalog: userColumns,
};

export default groupMembershipsDescriptor;
