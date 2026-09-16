import type { z } from 'zod';
import type { OktaAdminTarget } from '@/shared/utils/oktaUrl';
import type { IconType } from '@/sidepanel/components/shared/Icon';
import type { CountResolution } from '@/sidepanel/components/home/orgFigures';
import type { OrgSnapshotView } from './snapshot';
import type { SelectionKind } from '@/sidepanel/selection/selectionStore';

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

export interface SelectionTarget {
  kind: SelectionKind;
  id: string;
}

export interface FromSelectionContext<Row = unknown> {
  kind: 'from-selection';
  kinds: readonly SelectionKind[];
  label: string;
  rows: 'entity' | 'list';
  endpoint(ref: SelectionTarget): string;
  query?: Record<string, string | number>;
  identity?(row: Row): string;
}

export type EntityContextMode<Row = unknown> =
  | { kind: 'whole-org' }
  | {
      kind: 'search-to-select';
      label: string;
      placeholder: string;
      endpoint: (contextId: string) => string;
    }
  | FromSelectionContext<Row>;

export type FilterSupport =
  | { kind: 'none' }
  | {
      kind: 'search' | 'filter' | 'q';
      help: string;
      placeholder: string;
    };

export interface SnapshotRows<Row> {
  rows: Row[];
  resolution: CountResolution;
  dropped: number;
}

export type EntityRowSource<Row> =
  | {
      kind: 'endpoint';
    }
  | {
      kind: 'snapshot';
      completenessColumnId: string;
      read(snapshot: OrgSnapshotView): SnapshotRows<Row>;
    };

export interface IdLinkify<Row = unknown> {
  idColumnId: string;
  target(row: Row): OktaAdminTarget | null;
}

export interface EntityExport<Row = unknown> {
  id: string;
  displayName: string;
  icon: IconType;
  description: string;

  context: EntityContextMode<Row>;

  source?: EntityRowSource<Row>;

  endpoint?: string;
  defaultQuery: Record<string, string | number>;

  schema: z.ZodTypeAny;

  columnCatalog: ExportColumn<Row>[];

  filter: FilterSupport;

  linkify?: IdLinkify<Row>;

  maxRows?: number;
}
