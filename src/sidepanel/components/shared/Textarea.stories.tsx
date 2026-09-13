import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import Textarea from './Textarea';

const meta = {
  title: 'Shared/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled multi-line text field with label, hint, and error state; vertically ' +
          'resizable. The multi-line sibling of `Input`: `onChange` receives the string ' +
          'value, not the event, and when `error` is set the message replaces the hint. ' +
          'Prefer this over a raw `<textarea>`.',
      },
    },
  },
  argTypes: {
    value: { description: 'Controlled value.' },
    onChange: { description: 'Called with the new string value on each change.' },
    placeholder: { description: 'Placeholder text shown when empty.' },
    disabled: { description: 'Disables the field.' },
    error: { description: 'Error message; when set, applies danger styling and hides `hint`.' },
    label: { description: 'Optional label rendered above the field.' },
    hint: { description: 'Helper text below the field, shown only when there is no `error`.' },
    rows: { description: 'Visible row count. Defaults to `4`.' },
    fullWidth: { description: 'Stretch to fill the container width. Defaults to `true`.' },
    className: { description: 'Extra classes merged onto the outer container.' },
  },
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Enter text here...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Notes',
    hint: 'Add any relevant notes here',
    placeholder: 'Type your notes...',
  },
};

export const ErrorState: Story = {
  args: {
    value: 'Some invalid input',
    label: 'Notes',
    error: 'This field contains invalid characters',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Notes',
    value: 'This field is disabled',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Description',
    rows: 8,
    placeholder: 'Enter a longer description...',
  },
};

export const ConstrainedWidth: Story = {
  args: {
    label: 'Comment',
    fullWidth: false,
    placeholder: 'Type a comment...',
  },
};

const ControlledTextarea = () => {
  const [value, setValue] = useState('');
  return (
    <div className="w-[360px] space-y-2">
      <Textarea
        label="Notes"
        hint="Saved with the group"
        value={value}
        onChange={setValue}
        placeholder="Type your notes..."
      />
      <p className="text-xs text-neutral-600">{value.length} characters</p>
    </div>
  );
};

export const Typing: Story = {
  render: () => <ControlledTextarea />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox');

    await userEvent.type(field, 'Owned by Platform');

    await expect(field).toHaveValue('Owned by Platform');
    await expect(canvas.getByText('17 characters')).toBeInTheDocument();
  },
};
