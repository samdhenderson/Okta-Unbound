import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
          "The Profile pane's top strip, extracted when the pane became editable — the pane was already " +
          'at the ~300-line ceiling and the strip had grown from "a summary line and a gear" into a mode ' +
          'switch with three states.\n\n' +
          'The summary sentence is constant; the cluster beside it names the mode. Read mode is **Edit** ' +
          '(when anything is editable) plus the gear; value-edit mode is **Cancel + Save** with a dirty ' +
          'count; customize mode is a single `Customizing display` badge.\n\n' +
          '**The Edit button is absent, not disabled, when a profile has nothing editable.** A disabled ' +
          'Edit on a profile entirely mastered by Active Directory invites the reader to hunt for the ' +
          'reason it will not press — and the per-attribute lock reasons, which only appear in edit mode, ' +
          'would have nothing to explain.\n\n' +
          '**The gear is absent, not disabled, mid-draft** — the same argument extended. Pressing it during ' +
          'a value edit would switch modes and silently discard the draft. It is absent again while ' +
          'customizing, where the verbs that matter (Reset to default, Cancel, Done) belong to the editor ' +
          'that owns the draft and render in its own footer.\n\n' +
          'Save refuses an edit with no changes and an edit with an invalid value, so the status line ' +
          'beside it always says why: how many attributes would be written, that there is nothing to ' +
          'write yet, or that a value needs fixing first. A disabled button that does not say why is a ' +
          'dead end.\n\n' +
          '**Related internals:** [Components](?path=/docs/internals-components--docs)',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeEnabled();
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
