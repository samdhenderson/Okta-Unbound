import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import HomeChapter from './home';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/home',
  component: HomeChapter,
  decorators: [withGuideShell('home')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof HomeChapter>;

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
      'Reports answer with names. This one counted 1 app group whose membership has not moved in 3 years.',
    );
    await expect(
      stage.getByRole('textbox', { name: 'Search groups, apps, users, rules' }),
    ).toHaveValue('eng');
    await expect(stage.getByRole('status')).toHaveTextContent('3 results');
    await expect(
      stage.getByRole('button', { name: /^Engineering - All .* open in Groups$/ }),
    ).toBeVisible();
    const report = stage.getByRole('button', {
      name: /App access with no membership change in 6 months/,
    });
    await expect(report).toHaveAttribute('aria-expanded', 'false');
    await expect(report).toHaveTextContent(/^1/);
  },
};

export const ReportOpened: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const row = await canvas.findByRole('button', { name: /Empty groups nothing fills/ });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Findings, not a delete list/)).toBeInTheDocument();
    const panel = canvas.getByTestId('guide-report-group-cleanup');
    const names = within(panel).getAllByRole('button', { name: 'Open this group' });
    const stated = Number(row.textContent?.match(/^\d+/)?.[0]);
    await expect(names).toHaveLength(stated);
  },
};

export const MarkerTied: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const scene = canvas.getByRole('region', { name: 'Reports' });
    const find = (selector: string): Element => {
      const hit = scene.querySelector(selector);
      if (!hit) throw new Error(`Missing ${selector}`);
      return hit;
    };
    const target = (n: number) => find(`[data-guide-target="${n}"]`);
    const sentence = (n: number) => find(`[data-guide-legend="${n}"]`);
    await expect(target(1)).toBeInTheDocument();

    await userEvent.hover(target(1));
    await expect(sentence(1)).toHaveAttribute('data-hot', 'true');
    await expect(sentence(2)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(target(1));
    await expect(sentence(1)).not.toHaveAttribute('data-hot');

    await userEvent.hover(sentence(3));
    await expect(target(3)).toHaveAttribute('data-hot', 'true');
    await expect(target(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(sentence(3));
    await expect(target(3)).not.toHaveAttribute('data-hot');

    const elsewhere = canvas
      .getByRole('region', { name: 'Launcher' })
      .querySelector('[data-guide-target="1"]');
    if (!elsewhere) throw new Error('Missing the Jump scene target');
    await userEvent.hover(elsewhere);
    await expect(sentence(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(elsewhere);
  },
};

export const MfaLauncherOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /MFA coverage/ }));
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter groups' }), 'aws prod');
    await expect(canvas.getByRole('button', { description: 'AWS Prod - ReadOnly' })).toBeVisible();
    await expect(
      canvas.queryByRole('button', { description: 'Sales - All' }),
    ).not.toBeInTheDocument();
  },
};

export const JumpBarTyped: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const field = await canvas.findByRole('textbox', { name: 'Search groups, apps, users, rules' });
    await userEvent.type(field, 'amara');
    await expect(field).toHaveValue('amara');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
  },
};
