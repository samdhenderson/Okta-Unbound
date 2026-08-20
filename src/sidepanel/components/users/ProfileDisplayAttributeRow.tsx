import React from 'react';
import { Badge, Checkbox, IconButton, Select } from '../shared';
import Icon from '../overview/shared/Icon';
import type { AttributeDescriptor, AttributeKind } from './profileAttributes';

export interface AttributeCategoryOption {
  value: string;
  label: string;
}

export interface ProfileDisplayAttributeRowProps {
  attribute: AttributeDescriptor;
  categoryKey: string;
  categoryOptions: AttributeCategoryOption[];
  isHidden: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  ruleNames: string[];
  onToggleVisible: (name: string, visible: boolean) => void;
  onAssign: (name: string, categoryKey: string) => void;
  onMove: (name: string, direction: -1 | 1) => void;
}

const kindLabels: Record<AttributeKind, string> = {
  base: 'Base',
  custom: 'Custom',
  system: 'System',
};

const ProfileDisplayAttributeRow: React.FC<ProfileDisplayAttributeRowProps> = ({
  attribute,
  categoryKey,
  categoryOptions,
  isHidden,
  canMoveUp,
  canMoveDown,
  ruleNames,
  onToggleVisible,
  onAssign,
  onMove,
}) => (
  <div className={`flex min-w-0 items-center gap-2 px-3 py-2 ${isHidden ? 'opacity-50' : ''}`}>
    <Checkbox
      checked={!isHidden}
      onChange={(visible) => onToggleVisible(attribute.name, visible)}
      aria-label={`Show ${attribute.name}`}
    />

    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className="truncate font-mono text-xs font-medium text-neutral-900"
          title={attribute.label}
        >
          {attribute.name}
        </span>
        <span className="shrink-0 text-xs text-neutral-500">{kindLabels[attribute.kind]}</span>
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

    <div className="w-28 shrink-0 sm:w-36">
      <Select
        value={categoryKey}
        onChange={(next) => onAssign(attribute.name, next)}
        options={categoryOptions}
        ariaLabel={`Category for ${attribute.name}`}
      />
    </div>

    <div className="flex shrink-0 flex-col">
      <IconButton
        size="sm"
        label={`Move ${attribute.name} up`}
        disabled={!canMoveUp}
        onClick={() => onMove(attribute.name, -1)}
      >
        <Icon type="chevron-right" size="xs" className="-rotate-90" />
      </IconButton>
      <IconButton
        size="sm"
        label={`Move ${attribute.name} down`}
        disabled={!canMoveDown}
        onClick={() => onMove(attribute.name, 1)}
      >
        <Icon type="chevron-right" size="xs" className="rotate-90" />
      </IconButton>
    </div>
  </div>
);

export default ProfileDisplayAttributeRow;
