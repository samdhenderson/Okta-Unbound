import React, { useId } from 'react';
import type { GroupMembership, OktaUser, MemberMfaResult } from '../../../shared/types';
import { Badge, IconButton, ListRow, OpenInOktaLink, userStatusVariant } from '../shared';
import Icon from '../shared/Icon';
import MembershipRuleEvidence from '../users/MembershipRuleEvidence';
import MembershipProofAction, {
  type MembershipProofOutcome,
} from '../users/GroupMembershipsListProof';
import { membershipVerdict } from '../users/membershipVerdict';
import { membershipSourceLine } from '../../../shared/membership/sourceLine';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import { EXCLUDED_ATTRIBUTES, dimensionTitle } from './memberAnalytics';

interface MemberRowProps {
  user: OktaUser;
  mfa?: MemberMfaResult;
  mfaScanned?: boolean;
  oktaOrigin?: string | null;
  expanded: boolean;
  onToggle: (userId: string) => void;
  onRemove?: (user: OktaUser) => void;
  membership?: GroupMembership;
  proofEnabled?: boolean;
  proofOutcome?: MembershipProofOutcome;
  onProve?: (membership: GroupMembership, rowKey: string) => void;
}

function browseableAttributes(user: OktaUser): Array<[string, string]> {
  const profile = user.profile as Record<string, unknown>;
  return Object.entries(profile)
    .filter(([key]) => !EXCLUDED_ATTRIBUTES.has(key))
    .map(([key, raw]): [string, string] => {
      if (typeof raw === 'string') return [key, raw.trim()];
      if (typeof raw === 'number' || typeof raw === 'boolean') return [key, String(raw)];
      return [key, ''];
    })
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
}

const MemberRow: React.FC<MemberRowProps> = ({
  user,
  mfa,
  mfaScanned,
  oktaOrigin,
  expanded,
  onToggle,
  onRemove,
  membership,
  proofEnabled = false,
  proofOutcome,
  onProve,
}) => {
  const fullName = userDisplayName(user);

  const disclosureId = useId();
  const attributes = browseableAttributes(user);
  const line = membership ? membershipSourceLine(membership) : null;
  const verdict = membership ? membershipVerdict(membership) : null;
  const loginDiffersFromEmail = user.profile.login !== user.profile.email;

  return (
    <ListRow
      density="compact"
      dataAttributes={{ 'data-user-id': user.id }}
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={expanded}
          inert={!expanded || undefined}
        >
          <div>
            <div className="space-y-3 border-t border-neutral-200 px-(--sp-row-x) pb-3 pt-2">
              {line && <p className="text-xs text-pretty text-neutral-600">{line.description}</p>}

              {membership?.rules.map((rule) => (
                <MembershipRuleEvidence key={rule.id} rule={rule} user={user} />
              ))}

              {attributes.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-medium text-neutral-600">Profile</div>
                  <dl className="space-y-0.5">
                    {attributes.map(([key, value]) => (
                      <div key={key} className="flex items-baseline justify-between gap-3">
                        <dt className="shrink-0 text-xs text-neutral-600">{dimensionTitle(key)}</dt>
                        <dd className="min-w-0 truncate font-mono text-xs text-neutral-900">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {membership && onProve && proofEnabled && !membership.provenance && (
                <MembershipProofAction
                  membership={membership}
                  outcome={proofOutcome}
                  onProve={(target) => onProve(target, user.id)}
                />
              )}

              <OpenInOktaLink oktaOrigin={oktaOrigin} entityType="user" entityId={user.id} />
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-neutral-900">{fullName}</div>
          <div className="truncate text-xs text-neutral-600">{user.profile.email}</div>
          {loginDiffersFromEmail && (
            <div className="truncate font-mono text-xs text-neutral-500">{user.profile.login}</div>
          )}
          {line && (
            <p className="mt-0.5 truncate text-xs text-neutral-600">
              <span>{line.caption}</span>
              {line.detail && <span> {line.detail}</span>}
            </p>
          )}
          {mfaScanned && (
            <div className="mt-1.5 flex flex-wrap gap-(--sp-inline)">
              {mfa && mfa.factorLabels.length > 0 ? (
                mfa.factorLabels.map((label) => (
                  <Badge key={label} variant="info">
                    {label}
                  </Badge>
                ))
              ) : (
                <Badge variant="danger">No MFA</Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-(--sp-inline)">
          {verdict && (
            <Badge variant={verdict.variant} title={verdict.title}>
              {verdict.label}
            </Badge>
          )}
          <Badge variant={userStatusVariant(user.status)}>{user.status}</Badge>
          {onRemove && (
            <IconButton
              label={`Remove ${fullName} from this group`}
              variant="danger"
              size="sm"
              onClick={() => onRemove(user)}
            >
              <Icon type="trash" size="sm" />
            </IconButton>
          )}
          <IconButton
            label={`${expanded ? 'Hide' : 'Show'} details for ${fullName}`}
            variant="ghost"
            size="sm"
            expanded={expanded}
            controls={disclosureId}
            onClick={() => onToggle(user.id)}
          >
            <Icon
              type="chevron-right"
              size="sm"
              className={`transition-transform duration-(--dur-quick) ${expanded ? 'rotate-90' : ''}`}
            />
          </IconButton>
        </div>
      </div>
    </ListRow>
  );
};

export default React.memo(MemberRow);
