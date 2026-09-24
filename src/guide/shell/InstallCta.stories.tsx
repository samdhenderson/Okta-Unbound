import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import InstallCta from './InstallCta';
import '../guide.css';

const meta = {
  title: 'Guide/Shell/InstallCta',
  component: InstallCta,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof InstallCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rail: Story = {
  args: { variant: 'rail' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Chrome Web Store/ });
    await expect(new URL(link.getAttribute('href') ?? '').hostname).toBe(
      'chromewebstore.google.com',
    );
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

export const Band: Story = {
  args: { variant: 'band' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: /Chrome Web Store/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  },
};
