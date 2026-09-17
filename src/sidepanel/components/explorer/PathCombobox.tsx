import React from 'react';
import { Input } from '../shared';
import type { IconType } from '../shared/Icon';
import PaletteRowBody from '../palette/PaletteRowBody';
import { paletteRowClassName } from '../palette/paletteRowStyles';
import {
  suggest,
  accept,
  type SuggestRow,
  type SuggestMode,
  type HoleCandidate,
  type Suggestion,
} from '@/sidepanel/apiCatalog/suggest';

export interface PathComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  placeholder?: string;
  candidates?: readonly HoleCandidate[];
  onHoleChange?: (hole: Suggestion['hole'] | null) => void;
}

const ROW_ICON: Readonly<Record<SuggestRow['kind'], IconType>> = {
  endpoint: 'terminal',
  param: 'filter',
  value: 'check',
  hole: 'key',
};

const MODE_ANNOUNCEMENT: Readonly<Record<SuggestMode, string>> = {
  path: 'Suggesting endpoints',
  'param-name': 'Suggesting query parameters for this endpoint',
  'param-value': 'Suggesting values for this parameter',
  hole: 'Suggesting ids for this part of the path',
};

const PathCombobox: React.FC<PathComboboxProps> = ({
  value,
  onChange,
  onSend,
  canSend,
  placeholder,
  candidates,
  onHoleChange,
}) => {
  const baseId = React.useId();
  const listboxId = `${baseId}-listbox`;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = React.useState(false);
  const [caret, setCaret] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const pendingSelection = React.useRef<readonly [number, number] | null>(null);

  const suggestion = React.useMemo(
    () => suggest(value, caret, candidates),
    [value, caret, candidates],
  );
  const rows = suggestion.rows;
  const isExpanded = isOpen && rows.length > 0;
  const activeRow = isExpanded ? rows[Math.min(activeIndex, rows.length - 1)] : undefined;

  const syncCaret = React.useCallback(() => {
    setCaret(inputRef.current?.selectionStart ?? value.length);
  }, [value.length]);

  const hole = suggestion.hole;
  const holeKey = hole ? `${hole.token}:${hole.kind}:${hole.query}` : null;
  React.useEffect(() => {
    onHoleChange?.(hole ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holeKey, onHoleChange]);

  React.useEffect(() => {
    const range = pendingSelection.current;
    if (!range || !inputRef.current) return;
    pendingSelection.current = null;
    inputRef.current.setSelectionRange(range[0], range[1]);
    setCaret(range[0]);
  }, [value]);

  const acceptRow = React.useCallback(
    (row: SuggestRow) => {
      const result = accept(value, suggestion, row);
      onChange(result.value);
      setActiveIndex(0);
      setIsOpen(result.reopen);

      if (result.selection) {
        pendingSelection.current = result.selection;
      } else {
        pendingSelection.current = [result.caret, result.caret];
      }
    },
    [onChange, suggestion, value],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === 'Escape') {
      if (!isExpanded) return;
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isExpanded && activeRow) {
        acceptRow(activeRow);
      } else if (canSend) {
        onSend();
      }
      return;
    }

    if (event.key === 'Tab') {
      if (isExpanded && activeRow) acceptRow(activeRow);
      return;
    }

    if (!isExpanded) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const last = rows.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => (index >= last ? 0 : index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => (index <= 0 ? last : index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative flex-1 min-w-0">
      <Input
        value={value}
        onChange={(next) => {
          onChange(next);
          setActiveIndex(0);
          setIsOpen(true);
          syncCaret();
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onSelect={syncCaret}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder}
        ariaLabel="API path"
        combobox={{
          expanded: isExpanded,
          listboxId,
          activeOptionId: activeRow ? `${baseId}-${activeRow.id}` : undefined,
        }}
      />

      <span className="sr-only" role="status">
        {isExpanded ? MODE_ANNOUNCEMENT[suggestion.mode] : ''}
      </span>

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Path suggestions"
        hidden={!isExpanded}
        className="absolute z-20 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-md border border-neutral-200 bg-white shadow-lg py-1"
      >
        {rows.map((row, index) => (
          <React.Fragment key={row.id}>
            {row.heading && (
              <li
                role="presentation"
                className="px-(--sp-row-x) pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-600"
              >
                {row.heading}
              </li>
            )}
            <li
              id={`${baseId}-${row.id}`}
              role="option"
              aria-selected={index === activeIndex}
              className={paletteRowClassName(index === activeIndex)}
              onMouseDown={(event) => {
                event.preventDefault();
                acceptRow(row);
              }}
            >
              <PaletteRowBody
                icon={ROW_ICON[row.kind]}
                label={row.label}
                secondary={row.secondary}
                trailing={row.trailing}
                isCurrent={index === activeIndex}
                mono={row.kind === 'endpoint'}
              />
            </li>
          </React.Fragment>
        ))}

        {suggestion.truncated && (
          <li role="presentation" className="px-(--sp-row-x) py-2 text-xs text-neutral-600">
            Keep typing to narrow this list.
          </li>
        )}
      </ul>
    </div>
  );
};

export default PathCombobox;
