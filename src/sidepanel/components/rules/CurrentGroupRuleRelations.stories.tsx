import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { FormattedRule } from '../../../shared/types';
import CurrentGroupRuleRelations from './CurrentGroupRuleRelations';

const CURRENT_GROUP = '00gCURRENTFAKE000001';
const OTHER_GROUP = '00gOTHERFAKE00000002';

const assigningRule: FormattedRule = {
  id: '00rABCDEF1234567890',
  name: 'Engineering – Auto-assign by department',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department=="Engineering"',
  groupIds: [CURRENT_GROUP],
  groupNames: ['Engineering – All'],
  userAttributes: ['department'],
  created: '2024-01-15T09:00:00.000Z',
  lastUpdated: '2026-06-01T14:30:00.000Z',
};

const referencingRule: FormattedRule = {
  id: '00rZYXWVUT0987654321',
  name: 'Slack – Eng channel from Engineering membership',
  status: 'ACTIVE',
  condition: 'member of Engineering – All',
  conditionExpression: `isMemberOfAnyGroup("${CURRENT_GROUP}")`,
  groupIds: [OTHER_GROUP],
  groupNames: ['Slack – Eng Channel'],
  userAttributes: [],
  created: '2023-11-02T12:00:00.000Z',
  lastUpdated: '2025-03-20T10:15:00.000Z',
};

const bothRule: FormattedRule = {
  id: '00rLMNOPQR1122334455',
  name: 'Engineering – Re-assert employees',
  status: 'INACTIVE',
  condition: 'member of Engineering – All and userType is Employee',
  conditionExpression: `isMemberOfGroup("${CURRENT_GROUP}") AND user.userType=="Employee"`,
  groupIds: [CURRENT_GROUP],
  groupNames: ['Engineering – All'],
  userAttributes: ['userType'],
  created: '2025-02-01T08:00:00.000Z',
  lastUpdated: '2026-04-11T11:05:00.000Z',
};

const unrelatedRule: FormattedRule = {
  id: '00rQQQQQQQ5566778899',
  name: 'Contractors – Auto-assign by user type',
  status: 'ACTIVE',
  condition: 'user.userType == "Contractor"',
  conditionExpression: 'user.userType=="Contractor"',
  groupIds: [OTHER_GROUP],
  groupNames: ['Contractors – All'],
  userAttributes: ['userType'],
  created: '2023-06-06T12:00:00.000Z',
  lastUpdated: '2025-01-09T09:20:00.000Z',
};

const meta = {
  title: 'Rules/CurrentGroupRuleRelations',
  component: CurrentGroupRuleRelations,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The two opposite ways a loaded rule can touch the group open in Okta, listed apart and never merged into one count: rules that assign members **into** the group, and rules that **reference** the group id in a condition.\n\n' +
          'Reference detection covers only the two membership functions that take group **ids**; the five name-based variants can resolve to groups this extension never sees, and the section copy states that limit — keep it.',
      },
    },
  },
  argTypes: {
    rules: { description: 'Every rule currently loaded in the tab (unfiltered).' },
    currentGroupId: {
      description: 'Id of the group detected on the Okta page; absent renders nothing.',
    },
    onFocusRule: { description: "Scroll to and highlight a rule's card in the list below." },
  },
  args: {
    rules: [assigningRule, referencingRule, bothRule, unrelatedRule],
    currentGroupId: CURRENT_GROUP,
    onFocusRule: fn(),
  },
} satisfies Meta<typeof CurrentGroupRuleRelations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AssignsOnly: Story = {
  args: { rules: [assigningRule, unrelatedRule] },
};

export const ReferencesOnly: Story = {
  args: { rules: [referencingRule, unrelatedRule] },
};

export const NoRelations: Story = {
  args: { rules: [unrelatedRule] },
};

export const NoCurrentGroup: Story = {
  args: { currentGroupId: undefined },
};
