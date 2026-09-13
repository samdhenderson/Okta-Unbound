import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import EmptyState from './EmptyState';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Centered “no content” placeholder — icon badge, title, description, and optional ' +
          'actions — for empty lists, no-results, first-run, error and permission states. Each ' +
          'action renders as a shared `Button` (defaulting to `primary`); the row is omitted ' +
          'entirely when `actions` is empty.',
      },
    },
  },
  argTypes: {
    icon: { description: 'Icon glyph shown in the circular badge.' },
    title: { description: 'Bold headline.' },
    description: { description: 'Supporting explanatory copy.' },
    actions: { description: 'Optional action buttons (rendered only when non-empty).' },
    className: { description: 'Extra classes merged onto the outer container.' },
  },
  args: {
    icon: 'search',
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actions: [
      {
        label: 'Clear Filters',
        onClick: fn(),
      },
    ],
  },
};

export const WithMultipleActions: Story = {
  args: {
    actions: [
      { label: 'Clear Filters', onClick: fn() },
      { label: 'Try Again', onClick: fn(), variant: 'secondary' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Try Again' }));
    await expect(args.actions?.[1].onClick).toHaveBeenCalledTimes(1);
    await expect(args.actions?.[0].onClick).not.toHaveBeenCalled();
  },
};

export const Empty: Story = {
  args: {
    icon: 'users',
    title: 'No users yet',
    description: 'Start by adding your first user to this group',
    actions: [
      {
        label: 'Add User',
        onClick: fn(),
        variant: 'primary',
      },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    icon: 'alert',
    title: 'Something went wrong',
    description: 'We encountered an error while loading your data',
    actions: [
      {
        label: 'Reload',
        onClick: fn(),
        variant: 'primary',
      },
    ],
  },
};

export const NoPermission: Story = {
  args: {
    icon: 'lock',
    title: 'Access denied',
    description: 'You do not have permission to view this content',
  },
};

export const SecondaryAction: Story = {
  args: {
    icon: 'settings',
    title: 'No settings configured',
    description: 'Configure your preferences to get started',
    actions: [
      {
        label: 'Configure Now',
        onClick: fn(),
        variant: 'secondary',
      },
    ],
  },
};
