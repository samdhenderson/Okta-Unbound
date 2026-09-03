import React, { useState } from 'react';
import { Button, CopyableId } from '../../shared';
import type {
  ClauseGroupReference,
  ClauseGroupRequirement,
} from '../../../../shared/rules/explainExpression';

const CANDIDATE_PREVIEW_LIMIT = 5;

const groupMatchLabel: Record<ClauseGroupReference['match'], (value: string) => string> = {
  id: (value) => value,
  name: (value) => value,
  nameStartsWith: (value) => `any group whose name starts with “${value}”`,
  nameContains: (value) => `any group whose name contains “${value}”`,
};

export interface ClauseGroupListProps {
  references: readonly ClauseGroupReference[];
  requirement: ClauseGroupRequirement;
  contextName?: string;
  resolveGroupName?: (groupId: string) => string | undefined;
  renderGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
}

const ClauseGroupList: React.FC<ClauseGroupListProps> = ({
  references,
  requirement,
  contextName,
  resolveGroupName,
  renderGroupAction,
}) => {
  const [expanded, setExpanded] = useState(false);
  if (references.length === 0) return null;

  const who = contextName ?? 'This user';
  const blocking = references.filter((reference) => reference.satisfied);

  const shown =
    requirement === 'non-member'
      ? blocking
      : expanded
        ? references
        : references.slice(0, CANDIDATE_PREVIEW_LIMIT);

  const hiddenCount = references.length - shown.length;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-neutral-700">
        {requirement === 'non-member'
          ? exclusionHeading(who, references.length, blocking.length)
          : prerequisiteHeading(who, references, blocking.length)}
      </p>

      <ul className="mt-1 space-y-1">
        {shown.map((reference) => (
          <GroupEntry
            key={`${reference.match}-${reference.value}`}
            reference={reference}
            requirement={requirement}
            resolveGroupName={resolveGroupName}
            renderGroupAction={renderGroupAction}
          />
        ))}
      </ul>

      {hiddenCount > 0 &&
        (requirement === 'non-member' ? (
          <p className="mt-1 text-xs text-neutral-500">
            The rule excludes {hiddenCount} other {hiddenCount === 1 ? 'group' : 'groups'} {who} is
            not in.
          </p>
        ) : (
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setExpanded(true)}>
            Show {hiddenCount} more {hiddenCount === 1 ? 'group' : 'groups'}
          </Button>
        ))}
    </div>
  );
};

function prerequisiteHeading(
  who: string,
  references: readonly ClauseGroupReference[],
  satisfiedCount: number,
): string {
  const one = references.length === 1;
  if (satisfiedCount === 0) {
    return `${who} would qualify by joining ${one ? 'this group' : 'any one of these groups'}:`;
  }
  return `The rule asks for ${one ? 'this group' : 'one of these groups'}:`;
}

function exclusionHeading(who: string, total: number, blockingCount: number): string {
  const scope = total === 1 ? 'this group' : `any of ${total} excluded groups`;
  if (blockingCount === 0) return `${who} must not be in ${scope}.`;
  return `${who} must not be in ${scope}. They are in ${blockingCount}:`;
}

const GroupEntry: React.FC<{
  reference: ClauseGroupReference;
  requirement: ClauseGroupRequirement;
  resolveGroupName?: (groupId: string) => string | undefined;
  renderGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
}> = ({ reference, requirement, resolveGroupName, renderGroupAction }) => {
  const resolvedName =
    reference.matchedGroupName ??
    (reference.match === 'id' ? resolveGroupName?.(reference.value) : undefined);
  const label = resolvedName ?? groupMatchLabel[reference.match](reference.value);
  const showId = reference.match === 'id' && resolvedName !== undefined;

  const actionable = requirement === 'non-member' ? reference.satisfied : !reference.satisfied;
  const blocking = requirement === 'non-member' && reference.satisfied;

  return (
    <li
      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
        blocking ? 'border border-danger-light bg-danger-light' : 'bg-neutral-50'
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs text-neutral-900" title={label}>
            {label}
          </span>
          {blocking && (
            <span className="shrink-0 text-xs font-medium text-danger-text">blocking</span>
          )}
          {requirement === 'member' && reference.satisfied && (
            <span className="shrink-0 text-xs font-medium text-success-text">already in</span>
          )}
        </span>
        {showId && (
          <CopyableId value={reference.value} label={`Copy group id ${reference.value}`} />
        )}
      </span>
      {actionable && <span className="shrink-0">{renderGroupAction?.(reference)}</span>}
    </li>
  );
};

export default ClauseGroupList;
