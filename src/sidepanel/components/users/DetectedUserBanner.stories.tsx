import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import DetectedUserBanner from './DetectedUserBanner';

const meta = {
  title: 'Users/DetectedUserBanner',
  component: DetectedUserBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
    isLoading: false,
    onLoad: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof DetectedUserBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Deprovisioned: Story = {
  args: { userInfo: { userId: 'u2', userName: 'Grace Hopper', userStatus: 'DEPROVISIONED' } },
};

export const Suspended: Story = {
  args: { userInfo: { userId: 'u3', userName: 'Alan Turing', userStatus: 'SUSPENDED' } },
};

export const NoStatus: Story = {
  args: { userInfo: { userId: 'u4', userName: 'Katherine Johnson' } },
};

export const Loading: Story = {
  args: { isLoading: true },
};
