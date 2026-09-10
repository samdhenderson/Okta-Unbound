import React, { useEffect, useRef } from 'react';
import { IconButton } from '../shared';
import Icon from '../shared/Icon';
import type { AttributeStep } from './profileDisplayOps';

export interface ProfileDisplayGripProps {
  label: string;
  lifted: boolean;
  disabled?: boolean;
  describedBy?: string;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onLift: () => void;
  onStep: (direction: AttributeStep) => void;
  onDrop: () => void;
  onCancel: () => void;
}

const STEP_KEYS: Readonly<Record<string, AttributeStep>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'prev-section',
  ArrowRight: 'next-section',
};

const ProfileDisplayGrip: React.FC<ProfileDisplayGripProps> = ({
  label,
  lifted,
  disabled = false,
  describedBy,
  onPointerDown,
  onLift,
  onStep,
  onDrop,
  onCancel,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lifted) buttonRef.current?.focus();
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (lifted) onDrop();
      else onLift();
      return;
    }
    if (!lifted) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }
    const step = STEP_KEYS[event.key];
    if (!step) return;
    event.preventDefault();
    onStep(step);
  };

  return (
    <IconButton
      size="sm"
      variant="subtle"
      label={`Reorder ${label}`}
      title={disabled ? 'Clear the filter to reorder' : `Reorder ${label}`}
      active={lifted}
      disabled={disabled}
      describedBy={describedBy}
      buttonRef={buttonRef}
      onPointerDown={disabled ? undefined : onPointerDown}
      onKeyDown={handleKeyDown}
      className="cursor-grab touch-none"
    >
      <Icon type="grip" size="sm" />
    </IconButton>
  );
};

export default ProfileDisplayGrip;
