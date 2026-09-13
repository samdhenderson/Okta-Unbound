import type { Meta, StoryObj } from '@storybook/react-vite';
import PolicyRulesList from './PolicyRulesList';
import type { OktaPolicyRule } from '../../../shared/schemas/okta';

const sampleRules = [
  { id: '0prFAKE000000000001', name: 'Trusted device, no prompt', status: 'ACTIVE', priority: 1 },
  { id: '0prFAKE000000000002', name: 'Off-network step-up', status: 'INACTIVE', priority: 2 },
  {
    id: '0prFAKE000000000003',
    name: 'Catch-all Rule',
    status: 'ACTIVE',
    priority: 3,
    system: true,
  },
] as OktaPolicyRule[];

const meta = {
  title: 'Policies/PolicyRulesList',
  component: PolicyRulesList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "A read-only list of one auth policy's rules, showing only the validated scalar " +
          'fields: evaluation priority, name, status and whether the rule is Okta-managed. A ' +
          "rule's `conditions` and `actions` vary by policy type, are `unknown` by contract, " +
          'and are never read here. The loading, error and empty states belong to this list.',
      },
    },
  },
  argTypes: {
    rules: { description: "The policy's validated rules; null until the first load resolves." },
    isLoading: { description: 'Whether the rules fetch is in flight with nothing yet to show.' },
    error: { description: 'Message from a failed rules fetch, or null.' },
  },
  args: {
    rules: sampleRules,
    isLoading: false,
    error: null,
  },
} satisfies Meta<typeof PolicyRulesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { rules: null, isLoading: true },
};

export const ErrorState: Story = {
  args: { rules: null, error: 'Policy rules unavailable' },
};

export const Empty: Story = {
  args: { rules: [] },
};

export const SparseRule: Story = {
  args: {
    rules: [{ id: '0prFAKE000000000009' }] as OktaPolicyRule[],
  },
};
