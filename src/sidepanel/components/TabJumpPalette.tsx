import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertMessage, EmptyState, Input, LoadingSpinner, Modal } from './shared';
import Icon, { type IconType } from './shared/Icon';
import PaletteRow from './palette/PaletteRow';
import { destinationLabel, KIND_ICON } from './home/jumpDestinations';
import { TAB_DEFS, type TabType } from '../tabs';
import type { JumpKind, JumpMode, JumpResult } from '../hooks/useJumpResolver';
import { oktaAdminEntityUrl, type OktaAdminEntityType } from '../../shared/utils/oktaUrl';

const SECTION_ORDER: ReadonlyArray<{ kind: JumpKind; heading: string }> = [
  { kind: 'group', heading: 'Groups' },
  { kind: 'app', heading: 'Apps' },
  { kind: 'rule', heading: 'Rules' },
  { kind: 'policy', heading: 'Policies' },
  { kind: 'user', heading: 'Users' },
];

const OKTA_LINK_TYPE: Partial<Record<JumpKind, OktaAdminEntityType>> = {
  group: 'group',
  user: 'user',
  app: 'app',
};

export interface SectionMeta {
  fromSnapshot: boolean;
  complete: boolean;
}

interface TabJumpPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelect: (tab: TabType) => void;
  onEntityQueryChange?: (query: string) => void;
  entityMode?: JumpMode;
  entityResults?: JumpResult[];
  entityError?: string | null;
  onEntitySelect?: (result: JumpResult) => void;
  canReach?: (kind: JumpKind) => boolean;
  sectionMeta?: Partial<Record<JumpKind, SectionMeta>>;
  oktaOrigin?: string | null;
  entityMinChars?: number;
}

interface SectionRow {
  id: TabType;
  label: string;
  icon: IconType;
}

type FlatRow =
  | { type: 'section'; row: SectionRow }
  | { type: 'entity'; row: JumpResult; heading: string | null };

function provenanceMark(meta: SectionMeta | undefined): string | null {
  if (!meta) return null;
  if (!meta.fromSnapshot) return 'live';
  return meta.complete ? 'from snapshot' : 'partial snapshot';
}

const TabJumpPalette: React.FC<TabJumpPaletteProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelect,
  onEntityQueryChange,
  entityMode = 'idle',
  entityResults,
  entityError = null,
  onEntitySelect,
  canReach,
  sectionMeta,
  oktaOrigin,
  entityMinChars = 3,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  const searchesEntities = onEntityQueryChange !== undefined;
  const isSearching = entityMode === 'searching' || entityMode === 'resolving';

  const sectionRows = useMemo<SectionRow[]>(() => {
    const needle = query.trim().toLowerCase();
    const all = TAB_DEFS.map(({ id, label, icon }) => ({ id, label, icon }));
    if (!needle) return all;
    return all.filter((result) => result.label.toLowerCase().includes(needle));
  }, [query]);

  const showEntities =
    (entityResults?.length ?? 0) > 0 && (entityMode === 'results' || isSearching);

  const flatRows = useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = sectionRows.map((row) => ({ type: 'section' as const, row }));
    if (!showEntities || !entityResults) return rows;
    for (const { kind, heading } of SECTION_ORDER) {
      const forKind = entityResults.filter((result) => result.kind === kind);
      forKind.forEach((row, index) => {
        rows.push({ type: 'entity', row, heading: index === 0 ? heading : null });
      });
    }
    return rows;
  }, [sectionRows, entityResults, showEntities]);

  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleSelect = useCallback(
    (tab: TabType) => {
      onSelect(tab);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleEntitySelect = useCallback(
    (result: JumpResult) => {
      onEntitySelect?.(result);
      onClose();
    },
    [onEntitySelect, onClose],
  );

  const activateRow = useCallback(
    (entry: FlatRow) => {
      if (entry.type === 'section') handleSelect(entry.row.id);
      else handleEntitySelect(entry.row);
    },
    [handleSelect, handleEntitySelect],
  );

  const focusRow = useCallback(
    (index: number) => {
      const count = flatRows.length;
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      setActiveIndex(next);
      rowRefs.current[next]?.focus();
    },
    [flatRows.length],
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(0);
      onEntityQueryChange?.(value);
    },
    [onEntityQueryChange],
  );

  const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusRow(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusRow(flatRows.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const top = flatRows[0];
      if (top) activateRow(top);
    }
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusRow(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) {
        setActiveIndex(0);
        inputRef.current?.focus();
      } else {
        focusRow(index - 1);
      }
    }
  };

  const entityCount = showEntities ? flatRows.length - sectionRows.length : 0;
  const trimmedLength = query.trim().length;
  const belowFloor = searchesEntities && trimmedLength > 0 && trimmedLength < entityMinChars;
  const foundNothing =
    searchesEntities && entityMode === 'results' && entityCount === 0 && !entityError;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jump to section" size="md">
      <Input
        type="search"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleFieldKeyDown}
        inputRef={inputRef}
        ariaLabel="Search sections"
        placeholder={
          searchesEntities ? 'Search sections, groups, apps, users…' : 'Search sections…'
        }
        icon={<Icon type="search" size="sm" />}
        trailing={isSearching ? <LoadingSpinner size="sm" /> : undefined}
      />

      <p role="status" className="sr-only">
        {sectionRows.length} {sectionRows.length === 1 ? 'section' : 'sections'} available
        {entityCount > 0 && `, ${entityCount} ${entityCount === 1 ? 'result' : 'results'}`}
        {isSearching && ', searching'}
        {entityError && ', search failed'}
      </p>

      {entityError && (
        <div className="mt-3">
          <AlertMessage message={{ text: entityError, type: 'danger' }} />
        </div>
      )}

      {flatRows.length === 0 ? (
        <EmptyState
          icon="search"
          title="No sections match"
          description="No top-level section has that name. Try a shorter search."
        />
      ) : (
        <ul className="mt-3 rise-in-stagger">
          {flatRows.map((entry, index) => {
            const rowRef = (element: HTMLElement | null) => {
              rowRefs.current[index] = element;
            };
            const tabIndex = index === activeIndex ? 0 : -1;

            if (entry.type === 'section') {
              const isCurrent = entry.row.id === activeTab;
              return (
                <li key={`section:${entry.row.id}`}>
                  <PaletteRow
                    icon={entry.row.icon}
                    label={entry.row.label}
                    isCurrent={isCurrent}
                    trailing={isCurrent ? 'Current' : undefined}
                    tabIndex={tabIndex}
                    rowRef={rowRef}
                    onClick={() => handleSelect(entry.row.id)}
                    onKeyDown={(event) => handleRowKeyDown(event, index)}
                  />
                </li>
              );
            }

            const { row, heading } = entry;
            const reachable = canReach?.(row.kind) ?? false;
            const linkType = OKTA_LINK_TYPE[row.kind];
            const href =
              !reachable && linkType ? oktaAdminEntityUrl(oktaOrigin, linkType, row.id) : null;
            const mark = reachable ? `${destinationLabel(row.kind)} ›` : href ? 'Okta ↗' : null;
            const provenance = provenanceMark(sectionMeta?.[row.kind]);

            return (
              <React.Fragment key={`entity:${row.kind}:${row.id}`}>
                {heading && (
                  <li className="mt-3 mb-1 px-(--sp-row-x) text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {heading}
                    {provenance && (
                      <span className="ml-2 font-normal normal-case">· {provenance}</span>
                    )}
                  </li>
                )}
                <li>
                  <PaletteRow
                    icon={KIND_ICON[row.kind]}
                    label={row.name}
                    secondary={row.secondary}
                    trailing={mark}
                    tabIndex={tabIndex}
                    rowRef={rowRef}
                    href={href ?? undefined}
                    onClick={() => handleEntitySelect(row)}
                    onKeyDown={(event) => handleRowKeyDown(event, index)}
                    ariaLabel={
                      reachable
                        ? `${row.name} — open in ${destinationLabel(row.kind)}`
                        : href
                          ? `${row.name} — open in Okta`
                          : undefined
                    }
                  />
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}

      {belowFloor && (
        <p className="mt-3 text-xs text-neutral-500">
          Type {entityMinChars} characters to search the org.
        </p>
      )}
      {foundNothing && (
        <p className="mt-3 text-xs text-neutral-500">Nothing in the org matched that search.</p>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        <kbd className="font-sans">↑↓</kbd> to browse · <kbd className="font-sans">Enter</kbd> to
        jump · <kbd className="font-sans">Esc</kbd> to close
      </p>
    </Modal>
  );
};

export default TabJumpPalette;
