import React from 'react';

export interface SpreadBarSegment {
  key: string;
  title: string;
  count: number;
  background: string;
}

export interface SpreadBarProps {
  segments: readonly SpreadBarSegment[];
  className?: string;
}

const SpreadBar: React.FC<SpreadBarProps> = ({ segments, className = '' }) => {
  if (segments.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`flex h-3 w-full gap-px overflow-hidden rounded-full bg-neutral-100 ${className}`}
    >
      {segments.map((segment) => (
        <div
          key={segment.key}
          title={segment.title}
          style={{ background: segment.background, flexGrow: segment.count, flexBasis: 0 }}
          className="min-w-1"
        />
      ))}
    </div>
  );
};

export default SpreadBar;
