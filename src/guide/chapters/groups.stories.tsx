import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import GroupsChapter from './groups';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/groups',
  component: GroupsChapter,
  decorators: [withGuideShell('groups')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof GroupsChapter>;

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
      'Members draws the split as one pill per source, and names the rule those members are attributed to.',
    );
    await expect(stage.getByRole('tabpanel', { name: 'Overview' })).toBeInTheDocument();
    await expect(stage.getByRole('button', { name: /^All \d+$/ })).toBeVisible();
    await expect(stage.getByRole('button', { name: /^Manual \d+ \(\d+%\)$/ })).toBeVisible();
    await expect(stage.getByRole('heading', { name: 'Attributed to' })).toBeVisible();
    await expect(stage.queryByText('Expand Engineering - All')).toBeNull();
  },
};

export const MembersSource: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(await canvas.findByRole('heading', { name: 'Source' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^All \d+$/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /^Manual \d+ \(\d+%\)$/ })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Attributed to' })).toBeVisible();
    const ruleRow = canvas.getByRole('button', { name: /^Open rule .+ in the Rules tab$/ });
    await expect(ruleRow).toBeVisible();
    await expect(ruleRow).toHaveTextContent('Okta-attributed');
  },
};

export const RowOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const chevron = await canvas.findByRole('button', { name: 'Expand Engineering - All' });
    await userEvent.click(chevron);
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Group ID')).toBeVisible();
  },
};

export const AddMemberOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const [add] = await canvas.findAllByRole('button', { name: /^Add$/ });
    await userEvent.click(add);
    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName(/Engineering - All/);
  },
};

export const MarkerTied: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const find = (selector: string): Element =>
      canvas.getAllByText((_: string, node: Element | null) => node?.matches(selector) ?? false)[0];
    const target = (n: number) => find(`[data-guide-target="${n}"]`);
    const sentence = (n: number) => find(`[data-guide-legend="${n}"]`);
    await expect(target(1)).toBeInTheDocument();

    await userEvent.hover(target(1));
    await expect(sentence(1)).toHaveAttribute('data-hot', 'true');
    await expect(sentence(2)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(target(1));
    await expect(sentence(1)).not.toHaveAttribute('data-hot');

    await userEvent.hover(sentence(2));
    await expect(target(2)).toHaveAttribute('data-hot', 'true');
    await expect(target(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(sentence(2));
    await expect(target(2)).not.toHaveAttribute('data-hot');
  },
};

export const RowOpenedMoving: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const chevron = await canvas.findByRole('button', { name: 'Expand Engineering - All' });
    await userEvent.click(chevron);
    await expect(chevron).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Group ID')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse Engineering - All' }));
    await expect(chevron).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText('Group ID')).toBeInTheDocument();
  },
};

export const EnrollmentOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: 'Show the bucket breakdown for MFA enrollment',
    });
    await userEvent.click(toggle);
    await expect(
      canvas.getByRole('button', { name: 'Hide the bucket breakdown for MFA enrollment' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('No factors enrolled')).toBeVisible();
    await expect(canvas.getByText('Two or more factors')).toBeVisible();
  },
};

export const CohortVerbOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const more = canvas.getAllByRole('button', { name: 'More' }).at(-1)!;
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(
      canvas.getByRole('button', { name: /Set attribute on 5 members/ }),
    ).toBeInTheDocument();
  },
};

export const Choreographed: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: 'Show the bucket breakdown for MFA enrollment',
    });
    await userEvent.click(toggle);
    await expect(canvas.getByText('No factors enrolled')).toBeVisible();
    await expect(canvas.getByText('One factor')).toBeVisible();
    await expect(canvas.getByText('Two or more factors')).toBeVisible();
  },
};
