import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupExportModal from './GroupExportModal';
import type { GroupSummary } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/handlers';

const sampleGroups: GroupSummary[] = [
  {
    id: '00g1',
    name: 'Engineering',
    description: 'All engineering staff',
    type: 'OKTA_GROUP',
    memberCount: 128,
    hasRules: true,
    ruleCount: 2,
    created: new Date('2023-01-15'),
    lastUpdated: new Date('2026-06-01'),
  },
  {
    id: '00g2',
    name: 'Salesforce Users',
    description: 'Mastered by the Salesforce app',
    type: 'APP_GROUP',
    memberCount: 42,
    hasRules: false,
    ruleCount: 0,
    sourceAppId: 'app1',
    sourceAppName: 'Salesforce',
    created: new Date('2022-11-03'),
    lastUpdated: new Date('2026-05-20'),
  },
  {
    id: '00g3',
    name: 'Everyone',
    type: 'BUILT_IN',
    memberCount: 1450,
    hasRules: false,
    ruleCount: 0,
    created: new Date('2020-01-01'),
  },
];

const manyGroups: GroupSummary[] = Array.from({ length: 25 }, (_, i) => ({
  id: `00g${i + 1}`,
  name: `Group ${i + 1}`,
  type: 'OKTA_GROUP',
  memberCount: (i + 1) * 10,
  hasRules: i % 3 === 0,
  ruleCount: i % 3 === 0 ? 1 : 0,
}));

const meta = {
  title: 'Groups/GroupExportModal',
  component: GroupExportModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    isOpen: true,
    onClose: fn(),
    groups: sampleGroups,
    targetTabId: 1,
    exportType: 'selection',
    onFetchMembers: fn(async () => mockUsers.slice(0, 5)),
  },
} satisfies Meta<typeof GroupExportModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collection: Story = {
  args: {
    exportType: 'collection',
    collectionName: 'Q3 Access Review',
  },
};

export const NoTargetTab: Story = {
  args: { targetTabId: null },
};

export const LargeExport: Story = {
  args: { groups: manyGroups },
};

export const Closed: Story = {
  args: { isOpen: false },
};
