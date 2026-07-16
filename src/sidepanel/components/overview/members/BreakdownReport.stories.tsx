import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import BreakdownReport from './BreakdownReport';
import { NONE_VALUE, OTHER_VALUE } from './memberAnalytics';
import type { BreakdownRow } from './memberAnalytics';

const sampleRows: BreakdownRow[] = [
  { value: 'Engineering', label: 'Engineering', count: 420, pct: 42 },
  { value: 'Sales', label: 'Sales', count: 210, pct: 21 },
  { value: 'Marketing', label: 'Marketing', count: 150, pct: 15 },
  { value: NONE_VALUE, label: '(none)', count: 60, pct: 6 },
  { value: OTHER_VALUE, label: 'Other (4 values)', count: 160, pct: 16 },
];

const meta = {
  title: 'Overview/Members/BreakdownReport',
  component: BreakdownReport,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    rows: sampleRows,
    activeValues: new Set<string>(),
    onRowClick: fn(),
  },
} satisfies Meta<typeof BreakdownReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { rows: [] },
};

export const EmptyWithCustomMessage: Story = {
  args: { rows: [], emptyMessage: 'No breakdown available yet.' },
};

export const WithActiveRow: Story = {
  args: { activeValues: new Set(['Engineering']) },
};

export const WithExpandableOther: Story = {
  args: { onShowOther: fn() },
};
