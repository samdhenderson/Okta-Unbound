import React from 'react';
import LoadingSpinner from '../shared/LoadingSpinner';
import AlertMessage from '../shared/AlertMessage';
import type { OktaPolicyRule } from '../../../shared/schemas/okta';
import { policyStatusClasses, policyStatusLabel } from './policyStatus';

interface PolicyRulesListProps {
  rules: OktaPolicyRule[] | null;
  isLoading: boolean;
  error: string | null;
}

const PolicyRulesList: React.FC<PolicyRulesListProps> = ({ rules, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner size="sm" message="Loading rules…" centered />;
  }

  if (error) {
    return <AlertMessage message={{ text: `Could not load rules: ${error}`, type: 'danger' }} />;
  }

  if (!rules || rules.length === 0) {
    return <p className="text-sm text-neutral-600">This policy has no rules.</p>;
  }

  return (
    <ul className="space-y-2" data-testid="policy-rules-list">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className="flex items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2"
        >
          <span
            className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-600"
            title="Evaluation priority"
          >
            {rule.priority ?? '—'}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-neutral-900">
            {rule.name ?? rule.id}
          </span>
          {rule.system && (
            <span className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600">
              System
            </span>
          )}
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${policyStatusClasses(rule.status)}`}
          >
            {policyStatusLabel(rule.status)}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default PolicyRulesList;
