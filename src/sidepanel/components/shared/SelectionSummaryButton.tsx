import React from 'react';
import Button from './Button';
import Icon from './Icon';
import { typeIcon, typeNounForms } from './entityKind';
import { pluralize } from '../../../shared/utils/plural';
import type { EntityType } from '../../contexts/NavigationContext';

const KIND_ORDER: readonly EntityType[] = ['user', 'group', 'app', 'rule', 'policy'];

function joinNaturally(parts: readonly string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export interface SelectionSummaryButtonProps {
  counts: Partial<Record<EntityType, number>>;
  total: number;
  onOpen: () => void;
}

const SelectionSummaryButton: React.FC<SelectionSummaryButtonProps> = ({
  counts,
  total,
  onOpen,
}) => {
  if (total === 0) return null;

  const kinds = KIND_ORDER.filter((kind) => (counts[kind] ?? 0) > 0);
  const sentence = `${joinNaturally(
    kinds.map((kind) => pluralize(counts[kind] as number, typeNounForms[kind])),
  )} selected`;

  return (
    <span className="group relative inline-flex shrink-0">
      <Button
        variant="ghost"
        size="sm"
        icon="clipboard-check"
        onClick={onOpen}
        ariaLabel={sentence}
        title={sentence}
      >
        {total.toLocaleString()}
      </Button>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none absolute right-0 top-1/2 z-40 flex
          origin-right -translate-y-1/2 scale-x-75 items-center gap-(--sp-inline)
          whitespace-nowrap rounded-md border border-neutral-200 bg-white
          px-2 py-1 text-xs font-medium text-neutral-700 opacity-0 shadow-sm
          group-hover:scale-x-100 group-hover:opacity-100
          group-focus-within:scale-x-100 group-focus-within:opacity-100
          transition-all duration-(--dur-move) ease-(--ease-standard)
        `
          .trim()
          .replace(/\s+/g, ' ')}
      >
        {kinds.map((kind) => (
          <span key={kind} className="inline-flex items-center gap-1">
            <Icon type={typeIcon[kind]} size="xs" className="shrink-0 text-neutral-500" />
            {(counts[kind] as number).toLocaleString()}
          </span>
        ))}
      </span>
    </span>
  );
};

export default SelectionSummaryButton;
