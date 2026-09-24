import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import WelcomeChapter from './welcome';
import { CHAPTERS } from '../chapters';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/welcome',
  component: WelcomeChapter,
  decorators: [withGuideShell('welcome')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof WelcomeChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overture: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const stage = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    if (!stage) throw new Error('No show on the page');
    await expect(stage).toHaveAttribute('data-show-state', 'done');
    await expect(stage.querySelectorAll('[data-guide-seat]')).toHaveLength(CHAPTERS.length);
    for (const def of CHAPTERS) {
      const tile = stage.querySelector(`[data-guide-seat="${def.title}"]`);
      await expect(tile).toBeInTheDocument();
      await expect(tile?.parentElement).toHaveTextContent(def.title);
    }
  },
};

export const SeatClicked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const rail = await canvas.findByRole('tablist', { name: 'Main sections' });
    await expect(canvas.queryByRole('tablist', { name: 'Main sections, off a Mac' })).toBeNull();
    const groups = within(rail).getByRole('tab', { name: 'Groups' });
    await userEvent.click(groups);
    await expect(groups).toHaveAttribute('aria-selected', 'true');
    await expect(within(rail).getByRole('tab', { name: 'Home' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await expect(canvas.getByText('is the active seat', { exact: false })).toHaveTextContent(
      'Groups is the active seat, so it is the one wearing its name.',
    );
  },
};

export const MarkerTied: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const scene = canvasElement.querySelector(
      '[data-testid="guide-body"] section[aria-labelledby="scene-navigating-unbound"]',
    );
    if (!scene) throw new Error('Missing the rail scene');
    const find = (selector: string): Element => {
      const hit = scene.querySelector(selector);
      if (!hit) throw new Error(`Missing ${selector}`);
      return hit;
    };
    const target = find('[data-guide-target="1"]');
    const sentence = find('[data-guide-legend="1"]');

    await userEvent.hover(target);
    await expect(sentence).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(target);
    await expect(sentence).not.toHaveAttribute('data-hot');

    await userEvent.hover(sentence);
    await expect(target).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(sentence);
    await expect(target).not.toHaveAttribute('data-hot');
  },
};
