import React from 'react';
import { ScrollableList, EmptyState } from '../shared';
import Icon from '../shared/Icon';
import type { EntityExport } from '../../export/types';

interface EntityPickerProps {
  descriptors: EntityExport[];
  onSelect: (id: string) => void;
}

const EntityPicker: React.FC<EntityPickerProps> = ({ descriptors, onSelect }) => {
  if (descriptors.length === 0) {
    return (
      <EmptyState
        icon="download"
        title="No exports available"
        description="Connect to an Okta org to see the entities you can export."
      />
    );
  }

  return (
    <ScrollableList fillAvailable={false}>
      {descriptors.map((descriptor) => (
        <div
          key={descriptor.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(descriptor.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(descriptor.id);
            }
          }}
          className="group flex items-start gap-4 bg-white rounded-md border border-neutral-200 p-5 cursor-pointer transition-all duration-(--dur-instant) hover:border-neutral-500 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary-light text-primary-text shrink-0">
            <Icon type={descriptor.icon} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-neutral-900 group-hover:text-primary-text transition-colors duration-(--dur-instant)">
              {descriptor.displayName}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-600">{descriptor.description}</p>
          </div>
        </div>
      ))}
    </ScrollableList>
  );
};

export default EntityPicker;
