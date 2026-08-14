import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupMembershipsList from './GroupMembershipsList';
import Button from '../shared/Button';
import { mockGroup } from '../../../test/mocks/handlers';
import type { GroupMembership, OktaUser } from '../../../shared/types';

const user: OktaUser = {
  id: '00uFAKE1',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
  },
};

const directMembership: GroupMembership = {
  group: mockGroup,
  membershipType: 'DIRECT',
  rules: [],
  attribution: 'exact',
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
  attribution: 'exact',
  rules: [
    {
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
  ],
};

const formattedRuleMembership: GroupMembership = {
  group: {
    id: 'group789',
    type: 'OKTA_GROUP',
    profile: { name: 'Platform On-call' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [
    {
      id: 'rule2',
      name: 'On-call rotation',
      status: 'ACTIVE',
      conditionExpression:
        'user.department == "Engineering" && user.title != "Intern" && isMemberOfGroup("00gFAKE1")',
    },
  ],
};

const ambiguousMembership: GroupMembership = {
  group: {
    id: 'group321',
    type: 'OKTA_GROUP',
    profile: { name: 'Security Reviewers' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'ambiguous',
  rules: [
    {
      id: 'rule3',
      name: 'Reviewers — by title',
      status: 'ACTIVE',
      conditionExpression: 'user.title == "Intern"',
    },
    {
      id: 'rule4',
      name: 'Reviewers — by group',
      status: 'ACTIVE',
      conditionExpression: 'isMemberOfGroup("00gFAKE1")',
    },
  ],
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
  rules: [],
  attribution: 'ambiguous',
};

const meta = {
  title: 'Users/GroupMembershipsList',
  component: GroupMembershipsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Card listing a user's group memberships, distinguishing direct vs rule-based membership.\n\n" +
          "Direct/rule-based classification is heuristic — the Okta API does not expose which rule (if any) added a user. A rule-based row surfaces the matched rule name, a deep link to the Rules tab, and — when `user` is supplied — that rule's condition explained clause by clause (`ClauseChecklist`): pass, fail, or a neutral **not evaluated** for anything the client-side evaluator cannot resolve. Without a `user` the row falls back to the raw condition text.\n\n" +
          'Renders a spinner while loading and an empty state when the user belongs to no groups; the header exposes an `actions` slot for caller-supplied controls (e.g. UsersTab\'s "Add to Group" button).',
      },
    },
  },
  args: {
    memberships: [directMembership, ruleMembership],
    user,
    isLoading: false,
    onNavigateToRule: fn(),
  },
  argTypes: {
    memberships: {
      description: "The user's group memberships, each already classified as direct or rule-based.",
    },
    user: {
      description:
        'The user the memberships belong to; enables the per-clause explanation of each rule condition.',
    },
    isLoading: { description: 'When true, shows a spinner instead of the list.' },
    currentGroupId: {
      description: 'Group id to visually highlight as the "current" group, if any.',
    },
    oktaOrigin: {
      description:
        'Okta origin used to build admin-console deep links; links are hidden when absent.',
    },
    onNavigateToRule: {
      description: 'Invoked with a rule id to navigate to that rule in the Rules tab.',
    },
    actions: {
      description: 'Caller-supplied header controls, rendered on the right of the title row.',
    },
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

export const RuleWithMixedClauses: Story = {
  args: { memberships: [formattedRuleMembership] },
};

export const AmbiguousAttribution: Story = {
  args: { memberships: [ambiguousMembership] },
};

export const WithoutUser: Story = {
  args: { memberships: [formattedRuleMembership], user: undefined },
};
