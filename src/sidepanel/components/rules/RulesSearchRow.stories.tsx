import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RulesSearchRow from './RulesSearchRow';

const sampleRules = [
  'Engineering — all ICs',
  'Engineering Managers',
  'Contractors — EMEA',
  'Sales — AMER',
];

const meta = {
  title: 'Rules/RulesSearchRow',
  component: RulesSearchRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Rules rung's search field beside its filter disclosure — the node the action " +
          'strip renders in its `subRow`, so the field docks with the verbs and stays reachable ' +
          'at any scroll offset. Fully controlled: the query and the panel state belong to the ' +
          'rung, and the count on the toggle is the only trace of an applied filter once the ' +
          'panel below is closed.',
      },
    },
  },
  argTypes: {
    searchQuery: { description: 'Current search text.' },
    onSearchChange: { description: 'Called with the full next query on each keystroke.' },
    filtersOpen: { description: 'Whether the filter panel below the band is open.' },
    onToggleFilters: { description: 'Toggles that panel.' },
    activeFilterCount: {
      description: 'Number of filters applied; the toggle badge is hidden at 0.',
    },
  },
  args: {
    searchQuery: '',
    onSearchChange: fn(),
    filtersOpen: false,
    onToggleFilters: fn(),
    activeFilterCount: 0,
  },
} satisfies Meta<typeof RulesSearchRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'Engineering' },
};

export const FiltersOpen: Story = {
  args: { filtersOpen: true },
};

export const FiltersApplied: Story = {
  args: { activeFilterCount: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Filters, 2 applied' })).toBeInTheDocument();
  },
};

export const Interactive: Story = {
  render: (args) => {
    const Harness = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [filtersOpen, setFiltersOpen] = useState(false);

      const visible = sampleRules.filter((name) =>
        name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );

      return (
        <div className="space-y-(--sp-field)">
          <RulesSearchRow
            {...args}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((previous) => !previous)}
          />
          <ul aria-label="Rules" className="space-y-1 text-sm text-neutral-700">
            {visible.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Rules' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);

    await userEvent.type(canvas.getByPlaceholderText(/Search rules/i), 'engineering');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    const toggle = canvas.getByRole('button', { name: 'Filters' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};
