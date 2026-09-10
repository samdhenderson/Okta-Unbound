import type { EntityExport } from '../types';
import { userColumns, exportUserSchema, type ExportUser } from '../columns/userColumns';

export const usersDescriptor: EntityExport<ExportUser> = {
  id: 'users',
  displayName: 'Users',
  icon: 'user',
  description: 'All users in the org with identity and profile attributes.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/users',
  defaultQuery: { limit: 200 },
  schema: exportUserSchema,
  filter: {
    kind: 'search',
    placeholder: 'status eq "ACTIVE" and profile.department eq "Sales"',
    help: 'Optional Okta `search` expression (SCIM). Leave blank to export all users.',
  },
  linkify: { idColumnId: 'id', target: (u) => ({ type: 'user', id: u.id }) },
  columnCatalog: userColumns,
};

export default usersDescriptor;
