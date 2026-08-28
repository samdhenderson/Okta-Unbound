import React from 'react';
import Eyebrow from '../shared/Eyebrow';
import Icon from '../shared/Icon';
import WorkingSetRow from './WorkingSetRow';
import type { WorkingSetRef } from '../../../shared/storage/workingSetStore';

export interface WorkingSetProps {
  pinned: WorkingSetRef[];
  recent: WorkingSetRef[];
  onOpen: (entry: WorkingSetRef) => void;
  onUnpin: (entry: WorkingSetRef) => void;
  onForget: (entry: WorkingSetRef) => void;
}

const WorkingSet: React.FC<WorkingSetProps> = ({ pinned, recent, onOpen, onUnpin, onForget }) => (
  <div className="space-y-(--sp-rung)">
    <section aria-label="Pinned" className="space-y-2">
      <Eyebrow as="h3">Pinned</Eyebrow>
      {pinned.length > 0 ? (
        <ul className="space-y-1">
          {pinned.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`}>
              <WorkingSetRow entry={entry} onOpen={onOpen} pinned onDrop={onUnpin} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 rounded-md border border-dashed border-neutral-200 p-(--sp-card) text-xs text-neutral-600">
          <Icon type="pin" size="sm" className="shrink-0 text-neutral-400" />
          <span>
            Nothing pinned yet. Open a group or a user and press the pin in the corner of its header
            to keep it here.
          </span>
        </p>
      )}
    </section>

    {recent.length > 0 && (
      <section aria-label="Recent" className="space-y-2">
        <Eyebrow as="h3">Recent</Eyebrow>
        <ul className="space-y-1">
          {recent.map((entry) => (
            <li key={`${entry.kind}:${entry.id}`}>
              <WorkingSetRow entry={entry} onOpen={onOpen} pinned={false} onDrop={onForget} />
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
);

export default WorkingSet;
