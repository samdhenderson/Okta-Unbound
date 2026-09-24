import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import PaletteChapter from './palette';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/palette',
  component: PaletteChapter,
  decorators: [withGuideShell('palette')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof PaletteChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    await expect(show).not.toBeNull();
    if (!show) return;
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent(
      'Rows from your org, under their kind, each heading saying where it came from.',
    );
    const dialog = stage.getByRole('dialog', { name: 'Jump to section' });
    await expect(
      within(dialog).getByRole('button', { name: /^Engineering .* open in Groups$/ }),
    ).toBeVisible();
    await expect(within(dialog).getAllByText('from snapshot', { exact: false })).toHaveLength(3);
    await expect(within(dialog).getByText('live', { exact: false })).toBeVisible();
    await expect(within(dialog).getByRole('status')).toHaveTextContent('4 results');
    await expect(within(dialog).getByRole('button', { name: 'Open the user guide' })).toBeVisible();
    await expect(stage.getByRole('tablist', { name: 'Main sections' })).toBeVisible();
    await expect(stage.getByRole('heading', { name: 'This org' })).toBeVisible();
  },
};

export const SectionsFiltered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const [first, second] = await canvas.findAllByRole('dialog', { name: 'Jump to section' });
    const field = within(first).getByRole('searchbox', { name: 'Search sections' });
    await userEvent.type(field, 'hist');
    await expect(within(first).getByRole('status')).toHaveTextContent('1 section available');
    await expect(within(first).getByRole('button', { name: /^History/ })).toBeVisible();
    await expect(within(first).queryByRole('button', { name: /^Home/ })).not.toBeInTheDocument();
    await expect(within(second).getByRole('button', { name: /^Home/ })).toBeVisible();
    await expect(
      within(second).getByRole('button', { name: /^Engineering .* open in Groups$/ }),
    ).toBeVisible();
  },
};

export const SearchBeat: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const [, second] = await canvas.findAllByRole('dialog', { name: 'Jump to section' });
    const engineering = () =>
      within(second).queryByRole('button', { name: /^Engineering .* open in Groups$/ });
    await expect(engineering()).toBeVisible();

    const field = within(second).getByRole('searchbox', { name: 'Search sections' });
    await userEvent.type(field, 'en');
    await expect(engineering()).not.toBeInTheDocument();
    await expect(within(second).getByText('Type 3 characters to search the org.')).toBeVisible();

    await userEvent.type(field, 'g');
    await waitFor(() => expect(engineering()).toBeVisible());
    await waitFor(() =>
      expect(within(second).getByRole('status')).toHaveTextContent(
        '0 sections available, 4 results',
      ),
    );
    await expect(within(second).getByRole('status')).not.toHaveTextContent('searching');
  },
};

export const LegendTied: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const [first] = await canvas.findAllByRole('dialog', { name: 'Jump to section' });
    const current = within(first).getByRole('button', { name: /^Home/ });
    await expect(current).toHaveAttribute('aria-current', 'page');
    const hint = canvasElement.querySelector<HTMLElement>('[data-guide-hint="current"]');
    await expect(hint).not.toBeNull();
    if (hint) await userEvent.hover(hint);

    await userEvent.click(within(first).getByRole('searchbox', { name: 'Search sections' }));
    await userEvent.tab();
    await expect(current).toHaveFocus();
  },
};
