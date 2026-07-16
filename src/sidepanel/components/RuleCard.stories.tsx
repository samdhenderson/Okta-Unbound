import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { FormattedRule } from '../../shared/types';
import RuleCard from './RuleCard';

const baseRule: FormattedRule = {
  id: '00rABCDEF1234567890',
  name: 'Engineering – Auto-assign by department',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00g1a2b3c4d5e6f7g8h9', '00g9z8y7x6w5v4u3t2s1'],
  groupNames: ['Engineering – All', 'Slack – Eng Channel'],
  allGroupNamesMap: {
    '00g1a2b3c4d5e6f7g8h9': 'Engineering – All',
    '00g9z8y7x6w5v4u3t2s1': 'Slack – Eng Channel',
  },
  userAttributes: ['department'],
  created: '2024-01-15T09:00:00.000Z',
  lastUpdated: '2026-06-01T14:30:00.000Z',
  affectsCurrentGroup: false,
};

const meta = {
  title: 'Sidepanel/RuleCard',
  component: RuleCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    rule: baseRule,
    onActivate: fn(),
    onDeactivate: fn(),
    onPreviewImpact: fn(),
    onAddTargetGroup: fn(),
    oktaOrigin: 'https://dev-12345.okta.com',
    isHighlighted: false,
  },
} satisfies Meta<typeof RuleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: { isHighlighted: true },
};

export const AffectsCurrentGroup: Story = {
  args: {
    isHighlighted: true,
    rule: { ...baseRule, affectsCurrentGroup: true },
  },
};

export const WithConflicts: Story = {
  args: {
    isHighlighted: true,
    rule: {
      ...baseRule,
      conflicts: [
        {
          rule1: { id: baseRule.id, name: baseRule.name },
          rule2: { id: '00rZYXWVUT0987654321', name: 'Contractors – Auto-assign by department' },
          reason: 'Both rules assign users to "Engineering – All" based on overlapping conditions.',
          severity: 'high',
          affectedGroups: ['00g1a2b3c4d5e6f7g8h9'],
        },
      ],
    },
  },
};

export const Inactive: Story = {
  args: {
    rule: { ...baseRule, status: 'INACTIVE' },
  },
};

export const MinimalActions: Story = {
  args: {
    isHighlighted: true,
    oktaOrigin: null,
    onPreviewImpact: undefined,
    onAddTargetGroup: undefined,
  },
};
