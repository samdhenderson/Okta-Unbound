import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AppsFilterPanel from './AppsFilterPanel';
import {
  filterAndSortApps,
  type AppGroupsFilter,
  type AppSortField,
  type AppStatusFilter,
} from './appFilters';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

const meta = {
  title: 'Apps/AppsFilterPanel',
  component: AppsFilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Applications rung's status and group-push buckets and its sort pills, disclosed " +
          "below the action strip by `AppsToolbar`'s `FilterToggle`. Fully controlled: every " +
          'pill reports upward and the tab shell owns the filtering.\n\n' +
          '`Pushes nothing` means Group Push is enabled on the app and the org snapshot holds ' +
          'no group assignment for it — the snapshot only walks the groups endpoint for ' +
          '`GROUP_PUSH` apps, so a wider reading would report the whole inventory as ' +
          'unassigned.\n\n' +
          '"Clear all" appears only once a filter is applied, and returns the filters and the ' +
          'search query to their defaults. It leaves the sort order alone.',
      },
    },
  },
  argTypes: {
    statusFilter: { description: "Selected status bucket (`''` = all)." },
    onStatusFilterChange: { description: 'Called with the newly selected status bucket.' },
    groupsFilter: { description: "Selected group-push bucket (`''` = all)." },
    onGroupsFilterChange: { description: 'Called with the newly selected group-push bucket.' },
    sortBy: { description: 'The active sort field.' },
    sortDesc: { description: 'Whether the active sort is descending.' },
    onToggleSort: {
      description: 'Select a sort field, or flip the direction when it is already active.',
    },
    activeFilterCount: {
      description: 'How many filter axes are away from their default; gates "Clear all".',
    },
    onClearFilters: { description: 'Returns every filter axis, and the search query, to default.' },
  },
  args: {
    statusFilter: '',
    onStatusFilterChange: fn(),
    groupsFilter: '',
    onGroupsFilterChange: fn(),
    sortBy: 'label',
    sortDesc: false,
    onToggleSort: fn(),
    activeFilterCount: 0,
    onClearFilters: fn(),
  },
} satisfies Meta<typeof AppsFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InactiveFilter: Story = {
  args: { statusFilter: 'INACTIVE', activeFilterCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = within(canvas.getByRole('group', { name: 'Filter by status' }));
    await expect(status.getByRole('button', { name: 'Inactive' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
  },
};

export const PushesNothingFilter: Story = {
  args: { groupsFilter: 'no-groups', activeFilterCount: 1 },
};

export const BothFilters: Story = {
  args: { statusFilter: 'ACTIVE', groupsFilter: 'no-groups', activeFilterCount: 2 },
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
      const [statusFilter, setStatusFilter] = useState<AppStatusFilter>('');
      const [groupsFilter, setGroupsFilter] = useState<AppGroupsFilter>('');
      const [sortBy, setSortBy] = useState<AppSortField>('label');
      const [sortDesc, setSortDesc] = useState(false);

      const visible = filterAndSortApps(harnessApps, {
        searchQuery: '',
        statusFilter,
        groupsFilter,
        sortBy,
        sortDesc,
      });

      return (
        <div className="space-y-(--sp-field)">
          <AppsFilterPanel
            {...args}
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
            activeFilterCount={(statusFilter ? 1 : 0) + (groupsFilter ? 1 : 0)}
            onClearFilters={() => {
              setStatusFilter('');
              setGroupsFilter('');
            }}
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

    const status = within(canvas.getByRole('group', { name: 'Filter by status' }));
    await userEvent.click(status.getByRole('button', { name: 'Inactive' }));
    await expect(status.getByRole('button', { name: 'Inactive' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Workday HR')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();

    const sort = within(canvas.getByRole('group', { name: 'Sort applications' }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Salesforce');
    await userEvent.click(sort.getByRole('button', { name: /^Name/ }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Workday HR');

    await userEvent.click(sort.getByRole('button', { name: /^Created/ }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Slack');
  },
};
