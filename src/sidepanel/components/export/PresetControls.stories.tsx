import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import PresetControls from './PresetControls';
import type { ExportPreset } from '../../../shared/storage/presetStore';

const presets: ExportPreset[] = [
  {
    id: 'p-1',
    entityId: 'users',
    name: 'Offboarding audit',
    enabledColumnIds: ['id', 'status', 'email'],
    createdAt: new Date('2026-01-01T00:00:00Z'),
    version: 1,
  },
  {
    id: 'p-2',
    entityId: 'users',
    name: 'Full profile',
    enabledColumnIds: ['id', 'email', 'firstName', 'lastName', 'department'],
    filterText: 'status eq "ACTIVE"',
    createdAt: new Date('2026-02-01T00:00:00Z'),
    version: 1,
  },
];

const meta = {
  title: 'Export/PresetControls',
  component: PresetControls,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Apply a saved column selection, save the current one under a name, or delete the ' +
          'applied preset. Persistence is owned by the tab hook: the only state this component ' +
          'holds is the name being typed.',
      },
    },
  },
  argTypes: {
    presets: { description: 'Saved presets for the active entity, newest first.' },
    activePresetId: { description: 'Id of the currently applied preset, or `null`.' },
    onApply: { description: 'Apply a saved preset by id.' },
    onSave: { description: 'Save the current selection under a name.' },
    onDelete: { description: 'Delete a saved preset by id.' },
    canSave: { description: 'Whether saving is allowed (e.g. at least one column enabled).' },
  },
  args: {
    presets,
    activePresetId: null,
    onApply: fn(),
    onSave: fn(),
    onDelete: fn(),
    canSave: true,
  },
} satisfies Meta<typeof PresetControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PresetApplied: Story = {
  args: { activePresetId: 'p-1' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Delete/ }));
    await expect(args.onDelete).toHaveBeenCalledWith('p-1');
  },
};

export const Empty: Story = {
  args: { presets: [] },
};

export const CannotSave: Story = {
  args: { canSave: false },
};

export const SavingAPreset: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save' });
    await expect(save).toBeDisabled();

    await userEvent.type(canvas.getByLabelText('Preset name'), 'Contractors');
    await expect(save).toBeEnabled();

    await userEvent.click(save);
    await expect(args.onSave).toHaveBeenCalledWith('Contractors');
  },
};

export const ApplyingAPreset: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText('Apply a saved preset'), 'p-2');
    await expect(args.onApply).toHaveBeenCalledWith('p-2');
  },
};
