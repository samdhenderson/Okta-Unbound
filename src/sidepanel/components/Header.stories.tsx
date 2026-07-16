import type { Meta, StoryObj } from '@storybook/react-vite';
import Header from './Header';

const meta = {
  title: 'Sidepanel/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    status: 'connected',
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Connecting: Story = {
  args: { status: 'connecting' },
};

export const Error: Story = {
  args: { status: 'error' },
};
