import React from 'react';
import Icon from './Icon';
import IconButton from './IconButton';

export interface WorkingSetPinButtonProps {
  pinned: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const WorkingSetPinButton: React.FC<WorkingSetPinButtonProps> = ({
  pinned,
  onToggle,
  disabled = false,
}) => (
  <IconButton
    label={pinned ? 'Unpin from Home' : 'Pin to Home'}
    title={pinned ? 'Remove from the Home tab' : 'Keep this on the Home tab'}
    onClick={onToggle}
    active={pinned}
    disabled={disabled}
    variant={pinned ? 'subtle' : 'ghost'}
    size="sm"
  >
    <Icon type="pin" size="sm" />
  </IconButton>
);

export default WorkingSetPinButton;
