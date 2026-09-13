import React, { useState } from 'react';
import { ActionBar, Button, Input, Modal, type ActionDescriptor } from '../shared';
import Icon from '../shared/Icon';
import { pluralize, type NounForms } from '../../../shared/utils/plural';

const ENTITY: NounForms = { one: 'entity', other: 'entities' };

export interface SelectionActionBarProps {
  total: number;
  hasCollections: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSaveCollection: () => void;
  onClearAll: () => void;
  sticky?: boolean;
}

const SelectionActionBar: React.FC<SelectionActionBarProps> = ({
  total,
  hasCollections,
  query,
  onQueryChange,
  onSaveCollection,
  onClearAll,
  sticky = true,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (total === 0 && !hasCollections) return null;

  const actions: ActionDescriptor[] =
    total > 0
      ? [
          {
            id: 'save-collection',
            label: 'Save as collection',
            icon: 'plus',
            variant: 'primary',
            priority: 'pinned',
            onClick: onSaveCollection,
            title: 'Name this selection and keep it',
            testId: 'save-collection',
          },
        ]
      : [];

  return (
    <ActionBar
      ariaLabel="Actions for the selection basket"
      sticky={sticky}
      actions={actions}
      testId="selection-action-bar"
      subRow={
        <Input
          type="search"
          value={query}
          onChange={onQueryChange}
          placeholder="Search what you've picked, and what you've saved..."
          size="lg"
          icon={<Icon type="search" size="md" />}
          ariaLabel="Search the selection and saved collections"
        />
      }
      expansion={
        total > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-(--sp-field)">
              <span className="text-xs text-danger-text">
                Empties every partition. There is no undo.
              </span>
              <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmOpen(true)}>
                Clear all
              </Button>
            </div>
            <Modal
              isOpen={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              title="Clear all selected entities?"
              size="sm"
              footer={
                <>
                  <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      onClearAll();
                      setConfirmOpen(false);
                    }}
                  >
                    Clear all
                  </Button>
                </>
              }
            >
              <p className="text-sm text-neutral-700">
                Clear all {pluralize(total, ENTITY)}? This cannot be undone.
              </p>
            </Modal>
          </>
        ) : undefined
      }
    />
  );
};

export default SelectionActionBar;
