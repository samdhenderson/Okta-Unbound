import React, { useState } from 'react';
import GroupOverviewPane from './GroupOverviewPane';
import GroupMembershipSourceSection from './GroupMembershipSourceSection';
import GroupMembersSection from './GroupMembersSection';
import GroupAccessSection from './GroupAccessSection';
import GroupRulesSection from './GroupRulesSection';
import GroupPushSection from './GroupPushSection';
import GroupHealthPane from './GroupHealthPane';
import GroupActionBar from './GroupActionBar';
import AddGroupMemberModal from './AddGroupMemberModal';
import { Tabs, type TabItem } from '../../shared';
import { useGroupSource } from '../../../hooks/useGroupSource';
import { useOwedLoad } from '../../../hooks/useOwedLoad';
import { useGroupRuleReferences } from '../../../hooks/useGroupRuleReferences';
import { useGroupAccessGrants } from '../../../hooks/useGroupAccessGrants';
import { useMemberMfaScan } from '../../../hooks/useMemberMfaScan';
import { useGroupMembersSection } from './useGroupMembersSection';
import { useAddGroupMember } from '../../../hooks/useAddGroupMember';
import { OKTA_PAGE_SIZE } from '../../../../shared/utils/oktaPagination';
import type { GroupSummary } from '../../../../shared/types';

type GroupDetailTab = 'overview' | 'members' | 'access' | 'rules' | 'health';

const AUTO_LOAD_MEMBER_CAP = OKTA_PAGE_SIZE * 5;

const GROUP_DETAIL_TABS: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'members', label: 'Members' },
  { key: 'access', label: 'Access' },
  { key: 'rules', label: 'Rules' },
  { key: 'health', label: 'Health' },
];

interface GroupDetailViewProps {
  group: GroupSummary;
  targetTabId: number | null;
  onNavigateToRule?: (ruleId: string) => void;
  autoAnalyze?: boolean;
  isActive?: boolean;
  onExportGroup?: (groupId: string, groupName: string) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  group,
  targetTabId,
  onNavigateToRule,
  autoAnalyze = false,
  isActive = true,
  onExportGroup,
}) => {
  const [activeTab, setActiveTab] = useState<GroupDetailTab>(autoAnalyze ? 'members' : 'overview');

  const source = useGroupSource(targetTabId ?? undefined);
  const references = useGroupRuleReferences(group.id, targetTabId ?? undefined, isActive);
  const accessGrants = useGroupAccessGrants(group.id, targetTabId ?? undefined, isActive);
  const membersSection = useGroupMembersSection(
    group,
    targetTabId,
    source.memberStatus,
    source.resummarize,
  );

  const mfaScan = useMemberMfaScan({
    groupId: group.id,
    members: membersSection.members ?? [],
    targetTabId: targetTabId ?? undefined,
  });

  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const addMember = useAddGroupMember({
    targetTabId,
    group,
    members: membersSection.members,
    onResult: (result) => setAddMemberError(result.text),
    onAdded: membersSection.onMemberAdded,
    enabled: isActive,
  });
  const openAddMemberModal = (): void => {
    setAddMemberError(null);
    addMember.openModal();
  };
  const closeAddMemberModal = (): void => {
    setAddMemberError(null);
    addMember.closeModal();
  };

  const { open, analyzeMembers } = source;
  useOwedLoad(group.id, isActive, () => {
    open(group);
  });

  const openedGroupId = source.group?.id;
  const withinAutoLoadBudget = group.memberCount <= AUTO_LOAD_MEMBER_CAP;
  useOwedLoad(group.id, (autoAnalyze || withinAutoLoadBudget) && openedGroupId === group.id, () => {
    analyzeMembers();
  });

  return (
    <>
      <div className="space-y-6" data-testid="group-detail-view">
        <GroupActionBar
          group={group}
          targetTabId={targetTabId}
          onExportGroup={onExportGroup}
          onAddMember={openAddMemberModal}
        />

        <div>
          <Tabs
            tabs={GROUP_DETAIL_TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as GroupDetailTab)}
            variant="underline"
            ariaLabel="Group detail sections"
          />

          <div className="mt-6">
            {activeTab === 'overview' && (
              <GroupOverviewPane
                group={group}
                breakdown={source.breakdown}
                memberStatus={source.memberStatus}
                feedingRulesCount={source.feedingRules.length}
                rulesStatus={source.rulesStatus}
                appsCount={accessGrants.apps.length}
                appsStatus={accessGrants.appsStatus}
                rolesCount={accessGrants.roles.length}
                rolesStatus={accessGrants.rolesStatus}
                referencingRulesCount={references.rules.length}
                referencingStatus={references.status}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'members' && (
              <div className="space-y-6" role="tabpanel" aria-label="Members">
                <GroupMembershipSourceSection
                  memberCount={group.memberCount}
                  breakdown={source.breakdown}
                  status={source.memberStatus}
                  error={source.error}
                  onAnalyze={source.analyzeMembers}
                  canAnalyze={targetTabId !== null}
                  onNavigateToRule={onNavigateToRule}
                />

                <GroupMembersSection
                  groupType={group.type}
                  memberCount={group.memberCount}
                  members={membersSection.members}
                  status={source.memberStatus}
                  error={source.error}
                  onAnalyze={source.analyzeMembers}
                  canAnalyze={targetTabId !== null}
                  removeTarget={membersSection.removeTarget}
                  onRequestRemove={membersSection.requestRemove}
                  onCancelRemove={membersSection.cancelRemove}
                  onConfirmRemove={membersSection.confirmRemove}
                  removeStatus={membersSection.removeStatus}
                  removeError={membersSection.removeError}
                />
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-6" role="tabpanel" aria-label="Access">
                <GroupAccessSection
                  apps={accessGrants.apps}
                  appsStatus={accessGrants.appsStatus}
                  appsError={accessGrants.appsError}
                  roles={accessGrants.roles}
                  rolesStatus={accessGrants.rolesStatus}
                />

                <GroupPushSection mappings={group.pushMappings} />
              </div>
            )}

            {activeTab === 'rules' && (
              <div role="tabpanel" aria-label="Rules">
                <GroupRulesSection
                  assigningRules={source.feedingRules}
                  assigningStatus={source.rulesStatus}
                  assigningError={source.error}
                  referencingRules={references.rules}
                  referencingStatus={references.status}
                  referencingError={references.error}
                  onNavigateToRule={onNavigateToRule}
                />
              </div>
            )}

            {activeTab === 'health' && (
              <div role="tabpanel" aria-label="Health">
                <GroupHealthPane
                  groupId={group.id}
                  memberCount={group.memberCount}
                  members={membersSection.members}
                  memberStatus={source.memberStatus}
                  error={source.error}
                  onAnalyzeMembers={source.analyzeMembers}
                  canAnalyze={targetTabId !== null}
                  feedingRules={source.feedingRules}
                  onNavigateToRule={onNavigateToRule}
                  mfaResults={mfaScan.mfaResults}
                  scanStatus={mfaScan.scanStatus}
                  onRunScan={mfaScan.runScan}
                  onRequestConfirm={mfaScan.requestConfirm}
                  onCancelConfirm={mfaScan.cancelConfirm}
                  description={group.description}
                  created={group.created}
                  lastUpdated={group.lastUpdated}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddGroupMemberModal
        isOpen={addMember.isOpen}
        groupName={group.name}
        addQuery={addMember.addQuery}
        onAddQueryChange={addMember.setAddQuery}
        addResults={addMember.addResults}
        isSearchingToAdd={addMember.isSearchingToAdd}
        addSearchError={addMember.addSearchError}
        selectedUser={addMember.selectedUser}
        onSelectUser={addMember.selectUser}
        onClearSelectedUser={addMember.clearSelectedUser}
        isAddingMember={addMember.isAddingMember}
        onClose={closeAddMemberModal}
        onConfirm={addMember.confirmAddMember}
        addMemberError={addMemberError}
      />
    </>
  );
};

export default GroupDetailView;
