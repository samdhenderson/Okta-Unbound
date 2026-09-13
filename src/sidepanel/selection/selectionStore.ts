import { createLogger } from '../../shared/utils/logger';
import type { EntityType } from '../contexts/NavigationContext';

const log = createLogger('SelectionStore');

export type SelectionKind = EntityType;

export const SELECTION_LIMIT = 2000;

export interface SelectionRef {
  kind: SelectionKind;
  id: string;
  name: string;
  pickedAt: number;
}

export interface SelectionBasket {
  picked: SelectionRef[];
}

export const EMPTY_BASKET: SelectionBasket = { picked: [] };

const same = (a: { kind: SelectionKind; id: string }, b: { kind: SelectionKind; id: string }) =>
  a.kind === b.kind && a.id === b.id;

export function countOfKind(basket: SelectionBasket, kind: SelectionKind): number {
  return basket.picked.reduce((n, ref) => (ref.kind === kind ? n + 1 : n), 0);
}

export function countsByKind(basket: SelectionBasket): Partial<Record<SelectionKind, number>> {
  const counts: Partial<Record<SelectionKind, number>> = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;
  return counts;
}

export function isPicked(basket: SelectionBasket, kind: SelectionKind, id: string): boolean {
  return basket.picked.some((ref) => same(ref, { kind, id }));
}

export function applyToggle(basket: SelectionBasket, ref: SelectionRef): SelectionBasket {
  if (isPicked(basket, ref.kind, ref.id)) return applyRemove(basket, ref);
  if (countOfKind(basket, ref.kind) >= SELECTION_LIMIT) {
    log.warn('Selection limit reached', {
      code: 'selection_limit_reached',
      kind: ref.kind,
      limit: SELECTION_LIMIT,
    });
    return basket;
  }
  return { picked: [...basket.picked, ref] };
}

export interface AddOutcome {
  basket: SelectionBasket;
  added: number;
  alreadyPicked: number;
  refused: number;
}

export function applyAddMany(basket: SelectionBasket, refs: SelectionRef[]): AddOutcome {
  const fresh = refs.filter((ref) => !isPicked(basket, ref.kind, ref.id));
  const alreadyPicked = refs.length - fresh.length;
  if (fresh.length === 0) return { basket, added: 0, alreadyPicked, refused: 0 };

  const wouldExceed = [...new Set(fresh.map((ref) => ref.kind))].some(
    (kind) =>
      countOfKind(basket, kind) + fresh.filter((ref) => ref.kind === kind).length > SELECTION_LIMIT,
  );
  if (wouldExceed) {
    log.warn('Bulk selection refused: over the limit', {
      code: 'selection_bulk_refused',
      count: fresh.length,
      limit: SELECTION_LIMIT,
    });
    return { basket, added: 0, alreadyPicked, refused: fresh.length };
  }
  return {
    basket: { picked: [...basket.picked, ...fresh] },
    added: fresh.length,
    alreadyPicked,
    refused: 0,
  };
}

export function applyReplaceKind(
  basket: SelectionBasket,
  kind: SelectionKind,
  refs: SelectionRef[],
): AddOutcome {
  if (refs.length > SELECTION_LIMIT) {
    log.warn('Replace refused: over the limit', {
      code: 'selection_replace_refused',
      kind,
      count: refs.length,
      limit: SELECTION_LIMIT,
    });
    return { basket, added: 0, alreadyPicked: 0, refused: refs.length };
  }
  const held = new Set(basket.picked.filter((ref) => ref.kind === kind).map((ref) => ref.id));
  const alreadyPicked = refs.reduce((n, ref) => (held.has(ref.id) ? n + 1 : n), 0);
  return {
    basket: { picked: [...basket.picked.filter((ref) => ref.kind !== kind), ...refs] },
    added: refs.length - alreadyPicked,
    alreadyPicked,
    refused: 0,
  };
}

export function applyRemove(
  basket: SelectionBasket,
  ref: { kind: SelectionKind; id: string },
): SelectionBasket {
  const picked = basket.picked.filter((entry) => !same(entry, ref));
  return picked.length === basket.picked.length ? basket : { picked };
}

export function applyClearKind(basket: SelectionBasket, kind: SelectionKind): SelectionBasket {
  const picked = basket.picked.filter((ref) => ref.kind !== kind);
  return picked.length === basket.picked.length ? basket : { picked };
}

export class SelectionStore {
  private basket: SelectionBasket = EMPTY_BASKET;
  private origin: string | null = null;
  private listeners = new Set<() => void>();

  private commit(next: SelectionBasket): SelectionBasket {
    if (next === this.basket) return this.basket;
    this.basket = next;
    for (const listener of this.listeners) listener();
    return this.basket;
  }

  getSnapshot(): SelectionBasket {
    return this.basket;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setOrigin(origin: string | null): void {
    if (origin === this.origin) return;
    const previous = this.origin;
    this.origin = origin;
    if (previous === null) return;
    if (this.basket.picked.length > 0) {
      log.info('Cleared the selection basket: the org changed', {
        code: 'selection_cleared_origin_change',
        count: this.basket.picked.length,
      });
    }
    this.commit(EMPTY_BASKET);
  }

  toggle(ref: Omit<SelectionRef, 'pickedAt'>, now = Date.now()): SelectionBasket {
    return this.commit(applyToggle(this.basket, { ...ref, pickedAt: now }));
  }

  addMany(refs: Omit<SelectionRef, 'pickedAt'>[], now = Date.now()): AddOutcome {
    const outcome = applyAddMany(
      this.basket,
      refs.map((ref) => ({ ...ref, pickedAt: now })),
    );
    this.commit(outcome.basket);
    return outcome;
  }

  remove(ref: { kind: SelectionKind; id: string }): SelectionBasket {
    return this.commit(applyRemove(this.basket, ref));
  }

  replaceKind(
    kind: SelectionKind,
    refs: Omit<SelectionRef, 'pickedAt'>[],
    now = Date.now(),
  ): AddOutcome {
    const outcome = applyReplaceKind(
      this.basket,
      kind,
      refs.map((ref) => ({ ...ref, pickedAt: now })),
    );
    this.commit(outcome.basket);
    return outcome;
  }

  clearKind(kind: SelectionKind): SelectionBasket {
    return this.commit(applyClearKind(this.basket, kind));
  }

  clearAll(): SelectionBasket {
    return this.commit(EMPTY_BASKET);
  }
}

export const selectionStore = new SelectionStore();
