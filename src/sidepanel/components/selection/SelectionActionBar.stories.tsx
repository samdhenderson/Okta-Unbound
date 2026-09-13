import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SelectionActionBar from './SelectionActionBar';

const meta = {
  title: 'Selection/SelectionActionBar',
  component: SelectionActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`docs/action-bars.md`’s questions put the two whole-page verbs in different places. ' +
          '**`Save as collection`** is the strip’s one `primary`: its object is the whole basket, ' +
          'opening the modal counts as acting, and nothing is destroyed — a saved collection can ' +
          'simply be deleted again — so it stays in the row.\n\n' +
          '**`Clear all`** fails the third question: nothing re-ticks the basket for you, so a second ' +
          'press cannot undo the first. It goes behind **More**, hand-drawn in the tier rather than ' +
          'declared as an `ActionDescriptor`, because the consequence sentence beside the button ' +
          '(`Empties every partition. There is no undo.`) is exactly what a descriptor cannot carry — ' +
          'the same reason `UserLifecycleActions` hand-draws Suspend.\n\n' +
          'The band outlives an empty basket. An org with saved collections has something to search ' +
          'and something to load even with nothing ticked, so the two verbs are omitted individually ' +
          'rather than taking the search field down with them. Only a page with neither a basket nor ' +
          'a collection renders nothing at all — a verb with no object is omitted, never disabled.',
      },
    },
  },
  args: {
    total: 12,
    hasCollections: false,
    query: '',
    onQueryChange: fn(),
    onSaveCollection: fn(),
    onClearAll: fn(),
    sticky: false,
  },
  argTypes: {
    total: { description: 'How many entities are in the basket. `0` omits both verbs.' },
    hasCollections: {
      description: 'Whether the org has any saved collection. Keeps the band alive at `total: 0`.',
    },
    query: { description: 'Current search text. `’’` means no filter.' },
    onQueryChange: { description: 'Called as the reader types.' },
    onSaveCollection: { description: 'Opens the save-a-collection modal.' },
    onClearAll: { description: 'Empty the whole basket. Wired to `useSelection().clearAll`.' },
    sticky: {
      description: 'Pin the strip below the header. `false` in stories — nothing scrolls.',
    },
  },
} satisfies Meta<typeof SelectionActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { total: 0, hasCollections: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument();
  },
};

export const EmptyBasketWithCollections: Story = {
  args: { total: 0, hasCollections: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('searchbox', { name: 'Search the selection and saved collections' }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Save as collection' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  },
};

export const OneKind: Story = {
  args: { total: 12 },
};

export const MixedKinds: Story = {
  args: { total: 47 },
};

export const SaveIsInTheRow: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save as collection' });
    await expect(save).toBeInTheDocument();

    await userEvent.click(save);
    await expect(args.onSaveCollection).toHaveBeenCalled();
    await expect(args.onClearAll).not.toHaveBeenCalled();
  },
};

export const SearchReportsTyping: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search the selection and saved collections' }),
      'mark',
    );
    await expect(args.onQueryChange).toHaveBeenCalled();
  },
};

export const LargePartition: Story = {
  args: { total: 1834 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(
      canvas.getByText('Clear all 1,834 entities? This cannot be undone.'),
    ).toBeInTheDocument();
  },
};

export const ConfirmClearAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    const dialog = within(canvas.getByRole('dialog', { name: 'Clear all selected entities?' }));
    await expect(
      dialog.getByText('Clear all 12 entities? This cannot be undone.'),
    ).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Clear all' }));
  },
};
