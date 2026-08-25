import React, { useState, useMemo, useCallback } from 'react';
import type { OktaUser, MemberMfaResult, MfaScanStatus } from '../../../shared/types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { mfaScanNeedsConfirm } from '../../hooks/useMemberMfaScan';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import MemberSearchBar from './MemberSearchBar';
import MemberFilterPanel from './MemberFilterPanel';
import CopyMembersModal from './CopyMembersModal';
import CompositionReports from './CompositionReports';
import BreakdownDetailsModal from './BreakdownDetailsModal';
import MemberList from './MemberList';
import MemberSourceFilterBar from './MemberSourceFilterBar';
import { useMembershipProofs } from '../users/GroupMembershipsListProof';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership } from '../../../shared/types';
import type { MemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MemberSourceBucket } from '../groups/memberSourceBuckets';
import {
  type BreakdownRow,
  type Dimension,
  type MemberFilter,
  type SortField,
  computeDimensionBreakdown,
  computeMfaBreakdown,
  discoverAttributeBreakdowns,
  filterMembers,
  sortMembers,
  getObservedFactorLabels,
  dimensionTitle,
  SOURCE_DIMENSION,
} from './memberAnalytics';

type FactorMode = 'off' | 'has' | 'missing';

export interface MemberSourceContext {
  index: MemberSourceIndex;
  segments: MemberSourceBucket[];
}

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
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<MemberFilter[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [copyOpen, setCopyOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 200);

  const attributes = useMemo(() => discoverAttributeBreakdowns(members), [members]);
  const statusRows = useMemo(() => computeDimensionBreakdown(members, 'status'), [members]);
  const factorLabels = useMemo(() => getObservedFactorLabels(mfaResults), [mfaResults]);
  const mfaRows = useMemo(() => computeMfaBreakdown(members, mfaResults), [members, mfaResults]);

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

  const activeSourceKeys = useMemo(
    () => new Set(filters.filter((f) => f.dimension === SOURCE_DIMENSION).map((f) => f.value)),
    [filters],
  );

  const filtered = useMemo(
    () => filterMembers(members, debouncedQuery, filters, mfaResults, sourceBuckets),
    [members, debouncedQuery, filters, mfaResults, sourceBuckets],
  );
  const sorted = useMemo(
    () => sortMembers(filtered, sortBy, sortDesc, mfaResults),
    [filtered, sortBy, sortDesc, mfaResults],
  );

  const resetKey = `${debouncedQuery}__${filters
    .map((f) => `${f.dimension}:${f.value}`)
    .join('|')}__${members.length}__${sortBy}__${sortDesc}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setVisibleCount(PAGE);
  }

  const toggleFilter = useCallback((dimension: Dimension, value: string, label: string) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.dimension === dimension && f.value === value);
      if (existing) return prev.filter((f) => f !== existing);
      return [...prev, { dimension, value, label }];
    });
  }, []);

  const handleCompositionToggle = useCallback(
    (dimension: Dimension, row: BreakdownRow) => {
      toggleFilter(dimension, row.value, `${dimensionTitle(dimension)}: ${row.label}`);
    },
    [toggleFilter],
  );

  const handleStatusToggle = useCallback(
    (row: BreakdownRow) => toggleFilter('status', row.value, `Status: ${row.label}`),
    [toggleFilter],
  );

  const handleClearStatus = useCallback(
    () => setFilters((prev) => prev.filter((f) => f.dimension !== 'status')),
    [],
  );

  const handleMfaValueToggle = useCallback(
    (value: string, label: string) => toggleFilter('mfa', value, label),
    [toggleFilter],
  );

  const handleSetFactorMode = useCallback((label: string, mode: FactorMode) => {
    setFilters((prev) => {
      const without = prev.filter(
        (f) =>
          !(
            f.dimension === 'mfa' &&
            (f.value === `has:${label}` || f.value === `missing:${label}`)
          ),
      );
      if (mode === 'off') return without;
      const value = mode === 'has' ? `has:${label}` : `missing:${label}`;
      const chip = `${mode === 'has' ? 'Has' : 'Missing'} ${label}`;
      return [...without, { dimension: 'mfa', value, label: chip }];
    });
  }, []);

  const handleSourceToggle = useCallback(
    (key: string, label: string) => toggleFilter(SOURCE_DIMENSION, key, `Source: ${label}`),
    [toggleFilter],
  );

  const clearSourceFilters = useCallback(
    () => setFilters((prev) => prev.filter((f) => f.dimension !== SOURCE_DIMENSION)),
    [],
  );

  const removeFilter = useCallback(
    (filter: MemberFilter) => setFilters((prev) => prev.filter((f) => f !== filter)),
    [],
  );
  const clearAll = useCallback(() => setFilters([]), []);

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
  const activeFilterCount = filters.length;

  const detailRows = useMemo(
    () => (detailKey ? computeDimensionBreakdown(members, detailKey) : []),
    [detailKey, members],
  );
  const detailActiveValues = useMemo(
    () => new Set(filters.filter((f) => f.dimension === detailKey).map((f) => f.value)),
    [filters, detailKey],
  );

  return (
    <div className="space-y-4">
      {memberSource && (
        <div className="space-y-3">
          <MemberSourceFilterBar
            segments={memberSource.segments}
            activeKeys={activeSourceKeys}
            onToggle={handleSourceToggle}
            onClearAll={clearSourceFilters}
            total={memberSource.index.byUserId.size}
          />
          {sourceDetail}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <MemberSearchBar value={query} onChange={setQuery} />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-(--dur-instant) flex items-center gap-2 ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary-light border-primary text-primary-text'
              : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
          }`}
          title="Toggle filters"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white min-w-[20px] text-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <MemberFilterPanel
          filters={filters}
          statusRows={statusRows}
          mfaResults={mfaResults}
          factorLabels={factorLabels}
          memberCount={members.length}
          scanStatus={scanStatus}
          onRunScanClick={handleScanClick}
          sortBy={sortBy}
          sortDesc={sortDesc}
          onToggleStatus={handleStatusToggle}
          onClearStatus={handleClearStatus}
          onToggleMfaValue={handleMfaValueToggle}
          onSetFactorMode={handleSetFactorMode}
          onToggleSort={toggleSort}
          onRemoveFilter={removeFilter}
          onClearAll={clearAll}
        />
      )}

      <CompositionReports
        attributes={attributes}
        filters={filters}
        onToggle={handleCompositionToggle}
        onExpand={setDetailKey}
        mfaRows={mfaRows}
        mfaResults={mfaResults}
        scanStatus={scanStatus}
        memberCount={members.length}
        onToggleMfa={(row) => handleMfaValueToggle(row.value, row.label)}
        onRunScanClick={handleScanClick}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">
            Members
            <span className="ml-2 text-xs font-normal text-neutral-500">
              {sorted.length.toLocaleString()}
              {sorted.length !== members.length && ` of ${members.length.toLocaleString()}`}
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
      </div>

      <BreakdownDetailsModal
        isOpen={detailKey !== null}
        onClose={() => setDetailKey(null)}
        title={detailKey ? dimensionTitle(detailKey) : ''}
        rows={detailRows}
        activeValues={detailActiveValues}
        onRowClick={(row) => detailKey && handleCompositionToggle(detailKey, row)}
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
