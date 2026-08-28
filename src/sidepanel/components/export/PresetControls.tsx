import React, { useState } from 'react';
import { CollapsibleSection, Select, Input, Button } from '../shared';
import type { ExportPreset } from '../../../shared/storage/presetStore';

interface PresetControlsProps {
  presets: ExportPreset[];
  activePresetId: string | null;
  onApply: (id: string) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  canSave: boolean;
}

const PresetControls: React.FC<PresetControlsProps> = ({
  presets,
  activePresetId,
  onApply,
  onSave,
  onDelete,
  canSave,
}) => {
  const [name, setName] = useState('');

  const options = [
    { value: '', label: 'Apply a preset…' },
    ...presets.map((preset) => ({ value: preset.id, label: preset.name })),
  ];

  const handleSave = () => {
    onSave(name);
    setName('');
  };

  return (
    <CollapsibleSection title="Presets" defaultOpen={presets.length > 0} itemCount={presets.length}>
      <div className="space-y-(--sp-field)">
        <div className="flex items-end gap-(--sp-field)">
          <div className="flex-1">
            <Select
              ariaLabel="Apply a saved preset"
              value={activePresetId ?? ''}
              onChange={(value) => value && onApply(value)}
              options={options}
              disabled={presets.length === 0}
            />
          </div>
          {activePresetId && (
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onClick={() => onDelete(activePresetId)}
              title="Delete the applied preset"
            >
              Delete
            </Button>
          )}
        </div>

        <div className="flex items-end gap-(--sp-field)">
          <div className="flex-1">
            <Input
              value={name}
              onChange={setName}
              ariaLabel="Preset name"
              placeholder="Name this selection"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim() && canSave) handleSave();
              }}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={!name.trim() || !canSave}
          >
            Save
          </Button>
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default PresetControls;
