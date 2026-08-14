import React from 'react';
import { Button, IconButton, LoadingSpinner } from '../shared';
import ClauseChecklist from '../groups/detail/ClauseChecklist';
import type {
  GroupMembership,
  MembershipAttribution,
  MembershipRule,
  OktaUser,
} from '../../../shared/types';
import { oktaAdminEntityUrl } from '../../../shared/utils/oktaUrl';

const conditionExpressionOf = (rule: MembershipRule): string =>
  rule.conditionExpression || rule.conditions?.expression?.value || '';

interface GroupMembershipsListProps {
  memberships: GroupMembership[];
  user?: OktaUser;
  isLoading: boolean;
  currentGroupId?: string;
  oktaOrigin?: string | null;
  onNavigateToRule?: (ruleId: string) => void;
  actions?: React.ReactNode;
}

interface RuleAttributionBlockProps {
  rule: MembershipRule;
  attribution: MembershipAttribution;
  user?: OktaUser;
  onNavigateToRule?: (ruleId: string) => void;
}

const attributionLabel: Record<MembershipAttribution, string> = {
  exact: 'Added by Rule:',
  inferred: 'Likely added by rule:',
  ambiguous: 'Possible rule:',
};

const RuleAttributionBlock: React.FC<RuleAttributionBlockProps> = ({
  rule,
  attribution,
  user,
  onNavigateToRule,
}) => (
  <div className="p-3 bg-primary-light rounded-md border border-primary-highlight">
    <div className="flex items-center gap-2 mb-2">
      <svg
        className="w-4 h-4 text-primary-text"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span className="text-sm font-semibold text-primary-dark">
        {attributionLabel[attribution]}
      </span>
      <span className="text-sm text-primary-text">{rule.name}</span>
      {onNavigateToRule && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateToRule(rule.id)}
          title="View this rule in Rules tab"
          className="ml-auto"
        >
          View Rule
        </Button>
      )}
    </div>
    <div className="mt-2">
      <span className="text-xs font-semibold text-primary-text block mb-1">Condition:</span>
      {user ? (
        <ClauseChecklist expression={conditionExpressionOf(rule)} user={user} />
      ) : (
        <code className="block text-xs font-mono text-neutral-900 bg-white p-2 rounded-md border border-primary-highlight overflow-x-auto break-words whitespace-pre-wrap">
          {conditionExpressionOf(rule) || 'No condition expression'}
        </code>
      )}
    </div>
  </div>
);

const getMembershipTypeBadge = (type: string) => {
  switch (type) {
    case 'RULE_BASED':
      return 'badge badge-info';
    case 'DIRECT':
      return 'badge badge-success';
    default:
      return 'badge badge-muted';
  }
};

const GroupMembershipsList: React.FC<GroupMembershipsListProps> = ({
  memberships,
  user,
  isLoading,
  currentGroupId,
  oktaOrigin,
  onNavigateToRule,
  actions,
}) => {
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
        <LoadingSpinner size="lg" message="Loading group memberships..." centered />
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
                rounded-md border p-4 transition-all duration-100
                ${
                  highlightCurrentGroup(membership.group.id)
                    ? 'border-primary bg-primary-light ring-1 ring-primary/20'
                    : 'border-neutral-200 bg-white hover:border-neutral-500'
                }
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
                  <span className={getMembershipTypeBadge(membership.membershipType)}>
                    {membership.membershipType.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
                    {membership.group.type}
                  </span>
                </div>
              </div>

              {membership.membershipType === 'RULE_BASED' && membership.rules.length > 0 && (
                <div className="mt-3 space-y-3">
                  {membership.rules.map((rule) => (
                    <RuleAttributionBlock
                      key={rule.id}
                      rule={rule}
                      attribution={membership.attribution}
                      user={user}
                      onNavigateToRule={onNavigateToRule}
                    />
                  ))}
                </div>
              )}

              {membership.membershipType === 'DIRECT' && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-md border border-neutral-200">
                  <p className="text-xs text-neutral-600 flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-neutral-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    This user was added directly to the group (not through a rule)
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupMembershipsList;
