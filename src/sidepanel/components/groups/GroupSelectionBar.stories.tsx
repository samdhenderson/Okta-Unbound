import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupSelectionBar from './GroupSelectionBar';

const meta = {
  title: 'Groups/GroupSelectionBar',
  component: GroupSelectionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The "N of M selected" bar and action buttons above the groups list.\n\n' +
          'Button visibility is gated by the selection size: Select All / Deselect All / ' +
          'Export List are always available; Compare appears for 2–5 selected groups and ' +
          'Merge / Bulk Actions / Export Selection for 2+. The active inline panel gets a ' +
          'highlighted trigger, and a badge surfaces the number of cached cross-group ' +
          'search results.',
      },
    },
  },
  argTypes: {
    selectedCount: { description: 'Number of currently selected groups.' },
    filteredCount: { description: 'Number of groups after filtering (the "of M" denominator).' },
    activePanel: { description: 'Which inline panel is open, used to highlight its trigger.' },
    crossSearchBadge: {
      description: 'Cached-members count — shown as the Cross-Search badge when > 0.',
    },
    onSelectAll: { description: 'Selects every filtered group.' },
    onDeselectAll: { description: 'Clears the selection.' },
    onCompare: { description: 'Opens the comparison modal (shown only for 2–5 selections).' },
    onMerge: { description: 'Opens the merge wizard (shown for 2+ selections).' },
    onTogglePanel: { description: 'Toggles the given inline panel open/closed.' },
    onExportSelection: { description: 'Exports the selected groups.' },
    onExportGroupsList: { description: 'Exports the current (filtered) groups list.' },
  },
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
