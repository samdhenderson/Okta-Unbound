import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import CollectionsPane from './CollectionsPane';
import { OrgEntityIndexProvider } from '../../../contexts/OrgEntityIndexContext';
import type { Collection } from '../../../selection/collectionStore';

const SAVED_AT = Date.UTC(2026, 2, 5, 9, 30);

const TWO: Collection[] = [
  {
    id: 'col-1',
    name: 'Payments on-call',
    savedAt: SAVED_AT,
    rows: [
      { kind: 'user', id: '00uFAKE0001', name: 'Dana Example' },
      { kind: 'group', id: '00gFAKE0001' },
    ],
  },
  {
    id: 'col-2',
    name: 'App owners',
    savedAt: SAVED_AT,
    rows: [{ kind: 'app', id: '0oaFAKE0001' }],
  },
];

const meta = {
  title: 'Selection/panes/CollectionsPane',
  component: CollectionsPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The saved-collections list, plus the loader and the three outcomes a load can end in: a ' +
          'stated request cost to confirm before anything is spent, a refusal when the basket would ' +
          'pass its per-kind limit, and a refusal when a row cannot be named at all. A partial load ' +
          'is never landed — it would hand the next verb a smaller set than the one that was kept.',
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <OrgEntityIndexProvider oktaOrigin={null} targetTabId={null} enabled={false}>
        <Story />
      </OrgEntityIndexProvider>
    ),
  ],
  args: {
    query: '',
    addMany: fn(() => ({ basket: { picked: [] }, added: 0, alreadyPicked: 0, refused: 0 })),
    onDelete: fn(),
    onRename: fn(async () => ({ collections: TWO, saved: TWO[0] ?? null, refused: null })),
  },
} satisfies Meta<typeof CollectionsPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCollections: Story = {
  args: { collections: TWO, isReading: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Payments on-call')).toBeInTheDocument();
    await expect(canvas.getByText('App owners')).toBeInTheDocument();
    await expect(canvas.queryByText('No saved collections')).not.toBeInTheDocument();
  },
};

export const NothingSaved: Story = {
  args: { collections: [], isReading: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No saved collections')).toBeInTheDocument();
  },
};

export const StillReading: Story = {
  args: { collections: [], isReading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('No saved collections')).not.toBeInTheDocument();
  },
};
