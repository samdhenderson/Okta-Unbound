import React, { useState } from 'react';
import Icon from '../shared/Icon';

export const RowLines: React.FC<{
  label: string;
  note?: string;
  id: string;
  recessed?: boolean;
  warn?: boolean;
}> = ({ label, note, id, recessed = false, warn = false }) => (
  <span className="flex min-w-0 flex-1 flex-col gap-px text-left">
    <span
      id={id}
      className={`text-sm ${recessed ? 'font-medium text-neutral-600' : 'font-semibold text-neutral-900'}`}
    >
      {label}
    </span>
    {note && (
      <span className={`text-xs ${warn ? 'text-warning-text' : 'text-neutral-600'}`}>{note}</span>
    )}
  </span>
);

export const RowDisclosure: React.FC<{
  rowKey: string;
  figure: React.ReactNode;
  label: string;
  note?: string;
  recessed?: boolean;
  warn?: boolean;
  children: React.ReactNode;
}> = ({ rowKey, figure, label, note, recessed, warn, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `home-report-panel-${rowKey}`;
  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="press press-subtle flex w-full items-stretch gap-3 px-(--sp-row-x) py-(--sp-row-y) hover:bg-neutral-50 active:brightness-90 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        {figure}
        <RowLines
          label={label}
          note={note}
          id={`home-report-${rowKey}`}
          recessed={recessed}
          warn={warn}
        />
        <Icon
          type="chevron-down"
          size="xs"
          className={`shrink-0 self-center text-neutral-400 transition-transform duration-(--dur-quick) ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div id={panelId} className="border-t border-neutral-100 bg-neutral-50 p-(--sp-card)">
          {children}
        </div>
      )}
    </li>
  );
};
