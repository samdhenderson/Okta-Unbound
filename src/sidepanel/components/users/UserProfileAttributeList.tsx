import React from 'react';
import { Badge } from '../shared';
import ProfileEditCell from './ProfileEditCell';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';
import type { AttributeEditCell } from '../../hooks/useProfileEdit';

export type ProfileAttributeLayout = ProfileDisplayConfig['layout'];

export interface UserProfileAttributeListProps {
  attributes: readonly AttributeDescriptor[];
  layout: ProfileAttributeLayout;
  showApiNames: boolean;
  showRuleChips: boolean;
  ruleReads: Record<string, string[]>;
  cells?: Readonly<Record<string, AttributeEditCell>>;
}

const listClasses: Record<ProfileAttributeLayout, string> = {
  rows: 'space-y-2',
  compact: 'space-y-1',
  grid: 'grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2',
};

const fieldClasses: Record<ProfileAttributeLayout, string> = {
  rows: 'flex gap-3',
  compact: 'flex gap-2',
  grid: 'rounded-md bg-canvas p-2',
};

const labelClasses: Record<ProfileAttributeLayout, string> = {
  rows: 'w-28 shrink-0',
  compact: 'w-24 shrink-0',
  grid: 'block mb-1',
};

const valueClasses: Record<ProfileAttributeLayout, string> = {
  rows: 'min-w-0 flex-1 flex flex-wrap items-center gap-2',
  compact: 'min-w-0 flex-1 flex flex-wrap items-center gap-2',
  grid: 'flex flex-wrap items-center gap-2',
};

const LABEL_TYPE = 'text-xs font-medium text-neutral-600';

const VALUE_TYPE = 'min-w-0 break-words text-pretty text-sm font-medium text-neutral-900';

function ruleChipLabel(count: number): string {
  return count === 1 ? '1 rule' : `${count} rules`;
}

const UserProfileAttributeList: React.FC<UserProfileAttributeListProps> = ({
  attributes,
  layout,
  showApiNames,
  showRuleChips,
  ruleReads,
  cells,
}) => (
  <dl className={listClasses[layout]}>
    {attributes.map((attribute) => {
      const readers = ruleReads[attribute.name];
      const chip = showRuleChips && readers && readers.length > 0 ? readers : undefined;
      const cell = cells?.[attribute.name];

      return (
        <div key={attribute.key} className={fieldClasses[layout]}>
          <dt
            className={`${labelClasses[layout]} ${LABEL_TYPE} ${
              showApiNames ? 'font-mono break-words' : ''
            }`}
          >
            {showApiNames ? attribute.name : attribute.label}
          </dt>
          <dd className={valueClasses[layout]}>
            {cell ? (
              <div className="w-full min-w-0">
                <ProfileEditCell
                  attribute={attribute}
                  editability={cell.editability}
                  draft={cell.draft}
                  editing
                  onChange={cell.onChange}
                  invalid={cell.invalid}
                  mono={attribute.mono}
                />
              </div>
            ) : attribute.isEmpty ? (
              <span className="text-sm text-neutral-400" title="No value">
                —
              </span>
            ) : (
              <span className={`${VALUE_TYPE} ${attribute.mono ? 'font-mono' : ''}`}>
                {attribute.value}
              </span>
            )}
            {chip && (
              <Badge variant="primary" title={`Read by: ${chip.join(', ')}`}>
                {ruleChipLabel(chip.length)}
              </Badge>
            )}
          </dd>
        </div>
      );
    })}
  </dl>
);

export default UserProfileAttributeList;
