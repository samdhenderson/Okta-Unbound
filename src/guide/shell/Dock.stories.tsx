import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import Dock from './Dock';
import { CHAPTERS } from '../chapters';
import '../guide.css';

const meta = {
  title: 'Guide/Shell/Dock',
  component: Dock,
  parameters: { layout: 'fullscreen' },
  args: { chapter: 'groups' },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen bg-canvas">
        <div className="lg:h-screen lg:w-72 lg:shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Dock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Contents' });
    const current = within(nav).getByRole('link', { name: 'Groups' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(within(nav).getAllByRole('link')).toHaveLength(CHAPTERS.length + 1);
    await expect(within(nav).getByRole('link', { name: 'Rules' })).toHaveAttribute(
      'href',
      '#/rules',
    );
  },
};

export const Hosted: Story = {
  args: { install: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Contents' });
    await expect(within(nav).getAllByRole('link')).toHaveLength(CHAPTERS.length + 2);
    const store = within(nav).getByRole('link', { name: /Chrome Web Store/ });
    await expect(new URL(store.getAttribute('href') ?? '').hostname).toBe(
      'chromewebstore.google.com',
    );
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Contents' });
    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Welcome' })).toHaveFocus();
  },
};
