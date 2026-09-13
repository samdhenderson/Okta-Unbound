import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import UserLifecycleActions from './UserLifecycleActions';
import { mockUsers } from '../../../test/mocks/fixtures';
import type { OktaUser } from '../../../shared/types';

const user = (over: Partial<OktaUser> = {}): OktaUser => ({
  ...mockUsers[10],
  status: 'ACTIVE',
  ...over,
});

const meta = {
  title: 'Users/UserLifecycleActions',
  component: UserLifecycleActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Manage tier's body on the user-detail rung: the account-state verbs plus their " +
          'confirmation modal, gated by user status. Reading order is deliberate — the ' +
          'non-destructive verbs first, a rule, then the destructive one alone with its ' +
          'consequence stated beside it.\n\n' +
          'Offers only the actions valid for the current status: Reset password + Suspend for ' +
          'ACTIVE, Unsuspend for SUSPENDED, Reset password alone for RECOVERY / LOCKED_OUT / ' +
          'PASSWORD_EXPIRED, and a notice for DEPROVISIONED. Presentational: the parent owns ' +
          'the pending-action state and the API call.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="rounded-b-md border border-neutral-200 bg-white px-4 py-3">
        <Story />
      </div>
    ),
  ],
  args: {
    user: user(),
    isLifecycleLoading: false,
    pendingLifecycleAction: null,
    onRequestAction: fn(),
    onCancel: fn(),
    onConfirm: fn(),
  },
  argTypes: {
    user: { description: 'The selected user the actions apply to.' },
    isLifecycleLoading: {
      description: 'True while a confirmed action is in flight (disables the trigger buttons).',
    },
    pendingLifecycleAction: {
      description: 'The action awaiting confirmation, or null. Drives the confirm modal.',
    },
    onRequestAction: { description: 'Arm the confirm modal for an action.' },
    onCancel: { description: 'Dismiss the confirm modal without running the action.' },
    onConfirm: { description: 'Run the armed action (the confirm button).' },
  },
} satisfies Meta<typeof UserLifecycleActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Suspend user' }));
    await expect(args.onRequestAction).toHaveBeenCalledWith('suspend');
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const Suspended: Story = {
  args: { user: user({ status: 'SUSPENDED' }) },
};

export const LockedOut: Story = {
  args: { user: user({ status: 'LOCKED_OUT' }) },
};

export const Deprovisioned: Story = {
  args: { user: user({ status: 'DEPROVISIONED' }) },
};

export const Loading: Story = {
  args: { isLifecycleLoading: true },
};

export const ConfirmingSuspend: Story = {
  args: { pendingLifecycleAction: 'suspend' },
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await userEvent.click(dialog.getByRole('button', { name: 'Suspend' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const ConfirmingResetPassword: Story = {
  args: { pendingLifecycleAction: 'resetPassword' },
};

export const Narrow: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
