import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import Checkbox from './Checkbox';

const meta = {
  title: 'Shared/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
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
