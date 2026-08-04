import React, { useMemo } from 'react';
import AlertMessage from '../shared/AlertMessage';
import LoadingSpinner from '../shared/LoadingSpinner';
import StatCard from './shared/StatCard';
import { useOktaApi } from '../../hooks/useOktaApi';
import { useEntityQuery } from '../../cache/useEntityQuery';
import type { OktaPolicyRule } from '@/shared/schemas/okta';

const NO_RULES: readonly OktaPolicyRule[] = [];

interface AuthPolicyOverviewProps {
  policyId: string;
  policyName: string | null;
  policyStatus?: string;
  targetTabId: number;
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-success-light text-success-text',
  INACTIVE: 'bg-neutral-100 text-neutral-700',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${
      STATUS_CLASSES[status] ?? 'bg-neutral-100 text-neutral-700'
    }`}
  >
    {status}
  </span>
);

const AuthPolicyOverview: React.FC<AuthPolicyOverviewProps> = ({
  policyId,
  policyName,
  policyStatus,
  targetTabId,
}) => {
  const { getPolicyRules } = useOktaApi({ targetTabId });

  const {
    data: rulesData,
    isLoading,
    error,
    refetch,
  } = useEntityQuery<OktaPolicyRule[]>(['policyRules', policyId], () => getPolicyRules(policyId), {
    enabled: Boolean(targetTabId && policyId),
  });

  const rules = rulesData ?? NO_RULES;
  const sortedRules = useMemo(
    () =>
      [...rules].sort(
        (a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER),
      ),
    [rules],
  );
  const activeCount = useMemo(
    () => sortedRules.filter((rule) => rule.status === 'ACTIVE').length,
    [sortedRules],
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            {policyName ?? 'Authentication policy'}
          </h2>
          {policyStatus && <StatusBadge status={policyStatus} />}
        </div>
        <p className="mt-0.5 text-sm text-neutral-600">
          Detected authentication policy. Its rules are shown read-only below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Rules" value={rules.length} color="primary" icon="list" />
        <StatCard title="Active Rules" value={activeCount} color="success" icon="check" />
      </div>

      <div className="bg-white rounded-md border border-neutral-200 p-6">
        <h3 className="mb-4 text-lg font-semibold text-neutral-900">Rules</h3>

        {isLoading && rules.length === 0 ? (
          <LoadingSpinner size="md" message="Loading policy rules..." centered />
        ) : error ? (
          <AlertMessage
            message={{ text: error, type: 'danger' }}
            action={{ label: 'Retry', onClick: refetch }}
          />
        ) : sortedRules.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            No rules found for this policy
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedRules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900">
                    {rule.name || rule.id}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {rule.priority == null ? 'No priority' : `Priority ${rule.priority}`}
                  </div>
                </div>
                {rule.status && <StatusBadge status={rule.status} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AuthPolicyOverview;
