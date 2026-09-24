import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import SelectionChapter from './selection';
import { CHAPTER_PARAMETERS, awaitShow, readerCanvas, withGuideShell } from './chapterStory';

const meta = {
  title: 'Guide/Chapters/selection',
  component: SelectionChapter,
  decorators: [withGuideShell('selection')],
  parameters: CHAPTER_PARAMETERS,
} satisfies Meta<typeof SelectionChapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Show: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(
      show.getByText(
        'Set a profile attribute counts first, then the confirm quotes what it found.',
      ),
    ).toBeInTheDocument();
    await expect(
      show.getByRole('dialog', { name: 'Set one profile attribute on these users' }),
    ).toBeInTheDocument();
    await expect(
      show.getByText('3 of 4 users will have Department set to Advertising'),
    ).toBeInTheDocument();
    await expect(
      show.getByRole('button', { name: /4 users and 1 group selected/ }),
    ).toBeInTheDocument();
  },
};

export const BasketThinned: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const scene = within(canvas.getByRole('region', { name: 'The Basket' }));
    await expect(
      scene.getByRole('button', { name: /4 users and 1 group selected/ }),
    ).toBeInTheDocument();

    const removes = scene.getAllByRole('button', { name: /^Remove / });
    await userEvent.click(removes[0]);
    await expect(
      scene.getByRole('button', { name: /3 users and 1 group selected/ }),
    ).toBeInTheDocument();

    await userEvent.click(scene.getByRole('button', { name: 'Clear groups' }));
    const dialog = within(await scene.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Clear' }));
    await expect(scene.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(scene.getByRole('button', { name: /^3 users selected$/ })).toBeInTheDocument();

    for (const button of scene.getAllByRole('button', { name: /^Remove / })) {
      await userEvent.click(button);
    }
    await expect(scene.queryByRole('button', { name: /selected/ })).not.toBeInTheDocument();
    await expect(scene.getByText('Nothing selected')).toBeInTheDocument();
    await expect(scene.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();

    await userEvent.click(scene.getByRole('button', { name: 'Put them back' }));
    await expect(
      scene.getByRole('button', { name: /4 users and 1 group selected/ }),
    ).toBeInTheDocument();
    await expect(scene.queryByRole('button', { name: 'Put them back' })).not.toBeInTheDocument();
  },
};

export const ConfirmOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const scene = within(canvas.getByRole('region', { name: 'Preflight' }));
    await userEvent.click(
      scene.getByRole('button', { name: 'Set one profile attribute on these users' }),
    );

    const dialog = within(
      await canvas.findByRole('dialog', { name: 'Set one profile attribute on these users' }),
    );
    await expect(
      dialog.getByText('3 of 4 users will have Department set to Advertising'),
    ).toBeInTheDocument();
    await expect(dialog.getByText(/cannot be undone from here/)).toBeInTheDocument();
    await expect(
      dialog.getByRole('button', { name: 'Set a profile attribute' }),
    ).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(
      scene.getByRole('button', { name: 'Set one profile attribute on these users' }),
    );
    await expect(
      await canvas.findByRole('dialog', { name: 'Set one profile attribute on these users' }),
    ).toBeInTheDocument();
  },
};

export const MarkersLightTheirLines: Story = {
  parameters: { ...CHAPTER_PARAMETERS, motion: 'on' },
  play: async ({ canvasElement }) => {
    const canvas = readerCanvas(canvasElement);
    const body = canvasElement.querySelector<HTMLElement>(
      '[data-testid="guide-body"]',
    ) as HTMLElement;
    const spot = (id: string) => body.querySelectorAll(`[data-spot="${id}"]`);
    const [verbTarget, verbLine] = Array.from(spot('verb:1'));
    const [otherTarget, otherLine] = Array.from(spot('verb:2'));

    await userEvent.hover(verbTarget);
    await expect(verbTarget).toHaveAttribute('data-lit');
    await expect(verbLine).toHaveAttribute('data-lit');
    await expect(otherTarget).not.toHaveAttribute('data-lit');
    await expect(otherLine).not.toHaveAttribute('data-lit');
    await userEvent.unhover(verbTarget);
    await expect(verbLine).not.toHaveAttribute('data-lit');

    await userEvent.hover(otherLine);
    await expect(otherTarget).toHaveAttribute('data-lit');
    await expect(verbTarget).not.toHaveAttribute('data-lit');
    for (const el of Array.from(spot('basket:2'))) await expect(el).not.toHaveAttribute('data-lit');
    await userEvent.unhover(otherLine);

    const [countStrip] = Array.from(spot('keep:1')) as HTMLElement[];
    const countOf = () =>
      within(countStrip).queryByRole('button', { name: /selected$/ })?.textContent ?? null;
    await expect(countOf()).toBe(null);
    const rows = canvas.getAllByTestId('guide-collection');
    const load = (row: HTMLElement) =>
      userEvent.click(within(row).getByRole('button', { name: /^Load / }));
    await load(rows[0]);
    await expect(countOf()).toBe('5');
    await load(rows[0]);
    await expect(countOf()).toBe('5');
    await load(rows[1]);
    await expect(countOf()).toBe('20');
  },
};
