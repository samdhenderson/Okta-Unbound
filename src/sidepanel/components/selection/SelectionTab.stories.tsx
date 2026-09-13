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
          'Reviews and prunes the entity-selection basket (`docs/adr/0005-session-chrome.md`). ' +
          'One `DetailSection` per **non-empty** kind, in a stable declared order — a kind with ' +
          'nothing ticked never appears, since `useSelection().counts` already omits it and this ' +
          'component does not reintroduce the zero.\n\n' +
          'Each section names its kind and count as a real phrase (`12 users selected`), lists the ' +
          'entries with a per-row remove control, and carries its own `Clear` button scoped to that ' +
          'partition — a section-scoped verb belongs to the section, not to the page strip ' +
          '(`docs/action-bars.md`). `SelectionActionBar` carries only the whole-basket `Clear all`, ' +
          'behind **More** with a confirm modal.\n\n' +
          'An empty basket renders a shared `EmptyState` explaining how selection works, with no fake ' +
          'affordance — there is nothing to click yet.',
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
