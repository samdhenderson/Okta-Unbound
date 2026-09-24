import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useEffect, useState } from 'react';
import WelcomeView from './WelcomeView';

const CONNECT_AFTER = 900;

const meta = {
  title: 'Sidepanel/Welcome/WelcomeView',
  component: WelcomeView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shown instead of the shell until the reader presses one of its two buttons. ' +
          'Pure render: `useWelcomeGate` decides whether it shows and records the press. ' +
          'The line at the foot has exactly two states, driven by `connectionStatus` and ' +
          '`oktaOrigin`: not connected, or connected to a named hostname.',
      },
    },
  },
  argTypes: {
    connectionStatus: {
      description: 'Whether the panel has a live Okta tab. Only `connected` names a host.',
    },
    oktaOrigin: {
      description: 'Origin of the connected org. Its hostname is parsed with the URL API.',
    },
    onOpenGuide: { description: 'Pressed "Open the user guide".' },
    onDismiss: { description: 'Pressed "Start using it".' },
  },
  args: {
    connectionStatus: 'connected',
    oktaOrigin: 'https://example.okta.com',
    onOpenGuide: fn(),
    onDismiss: fn(),
  },
} satisfies Meta<typeof WelcomeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Connected to example.okta.com. You're set.")).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Start using it' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onOpenGuide).not.toHaveBeenCalled();
  },
};

export const NotConnected: Story = {
  args: {
    connectionStatus: 'connecting',
    oktaOrigin: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Open an Okta admin tab to connect.')).toBeVisible();
  },
};

export const Arrival: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Welcome to Okta Unbound' })).toBeVisible();
    await expect(canvas.getByText("Connected to example.okta.com. You're set.")).toBeVisible();
  },
};

export const Connects: Story = {
  parameters: { motion: 'on' },
  args: {
    connectionStatus: 'connecting',
    oktaOrigin: null,
  },
  render: function ConnectsHarness(args) {
    const [connected, setConnected] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => setConnected(true), CONNECT_AFTER);
      return () => clearTimeout(timer);
    }, []);
    return (
      <WelcomeView
        {...args}
        connectionStatus={connected ? 'connected' : args.connectionStatus}
        oktaOrigin={connected ? 'https://example.okta.com' : args.oktaOrigin}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Open an Okta admin tab to connect.')).toBeVisible();
    await expect(
      await canvas.findByText("Connected to example.okta.com. You're set.", undefined, {
        timeout: CONNECT_AFTER * 4,
      }),
    ).toBeVisible();
  },
};
