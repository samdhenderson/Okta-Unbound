import React from 'react';
import Icon, { type IconType } from '../shared/Icon';
import CopyableId from './CopyableId';
import type { BadgeVariant } from './Badge';
import type { IdentityFact, IdentityRow } from './identityDescriptor';

export interface EntityIdentityProps {
  rows: IdentityRow[];
}

const STATUS_DOT_BG: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  info: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-neutral-400',
};

const FactIcon: React.FC<{ type: IconType }> = ({ type }) => (
  <span aria-hidden="true" className="flex shrink-0 text-neutral-400">
    <Icon type={type} size="sm" />
  </span>
);

const Fact: React.FC<{ fact: IdentityFact }> = ({ fact }) => {
  if (fact.kind === 'id') {
    return <CopyableId value={fact.value} label={fact.copyLabel} />;
  }

  if (fact.kind === 'metric') {
    return (
      <span className="inline-flex items-center gap-1.5" title={fact.title}>
        <FactIcon type={fact.icon} />
        <span className="font-semibold text-neutral-900">{fact.value}</span>
        <span>{fact.label}</span>
      </span>
    );
  }

  if (fact.kind === 'status') {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_BG[fact.variant]}`}
        />
        <span className="truncate" title={fact.text}>
          {fact.text}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5" title={fact.title}>
      {fact.icon && <FactIcon type={fact.icon} />}
      <span className="truncate">{fact.text}</span>
    </span>
  );
};

const EntityIdentity: React.FC<EntityIdentityProps> = ({ rows }) => {
  const populated = rows.filter((row) => row.length > 0);
  if (populated.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {populated.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-600"
        >
          {row.map((fact, factIndex) => (
            <span key={factIndex} className="inline-flex min-w-0 items-center gap-x-2">
              {factIndex > 0 && (
                <span aria-hidden="true" className="text-neutral-300">
                  ·
                </span>
              )}
              <Fact fact={fact} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EntityIdentity;
