import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { oktaIdKind, type OktaIdKind } from '../../shared/utils/oktaId';
import { useDebouncedValue } from './useDebouncedValue';
import { createLogger } from '../../shared/utils/logger';
import type { OrgEntityIndex } from './useOrgEntityIndex';

const log = createLogger('useJumpResolver');

export const JUMP_SEARCH_MIN_CHARS = 3;

export const JUMP_SEARCH_DEBOUNCE_MS = 300;

export type JumpMode = 'idle' | 'searching' | 'resolving' | 'results' | 'error';

export interface JumpResult {
  kind: OktaIdKind;
  id: string;
  name: string;
  secondary?: string;
}

export interface JumpResolution {
  cost: 0 | 1;
}

export interface UseJumpResolverResult {
  query: string;
  setQuery: (value: string) => void;
  mode: JumpMode;
  results: JumpResult[];
  error: string | null;
  isIdQuery: boolean;
  resolution: JumpResolution | null;
  submit: () => void;
  clear: () => void;
}

export interface UseJumpResolverOptions {
  index: OrgEntityIndex;
  searchers: Partial<Record<OktaIdKind, (query: string) => Promise<JumpResult[]>>>;
  fetchers: Partial<Record<OktaIdKind, (id: string) => Promise<JumpResult | null>>>;
  enabled?: boolean;
}

export function useJumpResolver({
  index,
  searchers,
  fetchers,
  enabled = true,
}: UseJumpResolverOptions): UseJumpResolverResult {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<JumpMode>('idle');
  const [results, setResults] = useState<JumpResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<JumpResolution | null>(null);

  const trimmed = query.trim();
  const idKind = useMemo(() => oktaIdKind(trimmed), [trimmed]);
  const isIdQuery = idKind !== null;

  const debounced = useDebouncedValue(trimmed, JUMP_SEARCH_DEBOUNCE_MS);

  const runIdRef = useRef(0);

  const runSearch = useCallback(
    async (needle: string) => {
      const runId = ++runIdRef.current;
      setMode('searching');
      setError(null);
      setResolution(null);

      const kinds = Object.keys(searchers) as OktaIdKind[];
      const settled = await Promise.allSettled(
        kinds.map((kind) => searchers[kind]?.(needle) ?? Promise.resolve([])),
      );
      if (runId !== runIdRef.current) return;

      const rows: JumpResult[] = [];
      let failures = 0;
      for (const outcome of settled) {
        if (outcome.status === 'fulfilled') rows.push(...outcome.value);
        else failures += 1;
      }

      if (failures === kinds.length && kinds.length > 0) {
        log.error('Jump search failed on every kind', { code: 'jump_search_failed' });
        setResults([]);
        setError('Search failed. Check the connection to Okta and try again.');
        setMode('error');
        return;
      }

      setResults(rows);
      setMode('results');
    },
    [searchers],
  );

  const runResolve = useCallback(
    async (kind: OktaIdKind, id: string) => {
      const runId = ++runIdRef.current;
      setMode('resolving');
      setError(null);

      const local = index.lookup(kind, id);
      if (local.status === 'hit') {
        if (runId !== runIdRef.current) return;
        setResults([local.entity]);
        setResolution({ cost: 0 });
        setMode('results');
        return;
      }

      if (local.status === 'miss') {
        if (runId !== runIdRef.current) return;
        setResults([]);
        setResolution({ cost: 0 });
        setMode('results');
        return;
      }

      const fetcher = fetchers[kind];
      if (!fetcher) {
        if (runId !== runIdRef.current) return;
        setResults([]);
        setResolution({ cost: 0 });
        setMode('results');
        return;
      }

      try {
        const found = await fetcher(id);
        if (runId !== runIdRef.current) return;
        setResults(found ? [found] : []);
        setResolution({ cost: 1 });
        setMode('results');
      } catch (err) {
        if (runId !== runIdRef.current) return;
        log.error('Jump resolve failed', { code: 'jump_resolve_failed', kind });
        setResults([]);
        setResolution({ cost: 1 });
        setError(err instanceof Error ? err.message : 'Could not resolve that id.');
        setMode('error');
      }
    },
    [index, fetchers],
  );

  useEffect(() => {
    if (!enabled) return;
    if (oktaIdKind(debounced) !== null) return;
    if (debounced.length < JUMP_SEARCH_MIN_CHARS) {
      runIdRef.current += 1;
      setResults([]);
      setResolution(null);
      setError(null);
      setMode('idle');
      return;
    }
    void runSearch(debounced);
  }, [debounced, enabled, runSearch]);

  const submit = useCallback(() => {
    if (!enabled) return;
    if (idKind) {
      void runResolve(idKind, trimmed);
      return;
    }
    if (trimmed.length >= JUMP_SEARCH_MIN_CHARS) void runSearch(trimmed);
  }, [enabled, idKind, trimmed, runResolve, runSearch]);

  const clear = useCallback(() => {
    runIdRef.current += 1;
    setQuery('');
    setResults([]);
    setError(null);
    setResolution(null);
    setMode('idle');
  }, []);

  return {
    query,
    setQuery,
    mode,
    results,
    error,
    isIdQuery,
    resolution,
    submit,
    clear,
  };
}
