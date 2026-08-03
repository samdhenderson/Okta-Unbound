import React, { useEffect, useRef } from 'react';
import GroupIdentitySection from './GroupIdentitySection';
import GroupMembershipSourceSection from './GroupMembershipSourceSection';
import GroupRulesSection from './GroupRulesSection';
import GroupPushSection from './GroupPushSection';
import GroupMetadataSection from './GroupMetadataSection';
import { useGroupSource } from '../../../hooks/useGroupSource';
import { useGroupRuleReferences } from '../../../hooks/useGroupRuleReferences';
import type { GroupSummary } from '../../../../shared/types';

interface GroupDetailViewProps {
  group: GroupSummary;
  targetTabId: number | null;
  oktaOrigin?: string;
  onNavigateToRule?: (ruleId: string) => void;
  autoAnalyze?: boolean;
  isActive?: boolean;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  group,
  targetTabId,
  oktaOrigin,
  onNavigateToRule,
  autoAnalyze = false,
  isActive = true,
}) => {
  const source = useGroupSource(targetTabId ?? undefined);
  const references = useGroupRuleReferences(group.id, targetTabId ?? undefined, isActive);

  const { open, analyzeMembers } = source;
  const openOwedRef = useRef(true);
  useEffect(() => {
    openOwedRef.current = true;
  }, [open, group]);
  useEffect(() => {
    if (!isActive || !openOwedRef.current) return;
    openOwedRef.current = false;
    open(group);
  }, [isActive, open, group]);

  const autoAnalyzedRef = useRef<string | null>(null);
  const openedGroupId = source.group?.id;
  useEffect(() => {
    if (!autoAnalyze || openedGroupId !== group.id) return;
    if (autoAnalyzedRef.current === group.id) return;
    autoAnalyzedRef.current = group.id;
    analyzeMembers();
  }, [autoAnalyze, openedGroupId, group.id, analyzeMembers]);

  return (
    <div className="space-y-3" data-testid="group-detail-view">
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
