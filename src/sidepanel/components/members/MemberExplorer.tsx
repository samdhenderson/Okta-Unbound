import React, { useCallback, useId, useMemo, useState } from 'react';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../shared/types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { mfaScanNeedsConfirm } from '../../hooks/useMemberMfaScan';
import Button from '../shared/Button';
import FilterToggle from '../shared/FilterToggle';
import Modal from '../shared/Modal';
import MemberSearchBar from './MemberSearchBar';
import MemberFilterDrawer from './MemberFilterDrawer';
import ActiveFilterChips from './ActiveFilterChips';
import CopyMembersModal from './CopyMembersModal';
import BreakdownDetailsModal from './BreakdownDetailsModal';
import MemberList from './MemberList';
import { useMembershipProofs } from '../users/GroupMembershipsListProof';
import { useMemberFilters } from '../../hooks/useMemberFilters';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership } from '../../../shared/types';
import type { MemberSourceContext } from './memberSourceContext';
import {
  type MemberFilter,
  type SortField,
  computeDimensionBreakdown,
  discoverAttributeBreakdowns,
  filterMembers,
  sortMembers,
  getObservedFactorLabels,
  dimensionTitle,
} from './memberAnalytics';

interface MemberExplorerProps {
  members: OktaUser[];
  isReloading?: boolean;
  mfaResults: Map<string, MemberMfaResult> | null;
  scanStatus: MfaScanStatus;
  onRunScan: () => void;
  onRequestConfirm: () => void;
  onCancelConfirm: () => void;
  oktaOrigin?: string | null;
  memberSource?: MemberSourceContext;
  sourceDetail?: React.ReactNode;
  onRemoveMember?: (user: OktaUser) => void;
  onProveMemberSource?: (
    membership: GroupMembership,
    userId: string,
  ) => Promise<MemberRuleAttribution>;
  onOpenInsights?: () => void;
  pendingFilter?: MemberFilter | null;
}

const PAGE = 50;

const MemberExplorer: React.FC<MemberExplorerProps> = ({
  members,
  isReloading = false,
  mfaResults,
  scanStatus,
  onRunScan,
  onRequestConfirm,
  onCancelConfirm,
  oktaOrigin,
  memberSource,
  sourceDetail,
  onRemoveMember,
  onProveMemberSource,
  onOpenInsights,
  pendingFilter,
}) => {
  const drawerId = useId();
  const [query, setQuery] = useState('');
  const memberFilters = useMemberFilters({ pendingFilter });
  const { filters } = memberFilters;
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 200);

  const attributes = useMemo(() => discoverAttributeBreakdowns(members), [members]);
  const statusRows = useMemo(() => computeDimensionBreakdown(members, 'status'), [members]);
  const factorLabels = useMemo(() => getObservedFactorLabels(mfaResults), [mfaResults]);

  const sourceBuckets = useMemo(() => {
    if (!memberSource) return null;
    const named = new Set(memberSource.segments.map((segment) => segment.key));
    const merged = new Map<string, ReadonlySet<string>>(memberSource.index.userIdsByBucket);
    const tail = new Set<string>();
    for (const [key, userIds] of memberSource.index.userIdsByBucket) {
      if (key.startsWith('rule:') && !named.has(key)) {
        for (const userId of userIds) tail.add(userId);
      }
    }
    if (tail.size > 0) merged.set('otherRules', tail);
    return merged;
  }, [memberSource]);

  const proofs = useMembershipProofs(onProveMemberSource);

  const filtered = useMemo(
    () => filterMembers(members, debouncedQuery, filters, mfaResults, sourceBuckets),
    [members, debouncedQuery, filters, mfaResults, sourceBuckets],
  );
  const sorted = useMemo(
    () => sortMembers(filtered, sortBy, sortDesc, mfaResults),
    [filtered, sortBy, sortDesc, mfaResults],
  );

  const resetKey = `${debouncedQuery}__${memberFilters.key}__${members.length}__${sortBy}__${sortDesc}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setVisibleCount(PAGE);
  }

  const toggleSort = useCallback((field: SortField) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortDesc((d) => !d);
        return prevField;
      }
      setSortDesc(false);
      return field;
    });
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE, sorted.length));
  }, [sorted.length]);

  const handleScanClick = useCallback(() => {
    if (mfaScanNeedsConfirm(members.length)) onRequestConfirm();
    else onRunScan();
  }, [members.length, onRequestConfirm, onRunScan]);

  const mfaScanned = mfaResults !== null && scanStatus === 'complete';

  const detailRows = useMemo(
    () => (detailKey ? computeDimensionBreakdown(members, detailKey) : []),
    [detailKey, members],
  );
  const detailActiveValues = memberFilters.valuesFor(detailKey);

  const filteredDimensions = useMemo(
    () => new Set(filters.map((filter) => filter.dimension)),
    [filters],
  );

  return (
    <div className="space-y-(--sp-rung)">
      <div className="space-y-(--sp-field)">
        <div className="flex gap-(--sp-field)">
          <div className="flex-1">
            <MemberSearchBar value={query} onChange={setQuery} />
          </div>
          <FilterToggle
            open={drawerOpen}
            activeCount={memberFilters.activeCount}
            onToggle={() => setDrawerOpen((prev) => !prev)}
            controls={drawerId}
          />
        </div>

        <ActiveFilterChips
          filters={filters}
          onRemove={memberFilters.remove}
          onClearAll={memberFilters.clearAll}
        />

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">
            Members
            <span className="ml-2 text-xs font-normal tabular-nums text-neutral-500">
              {sorted.length.toLocaleString()} of {members.length.toLocaleString()}
            </span>
          </h3>
          <Button
            variant="secondary"
            size="sm"
            icon="clipboard"
            onClick={() => setCopyOpen(true)}
            disabled={sorted.length === 0}
            title="Copy the listed members as names or emails"
          >
            Copy members
          </Button>
        </div>
      </div>

      <MemberFilterDrawer
        id={drawerId}
        open={drawerOpen}
        memberFilters={memberFilters}
        memberSource={memberSource}
        sourceDetail={sourceDetail}
        statusRows={statusRows}
        mfaResults={mfaResults}
        factorLabels={factorLabels}
        memberCount={members.length}
        scanStatus={scanStatus}
        onRunScanClick={handleScanClick}
        sortBy={sortBy}
        sortDesc={sortDesc}
        onToggleSort={toggleSort}
        attributes={attributes}
        filteredDimensions={filteredDimensions}
        onSelectAttribute={setDetailKey}
        onOpenInsights={onOpenInsights}
      />

      <MemberList
        members={sorted}
        loading={isReloading}
        mfaResults={mfaResults}
        mfaScanned={mfaScanned}
        visibleCount={visibleCount}
        onLoadMore={loadMore}
        oktaOrigin={oktaOrigin}
        onRemoveMember={onRemoveMember}
        memberSourceIndex={memberSource?.index}
        proofs={proofs}
      />

      <BreakdownDetailsModal
        isOpen={detailKey !== null}
        onClose={() => setDetailKey(null)}
        title={detailKey ? dimensionTitle(detailKey) : ''}
        rows={detailRows}
        activeValues={detailActiveValues}
        onRowClick={(row) => detailKey && memberFilters.toggleRow(detailKey, row)}
      />

      <CopyMembersModal isOpen={copyOpen} onClose={() => setCopyOpen(false)} members={sorted} />

      <Modal
        isOpen={scanStatus === 'confirming'}
        onClose={onCancelConfirm}
        title="Run MFA scan?"
        footer={
          <>
            <Button variant="secondary" onClick={onCancelConfirm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onRunScan}>
              Scan anyway
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-600">
          This group has <strong>{members.length.toLocaleString()}</strong> members. Scanning makes
          roughly <strong>{members.length.toLocaleString()}</strong> API calls (one per member) and
          may take a while on large groups. Results are cached until you reload the panel.
        </p>
      </Modal>
    </div>
  );
};

export default MemberExplorer;
