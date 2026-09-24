import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import RulesChapter from './rules';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/rules',
  component: RulesChapter,
  decorators: [withGuideShell('rules')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof RulesChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(
      show.getByText(/held by this rule alone\. Nobody is removed; they stay\./),
    ).toBeInTheDocument();
    const dialog = show.getByRole('dialog', { name: 'Deactivate rule?' });
    await expect(within(dialog).getByText('Held by this rule alone')).toBeInTheDocument();
    await expect(within(dialog).getByText(/held by this rule alone$/)).toBeInTheDocument();
    await expect(show.getByRole('button', { name: 'Amara' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

export const Choreography: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Amara' }));
    await expect(canvas.getByRole('button', { name: 'Amara' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByText(/the rule matches her/)).toBeVisible();
  },
};

export const RawExpressionShown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const [toggle] = await canvas.findAllByRole('button', { name: 'Raw expression' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  },
};

export const PersonSwitched: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(canvas.getByText(/settles the rule: no match/)).toBeVisible();
    await expect(canvas.getAllByText('Rule does not match').length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Amara' }));
    await expect(canvas.getByRole('button', { name: 'Amara' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'Tomas' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(canvas.getByText(/the rule matches her/)).toBeVisible();
    await expect(canvas.getAllByText('Rule matches this user').length).toBeGreaterThan(0);
  },
};

export const LegendLinked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const line = canvas.getByText(/The status is a word, not a colour/);
    const row = canvas.getByRole('heading', { name: /Interns/ }).closest('[data-hot]');
    if (!row) throw new Error('The Interns row is not wrapped in a linked frame');

    await userEvent.hover(row);
    await expect(line).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(row);
    await expect(line).toHaveAttribute('data-hot', 'false');

    await userEvent.hover(line);
    await expect(row).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(line);
    await expect(row).toHaveAttribute('data-hot', 'false');
  },
};

export const PreviewOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Preview impact' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Rule impact preview' });
    await expect(within(dialog).getByText('Held by this rule alone')).toBeVisible();
    await expect(within(dialog).getByRole('button', { name: 'Close' })).toBeVisible();
  },
};

export const ImpactOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'More' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Deactivate rule' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Deactivate rule?' });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByText('Held by this rule alone')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await expect(
      canvas.queryByRole('dialog', { name: 'Deactivate rule?' }),
    ).not.toBeInTheDocument();
  },
};

export const MergeOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Review & merge/ }));
    const dialog = await canvas.findByRole('dialog', { name: 'Consolidate rule' });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByText('Will retire (2)')).toBeVisible();
  },
};
