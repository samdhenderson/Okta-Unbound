import React from 'react';

export interface StageProps {
  label?: string;
  children: React.ReactNode;
  minHeight?: number;
  lit?: boolean;
  stageRef?: (node: HTMLElement | null) => void;
}

const Stage: React.FC<StageProps> = ({ label, children, minHeight, lit, stageRef }) => (
  <figure
    ref={stageRef}
    className={`guide-stage m-0 ${label ? 'rounded-lg border border-neutral-200 bg-white' : ''}`}
    data-lit={lit || undefined}
    data-bare={label ? undefined : true}
  >
    {label ? (
      <figcaption className="flex items-center gap-2 rounded-t-lg border-b border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
        {label}
      </figcaption>
    ) : null}
    <div
      className={`relative py-3 ${label ? 'rounded-b-lg bg-canvas' : ''} ${
        lit ? 'px-3' : 'pr-3 pl-9'
      }`}
      style={minHeight ? { minHeight } : undefined}
      inert={lit || undefined}
    >
      {children}
    </div>
  </figure>
);

export default Stage;
