import type React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import SelectionTab from './SelectionTab';
import { selectionStore } from '../../selection/selectionStore';
import { OrgEntityIndexProvider } from '../../contexts/OrgEntityIndexContext';

const meta = {
  title: 'Selection/SelectionTab',
  component: SelectionTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'Reviews and spends the entity-selection basket (`docs/adr/0005-session-chrome.md`). ' +
          'The body is a `Tabs` shell over four panes — **Selection** (the roster), **Actions** ' +
          '(the verbs that spend a cohort), **Reports** (the read-only questions) and ' +
          '**Collections** (the saved cohorts) — following `GroupDetailView`’s five-pane ' +
          'precedent.\n\n' +
          'A pane with nothing in it **stays**, stating why in a sentence: a strip that grew a seat ' +
          'as each verb landed, or lost one as a partition emptied, would be chrome reshuffling ' +
          'under the reader. Inside a pane the opposite rule still holds — an empty kind is absent ' +
          'rather than stated as a zero.\n\n' +
          'The tab strip is not a band; it scrolls with the body, so the rung’s sticky bands are ' +
          'still the header and `SelectionActionBar`, which carries the whole-basket ' +
          '`Save as collection` and, behind **More** with a confirm, `Clear all`. Its sub-row ' +
          'search filters the roster and the saved collections alike.',
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
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
} satisfies Meta<typeof SelectionTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyBasket: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing selected')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  },
};

export const OneKind: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0002', name: 'Rowan Example' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('2 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Dana Example')).toBeInTheDocument();
    await expect(canvas.getByText('Rowan Example')).toBeInTheDocument();
    await expect(canvas.queryByText('Nothing selected')).not.toBeInTheDocument();
  },
};

export const MixedKinds: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'group', id: '00gFAKE0001', name: 'Payments Team' });
    selectionStore.toggle({ kind: 'rule', id: '00rFAKE0001', name: 'Contractors' });
    selectionStore.toggle({ kind: 'policy', id: '00pFAKE0001', name: 'MFA Enrollment' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 rule selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 policy selected')).toBeInTheDocument();
  },
};

export const LargePartition: Story = {
  beforeEach: () => {
    for (let i = 0; i < 40; i += 1) {
      selectionStore.toggle({
        kind: 'user',
        id: `00uFAKE${String(i).padStart(4, '0')}`,
        name: `User ${i}`,
      });
    }
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('40 users selected')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove User 0 from the selection' }));
    await expect(canvas.getByText('39 users selected')).toBeInTheDocument();
    await expect(canvas.queryByText('User 0')).not.toBeInTheDocument();
    await expect(canvas.getByText('User 1')).toBeInTheDocument();
  },
};

export const ConfirmClearPartition: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'group', id: '00gFAKE0001', name: 'Payments Team' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Clear users' }));
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
    const dialog = within(canvas.getByRole('dialog', { name: 'Clear selected user?' }));
    await expect(
      dialog.getByText('Clear 1 selected user? This cannot be undone.'),
    ).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear users' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(canvas.queryByText(/users? selected/)).not.toBeInTheDocument();
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
  },
};

export const FilterKeepsTheCountHonest: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0002', name: 'Rowan Example' });
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0003', name: 'Marlow Example' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search the selection and saved collections' }),
      'dana',
    );

    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Showing 1 of 3.')).toBeInTheDocument();
    await expect(canvas.getByText('Dana Example')).toBeInTheDocument();
    await expect(canvas.queryByText('Rowan Example')).not.toBeInTheDocument();
  },
};

export const FilterMatchingNothingSaysSo: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'group', id: '00gFAKE0001', name: 'Payments Team' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search the selection and saved collections' }),
      'zzz',
    );
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
    await expect(canvas.getByText('No groups match "zzz".')).toBeInTheDocument();
  },
};

export const PaneStrip: Story = {
  beforeEach: () => {
    selectionStore.toggle({ kind: 'user', id: '00uFAKE0001', name: 'Dana Example' });
    selectionStore.toggle({ kind: 'group', id: '00gFAKE0001', name: 'Payments Team' });
    return () => selectionStore.clearAll();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const strip = within(canvas.getByRole('tablist', { name: 'Selection sections' }));

    for (const name of ['Selection', 'Actions', 'Reports', 'Collections']) {
      await expect(strip.getByRole('tab', { name: new RegExp(`^${name}`) })).toBeInTheDocument();
    }

    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();

    await userEvent.click(strip.getByRole('tab', { name: /^Actions/ }));
    await expect(canvas.getByRole('tabpanel', { name: 'Actions' })).toBeInTheDocument();
    await expect(canvas.queryByText('1 user selected')).not.toBeInTheDocument();

    await userEvent.click(strip.getByRole('tab', { name: /^Reports/ }));
    await expect(canvas.getByRole('tabpanel', { name: 'Reports' })).toBeInTheDocument();

    await userEvent.click(strip.getByRole('tab', { name: /^Collections/ }));
    await expect(canvas.getByRole('tabpanel', { name: 'Collections' })).toBeInTheDocument();
    await expect(canvas.getByText('No saved collections')).toBeInTheDocument();

    await userEvent.click(strip.getByRole('tab', { name: /^Selection/ }));
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
  },
};

export const EmptyBasketKeepsThePanes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const strip = within(canvas.getByRole('tablist', { name: 'Selection sections' }));
    await expect(strip.getAllByRole('tab')).toHaveLength(4);
    await expect(canvas.getByText('Nothing selected')).toBeInTheDocument();
  },
};
