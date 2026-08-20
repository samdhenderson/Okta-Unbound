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
          'Every verb whose object is the whole user (ADR-0030) — but they are not equal, and a flat ' +
          'row of five buttons said they were.\n\n' +
          'The **row** holds the verbs you reach for while reading: *Add group* (the primary, and the ' +
          'one that never overflows) then *Compare*, which is the first to move behind **More** when ' +
          'the panel tightens. The **disclosure tier** holds the account-state verbs. Suspending ' +
          'someone is one press further away than comparing them, which is the whole point of the ' +
          'tier — and `Each asks to confirm` is stated once for the band rather than implied per ' +
          'button.\n\n' +
          'The disclosure belongs to the shared `ActionBar`, not to this component: the strip renders ' +
          'its own **More** control, owns the region it opens and owns that region’s `aria-controls` ' +
          'target. `UserActionBar` only decides what sits on each side of it — two descriptors in the ' +
          'row, `UserLifecycleActions` in the `expansion` slot — which is why there is no disclosure ' +
          'button in its source.\n\n' +
          'Because the tier is that `expansion` slot it sits inside the strip, shares its chrome, ' +
          'docks with it, and opens by stretching the strip downward through the shared `.disclose` ' +
          'grid. Its contents stay mounted while closed, held out of the tab order and the accessible ' +
          'tree with `inert`.\n\n' +
          '**There is no Export button and no Clear sessions button, deliberately.** The Export tab ' +
          'has no user-scoped descriptor to open (`users` is whole-org; the `search-to-select` ' +
          'descriptors take a group or an app), and `useUserLifecycleActions` implements ' +
          '`suspend | unsuspend | resetPassword` and nothing else. A control that does nothing is ' +
          'worse than an absent one.\n\n' +
          'Gating is unchanged from the `Lifecycle Actions` card this replaced: Suspend for an ' +
          '`ACTIVE` user, Unsuspend for a `SUSPENDED` one, Reset password for the four statuses Okta ' +
          'accepts it for, and a notice instead of the band for `DEPROVISIONED`.',
      },
    },
  },
  args: {
    user: user(),
    onCompare: fn(),
    onAddToGroup: fn(),
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
