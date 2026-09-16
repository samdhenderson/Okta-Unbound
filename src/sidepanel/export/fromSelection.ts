import { parseOktaList } from '@/shared/schemas/okta';
import type { SelectionBasket, SelectionRef } from '@/sidepanel/selection/selectionStore';
import { buildExportEndpoint } from './endpoint';
import type { EntityExport, FromSelectionContext, SelectionTarget } from './types';

export interface SelectionRequest {
  ref: SelectionRef;
  endpoint: string;
  rows: 'entity' | 'list';
}

export type SelectionOutcome<Row> =
  | {
      status: 'rows';
      ref: SelectionRef;
      rows: Row[];
    }
  | {
      status: 'missing';
      ref: SelectionRef;
    };

export interface SelectionRowsResult<Row> {
  rows: Row[];
  requested: number;
  missing: SelectionTarget[];
  duplicates: number;
}

export function selectionContextOf<Row>(
  descriptor: EntityExport<Row>,
): FromSelectionContext<Row> | null {
  return descriptor.context.kind === 'from-selection' ? descriptor.context : null;
}

export function selectionRefsFor<Row>(
  descriptor: EntityExport<Row>,
  basket: SelectionBasket,
): SelectionRef[] {
  const context = selectionContextOf(descriptor);
  if (!context) return [];
  return basket.picked.filter((ref) => context.kinds.includes(ref.kind));
}

export function isExportAvailable<Row>(
  descriptor: EntityExport<Row>,
  basket: SelectionBasket,
): boolean {
  if (descriptor.context.kind !== 'from-selection') return true;
  return selectionRefsFor(descriptor, basket).length > 0;
}

export function buildSelectionRequests<Row>(
  descriptor: EntityExport<Row>,
  basket: SelectionBasket,
): SelectionRequest[] {
  const context = selectionContextOf(descriptor);
  if (!context) return [];
  return selectionRefsFor(descriptor, basket).map((ref) => ({
    ref,
    endpoint: buildExportEndpoint(descriptor, { selectionRef: ref }),
    rows: context.rows,
  }));
}

export function parseSelectionEntity<Row>(
  descriptor: EntityExport<Row>,
  data: unknown,
): Row | null {
  const rows: Row[] = parseOktaList(descriptor.schema, [data], `SELECTION ${descriptor.id}`);
  return rows[0] ?? null;
}

export function collectSelectionRows<Row>(
  descriptor: EntityExport<Row>,
  outcomes: readonly SelectionOutcome<Row>[],
): SelectionRowsResult<Row> {
  const identity = selectionContextOf(descriptor)?.identity;
  const rows: Row[] = [];
  const missing: SelectionTarget[] = [];
  const seen = new Set<string>();
  let duplicates = 0;

  for (const outcome of outcomes) {
    if (outcome.status === 'missing') {
      missing.push({ kind: outcome.ref.kind, id: outcome.ref.id });
      continue;
    }
    for (const row of outcome.rows) {
      if (identity) {
        const key = identity(row);
        if (seen.has(key)) {
          duplicates += 1;
          continue;
        }
        seen.add(key);
      }
      rows.push(row);
    }
  }

  return { rows, requested: outcomes.length, missing, duplicates };
}
