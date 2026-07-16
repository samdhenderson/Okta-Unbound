import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import BulkOperationsPanel from './BulkOperationsPanel';
import { mockGroup } from '../../../test/mocks/handlers';
import type { GroupSummary, BulkOperationResult } from '../../../shared/types';

function makeGroup(id: string, name: string, memberCount: number): GroupSummary {
  return {
    id,
    name,
    type: mockGroup.type,
    memberCount,
    hasRules: false,
    ruleCount: 0,
  };
}

const selectedGroups: GroupSummary[] = [
  makeGroup('g1', 'Engineering', 120),
  makeGroup('g2', 'Product', 45),
  makeGroup('g3', 'Sales', 30),
];

const successResults: BulkOperationResult[] = selectedGroups.map((g) => ({
  groupId: g.id,
  groupName: g.name,
  status: 'success' as const,
  itemsProcessed: g.memberCount,
}));

const meta = {
  title: 'Groups/BulkOperationsPanel',
  component: BulkOperationsPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    selectedGroups,
    executeBulkOperation: fn(async () => successResults),
    onClose: fn(),
    onExportSelection: fn(),
  },
} satisfies Meta<typeof BulkOperationsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleGroupSelected: Story = {
  args: { selectedGroups: [makeGroup('g1', 'Engineering', 120)] },
};

export const NoGroupsSelected: Story = {
  args: { selectedGroups: [] },
};

export const ExecuteThrows: Story = {
  args: {
    executeBulkOperation: fn(async () => {
      throw new Error('Network request failed');
    }),
  },
};
