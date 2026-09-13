import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import CopyButton from './CopyButton';

const meta = {
  title: 'Shared/CopyButton',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Copy-to-clipboard button that confirms success by swapping its icon and label to ' +
          '`success` styling for ~1.5s. Text is produced lazily via `getText()` on click, so ' +
          'large lists aren’t built until needed, and a blocked clipboard fails silently ' +
          'rather than throwing.',
      },
    },
  },
  argTypes: {
    getText: {
      description:
        'Text to copy, computed lazily on click so large lists aren’t built until needed.',
    },
    label: { description: 'Idle label, e.g. “Copy all”.' },
    copiedLabel: { description: 'Label shown briefly after a successful copy.' },
    disabled: { description: 'Disables the button.' },
    title: { description: 'Native tooltip text for the button.' },
    variant: {
      description:
        'Idle-state button variant (the confirmed state always uses `success`). Defaults to `secondary`.',
    },
    size: { description: 'Button size passed through to `Button`. Defaults to `sm`.' },
    className: { description: 'Extra classes merged onto the button.' },
  },
  args: {
    getText: () => 'user1@example.com\nuser2@example.com\nuser3@example.com',
    label: 'Copy emails',
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const CustomCopiedLabel: Story = {
  args: {
    copiedLabel: 'Copied to clipboard!',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Copy all selected user emails',
  },
};

export const Copying: Story = {
  args: { copiedLabel: 'Copied 3 emails' },
  play: async ({ canvasElement }) => {
    const written: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (text: string) => (written.push(text), Promise.resolve()) },
    });

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy emails' }));

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Copied 3 emails' })).toBeInTheDocument(),
    );
    await expect(written).toEqual(['user1@example.com\nuser2@example.com\nuser3@example.com']);
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <CopyButton {...args} size="sm" label="Small" />
      <CopyButton {...args} size="md" label="Medium" />
      <CopyButton {...args} size="lg" label="Large" />
    </div>
  ),
  args: {
    variant: 'primary',
  },
};
