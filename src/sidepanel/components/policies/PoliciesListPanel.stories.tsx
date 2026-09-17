import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import PoliciesListPanel from './PoliciesListPanel';
import { resetEntityCache } from '../../cache/entityCache';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';

const samplePolicies = [
  {
    id: 'rstFAKE000000000001',
    name: 'Any two factors',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 1,
    description: 'Requires two factors for high-risk applications',
  },
  {
    id: 'rstFAKE000000000002',
    name: 'Contractor sign-on',
    status: 'INACTIVE',
    type: 'ACCESS_POLICY',
    priority: 2,
    description: 'Device-bound access for external contractors',
  },
  {
    id: 'rstFAKE000000000003',
    name: 'Default Policy',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 3,
    system: true,
  },
] as OktaPolicyListItem[];

const sampleRules = [
  {
    id: '0prFAKE000000000001',
    name: 'Catch-all Rule',
    status: 'ACTIVE',
    priority: 1,
    system: true,
  },
] as OktaPolicyRule[];

const meta = {
  title: 'Policies/PoliciesListPanel',
  component: PoliciesListPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Auth Policies tab's list region: a scrollable list of policy cards, and the " +
          'right empty state for the situation. "Nothing loaded" also carries the admin-role ' +
          'caveat, because a `403` on the policies endpoint is indistinguishable from an org ' +
          'with no policies.',
      },
    },
  },
  argTypes: {
    isLoading: { description: 'Whether a policy load is in flight.' },
    policies: { description: 'Policies after the search filter — what actually renders.' },
    hasPolicies: { description: 'Whether any policies are loaded (picks the empty state).' },
    onLoad: { description: "Load the policy list (the empty state's action)." },
    loadRules: { description: "Fetches a policy's rules for the expanded card." },
    selectedIds: {
      description: "Every basket id of kind 'policy', including ones ticked elsewhere.",
    },
    onToggleSelect: { description: "Tick or untick one card's policy." },
  },
  args: {
    isLoading: false,
    policies: samplePolicies,
    hasPolicies: true,
    readState: 'listed',
    onLoad: fn(),
    loadRules: fn(async () => sampleRules),
    totalCount: 3,
    selectedIds: new Set<string>(),
    onToggleSelect: fn(),
  },
  beforeEach: () => {
    resetEntityCache();
  },
} satisfies Meta<typeof PoliciesListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExpandingACard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show rules for Any two factors' }));
    await expect(await canvas.findByText('Catch-all Rule')).toBeInTheDocument();
    await expect(args.loadRules).toHaveBeenCalledWith('rstFAKE000000000001');
  },
};

export const Loading: Story = {
  args: { isLoading: true, policies: [], hasPolicies: false },
};

export const NoPolicies: Story = {
  args: { policies: [], hasPolicies: false, readState: 'listed' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Okta reports this org has no app authentication policies.'),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reload policies' }));
    await expect(args.onLoad).toHaveBeenCalled();
  },
};

export const ReadForbidden: Story = {
  args: { policies: [], hasPolicies: false, readState: 'forbidden' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Policies are not readable by this admin role'),
    ).toBeInTheDocument();
    await expect(canvas.queryByText(/ — or /)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
    await expect(args.onLoad).toHaveBeenCalled();
  },
};

export const NotLoaded: Story = {
  args: { policies: [], hasPolicies: false, readState: 'unread' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing has been read from Okta yet.')).toBeInTheDocument();
  },
};

export const NoSearchMatches: Story = {
  args: { policies: [], hasPolicies: true },
};

export const WithSelection: Story = {
  args: { selectedIds: new Set([samplePolicies[0].id]) },
};
