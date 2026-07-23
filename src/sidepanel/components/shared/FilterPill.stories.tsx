import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import FilterPill from './FilterPill';

const meta = {
  title: 'Shared/FilterPill',
  component: FilterPill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Small two-state toggle pill for filter panels — solid primary when active, neutral outline when inactive.\n\n' +
          'Reflects its state as `aria-pressed` and supports a disabled (dimmed, non-interactive) state. For icon-only buttons use `IconButton`; for text CTAs use `Button`.',
      },
    },
  },
  argTypes: {
    active: {
      description: 'Toggle state; when true the pill is filled and `aria-pressed` is set.',
    },
    onClick: { description: 'Called when the pill is toggled.' },
    children: { description: 'Pill label content.' },
    title: { description: 'Native tooltip text for the pill.' },
    disabled: { description: 'When true the pill is dimmed and non-interactive.' },
    inactiveClassName: {
      description: 'Optional custom classes for the inactive state (e.g. semantic colors).',
    },
  },
  args: {
    children: 'Filter label',
    onClick: fn(),
  },
} satisfies Meta<typeof FilterPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { active: false },
};

export const Active: Story = {
  args: { active: true },
};

export const Disabled: Story = {
  args: { active: false, disabled: true },
};

export const DisabledActive: Story = {
  args: { active: true, disabled: true },
};

export const WithTitle: Story = {
  args: { active: false, title: 'Click to toggle filter' },
};

export const ActiveInactivePair: Story = {
  args: { active: false },
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <FilterPill {...args} active={false}>
        Inactive
      </FilterPill>
      <FilterPill {...args} active={true}>
        Active
      </FilterPill>
    </div>
  ),
};

export const Hover: Story = {
  args: { active: false },
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: { active: false },
  parameters: { pseudo: { focusVisible: true } },
};
