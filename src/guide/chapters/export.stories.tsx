import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ExportChapter from './export';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/export',
  component: ExportChapter,
  decorators: [withGuideShell('export')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof ExportChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(
      show.getByText('Preview lays out the first rows in the columns you left on.'),
    ).toBeInTheDocument();
    await expect(show.getByRole('searchbox', { name: 'Filter' })).toHaveValue(
      'profile.department eq "Legal"',
    );
    await expect(show.getByText('7 matching')).toBeInTheDocument();
    await expect(show.getByRole('button', { name: 'Department' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(show.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const table = show.getByRole('table');
    await expect(within(table).getByRole('columnheader', { name: 'Department' })).toBeVisible();
  },
};

export const ColumnToggled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const department = await canvas.findByRole('button', { name: 'Department' });
    await expect(department).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(department);
    await expect(department).toHaveAttribute('aria-pressed', 'true');
  },
};

export const PreviewOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Preview' }));
    const table = await canvas.findByRole('table');
    await expect(within(table).getByRole('columnheader', { name: 'Email' })).toBeVisible();
  },
};

export const ColumnReachesPreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const table = await canvas.findByRole('table');
    await expect(within(table).queryByRole('columnheader', { name: 'Department' })).toBeNull();
    await userEvent.click(await canvas.findByRole('button', { name: 'Department' }));
    await expect(
      within(await canvas.findByRole('table')).getByRole('columnheader', { name: 'Department' }),
    ).toBeVisible();
  },
};

export const PreviewRevealed: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const preview = await canvas.findByRole('button', { name: 'Preview' });
    await userEvent.click(preview);
    const table = await canvas.findByRole('table');
    await expect(within(table).getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await userEvent.click(preview);
    await expect(await canvas.findByRole('table')).toBeVisible();
  },
};

export const LegendLinked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const usersCard = await canvas.findByRole('button', { name: /^Users/ });
    const row = canvas.getByText(/Users reads the whole org/);

    await userEvent.hover(usersCard);
    await expect(row).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(usersCard);
    await expect(row).not.toHaveAttribute('data-hot');

    await userEvent.hover(row);
    await expect(usersCard.closest('[data-hot="true"]')).not.toBeNull();
    await userEvent.unhover(row);
    await expect(row).not.toHaveAttribute('data-hot');
  },
};

export const ModalOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'More' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Export' }));
    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName(/Export Groups/);
  },
};
