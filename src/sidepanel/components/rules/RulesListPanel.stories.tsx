import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { FormattedRule } from '../../../shared/types';
import RulesListPanel from './RulesListPanel';

const sampleRules: FormattedRule[] = [
  {
    id: '00rABCDEF1234567890',
    name: 'Engineering – Auto-assign by department',
    status: 'ACTIVE',
    condition: 'user.department == "Engineering"',
    conditionExpression: 'user.department == "Engineering"',
    groupIds: ['00g1a2b3c4d5e6f7g8h9', '00g9z8y7x6w5v4u3t2s1'],
    groupNames: ['Engineering – All', 'Slack – Eng Channel'],
    userAttributes: ['department'],
    created: '2024-01-15T09:00:00.000Z',
    lastUpdated: '2026-06-01T14:30:00.000Z',
    affectsCurrentGroup: true,
  },
  {
    id: '00rZYXWVUT0987654321',
    name: 'Contractors – Auto-assign by user type',
    status: 'INACTIVE',
    condition: 'user.userType == "Contractor"',
    conditionExpression: 'user.userType == "Contractor"',
    groupIds: ['00g5f6g7h8i9j0k1l2m3'],
    groupNames: ['Contractors – All'],
    userAttributes: ['userType'],
    created: '2023-11-02T12:00:00.000Z',
    lastUpdated: '2025-03-20T10:15:00.000Z',
  },
  {
    id: '00rLMNOPQR1122334455',
    name: 'Sales – Auto-assign by division',
    status: 'ACTIVE',
    condition: 'user.division == "Sales"',
    conditionExpression: 'user.division == "Sales"',
    groupIds: ['00g6g7h8i9j0k1l2m3n4'],
    groupNames: ['Sales – All'],
    userAttributes: ['division'],
    created: '2024-05-10T08:00:00.000Z',
    lastUpdated: '2026-02-14T16:45:00.000Z',
  },
];

const meta = {
  title: 'Rules/RulesListPanel',
  component: RulesListPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    isLoading: false,
    hasRules: true,
    filteredRules: sampleRules,
    onLoad: fn(),
    onActivate: fn(),
    onDeactivate: fn(),
    onPreviewImpact: fn(),
    onAddTargetGroup: fn(),
    oktaOrigin: 'https://example.okta.com',
    selectedRuleId: null,
  },
} satisfies Meta<typeof RulesListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const NoRulesLoaded: Story = {
  args: { hasRules: false, filteredRules: [] },
};

export const NoMatchingRules: Story = {
  args: { filteredRules: [] },
};

export const WithSelectedRule: Story = {
  args: { selectedRuleId: sampleRules[0].id },
};

export const WithoutOktaOrigin: Story = {
  args: { oktaOrigin: null },
};
