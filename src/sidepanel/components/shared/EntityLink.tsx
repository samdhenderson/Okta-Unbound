import React from 'react';
import Icon, { type IconType } from '../overview/shared/Icon';
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
  className?: string;
  testId?: string;
}

const sharedClasses = 'inline-flex max-w-full items-center gap-1 text-xs font-medium';

const EntityLink: React.FC<EntityLinkProps> = ({
  type,
  id,
  name,
  unlinkableReason,
  className = '',
  testId,
}) => {
  const { navigateTo, canNavigateTo } = useEntityNavigation();
  const linkable = Boolean(id) && canNavigateTo(type);

  if (!linkable) {
    return (
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
  }

  return (
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
  );
};

export default EntityLink;
