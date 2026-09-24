import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import RoadmapChapter from './roadmap';
import { awaitShow, CHAPTER_PARAMETERS, readerCanvas, withGuideShell } from './chapterStory';
import { chapterById } from '../chapters';
import { CHAPTER_STANDING } from '../status';

const meta = {
  title: 'Guide/Chapters/roadmap',
  component: RoadmapChapter,
  decorators: [withGuideShell('roadmap')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof RoadmapChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const canvas = readerCanvas(canvasElement);
    const def = chapterById('roadmap');
    const heading = canvas.getByRole('heading', { level: 2, name: def.headline });
    await expect(heading).toHaveAttribute('id', 'show-roadmap');
    await expect(canvas.getByText(def.subline)).toBeInTheDocument();
    const expected = Object.values(CHAPTER_STANDING).filter((s) => s.status !== 'shipped').length;
    const total = Object.keys(CHAPTER_STANDING).length;
    const line = canvas.getByText(/chapters are still moving/);
    await expect(line).toHaveTextContent(
      `${expected} of ${total} chapters are still moving. The other ${total - expected} are shipped`,
    );
  },
};

export const OneEntryPerOpenChapter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const open = Object.values(CHAPTER_STANDING).filter((s) => s.status !== 'shipped');
    const entries = await canvas.findAllByTestId('roadmap-item');
    await expect(entries).toHaveLength(open.length);
    const links = canvas.getAllByRole('link', { name: /Weigh in/ });
    await expect(links).toHaveLength(open.length);
    const chips = canvas.getAllByTestId('guide-status-chip');
    await expect(chips).toHaveLength(open.length);
    for (const entry of entries) {
      await expect(entry.tagName).toBe('LI');
      await expect(within(entry).getByTestId('guide-status-chip')).toBeInTheDocument();
    }
  },
};

export const HeldBack: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const heading = canvas.getByRole('heading', { level: 3, name: 'Held Back' });
    await expect(heading).toBeInTheDocument();
    await expect(canvas.getByText(/API Explorer/)).toHaveTextContent(
      /the rail and the command palette do not offer them yet/,
    );
  },
};

export const KeyAndEntriesLightEachOther: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const entries: HTMLElement[] = await canvas.findAllByTestId('roadmap-item');
    const pills: HTMLElement[] = canvas.getAllByTestId('roadmap-key-pill');
    const status = pills[0].getAttribute('data-status');
    const matching = entries.filter((s) => s.getAttribute('data-status') === status);
    const others = entries.filter((s) => s.getAttribute('data-status') !== status);
    await expect(matching.length).toBeGreaterThan(0);

    await userEvent.hover(pills[0]);
    for (const s of matching) await expect(s).toHaveAttribute('data-lit');
    for (const s of others) await expect(s).not.toHaveAttribute('data-lit');
    await userEvent.unhover(pills[0]);
    for (const s of matching) await expect(s).not.toHaveAttribute('data-lit');

    await userEvent.hover(others[0]);
    const otherStatus = others[0].getAttribute('data-status');
    const otherPill = pills.find((p) => p.getAttribute('data-status') === otherStatus);
    await expect(otherPill).toHaveAttribute('data-lit');
    await expect(pills[0]).not.toHaveAttribute('data-lit');
    await userEvent.unhover(others[0]);

    const button = within(pills[0]).getByRole('button');
    await userEvent.click(button);
    await userEvent.unhover(pills[0]);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    for (const s of matching) await expect(s).toHaveAttribute('data-lit');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};
