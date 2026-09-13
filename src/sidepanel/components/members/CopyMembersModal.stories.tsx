import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import CopyMembersModal from './CopyMembersModal';
import { mockUsers } from '../../../test/mocks/fixtures';

const meta = {
  title: 'Members/CopyMembersModal',
  component: CopyMembersModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Modal for copying the current member list as a chosen identifier (full name, email, username, or `name <email>`), one per line, with a live preview truncated by an "…and N more" summary. Blank identifiers are dropped so the count reflects only copyable lines.',
      },
    },
  },
  argTypes: {
    isOpen: { description: 'Whether the modal is open.' },
    onClose: { description: 'Close the modal.' },
    members: { description: 'The members to copy (already filtered/sorted by the caller).' },
  },
  args: {
    isOpen: true,
    onClose: fn(),
    members: mockUsers.slice(0, 20),
  },
} satisfies Meta<typeof CopyMembersModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongList: Story = {
  args: { members: mockUsers },
};

export const Empty: Story = {
  args: { members: [] },
};

export const Closed: Story = {
  args: { isOpen: false },
};

export const SwitchingFormat: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const email = canvas.getByRole('button', { name: /Email/ });
    await expect(email).toHaveAttribute('aria-pressed', 'true');

    const fullName = canvas.getByRole('button', { name: /Full name/ });
    await userEvent.click(fullName);

    await expect(fullName).toHaveAttribute('aria-pressed', 'true');
    await expect(email).toHaveAttribute('aria-pressed', 'false');
  },
};
