export interface ResolvedActor {
  kind: 'resolved';
  email: string;
  id: string;
}

export type Actor = ResolvedActor | { kind: 'unavailable'; reason: ActorUnavailableReason };

type ActorUnavailableReason = 'threw' | 'failed' | 'no-email';

export const CURRENT_USER_TTL_MS = 5 * 60 * 1000;

const cache = new Map<number, { value: ResolvedActor; expiresAt: number }>();

export function getCachedCurrentUser(tabId: number): ResolvedActor | null {
  const entry = cache.get(tabId);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(tabId);
    return null;
  }
  return entry.value;
}

export function cacheCurrentUser(tabId: number, value: ResolvedActor): void {
  cache.set(tabId, { value, expiresAt: Date.now() + CURRENT_USER_TTL_MS });
}

export function resetCurrentUserCache(): void {
  cache.clear();
}
