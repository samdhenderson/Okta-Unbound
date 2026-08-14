import { useCallback, useEffect, useRef, useState } from 'react';
import { OperationCancelledError } from '../../shared/scheduler/cancellation';
import {
  getOrFetch,
  peek,
  peekEntry,
  serializeKey,
  subscribe,
  type EntityKey,
} from './entityCache';

export interface UseEntityQueryOptions {
  ttl?: number;
  enabled?: boolean;
}

export interface UseEntityQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  refetch: () => Promise<void>;
}

export function useEntityQuery<T>(
  key: EntityKey,
  fetcher: () => Promise<T>,
  options: UseEntityQueryOptions = {},
): UseEntityQueryResult<T> {
  const { ttl, enabled = true } = options;
  const serialized = serializeKey(key);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const keyRef = useRef(key);
  keyRef.current = key;

  const [data, setData] = useState<T | null>(() => peek<T>(key));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [revalidateTick, setRevalidateTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribe(keyRef.current, () => setRevalidateTick((t) => t + 1));
    return unsubscribe;
  }, [serialized]);

  useEffect(() => {
    let cancelled = false;

    const entry = peekEntry<T>(keyRef.current);

    if (entry?.isFresh) {
      setData(entry.data);
      setIsStale(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    setData(entry ? entry.data : null);
    setIsStale(Boolean(entry));
    setError(null);

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(!entry);

    getOrFetch<T>(keyRef.current, () => fetcherRef.current(), { ttl })
      .then((fetched) => {
        if (cancelled) return;
        setData(fetched);
        setIsStale(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof OperationCancelledError) return;
        setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serialized, enabled, ttl, revalidateTick]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await getOrFetch<T>(keyRef.current, () => fetcherRef.current(), {
        ttl,
        force: true,
      });
      setData(fetched);
      setIsStale(false);
    } catch (err: unknown) {
      if (!(err instanceof OperationCancelledError)) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      }
    } finally {
      setIsLoading(false);
    }
  }, [ttl]);

  return { data, isLoading, error, isStale, refetch };
}
