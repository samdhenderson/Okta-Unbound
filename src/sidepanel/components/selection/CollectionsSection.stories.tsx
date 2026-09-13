import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import CollectionsSection from './CollectionsSection';
import type { Collection, SaveOutcome } from '../../selection/collectionStore';

const SAVED_AT = Date.UTC(2026, 2, 5, 9, 30);

function makeCollection(
  id: string,
  name: string,
  counts: { user?: number; group?: number; app?: number; rule?: number; policy?: number } = {},
): Collection {
  const rows: Collection['rows'] = [];
  for (let i = 0; i < (counts.user ?? 0); i += 1) {
    rows.push({ kind: 'user', id: `00uFAKE${String(i).padStart(4, '0')}` });
  }
  for (let i = 0; i < (counts.group ?? 0); i += 1) {
    rows.push({ kind: 'group', id: `00gFAKE${String(i).padStart(4, '0')}` });
  }
  for (let i = 0; i < (counts.app ?? 0); i += 1) {
    rows.push({ kind: 'app', id: `0oaFAKE${String(i).padStart(4, '0')}` });
  }
  for (let i = 0; i < (counts.rule ?? 0); i += 1) {
    rows.push({ kind: 'rule', id: `0prFAKE${String(i).padStart(4, '0')}` });
  }
  for (let i = 0; i < (counts.policy ?? 0); i += 1) {
    rows.push({ kind: 'policy', id: `00pFAKE${String(i).padStart(4, '0')}` });
  }
  return { id, name, rows, savedAt: SAVED_AT };
}

const THREE: Collection[] = [
  makeCollection('col-1', 'Payments on-call', { user: 12, group: 3 }),
  makeCollection('col-2', 'Contractor access review', { user: 1, policy: 2 }),
  makeCollection('col-3', 'App owners', { app: 4 }),
];

const TWELVE: Collection[] = [
  makeCollection('col-m1', 'Marketing leads', { user: 5 }),
  makeCollection('col-m2', 'Marketing contractors', { user: 2, group: 1 }),
  makeCollection('col-m3', 'Marketing apps', { app: 3 }),
  ...Array.from({ length: 9 }, (_, i) =>
    makeCollection(`col-o${i}`, `Engineering cohort ${i + 1}`, { user: i + 1 }),
  ),
];

const collides = fn(async (): Promise<SaveOutcome> => ({
  collections: THREE,
  saved: null,
  refused: 'duplicate-name',
}));

const meta = {
  title: 'Selection/CollectionsSection',
  component: CollectionsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The named cohorts saved by `collectionStore`, one row each: what the collection holds ' +
          'per kind, when it was saved, and the three verbs that reach it — Load, an inline ' +
          'rename, and a confirmed delete.\n\n' +
          'It renders **nothing at all** while the first read is in flight, and nothing when the ' +
          'org has saved nothing. A list that has not been read is not "no collections" ' +
          '(`docs/claims.md`), and the Selection tab owns the page-level empty state.\n\n' +
          'Under an active query the heading keeps naming the whole set and the section states ' +
          'what it is showing of it (`Showing 3 of 12.`); a query that matches nothing states the ' +
          'absence by name rather than quietly rendering an empty section.\n\n' +
          'Deleting is irreversible with no undo, so it asks first (`docs/action-bars.md`), and ' +
          'the confirmed row collapses out before the list closes the gap.',
      },
    },
  },
  args: {
    collections: THREE,
    isReading: false,
    query: '',
    onLoad: fn(),
    onDelete: fn(),
    onRename: fn(async (): Promise<SaveOutcome> => ({
      collections: THREE,
      saved: null,
      refused: null,
    })),
  },
  argTypes: {
    collections: { description: "The org's saved collections, newest first." },
    isReading: { description: 'True until the first read settles — renders nothing while set.' },
    query: { description: "Active search query. `''` means no filter." },
    onLoad: { description: "Put a collection's entities back in the basket." },
    onDelete: { description: 'Forget one collection, once the confirm has been accepted.' },
    onRename: {
      description: 'Rename one; resolves to the outcome so a collision reports in place.',
    },
  },
} satisfies Meta<typeof CollectionsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SeveralCollections: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: /Saved collections/ })).toBeInTheDocument();
    await expect(canvas.getByText(/12 users · 3 groups/)).toBeInTheDocument();
    await expect(canvas.getByText(/1 user · 2 policies/)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Load Payments on-call' })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isReading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { collections: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Filtered: Story = {
  args: { collections: TWELVE, query: 'market' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Showing 3 of 12.')).toBeInTheDocument();
    await expect(canvas.getByTestId('detail-section-count')).toHaveTextContent('12');
    await expect(canvas.getByText('Marketing leads')).toBeInTheDocument();
    await expect(canvas.queryByText('Engineering cohort 1')).not.toBeInTheDocument();
  },
};

export const FilteredNoMatch: Story = {
  args: { collections: THREE, query: 'market' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No collections match "market".')).toBeInTheDocument();
    await expect(canvas.queryByText('Payments on-call')).not.toBeInTheDocument();
  },
};

export const RenameCollision: Story = {
  args: { onRename: collides },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Rename App owners' }));

    const field = canvas.getByRole('textbox', { name: 'Rename App owners' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Payments on-call{Enter}');

    await expect(
      await canvas.findByText('Another collection in this org already has that name.'),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('textbox', { name: 'Rename App owners' })).toBeInTheDocument();
  },
};

export const RenameAccepted: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Rename App owners' }));

    const field = canvas.getByRole('textbox', { name: 'Rename App owners' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Application owners');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(args.onRename).toHaveBeenCalledWith('col-3', 'Application owners'));
    await waitFor(() =>
      expect(canvas.queryByRole('textbox', { name: 'Rename App owners' })).not.toBeInTheDocument(),
    );
  },
};

export const ConfirmDeleteCancelled: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete Payments on-call' }));

    const dialog = within(
      await canvas.findByRole('dialog', { name: 'Delete "Payments on-call"?' }),
    );
    await expect(
      dialog.getByText(/nothing restores the collection afterwards/),
    ).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));

    await expect(args.onDelete).not.toHaveBeenCalled();
    await expect(canvas.getByText('Payments on-call')).toBeInTheDocument();
  },
};

export const ConfirmDeleteAccepted: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete Payments on-call' }));

    const dialog = within(
      await canvas.findByRole('dialog', { name: 'Delete "Payments on-call"?' }),
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(args.onDelete).toHaveBeenCalledWith('col-1'));
  },
};
