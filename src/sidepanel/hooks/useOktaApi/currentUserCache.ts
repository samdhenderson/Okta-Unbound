export interface CurrentUserIdentity {
  email: string;
  id: string;
}

export const CURRENT_USER_TTL_MS = 5 * 60 * 1000;

const cache = new Map<number, { value: CurrentUserIdentity; expiresAt: number }>();

export function getCachedCurrentUser(tabId: number): CurrentUserIdentity | null {
  const entry = cache.get(tabId);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(tabId);
    return null;
  }
  return entry.value;
}

export function cacheCurrentUser(tabId: number, value: CurrentUserIdentity): void {
  cache.set(tabId, { value, expiresAt: Date.now() + CURRENT_USER_TTL_MS });
}

export function resetCurrentUserCache(): void {
  cache.clear();
}
