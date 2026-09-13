import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import GroupAppRow from './GroupAppRow';
import type { GroupAppRowModel } from '../groupAppSource';

const row: GroupAppRowModel = {
  id: '0oaFAKE1',
  label: 'Slack',
  status: 'ACTIVE',
  statusVariant: 'success',
  signOnMode: 'SAML_2_0',
  lastUpdated: new Date('2025-11-14T09:30:00Z'),
  push: { state: 'not-pushed' },
};

const meta = {
  title: 'Groups/GroupAppRow',
  component: GroupAppRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One assigned app: what it is, whether it is live, and — behind the disclosure — how ' +
          'it is wired. Every field comes from the group’s own apps response, so the row costs ' +
          'no extra request.\n\n' +
          'Absent is absent: a row that reported no status gets no badge rather than one ' +
          'reading "Unknown". Push is three-state, and `unknown` says nothing at all — ' +
          '`GroupPushSection` remains the complete account, because a group can be pushed to an ' +
          'app it is not assigned to.',
      },
    },
  },
  argTypes: {
    row: { description: "The row's whole rendered model, derived by `groupAppSource`." },
    expanded: { description: "Whether this row's disclosure is open. Owned by the list." },
    onToggle: { description: "Called with the app's id when the disclosure control is pressed." },
  },
  args: {
    row,
    expanded: false,
    onToggle: fn(),
    oktaOrigin: 'https://example.okta.com',
  },
  decorators: [
    (Story) => (
      <ul className="max-w-md space-y-1.5">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof GroupAppRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = { args: { expanded: true } };

export const Inactive: Story = {
  args: { row: { ...row, status: 'INACTIVE', statusVariant: 'neutral' } },
};

export const NothingReported: Story = {
  args: {
    expanded: true,
    row: {
      id: '0oaFAKE2',
      label: 'Wiki',
      statusVariant: 'neutral',
      push: { state: 'not-pushed' },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/unknown/i)).toBeNull();
    await expect(canvas.queryByText('Sign-on mode')).toBeNull();
    await expect(canvas.queryByText('Last updated')).toBeNull();
  },
};

export const Pushed: Story = {
  args: {
    expanded: true,
    row: { ...row, push: { state: 'pushed', targetGroupName: 'eng-team', priority: 2 } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Pushed')).toBeVisible();
    await expect(canvas.getByText(/Writes into eng-team\./)).toBeVisible();
    await expect(canvas.getByText(/Priority 2\./)).toBeVisible();
  },
};

export const PushUnknown: Story = {
  args: { expanded: true, row: { ...row, push: { state: 'unknown' } } },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Pushed')).toBeNull();
    await expect(canvas.queryByText(/not pushed to this app/)).toBeNull();
  },
};

export const TogglesFromTheChevron: Story = {
  render: function Disclosure(args) {
    const [expanded, setExpanded] = useState(false);
    return (
      <GroupAppRow
        {...args}
        expanded={expanded}
        onToggle={(id) => {
          args.onToggle(id);
          setExpanded((open) => !open);
        }}
      />
    );
  },
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Show details for Slack' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await expect(args.onToggle).toHaveBeenCalledWith('0oaFAKE1');
    await expect(canvas.getByRole('button', { expanded: true })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { expanded: true }));
    await expect(canvas.getByRole('button', { name: 'Show details for Slack' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};
