import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import Checkbox from './Checkbox';

const meta = {
  title: 'Shared/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled checkbox primitive. With no `label` it emits a bare styled `<input>` so ' +
          'the caller owns layout — supply `aria-label` in that case; with a `label` it wraps ' +
          'the box in a clickable `<label>` plus optional helper text.',
      },
    },
  },
  argTypes: {
    checked: { description: 'Controlled checked state.' },
    onChange: { description: 'Called with the new checked value on toggle.' },
    label: {
      description:
        'Visible label. When omitted, pass `aria-label` so the control has an accessible name.',
    },
    description: { description: 'Secondary helper text rendered beneath the label.' },
    disabled: { description: 'Disables the control and dims it.' },
    className: {
      description:
        'Extra classes for the wrapping `<label>` (when labeled) or the `<input>` (when bare).',
    },
  },
  args: {
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Bare checkbox',
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    'aria-label': 'Bare checkbox',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Include deprovisioned users',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Include deprovisioned users',
    description: 'Also match users whose Okta status is DEPROVISIONED',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Unavailable option',
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Locked option',
    description: 'This option cannot be changed',
  },
};

const ControlledCheckbox = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Checkbox
        checked={checked}
        onChange={setChecked}
        label="Toggle me"
        description="Click to see state change"
      />
      <p className="text-xs text-neutral-600">Current state: {checked ? 'checked' : 'unchecked'}</p>
    </div>
  );
};

export const ControlledDemo: Story = {
  render: () => <ControlledCheckbox />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: /Toggle me/ });

    await expect(box).not.toBeChecked();
    await userEvent.click(canvas.getByText('Toggle me'));
    await expect(box).toBeChecked();
    await expect(canvas.getByText('Current state: checked')).toBeInTheDocument();

    await userEvent.click(box);
    await expect(box).not.toBeChecked();
  },
};
