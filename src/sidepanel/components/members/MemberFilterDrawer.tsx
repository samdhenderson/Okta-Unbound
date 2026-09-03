import React from 'react';
import { Button } from '../shared';
import MemberFilterPanel from './MemberFilterPanel';
import MemberSourceFilterBar from './MemberSourceFilterBar';
import AttributeFilterList from './AttributeFilterList';
import type { MemberFiltersApi } from '../../hooks/useMemberFilters';
import type { MemberMfaResult, MfaScanStatus } from '../../../shared/types';
import type { AttributeSummary, BreakdownRow, SortField } from './memberAnalytics';
import type { MemberSourceContext } from './memberSourceContext';

export interface MemberFilterDrawerProps {
  id: string;
  open: boolean;
  memberFilters: MemberFiltersApi;
  memberSource?: MemberSourceContext;
  sourceDetail?: React.ReactNode;
  statusRows: BreakdownRow[];
  mfaResults: Map<string, MemberMfaResult> | null;
  factorLabels: string[];
  memberCount: number;
  scanStatus: MfaScanStatus;
  onRunScanClick: () => void;
  sortBy: SortField;
  sortDesc: boolean;
  onToggleSort: (field: SortField) => void;
  attributes: AttributeSummary[];
  filteredDimensions: ReadonlySet<string>;
  onSelectAttribute: (attributeKey: string) => void;
  onOpenInsights?: () => void;
}

const MemberFilterDrawer: React.FC<MemberFilterDrawerProps> = ({
  id,
  open,
  memberFilters,
  memberSource,
  sourceDetail,
  statusRows,
  mfaResults,
  factorLabels,
  memberCount,
  scanStatus,
  onRunScanClick,
  sortBy,
  sortDesc,
  onToggleSort,
  attributes,
  filteredDimensions,
  onSelectAttribute,
  onOpenInsights,
}) => (
  <div id={id} className="disclose" data-open={open} inert={!open || undefined}>
    <div>
      <div className="space-y-(--sp-rung) rounded-md border border-neutral-200 bg-white p-(--sp-card)">
        {memberSource && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-neutral-600">Source</h4>
            <MemberSourceFilterBar
              segments={memberSource.segments}
              activeKeys={memberFilters.sourceKeys}
              onToggle={memberFilters.toggleSource}
              onClearAll={memberFilters.clearSource}
              total={memberSource.index.byUserId.size}
            />
            {sourceDetail}
          </div>
        )}

        <MemberFilterPanel
          filters={memberFilters.filters}
          statusRows={statusRows}
          mfaResults={mfaResults}
          factorLabels={factorLabels}
          memberCount={memberCount}
          scanStatus={scanStatus}
          onRunScanClick={onRunScanClick}
          sortBy={sortBy}
          sortDesc={sortDesc}
          onToggleStatus={memberFilters.toggleStatus}
          onClearStatus={memberFilters.clearStatus}
          onToggleMfaValue={memberFilters.toggleMfaValue}
          onSetFactorMode={memberFilters.setFactorMode}
          onToggleSort={onToggleSort}
        />

        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-neutral-600">Profile attributes</h4>
          <AttributeFilterList
            attributes={attributes}
            filteredKeys={filteredDimensions}
            onSelect={onSelectAttribute}
          />
        </div>

        {onOpenInsights && (
          <div className="space-y-1.5">
            <p className="text-xs text-neutral-500">
              Attribute and MFA-factor distributions for this group are on the Insights tab.
            </p>
            <Button variant="secondary" size="sm" onClick={onOpenInsights}>
              Open Insights
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MemberFilterDrawer;
