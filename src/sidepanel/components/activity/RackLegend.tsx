import React from 'react';
import { COOLDOWN_HATCH, QUEUED_DASHES, UNKNOWN_HATCH } from './hatches';

const Key: React.FC<{
  label: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, className = '', style }) => (
  <span className="flex shrink-0 items-center gap-1">
    <span
      aria-hidden="true"
      className={`h-2 w-4 shrink-0 rounded-full ${className}`}
      style={style}
    />
    <span>{label}</span>
  </span>
);

const RackLegend: React.FC = () => (
  <div
    data-testid="activity-rack-legend"
    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-(--sp-gutter) pt-1.5 text-xs text-neutral-500"
  >
    <Key label="running" className="bg-primary" />
    <Key label="queued" style={{ backgroundImage: QUEUED_DASHES }} />
    <Key label="budget remaining" className="bg-primary-light" />
    <Key label="cooling down" style={{ backgroundImage: COOLDOWN_HATCH }} />
    <Key label="at rest" className="bg-neutral-100" />
    <Key
      label="budget unknown"
      className="bg-neutral-50"
      style={{ backgroundImage: UNKNOWN_HATCH }}
    />
  </div>
);

export default RackLegend;
