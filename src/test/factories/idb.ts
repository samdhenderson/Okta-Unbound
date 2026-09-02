type Table = Map<string, unknown>;

export interface FakeIdb {
  get: (name: string, key: unknown) => Promise<unknown>;
  put: (name: string, value: unknown, key?: unknown) => Promise<unknown>;
  delete: (name: string, key: unknown) => Promise<void>;
  getAllFromIndex: (name: string, index: string, origin: string) => Promise<unknown[]>;
  getAllKeysFromIndex: (name: string, index: string, origin: string) => Promise<unknown[]>;
  transaction: (name: string) => {
    store: { put: (value: unknown) => Promise<void>; delete: (key: unknown) => Promise<void> };
    done: Promise<void>;
  };
}

export interface CreateFakeIdbOptions {
  primaryKeyOf?: (name: string, value: unknown) => unknown;
}

const keyOf = (key: unknown): string => (Array.isArray(key) ? key.join('::') : String(key));

export function createFakeIdb(options: CreateFakeIdbOptions = {}): {
  fakeDB: FakeIdb;
  tables: Map<string, Table>;
  control: { failAll: boolean };
} {
  const tables = new Map<string, Table>();
  const control = { failAll: false };

  const table = (name: string): Table => {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name) as Table;
  };
  const guard = (): void => {
    if (control.failAll) throw new Error('IndexedDB unavailable');
  };
  const persist = (name: string, value: unknown): void => {
    const key = options.primaryKeyOf ? options.primaryKeyOf(name, value) : undefined;
    if (key !== undefined) table(name).set(keyOf(key), value);
  };

  const fakeDB: FakeIdb = {
    get: async (name, key) => {
      guard();
      return table(name).get(keyOf(key));
    },
    put: async (name, value) => {
      guard();
      persist(name, value);
    },
    delete: async (name, key) => {
      guard();
      table(name).delete(keyOf(key));
    },
    getAllFromIndex: async (name, _index, origin) => {
      guard();
      return [...table(name).values()].filter((v) => (v as { origin: string }).origin === origin);
    },
    getAllKeysFromIndex: async (name, _index, origin) => {
      guard();
      const primaryKeyOf = options.primaryKeyOf;
      if (!primaryKeyOf) return [];
      return [...table(name).values()]
        .filter((v) => (v as { origin: string }).origin === origin)
        .map((v) => primaryKeyOf(name, v));
    },
    transaction: (name) => {
      guard();
      return {
        store: {
          put: async (value: unknown) => {
            guard();
            persist(name, value);
          },
          delete: async (key: unknown) => {
            guard();
            table(name).delete(keyOf(key));
          },
        },
        done: Promise.resolve(),
      };
    },
  };

  return { fakeDB, tables, control };
}
