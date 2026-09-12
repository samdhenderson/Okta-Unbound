import React from 'react';
import Badge from '../shared/Badge';
import { isPatternMatch, type CascadeLine } from './cascadeLines';
import type { CascadeDirection } from '../../../shared/membership/blastRadiusTypes';

export interface CascadeGroupBlock {
  readonly groupId: string;
  readonly groupName: string;
  readonly lines: readonly CascadeLine[];
}

export interface BlastRadiusCascadeProps {
  groups: readonly CascadeGroupBlock[];
}

const directionPresentation: Record<CascadeDirection, { label: string; title: string }> = {
  'toward-match': {
    label: 'Toward matching',
    title: 'This edit satisfies the membership test this rule makes of this group.',
  },
  'away-from-match': {
    label: 'Away from matching',
    title: 'This edit stops satisfying the membership test this rule makes of this group.',
  },
  undetermined: {
    label: 'Uses it both ways',
    title:
      'This rule tests membership of this group in both directions, so this edit does not turn it one way.',
  },
};

const CascadeRuleLine: React.FC<{ line: CascadeLine }> = ({ line }) => {
  const direction = directionPresentation[line.direction];

  return (
    <li className="flex min-w-0 flex-col gap-0.5">
      <span className="flex min-w-0 flex-wrap items-center gap-(--sp-inline)">
        <span className="min-w-0 text-xs font-medium break-words text-neutral-900">
          {line.ruleName}
        </span>
        <Badge variant="neutral" title={direction.title}>
          {direction.label}
        </Badge>
      </span>
      {line.targetGroupNames.length > 0 && (
        <span className="text-xs break-words text-neutral-600">
          <span className="font-medium">Assigns: </span>
          {line.targetGroupNames.join(', ')}
        </span>
      )}
      {isPatternMatch(line) && (
        <span className="text-xs text-neutral-500">Matched by name pattern.</span>
      )}
    </li>
  );
};

const BlastRadiusCascade: React.FC<BlastRadiusCascadeProps> = ({ groups }) => {
  if (groups.length === 0) return null;
  const captioned = groups.length > 1;

  return (
    <div className="flex flex-col gap-(--sp-rung)">
      {groups.map((block) => (
        <div key={block.groupId} className="flex min-w-0 flex-col gap-1">
          {captioned && (
            <span className="text-xs font-medium break-words text-neutral-900">
              {block.groupName}
            </span>
          )}
          <ul className="flex flex-col gap-2">
            {block.lines.map((line) => (
              <CascadeRuleLine key={line.ruleId} line={line} />
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs text-neutral-600">
        Whether these rules flip is not predicted &mdash; prediction stops at one hop.
      </p>
    </div>
  );
};

export default BlastRadiusCascade;
