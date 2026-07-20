import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import UserLifecycleActions from './UserLifecycleActions';
import { mockUsers } from '../../../test/mocks/handlers';
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
  parameters: { layout: 'padded' },
  args: {
    user: user(),
    isLifecycleLoading: false,
    pendingLifecycleAction: null,
    onRequestAction: fn(),
    onCancel: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof UserLifecycleActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Suspended: Story = {
  args: { user: user({ status: 'SUSPENDED' }) },
};

export const Deprovisioned: Story = {
  args: { user: user({ status: 'DEPROVISIONED' }) },
};

export const Loading: Story = {
  args: { isLifecycleLoading: true },
};

export const ConfirmingSuspend: Story = {
  args: { pendingLifecycleAction: 'suspend' },
};

export const ConfirmingResetPassword: Story = {
  args: { pendingLifecycleAction: 'resetPassword' },
};
