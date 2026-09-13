import React, { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import Button from './Button';
import Modal, { MODAL_LAYER_ID } from './Modal';

const meta = {
  title: 'Shared/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The canonical overlay for all pop-up UI: `role="dialog"` + `aria-modal`, a Tab ' +
          'focus-trap, autofocus into the panel, focus restoration on close, and Escape / ' +
          'overlay-click to dismiss. Four width presets and an optional footer bar. Always use ' +
          'this rather than a bespoke overlay.\n\n' +
          'Closing is animated: the panel is held in the DOM for one exit animation, but is ' +
          '`aria-hidden` + `inert` for that window and focus returns to the trigger at once, so ' +
          '`isOpen === false` means "gone" to every consumer from the first frame.',
      },
    },
  },
  argTypes: {
    isOpen: {
      description:
        'When false the modal closes — the panel is held for its exit animation (hidden from the accessible tree), then unmounted.',
    },
    onClose: { description: 'Invoked on Escape, overlay click, or the header close button.' },
    title: { description: 'Dialog title; wired to `aria-labelledby`.' },
    children: { description: 'Body content.' },
    footer: {
      description: 'Optional footer node (typically action buttons), shown in a styled footer bar.',
    },
    size: { description: 'Max-width preset for the panel. Defaults to `md`.' },
  },
  args: {
    isOpen: true,
    onClose: fn(),
    title: 'Modal Title',
    children: <p>Modal content goes here.</p>,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    children: <p>Are you sure you want to delete this item? This action cannot be undone.</p>,
    title: 'Confirm deletion',
    footer: (
      <>
        <Button variant="ghost" onClick={fn()}>
          Cancel
        </Button>
        <Button variant="danger" onClick={fn()}>
          Delete
        </Button>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Small modal',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    title: 'Large modal',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    title: 'Extra-large modal',
  },
};

export const WithLongContent: Story = {
  args: {
    title: 'Terms and Conditions',
    children: (
      <div className="flex flex-col gap-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
          deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
          laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
          architecto beatae vitae dicta sunt explicabo.
        </p>
        <p>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
          consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
        </p>
      </div>
    ),
    footer: <Button variant="primary">Accept</Button>,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

const ExitDemo: React.FC<React.ComponentProps<typeof Modal>> = (args) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        footer={
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        }
      />
    </div>
  );
};

export const MotionShowcase: Story = {
  parameters: { motion: 'on' },
  args: {
    title: 'Confirm removal',
    children: <p>Closing this dialog animates it out; focus returns to the trigger at once.</p>,
  },
  render: (args) => <ExitDemo {...args} />,
};

export const ExitInteraction: Story = {
  args: {
    title: 'Confirm removal',
    children: <p>This dialog is opened and dismissed by the interaction test.</p>,
  },
  render: (args) => <ExitDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });

    await userEvent.click(trigger);
    const dialog = await canvas.findByRole('dialog');

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(dialog.isConnected).toBe(false));
    expect(canvas.queryByRole('dialog')).toBeNull();

    expect(document.activeElement).toBe(trigger);
  },
};

export const EscapeAndFocusTrap: Story = {
  args: {
    title: 'Confirm removal',
    children: <p>Tab cycles inside this dialog; Escape dismisses it.</p>,
  },
  render: (args) => <ExitDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open modal' });

    await userEvent.click(trigger);
    const dialog = await canvas.findByRole('dialog');

    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  },
};

const OverActivityBar: React.FC<React.ComponentProps<typeof Modal>> = (args) => {
  const [open, setOpen] = useState(false);
  const openOnceLayerExists = useCallback(() => setOpen(true), []);

  return (
    <div className="h-screen bg-canvas">
      <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
      <div
        data-testid="activity-bar-stand-in"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white px-5 py-1 text-xs text-neutral-700"
      >
        Idle · 0 queued — stands in for the fixed ActivityBar band
      </div>
      <div id={MODAL_LAYER_ID} ref={openOnceLayerExists} />
    </div>
  );
};

export const OverTheActivityBar: Story = {
  args: {
    title: 'Confirm removal',
    children: (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Removing this group takes its {i + 1} members with it. Scroll to the end to confirm —
            the footer actions must stay clickable over the activity bar.
          </p>
        ))}
      </div>
    ),
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Confirm</Button>
      </>
    ),
  },
  render: (args) => <OverActivityBar {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog');
    const activityBar = canvas.getByTestId('activity-bar-stand-in');

    await expect(
      Boolean(
        activityBar.compareDocumentPosition(dialog) & activityBar.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);

    const confirm = canvas.getByRole('button', { name: 'Confirm' });
    const box = confirm.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    await expect(confirm.contains(hit)).toBe(true);
  },
};
