import React from 'react';

export type SkeletonVariant = 'text' | 'row' | 'card';
export type SkeletonSize = 'sm' | 'md' | 'lg';

interface SkeletonProps {
  variant?: SkeletonVariant;
  size?: SkeletonSize;
  count?: number;
  width?: string;
  label?: string;
  className?: string;
}

const paddingClasses: Record<SkeletonSize, string> = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
};

const lineHeightClasses: Record<SkeletonSize, string> = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-5',
};

const containerClasses: Record<SkeletonVariant, string> = {
  text: '',
  row: 'rounded-md border border-neutral-200 bg-white',
  card: 'rounded-md border border-neutral-200 bg-white',
};

function SkeletonBone({
  variant,
  size,
  width,
}: {
  variant: SkeletonVariant;
  size: SkeletonSize;
  width: string;
}) {
  if (variant === 'row') {
    return (
      <div aria-hidden="true" className={`${containerClasses.row} ${paddingClasses[size]}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded" />
            <div className="flex gap-1.5">
              <div className="skeleton h-5 w-16 rounded-md" />
              <div className="skeleton h-5 w-14 rounded-md" />
            </div>
            <div className="skeleton h-3 w-3/5 rounded" />
          </div>
          <div className="skeleton h-6 w-6 shrink-0 rounded-md" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div aria-hidden="true" className={`${containerClasses.card} ${paddingClasses[size]}`}>
        <div className="space-y-2">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-8 w-1/3 rounded" />
          <div className="skeleton h-3 w-2/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`skeleton rounded ${lineHeightClasses[size]} ${width}`} />
  );
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  size = 'md',
  count = 1,
  width = 'w-full',
  label = 'Loading',
  className = '',
}) => {
  const n = Math.max(1, count);
  const bones = Array.from({ length: n }, (_, i) => (
    <SkeletonBone key={i} variant={variant} size={size} width={width} />
  ));

  return (
    <div className={className}>
      <div role="status" aria-label={label} className="sr-only">
        {label}
      </div>
      <div className={n > 1 ? 'space-y-3 rise-in-stagger' : ''}>{bones}</div>
    </div>
  );
};

export default Skeleton;
