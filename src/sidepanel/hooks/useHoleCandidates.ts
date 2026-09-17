import { useEffect, useMemo, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import { useEntitySearchSources } from './useEntitySearchSources';
import { useOrgEntityIndex } from '../contexts/OrgEntityIndexContext';
import type { HoleCandidate } from '../apiCatalog/suggest';
import type { HoleKind } from '../apiCatalog/pathTemplate';
import type { IndexedKind } from './useOrgEntityIndex';
import type { JumpKind } from './useJumpResolver';

const HOLE_JUMP_KINDS = ['group', 'app', 'rule', 'policy', 'user'] as const;

const INDEXED: ReadonlyArray<HoleKind> = ['group', 'rule', 'app'];

const MIN_SEARCH_LENGTH = 2;

const DEBOUNCE_MS = 250;

export interface TabEntity {
  readonly kind: HoleKind;
  readonly id: string;
  readonly label: string;
}

export interface UseHoleCandidatesOptions {
  readonly kind: HoleKind | null;
  readonly query: string;
  readonly tabEntity?: TabEntity | null;
  readonly targetTabId: number | null;
  readonly oktaOrigin?: string;
  readonly enabled: boolean;
}

export interface UseHoleCandidatesResult {
  readonly candidates: readonly HoleCandidate[];
  readonly isSearching: boolean;
}

function asJumpKind(kind: HoleKind): JumpKind | null {
  return (HOLE_JUMP_KINDS as readonly string[]).includes(kind) ? (kind as JumpKind) : null;
}

export function useHoleCandidates({
  kind,
  query,
  tabEntity,
  targetTabId,
  oktaOrigin,
  enabled,
}: UseHoleCandidatesOptions): UseHoleCandidatesResult {
  const index = useOrgEntityIndex();
  const api = useOktaApi({ targetTabId, oktaOrigin });
  const { searchers } = useEntitySearchSources({ api, index, kinds: HOLE_JUMP_KINDS });

  const [searched, setSearched] = useState<{ key: string; rows: readonly HoleCandidate[] } | null>(
    null,
  );
  const [searchingKey, setSearchingKey] = useState<string | null>(null);

  const trimmed = query.trim();
  const searchable = enabled && kind !== null && targetTabId !== null;
  const jumpKind = kind ? asJumpKind(kind) : null;
  const key = `${kind ?? ''}:${trimmed}`;

  const worthSearching =
    searchable &&
    jumpKind !== null &&
    trimmed.length >= MIN_SEARCH_LENGTH &&
    !trimmed.startsWith('{');

  useEffect(() => {
    if (!worthSearching || !jumpKind) return;
    const search = searchers[jumpKind];
    if (!search) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setSearchingKey(key);
      void search(trimmed)
        .then((results) => {
          if (cancelled) return;
          setSearched({
            key,
            rows: results.map((result) => ({
              kind: jumpKind as HoleKind,
              id: result.id,
              label: result.name,
              secondary: result.secondary,
              source: 'search' as const,
            })),
          });
        })
        .catch(() => {
          if (!cancelled) setSearched({ key, rows: [] });
        })
        .finally(() => {
          if (!cancelled) setSearchingKey((current) => (current === key ? null : current));
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jumpKind, key, searchers, trimmed, worthSearching]);

  const isSearching = searchingKey === key;

  return useMemo(() => {
    if (!kind) return { candidates: [], isSearching: false };

    const found = searched?.key === key ? searched.rows : [];

    const fromTab: HoleCandidate[] =
      tabEntity && tabEntity.kind === kind
        ? [{ kind, id: tabEntity.id, label: tabEntity.label, source: 'tab' }]
        : [];

    const fromSnapshot: HoleCandidate[] = INDEXED.includes(kind)
      ? index.searchByName(kind as IndexedKind, trimmed).map((entity) => ({
          kind,
          id: entity.id,
          label: entity.name,
          secondary: entity.secondary,
          source: 'snapshot' as const,
        }))
      : [];

    const seen = new Set<string>();
    const candidates = [...fromTab, ...fromSnapshot, ...found].filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    });

    return { candidates, isSearching };
  }, [index, isSearching, key, kind, searched, tabEntity, trimmed]);
}
