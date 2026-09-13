import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupFilterPanel from './GroupFilterPanel';

const availablePushApps = [
  { id: 'app1', name: 'Salesforce' },
  { id: 'app2', name: 'Workday' },
  { id: 'app3', name: 'Zoom' },
];

const meta = {
  title: 'Groups/GroupFilterPanel',
  component: GroupFilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Cached-mode filter + sort panel for the groups list: group type, member-count ' +
          'bucket, push status, rule attribution, and push-target app, plus the sort field and ' +
          'direction. Fully controlled — every axis is owned by the caller. With any filter ' +
          'active it surfaces a summary chips row with a "Clear all" link.',
      },
    },
  },
  argTypes: {
    activeFilterCount: { description: 'Number of active filters (drives the active-chips row).' },
    typeFilter: { description: "Selected group-type filter (`''` = all)." },
    setTypeFilter: { description: 'Sets the group-type filter.' },
    sizeFilter: { description: "Selected member-count bucket (`''` = all)." },
    setSizeFilter: { description: 'Sets the member-count bucket.' },
    pushFilter: { description: 'Push-status filter.' },
    setPushFilter: { description: 'Sets the push-status filter.' },
    ruleFilter: { description: 'Rule-attribution filter.' },
    setRuleFilter: { description: 'Sets the rule-attribution filter.' },
    pushAppFilter: { description: 'Set of push-target app ids to filter by (empty = all).' },
    setPushAppFilter: { description: 'Updates the push-target-app id set.' },
    availablePushApps: { description: 'Push-target apps available as filter chips.' },
    sortBy: { description: 'Active sort field.' },
    sortDesc: { description: 'Whether the active sort is descending.' },
    toggleSort: { description: 'Toggles the sort field (or flips direction if already active).' },
    clearFilters: { description: 'Resets all filters (and the search query).' },
  },
  args: {
    activeFilterCount: 0,
    typeFilter: '',
    setTypeFilter: fn(),
    sizeFilter: '',
    setSizeFilter: fn(),
    pushFilter: '',
    setPushFilter: fn(),
    ruleFilter: '',
    setRuleFilter: fn(),
    pushAppFilter: new Set<string>(),
    setPushAppFilter: fn(),
    availablePushApps,
    sortBy: 'name',
    sortDesc: false,
    toggleSort: fn(),
    clearFilters: fn(),
  },
} satisfies Meta<typeof GroupFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    activeFilterCount: 3,
    typeFilter: 'OKTA_GROUP',
    sizeFilter: 'large',
    pushFilter: 'pushed',
  },
};

export const WithPushAppFilter: Story = {
  args: {
    activeFilterCount: 1,
    pushAppFilter: new Set(['app1', 'app2']),
  },
};

export const WithRuleFilter: Story = {
  args: {
    activeFilterCount: 1,
    ruleFilter: 'unruled',
  },
};

export const NoPushApps: Story = {
  args: { availablePushApps: [] },
};

export const SortedDescending: Story = {
  args: { sortBy: 'memberCount', sortDesc: true },
};

export const Interactive: Story = {
  render: function InteractiveFilters(args) {
    const [typeFilter, setTypeFilter] = useState(args.typeFilter);
    const [sizeFilter, setSizeFilter] = useState(args.sizeFilter);
    const [pushFilter, setPushFilter] = useState(args.pushFilter);
    const [ruleFilter, setRuleFilter] = useState(args.ruleFilter);
    const [pushAppFilter, setPushAppFilter] = useState(args.pushAppFilter);
    const [sortBy, setSortBy] = useState(args.sortBy);
    const [sortDesc, setSortDesc] = useState(args.sortDesc);

    const activeFilterCount =
      (typeFilter ? 1 : 0) +
      (sizeFilter ? 1 : 0) +
      (pushFilter ? 1 : 0) +
      (ruleFilter ? 1 : 0) +
      (pushAppFilter.size > 0 ? 1 : 0);

    return (
      <GroupFilterPanel
        {...args}
        activeFilterCount={activeFilterCount}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sizeFilter={sizeFilter}
        setSizeFilter={setSizeFilter}
        pushFilter={pushFilter}
        setPushFilter={setPushFilter}
        ruleFilter={ruleFilter}
        setRuleFilter={setRuleFilter}
        pushAppFilter={pushAppFilter}
        setPushAppFilter={setPushAppFilter}
        sortBy={sortBy}
        sortDesc={sortDesc}
        toggleSort={(field) => {
          setSortDesc((previous) => (field === sortBy ? !previous : false));
          setSortBy(field);
        }}
        clearFilters={() => {
          setTypeFilter('');
          setSizeFilter('');
          setPushFilter('');
          setRuleFilter('');
          setPushAppFilter(new Set<string>());
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const okta = canvas.getByRole('button', { name: 'Okta' });
    await userEvent.click(okta);
    await expect(okta).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('Type: OKTA GROUP')).toBeInTheDocument();

    const noRules = canvas.getByRole('button', { name: 'No rules' });
    await userEvent.click(noRules);
    await expect(noRules).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.queryByText('Type: OKTA GROUP')).not.toBeInTheDocument();
    await expect(okta).toHaveAttribute('aria-pressed', 'false');
  },
};
