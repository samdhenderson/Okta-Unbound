import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './Button';
import PageHeader from './PageHeader';

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Groups',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Manage Okta group membership',
  },
};

export const WithBadgePrimary: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Beta', variant: 'primary' },
  },
};

export const WithBadgeSuccess: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Active', variant: 'success' },
  },
};

export const WithBadgeWarning: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Caution', variant: 'warning' },
  },
};

export const WithBadgeError: Story = {
  args: {
    title: 'Groups',
    badge: { text: 'Error', variant: 'error' },
  },
};

export const WithActions: Story = {
  args: {
    title: 'Groups',
    actions: <Button icon="plus">New Group</Button>,
  },
};

export const Full: Story = {
  args: {
    title: 'Groups',
    subtitle: 'Manage Okta group membership',
    badge: { text: 'Beta', variant: 'primary' },
    actions: <Button icon="plus">Add Group</Button>,
  },
};
