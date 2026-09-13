import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import WorkingSetPinButton from './WorkingSetPinButton';

const meta = {
  title: 'Shared/WorkingSetPinButton',
  component: WorkingSetPinButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "The pin that keeps an entity on the Home tab, rendered in `PageHeader`'s `cornerAction` slot.\n\n" +
          'It carries no visible label, because `ContextBar` already has a control called **Pin** with a different meaning. Its accessible name resolves that: *Pin to Home* names the destination rather than the action. One button in two states, so the state is announced through `aria-pressed`.',
      },
    },
  },
  argTypes: {
    pinned: { description: 'Whether the entity is currently on Home.' },
    onToggle: { description: 'Pin it, or release it.' },
    disabled: {
      description: 'Held while the entity is still resolving and has no name to record.',
    },
  },
  args: { pinned: false, onToggle: fn() },
} satisfies Meta<typeof WorkingSetPinButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unpinned: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Pin to Home' });
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(button);
    await expect(args.onToggle).toHaveBeenCalled();
  },
};

export const Pinned: Story = {
  args: { pinned: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Unpin from Home' });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Pin to Home' }));
    await expect(args.onToggle).not.toHaveBeenCalled();
  },
};
