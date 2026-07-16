import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const Thrower: React.FC = () => {
  throw new Error('Simulated render failure for Storybook');
};

const Healthy: React.FC = () => (
  <div style={{ padding: 24 }}>Everything is fine — this is the guarded subtree.</div>
);

const meta = {
  title: 'Sidepanel/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    children: <Healthy />,
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CaughtError: Story = {
  tags: ['!test'],
  args: {
    children: <Thrower />,
  },
};
