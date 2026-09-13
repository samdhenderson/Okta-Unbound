import { createLogger } from '../../shared/utils/logger';
import type { SelectionKind } from './selectionStore';

const log = createLogger('CollectionStore');

export const COLLECTIONS_STORAGE_KEY = 'okta_unbound_collections';

export const COLLECTION_LIMIT = 20;

export const COLLECTION_ROW_LIMIT = 2000;

export const COLLECTION_NAME_MAX = 80;

export interface CollectionRow {
  kind: SelectionKind;
  id: string;
  name?: string;
}

export interface Collection {
  id: string;
  name: string;
  rows: CollectionRow[];
  savedAt: number;
}

interface CollectionFile {
  version: 1;
  origins: Record<string, Collection[]>;
}

export const EMPTY_COLLECTIONS: readonly Collection[] = [];

const KINDS: readonly SelectionKind[] = ['rule', 'group', 'user', 'app', 'policy'];

function isRow(value: unknown): value is CollectionRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<CollectionRow>;
  return (
    typeof row.kind === 'string' &&
    (KINDS as readonly string[]).includes(row.kind) &&
    typeof row.id === 'string' &&
    row.id.length > 0 &&
    (row.name === undefined || typeof row.name === 'string')
  );
}

function isCollection(value: unknown): value is Collection {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<Collection>;
  return (
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    typeof entry.name === 'string' &&
    entry.name.trim().length > 0 &&
    typeof entry.savedAt === 'number' &&
    Array.isArray(entry.rows)
  );
}

export function normalizeFile(raw: unknown): CollectionFile {
  const empty: CollectionFile = { version: 1, origins: {} };
  if (!raw || typeof raw !== 'object') return empty;
  const file = raw as Partial<CollectionFile>;
  if (file.version !== 1 || !file.origins || typeof file.origins !== 'object') return empty;

  const origins: Record<string, Collection[]> = {};
  for (const [origin, saved] of Object.entries(file.origins)) {
    if (!Array.isArray(saved)) continue;
    origins[origin] = saved
      .filter(isCollection)
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        savedAt: entry.savedAt,
        rows: entry.rows.filter(isRow).slice(0, COLLECTION_ROW_LIMIT),
      }))
      .slice(0, COLLECTION_LIMIT);
  }
  return { version: 1, origins };
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export type SaveRefusal =
  'duplicate-name' | 'blank-name' | 'name-too-long' | 'too-many' | 'too-big' | 'no-origin';

export interface SaveOutcome {
  collections: Collection[];
  saved: Collection | null;
  refused: SaveRefusal | null;
}

export function applySave(collections: Collection[], candidate: Collection): SaveOutcome {
  const refuse = (refused: SaveRefusal): SaveOutcome => {
    log.warn('Refused to save a collection', { code: `collection_${refused.replace(/-/g, '_')}` });
    return { collections, saved: null, refused };
  };

  const name = candidate.name.trim();
  if (name.length === 0) return refuse('blank-name');
  if (name.length > COLLECTION_NAME_MAX) return refuse('name-too-long');
  if (collections.some((entry) => sameName(entry.name, name))) return refuse('duplicate-name');
  if (collections.length >= COLLECTION_LIMIT) return refuse('too-many');
  if (candidate.rows.length > COLLECTION_ROW_LIMIT) return refuse('too-big');

  const saved: Collection = { ...candidate, name };
  return { collections: [saved, ...collections], saved, refused: null };
}

export function applyDelete(collections: Collection[], id: string): Collection[] {
  const next = collections.filter((entry) => entry.id !== id);
  return next.length === collections.length ? collections : next;
}

export function applyRename(collections: Collection[], id: string, name: string): SaveOutcome {
  const refuse = (refused: SaveRefusal): SaveOutcome => {
    log.warn('Refused to rename a collection', {
      code: `collection_${refused.replace(/-/g, '_')}`,
    });
    return { collections, saved: null, refused };
  };

  const trimmed = name.trim();
  if (trimmed.length === 0) return refuse('blank-name');
  if (trimmed.length > COLLECTION_NAME_MAX) return refuse('name-too-long');
  if (collections.some((entry) => entry.id !== id && sameName(entry.name, trimmed))) {
    return refuse('duplicate-name');
  }

  const target = collections.find((entry) => entry.id === id);
  if (!target) return { collections, saved: null, refused: null };

  const saved: Collection = { ...target, name: trimmed };
  return {
    collections: collections.map((entry) => (entry.id === id ? saved : entry)),
    saved,
    refused: null,
  };
}

class CollectionStore {
  private async readFile(): Promise<CollectionFile> {
    try {
      const stored = await chrome.storage.local.get(COLLECTIONS_STORAGE_KEY);
      return normalizeFile(stored?.[COLLECTIONS_STORAGE_KEY]);
    } catch {
      log.error('Failed to read saved collections', { code: 'collections_read_failed' });
      return { version: 1, origins: {} };
    }
  }

  private async writeFile(file: CollectionFile): Promise<void> {
    try {
      await chrome.storage.local.set({ [COLLECTIONS_STORAGE_KEY]: file });
    } catch {
      log.error('Failed to write saved collections', { code: 'collections_write_failed' });
    }
  }

  async read(origin: string | null | undefined): Promise<Collection[]> {
    if (!origin) return [...EMPTY_COLLECTIONS];
    const file = await this.readFile();
    return file.origins[origin] ?? [];
  }

  private async update<T>(
    origin: string | null | undefined,
    mutate: (collections: Collection[]) => { collections: Collection[]; result: T },
    fallback: T,
  ): Promise<T> {
    if (!origin) return fallback;
    const file = await this.readFile();
    const { collections, result } = mutate(file.origins[origin] ?? []);
    await this.writeFile({ ...file, origins: { ...file.origins, [origin]: collections } });
    return result;
  }

  async save(
    origin: string | null | undefined,
    name: string,
    rows: CollectionRow[],
    now = Date.now(),
    id: string = crypto.randomUUID(),
  ): Promise<SaveOutcome> {
    const noOrigin: SaveOutcome = { collections: [], saved: null, refused: 'no-origin' };
    return this.update(
      origin,
      (collections) => {
        const outcome = applySave(collections, { id, name, rows, savedAt: now });
        return { collections: outcome.collections, result: outcome };
      },
      noOrigin,
    );
  }

  async remove(origin: string | null | undefined, id: string): Promise<Collection[]> {
    return this.update(
      origin,
      (collections) => {
        const next = applyDelete(collections, id);
        return { collections: next, result: next };
      },
      [],
    );
  }

  async rename(origin: string | null | undefined, id: string, name: string): Promise<SaveOutcome> {
    const noOrigin: SaveOutcome = { collections: [], saved: null, refused: 'no-origin' };
    return this.update(
      origin,
      (collections) => {
        const outcome = applyRename(collections, id, name);
        return { collections: outcome.collections, result: outcome };
      },
      noOrigin,
    );
  }

  async clearOrigin(origin: string): Promise<void> {
    const file = await this.readFile();
    if (!(origin in file.origins)) return;
    const origins = { ...file.origins };
    delete origins[origin];
    await this.writeFile({ ...file, origins });
    log.info('Cleared saved collections for one origin', { code: 'collections_cleared' });
  }

  subscribe(listener: (file: { origins: Record<string, Collection[]> }) => void): () => void {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !(COLLECTIONS_STORAGE_KEY in changes)) return;
      listener(normalizeFile(changes[COLLECTIONS_STORAGE_KEY]?.newValue));
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }

  select(
    file: { origins: Record<string, Collection[]> },
    origin: string | null | undefined,
  ): Collection[] {
    return (origin && file.origins[origin]) || [];
  }
}

export const collectionStore = new CollectionStore();
