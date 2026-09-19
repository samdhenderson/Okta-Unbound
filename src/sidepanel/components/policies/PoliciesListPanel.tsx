import React, { memo } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import PolicyCard from './PolicyCard';
import ScrollableList from '../shared/ScrollableList';
import EmptyState from '../shared/EmptyState';
import Skeleton from '../shared/Skeleton';
import ListCountRow from '../shared/ListCountRow';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';
import type { PolicyReadState } from '../../hooks/usePoliciesData';

interface PoliciesListPanelProps {
  isLoading: boolean;
  policies: OktaPolicyListItem[];
  totalCount: number;
  hasPolicies: boolean;
  readState: PolicyReadState;
  onLoad: () => void;
  loadRules: (policyId: string) => Promise<OktaPolicyRule[]>;
  selectedIds: Set<string>;
  onToggleSelect: (policyId: string) => void;
  allFilteredSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const noPoliciesState = (readState: PolicyReadState, onLoad: () => void) => {
  if (readState === 'forbidden') {
    return (
      <EmptyState
        icon="shield"
        title="Policies are not readable by this admin role"
        description="Okta refused the read. An admin role with policy read access can list app authentication policies; this one cannot, so the panel has nothing to show."
        actions={[{ label: 'Check again', onClick: onLoad, variant: 'secondary' }]}
      />
    );
  }

  if (readState === 'listed') {
    return (
      <EmptyState
        icon="shield"
        title="No app authentication policies"
        description="Okta reports this org has no app authentication policies."
        actions={[{ label: 'Reload policies', onClick: onLoad, variant: 'primary' }]}
      />
    );
  }

  return (
    <EmptyState
      icon="shield"
      title="App authentication policies not loaded"
      description="Nothing has been read from Okta yet."
      actions={[{ label: 'Load policies', onClick: onLoad, variant: 'primary' }]}
    />
  );
};

const PoliciesListPanel: React.FC<PoliciesListPanelProps> = memo(function PoliciesListPanel({
  isLoading,
  policies,
  totalCount,
  hasPolicies,
  readState,
  onLoad,
  loadRules,
  selectedIds,
  onToggleSelect,
  allFilteredSelected,
  onSelectAll,
  onDeselectAll,
}) {
  const setStaggerRef = useStaggerReveal();
  const selectedHere = selectedIds.size;

  return (
    <div className="min-h-[400px]">
      {policies.length > 0 && (
        <ListCountRow
          shown={policies.length}
          of={totalCount}
          selected={selectedHere}
          selection={{
            boundary: allFilteredSelected ? 'all-taken' : 'available',
            onSelectAll,
            onDeselectAll,
            selectAllTitle: allFilteredSelected
              ? `All ${policies.length.toLocaleString()} policies matching the current search are already selected`
              : `Replace the policy selection with the ${policies.length.toLocaleString()} policies matching the current search`,
            deselectAllTitle: 'Clear every selected policy, including any picked on another screen',
          }}
          testId="policies-count-line"
        />
      )}
      <ScrollableList
        loading={isLoading}
        loadingMessage="Loading auth policies…"
        skeleton={<Skeleton variant="row" size="lg" count={6} label="Loading auth policies" />}
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
            noPoliciesState(readState, onLoad)
          )
        }
      >
        {policies.length > 0 && (
          <div ref={setStaggerRef} className="space-y-(--sp-rung) rise-in-stagger">
            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                loadRules={loadRules}
                selected={selectedIds.has(policy.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        )}
      </ScrollableList>
    </div>
  );
});

export default PoliciesListPanel;
