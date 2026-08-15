import React from 'react';
import Icon, { type IconType } from '../overview/shared/Icon';
import CopyableId from './CopyableId';
import type { IdentityFact, IdentityRow } from './identityDescriptor';

export interface EntityIdentityProps {
  rows: IdentityRow[];
}

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
            <React.Fragment key={factIndex}>
              {factIndex > 0 && (
                <span aria-hidden="true" className="text-neutral-300">
                  ·
                </span>
              )}
              <Fact fact={fact} />
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default EntityIdentity;
