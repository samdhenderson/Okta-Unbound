import React from 'react';
import Input from '../shared/Input';
import { IconButton } from '../shared';
import Icon from '../shared/Icon';

interface MemberSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MemberSearchBar: React.FC<MemberSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search members by name, email, or login…',
}) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      type="search"
      placeholder={placeholder}
      icon={<Icon type="search" size="sm" />}
      trailingInteractive={Boolean(value)}
      trailing={
        value ? (
          <IconButton label="Clear search" onClick={() => onChange('')} variant="ghost" size="sm">
            <Icon type="close" size="sm" />
          </IconButton>
        ) : undefined
      }
    />
  );
};

export default MemberSearchBar;
