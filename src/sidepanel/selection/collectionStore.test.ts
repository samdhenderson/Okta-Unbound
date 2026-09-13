import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  collectionStore,
  normalizeFile,
  applySave,
  applyDelete,
  applyRename,
  COLLECTIONS_STORAGE_KEY,
  COLLECTION_LIMIT,
  COLLECTION_ROW_LIMIT,
  COLLECTION_NAME_MAX,
  EMPTY_COLLECTIONS,
  type Collection,
  type CollectionRow,
} from './collectionStore';

const ORG_A = 'https://a.example.okta.com';
const ORG_B = 'https://b.example.okta.com';

const NOW = 1_800_000_000_000;

const storage = chrome.storage.local as unknown as {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

let store: Record<string, unknown> = {};

beforeEach(() => {
  vi.clearAllMocks();
  store = {};
  storage.get.mockImplementation(async (key: string) =>
    key in store ? { [key]: store[key] } : {},
  );
  storage.set.mockImplementation(async (items: Record<string, unknown>) => {
    Object.assign(store, items);
  });
});

const row = (over: Partial<CollectionRow> = {}): CollectionRow => ({
  kind: 'group',
  id: '00gFAKE0000000000001',
  ...over,
});

const collection = (over: Partial<Collection> = {}): Collection => ({
  id: 'c1',
  name: 'Marketing',
  rows: [row()],
  savedAt: NOW,
  ...over,
});

describe('normalizeFile', () => {
  it.each([null, 'nonsense', 42, {}, { version: 2, origins: {} }, { version: 1, origins: 'x' }])(
    'returns an empty file for %p rather than throwing',
    (raw) => {
      expect(normalizeFile(raw)).toEqual({ version: 1, origins: {} });
    },
  );

  it('drops an origin entry that is not an array rather than throwing', () => {
    const file = normalizeFile({
      version: 1,
      origins: { [ORG_A]: 'not an array' },
    });
    expect(file.origins[ORG_A]).toBeUndefined();
  });

  it('filters out collections missing required fields', () => {
    const file = normalizeFile({
      version: 1,
      origins: {
        [ORG_A]: [
          collection(),
          { id: 'c2' }, // missing name, rows, savedAt
          null,
          { id: 'c3', name: '   ', rows: [], savedAt: NOW }, // blank name
          { id: '', name: 'blank id', rows: [], savedAt: NOW }, // blank id
          { id: 'c4', name: 'ok', rows: 'not an array', savedAt: NOW },
        ],
      },
    });
    expect(file.origins[ORG_A]).toEqual([collection()]);
  });

  it('filters out rows with an unknown kind or a non-string/empty id', () => {
    const withBadRows = collection({
      rows: [
        row(),
        { kind: 'not-a-kind', id: 'x' } as unknown as CollectionRow,
        { kind: 'group', id: '' } as unknown as CollectionRow,
        { kind: 'group', id: 42 } as unknown as CollectionRow,
      ],
    });
    const file = normalizeFile({ version: 1, origins: { [ORG_A]: [withBadRows] } });
    expect(file.origins[ORG_A]).toEqual([collection()]);
  });

  it('re-applies the collection cap to an over-sized stored file', () => {
    const many = Array.from({ length: COLLECTION_LIMIT + 5 }, (_, i) =>
      collection({ id: `c${i}`, name: `Collection ${i}` }),
    );
    const file = normalizeFile({ version: 1, origins: { [ORG_A]: many } });
    expect(file.origins[ORG_A]).toHaveLength(COLLECTION_LIMIT);
  });

  it('re-applies the per-collection row cap to an over-sized stored file', () => {
    const manyRows = Array.from({ length: COLLECTION_ROW_LIMIT + 5 }, (_, i) =>
      row({ id: `00gFAKE${i}` }),
    );
    const file = normalizeFile({
      version: 1,
      origins: { [ORG_A]: [collection({ rows: manyRows })] },
    });
    expect(file.origins[ORG_A][0].rows).toHaveLength(COLLECTION_ROW_LIMIT);
  });
});

describe('applySave', () => {
  it('adds a collection to the front', () => {
    const outcome = applySave([], collection());
    expect(outcome.refused).toBeNull();
    expect(outcome.saved).toEqual(collection());
    expect(outcome.collections).toEqual([collection()]);
  });

  it('refuses a blank name, leaving the collections unchanged', () => {
    const existing = [collection()];
    const outcome = applySave(existing, collection({ id: 'c2', name: '   ' }));
    expect(outcome.refused).toBe('blank-name');
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toBe(existing);
  });

  it('refuses a name over the max length, leaving the collections unchanged', () => {
    const existing = [collection()];
    const tooLong = 'x'.repeat(COLLECTION_NAME_MAX + 1);
    const outcome = applySave(existing, collection({ id: 'c2', name: tooLong }));
    expect(outcome.refused).toBe('name-too-long');
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toBe(existing);
  });

  it('refuses a duplicate name case-insensitively and ignoring surrounding whitespace', () => {
    const existing = [collection({ name: 'Marketing' })];
    const outcome = applySave(existing, collection({ id: 'c2', name: '  marketing  ' }));
    expect(outcome.refused).toBe('duplicate-name');
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toBe(existing);
  });

  it(`refuses the ${COLLECTION_LIMIT + 1}th collection rather than truncating`, () => {
    const existing = Array.from({ length: COLLECTION_LIMIT }, (_, i) =>
      collection({ id: `c${i}`, name: `Collection ${i}` }),
    );
    const outcome = applySave(existing, collection({ id: 'new', name: 'One more' }));
    expect(outcome.refused).toBe('too-many');
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toEqual(existing);
    expect(outcome.collections).toBe(existing);
  });

  it('refuses a candidate with more rows than the row limit, leaving the collections unchanged', () => {
    const existing = [collection()];
    const tooManyRows = Array.from({ length: COLLECTION_ROW_LIMIT + 1 }, (_, i) =>
      row({ id: `00gFAKE${i}` }),
    );
    const outcome = applySave(existing, collection({ id: 'c2', name: 'Sales', rows: tooManyRows }));
    expect(outcome.refused).toBe('too-big');
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toBe(existing);
  });
});

describe('applyDelete', () => {
  it('removes exactly the matching collection', () => {
    const a = collection({ id: 'a' });
    const b = collection({ id: 'b', name: 'Sales' });
    const next = applyDelete([a, b], 'a');
    expect(next).toEqual([b]);
  });

  it('returns the same array identity when the id is absent — a no-op delete does not repaint', () => {
    const existing = [collection({ id: 'a' })];
    expect(applyDelete(existing, 'missing')).toBe(existing);
  });
});

describe('applyRename', () => {
  it('renames the target collection', () => {
    const existing = [collection({ id: 'a', name: 'Old name' })];
    const outcome = applyRename(existing, 'a', 'New name');
    expect(outcome.refused).toBeNull();
    expect(outcome.saved?.name).toBe('New name');
    expect(outcome.collections[0].name).toBe('New name');
  });

  it('refuses a collision with a different collection', () => {
    const existing = [
      collection({ id: 'a', name: 'Marketing' }),
      collection({ id: 'b', name: 'Sales' }),
    ];
    const outcome = applyRename(existing, 'b', 'marketing');
    expect(outcome.refused).toBe('duplicate-name');
    expect(outcome.collections).toBe(existing);
  });

  it('allows renaming a collection to its own name, only case changed', () => {
    const existing = [collection({ id: 'a', name: 'Marketing' })];
    const outcome = applyRename(existing, 'a', 'MARKETING');
    expect(outcome.refused).toBeNull();
    expect(outcome.collections[0].name).toBe('MARKETING');
  });

  it('returns unchanged with refused null when the id does not exist', () => {
    const existing = [collection({ id: 'a' })];
    const outcome = applyRename(existing, 'missing', 'New name');
    expect(outcome.refused).toBeNull();
    expect(outcome.saved).toBeNull();
    expect(outcome.collections).toBe(existing);
  });

  it('refuses a blank or over-long new name', () => {
    const existing = [collection({ id: 'a' })];
    expect(applyRename(existing, 'a', '   ').refused).toBe('blank-name');
    expect(applyRename(existing, 'a', 'x'.repeat(COLLECTION_NAME_MAX + 1)).refused).toBe(
      'name-too-long',
    );
  });
});

describe('the store', () => {
  it('returns empty collections with no origin, rather than some other org’s rows', async () => {
    await collectionStore.save(ORG_A, 'Marketing', [row()], NOW, 'c1');
    expect(await collectionStore.read(null)).toEqual([...EMPTY_COLLECTIONS]);
    expect(await collectionStore.read(undefined)).toEqual([...EMPTY_COLLECTIONS]);
  });

  it('keeps two orgs apart', async () => {
    await collectionStore.save(ORG_A, 'Org A cohort', [row()], NOW, 'a1');
    await collectionStore.save(ORG_B, 'Org B cohort', [row()], NOW, 'b1');

    expect((await collectionStore.read(ORG_A)).map((c) => c.name)).toEqual(['Org A cohort']);
    expect((await collectionStore.read(ORG_B)).map((c) => c.name)).toEqual(['Org B cohort']);
  });

  it('never writes without an origin', async () => {
    const outcome = await collectionStore.save(null, 'Marketing', [row()], NOW, 'c1');
    expect(outcome.refused).toBe('no-origin');
    expect(storage.set).not.toHaveBeenCalled();
  });

  it('round-trips a user row saved with no name — names-off leaves nothing to read back', async () => {
    const userRows: CollectionRow[] = [
      { kind: 'user', id: '00uFAKE0000000000001' },
      { kind: 'user', id: '00uFAKE0000000000002' },
    ];
    await collectionStore.save(ORG_A, 'Anonymous cohort', userRows, NOW, 'c1');
    const [saved] = await collectionStore.read(ORG_A);
    expect(saved.rows).toHaveLength(2);
    for (const savedRow of saved.rows) {
      expect(savedRow.name).toBeUndefined();
    }
  });

  it('clears one org without touching the other', async () => {
    await collectionStore.save(ORG_A, 'Org A cohort', [row()], NOW, 'a1');
    await collectionStore.save(ORG_B, 'Org B cohort', [row()], NOW, 'b1');
    await collectionStore.clearOrigin(ORG_A);

    expect(await collectionStore.read(ORG_A)).toEqual([]);
    expect(await collectionStore.read(ORG_B)).toHaveLength(1);
  });

  it('removes a collection by id', async () => {
    await collectionStore.save(ORG_A, 'Marketing', [row()], NOW, 'c1');
    const remaining = await collectionStore.remove(ORG_A, 'c1');
    expect(remaining).toEqual([]);
  });

  it('renames a collection through the store', async () => {
    await collectionStore.save(ORG_A, 'Old name', [row()], NOW, 'c1');
    const outcome = await collectionStore.rename(ORG_A, 'c1', 'New name');
    expect(outcome.refused).toBeNull();
    expect((await collectionStore.read(ORG_A))[0].name).toBe('New name');
  });
});

describe('select', () => {
  it("returns that origin's collections", () => {
    const file = { origins: { [ORG_A]: [collection()] } };
    expect(collectionStore.select(file, ORG_A)).toEqual([collection()]);
  });

  it('returns an empty array for a blank origin', () => {
    const file = { origins: { [ORG_A]: [collection()] } };
    expect(collectionStore.select(file, null)).toEqual([]);
    expect(collectionStore.select(file, undefined)).toEqual([]);
    expect(collectionStore.select(file, '')).toEqual([]);
  });
});

describe('subscribe', () => {
  const onChanged = chrome.storage.onChanged as unknown as {
    addListener: ReturnType<typeof vi.fn>;
    removeListener: ReturnType<typeof vi.fn>;
  };

  it('registers a listener and the returned function removes it', () => {
    const listener = vi.fn();
    const unsubscribe = collectionStore.subscribe(listener);
    expect(onChanged.addListener).toHaveBeenCalledTimes(1);
    const handler = onChanged.addListener.mock.calls[0][0];

    unsubscribe();
    expect(onChanged.removeListener).toHaveBeenCalledWith(handler);
  });

  it('ignores changes to other keys', () => {
    const listener = vi.fn();
    collectionStore.subscribe(listener);
    const handler = onChanged.addListener.mock.calls[0][0];

    handler({ some_other_key: { newValue: {} } }, 'local');
    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores changes in other storage areas', () => {
    const listener = vi.fn();
    collectionStore.subscribe(listener);
    const handler = onChanged.addListener.mock.calls[0][0];

    handler({ [COLLECTIONS_STORAGE_KEY]: { newValue: { version: 1, origins: {} } } }, 'sync');
    expect(listener).not.toHaveBeenCalled();
  });

  it('calls the listener with the normalized new value on a matching change', () => {
    const listener = vi.fn();
    collectionStore.subscribe(listener);
    const handler = onChanged.addListener.mock.calls[0][0];

    const newValue = { version: 1, origins: { [ORG_A]: [collection()] } };
    handler({ [COLLECTIONS_STORAGE_KEY]: { newValue } }, 'local');
    expect(listener).toHaveBeenCalledWith(newValue);
  });
});
