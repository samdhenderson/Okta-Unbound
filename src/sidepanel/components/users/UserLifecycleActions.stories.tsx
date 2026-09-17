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
          'the pending-action state and the API call.\n\n' +
          '**Reset password is one verb with four modes.** The strip shows one button because ' +
          'the admin has one question; the confirm is where it forks into a reset email, a ' +
          'direct set, a one-time set, and a generated temporary value — each with its ' +
          'consequence beside it. A generated value is shown once, in its own dialog, because ' +
          'Okta will not return it again.',
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
    tempPassword: null,
    onDismissTempPassword: fn(),
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
    tempPassword: {
      description: 'The one-time password Okta generated, or null when there is none to read out.',
    },
    onDismissTempPassword: { description: 'Drop the one-time password when its dialog closes.' },
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
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await expect(dialog.getByRole('button', { name: 'Send Reset Email' })).toBeEnabled();
    await expect(dialog.queryByLabelText('New password')).not.toBeInTheDocument();
  },
};

export const SettingAPassword: Story = {
  args: { pendingLifecycleAction: 'resetPassword' },
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await userEvent.selectOptions(
      dialog.getByRole('combobox', { name: 'What should happen' }),
      'set',
    );

    const confirm = dialog.getByRole('button', { name: 'Set Password' });
    await expect(confirm).toBeDisabled();

    await userEvent.type(dialog.getByLabelText('New password'), 'FAKE-value-1');
    await expect(confirm).toBeEnabled();

    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledWith({
      mode: 'set',
      password: 'FAKE-value-1',
    });
  },
};

export const RevealingAGeneratedPassword: Story = {
  args: { pendingLifecycleAction: 'resetPassword' },
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await userEvent.selectOptions(
      dialog.getByRole('combobox', { name: 'What should happen' }),
      'set',
    );
    await expect(dialog.getByLabelText('New password')).toHaveAttribute('type', 'password');

    await userEvent.click(dialog.getByRole('button', { name: 'Generate' }));

    const field = dialog.getByLabelText('New password') as HTMLInputElement;
    await expect(field).toHaveAttribute('type', 'text');
    await expect(field.value.length).toBeGreaterThan(11);
  },
};

export const ShowingATemporaryPassword: Story = {
  args: { tempPassword: 'TempFAKE123' },
  play: async ({ args }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));

    await expect(dialog.getByText('TempFAKE123')).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Done' }));
    await expect(args.onDismissTempPassword).toHaveBeenCalled();
  },
};

export const Narrow: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
