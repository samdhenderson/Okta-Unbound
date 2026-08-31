import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import FilterToggle from './FilterToggle';

const meta = {
  title: 'Shared/FilterToggle',
  component: FilterToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Opens and closes a filter panel and carries a count badge of the currently ' +
          'active filters.\n\n' +
          'It takes on the active wash both when the panel is expanded **and** when any ' +
          'filter is applied with the panel closed — that second state is the one where a ' +
          'hidden filter is silently shortening the list beneath it, so it is the one that ' +
          'most needs to be visible.\n\n' +
          'The badge is hidden at zero: a `0` badge and an absent badge say the same thing, ' +
          'and only one of them is quiet.',
      },
    },
  },
  argTypes: {
    open: {
      description: 'Whether the filter panel is expanded. Drives the wash and `aria-pressed`.',
    },
    activeCount: { description: 'Number of filters applied. The badge is hidden at 0.' },
    onToggle: { description: 'Toggles the filter panel open/closed.' },
    size: { description: 'Vertical scale, named to match the `Input` it stands beside.' },
    label: { description: 'Visible label. Defaults to `Filters`.' },
  },
  args: {
    open: false,
    activeCount: 0,
    onToggle: fn(),
  },
} satisfies Meta<typeof FilterToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  args: { open: true },
};

export const WithActiveCount: Story = {
  args: { activeCount: 4 },
};

export const OpenWithActiveCount: Story = {
  args: { open: true, activeCount: 2 },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-start gap-4">
      <FilterToggle {...args} size="md" />
      <FilterToggle {...args} size="lg" />
    </div>
  ),
  args: { activeCount: 2 },
};

export const BesideASearchField: Story = {
  render: (args) => (
    <div className="flex w-[420px] gap-2">
      <input
        type="search"
        placeholder="Search…"
        className="min-w-0 flex-1 rounded-md border border-neutral-200 px-4 py-3 text-sm"
      />
      <FilterToggle {...args} size="lg" />
    </div>
  ),
  args: { activeCount: 1 },
};
