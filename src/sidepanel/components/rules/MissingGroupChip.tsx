import React from 'react';
import { CopyableId } from '../shared';
import Icon from '../shared/Icon';

export interface MissingGroupChipProps {
  groupId: string;
}

const MissingGroupChip: React.FC<MissingGroupChipProps> = ({ groupId }) => (
  <span
    className="inline-flex max-w-full items-center gap-1 rounded-md border border-warning bg-warning-light px-2 py-0.5 text-xs"
    title="No group in this org has this id. The rule still lists it, and adds nobody to it."
  >
    <Icon type="alert" size="xs" className="shrink-0 text-warning-text" />
    <span className="shrink-0 text-warning-text">Group no longer exists</span>
    <CopyableId value={groupId} label={`Copy group id ${groupId}`} />
  </span>
);

export default MissingGroupChip;
