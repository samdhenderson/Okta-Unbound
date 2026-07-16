import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupMembershipsList from './GroupMembershipsList';
import Button from '../shared/Button';
import { mockGroup } from '../../../test/mocks/handlers';
import type { GroupMembership } from '../../../shared/types';

const directMembership: GroupMembership = {
  group: mockGroup,
  membershipType: 'DIRECT',
};

const ruleMembership: GroupMembership = {
  group: {
    id: 'group456',
    type: 'OKTA_GROUP',
    profile: {
      name: 'Engineering Team',
      description: 'All engineering department employees',
    },
  },
  membershipType: 'RULE_BASED',
  rule: {
    id: 'rule1',
    name: 'Auto-add Engineers',
    status: 'ACTIVE',
    conditions: {
      expression: {
        value: 'String.stringContains(user.department, "Engineering")',
        type: 'urn:okta:expression:1.0',
      },
    },
  },
};

const unknownMembership: GroupMembership = {
  group: {
    id: 'group789',
    type: 'APP_GROUP',
    profile: {
      name: 'Salesforce Users',
    },
  },
  membershipType: 'UNKNOWN',
};

const meta = {
  title: 'Users/GroupMembershipsList',
  component: GroupMembershipsList,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    memberships: [directMembership, ruleMembership],
    isLoading: false,
    onNavigateToRule: fn(),
  },
} satisfies Meta<typeof GroupMembershipsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { memberships: [], isLoading: true },
};

export const Empty: Story = {
  args: { memberships: [] },
};

export const CurrentGroupHighlighted: Story = {
  args: { currentGroupId: mockGroup.id },
};

export const WithOktaOriginLinks: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
};

export const WithHeaderActions: Story = {
  args: {
    actions: (
      <Button variant="primary" size="sm" onClick={fn()}>
        Add to Group
      </Button>
    ),
  },
};

export const WithUnknownMembershipType: Story = {
  args: { memberships: [directMembership, ruleMembership, unknownMembership] },
};
