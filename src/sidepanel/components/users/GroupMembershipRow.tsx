import React, { useId } from 'react';
import { Badge, IconButton, ListRow, OpenInOktaLink } from '../shared';
import Icon from '../shared/Icon';
import MembershipRuleEvidence from './MembershipRuleEvidence';
import MembershipProofAction, { type MembershipProofOutcome } from './GroupMembershipsListProof';
import { membershipVerdict } from './membershipVerdict';
import { membershipSourceLine } from '../../../shared/membership/sourceLine';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { GroupMembership, OktaUser } from '../../../shared/types';

export interface GroupMembershipRowProps {
  membership: GroupMembership;
  user?: OktaUser;
  groupContext?: RuleGroupContext;
  isCurrentGroup: boolean;
  expanded: boolean;
  onToggle: (groupId: string) => void;
  oktaOrigin?: string | null;
  flash?: boolean;
  appNames?: string[];
  proofEnabled: boolean;
  proofOutcome?: MembershipProofOutcome;
  onProve: (membership: GroupMembership) => void;
}

const GroupMembershipRow: React.FC<GroupMembershipRowProps> = ({
  membership,
  user,
  groupContext,
  isCurrentGroup,
  expanded,
  onToggle,
  oktaOrigin,
  flash = false,
  appNames,
  proofEnabled,
  proofOutcome,
  onProve,
}) => {
  const { group, rules } = membership;
  const line = membershipSourceLine(membership);
  const verdict = membershipVerdict(membership);
  const disclosureId = useId();
  const groupName = group.profile.name;

  return (
    <ListRow
      density="compact"
      state={isCurrentGroup ? 'highlighted' : 'default'}
      flash={flash}
      dataAttributes={{ 'data-group-id': group.id }}
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={expanded}
          inert={!expanded || undefined}
        >
          <div>
            <div className="space-y-(--sp-rung) border-t border-neutral-200 px-(--sp-row-x) pb-3 pt-2">
              <p className="text-xs text-pretty text-neutral-600">{line.description}</p>

              {rules.map((rule) => (
                <MembershipRuleEvidence
                  key={rule.id}
                  rule={rule}
                  user={user}
                  groupContext={groupContext}
                />
              ))}

              {appNames && appNames.length > 0 && (
                <p className="text-xs text-neutral-600">
                  <span className="font-medium text-neutral-700">Also grants:</span>{' '}
                  {appNames.join(', ')}
                </p>
              )}

              {proofEnabled && (
                <MembershipProofAction
                  membership={membership}
                  outcome={proofOutcome}
                  onProve={onProve}
                />
              )}

              <OpenInOktaLink oktaOrigin={oktaOrigin} entityType="group" entityId={group.id} />
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-(--sp-inline)">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-(--sp-inline)">
            <h4 className="truncate text-sm font-semibold text-neutral-900">{groupName}</h4>
            <Badge variant={verdict.variant} title={verdict.title} className="shrink-0">
              {verdict.label}
            </Badge>
            {isCurrentGroup && (
              <Badge variant="primary" className="shrink-0">
                On page
              </Badge>
            )}
          </div>

          <p className="mt-0.5 truncate text-xs text-neutral-600">
            <span>{line.caption}</span>
            {line.detail && <span> {line.detail}</span>}
          </p>
        </div>

        <IconButton
          label={`${expanded ? 'Hide' : 'Show'} how ${groupName} was granted`}
          variant="ghost"
          size="sm"
          expanded={expanded}
          controls={disclosureId}
          className="shrink-0"
          onClick={() => onToggle(group.id)}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-quick) ${expanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
};

export default GroupMembershipRow;
