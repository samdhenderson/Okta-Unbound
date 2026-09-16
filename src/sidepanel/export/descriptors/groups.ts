import { z } from 'zod';
import { oktaGroupListItemSchema } from '@/shared/schemas/okta';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { EntityExport, ExportColumn } from '../types';

export const groupWithStatsSchema = oktaGroupListItemSchema.extend({
  created: z.string().nullish(),
  lastUpdated: z.string().nullish(),
  lastMembershipUpdated: z.string().nullish(),
  _embedded: z
    .object({
      stats: z
        .object({
          usersCount: z.number().optional(),
          appsCount: z.number().optional(),
          groupPushMappingsCount: z.number().optional(),
        })
        .partial()
        .passthrough()
        .optional(),
    })
    .partial()
    .passthrough()
    .optional(),
});

export type GroupWithStats = z.infer<typeof groupWithStatsSchema>;

export const groupColumns: ExportColumn<GroupWithStats>[] = [
  { id: 'id', label: 'Group ID', group: 'base', defaultEnabled: true, accessor: (g) => g.id },
  { id: 'type', label: 'Type', group: 'base', defaultEnabled: true, accessor: (g) => g.type },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (g) => g.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: false,
    accessor: (g) => g.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastMembershipUpdated',
    label: 'Membership Changed',
    group: 'base',
    defaultEnabled: false,
    accessor: (g) => g.lastMembershipUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'name',
    label: 'Group Name',
    group: 'profile',
    defaultEnabled: true,
    accessor: (g) => g.profile?.name,
  },
  {
    id: 'description',
    label: 'Description',
    group: 'profile',
    defaultEnabled: true,
    accessor: (g) => g.profile?.description,
  },
  {
    id: 'memberCount',
    label: 'Member Count',
    group: 'custom',
    defaultEnabled: true,
    accessor: (g) => g._embedded?.stats?.usersCount,
  },
  {
    id: 'appsCount',
    label: 'Apps Count',
    group: 'custom',
    defaultEnabled: false,
    accessor: (g) => g._embedded?.stats?.appsCount,
  },
  {
    id: 'pushMappings',
    label: 'Group Push Mappings',
    group: 'custom',
    defaultEnabled: false,
    accessor: (g) => g._embedded?.stats?.groupPushMappingsCount,
  },
];

export const groupsDescriptor: EntityExport<GroupWithStats> = {
  id: 'groups',
  displayName: 'Groups',
  icon: 'building',
  description: 'All groups in the org with membership, app, and push-mapping counts.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/groups',
  defaultQuery: { limit: 200, expand: 'stats' },
  schema: groupWithStatsSchema,
  filter: {
    kind: 'search',
    placeholder: 'type eq "OKTA_GROUP"',
    help: 'Optional Okta `search` expression (SCIM). Leave blank to export all groups.',
  },
  linkify: { idColumnId: 'id', target: (g) => ({ type: 'group', id: g.id }) },
  columnCatalog: groupColumns,
};

export const selectedGroupsDescriptor: EntityExport<GroupWithStats> = {
  id: 'groups-selected',
  displayName: 'Selected Groups',
  icon: 'building',
  description: 'The groups ticked in the selection basket, with the same columns as Groups.',
  context: {
    kind: 'from-selection',
    kinds: ['group'],
    label: 'groups',
    rows: 'entity',
    endpoint: (ref) => `/api/v1/groups/${ref.id}`,
    query: { expand: 'stats' },
    identity: (g) => g.id,
  },
  defaultQuery: {},
  schema: groupWithStatsSchema,
  filter: { kind: 'none' },
  linkify: { idColumnId: 'id', target: (g) => ({ type: 'group', id: g.id }) },
  columnCatalog: groupColumns,
};

export default [groupsDescriptor, selectedGroupsDescriptor];
