import React, { useState } from 'react';
import { Tabs, type TabItem } from '../shared';
import GroupMembershipsList from './GroupMembershipsList';
import UserAppsList from './UserAppsList';
import UserProfilePane from './UserProfilePane';
import ProfileSaveModal from './ProfileSaveModal';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import type { AttributeDescriptor } from './profileAttributes';
import type { GroupMembership, OktaUser } from '../../../shared/types';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { UserAppAssignment } from '../../hooks/useOktaApi/userOperations';
import type { AppsByGroupId } from '../../hooks/useUserApps';
import type { UserDetailPane } from '../../hooks/useUserDetailPanes';
import type { UserProfileEditing } from '../../hooks/useUsersTabProfileEdit';

export interface UserDetailPanelProps {
  user: OktaUser;
  targetTabId?: number | null;
  oktaOrigin?: string | null;

  pane: UserDetailPane;
  onPaneChange: (pane: UserDetailPane) => void;

  memberships: GroupMembership[];
  isLoadingMemberships: boolean;
  currentGroupId?: string;
  recentlyAddedGroupId?: string | null;
  onProveMembershipSource?: (groupId: string) => Promise<MemberRuleAttribution>;

  apps: UserAppAssignment[];
  isLoadingApps: boolean;
  appsComplete: boolean;
  appsByGroupId: AppsByGroupId;
  appCount?: number;

  attributes: AttributeDescriptor[];
  isLoadingProfile: boolean;
  profileConfig: ProfileDisplayConfig;
  onProfileConfigChange: (patch: Partial<ProfileDisplayConfig>) => void;
  ruleReads: Record<string, string[]>;
  profileEdit?: UserProfileEditing;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  user,
  targetTabId,
  oktaOrigin,
  pane,
  onPaneChange,
  memberships,
  isLoadingMemberships,
  currentGroupId,
  recentlyAddedGroupId,
  onProveMembershipSource,
  apps,
  isLoadingApps,
  appsComplete,
  appsByGroupId,
  appCount,
  attributes,
  isLoadingProfile,
  profileConfig,
  onProfileConfigChange,
  ruleReads,
  profileEdit,
}) => {
  const [isCustomizingDisplay, setIsCustomizingDisplay] = useState(false);

  const tabs: TabItem[] = [
    {
      key: 'groups',
      label: 'Groups',
      count: isLoadingMemberships ? undefined : memberships.length,
    },
    { key: 'apps', label: 'Apps', count: appCount },
    { key: 'profile', label: 'Profile', count: attributes.length || undefined },
  ];

  return (
    <div className="animate-rise-in">
      <Tabs
        tabs={tabs}
        activeKey={pane}
        onChange={(key) => onPaneChange(key as UserDetailPane)}
        ariaLabel="User detail sections"
      />

      <div className="mt-(--sp-rung) overflow-hidden rounded-md border border-neutral-200 bg-white">
        <div
          role="tabpanel"
          aria-label="Groups"
          hidden={pane !== 'groups'}
          className={pane === 'groups' ? '' : 'hidden'}
        >
          <GroupMembershipsList
            memberships={memberships}
            user={user}
            targetTabId={targetTabId}
            isActive={pane === 'groups'}
            isLoading={isLoadingMemberships}
            currentGroupId={currentGroupId}
            oktaOrigin={oktaOrigin}
            recentlyAddedGroupId={recentlyAddedGroupId}
            appsByGroupId={appsByGroupId}
            onProveMembershipSource={onProveMembershipSource}
          />
        </div>

        <div
          role="tabpanel"
          aria-label="Apps"
          hidden={pane !== 'apps'}
          className={pane === 'apps' ? 'p-(--sp-card)' : 'hidden'}
        >
          <UserAppsList
            apps={apps}
            memberships={memberships}
            isLoading={isLoadingApps}
            complete={appsComplete}
            oktaOrigin={oktaOrigin}
          />
        </div>

        <div
          role="tabpanel"
          aria-label="Profile"
          hidden={pane !== 'profile'}
          className={pane === 'profile' ? undefined : 'hidden'}
        >
          <UserProfilePane
            attributes={attributes}
            config={profileConfig}
            ruleReads={ruleReads}
            isLoading={isLoadingProfile}
            customize={{
              isCustomizing: isCustomizingDisplay,
              onBegin: () => setIsCustomizingDisplay(true),
              onCommit: (next) => {
                onProfileConfigChange(next);
                setIsCustomizingDisplay(false);
              },
              onCancel: () => setIsCustomizingDisplay(false),
            }}
            edit={profileEdit?.controls}
            cells={profileEdit?.cells}
          />
        </div>
      </div>

      {profileEdit && <ProfileSaveModal {...profileEdit.save} userName={userDisplayName(user)} />}
    </div>
  );
};

export default UserDetailPanel;
