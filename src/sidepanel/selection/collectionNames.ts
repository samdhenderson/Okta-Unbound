import type { CollectionRow } from './collectionStore';
import type { SelectionKind, SelectionRef } from './selectionStore';

export type UnstampedRef = Omit<SelectionRef, 'pickedAt'>;

export type LocalName =
  { status: 'named'; name: string } | { status: 'absent' } | { status: 'unknown' };

export type LocalNameSource = (kind: SelectionKind, id: string) => LocalName;

export interface LoadPlan {
  named: UnstampedRef[];
  needsFetch: Partial<Record<SelectionKind, string[]>>;
  absent: CollectionRow[];
}

export function userFetchCount(plan: LoadPlan): number {
  return plan.needsFetch.user?.length ?? 0;
}

export function planLoad(rows: CollectionRow[], localName: LocalNameSource): LoadPlan {
  const named: UnstampedRef[] = [];
  const needsFetch: Partial<Record<SelectionKind, string[]>> = {};
  const absent: CollectionRow[] = [];

  for (const row of rows) {
    if (row.name !== undefined && row.name.length > 0) {
      named.push({ kind: row.kind, id: row.id, name: row.name });
      continue;
    }

    const local = localName(row.kind, row.id);
    if (local.status === 'named') {
      named.push({ kind: row.kind, id: row.id, name: local.name });
    } else if (local.status === 'absent') {
      absent.push(row);
    } else {
      (needsFetch[row.kind] ??= []).push(row.id);
    }
  }

  return { named, needsFetch, absent };
}

export function applyFetchedNames(
  plan: LoadPlan,
  rows: CollectionRow[],
  fetched: ReadonlyMap<string, string>,
): { refs: UnstampedRef[]; unnamed: CollectionRow[] } {
  const byId = new Map(plan.named.map((ref) => [`${ref.kind}:${ref.id}`, ref.name]));
  const refs: UnstampedRef[] = [];
  const unnamed: CollectionRow[] = [];

  for (const row of rows) {
    const key = `${row.kind}:${row.id}`;
    const name = byId.get(key) ?? fetched.get(key);
    if (name === undefined || name.length === 0) unnamed.push(row);
    else refs.push({ kind: row.kind, id: row.id, name });
  }

  return { refs, unnamed };
}
