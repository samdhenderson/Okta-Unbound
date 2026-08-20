import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import AuditLogViewer from './AuditLogViewer';
import type {
  CapturedAttribute,
  UndoAction,
  UndoActionMetadata,
  UndoHistory,
} from '../../shared/undoTypes';

const recently = Date.now() - 5 * 60 * 1000;

const entry = (
  id: string,
  description: string,
  metadata: UndoActionMetadata,
  status: UndoAction['status'] = 'completed',
): UndoAction => ({ id, type: metadata.type, timestamp: recently, description, status, metadata });

const captured = (name: string, before: string, after: string): CapturedAttribute => ({
  name,
  label: name,
  beforeDisplay: before,
  beforeRaw: before,
  afterDisplay: after,
  restorable: true,
});

const profileUpdate = entry('action_profile', 'Updated department, title on Ada Lovelace', {
  type: 'UPDATE_USER_PROFILE',
  userId: '00uFAKE0000000000001',
  userLogin: 'user@example.com',
  userName: 'Ada Lovelace',
  changes: [
    captured('department', 'Platform', 'Engineering'),
    captured('title', 'Intern', 'Engineer'),
  ],
});

const undoneEntry: UndoAction = {
  ...profileUpdate,
  id: 'action_undone',
  description: 'Updated city on Grace Hopper',
  status: 'undone',
  undoneByActionId: 'action_undo',
};

const partialEntry: UndoAction = {
  ...profileUpdate,
  id: 'action_partial',
  description: 'Updated manager on Alan Turing',
  status: 'partial',
};

const groupRemoval = entry('action_removal', 'Removed Ada Lovelace from Engineering', {
  type: 'REMOVE_USER_FROM_GROUP',
  userId: '00uFAKE0000000000001',
  userEmail: 'user@example.com',
  userName: 'Ada Lovelace',
  groupId: '00gFAKE0000000000001',
  groupName: 'Engineering',
});

const bulkRemoval = entry('action_bulk', 'Removed 12 deprovisioned users from Contractors', {
  type: 'BULK_REMOVE_USERS_FROM_GROUP',
  users: Array.from({ length: 12 }, (_, index) => ({
    userId: `00uFAKEbulk${index}`,
    userEmail: `user${index}@example.com`,
    userName: `User ${index}`,
  })),
  groupId: '00gFAKE0000000000002',
  groupName: 'Contractors',
  operationType: 'deprovisioned',
});

const ruleChange = entry('action_rule', 'Deactivated rule "Engineering — US"', {
  type: 'DEACTIVATE_RULE',
  ruleId: '0prFAKE0000000000001',
  ruleName: 'Engineering — US',
});

const mixedHistory: UndoAction[] = [
  profileUpdate,
  undoneEntry,
  partialEntry,
  groupRemoval,
  bulkRemoval,
  ruleChange,
];

const seedHistory = (actions: UndoAction[]) => async () => {
  const previous = chrome.storage.local.get;
  const history: UndoHistory = { actions, maxSize: 50 };
  chrome.storage.local.get = (() =>
    Promise.resolve({ undoHistory: history })) as typeof chrome.storage.local.get;
  return () => {
    chrome.storage.local.get = previous;
  };
};

const meta = {
  title: 'Sidepanel/AuditLogViewer',
  component: AuditLogViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The recorded action history, read from `chrome.storage` and live-refreshed while the tab is active.\n\n' +
          'Each entry is an `AuditLogRow` — a real disclosure with `aria-expanded`, not the `cursor-pointer` `<div>` this viewer used to render — and a profile write whose prior values were captured also carries an **Undo**, confirmed through `AuditLogUndoModal`. Undo is a forward write, so it can be refused on drift or fail outright; both keep the dialog open and explain themselves there. A resolved outcome (restored, already undone, not undoable) is reported in an inline alert above the list.\n\n' +
          'Clear History goes through the shared `Modal` rather than a native `confirm()`, which is what gives it a focus trap, focus restore and Escape. The `chrome.storage` listener is gated on `isActive`: a hidden tab registers no shared listener and re-reads when it comes back (ADR-0018).\n\n' +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Storage & cache](?path=/docs/internals-storage-cache--docs)',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    targetTabId: {
      description: "Tab hosting the live Okta session an undo's restoring write is scoped to.",
    },
    isActive: {
      description:
        'Whether the History tab is visible. Gates the `chrome.storage` listener (ADR-0018).',
    },
  },
} satisfies Meta<typeof AuditLogViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  beforeEach: seedHistory(mixedHistory),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('6 actions logged')).toBeVisible();
    await expect(canvas.getAllByRole('button', { name: 'Undo' })).toHaveLength(1);
    await expect(canvas.getByText('Undone')).toBeVisible();
    await expect(canvas.getByText('Outcome unknown')).toBeVisible();
  },
};

export const Empty: Story = {
  beforeEach: seedHistory([]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('No audit history')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Clear History' })).toBeNull();
  },
};

export const ProfileUpdate: Story = {
  beforeEach: seedHistory([profileUpdate]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: 'Show details for Updated department, title on Ada Lovelace',
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(
      canvas.getByRole('button', {
        name: 'Hide details for Updated department, title on Ada Lovelace',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Undone: Story = {
  beforeEach: seedHistory([undoneEntry]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Undone')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Undo' })).toBeNull();
  },
};

export const OutcomeUnknown: Story = {
  beforeEach: seedHistory([partialEntry]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Outcome unknown')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Undo' })).toBeNull();
  },
};

export const UndoConfirmation: Story = {
  beforeEach: seedHistory([profileUpdate]),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Undo' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(within(dialog).getByText('Restore previous values')).toBeVisible();
  },
};

export const ClearHistoryConfirm: Story = {
  beforeEach: seedHistory(mixedHistory),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Clear History' }));
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(within(dialog).getByRole('button', { name: 'Clear history' })).toBeVisible();
  },
};

export const Compact: Story = {
  beforeEach: seedHistory(mixedHistory),
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
