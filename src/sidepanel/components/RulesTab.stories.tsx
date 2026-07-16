import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RulesTab from './RulesTab';

const meta = {
  title: 'Components/RulesTab',
  component: RulesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Rules tab shell: browse, search, filter, and manage group rules.\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), ' +
          '[Contexts](?path=/docs/internals-contexts--docs), ' +
          '[Rules engine](?path=/docs/internals-rules-engine--docs), ' +
          '[Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs)',
      },
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
