import React, { memo, useCallback, useId, useState } from 'react';
import { CopyableId, IconButton, ListRow } from '../shared';
import Icon from '../shared/Icon';
import PolicyRulesList from './PolicyRulesList';
import { useEntityQuery } from '../../cache/useEntityQuery';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';
import { policyStatusClasses, policyStatusLabel } from './policyStatus';

interface PolicyCardProps {
  policy: OktaPolicyListItem;
  loadRules: (policyId: string) => Promise<OktaPolicyRule[]>;
}

const PolicyCard: React.FC<PolicyCardProps> = memo(({ policy, loadRules }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rulesId = useId();

  const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

  const {
    data: rules,
    isLoading,
    error,
  } = useEntityQuery<OktaPolicyRule[]>(['policyRules', policy.id], () => loadRules(policy.id), {
    enabled: isExpanded,
  });

  const name = policy.name ?? policy.id;

  return (
    <ListRow
      density="comfortable"
      testId={`policy-${policy.id}`}
      body={
        <div
          id={rulesId}
          className="disclose"
          data-open={isExpanded}
          data-testid="policy-rules-disclosure"
          inert={!isExpanded || undefined}
        >
          <div>
            <div className="space-y-3 border-t border-neutral-100 bg-neutral-50 px-4 pb-4 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Rules
              </div>
              <PolicyRulesList rules={rules} isLoading={isLoading} error={error} />
              <div className="flex min-w-0 items-center gap-1 border-t border-neutral-200 pt-2 text-xs text-neutral-600">
                <span className="shrink-0 font-semibold">Policy ID:</span>
                <CopyableId
                  value={policy.id}
                  label={`Copy policy id for ${policy.name || policy.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">{name}</h3>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${policyStatusClasses(policy.status)}`}
            >
              {policyStatusLabel(policy.status)}
            </span>
            {policy.system && (
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600">
                System
              </span>
            )}
            {policy.priority != null && (
              <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-600">
                Priority {policy.priority}
              </span>
            )}
          </div>
          {policy.description && (
            <p className="truncate text-xs text-neutral-600">{policy.description}</p>
          )}
        </div>
        <IconButton
          label={isExpanded ? `Hide rules for ${name}` : `Show rules for ${name}`}
          variant="ghost"
          size="md"
          expanded={isExpanded}
          controls={rulesId}
          className="shrink-0"
          onClick={toggleExpanded}
        >
          <Icon
            type="chevron-right"
            size="sm"
            className={`transition-transform duration-(--dur-instant) ${isExpanded ? 'rotate-90' : ''}`}
          />
        </IconButton>
      </div>
    </ListRow>
  );
}, arePolicyCardPropsEqual);

function arePolicyCardPropsEqual(prev: PolicyCardProps, next: PolicyCardProps): boolean {
  return (
    prev.loadRules === next.loadRules &&
    prev.policy.id === next.policy.id &&
    prev.policy.name === next.policy.name &&
    prev.policy.status === next.policy.status &&
    prev.policy.description === next.policy.description &&
    prev.policy.priority === next.policy.priority &&
    prev.policy.system === next.policy.system
  );
}

PolicyCard.displayName = 'PolicyCard';

export default PolicyCard;
