import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from './shared/PageHeader';
import Button from './shared/Button';
import Input from './shared/Input';
import AlertMessage from './shared/AlertMessage';
import PoliciesListPanel from './policies/PoliciesListPanel';
import Icon from './shared/Icon';
import { useOktaApi } from '../hooks/useOktaApi';
import type { OperationResult } from '../hooks/useOktaApi/types';
import { useOwedLoad } from '../hooks/useOwedLoad';
import { usePoliciesData } from '../hooks/usePoliciesData';
import { filterPolicies } from './policies/policyFilters';
import { getRelativeTime } from '../../shared/utils/dateFormat';

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
  const { policies, isLoading, lastFetchTime, loadPolicies } = usePoliciesData({
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

  const handleRefresh = useCallback(
    () => void loadPolicies(hasPolicies),
    [loadPolicies, hasPolicies],
  );
  const handleLoad = useCallback(() => void loadPolicies(true), [loadPolicies]);

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
        actions={
          <Button
            variant={hasPolicies ? 'secondary' : 'primary'}
            icon="refresh"
            onClick={handleRefresh}
            disabled={isLoading}
            loading={isLoading}
          >
            {hasPolicies ? 'Refresh' : 'Load Policies'}
          </Button>
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
          <div className="space-y-2">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              type="search"
              icon={<Icon type="search" size="md" />}
              ariaLabel="Search auth policies"
              placeholder="Search policies by name or description…"
            />
            {lastUpdatedLabel && (
              <p className="text-xs text-neutral-600">Last updated {lastUpdatedLabel}</p>
            )}
          </div>
        )}

        <PoliciesListPanel
          isLoading={isLoading}
          policies={filteredPolicies}
          hasPolicies={hasPolicies}
          onLoad={handleLoad}
          loadRules={api.getPolicyRules}
        />
      </div>
    </div>
  );
};

export default AuthPoliciesTab;
