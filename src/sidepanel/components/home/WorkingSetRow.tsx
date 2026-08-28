import React, { useId } from 'react';
import ListRow from '../shared/ListRow';
import Icon from '../shared/Icon';
import IconButton from '../shared/IconButton';
import StretchedButton from '../shared/StretchedButton';
import { getRelativeTime } from '../../../shared/utils/dateFormat';
import type { WorkingSetRef } from '../../../shared/storage/workingSetStore';

const KIND_LABEL = { group: 'Group', user: 'User' } as const;

export interface WorkingSetRowProps {
  entry: WorkingSetRef;
  onOpen: (entry: WorkingSetRef) => void;
  pinned: boolean;
  onDrop: (entry: WorkingSetRef) => void;
}

const WorkingSetRow: React.FC<WorkingSetRowProps> = ({ entry, onOpen, pinned, onDrop }) => {
  const nameId = useId();

  const secondary = entry.lastPane
    ? `${KIND_LABEL[entry.kind]} · left on ${entry.lastPane}`
    : KIND_LABEL[entry.kind];

  const seen = getRelativeTime(new Date(entry.lastSeenAt).toISOString());
  const age = seen && seen !== 'today' ? ` · ${seen}` : '';

  return (
    <ListRow density="compact" className="relative">
      <StretchedButton
        label={`Open ${KIND_LABEL[entry.kind].toLowerCase()}`}
        describedBy={nameId}
        onClick={() => onOpen(entry)}
      />
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          type={entry.kind === 'group' ? 'users' : 'user'}
          size="md"
          className="text-neutral-400 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p id={nameId} className="text-sm font-medium text-neutral-900 truncate">
            {entry.name}
          </p>
          <p className="text-xs text-neutral-600 truncate">
            {secondary}
            {age}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <IconButton
            label={pinned ? `Unpin ${entry.name}` : `Forget ${entry.name}`}
            variant="ghost"
            size="sm"
            onClick={() => onDrop(entry)}
          >
            <Icon type="close" size="sm" />
          </IconButton>
        </div>
      </div>
    </ListRow>
  );
};

export default WorkingSetRow;
