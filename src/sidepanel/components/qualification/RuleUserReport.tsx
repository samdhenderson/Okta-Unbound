import React from 'react';
import type {
  RuleUserVerdict,
  TargetGroupFact,
} from '../../../shared/membership/qualificationTypes';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { OktaUser } from '../../../shared/types';
import {
  Badge,
  ClauseLedger,
  CollapsibleSection,
  EntityLink,
  type GroupNameResolver,
} from '../shared';
import MissingGroupChip from '../rules/MissingGroupChip';
import { exclusionSentence, headlinePresentation, undeterminedSentence } from './qualificationText';

export interface RuleUserReportProps {
  verdict: RuleUserVerdict;
  user: OktaUser;
  groupContext: RuleGroupContext;
  resolveGroupName?: GroupNameResolver;
  compact?: boolean;
}

const TargetRow: React.FC<{ target: TargetGroupFact; resolveGroupName?: GroupNameResolver }> = ({
  target,
  resolveGroupName,
}) => (
  <li className="flex flex-wrap items-center justify-between gap-2 py-1">
    {target.missing ? (
      <MissingGroupChip groupId={target.groupId} />
    ) : (
      <EntityLink
        type="group"
        id={target.groupId}
        name={target.groupName ?? resolveGroupName?.(target.groupId)}
      />
    )}
    <Badge variant={target.member ? 'success' : 'neutral'}>
      {target.member ? 'Member' : 'Not a member'}
    </Badge>
  </li>
);

const Headline: React.FC<{ verdict: RuleUserVerdict }> = ({ verdict }) => {
  const headline = headlinePresentation(verdict.headline);
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={headline.variant}>{headline.label}</Badge>
        {!verdict.active && verdict.headline !== 'inactive-would-match' && (
          <Badge
            variant="warning"
            title="The rule is not active, so its verdict places nobody today."
          >
            {verdict.status === 'INVALID' ? 'Invalid' : 'Inactive'}
          </Badge>
        )}
      </div>
      <p className="text-sm text-neutral-700">
        {headline.sentence}
        {verdict.undeterminedReason && ` ${undeterminedSentence(verdict.undeterminedReason)}`}
      </p>
      {verdict.exclusion !== 'none' && (
        <p className="text-xs text-neutral-600">{exclusionSentence(verdict.exclusion)}</p>
      )}
    </div>
  );
};

const Evidence: React.FC<
  Pick<RuleUserReportProps, 'verdict' | 'user' | 'groupContext' | 'resolveGroupName'>
> = ({ verdict, user, groupContext, resolveGroupName }) =>
  verdict.expression === '' ? (
    <p className="text-xs text-neutral-600">This rule has no condition expression to explain.</p>
  ) : (
    <ClauseLedger
      expression={verdict.expression}
      user={user}
      groupContext={groupContext}
      resolveGroupName={resolveGroupName}
    />
  );

const RuleUserReport: React.FC<RuleUserReportProps> = ({
  verdict,
  user,
  groupContext,
  resolveGroupName,
  compact = false,
}) => {
  const targets = verdict.targets.length > 0 && (
    <div>
      <p className="text-xs font-medium text-neutral-600">Then add to groups</p>
      <ul className="mt-1 divide-y divide-neutral-100">
        {verdict.targets.map((target) => (
          <TargetRow key={target.groupId} target={target} resolveGroupName={resolveGroupName} />
        ))}
      </ul>
    </div>
  );

  if (compact) {
    return (
      <article
        className="rounded-md border border-neutral-200 bg-white p-(--sp-card)"
        aria-label={verdict.ruleName}
      >
        <p className="text-sm font-semibold break-words text-neutral-900" title={verdict.ruleName}>
          {verdict.ruleName}
        </p>
        <div className="mt-2">
          <Headline verdict={verdict} />
        </div>
        <div className="mt-2">
          <CollapsibleSection title="Condition" defaultOpen={false}>
            <Evidence
              verdict={verdict}
              user={user}
              groupContext={groupContext}
              resolveGroupName={resolveGroupName}
            />
          </CollapsibleSection>
        </div>
        {targets && <div className="mt-2">{targets}</div>}
      </article>
    );
  }

  return (
    <div className="space-y-4">
      <Headline verdict={verdict} />
      <Evidence
        verdict={verdict}
        user={user}
        groupContext={groupContext}
        resolveGroupName={resolveGroupName}
      />
      {targets}
    </div>
  );
};

export default RuleUserReport;
