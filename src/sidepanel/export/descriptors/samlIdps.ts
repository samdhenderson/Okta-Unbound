import { z } from 'zod';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { EntityExport, ExportColumn } from '../types';

const idpSchema = z
  .object({
    id: z.string(),
    type: z.string().optional(), // 'SAML2', 'OIDC', ...
    name: z.string().optional(),
    status: z.string().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    protocol: z
      .object({
        type: z.string().optional(),
        credentials: z
          .object({
            trust: z
              .object({
                issuer: z.string().optional(),
                audience: z.string().optional(),
                kid: z.string().optional(),
              })
              .passthrough()
              .optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

type Idp = z.infer<typeof idpSchema>;

const idpColumns: ExportColumn<Idp>[] = [
  {
    id: 'id',
    label: 'IdP ID',
    group: 'base',
    defaultEnabled: true,
    accessor: (i) => i.id,
  },
  {
    id: 'name',
    label: 'Name',
    group: 'base',
    defaultEnabled: true,
    accessor: (i) => i.name,
  },
  {
    id: 'type',
    label: 'Type',
    group: 'base',
    defaultEnabled: true,
    accessor: (i) => i.type,
  },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (i) => i.status,
  },
  {
    id: 'issuer',
    label: 'Issuer',
    group: 'base',
    defaultEnabled: true,
    accessor: (i) => i.protocol?.credentials?.trust?.issuer,
  },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (i) => i.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: false,
    accessor: (i) => i.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
];

export const samlIdpsDescriptor: EntityExport<Idp> = {
  id: 'saml-idps',
  displayName: 'Identity Providers',
  icon: 'key',
  description: 'External SAML/OIDC identity providers configured in the org.',
  context: { kind: 'whole-org' },
  endpoint: '/api/v1/idps',
  defaultQuery: { limit: 200 },
  schema: idpSchema,
  filter: { kind: 'none' },
  columnCatalog: idpColumns,
};

export default samlIdpsDescriptor;
