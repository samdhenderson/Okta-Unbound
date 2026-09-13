import React, { memo } from 'react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import PolicyCard from './PolicyCard';
import Button from '../shared/Button';
import ScrollableList from '../shared/ScrollableList';
import EmptyState from '../shared/EmptyState';
import Skeleton from '../shared/Skeleton';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';

interface PoliciesListPanelProps {
  isLoading: boolean;
  policies: OktaPolicyListItem[];
  hasPolicies: boolean;
  onLoad: () => void;
  loadRules: (policyId: string) => Promise<OktaPolicyRule[]>;
  selectedIds: Set<string>;
  onToggleSelect: (policyId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const noPoliciesState = (onLoad: () => void) => (
  <EmptyState
    icon="shield"
    title="No App Authentication Policies"
    description="No app authentication policies found — or your admin role can't read policies."
    actions={[{ label: 'Reload Policies', onClick: onLoad, variant: 'primary' }]}
  />
);

const PoliciesListPanel: React.FC<PoliciesListPanelProps> = memo(function PoliciesListPanel({
  isLoading,
  policies,
  hasPolicies,
  onLoad,
  loadRules,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}) {
  const setStaggerRef = useStaggerReveal();
  const selectedHere = selectedIds.size;
  const allFilteredSelected =
    policies.length > 0 && policies.every((policy) => selectedIds.has(policy.id));

  return (
    <div className="min-h-[400px]">
      {policies.length > 0 && (
        <div className="mb-(--sp-toolbar) flex items-center justify-between gap-3">
          {selectedHere > 0 ? (
            <p className="text-xs tabular-nums text-primary-text">
              {selectedHere.toLocaleString()} selected
            </p>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 items-center gap-(--sp-inline)">
            {selectedHere > 0 && (
              <Button
                variant="link"
                size="xs"
                onClick={onDeselectAll}
                title="Clear every selected policy, including any picked on another screen"
              >
                Deselect all
              </Button>
            )}
            <Button
              variant="link"
              size="xs"
              onClick={onSelectAll}
              disabled={allFilteredSelected}
              title={
                allFilteredSelected
                  ? `All ${policies.length.toLocaleString()} policies matching the current search are already selected`
                  : `Replace the policy selection with the ${policies.length.toLocaleString()} policies matching the current search`
              }
            >
              Select all
            </Button>
          </div>
        </div>
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
            noPoliciesState(onLoad)
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
