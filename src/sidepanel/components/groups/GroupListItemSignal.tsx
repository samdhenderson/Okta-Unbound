import React from 'react';
import type { GroupRowModel } from './groupSourceSummary';

interface GroupListItemSignalProps {
  model: GroupRowModel;
}

const GroupListItemSignal: React.FC<GroupListItemSignalProps> = ({ model }) => {
  const { source, memberCount, memberNoun, facts } = model;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
      {source.kind === 'computed' && (
        <span
          aria-hidden="true"
          title={source.title}
          className="flex h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100"
        >
          {source.segments.map((segment) => (
            <span
              key={segment.key}
              className={segment.barClass}
              style={{ width: `${segment.percent}%` }}
            />
          ))}
        </span>
      )}

      <span className="whitespace-nowrap">
        <span className="font-semibold text-neutral-700">{memberCount.toLocaleString()}</span>{' '}
        <span>{memberNoun}</span>
      </span>

      {source.kind === 'computed' && (
        <span className="text-neutral-700" title={source.title}>
          {source.summary}
        </span>
      )}

      {source.kind === 'unknown' && (
        <span className="text-neutral-400 italic" title={source.title}>
          {source.summary}
        </span>
      )}

      {facts.map((fact) => (
        <span key={fact.key} className="whitespace-nowrap" title={fact.title}>
          {fact.label}
        </span>
      ))}
    </div>
  );
};

export default GroupListItemSignal;
