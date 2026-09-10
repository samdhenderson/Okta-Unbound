import React from 'react';
import { StatusDot } from './barParts';
import type { ActivityView } from '../../hooks/useActivityBar';

export interface CondensedBarProps {
  view: ActivityView;
  actions: React.ReactNode;
}

const CondensedBar: React.FC<CondensedBarProps> = ({ view, actions }) => (
  <div className="flex items-center gap-(--sp-inline) px-(--sp-gutter) py-1 text-xs">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <StatusDot busy={view.busy} colorVar={view.statusColorVar} />
      {view.operationActive && view.operationName ? (
        <span data-testid="activity-operation-name" className="truncate font-bold text-neutral-900">
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
        {view.rateLimit.low && <span className="ml-1 font-semibold">low</span>}
      </span>
    )}

    {view.operationActive ? (
      <span data-testid="activity-progress-compact" className="shrink-0 text-neutral-600">
        <span className="font-bold text-neutral-900">
          {view.current}/{view.total}
        </span>
        {view.opFailed > 0 && (
          <span className="ml-1 font-semibold text-danger-text">({view.opFailed} failed)</span>
        )}
      </span>
    ) : (
      view.processed > 0 && (
        <span data-testid="activity-processed-compact" className="shrink-0 text-neutral-600">
          Processed <span className="font-bold text-neutral-900">{view.processed}</span>
          {view.failed > 0 && (
            <span className="ml-1 font-semibold text-danger-text">({view.failed} failed)</span>
          )}
        </span>
      )
    )}

    <div data-testid="activity-actions" className="flex shrink-0 items-center gap-1.5">
      {actions}
    </div>
  </div>
);

export default CondensedBar;
