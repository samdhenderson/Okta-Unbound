import React from 'react';
import type { PlanSummary } from '@/shared/scheduler/plan';
import OperationRow from './OperationRow';

export interface OperationListProps {
  operations: PlanSummary[];
  onCancelOperation?: (planId: string) => void;
  maxRows?: number;
}

const OperationList: React.FC<OperationListProps> = ({
  operations,
  onCancelOperation,
  maxRows = 3,
}) => {
  if (operations.length === 0) return null;

  const shown = operations.slice(0, maxRows);
  const hidden = operations.length - shown.length;

  return (
    <div data-testid="activity-operations" className="border-t border-neutral-100">
      {shown.map((operation) => (
        <OperationRow key={operation.id} operation={operation} onCancel={onCancelOperation} />
      ))}
      {hidden > 0 && (
        <div
          data-testid="activity-operations-overflow"
          className="px-(--sp-gutter) py-1 text-xs text-neutral-500"
        >
          + {hidden} more {hidden === 1 ? 'operation' : 'operations'}
        </div>
      )}
    </div>
  );
};

export default OperationList;
