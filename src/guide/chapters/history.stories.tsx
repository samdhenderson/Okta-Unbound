import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import HistoryChapter from './history';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/history',
  component: HistoryChapter,
  decorators: [withGuideShell('history')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof HistoryChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    await expect(show).not.toBeNull();
    const stage = within(show as HTMLElement);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent(
      '120 of 120 settled, and the one that failed is still named.',
    );
    await expect(stage.getByTestId('activity-progress-counter')).toHaveTextContent('120 / 120');
    await expect(stage.getByText('3 actions logged')).toBeVisible();
    await expect(stage.getByTestId('activity-failed')).toHaveTextContent('1 failed');
    await expect(stage.queryByRole('dialog')).toBeNull();
  },
};

export const RowOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: /Show details for Removed .* from Incident Commanders/,
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const region = canvasElement.ownerDocument.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    await expect(region).not.toBeNull();
    await expect(
      within(region as HTMLElement).getByText(/Group removals cannot be undone here/),
    ).toBeVisible();
  },
};

export const EntriesLightTheirLines: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: /Show details for Removed .* from Incident Commanders/,
    });
    const target = trigger.closest('[data-spot]') as HTMLElement | null;
    await expect(target).not.toBeNull();
    await expect(target).toHaveAttribute('data-spot', 'changed:2');
    const line = canvas.getByText(/A removal\. It offers no Undo/);

    await userEvent.hover(line);
    await expect(target).toHaveAttribute('data-lit');
    await expect(line).toHaveAttribute('data-lit');

    await userEvent.unhover(line);
    await expect(target).not.toHaveAttribute('data-lit');
    await expect(line).not.toHaveAttribute('data-lit');

    await userEvent.hover(target as HTMLElement);
    await expect(line).toHaveAttribute('data-lit');
    await userEvent.unhover(target as HTMLElement);

    trigger.focus();
    await waitFor(() => expect(line).toHaveAttribute('data-lit'));
    trigger.blur();
    await waitFor(() => expect(line).not.toHaveAttribute('data-lit'));
  },
};

export const UndoReopened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Restore previous values' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await expect(canvas.queryByRole('dialog')).toBeNull();
    const undoButtons = await canvas.findAllByRole('button', { name: 'Undo' });
    await userEvent.click(undoButtons[undoButtons.length - 1]);
    const reopened = await canvas.findByRole('dialog', { name: 'Restore previous values' });
    await expect(within(reopened).getByRole('button', { name: 'Restore' })).toBeVisible();
  },
};
