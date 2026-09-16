import type { BasketVerb, VerbPath } from './types';
import type { SelectionBasket, SelectionKind } from '../selectionStore';

type VerbExport = BasketVerb | BasketVerb[];

interface VerbModule {
  default: VerbExport;
}

const verbModules = import.meta.glob<VerbModule>(
  ['./definitions/*.ts', '!./definitions/*.test.ts'],
  { eager: true },
);

export function buildVerbRegistry(): Record<string, BasketVerb> {
  const verbs = Object.values(verbModules).flatMap((mod) =>
    Array.isArray(mod.default) ? mod.default : [mod.default],
  );
  return Object.fromEntries(verbs.map((verb) => [verb.id, verb]));
}

export function verbsForPath(registry: Record<string, BasketVerb>, path: VerbPath): BasketVerb[] {
  return Object.values(registry)
    .filter((verb) => verb.path === path)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function isVerbAvailable(
  verb: BasketVerb,
  counts: Partial<Record<SelectionKind, number>>,
  basket: SelectionBasket,
): boolean {
  const hasEveryKind = verb.needs.every((kind) => (counts[kind] ?? 0) > 0);
  if (!hasEveryKind) return false;
  return verb.isAvailable?.(basket) ?? true;
}

export function availableVerbs(
  verbs: readonly BasketVerb[],
  counts: Partial<Record<SelectionKind, number>>,
  basket: SelectionBasket,
): BasketVerb[] {
  return verbs.filter((verb) => isVerbAvailable(verb, counts, basket));
}

export function missingKinds(
  verb: BasketVerb,
  counts: Partial<Record<SelectionKind, number>>,
): SelectionKind[] {
  return verb.needs.filter((kind) => (counts[kind] ?? 0) === 0);
}
