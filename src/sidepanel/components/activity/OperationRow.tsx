import React from 'react';
import type { PlanSummary } from '@/shared/scheduler/plan';
import { IconButton } from '../shared';
import Icon from '../shared/Icon';
import PipelineMeter from './PipelineMeter';

export interface OperationRowProps {
  operation: PlanSummary;
  onCancel?: (planId: string) => void;
}

function bucketLabel(bucket: string): string {
  return bucket.replace(/^\/api\/v1\//, '');
}

export function operationBuckets(operation: PlanSummary): string[] {
  const seen = new Set<string>();
  for (const leg of operation.legs) seen.add(leg.bucket);
  return [...seen];
}

export function budgetLabel(operation: PlanSummary): string {
  if (operation.estimated === null) return `${operation.spent}`;
  return `${operation.spent} / ${operation.estimated}`;
}

const OperationRow: React.FC<OperationRowProps> = ({ operation, onCancel }) => {
  const buckets = operationBuckets(operation);
  const remaining = operation.remaining ?? 0;

  return (
    <div
      data-testid={`activity-operation-${operation.id}`}
      className="flex flex-col gap-1 px-(--sp-gutter) py-1.5"
    >
      <div className="flex items-baseline gap-2 text-xs">
        <span className="truncate font-medium text-neutral-900">{operation.name}</span>
        {buckets.length > 0 && (
          <span className="truncate text-neutral-500">{buckets.map(bucketLabel).join(', ')}</span>
        )}
        <span
          data-testid={`activity-operation-budget-${operation.id}`}
          className="ml-auto shrink-0 tabular-nums text-neutral-600"
        >
          {budgetLabel(operation)}
        </span>
        {onCancel && (
          <IconButton
            label={`Stop ${operation.name}`}
            variant="subtle"
            size="sm"
            onClick={() => onCancel(operation.id)}
          >
            <Icon type="close" size="sm" />
          </IconButton>
        )}
      </div>
      <PipelineMeter
        counts={{ spent: operation.spent, active: 0, queued: 0, planned: remaining }}
        label={`${operation.name}: ${operation.spent} requests spent, ${remaining} to come`}
      />
    </div>
  );
};

export default OperationRow;
