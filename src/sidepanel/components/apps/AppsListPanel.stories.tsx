import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
          'The scrollable Applications list plus its empty states.\n\n' +
          'Renders an `AppListItem` per filtered app, forwarding the org origin and the ' +
          'lazy assignment-count fetcher. Shows a spinner during the inventory load, and ' +
          'two distinct empty states: "nothing loaded" (offering a reload) versus ' +
          '"nothing matches" (offering a filter reset, only when a filter or search is active).',
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
    onSelectAll: {
      description:
        'Replaces the app selection with every currently filtered app. A request, not a resolved outcome.',
    },
    onDeselectAll: { description: "Empties the app partition, leaving other kinds' picks alone." },
  },
  args: {
    loading: false,
    apps: sampleApps,
    hasApps: true,
    activeFilterCount: 0,
    hasSearchQuery: false,
    onClearFilters: fn(),
    onReload: fn(),
    oktaOrigin: 'https://example.okta.com',
    fetchAssignmentCounts: fn(async () => ({ users: 128, groups: 4 })),
    selectedIds: new Set<string>(),
    onToggleSelect: fn(),
    onSelectAll: fn(),
    onDeselectAll: fn(),
  },
} satisfies Meta<typeof AppsListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true, apps: [] },
};

export const NoMatches: Story = {
  args: { apps: [], hasApps: true, activeFilterCount: 1, hasSearchQuery: true },
};

export const NothingLoaded: Story = {
  args: { apps: [], hasApps: false },
};

export const WithSelection: Story = {
  args: { selectedIds: new Set([sampleApps[0].id]) },
};
