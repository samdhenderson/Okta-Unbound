import { createLogger } from '../../shared/utils/logger';

const log = createLogger('EntityCache');

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const KEY_SEP = '\u0000';

export type EntityKey = string | ReadonlyArray<string | number>;

export interface EntityCacheOptions {
  ttl?: number;
}

export interface PeekedEntry<T> {
  data: T;
  isFresh: boolean;
}

interface StoredEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const store = new Map<string, StoredEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const subscribers = new Map<string, Set<() => void>>();

export function serializeKey(key: EntityKey): string {
  return typeof key === 'string' ? key : key.map(String).join(KEY_SEP);
}

function notify(serialized: string): void {
  const subs = subscribers.get(serialized);
  if (!subs) return;
  for (const cb of subs) cb();
}

export function peekEntry<T>(key: EntityKey): PeekedEntry<T> | null {
  const entry = store.get(serializeKey(key)) as StoredEntry<T> | undefined;
  if (!entry) return null;
  return { data: entry.data, isFresh: Date.now() <= entry.expiresAt };
}

export function peek<T>(key: EntityKey): T | null {
  const peeked = peekEntry<T>(key);
  return peeked && peeked.isFresh ? peeked.data : null;
}

export function setEntry<T>(key: EntityKey, data: T, options: EntityCacheOptions = {}): void {
  const serialized = serializeKey(key);
  const now = Date.now();
  store.set(serialized, {
    data,
    timestamp: now,
    expiresAt: now + (options.ttl ?? DEFAULT_TTL),
  });
  log.debug('Set entry', { key: serialized });
  notify(serialized);
}

export function invalidate(key: EntityKey): void {
  const target = serializeKey(key);
  const childPrefix = target + KEY_SEP;
  const removed: string[] = [];
  for (const serialized of store.keys()) {
    if (serialized === target || serialized.startsWith(childPrefix)) {
      removed.push(serialized);
    }
  }
  for (const serialized of removed) {
    store.delete(serialized);
    inFlight.delete(serialized);
    notify(serialized);
  }
  if (removed.length) log.debug('Invalidated', { key: target, count: removed.length });
}

function fetchAndStore<T>(
  serialized: string,
  key: EntityKey,
  fetcher: () => Promise<T>,
  options: EntityCacheOptions,
): Promise<T> {
  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      setEntry(key, data, options);
      return data;
    })
    .finally(() => {
      if (inFlight.get(serialized) === promise) inFlight.delete(serialized);
    });
  inFlight.set(serialized, promise);
  return promise;
}

export function getOrFetch<T>(
  key: EntityKey,
  fetcher: () => Promise<T>,
  options: EntityCacheOptions & { force?: boolean } = {},
): Promise<T> {
  const serialized = serializeKey(key);
  const { force, ...cacheOptions } = options;

  if (!force) {
    const fresh = peek<T>(key);
    if (fresh !== null) return Promise.resolve(fresh);

    const existing = inFlight.get(serialized) as Promise<T> | undefined;
    if (existing) return existing;
  }

  return fetchAndStore(serialized, key, fetcher, cacheOptions);
}

export function subscribe(key: EntityKey, callback: () => void): () => void {
  const serialized = serializeKey(key);
  let subs = subscribers.get(serialized);
  if (!subs) {
    subs = new Set();
    subscribers.set(serialized, subs);
  }
  subs.add(callback);
  return () => {
    const set = subscribers.get(serialized);
    if (!set) return;
    set.delete(callback);
    if (set.size === 0) subscribers.delete(serialized);
  };
}

export function resetEntityCache(): void {
  store.clear();
  inFlight.clear();
  subscribers.clear();
}
