import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import AuthPoliciesTab from './AuthPoliciesTab';
import { useOktaApi, makeUseOktaApiValue } from '../../../.storybook/mocks/useOktaApi.mock';
import { resetEntityCache } from '../cache/entityCache';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../shared/schemas/okta';

const samplePolicies = [
  {
    id: 'rstFAKE000000000001',
    name: 'Any two factors',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 1,
    description: 'Requires two factors for high-risk applications',
    system: false,
    created: '2026-01-15T09:00:00.000Z',
    lastUpdated: '2026-06-02T11:30:00.000Z',
  },
  {
    id: 'rstFAKE000000000002',
    name: 'Contractor sign-on',
    status: 'INACTIVE',
    type: 'ACCESS_POLICY',
    priority: 2,
    description: 'Device-bound access for external contractors',
    system: false,
    created: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'rstFAKE000000000003',
    name: 'Default Policy',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 3,
    description: 'Catch-all policy applied to apps with no explicit policy',
    system: true,
  },
] as OktaPolicyListItem[];

const sampleRules = [
  {
    id: '0prFAKE000000000001',
    name: 'Trusted device, no prompt',
    status: 'ACTIVE',
    priority: 1,
  },
  { id: '0prFAKE000000000002', name: 'Off-network step-up', status: 'ACTIVE', priority: 2 },
  {
    id: '0prFAKE000000000003',
    name: 'Catch-all Rule',
    status: 'ACTIVE',
    priority: 3,
    system: true,
  },
] as OktaPolicyRule[];

const meta = {
  title: 'Policies/AuthPoliciesTab',
  component: AuthPoliciesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "Auth Policies tab shell: browse and search the org's app authentication policies, with each card's rules fetched lazily on expand.\n\n" +
          "Read-only by construction. Because Okta's policy endpoints are commonly forbidden for non-super-admins, a `403` is indistinguishable from an empty org, so the empty state names both.",
      },
    },
  },
  argTypes: {
    targetTabId: {
      description: 'Chrome tab id of the connected Okta tab; the load is skipped when absent.',
    },
    isActive: {
      description: 'Whether this is the selected top-level tab; the load defers until it is.',
    },
    selectedPolicyId: {
      description: 'A policy to arrive at, applied once as a filter then cleared.',
    },
  },
  args: {
    targetTabId: 1,
  },
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        listPolicies: fn(async () => ({ outcome: 'listed', policies: samplePolicies })),
        getPolicyRules: fn(async () => sampleRules),
      }),
    );
  },
} satisfies Meta<typeof AuthPoliciesTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        listPolicies: fn(() => new Promise<never>(() => {})),
      }),
    );
  },
};

export const Empty: Story = {
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        listPolicies: fn(async () => ({ outcome: 'listed', policies: [] })),
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Okta reports this org has no app authentication policies.'),
    ).toBeInTheDocument();
  },
};

export const ReadForbidden: Story = {
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({ listPolicies: fn(async () => ({ outcome: 'forbidden' })) }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Policies are not readable by this admin role'),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  },
};

export const ErrorState: Story = {
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        listPolicies: fn(async () => ({
          outcome: 'failed' as const,
          message: 'Failed to fetch auth policies',
        })),
      }),
    );
  },
};

export const ExpandedRules: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', { name: 'Show rules for Any two factors' });
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText('Trusted device, no prompt')).toBeInTheDocument());
  },
};

export const RulesLoadFailure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', { name: 'Show rules for Any two factors' });
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText(/Could not load rules/)).toBeInTheDocument());
  },
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(
      makeUseOktaApiValue({
        listPolicies: fn(async () => ({ outcome: 'listed', policies: samplePolicies })),
        getPolicyRules: fn(async () => {
          throw new Error('Policy rules unavailable');
        }),
      }),
    );
  },
};

export const SearchFiltersList: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = await canvas.findByRole('searchbox', { name: 'Search auth policies' });
    await userEvent.type(search, 'contractor');
    await waitFor(() => expect(canvas.getByText('Contractor sign-on')).toBeInTheDocument());
    await expect(canvas.queryByText('Any two factors')).not.toBeInTheDocument();
  },
};

export const Disconnected: Story = {
  args: { targetTabId: undefined },
};
