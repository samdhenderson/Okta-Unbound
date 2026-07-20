import React from 'react';
import type { MemberMfaResult } from '../../../../shared/types';
import FilterPill from '../../shared/FilterPill';
import SortPill from '../../shared/SortPill';
import ActiveFilterChips from './ActiveFilterChips';
import { type BreakdownRow, type MemberFilter, type SortField } from './memberAnalytics';

type FactorMode = 'off' | 'has' | 'missing';

interface MemberFilterPanelProps {
  filters: MemberFilter[];
  statusRows: BreakdownRow[];
  mfaResults: Map<string, MemberMfaResult> | null;
  factorLabels: string[];
  sortBy: SortField;
  sortDesc: boolean;
  onToggleStatus: (row: BreakdownRow) => void;
  onClearStatus: () => void;
  onToggleMfaValue: (value: string, label: string) => void;
  onSetFactorMode: (label: string, mode: FactorMode) => void;
  onToggleSort: (field: SortField) => void;
  onRemoveFilter: (filter: MemberFilter) => void;
  onClearAll: () => void;
}

const MemberFilterPanel: React.FC<MemberFilterPanelProps> = ({
  filters,
  statusRows,
  mfaResults,
  factorLabels,
  sortBy,
  sortDesc,
  onToggleStatus,
  onClearStatus,
  onToggleMfaValue,
  onSetFactorMode,
  onToggleSort,
  onRemoveFilter,
  onClearAll,
}) => {
  const statusActive = new Set(filters.filter((f) => f.dimension === 'status').map((f) => f.value));
  const mfaActive = new Set(filters.filter((f) => f.dimension === 'mfa').map((f) => f.value));

  const factorMode = (label: string): FactorMode => {
    if (mfaActive.has(`has:${label}`)) return 'has';
    if (mfaActive.has(`missing:${label}`)) return 'missing';
    return 'off';
  };

  const realStatusRows = statusRows.filter((r) => r.count > 0);

  return (
    <div className="p-4 bg-white rounded-md border border-neutral-200 space-y-4 animate-in slide-in-from-top-2 duration-100">
      <ActiveFilterChips filters={filters} onRemove={onRemoveFilter} onClearAll={onClearAll} />

      {realStatusRows.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Status</label>
          <div className="flex flex-wrap gap-1.5">
            <FilterPill active={statusActive.size === 0} onClick={onClearStatus}>
              All
            </FilterPill>
            {realStatusRows.map((row) => (
              <FilterPill
                key={row.value}
                active={statusActive.has(row.value)}
                onClick={() => onToggleStatus(row)}
              >
                {row.label} ({row.count.toLocaleString()})
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">MFA Factors</label>
        {!mfaResults ? (
          <p className="text-xs text-neutral-500">
            Run the MFA scan above to filter by enrolled factors.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                active={mfaActive.has('none')}
                onClick={() => onToggleMfaValue('none', 'No factors enrolled')}
              >
                No factors
              </FilterPill>
              <FilterPill
                active={mfaActive.has('multiple')}
                onClick={() => onToggleMfaValue('multiple', 'Multiple factors (2+)')}
              >
                Multiple (2+)
              </FilterPill>
            </div>

            {factorLabels.length === 0 ? (
              <p className="text-xs text-neutral-500">No factors enrolled across this group.</p>
            ) : (
              <div className="space-y-1.5">
                {factorLabels.map((label) => {
                  const mode = factorMode(label);
                  return (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-neutral-700 truncate" title={label}>
                        {label}
                      </span>
                      <div className="flex flex-shrink-0 gap-1.5">
                        <FilterPill
                          active={mode === 'has'}
                          onClick={() => onSetFactorMode(label, mode === 'has' ? 'off' : 'has')}
                          title={`Show only members with ${label}`}
                          inactiveClassName="bg-neutral-50 text-success-text border border-neutral-200 hover:border-success-text"
                        >
                          Has
                        </FilterPill>
                        <FilterPill
                          active={mode === 'missing'}
                          onClick={() =>
                            onSetFactorMode(label, mode === 'missing' ? 'off' : 'missing')
                          }
                          title={`Show only members missing ${label}`}
                          inactiveClassName="bg-neutral-50 text-danger-text border border-neutral-200 hover:border-danger-text"
                        >
                          Missing
                        </FilterPill>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">Sort by</label>
        <div className="flex flex-wrap gap-1.5">
          <SortPill
            field="name"
            label="Name"
            activeField={sortBy}
            descending={sortDesc}
            onToggle={onToggleSort}
          />
          <SortPill
            field="status"
            label="Status"
            activeField={sortBy}
            descending={sortDesc}
            onToggle={onToggleSort}
          />
          {mfaResults && (
            <SortPill
              field="factors"
              label="Factor count"
              activeField={sortBy}
              descending={sortDesc}
              onToggle={onToggleSort}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberFilterPanel;
