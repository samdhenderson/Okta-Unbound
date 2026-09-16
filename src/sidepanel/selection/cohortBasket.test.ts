import { describe, it, expect, beforeEach } from 'vitest';
import { userCohortBasket } from './cohortBasket';
import { countsByKind, selectionStore } from './selectionStore';
import type { OktaUser } from '../../shared/types';

function member(n: number): OktaUser {
  return {
    id: `00uFAKE0000000000${n}`,
    status: 'ACTIVE',
    profile: {
      firstName: 'Ada',
      lastName: `Lovelace ${n}`,
      email: `member${n}@example.com`,
      login: `member${n}@example.com`,
    },
  };
}

const members = [member(1), member(2), member(3)];

beforeEach(() => {
  selectionStore.clearAll();
});

describe('userCohortBasket', () => {
  it('holds one user entry per member, in the order given', () => {
    const basket = userCohortBasket(members);

    expect(basket.picked.map((ref) => ref.id)).toEqual([
      '00uFAKE00000000001',
      '00uFAKE00000000002',
      '00uFAKE00000000003',
    ]);
    expect(basket.picked.every((ref) => ref.kind === 'user')).toBe(true);
  });

  it('names each entry the way the reader saw it', () => {
    const basket = userCohortBasket([member(1)]);

    expect(basket.picked[0].name).toBe('Ada Lovelace 1');
  });

  it('stamps one derivation time across the whole batch', () => {
    const basket = userCohortBasket(members);
    const stamps = new Set(basket.picked.map((ref) => ref.pickedAt));

    expect(stamps.size).toBe(1);
    expect(basket.picked[0].pickedAt).toBeGreaterThan(0);
  });

  it('counts as one non-empty user partition', () => {
    expect(countsByKind(userCohortBasket(members))).toEqual({ user: 3 });
  });

  it('reports an empty cohort as an absent partition, not a zero one', () => {
    const basket = userCohortBasket([]);

    expect(basket.picked).toEqual([]);
    expect(countsByKind(basket)).toEqual({});
  });

  it('writes nothing to the reader’s basket', () => {
    userCohortBasket(members);

    expect(selectionStore.getSnapshot().picked).toEqual([]);
  });

  it('leaves a basket the reader had already assembled exactly as it was', () => {
    selectionStore.toggle({ kind: 'group', id: '00gFAKE0000000001', name: 'Marketing' });
    const before = selectionStore.getSnapshot();

    userCohortBasket(members);

    expect(selectionStore.getSnapshot()).toBe(before);
  });
});
