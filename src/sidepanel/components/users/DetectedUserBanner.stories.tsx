import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import DetectedUserBanner from './DetectedUserBanner';

const meta = {
  title: 'Users/DetectedUserBanner',
  component: DetectedUserBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Presentational "detected in admin" banner for the Users tab.\n\n' +
          'Shown when the Okta admin page has a user open that differs from the one explicitly selected in the tab. Renders the detected user with a status-colored badge (success / warning / danger, omitted when no status is known). Loading is MANUAL only — the Load button — so admin navigation never hijacks the tab; all visibility/dismiss logic lives in the parent and this component only forwards Load / Dismiss intent.',
      },
    },
  },
  args: {
    userInfo: { userId: 'u1', userName: 'Ada Lovelace', userStatus: 'ACTIVE' },
    isLoading: false,
    onLoad: fn(),
    onDismiss: fn(),
  },
  argTypes: {
    userInfo: { description: 'The user detected on the current Okta admin page.' },
    isLoading: { description: 'Disables the Load button while a load/analysis is in flight.' },
    onLoad: { description: 'Load the detected user + their memberships into the tab.' },
    onDismiss: { description: 'Dismiss the banner without loading.' },
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
