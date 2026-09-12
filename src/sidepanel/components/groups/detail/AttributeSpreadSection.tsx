import React, { useId, useMemo } from 'react';
import { AlertMessage, Button, DetailSection, Eyebrow, LoadingSpinner } from '../../shared';
import AttributeHealthCard from './AttributeHealthCard';
import {
  discoverAttributeBreakdowns,
  rankAttributes,
  type BreakdownRow,
  type RankedAttribute,
} from '../../members/memberAnalytics';
import {
  indexRulesByAttribute,
  type AttributeReferencingRule,
} from '../../../../shared/rules/groupAttributeIndex';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import type { OktaUser } from '../../../../shared/types';

export interface AttributeSpreadSectionProps {
  memberCount: number;
  members: OktaUser[] | null;
  memberStatus: SourceStatus;
  error: string | null;
  onAnalyzeMembers: () => void;
  canAnalyze?: boolean;
  feedingRules: readonly AttributeReferencingRule[];
  onNavigateToRule?: (ruleId: string) => void;
  onShowAll: (attributeKey: string) => void;
  onSelectValue?: (attributeKey: string, row: BreakdownRow) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const AttributeSpreadSection: React.FC<AttributeSpreadSectionProps> = ({
  memberCount,
  members,
  memberStatus,
  error,
  onAnalyzeMembers,
  canAnalyze = true,
  feedingRules,
  onNavigateToRule,
  onShowAll,
  onSelectValue,
  collapsible = false,
  defaultOpen = true,
}) => {
  const quietLabelId = useId();

  const summaries = useMemo(() => (members ? discoverAttributeBreakdowns(members) : []), [members]);
  const ruleIndex = useMemo(() => indexRulesByAttribute(feedingRules), [feedingRules]);

  const ranked = useMemo(
    () => rankAttributes(summaries, (key) => (ruleIndex.get(key) ?? []).length),
    [summaries, ruleIndex],
  );
  const flagged = ranked.filter((entry) => entry.flagged);
  const quiet = ranked.filter((entry) => !entry.flagged);

  const renderCards = (entries: RankedAttribute[]) => (
    <div className="grid grid-cols-1 gap-(--sp-rung) sm:grid-cols-2">
      {entries.map(({ summary, signals }) => (
        <AttributeHealthCard
          key={summary.key}
          summary={summary}
          signals={signals}
          rules={ruleIndex.get(summary.key) ?? []}
          onNavigateToRule={onNavigateToRule}
          onShowOther={() => onShowAll(summary.key)}
          onSelectValue={onSelectValue ? (row) => onSelectValue(summary.key, row) : undefined}
        />
      ))}
    </div>
  );

  const summary =
    memberCount === 0
      ? 'No members to profile.'
      : memberStatus === 'idle'
        ? 'Not analyzed yet.'
        : memberStatus === 'loading'
          ? 'Analyzing members…'
          : memberStatus === 'error'
            ? 'Analysis failed.'
            : ranked.length === 0
              ? 'No attribute here has a meaningful spread.'
              : `${ranked.length.toLocaleString()} attribute${ranked.length === 1 ? '' : 's'} · ${
                  flagged.length === 0 ? 'nothing flagged' : `${flagged.length} flagged`
                }`;

  return (
    <DetailSection
      title="Attribute spread"
      description="How each profile attribute is populated across this group's members. Flagged first: drift, a hidden long tail, or a rule that depends on it."
      collapsible={collapsible}
      defaultOpen={defaultOpen}
      itemCount={ranked.length > 0 ? ranked.length : undefined}
      summary={<p className="text-sm text-neutral-600">{summary}</p>}
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
      ) : ranked.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No profile attribute in this group has a meaningful spread — every one is either blank or
          unique per member.
        </p>
      ) : (
        <div className="space-y-(--sp-rung)">
          {flagged.length > 0 && renderCards(flagged)}

          {quiet.length > 0 && flagged.length > 0 && (
            <div role="group" aria-labelledby={quietLabelId} className="space-y-(--sp-rung) pt-1">
              <div className="flex items-center gap-(--sp-inline)">
                <Eyebrow id={quietLabelId}>Nothing flagged</Eyebrow>
                <span aria-hidden="true" className="h-px flex-1 bg-neutral-200" />
              </div>
              {renderCards(quiet)}
            </div>
          )}
          {quiet.length > 0 && flagged.length === 0 && renderCards(quiet)}
        </div>
      )}
    </DetailSection>
  );
};

export default AttributeSpreadSection;
