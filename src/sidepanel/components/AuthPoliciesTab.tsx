import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from './shared/PageHeader';
import Input from './shared/Input';
import AlertMessage from './shared/AlertMessage';
import PoliciesListPanel from './policies/PoliciesListPanel';
import PoliciesListActionBar from './policies/PoliciesListActionBar';
import Icon from './shared/Icon';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useOwedLoad } from '../hooks/useOwedLoad';
import { usePoliciesData } from '../hooks/usePoliciesData';
import { useRefreshSubject } from '../hooks/useRefreshSubject';
import { useRungSelection } from '../selection/useRungSelection';
import { filterPolicies } from './policies/policyFilters';
import { getRelativeTime } from '../../shared/utils/dateFormat';

const policyName = (policy: { name?: string; id: string }) => policy.name ?? policy.id;

interface AuthPoliciesTabProps {
  targetTabId?: number;
  oktaOrigin?: string | null;
  isActive?: boolean;
  selectedPolicyId?: string | null;
  onPolicySelected?: () => void;
}

const AuthPoliciesTab: React.FC<AuthPoliciesTabProps> = ({
  targetTabId,
  isActive = true,
  selectedPolicyId,
  onPolicySelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((message: string) => setError(message || null), []);

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message || null);
  }, []);

  const api = useOktaApi({ targetTabId: targetTabId ?? null, onResult: handleResult });
  const { policies, readState, isLoading, lastFetchTime, loadPolicies } = usePoliciesData({
    targetTabId,
    onError: handleError,
  });

  useOwedLoad(targetTabId ?? null, isActive, () => {
    void loadPolicies(false);
  });

  const filteredPolicies = useMemo(
    () => filterPolicies(policies, searchQuery),
    [policies, searchQuery],
  );

  const selection = useRungSelection('policy', policies, policyName);
  const { replaceSelection } = selection;

  const allFilteredSelected =
    filteredPolicies.length > 0 &&
    filteredPolicies.every((policy) => selection.selectedIds.has(policy.id));

  const handleSelectAll = useCallback(() => {
    const outcome = replaceSelection(filteredPolicies.map((policy) => policy.id));
    if (outcome.refused > 0) {
      setError(
        `Selecting ${outcome.refused} policies would take the selection past its limit, so nothing changed. Narrow the search and try again.`,
      );
    }
  }, [replaceSelection, filteredPolicies]);

  const selectedPolicyHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedPolicyId) {
      selectedPolicyHandledRef.current = null;
      return;
    }
    if (selectedPolicyHandledRef.current === selectedPolicyId) return;
    if (policies.length === 0) return;
    selectedPolicyHandledRef.current = selectedPolicyId;
    const match = policies.find((policy) => policy.id === selectedPolicyId);
    if (match?.name) setSearchQuery(match.name);
    onPolicySelected?.();
  }, [selectedPolicyId, policies, onPolicySelected]);

  const hasPolicies = policies.length > 0;
  const lastUpdatedLabel = lastFetchTime ? getRelativeTime(lastFetchTime) : null;

  const handleLoad = useCallback(() => void loadPolicies(true), [loadPolicies]);

  useRefreshSubject('the auth policies list', handleLoad, isActive);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Auth Policies"
        subtitle="Browse the app authentication (sign-on) policies that govern how users authenticate into apps"
        badge={
          hasPolicies
            ? {
                text: `${policies.length} ${policies.length === 1 ? 'Policy' : 'Policies'}`,
                variant: 'neutral',
              }
            : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        {error && (
          <AlertMessage
            message={{ text: error, type: 'danger' }}
            onDismiss={() => setError(null)}
          />
        )}

        {hasPolicies && (
          <div className="space-y-(--sp-toolbar)">
            <PoliciesListActionBar
              search={
                <Input
                  value={searchQuery}
                  onChange={setSearchQuery}
                  type="search"
                  icon={<Icon type="search" size="md" />}
                  ariaLabel="Search auth policies"
                  placeholder="Search policies by name or description…"
                />
              }
              selectedCount={selection.selectedIds.size}
              filteredCount={filteredPolicies.length}
              allFilteredSelected={allFilteredSelected}
              onSelectAll={handleSelectAll}
              onDeselectAll={selection.deselectAll}
            />
            {lastUpdatedLabel && (
              <p className="text-xs text-neutral-600">Last updated {lastUpdatedLabel}</p>
            )}
          </div>
        )}

        <PoliciesListPanel
          isLoading={isLoading}
          policies={filteredPolicies}
          totalCount={policies.length}
          hasPolicies={hasPolicies}
          readState={readState}
          onLoad={handleLoad}
          loadRules={api.getPolicyRules}
          selectedIds={selection.selectedIds}
          onToggleSelect={selection.toggleSelect}
        />
      </div>
    </div>
  );
};

export default AuthPoliciesTab;
