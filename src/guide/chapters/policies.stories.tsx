import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import PoliciesChapter from './policies';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/policies',
  component: PoliciesChapter,
  decorators: [withGuideShell('policies')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof PoliciesChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(await canvas.findByText(/Showing 3 of 3/)).toBeVisible();
  },
};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    if (!show) throw new Error('the chapter has no show');
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent(
      'When your role cannot read policies, the tab says Okta refused, not that the org is empty.',
    );
    await expect(
      stage.getByRole('heading', { name: 'Policies are not readable by this admin role' }),
    ).toBeVisible();
    await expect(stage.queryByRole('heading', { name: 'Any two factors' })).toBeNull();
  },
};

export const CardOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const first = await canvas.findByRole('button', { name: 'Hide rules for Any two factors' });
    const toggle = canvas.getByRole('button', { name: 'Show rules for Default Policy' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(
      canvas.getByRole('button', {
        name: 'Copy policy id for Default Policy (rstFAKE000000000003)',
      }),
    ).toBeVisible();
  },
};

export const LegendLit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const line = await canvas.findByText(/Legacy VPN is switched off/);
    const target = canvasElement.querySelector(
      '[data-testid="guide-body"] [data-spot="list:2"]:not(span)',
    );
    if (!target) throw new Error('the Legacy VPN card has no hot target wrapper');

    await userEvent.hover(line);
    await expect(line).toHaveAttribute('data-lit');
    await expect(target).toHaveAttribute('data-lit');

    await userEvent.unhover(line);
    await expect(line).not.toHaveAttribute('data-lit');
    await expect(target).not.toHaveAttribute('data-lit');

    await userEvent.hover(target);
    await expect(line).toHaveAttribute('data-lit');
    await userEvent.unhover(target);

    await fireEvent.focusIn(canvas.getByRole('button', { name: 'Show rules for Legacy VPN' }));
    await expect(line).toHaveAttribute('data-lit');
    await expect(target).toHaveAttribute('data-lit');
  },
};

export const Choreography: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const toggle = await canvas.findByRole('button', { name: 'Show rules for Legacy VPN' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByTestId('policy-rules-list').length).toBeGreaterThan(0);
  },
};
