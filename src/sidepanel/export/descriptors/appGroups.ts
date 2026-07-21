import { z } from 'zod';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { EntityExport } from '../types';

export const appGroupSchema = z
  .object({
    id: z.string(),
    priority: z.number().optional(),
    lastUpdated: z.string().nullish(),
    profile: z.record(z.unknown()).optional(),
  })
  .passthrough();

export type AppGroup = z.infer<typeof appGroupSchema>;

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
