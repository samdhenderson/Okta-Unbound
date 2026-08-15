import React, { useId, useState } from 'react';
import { Badge, EntityLink, IconButton, Skeleton, type BadgeVariant } from '../shared';
import Icon from '../overview/shared/Icon';
import ClauseChecklist from '../groups/detail/ClauseChecklist';
import MembershipProofAction, { useMembershipProofs } from './GroupMembershipsListProof';
import { membershipSourceLine, sourceLineLabel } from '../../../shared/membership/sourceLine';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership, MembershipRule, OktaUser } from '../../../shared/types';
import { oktaAdminEntityUrl } from '../../../shared/utils/oktaUrl';

const conditionExpressionOf = (rule: MembershipRule): string =>
  rule.conditionExpression || rule.conditions?.expression?.value || '';

interface GroupMembershipsListProps {
  memberships: GroupMembership[];
  user?: OktaUser;
  isLoading: boolean;
  currentGroupId?: string;
  oktaOrigin?: string | null;
  actions?: React.ReactNode;
  recentlyAddedGroupId?: string | null;
  onProveMembershipSource?: (groupId: string) => Promise<MemberRuleAttribution>;
}

interface RuleEvidenceProps {
  rule: MembershipRule;
  user?: OktaUser;
}

const RuleEvidence: React.FC<RuleEvidenceProps> = ({ rule, user }) => (
  <div className="rounded-md border border-neutral-200 bg-white p-3">
    <EntityLink type="rule" id={rule.id} name={rule.name} />
    <div className="mt-2">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">Condition</span>
      {user ? (
        <ClauseChecklist expression={conditionExpressionOf(rule)} user={user} />
      ) : (
        <code className="block overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-neutral-200 bg-neutral-50 p-2 font-mono text-xs text-neutral-900">
          {conditionExpressionOf(rule) || 'No condition expression'}
        </code>
      )}
    </div>
  </div>
);

const membershipTypeVariant = (type: string): BadgeVariant => {
  switch (type) {
    case 'RULE_BASED':
      return 'primary';
    case 'DIRECT':
      return 'success';
    default:
      return 'neutral';
  }
};

const MembershipSourceRow: React.FC<{
  membership: GroupMembership;
  user?: OktaUser;
}> = ({ membership, user }) => {
  const line = membershipSourceLine(membership);
  const label = sourceLineLabel(line);
  const [open, setOpen] = useState(false);
  const evidenceId = useId();
  const rules = membership.rules;
  const hasEvidence = rules.length > 0;

  return (
    <div className="mt-3">
      <div className="flex items-start justify-between gap-2">
        <span
          className={
            line.proven
              ? 'min-w-0 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700'
              : 'min-w-0 text-xs italic text-neutral-500'
          }
          title={`${label} — ${line.description}`}
        >
          <span>{line.caption}</span>
          {line.detail && <span> {line.detail}</span>}
        </span>

        {hasEvidence && (
          <IconButton
            label={open ? 'Hide the condition' : 'Check the condition'}
            variant="ghost"
            size="sm"
            expanded={open}
            controls={evidenceId}
            className="shrink-0"
            onClick={() => setOpen((v: boolean) => !v)}
          >
            <Icon
              type="chevron-right"
              size="sm"
              className={`transition-transform duration-(--dur-quick) ${open ? 'rotate-90' : ''}`}
            />
          </IconButton>
        )}
      </div>

      {hasEvidence && (
        <div id={evidenceId} className="disclose" data-open={open} inert={!open || undefined}>
          <div>
            <div className="space-y-2 pt-2">
              {rules.map((rule) => (
                <RuleEvidence key={rule.id} rule={rule} user={user} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupMembershipsList: React.FC<GroupMembershipsListProps> = ({
  memberships,
  user,
  isLoading,
  currentGroupId,
  oktaOrigin,
  actions,
  recentlyAddedGroupId,
  onProveMembershipSource,
}) => {
  const proofs = useMembershipProofs(onProveMembershipSource);

  const highlightCurrentGroup = (groupId: string) => {
    return currentGroupId && groupId === currentGroupId;
  };

  return (
    <div className="rounded-md border border-neutral-200 bg-white overflow-hidden">
      <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-900">
          Group Memberships ({memberships.length})
        </h3>
        {actions}
      </div>

      {isLoading ? (
        <div className="p-4">
          <Skeleton variant="row" size="lg" count={4} label="Loading group memberships..." />
        </div>
      ) : memberships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-neutral-500 text-sm">This user is not a member of any groups</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {memberships.map((membership) => (
            <div
              key={membership.group.id}
              className={`
                rounded-md border p-4 transition-all duration-(--dur-instant)
                ${
                  highlightCurrentGroup(membership.group.id)
                    ? 'border-primary bg-primary-light ring-1 ring-primary/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-500'
                }
                ${membership.group.id === recentlyAddedGroupId ? 'animate-affirm-flash' : ''}
              `}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="font-semibold text-neutral-900 text-sm">
                      {membership.group.profile.name}
                    </h4>
                    {highlightCurrentGroup(membership.group.id) && (
                      <span className="px-2 py-0.5 rounded-md bg-primary text-white text-xs font-bold">
                        Current Group
                      </span>
                    )}
                    {oktaOrigin && (
                      <IconButton
                        label="Open group in Okta admin"
                        onClick={() => {
                          const url = oktaAdminEntityUrl(oktaOrigin, 'group', membership.group.id);
                          if (url) window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        variant="ghost"
                        size="md"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </IconButton>
                    )}
                  </div>
                  {membership.group.profile.description && (
                    <p className="text-xs text-neutral-600">
                      {membership.group.profile.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge variant={membershipTypeVariant(membership.membershipType)}>
                    {membership.membershipType.replace('_', ' ')}
                  </Badge>
                  <Badge variant="neutral">{membership.group.type}</Badge>
                </div>
              </div>

              <MembershipSourceRow membership={membership} user={user} />

              {proofs.enabled && (
                <MembershipProofAction
                  membership={membership}
                  outcome={proofs.outcomeFor(membership.group.id)}
                  onProve={proofs.prove}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupMembershipsList;
