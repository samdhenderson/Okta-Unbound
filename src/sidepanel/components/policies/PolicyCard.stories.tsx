import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import PolicyCard from './PolicyCard';
import { resetEntityCache } from '../../cache/entityCache';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../../shared/schemas/okta';

const samplePolicy = {
  id: 'rstFAKE000000000001',
  name: 'Any two factors',
  status: 'ACTIVE',
  type: 'ACCESS_POLICY',
  priority: 1,
  description: 'Requires two factors for high-risk applications',
  system: false,
} as OktaPolicyListItem;

const sampleRules = [
  { id: '0prFAKE000000000001', name: 'Trusted device, no prompt', status: 'ACTIVE', priority: 1 },
  {
    id: '0prFAKE000000000002',
    name: 'Catch-all Rule',
    status: 'ACTIVE',
    priority: 2,
    system: true,
  },
] as OktaPolicyRule[];

const meta = {
  title: 'Policies/PolicyCard',
  component: PolicyCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Expandable, read-only card for a single app authentication policy.\n\n' +
          'Collapsed it shows the policy name, status pill, evaluation priority, a `System` badge ' +
          "for Okta-managed policies and the description. Expanding lazily fetches the policy's " +
          'rules through the entity cache (keyed `["policyRules", id]`), so collapsing and ' +
          're-expanding — or re-mounting after a tab switch — costs no second request. The card ' +
          'renders no activate/deactivate or any other mutation affordance.',
      },
    },
  },
  argTypes: {
    policy: { description: 'The validated policy to display.' },
    loadRules: { description: "Fetches a policy's rules (the tab passes `api.getPolicyRules`)." },
    selected: {
      description:
        "Whether this policy is in the selection basket; a ticked card paints ListRow's selected state.",
    },
    onToggleSelect: {
      description: 'Tick or untick this policy. Omitted ⇒ no checkbox renders at all.',
    },
  },
  args: {
    policy: samplePolicy,
    loadRules: fn(async () => sampleRules),
  },
  beforeEach: () => {
    resetEntityCache();
  },
} satisfies Meta<typeof PolicyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SystemPolicy: Story = {
  args: {
    policy: {
      id: 'rstFAKE000000000003',
      name: 'Default Policy',
      status: 'ACTIVE',
      type: 'ACCESS_POLICY',
      priority: 99,
      system: true,
    } as OktaPolicyListItem,
  },
};

export const Inactive: Story = {
  args: {
    policy: {
      ...samplePolicy,
      id: 'rstFAKE000000000002',
      status: 'INACTIVE',
    } as OktaPolicyListItem,
  },
};

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show rules for Any two factors' }));
    await waitFor(() => expect(canvas.getByText('Trusted device, no prompt')).toBeInTheDocument());
    await expect(
      canvas.getByRole('button', {
        name: `Copy policy id for Any two factors (${samplePolicy.id})`,
      }),
    ).toBeInTheDocument();
  },
};

export const HeaderClickToggles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show rules' }));
    await waitFor(() => expect(canvas.getByText('Trusted device, no prompt')).toBeInTheDocument());
    await expect(canvas.getByRole('button', { name: 'Hide rules' })).toBeInTheDocument();
  },
};

export const KeyboardToggles: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Show rules for Any two factors' });
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByText('Trusted device, no prompt')).toBeInTheDocument());
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  },
};

export const RulesLoadFailure: Story = {
  args: {
    loadRules: fn(async () => {
      throw new Error('Policy rules unavailable');
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show rules for Any two factors' }));
    await waitFor(() => expect(canvas.getByText(/Could not load rules/)).toBeInTheDocument());
  },
};

export const DuplicateNamesStayDistinguishable: Story = {
  render: (args) => (
    <div className="space-y-2">
      <PolicyCard {...args} policy={{ ...samplePolicy, id: 'rstFAKE000000000001' }} />
      <PolicyCard {...args} policy={{ ...samplePolicy, id: 'rstFAKE000000000004' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggles = canvas.getAllByRole('button', { name: 'Show rules for Any two factors' });
    expect(toggles).toHaveLength(2);
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);

    await expect(
      canvas.getByRole('button', {
        name: 'Copy policy id for Any two factors (rstFAKE000000000001)',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: 'Copy policy id for Any two factors (rstFAKE000000000004)',
      }),
    ).toBeInTheDocument();
  },
};

export const Selectable: Story = {
  args: { onToggleSelect: fn() },
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Select Any two factors' });
    await expect(box).not.toBeChecked();

    await userEvent.click(box);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(samplePolicy.id);
  },
};

export const Selected: Story = {
  args: { onToggleSelect: fn(), selected: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Select Any two factors' })).toBeChecked();
  },
};
