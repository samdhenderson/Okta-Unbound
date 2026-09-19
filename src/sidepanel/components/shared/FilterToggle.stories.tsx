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
          'the list below stays visible. The badge is hidden at zero.\n\n' +
          'It is icon-only: the funnel says "filters", so the word beside it said it twice ' +
          'and spent width the `flex-1` search field next to it needs at 360px. The name ' +
          'reaches assistive tech through `aria-label` (`Filters`, `Filters, 2 applied`), ' +
          'and because a wash alone may not carry state, the native `title` says which way ' +
          'the press goes — `Show filters` or `Hide filters`. The box is a fixed square ' +
          'sized from that field (38px beside an `Input size="md"`, 46px beside `lg`) and ' +
          'the badge sits in its corner, out of flow — so applying a filter can neither ' +
          'widen the button into the field beside it nor pull the glyph off centre.',
      },
    },
  },
  argTypes: {
    open: { description: 'Whether the filter panel is expanded.' },
    activeCount: { description: 'Number of filters applied. The badge is hidden at 0.' },
    onToggle: { description: 'Toggles the filter panel open/closed.' },
    size: { description: 'Vertical scale, matching the `Input` it stands beside.' },
    label: { description: 'Accessible name; not rendered as text. Defaults to `Filters`.' },
    title: {
      description: 'Native tooltip. Defaults to `Show filters` / `Hide filters` from `open`.',
    },
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Filters' });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await expect(canvas.queryByText('Filters')).not.toBeInTheDocument();
    await expect(canvas.queryByText('1')).not.toBeInTheDocument();

    await expect(toggle.children).toHaveLength(1);
    await expect(toggle.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  },
};

export const Open: Story = {
  args: { open: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Filters' });
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};

export const WithActiveCount: Story = {
  args: { activeCount: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Filters, 4 applied' });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
  },
};

export const OpenWithActiveCount: Story = {
  args: { open: true, activeCount: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Filters, 2 applied' });
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-start gap-4">
      <FilterToggle {...args} size="md" label="Filters (md)" />
      <FilterToggle {...args} size="lg" label="Filters (lg)" />
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox', { name: 'Search groups' })).toBeInTheDocument();
    const toggle = canvas.getByRole('button', { name: 'Filters, 1 applied' });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
  },
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
    const toggle = canvas.getByRole('button', { name: 'Filters, 2 applied' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('title', 'Show filters');

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
    await expect(canvas.getByText(/Status: Active/)).toBeInTheDocument();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('title', 'Show filters');
    await expect(canvas.queryByText(/Status: Active/)).not.toBeInTheDocument();
  },
};
