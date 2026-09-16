import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SelectionPane from './SelectionPane';
import type { SelectionBasket, SelectionRef } from '../../../selection/selectionStore';

const basketOf = (refs: Omit<SelectionRef, 'pickedAt'>[]): SelectionBasket => ({
  picked: refs.map((ref, index) => ({ ...ref, pickedAt: 1_700_000_000_000 + index })),
});

const countsOf = (basket: SelectionBasket) =>
  basket.picked.reduce<Record<string, number>>((acc, ref) => {
    acc[ref.kind] = (acc[ref.kind] ?? 0) + 1;
    return acc;
  }, {});

const USERS = basketOf([
  { kind: 'user', id: '00uFAKE0001', name: 'Dana Example' },
  { kind: 'user', id: '00uFAKE0002', name: 'Rowan Example' },
  { kind: 'user', id: '00uFAKE0003', name: 'Marlow Example' },
]);

const MIXED = basketOf([
  { kind: 'user', id: '00uFAKE0001', name: 'Dana Example' },
  { kind: 'group', id: '00gFAKE0001', name: 'Payments Team' },
  { kind: 'rule', id: '00rFAKE0001', name: 'Contractors' },
  { kind: 'policy', id: '00pFAKE0001', name: 'MFA Enrollment' },
]);

const meta = {
  title: 'Selection/panes/SelectionPane',
  component: SelectionPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One `DetailSection` per **non-empty** kind, in a stable declared order — a kind with ' +
          'nothing ticked never appears, since the basket’s `counts` already omits it and this ' +
          'pane does not reintroduce the zero (`docs/claims.md`).\n\n' +
          'Each section names its kind and count as a real phrase (`12 users selected`), lists the ' +
          'entries with a per-row remove control, and carries its own `Clear` scoped to that ' +
          'partition behind a confirm — a section-scoped verb belongs to the section, not to the ' +
          'rung’s strip (`docs/action-bars.md`).',
      },
    },
  },
  args: {
    query: '',
    onRemove: fn(),
    onClearKind: fn(),
  },
} satisfies Meta<typeof SelectionPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { basket: { picked: [] }, counts: {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing selected')).toBeInTheDocument();
  },
};

export const OneKind: Story = {
  args: { basket: USERS, counts: countsOf(USERS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Dana Example')).toBeInTheDocument();
  },
};

export const MixedKinds: Story = {
  args: { basket: MIXED, counts: countsOf(MIXED) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 rule selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 policy selected')).toBeInTheDocument();
  },
};

export const FilterKeepsTheCountHonest: Story = {
  args: { basket: USERS, counts: countsOf(USERS), query: 'dana' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Showing 1 of 3.')).toBeInTheDocument();
    await expect(canvas.queryByText('Rowan Example')).not.toBeInTheDocument();
  },
};

export const FilterMatchingNothingSaysSo: Story = {
  args: { basket: USERS, counts: countsOf(USERS), query: 'zzz' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('No users match "zzz".')).toBeInTheDocument();
  },
};

export const ConfirmClearPartition: Story = {
  args: { basket: MIXED, counts: countsOf(MIXED) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Clear users' }));
    await expect(args.onClearKind).not.toHaveBeenCalled();
    const dialog = within(canvas.getByRole('dialog', { name: 'Clear selected user?' }));
    await expect(
      dialog.getByText('Clear 1 selected user? This cannot be undone.'),
    ).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    await expect(args.onClearKind).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear users' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(args.onClearKind).toHaveBeenCalledWith('user');
  },
};

export const RemoveOne: Story = {
  args: { basket: USERS, counts: countsOf(USERS) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Dana Example from the selection' }),
    );
    await expect(args.onRemove).toHaveBeenCalledWith({ kind: 'user', id: '00uFAKE0001' });
  },
};
