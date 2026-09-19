import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AppsToolbar from './AppsToolbar';
import { filterAndSortApps } from './appFilters';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

const meta = {
  title: 'Apps/AppsToolbar',
  component: AppsToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Applications rung's search field beside its filter disclosure — the node the " +
          'action strip renders in its `subRow`, so the field docks with the verbs and stays ' +
          'reachable at any scroll offset. The status, group-push and sort pills live in ' +
          '`AppsFilterPanel`, disclosed below the band by this row’s toggle.\n\n' +
          'Fully controlled: the query and the panel state belong to the rung, and the count ' +
          'on the toggle is the only trace of an applied filter once the panel is closed. The ' +
          'search box accepts a `/pattern/flags` regex query as well as a plain substring.',
      },
    },
  },
  argTypes: {
    searchQuery: { description: 'Current search text (`/pattern/flags` is treated as a regex).' },
    onSearchQueryChange: { description: 'Called with the new search text.' },
    filtersOpen: { description: 'Whether the filter panel below the band is open.' },
    onToggleFilters: { description: 'Toggles that panel.' },
    activeFilterCount: {
      description: 'Number of axes away from their default; the toggle badge is hidden at 0.',
    },
  },
  args: {
    searchQuery: '',
    onSearchQueryChange: fn(),
    filtersOpen: false,
    onToggleFilters: fn(),
    activeFilterCount: 0,
  },
} satisfies Meta<typeof AppsToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'sales' },
};

export const RegexQuery: Story = {
  args: { searchQuery: '/^okta_/i' },
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

const harnessApps = [
  { id: '0oaFAKE0001', label: 'Salesforce', status: 'ACTIVE', created: '2026-01-15T09:00:00.000Z' },
  {
    id: '0oaFAKE0002',
    label: 'Workday HR',
    status: 'INACTIVE',
    created: '2026-03-01T09:00:00.000Z',
  },
  { id: '0oaFAKE0003', label: 'Slack', status: 'ACTIVE', created: '2025-11-20T09:00:00.000Z' },
] as OktaAppListItem[];

export const Interactive: Story = {
  render: (args) => {
    const Harness = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [filtersOpen, setFiltersOpen] = useState(false);

      const visible = filterAndSortApps(harnessApps, {
        searchQuery,
        statusFilter: '',
        groupsFilter: '',
        sortBy: 'label',
        sortDesc: false,
      });

      return (
        <div className="space-y-(--sp-field)">
          <AppsToolbar
            {...args}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((previous) => !previous)}
          />
          <ul aria-label="Applications" className="space-y-1 text-sm text-neutral-700">
            {visible.map((app) => (
              <li key={app.id}>{app.label}</li>
            ))}
          </ul>
        </div>
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Applications' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    await userEvent.type(canvas.getByLabelText('Search applications'), 'sl');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Slack')).toBeInTheDocument();

    await userEvent.clear(canvas.getByLabelText('Search applications'));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);

    const toggle = canvas.getByRole('button', { name: 'Filters' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};
