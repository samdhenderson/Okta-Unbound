import type { z } from 'zod';
import type { OktaAdminEntityType } from '@/shared/utils/oktaUrl';
import type { IconType } from '@/sidepanel/components/overview/shared/Icon';

export type ColumnGroup = 'base' | 'profile' | 'custom';

export type CellValue = string | number | boolean | null | undefined;

export interface ExportColumn<Row> {
  id: string;
  label: string;
  group: ColumnGroup;
  defaultEnabled: boolean;
  accessor(row: Row): unknown;
  format?(value: unknown, row: Row): CellValue;
  description?: string;
}

export interface EntityContextOption {
  id: string;
  label: string;
  sublabel?: string;
}

export type EntityContextMode =
  | { kind: 'whole-org' }
  | {
      kind: 'search-to-select';
      label: string;
      placeholder: string;
      endpoint: (contextId: string) => string;
    };

export type FilterSupport =
  | { kind: 'none' }
  | {
      kind: 'search' | 'filter' | 'q';
      help: string;
      placeholder: string;
    };

export interface IdLinkify {
  entityType: OktaAdminEntityType;
  idColumnId: string;
}

export interface EntityExport<Row = unknown> {
  id: string;
  displayName: string;
  icon: IconType;
  description: string;

  context: EntityContextMode;

  endpoint?: string;
  defaultQuery: Record<string, string | number>;

  schema: z.ZodTypeAny;

  columnCatalog: ExportColumn<Row>[];

  filter: FilterSupport;

  linkify?: IdLinkify;

  maxRows?: number;
}
