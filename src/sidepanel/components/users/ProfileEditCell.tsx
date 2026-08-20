import React from 'react';
import { Checkbox, Input, Select } from '../shared';
import Icon from '../overview/shared/Icon';
import type { AttributeDescriptor } from './profileAttributes';
import type { AttributeEditability, EditOption } from './profileEditability';

export interface ProfileEditCellProps {
  attribute: AttributeDescriptor;
  editability: AttributeEditability;
  draft?: string;
  editing?: boolean;
  onChange?: (value: string) => void;
  invalid?: string;
  mono?: boolean;
}

const VALUE_TYPE = 'min-w-0 break-words text-pretty text-sm font-medium text-neutral-900';

const EmptyValue: React.FC = () => (
  <span className="text-sm text-neutral-400" title="No value">
    —
  </span>
);

function optionsWithCurrent(options: readonly EditOption[], value: string): EditOption[] {
  if (options.some((option) => option.value === value)) return [...options];
  return value === ''
    ? [{ value: '', label: '—' }, ...options]
    : [...options, { value, label: value }];
}

const ProfileEditCell: React.FC<ProfileEditCellProps> = ({
  attribute,
  editability,
  draft,
  editing,
  onChange,
  invalid,
  mono = false,
}) => {
  const value = draft ?? attribute.value;

  const isEditing = editing ?? onChange !== undefined;

  const savedValue =
    attribute.value === '' ? (
      <EmptyValue />
    ) : (
      <span className={`${VALUE_TYPE} ${mono ? 'font-mono' : ''}`}>{attribute.value}</span>
    );

  if (!isEditing) return savedValue;

  if (!editability.editable) {
    return (
      <div className="min-w-0 space-y-1">
        <div className="flex items-start gap-1.5 text-neutral-500">
          <Icon type="lock" size="xs" className="mt-1 shrink-0" />
          <span className="sr-only">Locked:</span>
          {attribute.value === '' ? (
            <EmptyValue />
          ) : (
            <span className={`min-w-0 break-words text-pretty text-sm ${mono ? 'font-mono' : ''}`}>
              {attribute.value}
            </span>
          )}
        </div>
        <p className="text-pretty text-xs text-neutral-600">{editability.explanation}</p>
      </div>
    );
  }

  if (onChange === undefined) return savedValue;

  if (editability.control === 'checkbox') {
    return (
      <div className="min-w-0">
        <Checkbox
          checked={value === 'true'}
          onChange={(checked) => onChange(String(checked))}
          aria-label={attribute.label}
        />
        {invalid && <p className="mt-1 text-xs text-danger-text">{invalid}</p>}
      </div>
    );
  }

  if (editability.control === 'select') {
    return (
      <Select
        value={value}
        onChange={onChange}
        options={optionsWithCurrent(editability.options ?? [], value)}
        ariaLabel={attribute.label}
        error={invalid}
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={onChange}
      type={editability.control === 'number' ? 'number' : 'text'}
      size="sm"
      ariaLabel={attribute.label}
      error={invalid}
    />
  );
};

export default ProfileEditCell;
