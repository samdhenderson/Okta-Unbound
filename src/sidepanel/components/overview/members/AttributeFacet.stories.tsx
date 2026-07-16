import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AttributeFacet from './AttributeFacet';
import { discoverAttributeBreakdowns, NONE_VALUE, OTHER_VALUE } from './memberAnalytics';
import type { AttributeSummary } from './memberAnalytics';
import { mockUsers } from '../../../../test/mocks/handlers';

const discovered = discoverAttributeBreakdowns(mockUsers);
const departmentSummary = discovered.find((a) => a.key === 'department') ?? discovered[0];

const manyValuesSummary: AttributeSummary = {
  key: 'title',
  label: 'Title',
  distinct: 9,
  populated: 940,
  total: 1000,
  fillRate: 94,
  rows: [
    { value: 'Software Engineer', label: 'Software Engineer', count: 320, pct: 32 },
    { value: 'Product Manager', label: 'Product Manager', count: 210, pct: 21 },
    { value: 'Designer', label: 'Designer', count: 150, pct: 15 },
    { value: 'Support Engineer', label: 'Support Engineer', count: 90, pct: 9 },
    { value: NONE_VALUE, label: '(none)', count: 60, pct: 6 },
    { value: OTHER_VALUE, label: 'Other (5 values)', count: 170, pct: 17 },
  ],
};

const meta = {
  title: 'Overview/Members/AttributeFacet',
  component: AttributeFacet,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    summary: departmentSummary,
    activeValues: new Set<string>(),
    onToggleValue: fn(),
    onExpand: fn(),
  },
} satisfies Meta<typeof AttributeFacet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyValues: Story = {
  args: { summary: manyValuesSummary },
};

export const WithActiveFilter: Story = {
  args: {
    summary: manyValuesSummary,
    activeValues: new Set(['Product Manager']),
  },
};

export const LowFillRate: Story = {
  args: {
    summary: {
      ...manyValuesSummary,
      fillRate: 62,
    },
  },
};
