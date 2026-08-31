import React from 'react';

export interface PipelineCounts {
  spent: number;
  active: number;
  queued: number;
  planned: number;
}

export interface PipelineMeterProps {
  counts: PipelineCounts;
  approximate?: boolean;
  label: string;
}

const HATCH =
  'repeating-linear-gradient(135deg, var(--color-neutral-400) 0 3px, transparent 3px 6px)';

function Segment({ fraction, style }: { fraction: number; style: React.CSSProperties }) {
  if (fraction <= 0) return null;
  return (
    <div aria-hidden="true" className="h-full" style={{ width: `${fraction * 100}%`, ...style }} />
  );
}

const PipelineMeter: React.FC<PipelineMeterProps> = ({ counts, approximate = false, label }) => {
  const total = counts.spent + counts.active + counts.queued + counts.planned;
  const share = (n: number) => (total > 0 ? n / total : 0);

  return (
    <div
      role="img"
      aria-label={label}
      data-testid="pipeline-meter"
      data-approximate={approximate ? 'true' : undefined}
      className="flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
    >
      <Segment fraction={share(counts.spent)} style={{ backgroundColor: 'var(--color-primary)' }} />
      <Segment fraction={share(counts.active)} style={{ backgroundColor: 'var(--color-info)' }} />
      <Segment
        fraction={share(counts.queued)}
        style={{ backgroundColor: 'var(--color-neutral-300)' }}
      />
      <Segment
        fraction={share(counts.planned)}
        style={
          approximate ? { backgroundImage: HATCH } : { backgroundColor: 'var(--color-neutral-400)' }
        }
      />
    </div>
  );
};

export default PipelineMeter;
