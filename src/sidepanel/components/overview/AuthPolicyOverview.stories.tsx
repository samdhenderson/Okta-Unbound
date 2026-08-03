import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AuthPolicyOverview from './AuthPolicyOverview';
import { useOktaApi, makeUseOktaApiValue } from '../../../../.storybook/mocks/useOktaApi.mock';

const sampleRules = [
  { id: 'rulFAKE001', name: 'Allow trusted network', status: 'ACTIVE', priority: 1 },
  { id: 'rulFAKE002', name: 'Require MFA off-network', status: 'ACTIVE', priority: 2 },
  { id: 'rulFAKE003', name: 'Legacy client catch-all', status: 'INACTIVE', priority: 3 },
];

const withRules = (rules: unknown[]) =>
  makeUseOktaApiValue({ getPolicyRules: fn(async () => rules) });

const meta = {
  title: 'Overview/AuthPolicyOverview',
  component: AuthPolicyOverview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    policyId: { description: 'Detected Okta policy id.' },
    policyName: { description: 'Detected display name; null when none was resolved.' },
    policyStatus: { description: 'Lifecycle status, when page detection resolved one.' },
    targetTabId: { description: 'Tab hosting the Okta session; every call is routed to it.' },
  },
  args: {
    policyId: 'rstFAKE0123456789abc',
    policyName: 'Contractor MFA',
    policyStatus: 'ACTIVE',
    targetTabId: 1,
  },
  beforeEach: () => {
    useOktaApi.mockReturnValue(withRules(sampleRules));
  },
} satisfies Meta<typeof AuthPolicyOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UnnamedPolicy: Story = {
  args: { policyId: 'rstFAKE0123456789unn', policyName: null, policyStatus: undefined },
};

export const NoRules: Story = {
  args: { policyId: 'rstFAKE0123456789emp' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(withRules([]));
  },
};

export const Loading: Story = {
  args: { policyId: 'rstFAKE0123456789ldg' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({ getPolicyRules: fn(() => new Promise(() => {})) }),
    );
  },
};

export const RulesUnavailable: Story = {
  args: { policyId: 'rstFAKE0123456789err' },
  beforeEach: () => {
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        getPolicyRules: fn(async () => {
          throw new Error('You do not have permission to read this policy.');
        }),
      }),
    );
  },
};
