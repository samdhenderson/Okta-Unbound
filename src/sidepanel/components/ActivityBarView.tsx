import React, { useRef } from 'react';
import { Button, IconButton } from './shared';
import BucketList from './activity/BucketList';
import CondensedBar from './activity/CondensedBar';
import OperationList from './activity/OperationList';
import ResetTimeline from './activity/ResetTimeline';
import { CollapseChevron, ProgressTrack, StatusDot } from './activity/barParts';
import { usePublishedHeight } from '../hooks/usePublishedHeight';
import type { ActivityView } from '../hooks/useActivityBar';

export interface ActivityBarViewProps {
  view: ActivityView;
  onCancel: () => void;
  onCancelOperation?: (planId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BAR_CLASSES = 'fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white';

const ActivityBarView: React.FC<ActivityBarViewProps> = ({
  view,
  onCancel,
  onCancelOperation,
  collapsed = false,
  onToggleCollapse,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  usePublishedHeight(barRef, '--activity-h');

  const cancelsEverything = view.operations.length > 1;

  const standing = view.operationActive
    ? (view.eta?.label ?? null)
    : (view.cooldownLabel ?? null) !== null
      ? `resuming in ${view.cooldownLabel}`
      : view.buckets.length > 0
        ? `${view.buckets.length} ${view.buckets.length === 1 ? 'bucket' : 'buckets'}`
        : null;

  const actions = (
    <>
      <IconButton
        label={collapsed ? 'Show all activity stats' : 'Hide extra activity stats'}
        variant="subtle"
        size="sm"
        active={!collapsed}
        onClick={onToggleCollapse}
      >
        <CollapseChevron collapsed={collapsed} />
      </IconButton>
      <Button
        variant="danger"
        size="xs"
        disabled={!view.canCancel || view.isCancelling}
        onClick={onCancel}
        title={
          cancelsEverything
            ? 'Cancel every running operation and clear the queue'
            : 'Cancel the current operation and clear the queue'
        }
      >
        {view.isCancelling ? 'Cancelling…' : cancelsEverything ? 'Cancel all' : 'Cancel'}
      </Button>
    </>
  );

  if (collapsed) {
    return (
      <div
        ref={barRef}
        role="status"
        aria-live="polite"
        className={BAR_CLASSES}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        <CondensedBar view={view} actions={actions} />
        <ProgressTrack percentage={view.percentage} />
      </div>
    );
  }

  return (
    <div
      ref={barRef}
      role="status"
      aria-live="polite"
      className={BAR_CLASSES}
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      <div className="flex flex-wrap items-center gap-(--sp-inline) px-(--sp-gutter) py-1.5 text-xs">
        <div className="flex min-w-0 items-baseline gap-2">
          <StatusDot busy={view.busy} colorVar={view.statusColorVar} />
          {view.operationActive && view.operationName ? (
            <span
              data-testid="activity-operation-name"
              className="truncate font-bold text-neutral-900"
            >
              {view.operationName}
            </span>
          ) : (
            <span data-testid="activity-status-label" className="font-bold text-neutral-900">
              {view.statusLabel}
            </span>
          )}
          {view.operationActive && view.total > 0 && (
            <span
              data-testid="activity-progress-counter"
              className="shrink-0 tabular-nums text-neutral-600"
            >
              {view.current} / {view.total}
            </span>
          )}
        </div>

        <div
          data-testid="activity-standing"
          className="ms-auto flex shrink-0 items-baseline gap-2 text-neutral-600"
        >
          {view.opFailed > 0 && (
            <span data-testid="activity-failed" className="font-semibold text-danger-text">
              {view.opFailed} failed
            </span>
          )}
          <span className="tabular-nums">{standing}</span>
        </div>

        <div
          data-testid="activity-actions"
          className={`flex items-center gap-1.5 ${
            view.operationActive || view.processed > 0 ? '' : 'ms-auto'
          }`}
        >
          {actions}
        </div>
      </div>

      <OperationList operations={view.operations} onCancelOperation={onCancelOperation} />

      <ResetTimeline buckets={view.buckets} now={view.now} />

      <BucketList
        buckets={view.buckets}
        lowThresholdPercent={view.lowThresholdPercent}
        now={view.now}
      />

      <ProgressTrack percentage={view.percentage} />
    </div>
  );
};

export default ActivityBarView;
