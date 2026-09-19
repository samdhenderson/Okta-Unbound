import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserActionBar from './UserActionBar';
import { mockUsers } from '../../../test/mocks/fixtures';
import type { OktaUser } from '../../../shared/types';

const user = (over: Partial<OktaUser> = {}): OktaUser => ({
  ...mockUsers[10],
  status: 'ACTIVE',
  ...over,
});

const meta = {
  title: 'Users/UserActionBar',
  component: UserActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every verb whose object is the whole user, ranked rather than flattened. The row ' +
          'holds what you reach for while reading — *Add group* (the primary) and *Compare* — ' +
          'and the disclosure tier holds the account-state verbs, so suspending someone is one ' +
          'press further away than comparing them.\n\n' +
          'The disclosure belongs to the shared `ActionBar`: it renders **More**, owns the ' +
          'region and owns that region’s `aria-controls` target, which is why there is no ' +
          'disclosure button in this component’s source. Gating follows status — Suspend for ' +
          '`ACTIVE`, Unsuspend for `SUSPENDED`, and a notice instead of the band for ' +
          '`DEPROVISIONED`.\n\n' +
          '*Check rule* and *Check membership* are zero-request checks over the user the rung ' +
          'already holds; each is offered only when wired (the inventory, a tab) and omitted ' +
          'otherwise (ADR-0010).',
      },
    },
  },
  args: {
    user: user(),
    onCompare: fn(),
    onAddToGroup: fn(),
    onCheckRule: fn(),
    onWhyNotMember: fn(),
    isLoadingMemberships: false,
    tierOpen: false,
    onTierOpenChange: fn(),
    isLifecycleLoading: false,
    pendingLifecycleAction: null,
    onRequestLifecycleAction: fn(),
    onCancelLifecycleAction: fn(),
    onConfirmLifecycleAction: fn(),
    sticky: false,
  },
  argTypes: {
    user: { description: 'The user every verb in the strip acts on.' },
    onCompare: { description: 'Opens the comparison rung.' },
    onAddToGroup: { description: 'Opens the Add-to-Group modal.' },
    onCheckRule: {
      description: 'Opens the rule picker. Omitted until the inventory is available.',
    },
    onWhyNotMember: { description: 'Opens the group picker. Omitted with no tab.' },
    isLoadingMemberships: {
      description: 'True while memberships load — both row verbs need them, so both disable.',
    },
    tierOpen: {
      description:
        'Whether the disclosure tier is showing. Owned by the tab, so a rung change collapses it.',
    },
    onTierOpenChange: {
      description: 'Called with the tier’s next open state when **More** is pressed.',
    },
    isLifecycleLoading: { description: 'True while a confirmed lifecycle action is in flight.' },
    pendingLifecycleAction: { description: 'The action awaiting confirmation, or `null`.' },
    sticky: {
      description: 'Pin the strip below the header. `false` in stories — nothing scrolls.',
    },
  },
} satisfies Meta<typeof UserActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QualificationChecks: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Check rule' }));
    await expect(args.onCheckRule).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Check membership' }));
    await expect(args.onWhyNotMember).toHaveBeenCalledTimes(1);
  },
};

export const ChecksNotWired: Story = {
  args: { onCheckRule: undefined, onWhyNotMember: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Check rule' })).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Check membership' }),
    ).not.toBeInTheDocument();
  },
};

export const LoadingMemberships: Story = {
  args: { isLoadingMemberships: true },
};

export const TierOpenActive: Story = {
  args: { tierOpen: true },
};

export const TierOpenSuspended: Story = {
  args: { tierOpen: true, user: user({ status: 'SUSPENDED' }) },
};

export const TierOpenDeprovisioned: Story = {
  args: { tierOpen: true, user: user({ status: 'DEPROVISIONED' }) },
};

export const TierOpenLifecycleRunning: Story = {
  args: { tierOpen: true, isLifecycleLoading: true },
};

export const ConfirmingSuspend: Story = {
  args: { tierOpen: true, pendingLifecycleAction: 'suspend' },
};

export const MoreIsADisclosure: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a story render fn is a component
    const [open, setOpen] = useState(false);
    return <UserActionBar {...args} tierOpen={open} onTierOpenChange={setOpen} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const manage = canvas.getByRole('button', { name: 'More' });
    await expect(manage).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(manage);
    await expect(manage).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: /Suspend user/ })).toBeVisible();

    await userEvent.click(manage);
    await expect(manage).toHaveAttribute('aria-expanded', 'false');
  },
};

export const NarrowTierOpen: Story = {
  args: { tierOpen: true },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
