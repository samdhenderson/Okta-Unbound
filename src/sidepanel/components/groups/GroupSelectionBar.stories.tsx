import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupSelectionBar from './GroupSelectionBar';

const meta = {
  title: 'Groups/GroupSelectionBar',
  component: GroupSelectionBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    selectedCount: 0,
    filteredCount: 42,
    activePanel: 'none',
    crossSearchBadge: 0,
    onSelectAll: fn(),
    onDeselectAll: fn(),
    onCompare: fn(),
    onMerge: fn(),
    onTogglePanel: fn(),
    onExportSelection: fn(),
    onExportGroupsList: fn(),
  },
} satisfies Meta<typeof GroupSelectionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { selectedCount: 2 },
};

export const LargeSelection: Story = {
  args: { selectedCount: 12 },
};

export const WithCrossSearchBadge: Story = {
  args: { selectedCount: 3, crossSearchBadge: 5 },
};

export const BulkPanelOpen: Story = {
  args: { selectedCount: 4, activePanel: 'bulk' },
};

export const NoFilteredGroups: Story = {
  args: { filteredCount: 0 },
};
