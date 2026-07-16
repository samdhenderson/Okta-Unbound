import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ComparisonTabBar from './ComparisonTabBar';

const meta = {
  title: 'Users/Comparison/ComparisonTabBar',
  component: ComparisonTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    activeTab: 'overview',
    onChange: fn(),
    groupDiff: 0,
    appDiff: 0,
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
