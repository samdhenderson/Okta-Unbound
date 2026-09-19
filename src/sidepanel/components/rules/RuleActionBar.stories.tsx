import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RuleActionBar from './RuleActionBar';
import type { FormattedRule } from '../../../shared/types';

const rule = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  id: '00rFAKE0000000000001',
  name: 'Engineering – Auto-assign by department',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00g1a2b3c4d5e6f7g8h9', '00g9z8y7x6w5v4u3t2s1'],
  groupNames: ['Engineering – All', 'Slack – Eng Channel'],
  userAttributes: ['department'],
  created: '2024-01-15T09:00:00.000Z',
  lastUpdated: '2026-06-01T14:30:00.000Z',
  ...over,
});

const meta = {
  title: 'Rules/RuleActionBar',
  component: RuleActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every verb whose object is the whole rule. The row holds only what is ' +
          'read-only — *Preview impact*, which works out who would stop being attributed and ' +
          'writes nothing, and which is therefore also the `primary`.\n\n' +
          'Activate and deactivate look like a reversible pair and are not: Okta’s rule ' +
          'engine only ever adds, so activating writes memberships deactivating will not take ' +
          'back, and deactivating strands memberships reactivating will not re-attribute. ' +
          'Both start behind **More**, with the consequence stated beside the control, as ' +
          'does *Add target group* — a wizard in front of a verb does not move it into the ' +
          'row. There is no Delete and no Edit condition because neither has a live handler.\n\n' +
          '*Evaluate user* is read-only too, so it sits in the row — but it fetches a subject ' +
          '(two requests), so it is never `primary` and names its cost in its tooltip. With no ' +
          'Okta tab it is omitted, never disabled (ADR-0010).',
      },
    },
  },
  args: {
    rule: rule(),
    onPreviewImpact: fn(),
    onCheckUser: fn(),
    tierOpen: false,
    onTierOpenChange: fn(),
    isLifecycleLoading: false,
    isConfirmingActivate: false,
    onRequestActivate: fn(),
    onCancelActivate: fn(),
    onConfirmActivate: fn(),
    onRequestDeactivate: fn(),
    onAddTargetGroup: fn(),
    sticky: false,
  },
  argTypes: {
    rule: { description: 'The rule every verb in the strip acts on.' },
    onPreviewImpact: { description: 'Opens the read-only impact preview.' },
    onCheckUser: {
      description: 'Opens the user picker for a qualification check. Omitted with no tab.',
    },
    tierOpen: { description: 'Whether the disclosure tier is showing. Owned by the tab.' },
    onTierOpenChange: { description: 'Called with the tier’s next open state.' },
    isLifecycleLoading: { description: 'True while a confirmed lifecycle write is in flight.' },
    isConfirmingActivate: { description: 'Whether the activation confirm is armed.' },
    onAddTargetGroup: { description: 'Starts the consolidation wizard.' },
    sticky: { description: 'Pin the strip below the header.' },
  },
} satisfies Meta<typeof RuleActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TierOpenActive: Story = {
  args: { tierOpen: true },
};

export const TierOpenInactive: Story = {
  args: { tierOpen: true, rule: rule({ status: 'INACTIVE' }) },
};

export const ConfirmingActivate: Story = {
  args: { tierOpen: true, rule: rule({ status: 'INACTIVE' }), isConfirmingActivate: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Activate' }));
    await expect(args.onConfirmActivate).toHaveBeenCalledTimes(1);
  },
};

export const TierOpenLifecycleRunning: Story = {
  args: { tierOpen: true, isLifecycleLoading: true },
};

export const WithoutConsolidation: Story = {
  args: { tierOpen: true, onAddTargetGroup: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('button', { name: 'Add target group' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Deactivate rule/ })).toBeInTheDocument();
  },
};

export const CheckAUserInTheRow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const check = canvas.getByRole('button', { name: 'Evaluate user' });
    await expect(check).toHaveAttribute('title', expect.stringMatching(/two requests/));
    await userEvent.click(check);
    await expect(args.onCheckUser).toHaveBeenCalledTimes(1);
  },
};

export const NoTabToCheckFrom: Story = {
  args: { onCheckUser: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Evaluate user' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Preview impact' })).toBeInTheDocument();
  },
};

export const NoTargetGroups: Story = {
  args: { rule: rule({ groupIds: [], groupNames: [] }), onPreviewImpact: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Preview impact' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'More' })).toBeInTheDocument();
  },
};

export const MoreIsADisclosure: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a story render fn is a component
    const [open, setOpen] = useState(false);
    return <RuleActionBar {...args} tierOpen={open} onTierOpenChange={setOpen} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: /Deactivate rule/ })).toBeVisible();

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
  },
};

export const NarrowTierOpen: Story = {
  args: { tierOpen: true },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
