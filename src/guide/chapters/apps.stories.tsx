import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import AppsChapter from './apps';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/apps',
  component: AppsChapter,
  decorators: [withGuideShell('apps')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof AppsChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    if (!show) throw new Error('the chapter has no show');
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent(
      'Open a person, and every app names the route she got it by.',
    );
    await expect(stage.getAllByText('Direct')).toHaveLength(2);
    await expect(stage.getAllByText('Via group')).toHaveLength(2);
    await expect(stage.getByText('Through GitHub - Engineering')).toBeVisible();
    await expect(stage.getByText('2 direct · 2 via group')).toBeVisible();
  },
};

export const GroupAppOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(canvas.getByText('Assigned apps (2)')).toBeVisible();
    const chevron = await canvas.findByRole('button', {
      name: 'Show details for GitHub Enterprise',
    });
    const list = chevron.closest('ul') as HTMLElement;
    await expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
    await userEvent.click(chevron);
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Writes into engineering. Priority 0.')).toBeVisible();
  },
};

export const UserAppOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const chevron = await canvas.findByRole('button', { name: 'Show how Slack is granted' });
    const list = chevron.closest('ul') as HTMLElement;
    await expect(list.querySelectorAll(':scope > li')).toHaveLength(4);
    await userEvent.click(chevron);
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    const row = within(chevron.closest('li') as HTMLElement);
    await expect(row.getByText('Granted through')).toBeVisible();
    await expect(row.getByText('Engineering - All')).toBeVisible();
  },
};

export const InventoryRowOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const chevron = await canvas.findByRole('button', { name: 'Expand Salesforce' });
    await userEvent.click(chevron);
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(
      chevron.getAttribute('aria-controls') as string,
    ) as HTMLElement;
    await expect(within(panel).getByText('Application ID')).toBeVisible();
  },
};

export const LegendLinked: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const sentence = await canvas.findByText(/Slack is assigned only: members can sign in/);
    await userEvent.hover(sentence);
    await expect(sentence).toHaveAttribute('data-lit', 'true');
    const row = canvas
      .getByRole('button', { name: 'Show details for Slack' })
      .closest('li') as HTMLElement;
    const list = row.parentElement as HTMLElement;
    await expect(list).toHaveAttribute('data-lit', '2');
    await userEvent.unhover(sentence);
    await expect(sentence).not.toHaveAttribute('data-lit');
    await expect(list).not.toHaveAttribute('data-lit');

    await userEvent.hover(row);
    await expect(sentence).toHaveAttribute('data-lit', 'true');
    await expect(list).toHaveAttribute('data-lit', '2');
    await userEvent.unhover(row);
    await expect(sentence).not.toHaveAttribute('data-lit');
    await expect(list).not.toHaveAttribute('data-lit');
  },
};
