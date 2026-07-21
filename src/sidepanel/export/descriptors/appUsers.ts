import { z } from 'zod';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { EntityExport, ExportColumn } from '../types';

const appUserSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    scope: z.string().optional(),
    syncState: z.string().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    credentials: z.object({ userName: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

type AppUser = z.infer<typeof appUserSchema>;

const appUserColumns: ExportColumn<AppUser>[] = [
  { id: 'id', label: 'User ID', group: 'base', defaultEnabled: true, accessor: (u) => u.id },
  {
    id: 'userName',
    label: 'User Name',
    group: 'base',
    defaultEnabled: true,
    accessor: (u) => u.credentials?.userName,
  },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (u) => u.status,
  },
  {
    id: 'scope',
    label: 'Scope',
    group: 'base',
    defaultEnabled: true,
    accessor: (u) => u.scope,
  },
  {
    id: 'syncState',
    label: 'Sync State',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.syncState,
  },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
];

export const appUsersDescriptor: EntityExport<AppUser> = {
  id: 'app-users',
  displayName: 'App Users',
  icon: 'users',
  description: 'Assignments of users to a chosen application.',
  context: {
    kind: 'search-to-select',
    label: 'App',
    placeholder: 'Search apps by name…',
    endpoint: (appId) => `/api/v1/apps/${appId}/users`,
  },
  defaultQuery: { limit: 200 },
  schema: appUserSchema,
  filter: { kind: 'none' },
  linkify: { entityType: 'user', idColumnId: 'id' },
  columnCatalog: appUserColumns,
};

export default appUsersDescriptor;
