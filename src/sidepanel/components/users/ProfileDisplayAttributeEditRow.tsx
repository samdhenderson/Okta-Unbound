import React from 'react';
import { Badge, IconButton } from '../shared';
import Icon from '../shared/Icon';
import type { AttributeDescriptor } from './profileAttributes';
import ProfileDisplayGrip from './ProfileDisplayGrip';
import type { AttributeStep } from './profileDisplayOps';

export interface ProfileDisplayAttributeEditRowProps {
  attribute: AttributeDescriptor;
  isHidden: boolean;
  isLifted: boolean;
  ruleNames: readonly string[];
  isReorderDisabled?: boolean;
  gripDescribedBy?: string;
  onToggleHidden: () => void;
  onGripPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onLift: () => void;
  onStep: (direction: AttributeStep) => void;
  onDrop: () => void;
  onCancelLift: () => void;
}

const ProfileDisplayAttributeEditRow: React.FC<ProfileDisplayAttributeEditRowProps> = ({
  attribute,
  isHidden,
  isLifted,
  ruleNames,
  isReorderDisabled = false,
  gripDescribedBy,
  onToggleHidden,
  onGripPointerDown,
  onLift,
  onStep,
  onDrop,
  onCancelLift,
}) => (
  <div
    data-row={attribute.name}
    className={`flex min-w-0 items-center gap-(--sp-inline) rounded-md px-(--sp-row-x) py-(--sp-row-y) ${
      isLifted ? 'bg-primary-light' : ''
    }`}
  >
    <ProfileDisplayGrip
      label={attribute.label}
      lifted={isLifted}
      disabled={isReorderDisabled}
      describedBy={gripDescribedBy}
      onPointerDown={onGripPointerDown}
      onLift={onLift}
      onStep={onStep}
      onDrop={onDrop}
      onCancel={onCancelLift}
    />

    <div className={`min-w-0 flex-1 ${isHidden ? 'opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`truncate text-xs font-medium text-neutral-900 ${isHidden ? 'line-through' : ''}`}
        >
          {attribute.label}
        </span>
        <span className="shrink-0 truncate font-mono text-xs text-neutral-500">
          {attribute.name}
        </span>
        {ruleNames.length > 0 && (
          <Badge variant="primary" className="shrink-0" title={`Read by ${ruleNames.join(', ')}`}>
            rules
          </Badge>
        )}
      </div>
      <div className={`truncate text-xs text-neutral-500 ${attribute.isEmpty ? 'italic' : ''}`}>
        {attribute.isEmpty ? 'empty on this user' : attribute.value}
      </div>
    </div>

    <IconButton
      size="sm"
      variant="subtle"
      label={isHidden ? `Show ${attribute.label}` : `Hide ${attribute.label}`}
      active={isHidden}
      onClick={onToggleHidden}
    >
      <Icon type={isHidden ? 'eye-off' : 'eye'} size="sm" />
    </IconButton>
  </div>
);

export default ProfileDisplayAttributeEditRow;
