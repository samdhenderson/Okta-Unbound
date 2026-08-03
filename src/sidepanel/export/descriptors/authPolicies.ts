import type { EntityExport, ExportColumn } from '../types';
import { oktaPolicyListItemSchema, type OktaPolicyListItem } from '@/shared/schemas/okta';
import { formatDateForCSV } from '@/shared/utils/csvUtils';

const policyColumns: ExportColumn<OktaPolicyListItem>[] = [
  {
    id: 'id',
    label: 'Policy ID',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.id,
  },
  {
    id: 'name',
    label: 'Name',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.name,
  },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.status,
  },
  {
    id: 'type',
    label: 'Type',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.type,
  },
  {
    id: 'priority',
    label: 'Priority',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.priority,
  },
  {
    id: 'description',
    label: 'Description',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.description,
  },
  {
    id: 'system',
    label: 'System',
    group: 'base',
    defaultEnabled: false,
    accessor: (p) => p.system,
    format: (v) => (v ? 'Yes' : 'No'),
  },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (p) => p.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: true,
    accessor: (p) => p.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
];

export const authPoliciesDescriptor: EntityExport<OktaPolicyListItem> = {
  id: 'auth-policies',
  displayName: 'Auth Policies',
  icon: 'shield',
  description: 'All app authentication policies in the org with their status and priority.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/policies',
  defaultQuery: { type: 'ACCESS_POLICY', limit: 200 },
  schema: oktaPolicyListItemSchema,
  filter: { kind: 'none' },
  columnCatalog: policyColumns,
};

export default authPoliciesDescriptor;
