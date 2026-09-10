import React from 'react';
import { Checkbox, Eyebrow, FilterPill } from '../shared';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';

export interface ProfileDisplayOptionsProps {
  attributes: readonly AttributeDescriptor[];
  config: ProfileDisplayConfig;
  onLayoutChange: (layout: ProfileDisplayConfig['layout']) => void;
  onShowApiNamesChange: (showApiNames: boolean) => void;
  onShowRuleChipsChange: (showRuleChips: boolean) => void;
  onShowEmptyChange: (showEmpty: boolean) => void;
}

const LAYOUT_OPTIONS: ReadonlyArray<{ value: ProfileDisplayConfig['layout']; label: string }> = [
  { value: 'rows', label: 'Label + value rows' },
  { value: 'compact', label: 'Compact rows' },
  { value: 'grid', label: 'Two-column cards' },
];

const ProfileDisplayOptions: React.FC<ProfileDisplayOptionsProps> = ({
  attributes,
  config,
  onLayoutChange,
  onShowApiNamesChange,
  onShowRuleChipsChange,
  onShowEmptyChange,
}) => {
  const emptyCount = attributes.filter((attribute) => attribute.isEmpty).length;

  return (
    <section className="flex flex-col gap-2">
      <Eyebrow as="h3">Layout</Eyebrow>
      <div className="flex flex-wrap gap-(--sp-inline)" role="group" aria-label="Layout">
        {LAYOUT_OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            active={config.layout === option.value}
            onClick={() => onLayoutChange(option.value)}
          >
            {option.label}
          </FilterPill>
        ))}
      </div>

      <div className="mt-1 flex flex-col gap-(--sp-field)">
        <Checkbox
          checked={config.showApiNames}
          onChange={onShowApiNamesChange}
          label="Show Okta attribute names"
          description={
            <>
              Renders <span className="font-mono">department</span> instead of Department.
            </>
          }
        />
        <Checkbox
          checked={config.showRuleChips}
          onChange={onShowRuleChipsChange}
          label="Mark attributes read by rules"
          description="Flags each attribute a group rule reads to decide membership."
        />
        <Checkbox
          checked={config.showEmpty}
          onChange={onShowEmptyChange}
          label="Show attributes with no value"
          description={`${emptyCount} of ${attributes.length} ${
            attributes.length === 1 ? 'attribute is' : 'attributes are'
          } empty on this user.`}
        />
      </div>
    </section>
  );
};

export default ProfileDisplayOptions;
