import React, { useCallback, useMemo, useState } from 'react';
import GroupOverviewPane from './GroupOverviewPane';
import GroupMembersSection from './GroupMembersSection';
import GroupAccessSection from './GroupAccessSection';
import GroupRulesSection from './GroupRulesSection';
import GroupPushSection from './GroupPushSection';
import GroupInsightsPane from './GroupInsightsPane';
import GroupActionBar from './GroupActionBar';
import AddGroupMemberModal from './AddGroupMemberModal';
import CompareGroupModal from './CompareGroupModal';
import CreateFeedingRuleModal from './CreateFeedingRuleModal';
import GroupComparisonModal from '../GroupComparisonModal';
import { Tabs, type TabItem } from '../../shared';
import { useGroupSource } from '../../../hooks/useGroupSource';
import { useOktaApi } from '../../../hooks/useOktaApi';
import { useOwedLoad } from '../../../hooks/useOwedLoad';
import { useGroupRuleReferences } from '../../../hooks/useGroupRuleReferences';
import { useGroupAccessGrants } from '../../../hooks/useGroupAccessGrants';
import { useGroupComparison } from '../../../hooks/useGroupComparison';
import { useMemberMfaScan } from '../../../hooks/useMemberMfaScan';
import { useGroupMembersSection } from './useGroupMembersSection';
import { useRemoveDeprovisioned } from './useRemoveDeprovisioned';
import { useAddGroupMember } from '../../../hooks/useAddGroupMember';
import { useCreateFeedingRule } from '../../../hooks/useCreateFeedingRule';
import { useWorkingSetEntry } from '../../../hooks/useWorkingSetEntry';
import { invalidate } from '../../../cache/entityCache';
import { cacheKeys } from '../../../cache/keys';
import { OKTA_PAGE_SIZE } from '../../../../shared/utils/oktaPagination';
import type { GroupSummary } from '../../../../shared/types';

export type GroupDetailTab = 'overview' | 'members' | 'access' | 'rules' | 'insights';

const AUTO_LOAD_MEMBER_CAP = OKTA_PAGE_SIZE * 5;

const GROUP_DETAIL_TABS: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'members', label: 'Members' },
  { key: 'access', label: 'Access' },
  { key: 'rules', label: 'Rules' },
  { key: 'insights', label: 'Insights' },
];

interface GroupDetailViewProps {
  group: GroupSummary;
  targetTabId: number | null;
  oktaOrigin?: string | null;
  onNavigateToRule?: (ruleId: string) => void;
  initialPane?: GroupDetailTab;
  isActive?: boolean;
  onExportGroup?: (groupId: string, groupName: string) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  group,
  targetTabId,
  oktaOrigin,
  onNavigateToRule,
  initialPane,
  isActive = true,
  onExportGroup,
}) => {
  const [activeTab, setActiveTab] = useState<GroupDetailTab>(initialPane ?? 'overview');

  useWorkingSetEntry({
    origin: oktaOrigin,
    kind: 'group',
    id: group.id,
    name: group.name,
    pane: GROUP_DETAIL_TABS.find((tab) => tab.key === activeTab)?.label,
    enabled: isActive,
  });

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

  const deprovisionedCount = useMemo(
    () => membersSection.members?.filter((user) => user.status === 'DEPROVISIONED').length,
    [membersSection.members],
  );
  const onCleanupDone = useCallback(() => {
    invalidate(cacheKeys.mfaScan(group.id));
    source.analyzeMembers();
  }, [group.id, source]);
  const removeDeprovisioned = useRemoveDeprovisioned(group.id, targetTabId, onCleanupDone);

  const { getMembershipRuleProof, compareGroups } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });
  const proveMemberSource = useMemo(
    () =>
      targetTabId !== null
        ? (userId: string) => getMembershipRuleProof(group.id, userId)
        : undefined,
    [targetTabId, group.id, getMembershipRuleProof],
  );

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

  const onRuleCreated = isActive ? source.refreshRules : undefined;
  const createFeedingRule = useCreateFeedingRule({ targetTabId, group, onCreated: onRuleCreated });

  const comparison = useGroupComparison({ group, targetTabId, enabled: isActive });

  const { open, analyzeMembers } = source;
  useOwedLoad(group.id, isActive, () => {
    open(group);
  });

  const openedGroupId = source.group?.id;
  const withinAutoLoadBudget = group.memberCount <= AUTO_LOAD_MEMBER_CAP;
  const shouldAnalyze = initialPane === 'members' || withinAutoLoadBudget;
  useOwedLoad(group.id, shouldAnalyze && openedGroupId === group.id, () => {
    analyzeMembers();
  });

  return (
    <>
      <div className="space-y-(--sp-rung)" data-testid="group-detail-view">
        <GroupActionBar
          group={group}
          targetTabId={targetTabId}
          onExportGroup={onExportGroup}
          onAddMember={openAddMemberModal}
          onCompare={comparison.openPicker}
          deprovisionedCount={deprovisionedCount}
          onRemoveDeprovisioned={removeDeprovisioned.run}
          isRemoving={removeDeprovisioned.isRemoving}
          removeError={removeDeprovisioned.error}
          onCreateFeedingRule={createFeedingRule.open}
        />

        <div>
          <Tabs
            tabs={GROUP_DETAIL_TABS}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as GroupDetailTab)}
            variant="underline"
            ariaLabel="Group detail sections"
          />

          <div className="mt-(--sp-rung)">
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
              <div role="tabpanel" aria-label="Members">
                <GroupMembersSection
                  oktaOrigin={oktaOrigin}
                  groupType={group.type}
                  memberCount={group.memberCount}
                  members={membersSection.members}
                  status={source.memberStatus}
                  error={source.error}
                  onAnalyze={source.analyzeMembers}
                  canAnalyze={targetTabId !== null}
                  breakdown={source.breakdown}
                  memberSourceIndex={source.memberSourceIndex}
                  onNavigateToRule={onNavigateToRule}
                  onProveMemberSource={proveMemberSource}
                  mfaResults={mfaScan.mfaResults}
                  scanStatus={mfaScan.scanStatus}
                  onRunScan={mfaScan.runScan}
                  onRequestConfirm={mfaScan.requestConfirm}
                  onCancelConfirm={mfaScan.cancelConfirm}
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
              <div className="space-y-(--sp-rung)" role="tabpanel" aria-label="Access">
                <GroupAccessSection
                  oktaOrigin={oktaOrigin}
                  apps={accessGrants.apps}
                  appsStatus={accessGrants.appsStatus}
                  appsError={accessGrants.appsError}
                  roles={accessGrants.roles}
                  rolesStatus={accessGrants.rolesStatus}
                  pushMappings={group.pushMappings}
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

            {activeTab === 'insights' && (
              <div role="tabpanel" aria-label="Insights">
                <GroupInsightsPane
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
                  lastMembershipUpdated={group.lastMembershipUpdated}
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

      <CompareGroupModal
        isOpen={comparison.isPicking}
        group={group}
        query={comparison.query}
        onQueryChange={comparison.setQuery}
        results={comparison.results}
        isSearching={comparison.isSearching}
        searchError={comparison.searchError}
        selected={comparison.selected}
        onSelect={comparison.select}
        onClearSelected={comparison.clearSelected}
        canSearch={targetTabId !== null}
        onClose={comparison.closePicker}
        onConfirm={comparison.confirm}
      />

      <CreateFeedingRuleModal
        isOpen={createFeedingRule.isOpen}
        groupName={group.name}
        name={createFeedingRule.name}
        onNameChange={createFeedingRule.setName}
        nameError={createFeedingRule.nameError}
        expression={createFeedingRule.expression}
        onExpressionChange={createFeedingRule.setExpression}
        expressionNotice={createFeedingRule.expressionNotice}
        canSubmit={createFeedingRule.canSubmit}
        isCreating={createFeedingRule.isCreating}
        error={createFeedingRule.error}
        createdRuleName={createFeedingRule.createdRuleName}
        createdRuleId={createFeedingRule.createdRuleId}
        onClose={createFeedingRule.close}
        onConfirm={createFeedingRule.confirm}
        onNavigateToRule={onNavigateToRule}
      />

      <GroupComparisonModal
        isOpen={comparison.comparedWith !== null}
        onClose={comparison.closeComparison}
        groups={comparison.comparedWith ? [group, comparison.comparedWith] : []}
        compareGroups={compareGroups}
        memberCache={comparison.memberCache}
      />
    </>
  );
};

export default GroupDetailView;
