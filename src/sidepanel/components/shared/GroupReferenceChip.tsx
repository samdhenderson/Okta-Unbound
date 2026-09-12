import React from 'react';
import Icon from './Icon';
import CopyIconButton from './CopyIconButton';
import type { GroupNameResolver } from './RuleExpressionText';
import type { ClauseGroupReference } from '../../../shared/rules/explainExpression';

export interface GroupReferenceChipProps {
  reference: ClauseGroupReference;
  hasContext: boolean;
  resolveGroupName?: GroupNameResolver;
}

interface ChipLabel {
  readonly text: string;
  readonly mono: boolean;
}

function chipLabel(
  reference: ClauseGroupReference,
  resolveGroupName?: GroupNameResolver,
): ChipLabel {
  if (reference.matchedGroupName) return { text: reference.matchedGroupName, mono: false };

  switch (reference.match) {
    case 'id': {
      const resolved = resolveGroupName?.(reference.value);
      return resolved ? { text: resolved, mono: false } : { text: reference.value, mono: true };
    }
    case 'name':
      return { text: reference.value, mono: false };
    case 'nameStartsWith':
      return { text: `startsWith "${reference.value}"`, mono: true };
    case 'nameContains':
      return { text: `contains "${reference.value}"`, mono: true };
    case 'nameRegex':
      return { text: `matches "${reference.value}"`, mono: true };
  }
}

const GroupReferenceChip: React.FC<GroupReferenceChipProps> = ({
  reference,
  hasContext,
  resolveGroupName,
}) => {
  const label = chipLabel(reference, resolveGroupName);

  return (
    <span className="border-primary-highlight bg-primary-light text-primary-text inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium">
      {hasContext &&
        (reference.satisfied ? (
          <>
            <Icon type="check" size="xs" className="text-success" />
            <span className="sr-only">Matched</span>
          </>
        ) : (
          <>
            <Icon type="minus" size="xs" className="text-neutral-400" />
            <span className="sr-only">Not matched</span>
          </>
        ))}
      <span className={label.mono ? 'font-mono' : ''}>{label.text}</span>
      {reference.match === 'id' && (
        <CopyIconButton
          value={reference.value}
          label={`Copy group id ${reference.value}`}
          className="shrink-0"
        />
      )}
    </span>
  );
};

export default GroupReferenceChip;
