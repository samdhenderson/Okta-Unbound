import React, { useMemo } from 'react';
import {
  AlertMessage,
  Button,
  CollapsibleSection,
  DetailSection,
  LoadingSpinner,
} from '../../shared';
import GroupMetadataSection from './GroupMetadataSection';
import AttributeHealthCard from './AttributeHealthCard';
import GroupMfaCoverageSection from './GroupMfaCoverageSection';
import { discoverAttributeBreakdowns, type AttributeSummary } from '../../members/memberAnalytics';
import {
  indexRulesByAttribute,
  type AttributeReferencingRule,
  type AttributeRuleRef,
} from '../../../../shared/rules/groupAttributeIndex';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../../shared/types';

interface GroupInsightsPaneProps {
  groupId: string;
  memberCount: number;
  members: OktaUser[] | null;
  memberStatus: SourceStatus;
  error: string | null;
  onAnalyzeMembers: () => void;
  canAnalyze?: boolean;
  feedingRules: readonly AttributeReferencingRule[];
  onNavigateToRule?: (ruleId: string) => void;

  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;

  description?: string;
  created?: Date;
  lastUpdated?: Date;
}

const GroupInsightsPane: React.FC<GroupInsightsPaneProps> = ({
  groupId,
  memberCount,
  members,
  memberStatus,
  error,
  onAnalyzeMembers,
  canAnalyze = true,
  feedingRules,
  onNavigateToRule,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
  description,
  created,
  lastUpdated,
}) => {
  const rosterReady = memberStatus === 'done' && members !== null;

  const summaries = useMemo(() => (members ? discoverAttributeBreakdowns(members) : []), [members]);
  const ruleIndex = useMemo(() => indexRulesByAttribute(feedingRules), [feedingRules]);

  const cards = useMemo(() => {
    const withRules: Array<{ summary: AttributeSummary; rules: AttributeRuleRef[] }> = [];
    const withoutRules: Array<{ summary: AttributeSummary; rules: AttributeRuleRef[] }> = [];
    for (const summary of summaries) {
      const rules = ruleIndex.get(summary.key) ?? [];
      (rules.length > 0 ? withRules : withoutRules).push({ summary, rules });
    }
    return [...withRules, ...withoutRules];
  }, [summaries, ruleIndex]);

  return (
    <div className="space-y-(--sp-rung)">
      <DetailSection
        title="Attribute spread"
        description="Blank rate and value spread for every profile attribute across this group's members. The ones a feeding rule depends on come first."
        actions={
          memberStatus === 'idle' && memberCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              icon="chart"
              onClick={onAnalyzeMembers}
              disabled={!canAnalyze}
            >
              Analyze
            </Button>
          ) : undefined
        }
      >
        {memberCount === 0 ? (
          <p className="text-sm text-neutral-500">
            This group has no members, so there is nothing to profile.
          </p>
        ) : memberStatus === 'idle' ? (
          <p className="text-sm text-neutral-500">
            Not analyzed yet. Reads all {memberCount.toLocaleString()} member
            {memberCount === 1 ? '' : 's'} once to compute every profile attribute&apos;s blank rate
            and value spread.
          </p>
        ) : memberStatus === 'loading' ? (
          <LoadingSpinner size="sm" message="Analyzing members…" centered />
        ) : memberStatus === 'error' ? (
          <AlertMessage
            message={{ text: error || 'Failed to analyze members.', type: 'danger' }}
            action={{ label: 'Retry', onClick: onAnalyzeMembers }}
          />
        ) : cards.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No profile attribute in this group has a meaningful spread — every one is either blank
            or unique per member.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-(--sp-rung) sm:grid-cols-2">
            {cards.map(({ summary, rules }) => (
              <AttributeHealthCard
                key={summary.key}
                summary={summary}
                rules={rules}
                onNavigateToRule={onNavigateToRule}
              />
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection
        title="MFA coverage"
        description="Opt-in scan of each member's enrolled MFA factors. Never runs automatically."
      >
        {!rosterReady ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">
              Load members first — the scan needs the same roster as the cards above.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon="chart"
              onClick={onAnalyzeMembers}
              disabled={!canAnalyze || memberCount === 0}
            >
              Load members
            </Button>
          </div>
        ) : (
          <GroupMfaCoverageSection
            members={members}
            mfaResults={mfaResults}
            scanStatus={scanStatus}
            onRunScan={onRunScan}
            onRequestConfirm={onRequestConfirm}
            onCancelConfirm={onCancelConfirm}
          />
        )}
      </DetailSection>

      <CollapsibleSection title="About this group" defaultOpen={false}>
        <GroupMetadataSection
          groupId={groupId}
          description={description}
          created={created}
          lastUpdated={lastUpdated}
        />
      </CollapsibleSection>
    </div>
  );
};

export default GroupInsightsPane;
