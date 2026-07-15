import React, { useState, useEffect } from 'react';
import StatCard from './shared/StatCard';
import QuickActionsPanel, { type ActionSection } from './shared/QuickActionsPanel';
import { UserProfileCard, UserComparisonModal } from '../users';
import { useUserMemberships } from '../../hooks/useUserMemberships';
import { useEntityQuery } from '../../cache/useEntityQuery';
import AlertMessage from '../shared/AlertMessage';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import type { OktaUser } from '../../../shared/types';

interface UserOverviewProps {
  userId: string;
  userName?: string;
  targetTabId: number;
  onTabChange: (tab: 'users') => void;
  oktaOrigin?: string | null;
}

const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  targetTabId,
  onTabChange,
  oktaOrigin,
}) => {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const {
    data: userDetails,
    isLoading: isLoadingUser,
    error: userError,
  } = useEntityQuery<OktaUser>(
    ['userDetails', userId],
    async () => {
      const userResponse = await chrome.tabs.sendMessage(targetTabId, {
        action: 'getUserDetails',
        userId,
      });
      if (!userResponse.success || !userResponse.data) {
        throw new Error(userResponse.error || 'Failed to load user details');
      }
      return userResponse.data as OktaUser;
    },
    { enabled: Boolean(targetTabId && userId) },
  );

  const {
    memberships: groups,
    isLoading: isLoadingMemberships,
    error: membershipError,
    loadMemberships,
  } = useUserMemberships({ targetTabId });

  const isLoading = isLoadingUser || isLoadingMemberships;

  useEffect(() => {
    if (userDetails) loadMemberships(userDetails);
  }, [userDetails, loadMemberships]);

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading user data..." centered />;
  }

  const displayError = userError || membershipError;
  if (displayError) {
    return <AlertMessage message={{ text: displayError, type: 'danger' }} />;
  }

  const directGroups = groups.filter((g) => g.membershipType === 'DIRECT').length;
  const ruleBasedGroups = groups.filter((g) => g.membershipType === 'RULE_BASED').length;
  const unknownGroups = groups.filter((g) => g.membershipType === 'UNKNOWN').length;
  const totalGroups = groups.length;

  const actionSections: ActionSection[] = [
    {
      title: 'Group Management',
      icon: 'users',
      expanded: true,
      actions: [
        {
          label: 'View All Groups',
          icon: 'list',
          variant: 'primary',
          onClick: () => onTabChange('users'),
          badge: `${totalGroups}`,
          tooltip: 'See full list of group memberships',
        },
        {
          label: 'Compare with User',
          icon: 'users',
          variant: 'secondary',
          onClick: () => setIsCompareOpen(true),
          tooltip: 'Compare group & app access with another user',
        },
      ],
    },
    {
      title: 'Analysis',
      icon: 'search',
      expanded: false,
      actions: [
        {
          label: 'Trace Memberships',
          icon: 'link',
          variant: 'ghost',
          onClick: () => onTabChange('users'),
          tooltip: 'Analyze how user got into each group',
        },
      ],
    },
  ];

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    DEPROVISIONED: 'error',
    LOCKED_OUT: 'error',
    PROVISIONED: 'neutral',
    STAGED: 'neutral',
    RECOVERY: 'warning',
    PASSWORD_EXPIRED: 'warning',
  };

  return (
    <div className="space-y-6">
      {userDetails && (
        <UserProfileCard
          user={userDetails}
          groupCount={totalGroups}
          showCollapsibleSections={false}
          oktaOrigin={oktaOrigin}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total Groups" value={totalGroups} color="primary" icon="users" />
        <StatCard title="Direct Assignments" value={directGroups} color="neutral" icon="hand" />
        <StatCard title="Rule-Based" value={ruleBasedGroups} color="neutral" icon="bolt" />
        <StatCard
          title="Status"
          value={userDetails?.status || 'Unknown'}
          color={statusColors[userDetails?.status || ''] || 'neutral'}
          icon="chart"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Quick Actions</h3>
            <QuickActionsPanel sections={actionSections} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-md border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Group Membership Distribution
            </h3>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{totalGroups}</div>
                <div className="text-neutral-600 mt-2">Total Groups</div>
                <div className="mt-4 flex gap-4 justify-center text-sm">
                  {unknownGroups === totalGroups ? (
                    <div>
                      <span className="font-semibold text-neutral-900">{totalGroups}</span>
                      <span className="text-neutral-600"> Total</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-semibold text-neutral-900">{directGroups}</span>
                        <span className="text-neutral-600"> Direct</span>
                      </div>
                      <div>
                        <span className="font-semibold text-neutral-900">{ruleBasedGroups}</span>
                        <span className="text-neutral-600"> Rule-Based</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Groups</h3>
              <Button variant="ghost" size="sm" onClick={() => onTabChange('users')}>
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {groups.slice(0, 5).map((membership, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900 text-sm">
                      {membership.group?.profile?.name || 'Unknown Group'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {membership.membershipType === 'DIRECT'
                        ? 'Direct Assignment'
                        : membership.membershipType === 'RULE_BASED'
                          ? 'Rule-Based'
                          : 'Group'}
                    </div>
                  </div>
                  <span
                    className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${
                      membership.membershipType === 'DIRECT'
                        ? 'bg-primary-light text-primary-text'
                        : membership.membershipType === 'RULE_BASED'
                          ? 'bg-success-light text-success-text'
                          : 'bg-neutral-100 text-neutral-700'
                    }
                  `}
                  >
                    {membership.membershipType === 'DIRECT'
                      ? 'Manual'
                      : membership.membershipType === 'RULE_BASED'
                        ? 'Auto'
                        : 'Member'}
                  </span>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No group memberships found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {userDetails && (
        <UserComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          contextUser={userDetails}
          contextGroups={groups}
          targetTabId={targetTabId}
          onGroupsChanged={() => loadMemberships(userDetails, { force: true })}
        />
      )}
    </div>
  );
};

export default UserOverview;
