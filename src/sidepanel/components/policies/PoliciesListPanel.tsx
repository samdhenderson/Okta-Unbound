import React from 'react';
import PolicyCard from './PolicyCard';
import ScrollableList from '../shared/ScrollableList';
import EmptyState from '../shared/EmptyState';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';

interface PoliciesListPanelProps {
  isLoading: boolean;
  policies: OktaPolicyListItem[];
  hasPolicies: boolean;
  onLoad: () => void;
  loadRules: (policyId: string) => Promise<OktaPolicyRule[]>;
}

const noPoliciesState = (onLoad: () => void) => (
  <EmptyState
    icon="shield"
    title="No App Authentication Policies"
    description="No app authentication policies found — or your admin role can't read policies."
    actions={[{ label: 'Reload Policies', onClick: onLoad, variant: 'primary' }]}
  />
);

const PoliciesListPanel: React.FC<PoliciesListPanelProps> = ({
  isLoading,
  policies,
  hasPolicies,
  onLoad,
  loadRules,
}) => (
  <div className="min-h-[400px]">
    <ScrollableList
      loading={isLoading}
      loadingMessage="Loading auth policies…"
      fillAvailable={false}
      testId="policies-list"
      emptyState={
        hasPolicies ? (
          <EmptyState
            icon="search"
            title="No Matching Policies"
            description="No auth policies match your search."
          />
        ) : (
          noPoliciesState(onLoad)
        )
      }
    >
      {policies.map((policy) => (
        <PolicyCard key={policy.id} policy={policy} loadRules={loadRules} />
      ))}
    </ScrollableList>
  </div>
);

export default PoliciesListPanel;
