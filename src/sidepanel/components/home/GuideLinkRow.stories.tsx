import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GuideLinkRow from './GuideLinkRow';

const meta = {
  title: 'Home/GuideLinkRow',
  component: GuideLinkRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The last row on Home: a `link` button that opens the user guide, and an anchor ' +
          'to a pre-titled GitHub issue for feedback. No card chrome; it sits under the ' +
          'reports card as a quiet line of two phrases.',
      },
    },
  },
  args: {
    onOpenGuide: fn(),
  },
} satisfies Meta<typeof GuideLinkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'User guide' }));
    await expect(args.onOpenGuide).toHaveBeenCalledTimes(1);

    const feedback = canvas.getByRole('link', { name: 'Send feedback' });
    await expect(feedback).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(feedback.getAttribute('href')).toMatch(/\/issues\/new\?title=Feedback/);
  },
};
