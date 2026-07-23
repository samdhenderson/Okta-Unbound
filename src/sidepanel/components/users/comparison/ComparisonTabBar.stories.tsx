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
          'Tab bar (Overview / Groups / Apps) for the comparison modal, with per-tab diff-count badges.\n\n' +
          'A `role="tablist"` segmented control; the Groups and Apps tabs carry a pill badge showing the number of differing items, hidden when the count is 0. Purely presentational — selection and diff counts are supplied by the parent.',
      },
    },
  },
  args: {
    activeTab: 'overview',
    onChange: fn(),
    groupDiff: 0,
    appDiff: 0,
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

export const WithDiffBadges: Story = {
  args: { groupDiff: 3, appDiff: 12 },
};

export const LargeDiffCounts: Story = {
  args: { activeTab: 'groups', groupDiff: 128, appDiff: 999 },
};
