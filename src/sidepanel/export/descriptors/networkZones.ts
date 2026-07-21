import { z } from 'zod';
import type { EntityExport, ExportColumn } from '../types';

const zoneSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    type: z.string().optional(), // 'IP' | 'DYNAMIC'
    status: z.string().optional(), // 'ACTIVE' | 'INACTIVE'
    system: z.boolean().optional(),
    usage: z.string().optional(), // 'POLICY' | 'BLOCKLIST'
    gateways: z.array(z.unknown()).optional(),
    proxies: z.array(z.unknown()).optional(),
  })
  .passthrough();

type Zone = z.infer<typeof zoneSchema>;

const zoneColumns: ExportColumn<Zone>[] = [
  {
    id: 'id',
    label: 'Zone ID',
    group: 'base',
    defaultEnabled: true,
    accessor: (z) => z.id,
  },
  {
    id: 'name',
    label: 'Name',
    group: 'base',
    defaultEnabled: true,
    accessor: (z) => z.name,
  },
  {
    id: 'type',
    label: 'Type',
    group: 'base',
    defaultEnabled: true,
    accessor: (z) => z.type,
  },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (z) => z.status,
  },
  {
    id: 'usage',
    label: 'Usage',
    group: 'base',
    defaultEnabled: true,
    accessor: (z) => z.usage,
  },
  {
    id: 'system',
    label: 'System',
    group: 'base',
    defaultEnabled: false,
    accessor: (z) => z.system,
    format: (v) => (v ? 'Yes' : 'No'),
  },
  {
    id: 'gatewayCount',
    label: 'Gateway Count',
    group: 'base',
    defaultEnabled: false,
    accessor: (z) => z.gateways?.length ?? 0,
  },
];

export const networkZonesDescriptor: EntityExport<Zone> = {
  id: 'network-zones',
  displayName: 'Network Zones',
  icon: 'shield',
  description: 'All network zones in the org with their type, status, and usage.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/zones',
  defaultQuery: { limit: 200 },
  schema: zoneSchema,
  filter: { kind: 'none' },
  columnCatalog: zoneColumns,
};

export default networkZonesDescriptor;
