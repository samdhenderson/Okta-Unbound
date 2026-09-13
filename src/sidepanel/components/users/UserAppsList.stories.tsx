import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserAppsList from './UserAppsList';
import { APP_SOURCE_COPY } from './appSourceSummary';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { selectionStore } from '../../selection/selectionStore';
import type { GroupMembership } from '../../../shared/types';
import type { UserAppAssignment } from '../../hooks/useOktaApi/userOperations';

const handlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const SALES_GROUP = '00gFAKE00000000000001';
const ADMINS_GROUP = '00gFAKE00000000000002';
const WORKDAY_GROUP = '00gFAKE00000000000003';

const membership = (
  id: string,
  name: string,
  over: Partial<GroupMembership> = {},
): GroupMembership => ({
  group: { id, type: 'OKTA_GROUP', profile: { name } },
  membershipType: 'RULE_BASED',
  rules: [
    {
      id: '0prFAKErule00001',
      name: 'EMEA sales',
      status: 'ACTIVE',
      conditionExpression: 'user.department == "Sales"',
      groupIds: [id],
      userAttributes: ['department'],
    },
  ],
  attribution: 'exact',
  ...over,
});

const MEMBERSHIPS: GroupMembership[] = [
  membership(SALES_GROUP, 'sales.emea'),
  membership(ADMINS_GROUP, 'okta.admins', { membershipType: 'DIRECT', rules: [] }),
  membership(WORKDAY_GROUP, 'workday.contractors', {
    group: { id: WORKDAY_GROUP, type: 'APP_GROUP', profile: { name: 'workday.contractors' } },
    rules: [],
  }),
];

const APPS: UserAppAssignment[] = [
  {
    id: '0oaFAKEapp000001',
    label: 'Salesforce',
    scope: 'USER',
    grantGroupId: SALES_GROUP,
    isProfileSource: false,
  },
  {
    id: '0oaFAKEapp000002',
    label: 'Okta Admin Console',
    scope: 'GROUP',
    grantGroupId: ADMINS_GROUP,
    isProfileSource: false,
  },
  {
    id: '0oaFAKEapp000003',
    label: 'Workday',
    scope: 'GROUP',
    grantGroupId: WORKDAY_GROUP,
    isProfileSource: true,
  },
  { id: '0oaFAKEapp000004', label: 'Figma', scope: 'GROUP', isProfileSource: false },
  { id: '0oaFAKEapp000005', label: 'Zoom', scope: 'USER', isProfileSource: false },
  { id: '0oaFAKEapp000006', label: 'Slack', isProfileSource: false },
];

const meta = {
  title: 'Users/UserAppsList',
  component: UserAppsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Which apps this user has, and which group grants each one. The granting group is ' +
          'named on load at no extra cost — Okta already names it in the `expand=user/{id}` ' +
          'embed — so there is no per-row "name the group" button.\n\n' +
          'A `Direct` badge and a `Through {group}` line are not in tension: Okta reports a ' +
          'single scope per app-user and prefers `USER`, so `Direct` only means "there is a ' +
          'direct assignment". A grantor that is not known is spelled out in italic rather than ' +
          'left blank, and `complete: false` raises a standing, non-dismissible warning — a ' +
          "partial walk must never read as this user's whole access.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={handlers}>
        <Story />
      </NavigationProvider>
    ),
  ],
  argTypes: {
    apps: {
      description:
        "The user's app assignments, with `grantGroupId` already filled in wherever it is known.",
    },
    memberships: {
      description:
        'The user’s group memberships — used only to *name* a group Okta already credited, never to infer one.',
    },
    isLoading: { description: 'Shows row placeholders instead of the list.' },
    complete: {
      description:
        'Whether the pagination walk finished. `false` raises the non-dismissible incompleteness warning.',
    },
    oktaOrigin: { description: 'Origin for the per-row admin deep links; they hide when absent.' },
  },
  args: {
    apps: APPS,
    memberships: MEMBERSHIPS,
    isLoading: false,
    complete: true,
    oktaOrigin: 'https://example.okta.com',
  },
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
} satisfies Meta<typeof UserAppsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByText('Direct')).toHaveLength(2);
    await expect(canvas.getAllByText('Via group')).toHaveLength(3);
    await expect(canvas.getByText('Source unknown')).toBeInTheDocument();

    await expect(canvas.getByText('Through sales.emea')).toBeInTheDocument();

    expect(canvas.getAllByText(APP_SOURCE_COPY.GROUP.caveat).length).toBeGreaterThan(0);

    await expect(canvas.getByText('2 direct · 3 via group · 1 unknown source')).toBeInTheDocument();
  },
};

export const DirectAndViaGroup: Story = {
  args: { apps: [APPS[0]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Direct')).toBeInTheDocument();
    await expect(canvas.getByText('Through sales.emea')).toBeInTheDocument();
    await expect(canvas.getByTitle(/does not rule out a group path/i)).toBeInTheDocument();
  },
};

export const UnresolvedSource: Story = {
  args: { apps: [APPS[3]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Via group')).toBeInTheDocument();
    expect(canvas.getAllByText(APP_SOURCE_COPY.GROUP.caveat).length).toBeGreaterThan(0);
    await expect(canvas.queryByText(/^Through /)).toBeNull();
  },
};

export const PrivilegedApp: Story = {
  args: { apps: [APPS[1]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Okta Admin Console')).toBeInTheDocument();
    await expect(canvas.getByText('Privileged')).toBeInTheDocument();
  },
};

export const OpenDisclosure: Story = {
  args: { apps: [APPS[2]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Show how Workday is granted/i });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await expect(canvas.getByText('Granted through')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Open group workday.contractors' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Managed by app')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const IncompleteWalk: Story = {
  args: { complete: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveTextContent(/may be incomplete/i);
    await expect(within(alert).queryByRole('button')).toBeNull();
  },
};

export const NoApps: Story = {
  args: { apps: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No apps assigned')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Clear filters' })).toBeNull();
  },
};

export const FilteredToNothing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Filter apps or granting group' }),
      'nothing matches this',
    );

    await expect(canvas.getByText('No apps match')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear filters' }));
    await expect(canvas.getByText('Salesforce')).toBeInTheDocument();
  },
};

export const FilterByGrantingGroup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Filter apps or granting group' }),
      'workday.contractors',
    );

    await expect(canvas.getByText('Workday')).toBeInTheDocument();
    await expect(canvas.queryByText('Salesforce')).toBeNull();
  },
};

export const FilteredToUnknown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Unknown 1$/ }));

    await expect(canvas.getByText('Slack')).toBeInTheDocument();
    await expect(canvas.queryByText('Salesforce')).toBeNull();
  },
};

export const Selectable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Select Salesforce' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(canvas.getByText(/1 selected/)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Select all' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select Slack' })).toBeChecked();
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
