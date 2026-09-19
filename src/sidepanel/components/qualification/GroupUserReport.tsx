import React from 'react';
import type { GroupUserVerdict } from '../../../shared/membership/qualificationTypes';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { OktaUser } from '../../../shared/types';
import { Badge, type GroupNameResolver } from '../shared';
import RuleUserReport from './RuleUserReport';
import {
  groupVerdictLabel,
  groupVerdictSentence,
  groupVerdictVariant,
  orderByHeadline,
  rulesOf,
} from './qualificationText';

export interface GroupUserReportProps {
  verdict: GroupUserVerdict;
  groupName: string;
  user: OktaUser;
  groupContext: RuleGroupContext;
  resolveGroupName?: GroupNameResolver;
}

const GroupUserReport: React.FC<GroupUserReportProps> = ({
  verdict,
  groupName,
  user,
  groupContext,
  resolveGroupName,
}) => {
  const rules = orderByHeadline(rulesOf(verdict));
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Badge variant={groupVerdictVariant(verdict.kind)}>{groupVerdictLabel(verdict.kind)}</Badge>
        <p className="text-sm text-neutral-700">{groupVerdictSentence(verdict, groupName)}</p>
      </div>
      {rules.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-600">
            {rules.length === 1
              ? 'The rule feeding this group'
              : `${rules.length} rules feed this group`}
          </p>
          <ul className="mt-1 space-y-2">
            {rules.map((rule) => (
              <li key={rule.ruleId}>
                <RuleUserReport
                  verdict={rule}
                  user={user}
                  groupContext={groupContext}
                  resolveGroupName={resolveGroupName}
                  compact
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GroupUserReport;
