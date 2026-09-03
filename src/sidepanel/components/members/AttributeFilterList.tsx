import React from 'react';
import { ListRow } from '../shared';
import Icon from '../shared/Icon';
import type { AttributeSummary } from './memberAnalytics';

export interface AttributeFilterListProps {
  attributes: AttributeSummary[];
  filteredKeys: ReadonlySet<string>;
  onSelect: (attributeKey: string) => void;
}

const AttributeFilterList: React.FC<AttributeFilterListProps> = ({
  attributes,
  filteredKeys,
  onSelect,
}) => {
  if (attributes.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        No profile attribute (department, title, location…) is populated for this group, so there is
        nothing to filter by.
      </p>
    );
  }

  return (
    <ul className="space-y-(--sp-inline)">
      {attributes.map((attribute) => {
        const active = filteredKeys.has(attribute.key);
        return (
          <li key={attribute.key}>
            <ListRow
              as="button"
              density="compact"
              state={active ? 'selected' : 'default'}
              onClick={() => onSelect(attribute.key)}
              ariaLabel={`${attribute.label}: choose a value to filter by`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-neutral-900">
                  {attribute.label}
                </span>
                <span className="flex flex-shrink-0 items-center gap-1.5">
                  <span className="text-xs tabular-nums text-neutral-600">
                    {attribute.distinct.toLocaleString()} value
                    {attribute.distinct === 1 ? '' : 's'}
                  </span>
                  <Icon type="chevron-right" size="xs" className="text-neutral-400" />
                </span>
              </span>
            </ListRow>
          </li>
        );
      })}
    </ul>
  );
};

export default AttributeFilterList;
