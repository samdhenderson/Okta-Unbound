import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
          'Hover- and focus-triggered label chip for a control whose own rendering does not name ' +
          'it. Opens on hover and on focus after `--dur-hover-intent`, carries `role="tooltip"` ' +
          'wired to the trigger with `aria-describedby`, and closes on Escape, blur, ' +
          'pointer-leave or a scroll that moves the trigger.\n\n' +
          'A tooltip is additive: it describes, it does not name — an icon-only control still ' +
          'needs its own `aria-label`. The trigger comes from a render prop and the chip is ' +
          'portalled to `document.body`, so there is no wrapper element to break a `tablist`.',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'Groups' }));
    await expect(within(document.body).queryByRole('tooltip')).toBeNull();
  },
};

export const Opening: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Groups' });

    await expect(trigger).not.toHaveAttribute('aria-describedby');

    await userEvent.hover(trigger);
    const chip = await body.findByRole('tooltip', {}, { timeout: 2000 });
    await expect(chip).toHaveTextContent('Groups');
    await expect(trigger).toHaveAttribute('aria-describedby', chip.id);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).toBeNull());
  },
};

export const OpensOnFocus: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Groups' });

    trigger.focus();
    await expect(await body.findByRole('tooltip', {}, { timeout: 2000 })).toHaveTextContent(
      'Groups',
    );

    trigger.blur();
    await waitFor(() => expect(body.queryByRole('tooltip')).toBeNull());
  },
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
