import React from 'react';
import GroupIdentitySection from './GroupIdentitySection';
import GroupMembershipSourceSection from './GroupMembershipSourceSection';
import GroupMembersSection from './GroupMembersSection';
import GroupAccessSection from './GroupAccessSection';
import GroupRulesSection from './GroupRulesSection';
import GroupPushSection from './GroupPushSection';
import GroupMetadataSection from './GroupMetadataSection';
import { useGroupSource } from '../../../hooks/useGroupSource';
import { useOwedLoad } from '../../../hooks/useOwedLoad';
import { useGroupRuleReferences } from '../../../hooks/useGroupRuleReferences';
import { useGroupAccessGrants } from '../../../hooks/useGroupAccessGrants';
import { useGroupMembersSection } from './useGroupMembersSection';
import { ActionBar, Button } from '../../shared';
import type { GroupSummary } from '../../../../shared/types';

interface GroupDetailViewProps {
  group: GroupSummary;
  targetTabId: number | null;
  oktaOrigin?: string;
  onNavigateToRule?: (ruleId: string) => void;
  autoAnalyze?: boolean;
  isActive?: boolean;
  onExportGroup?: (groupId: string, groupName: string) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  group,
  targetTabId,
  oktaOrigin,
  onNavigateToRule,
  autoAnalyze = false,
  isActive = true,
  onExportGroup,
}) => {
  const source = useGroupSource(targetTabId ?? undefined);
  const references = useGroupRuleReferences(group.id, targetTabId ?? undefined, isActive);
  const accessGrants = useGroupAccessGrants(group.id, targetTabId ?? undefined, isActive);
  const membersSection = useGroupMembersSection(
    group,
    targetTabId,
    source.memberStatus,
    source.resummarize,
  );

  const { open, analyzeMembers } = source;
  useOwedLoad(group.id, isActive, () => {
    open(group);
  });

  const openedGroupId = source.group?.id;
  useOwedLoad(group.id, autoAnalyze && openedGroupId === group.id, () => {
    analyzeMembers();
  });

  return (
    <div className="space-y-3" data-testid="group-detail-view">
      <ActionBar ariaLabel={`Actions for ${group.name}`}>
        <Button
          variant="primary"
          size="sm"
          icon="download"
          onClick={() => onExportGroup?.(group.id, group.name)}
          disabled={!onExportGroup}
          title="Export this group's members (opens the Export tab with column picker + presets)"
        >
          Export members
        </Button>
      </ActionBar>

      <GroupIdentitySection group={group} oktaOrigin={oktaOrigin} />

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
        addQuery={membersSection.addQuery}
        onAddQueryChange={membersSection.setAddQuery}
        addResults={membersSection.addResults}
        isSearchingToAdd={membersSection.isSearchingToAdd}
        addSearchError={membersSection.addSearchError}
        onSelectToAdd={membersSection.selectToAdd}
        addStatus={membersSection.addStatus}
        addError={membersSection.addError}
      />

      <GroupAccessSection
        apps={accessGrants.apps}
        appsStatus={accessGrants.appsStatus}
        appsError={accessGrants.appsError}
        roles={accessGrants.roles}
        rolesStatus={accessGrants.rolesStatus}
      />

      <GroupRulesSection
        assigningRules={source.feedingRules}
        assigningStatus={source.rulesStatus}
        assigningError={source.error}
        referencingRules={references.rules}
        referencingStatus={references.status}
        referencingError={references.error}
        onNavigateToRule={onNavigateToRule}
      />

      <GroupPushSection mappings={group.pushMappings} />

      <GroupMetadataSection
        groupId={group.id}
        created={group.created}
        lastUpdated={group.lastUpdated}
      />
    </div>
  );
};

export default GroupDetailView;
