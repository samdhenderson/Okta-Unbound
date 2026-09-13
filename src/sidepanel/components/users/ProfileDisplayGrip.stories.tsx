import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import ProfileDisplayGrip from './ProfileDisplayGrip';

const meta = {
  title: 'Users/ProfileDisplayGrip',
  component: ProfileDisplayGrip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A drag handle that also reorders from the keyboard: **Space or Enter** lifts and then drops, **the arrow keys** move (up/down within and across sections, left/right a whole section at a time), **Escape** puts it back.\n\n' +
          "`aria-pressed` carries the lifted state, so a screen reader can tell a held item from a resting one without reading the live region. Disabled while the pane's filter is narrowing the list — a drop into a partly-rendered list would compute a position against rows that are not there — and the tooltip says so.",
      },
    },
  },
  argTypes: {
    label: { description: 'What this handle moves — an attribute label or a category name.' },
    lifted: {
      description: "True while this handle's item is lifted; reflected as `aria-pressed`.",
    },
    disabled: { description: 'Turns the handle off while a filter is narrowing the list.' },
    describedBy: { description: '`id` of the element describing the keyboard contract.' },
    onPointerDown: { description: 'Start a pointer drag.' },
    onLift: { description: 'Lift this item with the keyboard.' },
    onStep: { description: 'Move the lifted item one step.' },
    onDrop: { description: 'Drop the lifted item where it stands.' },
    onCancel: { description: 'Abandon the lift and put the item back.' },
  },
  args: {
    label: 'Department',
    lifted: false,
    onPointerDown: fn(),
    onLift: fn(),
    onStep: fn(),
    onDrop: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ProfileDisplayGrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SpaceLifts: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const grip = canvas.getByRole('button', { name: 'Reorder Department' });
    await expect(grip).toHaveAttribute('aria-pressed', 'false');

    grip.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(args.onStep).not.toHaveBeenCalled();

    await userEvent.keyboard(' ');
    await expect(args.onLift).toHaveBeenCalled();
  },
};

export const Lifted: Story = { args: { lifted: true } };

export const LiftedKeyboardSteps: Story = {
  args: { lifted: true },
  play: async ({ args, canvas, userEvent }) => {
    const grip = canvas.getByRole('button', { name: 'Reorder Department' });
    await expect(grip).toHaveAttribute('aria-pressed', 'true');

    grip.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(args.onStep).toHaveBeenCalledWith('down');

    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onStep).toHaveBeenCalledWith('next-section');

    await userEvent.keyboard('{Escape}');
    await expect(args.onCancel).toHaveBeenCalled();

    await userEvent.keyboard(' ');
    await expect(args.onDrop).toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true } };
