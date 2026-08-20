import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  profileDisplayStore,
  DEFAULT_PROFILE_DISPLAY_CONFIG,
  type ProfileDisplayConfig,
} from '@/shared/storage/profileDisplayStore';

const PERSIST_DEBOUNCE_MS = 400;

export interface UseProfileDisplayConfig {
  config: ProfileDisplayConfig;
  isLoaded: boolean;
  update: (patch: Partial<ProfileDisplayConfig>) => void;
  reset: () => void;
}

function mergeRecord<T>(
  stored: Record<string, T>,
  patch: Record<string, T>,
  known: ReadonlySet<string>,
): Record<string, T> {
  const retained: Record<string, T> = {};
  for (const [name, value] of Object.entries(stored)) {
    if (!known.has(name)) retained[name] = value;
  }
  return { ...retained, ...patch };
}

function mergeOrder(
  stored: readonly string[],
  patch: readonly string[],
  known: ReadonlySet<string>,
): string[] {
  const incoming = patch.filter((name) => known.has(name));
  const merged: string[] = [];
  let next = 0;
  for (const name of stored) {
    if (known.has(name)) {
      if (next < incoming.length) merged.push(incoming[next++]);
    } else {
      merged.push(name);
    }
  }
  while (next < incoming.length) merged.push(incoming[next++]);
  return [...new Set(merged)];
}

function mergeStoredConfig(
  stored: ProfileDisplayConfig,
  patch: Partial<ProfileDisplayConfig>,
  known: ReadonlySet<string>,
): ProfileDisplayConfig {
  return {
    ...stored,
    ...patch,
    attrOrder: patch.attrOrder
      ? mergeOrder(stored.attrOrder, patch.attrOrder, known)
      : stored.attrOrder,
    assign: patch.assign ? mergeRecord(stored.assign, patch.assign, known) : stored.assign,
    hidden: patch.hidden ? mergeRecord(stored.hidden, patch.hidden, known) : stored.hidden,
  };
}

function reconcileConfig(
  stored: ProfileDisplayConfig,
  knownAttributeNames: readonly string[],
): ProfileDisplayConfig {
  const known = new Set(knownAttributeNames);
  const categoryKeys = new Set(stored.categories.map((category) => category.key));

  const attrOrder = [...new Set(stored.attrOrder.filter((name) => known.has(name)))];
  const placed = new Set(attrOrder);
  for (const name of knownAttributeNames) {
    if (!placed.has(name)) {
      attrOrder.push(name);
      placed.add(name);
    }
  }

  const assign: Record<string, string> = {};
  const hidden: Record<string, boolean> = {};
  for (const name of attrOrder) {
    const category = stored.assign[name];
    assign[name] = category && categoryKeys.has(category) ? category : '';
    if (stored.hidden[name]) hidden[name] = true;
  }

  return { ...stored, attrOrder, assign, hidden };
}

export function useProfileDisplayConfig(
  oktaOrigin: string | null | undefined,
  knownAttributeNames: readonly string[],
): UseProfileDisplayConfig {
  const [stored, setStored] = useState<ProfileDisplayConfig>(DEFAULT_PROFILE_DISPLAY_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  const knownKey = knownAttributeNames.join(',');
  const known = useMemo(
    () => new Set(knownAttributeNames),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- knownKey captures the contents
    [knownKey],
  );

  const storedRef = useRef<ProfileDisplayConfig>(DEFAULT_PROFILE_DISPLAY_CONFIG);
  const applyStored = useCallback((next: ProfileDisplayConfig) => {
    storedRef.current = next;
    setStored(next);
  }, []);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ oktaOrigin: string; config: ProfileDisplayConfig } | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void profileDisplayStore.saveConfig(pending.oktaOrigin, pending.config);
  }, []);

  const schedulePersist = useCallback(
    (config: ProfileDisplayConfig) => {
      if (!oktaOrigin) return;
      pendingRef.current = { oktaOrigin, config };
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, PERSIST_DEBOUNCE_MS);
    },
    [oktaOrigin, flush],
  );

  useEffect(() => {
    if (!oktaOrigin) {
      applyStored(DEFAULT_PROFILE_DISPLAY_CONFIG);
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    setIsLoaded(false);
    void profileDisplayStore
      .getConfig(oktaOrigin)
      .catch(() => null)
      .then((saved) => {
        if (cancelled) return;
        applyStored(saved ?? DEFAULT_PROFILE_DISPLAY_CONFIG);
        setIsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [oktaOrigin, applyStored]);

  useEffect(() => flush, [flush]);

  const update = useCallback(
    (patch: Partial<ProfileDisplayConfig>) => {
      const next = mergeStoredConfig(storedRef.current, patch, known);
      applyStored(next);
      schedulePersist(next);
    },
    [known, applyStored, schedulePersist],
  );

  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
    applyStored(DEFAULT_PROFILE_DISPLAY_CONFIG);
    if (oktaOrigin) void profileDisplayStore.clearConfig(oktaOrigin);
  }, [oktaOrigin, applyStored]);

  const config = useMemo(
    () => reconcileConfig(stored, knownAttributeNames),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- knownKey captures the contents
    [stored, knownKey],
  );

  return { config, isLoaded, update, reset };
}
