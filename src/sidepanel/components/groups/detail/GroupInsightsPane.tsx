import React, { useCallback, useMemo, useState } from 'react';
import { Button, CollapsibleSection, DetailSection } from '../../shared';
import GroupMetadataSection from './GroupMetadataSection';
import AttributeSpreadSection from './AttributeSpreadSection';
import GroupMfaCoverageSection from './GroupMfaCoverageSection';
import BreakdownDetailsModal from '../../members/BreakdownDetailsModal';
import CompositionReports from '../../members/CompositionReports';
import { mfaScanNeedsConfirm } from '../../../hooks/useMemberMfaScan';
import {
  computeDimensionBreakdown,
  computeMfaBreakdown,
  dimensionTitle,
  discoverAttributeBreakdowns,
  type MemberFilter,
} from '../../members/memberAnalytics';
import type { AttributeReferencingRule } from '../../../../shared/rules/groupAttributeIndex';
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
  onFilterMembers?: (filter: MemberFilter) => void;

  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;

  description?: string;
  created?: Date;
  lastUpdated?: Date;
  lastMembershipUpdated?: Date;
}

const EMPTY_ACTIVE_VALUES: Set<string> = new Set();

const NO_ACTIVE_FILTERS: MemberFilter[] = [];

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
  onFilterMembers,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
  description,
  created,
  lastUpdated,
  lastMembershipUpdated,
}) => {
  const rosterReady = memberStatus === 'done' && members !== null;

  const [detailKey, setDetailKey] = useState<string | null>(null);
  const detailRows = useMemo(
    () => (detailKey && members ? computeDimensionBreakdown(members, detailKey) : []),
    [detailKey, members],
  );

  const attributes = useMemo(
    () => (members ? discoverAttributeBreakdowns(members) : []),
    [members],
  );
  const mfaRows = useMemo(
    () => computeMfaBreakdown(members ?? [], mfaResults),
    [members, mfaResults],
  );

  const jumpToMembers = useCallback(
    (dimension: string, value: string, label: string) => {
      onFilterMembers?.({ dimension, value, label });
    },
    [onFilterMembers],
  );

  const handleScanClick = useCallback(() => {
    if (mfaScanNeedsConfirm(memberCount)) onRequestConfirm();
    else onRunScan();
  }, [memberCount, onRequestConfirm, onRunScan]);

  return (
    <div className="space-y-(--sp-rung)">
      <AttributeSpreadSection
        memberCount={memberCount}
        members={members}
        memberStatus={memberStatus}
        error={error}
        onAnalyzeMembers={onAnalyzeMembers}
        canAnalyze={canAnalyze}
        feedingRules={feedingRules}
        onNavigateToRule={onNavigateToRule}
        onShowAll={setDetailKey}
      />

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

      {rosterReady && onFilterMembers && (
        <CompositionReports
          attributes={attributes}
          filters={NO_ACTIVE_FILTERS}
          onToggle={(dimension, row) =>
            jumpToMembers(dimension, row.value, `${dimensionTitle(dimension)}: ${row.label}`)
          }
          onExpand={setDetailKey}
          mfaRows={mfaRows}
          mfaResults={mfaResults}
          scanStatus={scanStatus}
          memberCount={memberCount}
          onToggleMfa={(row) => jumpToMembers('mfa', row.value, row.label)}
          onRunScanClick={handleScanClick}
        />
      )}

      <BreakdownDetailsModal
        isOpen={detailKey !== null}
        onClose={() => setDetailKey(null)}
        title={detailKey ? dimensionTitle(detailKey) : ''}
        rows={detailRows}
        activeValues={EMPTY_ACTIVE_VALUES}
        rowIntent="navigate"
        onRowClick={
          onFilterMembers && detailKey
            ? (row) => {
                onFilterMembers({
                  dimension: detailKey,
                  value: row.value,
                  label: `${dimensionTitle(detailKey)}: ${row.label}`,
                });
                setDetailKey(null);
              }
            : undefined
        }
      />

      <CollapsibleSection title="About this group" defaultOpen={false}>
        <GroupMetadataSection
          groupId={groupId}
          description={description}
          created={created}
          lastUpdated={lastUpdated}
          lastMembershipUpdated={lastMembershipUpdated}
        />
      </CollapsibleSection>
    </div>
  );
};

export default GroupInsightsPane;
