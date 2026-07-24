import React from 'react';
import type { GroupInfo, UserInfo, AppInfo } from '../../shared/types';
import type { PageType } from '../hooks/useOktaPageContext';
import type { ConnectionStatus } from '../hooks/useOktaTabContext';
import AlertMessage from './shared/AlertMessage';
import EmptyState from './shared/EmptyState';
import LoadingSpinner from './shared/LoadingSpinner';
import GroupOverview from './overview/GroupOverview';
import UserOverview from './overview/UserOverview';
import AppOverview from './overview/AppOverview';

interface OverviewTabProps {
  onTabChange: (tab: 'rules' | 'users' | 'groups' | 'history', selectedRuleId?: string) => void;
  pageType: PageType;
  groupInfo: GroupInfo | null;
  userInfo: UserInfo | null;
  appInfo: AppInfo | null;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  oktaOrigin: string | null;
  onRetry: () => void;
  onViewAllGroups: () => void;
  onExportGroup: (groupId: string, groupName: string) => void;
  onExportApp: (descriptorId: string, appId: string, appName: string) => void;
  onViewGroupRules: (groupId: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  onTabChange,
  pageType,
  groupInfo,
  userInfo,
  appInfo,
  connectionStatus,
  targetTabId,
  error,
  isLoading,
  oktaOrigin,
  onRetry,
  onViewAllGroups,
  onExportGroup,
  onExportApp,
  onViewGroupRules,
}) => {
  if (isLoading) {
    return (
      <div className="tab-content active">
        <LoadingSpinner size="lg" message="Detecting page context..." centered />
      </div>
    );
  }

  if (connectionStatus === 'error' || error) {
    return (
      <div className="tab-content active">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <AlertMessage
            message={{
              text: error || 'Please open an Okta admin page in this window',
              type: 'danger',
            }}
            action={{ label: 'Retry Connection', onClick: onRetry }}
          />
          <AlertMessage
            message={{
              text: 'Quick Start: 1) Open an Okta admin page (e.g., okta.com) 2) Navigate to a group, user, or app page 3) The Overview tab will automatically detect the context',
              type: 'info',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        {pageType === 'group' && groupInfo && targetTabId && (
          <GroupOverview
            groupId={groupInfo.groupId}
            groupName={groupInfo.groupName}
            targetTabId={targetTabId}
            onViewRules={() => onViewGroupRules(groupInfo.groupId)}
            onExportMembers={onExportGroup}
            oktaOrigin={oktaOrigin}
          />
        )}

        {pageType === 'user' && userInfo && targetTabId && (
          <UserOverview
            userId={userInfo.userId}
            userName={userInfo.userName}
            targetTabId={targetTabId}
            onViewAllGroups={onViewAllGroups}
            oktaOrigin={oktaOrigin}
          />
        )}

        {pageType === 'app' && appInfo && targetTabId && (
          <AppOverview appId={appInfo.appId} appName={appInfo.appName} onExport={onExportApp} />
        )}

        {(pageType === 'unknown' ||
          pageType === 'admin' ||
          (pageType === 'app' && (!appInfo || !targetTabId))) && (
          <EmptyState
            icon="search"
            title="Waiting for Context"
            description="Navigate to a group or user page in Okta to see contextual insights and quick actions."
            actions={[
              { label: 'Browse Groups', onClick: () => onTabChange('groups'), variant: 'primary' },
              { label: 'Search Users', onClick: () => onTabChange('users'), variant: 'secondary' },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
