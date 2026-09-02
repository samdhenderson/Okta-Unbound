import React from 'react';
import Icon, { type IconType } from '../shared/Icon';
import CopyIconButton from './CopyIconButton';
import { useEntityNavigation, type EntityType } from '../../contexts/NavigationContext';

const typeIcon: Record<EntityType, IconType> = {
  rule: 'bolt',
  group: 'users',
  user: 'user',
  app: 'app',
  policy: 'shield',
};

const typeNoun: Record<EntityType, string> = {
  rule: 'rule',
  group: 'group',
  user: 'user',
  app: 'app',
  policy: 'policy',
};

export interface EntityLinkProps {
  type: EntityType;
  id?: string;
  name: string;
  unlinkableReason?: string;
  copyId?: boolean;
  copyIdLabel?: string;
  className?: string;
  testId?: string;
}

const sharedClasses = 'inline-flex max-w-full items-center gap-1 text-xs font-medium';

const EntityLink: React.FC<EntityLinkProps> = ({
  type,
  id,
  name,
  unlinkableReason,
  copyId = false,
  copyIdLabel,
  className = '',
  testId,
}) => {
  const { navigateTo, canNavigateTo } = useEntityNavigation();
  const linkable = Boolean(id) && canNavigateTo(type);

  const chip = linkable ? (
    <button
      type="button"
      onClick={() => navigateTo({ type, id: id as string })}
      aria-label={`Open ${typeNoun[type]} ${name}`}
      title={`Open ${typeNoun[type]} ${name}`}
      data-testid={testId}
      className={`
        ${sharedClasses}
        rounded-md border border-primary-highlight bg-primary-light px-2 py-0.5
        text-primary-text hover:bg-primary-highlight
        transition-colors duration-(--dur-instant)
        focus:outline-2 focus:outline-offset-2 focus:outline-primary
        ${className}
      `
        .trim()
        .replace(/\s+/g, ' ')}
    >
      <Icon type={typeIcon[type]} size="xs" className="shrink-0" />
      <span className="truncate">{name}</span>
      <Icon type="chevron-right" size="xs" className="shrink-0 opacity-60" />
    </button>
  ) : (
    <span
      className={`${sharedClasses} text-neutral-700 border-b border-dotted border-neutral-400 ${className}`}
      title={
        unlinkableReason ??
        `${name} — no ${typeNoun[type]} id is available for this reference, so it cannot be opened.`
      }
      data-testid={testId}
    >
      <Icon type={typeIcon[type]} size="xs" className="shrink-0 text-neutral-500" />
      <span className="truncate">{name}</span>
    </span>
  );

  if (!copyId || !id) return chip;

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      {chip}
      <CopyIconButton
        value={id}
        label={copyIdLabel ?? `Copy ${typeNoun[type]} id for ${name} (${id})`}
      />
    </span>
  );
};

export default EntityLink;
