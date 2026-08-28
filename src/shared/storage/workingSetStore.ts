import { createLogger } from '../utils/logger';

const log = createLogger('WorkingSetStore');

export const WORKING_SET_STORAGE_KEY = 'okta_unbound_working_set';

export const RECENT_LIMIT = 5;

export const PINNED_LIMIT = 20;

export const RECENT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type WorkingSetKind = 'group' | 'user';

export interface WorkingSetRef {
  kind: WorkingSetKind;
  id: string;
  name: string;
  lastPane?: string;
  lastSeenAt: number;
}

export interface WorkingSet {
  pinned: WorkingSetRef[];
  recent: WorkingSetRef[];
}

interface WorkingSetFile {
  version: 1;
  origins: Record<string, WorkingSet>;
}

export const EMPTY_WORKING_SET: WorkingSet = { pinned: [], recent: [] };

function isRef(value: unknown): value is WorkingSetRef {
  if (!value || typeof value !== 'object') return false;
  const ref = value as Partial<WorkingSetRef>;
  return (
    (ref.kind === 'group' || ref.kind === 'user') &&
    typeof ref.id === 'string' &&
    ref.id.length > 0 &&
    typeof ref.name === 'string' &&
    typeof ref.lastSeenAt === 'number' &&
    (ref.lastPane === undefined || typeof ref.lastPane === 'string')
  );
}

export function normalizeFile(raw: unknown): WorkingSetFile {
  const empty: WorkingSetFile = { version: 1, origins: {} };
  if (!raw || typeof raw !== 'object') return empty;
  const file = raw as Partial<WorkingSetFile>;
  if (file.version !== 1 || !file.origins || typeof file.origins !== 'object') return empty;

  const origins: Record<string, WorkingSet> = {};
  for (const [origin, set] of Object.entries(file.origins)) {
    if (!set || typeof set !== 'object') continue;
    const { pinned, recent } = set as Partial<WorkingSet>;
    origins[origin] = {
      pinned: Array.isArray(pinned) ? pinned.filter(isRef).slice(0, PINNED_LIMIT) : [],
      recent: Array.isArray(recent) ? recent.filter(isRef).slice(0, RECENT_LIMIT) : [],
    };
  }
  return { version: 1, origins };
}

const same = (a: { kind: WorkingSetKind; id: string }, b: { kind: WorkingSetKind; id: string }) =>
  a.kind === b.kind && a.id === b.id;

export function prune(set: WorkingSet, now: number): WorkingSet {
  const fresh = set.recent.filter((ref) => now - ref.lastSeenAt < RECENT_TTL_MS);
  return fresh.length === set.recent.length ? set : { ...set, recent: fresh };
}

export function applyTouch(set: WorkingSet, ref: WorkingSetRef): WorkingSet {
  const pinnedIndex = set.pinned.findIndex((entry) => same(entry, ref));
  if (pinnedIndex >= 0) {
    const pinned = [...set.pinned];
    pinned[pinnedIndex] = { ...pinned[pinnedIndex], ...ref };
    return { pinned, recent: set.recent };
  }
  const recent = [ref, ...set.recent.filter((entry) => !same(entry, ref))].slice(0, RECENT_LIMIT);
  return { pinned: set.pinned, recent };
}

export function applyPin(set: WorkingSet, ref: WorkingSetRef): WorkingSet {
  if (set.pinned.some((entry) => same(entry, ref))) return set;
  if (set.pinned.length >= PINNED_LIMIT) {
    log.warn('Pin limit reached', { code: 'working_set_pin_limit', limit: PINNED_LIMIT });
    return set;
  }
  return {
    pinned: [...set.pinned, ref],
    recent: set.recent.filter((entry) => !same(entry, ref)),
  };
}

export function applyUnpin(set: WorkingSet, ref: { kind: WorkingSetKind; id: string }): WorkingSet {
  return { pinned: set.pinned.filter((entry) => !same(entry, ref)), recent: set.recent };
}

class WorkingSetStore {
  private async readFile(): Promise<WorkingSetFile> {
    try {
      const stored = await chrome.storage.local.get(WORKING_SET_STORAGE_KEY);
      return normalizeFile(stored?.[WORKING_SET_STORAGE_KEY]);
    } catch {
      log.error('Failed to read the working set', { code: 'working_set_read_failed' });
      return { version: 1, origins: {} };
    }
  }

  private async writeFile(file: WorkingSetFile): Promise<void> {
    try {
      await chrome.storage.local.set({ [WORKING_SET_STORAGE_KEY]: file });
    } catch {
      log.error('Failed to write the working set', { code: 'working_set_write_failed' });
    }
  }

  async read(origin: string | null | undefined, now = Date.now()): Promise<WorkingSet> {
    if (!origin) return EMPTY_WORKING_SET;
    const file = await this.readFile();
    const set = file.origins[origin];
    if (!set) return EMPTY_WORKING_SET;
    const pruned = prune(set, now);
    if (pruned !== set) {
      await this.writeFile({ ...file, origins: { ...file.origins, [origin]: pruned } });
    }
    return pruned;
  }

  private async update(
    origin: string | null | undefined,
    mutate: (set: WorkingSet) => WorkingSet,
    now: number,
  ): Promise<WorkingSet> {
    if (!origin) return EMPTY_WORKING_SET;
    const file = await this.readFile();
    const next = mutate(prune(file.origins[origin] ?? EMPTY_WORKING_SET, now));
    await this.writeFile({ ...file, origins: { ...file.origins, [origin]: next } });
    return next;
  }

  async touch(
    origin: string | null | undefined,
    ref: Omit<WorkingSetRef, 'lastSeenAt'>,
    now = Date.now(),
  ): Promise<WorkingSet> {
    return this.update(origin, (set) => applyTouch(set, { ...ref, lastSeenAt: now }), now);
  }

  async togglePin(
    origin: string | null | undefined,
    ref: Omit<WorkingSetRef, 'lastSeenAt'>,
    now = Date.now(),
  ): Promise<WorkingSet> {
    return this.update(
      origin,
      (set) =>
        set.pinned.some((entry) => same(entry, ref))
          ? applyUnpin(set, ref)
          : applyPin(set, { ...ref, lastSeenAt: now }),
      now,
    );
  }

  async forget(
    origin: string | null | undefined,
    ref: { kind: WorkingSetKind; id: string },
    now = Date.now(),
  ): Promise<WorkingSet> {
    return this.update(
      origin,
      (set) => ({
        pinned: set.pinned.filter((entry) => !same(entry, ref)),
        recent: set.recent.filter((entry) => !same(entry, ref)),
      }),
      now,
    );
  }

  async clearOrigin(origin: string): Promise<void> {
    const file = await this.readFile();
    if (!(origin in file.origins)) return;
    const origins = { ...file.origins };
    delete origins[origin];
    await this.writeFile({ ...file, origins });
    log.info('Cleared the working set for one origin', { code: 'working_set_cleared' });
  }

  subscribe(listener: (file: WorkingSetFile) => void): () => void {
    const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !(WORKING_SET_STORAGE_KEY in changes)) return;
      listener(normalizeFile(changes[WORKING_SET_STORAGE_KEY]?.newValue));
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }

  select(file: { origins: Record<string, WorkingSet> }, origin: string | null | undefined) {
    return (origin && file.origins[origin]) || EMPTY_WORKING_SET;
  }
}

export const workingSetStore = new WorkingSetStore();
