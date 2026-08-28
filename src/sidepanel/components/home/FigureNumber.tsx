import React from 'react';

export interface FigureNumberProps {
  value: number | null;
}

const FigureNumber: React.FC<FigureNumberProps> = ({ value }) => (
  <span
    aria-hidden={value === null ? 'true' : undefined}
    className="flex shrink-0 items-center self-stretch"
  >
    <span
      className={`min-w-[2.6ch] text-right text-3xl leading-none tabular-nums ${
        value === null ? 'font-normal text-neutral-400' : 'font-semibold text-neutral-900'
      }`}
    >
      {value === null ? '—' : value.toLocaleString()}
    </span>
  </span>
);

export default FigureNumber;
