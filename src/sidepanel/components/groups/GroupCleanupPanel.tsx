import React, { useMemo } from 'react';
import Button from '../shared/Button';
import EmptyState from '../shared/EmptyState';
import StatCard from '../shared/StatCard';
import type { GroupSummary } from '../../../shared/types';
import { analyzeClutter } from './clutterAnalysis';

const MAX_PREVIEW = 8;

function reviewScoreColor(score: number): string {
  if (score >= 70) return 'bg-danger-light text-danger-text border-danger-light';
  if (score >= 40) return 'bg-warning-light text-warning-text border-warning-light';
  return 'bg-neutral-100 text-neutral-600 border-neutral-200';
}

interface GroupCleanupPanelProps {
  groups: GroupSummary[];
  onSelectGroups: (ids: string[]) => void;
  onAnalyzeSource: (group: GroupSummary) => void;
  onClose: () => void;
}

const GroupCleanupPanel: React.FC<GroupCleanupPanelProps> = ({
  groups,
  onSelectGroups,
  onAnalyzeSource,
  onClose,
}) => {
  const report = useMemo(() => analyzeClutter(groups), [groups]);
  const preview = report.entries.slice(0, MAX_PREVIEW);
  const overflow = report.entries.length - preview.length;

  return (
    <div className="bg-white rounded-md border border-neutral-200 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Cleanup triage</h3>
          <p className="text-xs text-neutral-500">
            {report.flaggedIds.length} of {report.totalGroups} loaded groups worth a review — local
            analysis, no API calls.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {report.flaggedIds.length === 0 ? (
        <EmptyState
          icon="check"
          title="No clutter detected"
          description="No empty, duplicate-named, or stale groups in the loaded list."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="Empty"
              value={report.categories.empty.length}
              color="neutral"
              icon="minus"
              subtitle="no members"
              onClick={
                report.categories.empty.length > 0
                  ? () => onSelectGroups(report.categories.empty)
                  : undefined
              }
            />
            <StatCard
              title="Duplicate names"
              value={report.categories.duplicateName.length}
              color="warning"
              icon="clipboard"
              subtitle="shared name"
              onClick={
                report.categories.duplicateName.length > 0
                  ? () => onSelectGroups(report.categories.duplicateName)
                  : undefined
              }
            />
            <StatCard
              title="Stale"
              value={report.categories.stale.length}
              color="warning"
              icon="pause"
              subtitle="not updated in 1+ year"
              onClick={
                report.categories.stale.length > 0
                  ? () => onSelectGroups(report.categories.stale)
                  : undefined
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelectGroups(report.flaggedIds)}
              title="Select every flagged group"
            >
              Select all flagged ({report.flaggedIds.length})
            </Button>
          </div>

          <div className="space-y-2">
            {preview.map((entry) => (
              <div
                key={entry.group.id}
                className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {entry.group.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {entry.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-2 py-0.5 rounded-md bg-neutral-50 text-neutral-600 text-xs font-medium border border-neutral-200"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold border ${reviewScoreColor(
                      entry.reviewScore,
                    )}`}
                    title="Review confidence (fused signal, 0–100)"
                  >
                    {entry.reviewScore}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAnalyzeSource(entry.group)}
                    title="Why does this group exist?"
                  >
                    Why?
                  </Button>
                </div>
              </div>
            ))}
            {overflow > 0 && (
              <p className="text-xs text-neutral-500">
                and {overflow} more flagged group{overflow === 1 ? '' : 's'}…
              </p>
            )}
          </div>

          <p className="text-xs text-neutral-400">
            Select a category to load those groups into the selection bar, then{' '}
            <strong>Compare</strong>, <strong>Merge</strong>, or <strong>Export</strong> them — or
            hit <strong>Why?</strong> to see what feeds a group first. Detection is local (member
            counts, names, last-updated dates); nothing here deletes a group.
          </p>
        </>
      )}
    </div>
  );
};

export default GroupCleanupPanel;
