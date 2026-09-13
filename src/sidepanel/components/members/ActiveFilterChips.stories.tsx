import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import ActiveFilterChips from './ActiveFilterChips';
import type { MemberFilter } from './memberAnalytics';

const sampleFilters: MemberFilter[] = [
  { dimension: 'status', value: 'ACTIVE', label: 'Status: Active' },
  { dimension: 'department', value: 'Engineering', label: 'Department: Engineering' },
];

const meta = {
  title: 'Members/ActiveFilterChips',
  component: ActiveFilterChips,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Removable chips summarizing the member explorer\'s active facet filters: one chip per filter with its own remove button, plus a "Clear all" action. Renders nothing when no filters are active.',
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

const RemovableChips = (): ReactElement => {
  const [filters, setFilters] = useState<MemberFilter[]>([
    { dimension: 'status', value: 'ACTIVE', label: 'Status: Active' },
    { dimension: 'department', value: 'Engineering', label: 'Department: Engineering' },
    { dimension: 'city', value: 'Austin', label: 'City: Austin' },
  ]);
  return (
    <ActiveFilterChips
      filters={filters}
      onRemove={(filter) => setFilters((current) => current.filter((f) => f !== filter))}
      onClearAll={() => setFilters([])}
    />
  );
};

export const Removing: Story = {
  render: () => <RemovableChips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Department: Engineering filter' }),
    );
    await expect(canvas.queryByText('Department: Engineering')).not.toBeInTheDocument();
    await expect(canvas.getByText('Status: Active')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.queryByText('Status: Active')).not.toBeInTheDocument();
  },
};
