import React from 'react';

export interface MarkerProps {
  n: number;
  align?: 'center' | 'top';
  children: React.ReactNode;
}

const ALIGN: Record<NonNullable<MarkerProps['align']>, string> = {
  center: 'top-1/2 -translate-y-1/2',
  top: 'top-2',
};

export const Marker: React.FC<MarkerProps> = ({ n, align = 'center', children }) => (
  <div className="relative">
    {children}
    <span
      aria-hidden="true"
      className={`absolute -left-7 ${ALIGN[align]} z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white shadow-dock`}
    >
      {n}
    </span>
  </div>
);

export interface LegendItem {
  text: React.ReactNode;
}

export interface LegendProps {
  items: ReadonlyArray<LegendItem>;
}

export const Legend: React.FC<LegendProps> = ({ items }) => (
  <ol className="guide-legend rise-in-stagger flex flex-col gap-3.5" data-testid="guide-legend">
    {items.map((item, index) => (
      <li
        key={index}
        className="flex items-start gap-3 text-sm leading-relaxed text-neutral-900"
        style={{ '--guide-i': index } as React.CSSProperties}
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold tabular-nums text-white">
          {index + 1}
        </span>
        <span className="min-w-0">{item.text}</span>
      </li>
    ))}
  </ol>
);
