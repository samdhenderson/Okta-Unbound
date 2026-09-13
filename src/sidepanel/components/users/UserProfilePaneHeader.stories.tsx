import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserProfilePaneHeader, {
  type ProfileDisplayCustomizeControls,
  type ProfileEditControls,
} from './UserProfilePaneHeader';

const controls: ProfileEditControls = {
  canEdit: true,
  isEditing: false,
  changeCount: 0,
  hasInvalid: false,
  onBeginEdit: fn(),
  onCancelEdit: fn(),
  onSave: fn(),
};

const customize: ProfileDisplayCustomizeControls = {
  isCustomizing: false,
  onBegin: fn(),
  onCommit: fn(),
  onCancel: fn(),
};

const meta = {
  title: 'Users/UserProfilePaneHeader',
  component: UserProfilePaneHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Profile pane's top strip: a constant summary sentence, and beside it a cluster that names the mode — **Edit** plus the gear in read mode, **Cancel + Save** with a dirty count in value-edit mode, a `Customizing display` badge in customize mode.\n\n" +
          'A verb that cannot act is **absent, not disabled**: no Edit when nothing is editable, no gear mid-draft or while customizing. Save refuses an empty or invalid edit, and the line beside it always says why.',
      },
    },
  },
  argTypes: {
    shown: { description: 'How many attributes the filter and configuration leave on screen.' },
    total: { description: 'How many distinct attributes the profile has in total.' },
    ruleReadCount: { description: 'How many of the shown attributes a granting rule reads.' },
    customize: {
      description: 'The display-customization mode flag and verbs. Absent renders no gear at all.',
    },
    edit: { description: 'The edit verbs; absent on a surface that does not offer editing.' },
  },
  args: {
    shown: 12,
    total: 21,
    ruleReadCount: 2,
    customize,
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas p-4">
        <div className="rounded-md border border-neutral-200 bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof UserProfilePaneHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure attribute display' }),
    ).toBeInTheDocument();
  },
};

export const NothingEditable: Story = {
  args: { edit: { ...controls, canEdit: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  },
};

export const Editable: Story = {
  args: { edit: controls },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const edit = canvas.getByRole('button', { name: 'Edit' });
    await expect(edit).toBeEnabled();

    await userEvent.click(edit);
    await expect(args.edit?.onBeginEdit).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole('button', { name: 'Configure attribute display' }));
    await expect(args.customize?.onBegin).toHaveBeenCalledTimes(1);
  },
};

export const EditingClean: Story = {
  args: { edit: { ...controls, isEditing: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(canvas.getByText('No changes yet')).toBeInTheDocument();
  },
};

export const EditingDirty: Story = {
  args: { edit: { ...controls, isEditing: true, changeCount: 2 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2 changes')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();
  },
};

export const EditingOneChange: Story = {
  args: { edit: { ...controls, isEditing: true, changeCount: 1 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 change')).toBeInTheDocument();
  },
};

export const EditingInvalid: Story = {
  args: { edit: { ...controls, isEditing: true, changeCount: 2, hasInvalid: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled();
    await expect(canvas.getByText('Fix the highlighted values')).toBeInTheDocument();
  },
};

export const Customizing: Story = {
  args: { edit: controls, customize: { ...customize, isCustomizing: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Customizing display')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Configure attribute display' }),
    ).not.toBeInTheDocument();
  },
};

export const NoCustomization: Story = {
  args: { customize: undefined, edit: controls },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('button', { name: 'Configure attribute display' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeEnabled();
  },
};

export const Narrow: Story = {
  args: { edit: { ...controls, isEditing: true, changeCount: 2 } },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
