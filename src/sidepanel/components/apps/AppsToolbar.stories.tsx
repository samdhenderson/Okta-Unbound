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
          'Fully controlled: the tab shell owns the filter state, so the same values drive ' +
          'both this row and the filtered list. The search box accepts a `/pattern/flags` ' +
          'regex query as well as a plain substring.\n\n' +
          '`Pushes nothing` means Group Push is enabled on the app and the org snapshot holds ' +
          'no group assignment for it — the snapshot only walks the groups endpoint for ' +
          '`GROUP_PUSH` apps, so a wider reading would report the whole inventory as unassigned.',
      },
    },
  },
  argTypes: {
    searchQuery: { description: 'Current search text (`/pattern/flags` is treated as a regex).' },
    onSearchQueryChange: { description: 'Called with the new search text.' },
    statusFilter: { description: "Selected status bucket (`''` = all)." },
    onStatusFilterChange: { description: 'Called with the newly selected status bucket.' },
    groupsFilter: { description: "Selected group-push bucket (`''` = all)." },
    onGroupsFilterChange: { description: 'Called with the newly selected group-push bucket.' },
    sortBy: { description: 'The active sort field.' },
    sortDesc: { description: 'Whether the active sort is descending.' },
    onToggleSort: {
      description: 'Select a sort field, or flip the direction when it is already active.',
    },
    resultCount: { description: 'Number of apps after filtering.' },
    totalCount: { description: 'Number of apps loaded in total.' },
  },
  args: {
    searchQuery: '',
    onSearchQueryChange: fn(),
    statusFilter: '',
    onStatusFilterChange: fn(),
    groupsFilter: '',
    onGroupsFilterChange: fn(),
    sortBy: 'label',
    sortDesc: false,
    onToggleSort: fn(),
    resultCount: 42,
    totalCount: 42,
  },
} satisfies Meta<typeof AppsToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Searching: Story = {
  args: { searchQuery: 'sales', resultCount: 3 },
};

export const RegexQuery: Story = {
  args: { searchQuery: '/^okta_/i', resultCount: 7 },
};

export const InactiveFilter: Story = {
  args: { statusFilter: 'INACTIVE', resultCount: 5 },
};

export const PushesNothingFilter: Story = {
  args: { groupsFilter: 'no-groups', resultCount: 2 },
};

export const SortedByCreatedDesc: Story = {
  args: { sortBy: 'created', sortDesc: true },
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
      const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
      const [groupsFilter, setGroupsFilter] = useState<'' | 'no-groups'>('');
      const [sortBy, setSortBy] = useState<'label' | 'status' | 'created'>('label');
      const [sortDesc, setSortDesc] = useState(false);

      const visible = filterAndSortApps(harnessApps, {
        searchQuery,
        statusFilter,
        groupsFilter,
        sortBy,
        sortDesc,
      });

      return (
        <div className="space-y-(--sp-field)">
          <AppsToolbar
            {...args}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            groupsFilter={groupsFilter}
            onGroupsFilterChange={setGroupsFilter}
            sortBy={sortBy}
            sortDesc={sortDesc}
            onToggleSort={(field) => {
              if (field === sortBy) setSortDesc((previous) => !previous);
              else {
                setSortBy(field);
                setSortDesc(false);
              }
            }}
            resultCount={visible.length}
            totalCount={harnessApps.length}
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

    await userEvent.type(canvas.getByLabelText('Search applications'), 'sl');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Slack')).toBeInTheDocument();

    await userEvent.clear(canvas.getByLabelText('Search applications'));
    await userEvent.click(
      within(canvas.getByRole('group', { name: 'Filter by status' })).getByRole('button', {
        name: 'Inactive',
      }),
    );
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Workday HR')).toBeInTheDocument();
  },
};
