import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
          'Controlled checkbox primitive — renders bare or with a label + description.\n\n' +
          'When no `label` is given it emits a bare styled `<input>` so the caller owns layout (in that case supply `aria-label`); with a `label` it wraps the box in a clickable `<label>` plus optional helper text. Supports checked, unchecked, and disabled states.',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
};
