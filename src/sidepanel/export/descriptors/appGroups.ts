import { formatDateForCSV } from '@/shared/utils/csvUtils';
import { oktaAppGroupSchema, type OktaAppGroup } from '@/shared/schemas/okta';
import type { EntityExport } from '../types';

export const appGroupSchema = oktaAppGroupSchema;

export type AppGroup = OktaAppGroup;

export const appGroupsDescriptor: EntityExport<AppGroup> = {
  id: 'app-groups',
  displayName: 'App Groups',
  icon: 'building',
  description: 'Groups assigned to a chosen app.',
  context: {
    kind: 'search-to-select',
    label: 'App',
    placeholder: 'Search apps by name…',
    endpoint: (appId) => `/api/v1/apps/${appId}/groups`,
  },
  defaultQuery: { limit: 200 },
  schema: appGroupSchema,
  filter: { kind: 'none' },
  linkify: { entityType: 'group', idColumnId: 'id' },
  columnCatalog: [
    { id: 'id', label: 'Group ID', group: 'base', defaultEnabled: true, accessor: (g) => g.id },
    {
      id: 'priority',
      label: 'Priority',
      group: 'base',
      defaultEnabled: true,
      accessor: (g) => g.priority,
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      group: 'base',
      defaultEnabled: false,
      accessor: (g) => g.lastUpdated,
      format: (v) => formatDateForCSV(v as string | null | undefined),
    },
  ],
};

export default appGroupsDescriptor;
