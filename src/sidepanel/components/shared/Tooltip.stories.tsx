import type { Meta, StoryObj } from '@storybook/react-vite';
import Icon from './Icon';
import Tooltip from './Tooltip';

const meta = {
  title: 'Shared/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hover- and focus-triggered label chip for a control whose own rendering does not name it.\n\n' +
          'Replaces the native `title` attribute, which cannot be styled, fires on an uncontrollable delay, and never appears for a keyboard user. This one opens on hover **and** on focus after `--dur-hover-intent` (400ms), carries `role="tooltip"` wired to its trigger with `aria-describedby`, and closes on Escape, blur, pointer-leave, or any scroll that would move the trigger out from under it. It traps no focus.\n\n' +
          'A tooltip is **additive**: it describes, it does not name. An icon-only control still needs its own `aria-label`.\n\n' +
          'It renders no wrapper element — the trigger is supplied by a render prop and the chip is portalled to `document.body`, so it is safe inside a `role="tablist"` (where an intervening `<span>` would fail `aria-required-children`) and inside a scroll container that clips its overflow.',
      },
    },
  },
  argTypes: {
    label: { description: 'The chip’s text. A few words — it names a thing, it never wraps.' },
    disabled: { description: 'Suppresses the chip while still rendering the trigger.' },
    children: {
      description: 'Render prop for the trigger; spread the supplied props onto your element.',
    },
  },
  args: {
    label: 'Groups',
    children: () => null,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      {(trigger) => (
        <button
          type="button"
          aria-label={args.label}
          className="rounded-md p-2.5 text-neutral-600 transition-colors duration-(--dur-instant) hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-primary"
          {...trigger}
        >
          <Icon type="users" size="sm" />
        </button>
      )}
    </Tooltip>
  ),
};

export const AccessibleName: Story = {
  args: { label: 'Rules' },
  parameters: {
    a11y: {
      config: { rules: [{ id: 'button-name', enabled: true }] },
    },
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const InARow: Story = {
  render: () => (
    <div className="flex items-center gap-0.5">
      {(
        [
          ['Users', 'user'],
          ['Groups', 'users'],
          ['Rules', 'bolt'],
          ['Policies', 'shield'],
        ] as const
      ).map(([label, icon]) => (
        <Tooltip key={label} label={label}>
          {(trigger) => (
            <button
              type="button"
              aria-label={label}
              className="rounded-md p-2.5 text-neutral-600 transition-colors duration-(--dur-instant) hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-primary"
              {...trigger}
            >
              <Icon type={icon} size="sm" />
            </button>
          )}
        </Tooltip>
      ))}
    </div>
  ),
};
