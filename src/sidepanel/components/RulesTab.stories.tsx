import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RulesTab from './RulesTab';

const meta = {
  title: 'Rules/RulesTab',
  component: RulesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'Rules tab shell: browse, search, filter, and manage group rules. ' +
          'Nothing is fetched automatically — rules load on demand via “Load Rules”.',
      },
    },
  },
  argTypes: {
    targetTabId: {
      description: 'Chrome tab id of the connected Okta tab; required to fetch or mutate rules.',
    },
    currentGroupId: {
      description: 'Id of the currently detected group; enables the "Current Group" filter.',
    },
    oktaOrigin: {
      description: 'Okta org origin passed to each RuleCard for its "View in Okta" link.',
    },
    selectedRuleId: {
      description: 'Rule id to scroll to and highlight when navigated here from another tab.',
    },
    onRuleSelected: {
      description: 'Called once the highlighted rule has been shown, so the parent can clear it.',
    },
    onNavigateToGroup: {
      description: "Deep-link to a group in the Groups tab (from a rule's target groups).",
    },
  },
  args: {
    targetTabId: 1,
    currentGroupId: undefined,
    oktaOrigin: 'https://example.okta.com',
    selectedRuleId: null,
    onRuleSelected: fn(),
    onNavigateToGroup: fn(),
  },
} satisfies Meta<typeof RulesTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: { targetTabId: undefined },
};

export const WithCurrentGroup: Story = {
  args: { currentGroupId: 'group123' },
};

export const DeepLinkedRule: Story = {
  args: { selectedRuleId: 'rule1' },
};
