import { describe, it, expect } from 'vitest';
import {
  applyToggle,
  applyAddMany,
  applyRemove,
  applyClearKind,
  countsByKind,
  countOfKind,
  isPicked,
  SELECTION_LIMIT,
  SelectionStore,
  EMPTY_BASKET,
  type SelectionBasket,
  type SelectionRef,
} from './selectionStore';

const userRef = (id: string, overrides: Partial<SelectionRef> = {}): SelectionRef => ({
  kind: 'user',
  id,
  name: 'user@example.com',
  pickedAt: 1000,
  ...overrides,
});

describe('applyToggle', () => {
  it('adds an entity on the first toggle and removes it on the second', () => {
    const ref = userRef('00uFAKE1');
    const afterAdd = applyToggle(EMPTY_BASKET, ref);
    expect(afterAdd.picked).toEqual([ref]);

    const afterRemove = applyToggle(afterAdd, ref);
    expect(afterRemove.picked).toEqual([]);
  });

  it('keeps a different kind at the same id as a separate entry (partition, not identity)', () => {
    const ruleRef: SelectionRef = { kind: 'rule', id: 'same-id', name: 'A rule', pickedAt: 1000 };
    const theUserRef: SelectionRef = {
      kind: 'user',
      id: 'same-id',
      name: 'A user',
      pickedAt: 1000,
    };

    const basket = applyToggle(applyToggle(EMPTY_BASKET, ruleRef), theUserRef);
    expect(basket.picked).toHaveLength(2);
  });

  it('ticking the same user id from two different notional surfaces yields exactly one entry', () => {
    const fromUsersTab = userRef('00uSHARED', { name: 'From the Users tab' });
    const fromGroupMembers = userRef('00uSHARED', { name: 'From a group member list' });

    const basket = applyToggle(applyToggle(EMPTY_BASKET, fromUsersTab), fromGroupMembers);

    expect(basket.picked).toHaveLength(0);

    const reTicked = applyToggle(basket, fromGroupMembers);
    expect(reTicked.picked).toHaveLength(1);
    expect(reTicked.picked[0].id).toBe('00uSHARED');
  });

  it('refuses to add past the per-kind cap, returning the same basket by identity', () => {
    let basket: SelectionBasket = EMPTY_BASKET;
    for (let i = 0; i < SELECTION_LIMIT; i++) {
      basket = applyToggle(basket, userRef(`00uFULL${i}`));
    }
    expect(countOfKind(basket, 'user')).toBe(SELECTION_LIMIT);

    const attempt = applyToggle(basket, userRef('00uOVERFLOW'));
    expect(attempt).toBe(basket);
    expect(countOfKind(attempt, 'user')).toBe(SELECTION_LIMIT);
  });
});

describe('applyAddMany', () => {
  it('reports added/alreadyPicked/refused and re-adding held rows costs nothing and does not re-date them', () => {
    const original = userRef('00uEXISTING', { pickedAt: 500 });
    const basket: SelectionBasket = { picked: [original] };

    const outcome = applyAddMany(basket, [
      userRef('00uNEW1', { pickedAt: 9999 }),
      userRef('00uNEW2', { pickedAt: 9999 }),
      userRef('00uEXISTING', { pickedAt: 9999, name: 'Renamed since' }),
    ]);

    expect(outcome.added).toBe(2);
    expect(outcome.alreadyPicked).toBe(1);
    expect(outcome.refused).toBe(0);
    expect(outcome.basket.picked).toHaveLength(3);

    const stillThere = outcome.basket.picked.find((ref) => ref.id === '00uEXISTING');
    expect(stillThere?.pickedAt).toBe(500);
    expect(stillThere?.name).toBe('user@example.com');
  });

  it('when a batch would cross the cap for one kind, adds none of it and refuses the whole fresh batch, leaving the basket unchanged', () => {
    let basket: SelectionBasket = EMPTY_BASKET;
    for (let i = 0; i < SELECTION_LIMIT - 1; i++) {
      basket = applyToggle(basket, userRef(`00uFULL${i}`));
    }
    expect(countOfKind(basket, 'user')).toBe(SELECTION_LIMIT - 1);

    const batch = [userRef('00uOVER1'), userRef('00uOVER2')];
    const outcome = applyAddMany(basket, batch);

    expect(outcome.added).toBe(0);
    expect(outcome.refused).toBe(batch.length);
    expect(outcome.alreadyPicked).toBe(0);
    expect(outcome.basket).toBe(basket);
  });

  it('does not refuse a fresh batch of one kind because a different kind is already full', () => {
    let basket: SelectionBasket = EMPTY_BASKET;
    for (let i = 0; i < SELECTION_LIMIT; i++) {
      basket = applyToggle(basket, {
        kind: 'group',
        id: `00gFULL${i}`,
        name: 'A group',
        pickedAt: 1,
      });
    }
    expect(countOfKind(basket, 'group')).toBe(SELECTION_LIMIT);

    const outcome = applyAddMany(basket, [userRef('00uUNRELATED')]);

    expect(outcome.refused).toBe(0);
    expect(outcome.added).toBe(1);
    expect(isPicked(outcome.basket, 'user', '00uUNRELATED')).toBe(true);
  });
});

describe('applyRemove / applyClearKind — no-op identity contract', () => {
  it('applyRemove returns the same basket object when the entity was never held', () => {
    const basket: SelectionBasket = { picked: [userRef('00uHELD')] };
    const result = applyRemove(basket, { kind: 'user', id: 'not-in-basket' });
    expect(result).toBe(basket);
  });

  it('applyClearKind returns the same basket object when that partition was already empty', () => {
    const basket: SelectionBasket = { picked: [userRef('00uHELD')] };
    const result = applyClearKind(basket, 'group');
    expect(result).toBe(basket);
  });
});

describe('countsByKind', () => {
  it('omits kinds with nothing ticked entirely, rather than reporting them as zero', () => {
    const basket: SelectionBasket = {
      picked: [
        userRef('00uA'),
        userRef('00uB'),
        { kind: 'group', id: '00gA', name: 'g', pickedAt: 1 },
      ],
    };
    const counts = countsByKind(basket);
    expect(counts).toEqual({ user: 2, group: 1 });
    expect(Object.prototype.hasOwnProperty.call(counts, 'rule')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(counts, 'app')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(counts, 'policy')).toBe(false);
  });
});

describe('SelectionStore — origin change is a security boundary, not bookkeeping', () => {
  it('a first origin resolving from null does not clear a basket assembled while the org was still resolving', () => {
    const store = new SelectionStore();
    store.toggle({ kind: 'user', id: '00uEARLY', name: 'Ticked before origin resolved' });
    expect(store.getSnapshot().picked).toHaveLength(1);

    store.setOrigin('https://example.okta.com');

    expect(store.getSnapshot().picked).toHaveLength(1);
  });

  it('a change from one non-null origin to another empties the basket, so one org cannot carry into the other', () => {
    const store = new SelectionStore();
    store.setOrigin('https://example.okta.com');
    store.toggle({ kind: 'user', id: '00uORGONE', name: 'Belongs to org one' });
    expect(store.getSnapshot().picked).toHaveLength(1);

    store.setOrigin('https://other.okta.com');

    expect(store.getSnapshot().picked).toHaveLength(0);
  });

  it('setting the same origin again is not a change and leaves the basket untouched', () => {
    const store = new SelectionStore();
    store.setOrigin('https://example.okta.com');
    store.toggle({ kind: 'user', id: '00uSAME', name: 'Still here' });

    store.setOrigin('https://example.okta.com');

    expect(store.getSnapshot().picked).toHaveLength(1);
  });
});
