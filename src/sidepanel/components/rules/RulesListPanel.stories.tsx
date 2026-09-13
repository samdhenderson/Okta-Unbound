import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The Rules tab's list region, switching between four states.\n\n" +
          'Shows a spinner while loading; a "Load Rules" call-to-action empty state when nothing is loaded yet; a "no match" empty state when a search/filter excludes every rule; otherwise the filtered `RuleCard` list. Each card is a row that opens the rule\'s own detail rung — the write verbs it used to carry inline are that rung\'s `ActionBar` now.',
      },
    },
  },
  argTypes: {
    isLoading: { description: 'Whether a load is in flight.' },
    hasRules: {
      description:
        'Whether any rules are loaded at all (drives the "load" vs "no match" empty state).',
    },
    filteredRules: { description: 'Rules after search + filter.' },
    onLoad: { description: 'Load rules (used by the empty-state action).' },
    onOpenRule: { description: "Open a rule's detail rung." },
    selectedRuleId: {
      description: 'Rule id being opened (deep-link target), for the arrival flash.',
    },
    selectedRuleIds: {
      description: "Ids ticked in the selection basket's `rule` partition.",
    },
    onToggleSelect: { description: "Toggles a rule's id in the selection basket." },
  },
  args: {
    isLoading: false,
    hasRules: true,
    filteredRules: sampleRules,
    onLoad: fn(),
    onOpenRule: fn(),
    selectedRuleId: null,
    selectedRuleIds: new Set<string>(),
    onToggleSelect: fn(),
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

export const TogglingASelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: `Select ${sampleRules[1].name}` }));
    await expect(args.onToggleSelect).toHaveBeenCalledWith(sampleRules[1].id);
  },
};

export const WithASelectedRule: Story = {
  args: { selectedRuleIds: new Set([sampleRules[0].id]) },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: `Select ${sampleRules[0].name}`,
    });
    await expect(checkbox).toBeChecked();
  },
};
