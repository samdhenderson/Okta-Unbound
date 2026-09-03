import React from 'react';
import Icon from '../shared/Icon';

export const StatusDot: React.FC<{
  busy: boolean;
  colorVar: string;
}> = ({ busy, colorVar }) => (
  <div
    aria-hidden="true"
    className={`motion-exempt h-2 w-2 shrink-0 rounded-full shadow-sm ${busy ? 'animate-pulse' : ''}`}
    style={{ backgroundColor: colorVar }}
  />
);

export const ProgressTrack: React.FC<{
  percentage: number;
}> = ({ percentage }) => (
  <div
    role="progressbar"
    aria-label="Operation progress"
    aria-valuenow={Math.round(percentage)}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-1 w-full bg-neutral-100"
  >
    <div
      className="motion-exempt h-full bg-primary transition-[width] duration-(--dur-tell) ease-standard"
      style={{ width: `${percentage}%` }}
    />
  </div>
);

export const CollapseChevron: React.FC<{
  collapsed: boolean;
}> = ({ collapsed }) => (
  <Icon
    type="chevron-right"
    size="sm"
    className={`transition-transform duration-(--dur-quick) ease-standard ${
      collapsed ? '' : 'rotate-90'
    }`}
  />
);
