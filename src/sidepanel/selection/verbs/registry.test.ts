import { describe, it, expect, vi } from 'vitest';
import {
  availableVerbs,
  buildVerbRegistry,
  isVerbAvailable,
  missingKinds,
  verbsForPath,
} from './registry';
import type { BasketVerb } from './types';
import type { SelectionBasket, SelectionKind, SelectionRef } from '../selectionStore';

function basketOf(kinds: SelectionKind[]): SelectionBasket {
  const picked: SelectionRef[] = kinds.map((kind, index) => ({
    kind,
    id: `${kind}-${index}`,
    name: `${kind} ${index}`,
    pickedAt: 1_700_000_000_000 + index,
  }));
  return { picked };
}

function countsOf(basket: SelectionBasket): Partial<Record<SelectionKind, number>> {
  const counts: Partial<Record<SelectionKind, number>> = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;
  return counts;
}

function verb(overrides: Partial<BasketVerb> & Pick<BasketVerb, 'id' | 'needs'>): BasketVerb {
  return {
    label: overrides.id,
    title: `Do ${overrides.id}`,
    path: 'read',
    cost: () => ({ requests: 0, writes: 0 }),
    run: vi.fn(async () => ({ status: 'done' as const, summary: 'Done.' })),
    ...overrides,
  };
}

describe('buildVerbRegistry', () => {
  it('keys every verb by its own id', () => {
    for (const [key, registered] of Object.entries(buildVerbRegistry())) {
      expect(registered.id).toBe(key);
    }
  });

  it('gives every verb a full-sentence title distinct from its short label', () => {
    for (const registered of Object.values(buildVerbRegistry())) {
      expect(registered.label.length).toBeGreaterThan(0);
      expect(registered.title.length).toBeGreaterThan(registered.label.length);
    }
  });

  it('names at least one object for every verb', () => {
    for (const registered of Object.values(buildVerbRegistry())) {
      expect(registered.needs.length).toBeGreaterThan(0);
    }
  });

  it('gives every write verb a preflight, because that is what the cap bites on', () => {
    for (const registered of Object.values(buildVerbRegistry())) {
      if (registered.path === 'write') expect(registered.preflight).toBeTypeOf('function');
    }
  });

  it('states why any extra condition withholds it', () => {
    for (const registered of Object.values(buildVerbRegistry())) {
      if (registered.isAvailable) expect(registered.unavailableReason).toBeTruthy();
    }
  });

  it('quotes a non-negative cost for a basket it is available against', () => {
    const basket = basketOf(['user', 'group', 'app', 'rule', 'policy']);
    for (const registered of Object.values(buildVerbRegistry())) {
      const cost = registered.cost(basket);
      expect(cost.requests).toBeGreaterThanOrEqual(0);
      expect(cost.writes).toBeGreaterThanOrEqual(0);
      if (registered.path !== 'write') expect(cost.writes).toBe(0);
    }
  });
});

describe('verbsForPath', () => {
  it('returns one pane’s verbs, sorted by title rather than by glob order', () => {
    const registry = {
      z: verb({ id: 'z', needs: ['user'], path: 'read', title: 'Zebra report' }),
      a: verb({ id: 'a', needs: ['user'], path: 'read', title: 'Apple report' }),
      w: verb({ id: 'w', needs: ['user'], path: 'write', title: 'A write' }),
    };

    expect(verbsForPath(registry, 'read').map((entry) => entry.id)).toEqual(['a', 'z']);
    expect(verbsForPath(registry, 'write').map((entry) => entry.id)).toEqual(['w']);
    expect(verbsForPath(registry, 'convert')).toEqual([]);
  });
});

describe('isVerbAvailable', () => {
  it('needs every named partition to be non-empty', () => {
    const combo = verb({ id: 'combo', needs: ['user', 'group'] });

    const usersOnly = basketOf(['user']);
    expect(isVerbAvailable(combo, countsOf(usersOnly), usersOnly)).toBe(false);

    const both = basketOf(['user', 'group']);
    expect(isVerbAvailable(combo, countsOf(both), both)).toBe(true);
  });

  it('ignores partitions it did not ask for', () => {
    const single = verb({ id: 'single', needs: ['group'] });
    const mixed = basketOf(['group', 'policy']);
    expect(isVerbAvailable(single, countsOf(mixed), mixed)).toBe(true);
  });

  it('applies an extra condition only once `needs` is satisfied', () => {
    const extra = vi.fn(() => false);
    const picky = verb({ id: 'picky', needs: ['user'], isAvailable: extra });

    const empty = basketOf([]);
    expect(isVerbAvailable(picky, countsOf(empty), empty)).toBe(false);
    expect(extra).not.toHaveBeenCalled();

    const users = basketOf(['user']);
    expect(isVerbAvailable(picky, countsOf(users), users)).toBe(false);
    expect(extra).toHaveBeenCalledWith(users);
  });
});

describe('availableVerbs', () => {
  it('omits what cannot run and keeps the order of what can', () => {
    const verbs = [
      verb({ id: 'first', needs: ['user'] }),
      verb({ id: 'combo', needs: ['user', 'group'] }),
      verb({ id: 'third', needs: ['user'] }),
    ];
    const basket = basketOf(['user']);

    expect(availableVerbs(verbs, countsOf(basket), basket).map((entry) => entry.id)).toEqual([
      'first',
      'third',
    ]);
  });

  it('lets a combination verb appear the moment its second partition fills', () => {
    const verbs = [verb({ id: 'combo', needs: ['user', 'group'] })];

    const before = basketOf(['user']);
    expect(availableVerbs(verbs, countsOf(before), before)).toEqual([]);

    const after = basketOf(['user', 'group']);
    expect(availableVerbs(verbs, countsOf(after), after).map((entry) => entry.id)).toEqual([
      'combo',
    ]);
  });
});

describe('missingKinds', () => {
  it('names which partitions are still empty, in `needs` order', () => {
    const combo = verb({ id: 'combo', needs: ['group', 'user'] });
    const basket = basketOf(['user']);
    expect(missingKinds(combo, countsOf(basket))).toEqual(['group']);
  });

  it('is empty once the verb can run', () => {
    const combo = verb({ id: 'combo', needs: ['group', 'user'] });
    const basket = basketOf(['group', 'user']);
    expect(missingKinds(combo, countsOf(basket))).toEqual([]);
  });
});
