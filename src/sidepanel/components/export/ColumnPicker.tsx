import React from 'react';
import { CollapsibleSection, Eyebrow, FilterPill } from '../shared';
import type { ColumnGroup, ExportColumn } from '../../export/types';

interface ColumnPickerProps {
  catalog: ExportColumn<unknown>[];
  enabled: Set<string>;
  onToggle: (id: string) => void;
}

const GROUP_ORDER: { key: ColumnGroup; label: string }[] = [
  { key: 'base', label: 'Identity' },
  { key: 'profile', label: 'Profile' },
  { key: 'custom', label: 'Custom' },
];

const ColumnPicker: React.FC<ColumnPickerProps> = ({ catalog, enabled, onToggle }) => {
  return (
    <CollapsibleSection title="Columns" defaultOpen itemCount={enabled.size}>
      <div className="space-y-(--sp-field)">
        {GROUP_ORDER.map(({ key, label }) => {
          const columns = catalog.filter((column) => column.group === key);
          if (columns.length === 0) return null;
          return (
            <div key={key} className="space-y-2">
              <Eyebrow>{label}</Eyebrow>
              <div className="flex flex-wrap gap-(--sp-inline)">
                {columns.map((column) => (
                  <FilterPill
                    key={column.id}
                    active={enabled.has(column.id)}
                    onClick={() => onToggle(column.id)}
                    title={column.description}
                  >
                    {column.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
};

export default ColumnPicker;
