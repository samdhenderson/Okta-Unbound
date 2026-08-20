import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ComparisonTabBar from './ComparisonTabBar';

const meta = {
  title: 'Users/Comparison/ComparisonTabBar',
  component: ComparisonTabBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tab bar (Overview / Groups / Apps / Attributes) for the comparison surface, with per-tab diff-count badges.\n\n' +
          'A `role="tablist"` segmented control; the Groups, Apps and Attributes tabs carry a pill badge showing the number of differing items, hidden when the count is 0. Purely presentational — selection and diff counts are supplied by the parent.\n\n' +
          'The bar is a **two-column grid below 640px** and a four-column one above it: four tabs of icon + label do not fit on one line in a 360px side panel, and the alternatives were truncating a label or dropping the glyphs.',
      },
    },
  },
  args: {
    activeTab: 'overview',
    onChange: fn(),
    groupDiff: 0,
    appDiff: 0,
    attributeDiff: 0,
  },
  argTypes: {
    activeTab: { description: 'Currently selected tab.' },
    onChange: { description: 'Invoked with the newly selected tab key.' },
    groupDiff: {
      description:
        'Number of differing groups, shown as a badge on the Groups tab (hidden when 0).',
    },
    appDiff: {
      description: 'Number of differing apps, shown as a badge on the Apps tab (hidden when 0).',
    },
    attributeDiff: {
      description:
        'Number of differing attributes the display config makes visible, shown as a badge on the Attributes tab (hidden when 0).',
    },
  },
} satisfies Meta<typeof ComparisonTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GroupsActive: Story = {
  args: { activeTab: 'groups' },
};

export const AppsActive: Story = {
  args: { activeTab: 'apps' },
};

export const AttributesActive: Story = {
  args: { activeTab: 'attributes' },
};

export const WithDiffBadges: Story = {
  args: { groupDiff: 3, appDiff: 12, attributeDiff: 4 },
};

export const LargeDiffCounts: Story = {
  args: { activeTab: 'groups', groupDiff: 128, appDiff: 999, attributeDiff: 42 },
};

export const CompactPanel: Story = {
  args: { activeTab: 'attributes', groupDiff: 3, appDiff: 12, attributeDiff: 4 },
  parameters: { layout: 'padded', viewport: { value: 'sidepanelCompact' } },
};
