import React from 'react';
import { Button, IconButton } from './shared';
import type { ActivityView } from '../hooks/useActivityBar';

export interface ActivityBarViewProps {
  view: ActivityView;
  onCancel: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MetricSlot: React.FC<{
  testId: string;
  label: string;
  children: React.ReactNode;
  emphasis?: 'default' | 'low';
  present: boolean;
}> = ({ testId, label, children, emphasis = 'default', present }) => (
  <div
    data-testid={testId}
    data-low={emphasis === 'low' ? 'true' : undefined}
    className={`flex min-w-[5.5rem] items-center gap-1.5 rounded-md border px-2.5 py-1 ${
      !present
        ? 'border-neutral-200 bg-neutral-50 text-neutral-400'
        : emphasis === 'low'
          ? 'border-danger/20 bg-danger-light text-danger-text'
          : 'border-neutral-200 bg-neutral-50 text-neutral-900'
    }`}
  >
    <span className="text-neutral-600">{label}</span>
    {present ? (
      <span className="font-bold">{children}</span>
    ) : (
      <span aria-hidden="true" className="font-bold">
        –
      </span>
    )}
  </div>
);

const CollapseChevron: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <svg
    aria-hidden="true"
    className={`h-4 w-4 transition-transform duration-100 ${collapsed ? '' : 'rotate-90'}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ActivityBarView: React.FC<ActivityBarViewProps> = ({
  view,
  onCancel,
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
}) => {
  const etaContent = view.operationActive ? view.etaLabel : view.cooldownLabel;
  const etaLabel = view.cooldownLabel && !view.operationActive ? 'Resuming' : 'ETA';

  const statusDot = (
    <div
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full shadow-sm ${view.busy ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: view.statusColorVar }}
    />
  );

  const cancelButton = (
    <Button
      variant="danger"
      size="sm"
      disabled={!view.canCancel || view.isCancelling}
      onClick={onCancel}
      title="Cancel the current operation and clear the queue"
    >
      {view.isCancelling ? 'Cancelling…' : 'Cancel'}
    </Button>
  );

  const collapseToggle = collapsible ? (
    <IconButton
      label={collapsed ? 'Show all activity stats' : 'Hide extra activity stats'}
      variant="subtle"
      size="sm"
      active={!collapsed}
      onClick={onToggleCollapse}
    >
      <CollapseChevron collapsed={collapsed} />
    </IconButton>
  ) : null;

  const progressTrack = (
    <div
      role="progressbar"
      aria-label="Operation progress"
      aria-valuenow={Math.round(view.percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full bg-neutral-100"
    >
      <div
        className="h-full bg-primary transition-all duration-150"
        style={{ width: `${view.percentage}%` }}
      />
    </div>
  );

  const barClasses = 'fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white';

  if (collapsed) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={barClasses}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        <div className="flex items-center gap-3 px-5 py-2.5 text-xs">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {statusDot}
            {view.operationActive && view.operationName ? (
              <span
                data-testid="activity-operation-name"
                className="truncate font-bold text-neutral-900"
              >
                {view.operationName}
              </span>
            ) : (
              <span className="truncate font-bold text-neutral-900">{view.statusLabel}</span>
            )}
          </div>

          {view.rateLimit && (
            <span
              data-testid="activity-rate-compact"
              data-low={view.rateLimit.low ? 'true' : undefined}
              className={`shrink-0 ${view.rateLimit.low ? 'text-danger-text' : 'text-neutral-600'}`}
            >
              Rate{' '}
              <span className="font-bold">
                {view.rateLimit.remaining}/{view.rateLimit.limit}
              </span>
            </span>
          )}

          {view.operationActive ? (
            <span data-testid="activity-progress-compact" className="shrink-0 text-neutral-600">
              <span className="font-bold text-neutral-900">
                {view.current}/{view.total}
              </span>
              {view.opFailed > 0 && (
                <span className="ml-1 font-semibold text-danger-text">
                  ({view.opFailed} failed)
                </span>
              )}
            </span>
          ) : (
            view.processed > 0 && (
              <span data-testid="activity-processed-compact" className="shrink-0 text-neutral-600">
                Processed <span className="font-bold text-neutral-900">{view.processed}</span>
                {view.failed > 0 && (
                  <span className="ml-1 font-semibold text-danger-text">
                    ({view.failed} failed)
                  </span>
                )}
              </span>
            )
          )}

          <div data-testid="activity-actions" className="flex shrink-0 items-center gap-1.5">
            {collapseToggle}
            {cancelButton}
          </div>
        </div>

        {progressTrack}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={barClasses}
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      <div
        className={`flex items-center gap-3 px-5 py-2.5 text-xs ${collapsible ? 'flex-wrap' : ''}`}
      >
        <div className="flex min-w-[8rem] items-center gap-2">
          {statusDot}
          {view.operationActive && view.operationName ? (
            <span
              data-testid="activity-operation-name"
              className="truncate font-bold text-neutral-900"
            >
              {view.operationName}
            </span>
          ) : (
            <span className="font-bold text-neutral-900">{view.statusLabel}</span>
          )}
        </div>

        <MetricSlot testId="activity-queue" label="Queue" present={view.queueLength > 0}>
          {view.queueLength}
        </MetricSlot>
        <MetricSlot testId="activity-active" label="Active" present={view.activeRequests > 0}>
          {view.activeRequests}
        </MetricSlot>
        <MetricSlot
          testId="activity-rate-limit"
          label="Rate"
          present={view.rateLimit !== null}
          emphasis={view.rateLimit?.low ? 'low' : 'default'}
        >
          {view.rateLimit ? `${view.rateLimit.remaining}/${view.rateLimit.limit}` : null}
        </MetricSlot>
        <MetricSlot testId="activity-eta" label={etaLabel} present={Boolean(etaContent)}>
          {etaContent}
        </MetricSlot>

        {view.operationActive && view.total > 0 && (
          <div
            data-testid="activity-op-breakdown"
            className="ml-auto flex items-center gap-2 font-medium text-neutral-600"
          >
            <span data-testid="activity-progress-counter" className="text-neutral-900">
              {view.current} / {view.total}
            </span>
            <span aria-hidden="true" className="text-neutral-300">
              |
            </span>
            <span className="text-success-text">{view.opCompleted} done</span>
            <span className="text-info">{view.opActive} active</span>
            {view.opFailed > 0 && <span className="text-danger-text">{view.opFailed} failed</span>}
          </div>
        )}

        {!view.operationActive && view.processed > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-neutral-600">
            <span>Processed:</span>
            <span className="font-bold text-neutral-900">{view.processed}</span>
            {view.failed > 0 && (
              <span className="font-semibold text-danger-text">({view.failed} failed)</span>
            )}
          </div>
        )}

        <div
          data-testid="activity-actions"
          className={`flex items-center gap-1.5 ${
            view.operationActive || view.processed > 0 ? '' : 'ml-auto'
          }`}
        >
          {collapseToggle}
          {cancelButton}
        </div>
      </div>

      {progressTrack}
    </div>
  );
};

export default ActivityBarView;
