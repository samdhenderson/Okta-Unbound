import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ActiveFilterChips from './ActiveFilterChips';
import type { MemberFilter } from './memberAnalytics';

const sampleFilters: MemberFilter[] = [
  { dimension: 'status', value: 'ACTIVE', label: 'Status: Active' },
  { dimension: 'department', value: 'Engineering', label: 'Department: Engineering' },
];

const meta = {
  title: 'Overview/Members/ActiveFilterChips',
  component: ActiveFilterChips,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Removable chips summarizing the member explorer's active facet filters.\n\n" +
          'Renders one chip per active filter — each with an accessible remove button — ' +
          'plus a "Clear all" action, wrapping across lines as filters accumulate. Renders ' +
          'nothing when no filters are active.',
      },
    },
  },
  argTypes: {
    filters: { description: 'Currently active facet filters.' },
    onRemove: { description: 'Remove a single filter.' },
    onClearAll: { description: 'Remove every active filter.' },
  },
  args: {
    filters: sampleFilters,
    onRemove: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof ActiveFilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleFilter: Story = {
  args: { filters: [sampleFilters[0]] },
};

export const ManyFilters: Story = {
  args: {
    filters: [
      { dimension: 'status', value: 'ACTIVE', label: 'Status: Active' },
      { dimension: 'department', value: 'Engineering', label: 'Department: Engineering' },
      { dimension: 'title', value: 'Developer', label: 'Title: Developer' },
      { dimension: 'city', value: 'Austin', label: 'City: Austin' },
      { dimension: 'mfa', value: 'enrolled', label: 'MFA: Enrolled' },
    ],
  },
};

export const Empty: Story = {
  args: { filters: [] },
};
