import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AuditLogUndoModal from './AuditLogUndoModal';
import type { CapturedAttribute, UndoAction } from '../../shared/undoTypes';

const captured = (name: string, before: string, after: string): CapturedAttribute => ({
  name,
  label: name,
  beforeDisplay: before,
  beforeRaw: before,
  afterDisplay: after,
  restorable: true,
});

const omitted = (
  name: string,
  after: string,
  reason: CapturedAttribute['omitted'],
): CapturedAttribute => ({
  name,
  label: name,
  afterDisplay: after,
  restorable: false,
  omitted: reason,
});

const entry = (changes: CapturedAttribute[]): UndoAction => ({
  id: 'action_profile',
  type: 'UPDATE_USER_PROFILE',
  timestamp: Date.now() - 5 * 60 * 1000,
  description: 'Updated department, title on Ada Lovelace',
  status: 'completed',
  metadata: {
    type: 'UPDATE_USER_PROFILE',
    userId: '00uFAKE0000000000001',
    userLogin: 'user@example.com',
    userName: 'Ada Lovelace',
    changes,
  },
});

const fullyRestorable = entry([
  captured('department', 'Platform', 'Engineering'),
  captured('title', 'Intern', 'Engineer'),
]);

const partiallyRestorable = entry([
  captured('department', 'Platform', 'Engineering'),
  omitted('bio', 'A long biography that exceeded the capture cap', 'too-large'),
  captured('title', 'Intern', 'Engineer'),
  omitted('notes', 'Another long note', 'too-many'),
  captured('city', '', 'Berlin'),
]);

const meta = {
  title: 'Sidepanel/AuditLogUndoModal',
  component: AuditLogUndoModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The confirmation for undoing a recorded profile write, and the place a refusal is ' +
          'explained. Undo here is a forward write — Okta has no rollback, so restoring an ' +
          'attribute issues a new update that happens to set the old value, and the dialog ' +
          'says so.\n\n' +
          'The confirm body lists every attribute `after → before`, naming any whose prior ' +
          'value was never captured. The `drifted` body is a refusal with no confirm button, ' +
          'and shows attribute names only, never values.',
      },
    },
  },
  args: {
    action: fullyRestorable,
    onClose: fn(),
    onConfirm: fn(),
    isUndoing: false,
  },
  argTypes: {
    action: { description: 'The entry being undone. `null` closes the dialog.' },
    onClose: {
      description: 'Called on Cancel, Escape, overlay click, or the header close button.',
    },
    onConfirm: { description: 'Runs the restoring write. The dialog never calls Okta itself.' },
    isUndoing: {
      description: 'Whether the restoring write is in flight; drives the confirm spinner.',
    },
    drifted: {
      description: 'Attributes changed in Okta since the original write; present means refused.',
    },
    error: { description: 'Message from a restore that was attempted and did not succeed.' },
  },
} satisfies Meta<typeof AuditLogUndoModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', { name: 'Restore previous values' })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Restore' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const CancelMakesNoWrite: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};

export const PartialRestore: Story = {
  args: { action: partiallyRestorable },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('3 of 5 attributes can be restored.')).toBeVisible();
    await expect(canvas.getByText('Previous value was not captured (too large)')).toBeVisible();
    await expect(
      canvas.getByText('Previous value was not captured (too many attributes changed at once)'),
    ).toBeVisible();
  },
};

export const RestoringToEmpty: Story = {
  args: { action: entry([captured('city', '', 'Berlin')]) },
};

export const Drifted: Story = {
  args: { drifted: ['department', 'title'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', { name: 'Undo refused' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Restore' })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(canvas.queryByText(/Platform/)).toBeNull();
    await expect(canvas.queryByText(/Engineering/)).toBeNull();
  },
};

export const Undoing: Story = {
  args: { isUndoing: true },
};

export const ErrorState: Story = {
  args: { error: 'Okta rejected the profile update.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Okta rejected the profile update.');
    await expect(canvas.getByRole('button', { name: 'Restore' })).toBeVisible();
  },
};

export const Closed: Story = {
  args: { action: null },
};

export const Compact: Story = {
  args: { action: partiallyRestorable },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
