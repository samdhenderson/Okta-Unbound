import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import CopyIconButton from './CopyIconButton';

const meta = {
  title: 'Shared/CopyIconButton',
  component: CopyIconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A ghost `IconButton` whose glyph and accessible name flip to a confirmation for ~1.5s after a click, shared by `CopyableId` and `EntityLink`. It carries no visible text, so the label must name *what* is being copied rather than the bare verb.',
      },
    },
  },
  argTypes: {
    value: { description: 'The raw value written to the clipboard on click.' },
    label: { description: 'Resting accessible name, e.g. “Copy group id”.' },
    className: { description: 'Extra classes merged onto the button. Defaults to `shrink-0`.' },
  },
  args: {
    value: '00gFAKE1a2b3c4d5e6',
    label: 'Copy group id',
  },
} satisfies Meta<typeof CopyIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Copy group id' })).toBeInTheDocument();
  },
};

export const NamesWhatItCopies: Story = {
  args: { value: '00uFAKE9z8y7x6w5v4', label: 'Copy user id for ana@example.com' },
};

export const Copying: Story = {
  play: async ({ canvasElement }) => {
    const written: string[] = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: (text: string) => (written.push(text), Promise.resolve()) },
    });

    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy group id' }));

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Copied!' })).toBeInTheDocument(),
    );
    await expect(written).toEqual(['00gFAKE1a2b3c4d5e6']);
  },
};
