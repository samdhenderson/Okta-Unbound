import type { Meta, StoryObj } from '@storybook/react-vite';
import RulesMetaRow from './RulesMetaRow';

const meta = {
  title: 'Rules/RulesMetaRow',
  component: RulesMetaRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Small metadata chips shown above the Rules list.\n\n' +
          'Surfaces the API-request count the last load cost and the timestamp of the cached data. Each chip is independently gated: the cost chip appears only when a cost is known, and the cache chip only when a time is known *and* rules are loaded. When neither has anything to show the component renders nothing.',
      },
    },
  },
  argTypes: {
    apiCost: { description: 'API requests the last load cost, or null when unknown.' },
    lastFetchTime: { description: 'ISO timestamp of the last successful load, or null.' },
    hasRules: { description: 'Whether any rules are loaded (gates the cache chip).' },
  },
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
