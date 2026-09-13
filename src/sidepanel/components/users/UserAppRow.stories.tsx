import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserAppRow from './UserAppRow';
import { APP_SOURCE_COPY, summarizeAppSources } from './appSourceSummary';
import { NavigationProvider } from '../../contexts/NavigationContext';
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
  {
    group: { id: WORKDAY_GROUP, type: 'APP_GROUP', profile: { name: 'workday.contractors' } },
    membershipType: 'RULE_BASED',
    rules: [],
    attribution: 'exact',
  },
];

const rowFor = (app: UserAppAssignment) => summarizeAppSources([app], MEMBERSHIPS).rows[0];

const directOnly = rowFor({
  id: '0oaFAKEapp000005',
  label: 'Zoom',
  scope: 'USER',
  isProfileSource: false,
});

const directAndViaGroup = rowFor({
  id: '0oaFAKEapp000001',
  label: 'Salesforce',
  scope: 'USER',
  grantGroupId: SALES_GROUP,
  isProfileSource: false,
});

const viaNamedGroup = rowFor({
  id: '0oaFAKEapp000003',
  label: 'Workday',
  scope: 'GROUP',
  grantGroupId: WORKDAY_GROUP,
  isProfileSource: true,
});

const viaUnnamedGroup = rowFor({
  id: '0oaFAKEapp000004',
  label: 'Figma',
  scope: 'GROUP',
  isProfileSource: false,
});

const sourceUnknown = rowFor({ id: '0oaFAKEapp000006', label: 'Slack', isProfileSource: false });

const privileged = rowFor({
  id: '0oaFAKEapp000002',
  label: 'Okta Admin Console',
  scope: 'GROUP',
  grantGroupId: ADMINS_GROUP,
  isProfileSource: false,
});

const meta = {
  title: 'Users/UserAppRow',
  component: UserAppRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One app assignment: which app, how Okta says it was granted, and — once known — which group grants it. The row takes an `AppSourceRow` and owns no I/O at all, so scrolling a long list cannot start work.\n\n' +
          'A `Direct` badge and a `Through {group}` line are not in tension: Okta reports one scope per app-user and prefers `USER`, so `Direct` means "there is a direct assignment", never "direct only". With no group known the second line states the absence in italic rather than going blank.',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <NavigationProvider handlers={handlers}>
        <div className="bg-canvas p-4">
          <ul className="space-y-2">
            <Story />
          </ul>
        </div>
      </NavigationProvider>
    ),
  ],
  args: {
    row: directAndViaGroup,
    oktaOrigin: 'https://example.okta.com',
  },
  argTypes: {
    row: { description: "The row's whole rendered model, derived by `appSourceSummary`." },
    oktaOrigin: {
      description: 'Origin for the admin-console deep link; the link hides when absent.',
    },
    selected: {
      description:
        "Whether this app is in the selection basket; a ticked row paints ListRow's selected state.",
    },
    onToggleSelect: {
      description: 'Tick or untick this app. Omitted ⇒ no checkbox renders at all.',
    },
  },
} satisfies Meta<typeof UserAppRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Direct: Story = {
  args: { row: directOnly },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Direct')).toBeInTheDocument();
    expect(canvas.getAllByTitle(APP_SOURCE_COPY.USER.caveat).length).toBeGreaterThan(0);
  },
};

export const DirectAndViaGroup: Story = {
  args: { row: directAndViaGroup },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Direct')).toBeInTheDocument();
    await expect(canvas.getByText('Through sales.emea')).toBeInTheDocument();
  },
};

export const ViaGroup: Story = {
  args: { row: viaNamedGroup },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Via group')).toBeInTheDocument();
    await expect(canvas.getByText('Through workday.contractors')).toBeInTheDocument();
  },
};

export const SourceUnknown: Story = {
  args: { row: sourceUnknown },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Source unknown')).toBeInTheDocument();
  },
};

export const UnresolvedSource: Story = {
  args: { row: viaUnnamedGroup },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Via group')).toBeInTheDocument();
    expect(canvas.getAllByText(APP_SOURCE_COPY.GROUP.caveat).length).toBeGreaterThan(0);
    await expect(canvas.queryByText(/^Through /)).toBeNull();
  },
};

export const PrivilegedApp: Story = {
  args: { row: privileged },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Privileged')).toBeInTheDocument();
  },
};

export const OpenDisclosure: Story = {
  args: { row: viaNamedGroup },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Show how Workday is granted' });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await expect(canvas.getByText('Granted through')).toBeInTheDocument();
    await expect(canvas.getByText('Managed by app')).toBeInTheDocument();
  },
};

export const WithoutOktaOrigin: Story = {
  args: { row: viaNamedGroup, oktaOrigin: null },
};

export const Compact: Story = {
  args: { row: privileged },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const Selectable: Story = {
  args: { onToggleSelect: fn() },
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Select Salesforce' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(directAndViaGroup.id);
  },
};

export const Selected: Story = {
  args: { onToggleSelect: fn(), selected: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();
  },
};
