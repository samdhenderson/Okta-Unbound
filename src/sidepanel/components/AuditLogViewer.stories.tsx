import type { Meta, StoryObj } from '@storybook/react-vite';
import AuditLogViewer from './AuditLogViewer';
import type { UndoAction, UndoHistory } from '../../shared/undoTypes';

const sampleActions: UndoAction[] = [
  {
    id: 'action_1',
    type: 'REMOVE_USER_FROM_GROUP',
    timestamp: Date.now() - 45 * 1000,
    description: 'Removed Ada Lovelace from Engineering',
    status: 'completed',
    metadata: {
      type: 'REMOVE_USER_FROM_GROUP',
      userId: '00uFAKEuser1',
      userEmail: 'ada.lovelace@example.com',
      userName: 'Ada Lovelace',
      groupId: '00gFAKEgroup1',
      groupName: 'Engineering',
    },
  },
  {
    id: 'action_2',
    type: 'BULK_REMOVE_USERS_FROM_GROUP',
    timestamp: Date.now() - 18 * 60 * 1000,
    description: 'Removed 12 deprovisioned users from Contractors',
    status: 'completed',
    metadata: {
      type: 'BULK_REMOVE_USERS_FROM_GROUP',
      users: Array.from({ length: 12 }, (_, i) => ({
        userId: `00uFAKEbulk${i}`,
        userEmail: `user${i}@example.com`,
        userName: `User ${i}`,
      })),
      groupId: '00gFAKEgroup2',
      groupName: 'Contractors',
      operationType: 'deprovisioned',
    },
  },
  {
    id: 'action_3',
    type: 'DEACTIVATE_RULE',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    description: 'Deactivated rule "Engineering - US"',
    status: 'completed',
    metadata: {
      type: 'DEACTIVATE_RULE',
      ruleId: '0prFAKErule1',
      ruleName: 'Engineering - US',
    },
  },
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
          'Read-only audit trail of actions performed through the extension.\n\n' +
          'Reads the undo/action history from `chrome.storage`, live-refreshes when it changes, and renders each entry as an expandable row with type-specific detail rows plus a confirm-gated "Clear History" action. Falls back to an empty state when nothing has been recorded.\n\n' +
          '**Related internals:** [Storage & cache](?path=/docs/internals-storage-cache--docs)',
      },
    },
  },
} satisfies Meta<typeof AuditLogViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  beforeEach: seedHistory(sampleActions),
};

export const Empty: Story = {
  beforeEach: seedHistory([]),
};
