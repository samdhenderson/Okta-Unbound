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
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Top-level React error boundary for the side panel.\n\n' +
          'Passes children through normally, and when a descendant throws during render it catches the error, logs it via the shared logger, and shows a recoverable fallback with expandable error details plus "Try Again" (reset the boundary) and "Reload Extension" actions.',
      },
    },
  },
  argTypes: {
    children: { description: 'Subtree to render and guard against uncaught errors.' },
  },
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
