import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyState, Input, Modal } from './shared';
import Icon, { type IconType } from './shared/Icon';
import { TAB_DEFS, type TabType } from '../tabs';

interface TabJumpPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSelect: (tab: TabType) => void;
}

interface JumpResult {
  id: TabType;
  label: string;
  icon: IconType;
}

const TabJumpPalette: React.FC<TabJumpPaletteProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  const results = useMemo<JumpResult[]>(() => {
    const needle = query.trim().toLowerCase();
    const all = TAB_DEFS.map(({ id, label, icon }) => ({ id, label, icon }));
    if (!needle) return all;
    return all.filter((result) => result.label.toLowerCase().includes(needle));
  }, [query]);

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

  const focusRow = useCallback(
    (index: number) => {
      const count = results.length;
      if (count === 0) return;
      const next = ((index % count) + count) % count;
      setActiveIndex(next);
      rowRefs.current[next]?.focus();
    },
    [results.length],
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusRow(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusRow(results.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const top = results[0];
      if (top) handleSelect(top.id);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jump to section" size="md">
      <Input
        type="search"
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleFieldKeyDown}
        inputRef={inputRef}
        ariaLabel="Search sections"
        placeholder="Search sections…"
        icon={<Icon type="search" size="sm" />}
      />

      <p role="status" className="sr-only">
        {results.length} {results.length === 1 ? 'section' : 'sections'} available
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon="search"
          title="No sections match"
          description="No top-level section has that name. Try a shorter search."
        />
      ) : (
        <ul className="mt-3 rise-in-stagger">
          {results.map((result, index) => {
            const isCurrent = result.id === activeTab;
            return (
              <li key={result.id}>
                <button
                  type="button"
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  tabIndex={index === activeIndex ? 0 : -1}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => handleSelect(result.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                  className={`press press-subtle w-full flex items-center gap-(--sp-inline) px-(--sp-row-x) py-(--sp-row-y) rounded-md text-left text-sm
                    transition-colors duration-(--dur-instant)
                    focus:outline-2 focus:outline-offset-2 focus:outline-primary
                    ${
                      isCurrent
                        ? 'bg-primary-light text-primary-text font-semibold'
                        : 'text-neutral-900 hover:bg-neutral-50'
                    }`}
                >
                  <Icon
                    type={result.icon}
                    size="sm"
                    className={isCurrent ? 'text-primary-text' : 'text-neutral-500'}
                  />
                  <span className="flex-1">{result.label}</span>
                  {isCurrent && <span className="text-xs font-medium">Current</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        <kbd className="font-sans">↑↓</kbd> to browse · <kbd className="font-sans">Enter</kbd> to
        jump · <kbd className="font-sans">Esc</kbd> to close
      </p>
    </Modal>
  );
};

export default TabJumpPalette;
