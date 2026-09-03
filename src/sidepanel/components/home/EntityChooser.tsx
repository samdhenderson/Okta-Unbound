import React, { useId, useMemo, useState } from 'react';
import Icon from '../shared/Icon';
import { Input, StretchedButton } from '../shared';

export const CHOOSER_VISIBLE_LIMIT = 25;

export interface EntityChoice {
  id: string;
  name: string;
  detail?: string;
}

export interface EntityChoiceRowProps {
  choice: EntityChoice;
  actionLabel: string;
  onChoose: (id: string) => void;
}

export const EntityChoiceRow: React.FC<EntityChoiceRowProps> = ({
  choice,
  actionLabel,
  onChoose,
}) => {
  const nameId = useId();
  return (
    <li className="relative flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-(--dur-instant) hover:bg-white">
      <StretchedButton
        label={actionLabel}
        describedBy={nameId}
        onClick={() => onChoose(choice.id)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span id={nameId} className="truncate text-sm font-medium text-neutral-900">
          {choice.name}
        </span>
        {choice.detail && (
          <span className="truncate text-xs text-neutral-600">{choice.detail}</span>
        )}
      </span>
      <Icon type="chevron-right" size="xs" className="shrink-0 text-neutral-400" />
    </li>
  );
};

export interface EntityChooserProps {
  choices: EntityChoice[];
  filterLabel: string;
  actionLabel: string;
  onChoose: (id: string) => void;
  emptyLabel?: string;
}

const EntityChooser: React.FC<EntityChooserProps> = ({
  choices,
  filterLabel,
  actionLabel,
  onChoose,
  emptyLabel = 'Nothing matches that.',
}) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return choices;
    return choices.filter((choice) => choice.name.toLowerCase().includes(needle));
  }, [choices, query]);

  const shown = matches.slice(0, CHOOSER_VISIBLE_LIMIT);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        size="sm"
        value={query}
        onChange={setQuery}
        ariaLabel={filterLabel}
        placeholder={filterLabel}
        icon={<Icon type="search" size="sm" className="text-neutral-400" />}
      />
      {shown.length === 0 ? (
        <p className="px-2 text-xs text-neutral-600">{emptyLabel}</p>
      ) : (
        <ul className="space-y-px">
          {shown.map((choice) => (
            <EntityChoiceRow
              key={choice.id}
              choice={choice}
              actionLabel={actionLabel}
              onChoose={onChoose}
            />
          ))}
        </ul>
      )}
      {matches.length > shown.length && (
        <p className="px-2 text-xs text-neutral-600">
          Showing the first {shown.length.toLocaleString()} of {matches.length.toLocaleString()}.
          Keep typing to narrow it.
        </p>
      )}
    </div>
  );
};

export default EntityChooser;
