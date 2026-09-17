import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import AppsListPanel from './AppsListPanel';
import type { OktaAppListItem } from '../../../shared/schemas/okta';

const sampleApps = [
  {
    id: '0oaFAKE0001',
    name: 'salesforce',
    label: 'Salesforce',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-01-15T09:00:00.000Z',
    lastUpdated: '2026-06-02T11:30:00.000Z',
  },
  {
    id: '0oaFAKE0002',
    name: 'workday',
    label: 'Workday HR',
    status: 'INACTIVE',
    signOnMode: 'SAML_2_0',
    created: '2026-03-01T09:00:00.000Z',
  },
  {
    id: '0oaFAKE0003',
    name: 'bookmark',
    label: 'Internal Wiki',
    status: 'ACTIVE',
    signOnMode: 'BOOKMARK',
    created: '2025-11-20T09:00:00.000Z',
  },
] as OktaAppListItem[];

const meta = {
  title: 'Apps/AppsListPanel',
  component: AppsListPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renders an `AppListItem` per filtered app, forwarding the org origin and the lazy ' +
          'assignment-count fetcher, and a row skeleton while the inventory loads. The two ' +
          'empty states are distinct: "nothing loaded" offers a reload, "nothing matches" ' +
          'offers a filter reset — and only when a filter or search is actually active.',
      },
    },
  },
  argTypes: {
    loading: { description: 'Whether the inventory load is in progress.' },
    apps: { description: 'Apps to render, already filtered and sorted.' },
    hasApps: { description: 'Whether any apps are loaded — picks which empty state to show.' },
    activeFilterCount: {
      description: 'Active-filter count — gates the "Clear filters" empty-state action.',
    },
    hasSearchQuery: {
      description: 'Whether a search query is active — also gates "Clear filters".',
    },
    onClearFilters: { description: 'Clears the search and status filters.' },
    onReload: { description: 'Reloads the inventory.' },
    oktaOrigin: { description: 'Okta origin passed to each row for its deep link.' },
    fetchAssignmentCounts: {
      description: "Loads a single app's assignment counts, lazily, once its row is expanded.",
    },
    selectedIds: { description: "Every basket id of kind 'app', including ones ticked elsewhere." },
    onToggleSelect: { description: "Tick or untick one row's app." },
  },
  args: {
    loading: false,
    apps: sampleApps,
    hasApps: true,
    activeFilterCount: 0,
    hasSearchQuery: false,
    totalCount: 3,
    onClearFilters: fn(),
    onReload: fn(),
    oktaOrigin: 'https://example.okta.com',
    fetchAssignmentCounts: fn(async () => ({ users: 128, groups: 4 })),
    selectedIds: new Set<string>(),
    onToggleSelect: fn(),
  },
} satisfies Meta<typeof AppsListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExpandingARowFetchesCounts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('128 users')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Expand Salesforce' }));

    await expect(canvas.getByRole('button', { name: 'Collapse Salesforce' })).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  },
};

export const Loading: Story = {
  args: { loading: true, apps: [] },
};

export const NoMatches: Story = {
  args: { apps: [], hasApps: true, activeFilterCount: 1, hasSearchQuery: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(args.onClearFilters).toHaveBeenCalled();
  },
};

export const NothingLoaded: Story = {
  args: { apps: [], hasApps: false },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Load applications' }));
    await expect(args.onReload).toHaveBeenCalled();
  },
};

export const WithSelection: Story = {
  args: { selectedIds: new Set([sampleApps[0].id]) },
};
