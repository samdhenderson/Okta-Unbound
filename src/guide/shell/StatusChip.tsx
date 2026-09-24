import React from 'react';
import Badge, { type BadgeVariant } from '../../sidepanel/components/shared/Badge';
import { STATUS_LABEL, type ChapterStatus } from '../status';

const VARIANT: Readonly<Record<ChapterStatus, BadgeVariant>> = {
  shipped: 'success',
  capped: 'neutral',
  'in-progress': 'info',
  unresolved: 'warning',
};

export interface StatusChipProps {
  status: ChapterStatus;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => (
  <Badge variant={VARIANT[status]} testId="guide-status-chip">
    {STATUS_LABEL[status]}
  </Badge>
);

export default StatusChip;
