import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './shared/StatCard';
import { UserIdentity, UserComparisonModal } from '../users';
import { formatDateShort, getRelativeTime } from '../../../shared/utils/dateFormat';
import { useUserMemberships } from '../../hooks/useUserMemberships';
import { useOktaApi } from '../../hooks/useOktaApi';
import { useEntityQuery } from '../../cache/useEntityQuery';
import AlertMessage from '../shared/AlertMessage';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import type { OktaUser } from '../../../shared/types';

interface UserOverviewProps {
  userId: string;
  userName?: string;
  targetTabId: number;
  onViewAllGroups: () => void;
  oktaOrigin?: string | null;
}

const UserOverview: React.FC<UserOverviewProps> = ({
  userId,
  targetTabId,
  onViewAllGroups,
  oktaOrigin,
}) => {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { makeApiRequest } = useOktaApi({ targetTabId });

  const {
    data: userDetails,
    isLoading: isLoadingUser,
    error: userError,
  } = useEntityQuery<OktaUser>(
    ['userDetails', userId],
    async () => {
      const userResponse = await makeApiRequest(`/api/v1/users/${userId}`);
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

  const PREVIEW_LIMIT = 8;
  const sortedGroups = useMemo(
    () =>
      [...groups].sort((a, b) =>
        (a.group?.profile?.name || '').localeCompare(b.group?.profile?.name || ''),
      ),
    [groups],
  );

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
  const totalGroups = groups.length;

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    DEPROVISIONED: 'danger',
    LOCKED_OUT: 'danger',
    PROVISIONED: 'neutral',
    STAGED: 'neutral',
    RECOVERY: 'warning',
    PASSWORD_EXPIRED: 'warning',
  };

  return (
    <div className="space-y-6">
      {userDetails && (
        <div className="space-y-2">
          <UserIdentity
            user={userDetails}
            oktaOrigin={oktaOrigin}
            showOktaLink={false}
            showId={false}
          />
          <div className="flex flex-wrap gap-x-6 gap-y-1 px-1 text-xs text-neutral-500">
            <span>
              Last login{' '}
              <span className="font-medium text-neutral-700">
                {userDetails.lastLogin
                  ? getRelativeTime(userDetails.lastLogin) || formatDateShort(userDetails.lastLogin)
                  : 'Never'}
              </span>
            </span>
            <span>
              Created{' '}
              <span className="font-medium text-neutral-700">
                {userDetails.created
                  ? getRelativeTime(userDetails.created) || formatDateShort(userDetails.created)
                  : 'Unknown'}
              </span>
            </span>
          </div>
        </div>
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

      <div className="bg-white rounded-md border border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Groups</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon="users"
              onClick={() => setIsCompareOpen(true)}
              title="Compare group & app access with another user"
            >
              Compare
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="list"
              onClick={onViewAllGroups}
              title="Open this user in the Users tab with all groups loaded"
            >
              View all
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">
            No group memberships found
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {sortedGroups.slice(0, PREVIEW_LIMIT).map((membership, index) => (
                <div
                  key={membership.group?.id || index}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 text-sm truncate">
                      {membership.group?.profile?.name || 'Unknown Group'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {membership.membershipType === 'DIRECT'
                        ? 'Direct assignment'
                        : membership.membershipType === 'RULE_BASED'
                          ? 'Rule-based'
                          : 'Membership'}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-md text-xs font-medium ${
                      membership.membershipType === 'DIRECT'
                        ? 'bg-primary-light text-primary-text'
                        : membership.membershipType === 'RULE_BASED'
                          ? 'bg-success-light text-success-text'
                          : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {membership.membershipType === 'DIRECT'
                      ? 'Manual'
                      : membership.membershipType === 'RULE_BASED'
                        ? 'Auto'
                        : 'Member'}
                  </span>
                </div>
              ))}
            </div>
            {totalGroups > PREVIEW_LIMIT && (
              <button
                type="button"
                onClick={onViewAllGroups}
                className="mt-3 w-full text-center text-xs font-medium text-primary-text hover:underline"
              >
                Showing {PREVIEW_LIMIT} of {totalGroups} — view all
              </button>
            )}
          </>
        )}
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
