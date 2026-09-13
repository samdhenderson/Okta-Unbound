import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import FilterToggle from './FilterToggle';
import Input from './Input';

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
          'active filters. It takes the active wash both when the panel is expanded and ' +
          'when any filter is applied with the panel closed, so a hidden filter shortening ' +
          'the list below stays visible. The badge is hidden at zero.',
      },
    },
  },
  argTypes: {
    open: { description: 'Whether the filter panel is expanded.' },
    activeCount: { description: 'Number of filters applied. The badge is hidden at 0.' },
    onToggle: { description: 'Toggles the filter panel open/closed.' },
    size: { description: 'Vertical scale, matching the `Input` it stands beside.' },
    label: { description: 'Visible label. Defaults to `Filters`.' },
    title: { description: 'Native tooltip. Defaults to `Toggle filters`.' },
    controls: {
      description:
        'Id of the disclosed region; supplying it swaps `aria-pressed` for `aria-expanded`.',
    },
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
  render: (args) => {
    const SearchRow = () => {
      const [query, setQuery] = useState('');
      return (
        <div className="flex w-[420px] items-start gap-2">
          <Input
            type="search"
            size="lg"
            value={query}
            onChange={setQuery}
            ariaLabel="Search groups"
            placeholder="Search…"
          />
          <FilterToggle {...args} size="lg" />
        </div>
      );
    };
    return <SearchRow />;
  },
  args: { activeCount: 1 },
};

const FilterDisclosure = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[320px]">
      <FilterToggle
        open={open}
        activeCount={2}
        onToggle={() => setOpen((v) => !v)}
        controls="filter-panel"
      />
      {open && (
        <div id="filter-panel" className="mt-2 rounded-md border border-neutral-200 p-3 text-sm">
          Status: Active · Type: Okta group
        </div>
      )}
    </div>
  );
};

export const DisclosesAPanel: Story = {
  render: () => <FilterDisclosure />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /filters/i });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Status: Active/)).toBeInTheDocument();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/Status: Active/)).not.toBeInTheDocument();
  },
};
