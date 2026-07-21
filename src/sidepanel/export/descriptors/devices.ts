import { z } from 'zod';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { EntityExport, ExportColumn } from '../types';

const deviceSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    profile: z
      .object({
        displayName: z.string().optional(),
        platform: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        osVersion: z.string().optional(),
        registered: z.boolean().optional(),
        serialNumber: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

type Device = z.infer<typeof deviceSchema>;

const deviceColumns: ExportColumn<Device>[] = [
  { id: 'id', label: 'Device ID', group: 'base', defaultEnabled: true, accessor: (d) => d.id },
  { id: 'status', label: 'Status', group: 'base', defaultEnabled: true, accessor: (d) => d.status },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (d) => d.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: false,
    accessor: (d) => d.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'displayName',
    label: 'Name',
    group: 'profile',
    defaultEnabled: true,
    accessor: (d) => d.profile?.displayName,
  },
  {
    id: 'platform',
    label: 'Platform',
    group: 'profile',
    defaultEnabled: true,
    accessor: (d) => d.profile?.platform,
  },
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    group: 'profile',
    defaultEnabled: false,
    accessor: (d) => d.profile?.manufacturer,
  },
  {
    id: 'model',
    label: 'Model',
    group: 'profile',
    defaultEnabled: true,
    accessor: (d) => d.profile?.model,
  },
  {
    id: 'osVersion',
    label: 'OS Version',
    group: 'profile',
    defaultEnabled: false,
    accessor: (d) => d.profile?.osVersion,
  },
  {
    id: 'registered',
    label: 'Registered',
    group: 'profile',
    defaultEnabled: false,
    accessor: (d) => d.profile?.registered,
    format: (v) => (v ? 'Yes' : 'No'),
  },
  {
    id: 'serialNumber',
    label: 'Serial Number',
    group: 'profile',
    defaultEnabled: false,
    accessor: (d) => d.profile?.serialNumber,
  },
];

export const devicesDescriptor: EntityExport<Device> = {
  id: 'devices',
  displayName: 'Devices',
  icon: 'lock',
  description: 'All devices in the org with lifecycle and hardware profile attributes.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/devices',
  defaultQuery: { limit: 200, expand: 'user' },
  schema: deviceSchema,
  filter: {
    kind: 'search',
    help: 'Okta device `search` expression (SCIM).',
    placeholder: 'status eq "ACTIVE"',
  },
  columnCatalog: deviceColumns,
};

export default devicesDescriptor;
