import type { Meta, StoryObj } from '@storybook/react-vite';
import RulesMetaRow from './RulesMetaRow';

const meta = {
  title: 'Rules/RulesMetaRow',
  component: RulesMetaRow,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    apiCost: 12,
    lastFetchTime: '2026-07-16T14:30:00.000Z',
    hasRules: true,
  },
} satisfies Meta<typeof RulesMetaRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ApiCostOnly: Story = {
  args: { lastFetchTime: null, hasRules: false },
};

export const CachedOnly: Story = {
  args: { apiCost: null },
};

export const NoRulesLoaded: Story = {
  args: { apiCost: null, hasRules: false },
};

export const Empty: Story = {
  args: { apiCost: null, lastFetchTime: null, hasRules: false },
};
