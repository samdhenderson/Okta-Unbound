import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
  title: 'Members/BreakdownReport',
  component: BreakdownReport,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dependency-free list of horizontal proportion bars for a value distribution. Each row is a clickable filter toggle that highlights when its value is an active member-list filter; the aggregated "Other" row is clickable only when `onShowOther` is supplied.\n\n' +
          '`rowIntent` decides what a row promises: `toggle` keeps `aria-pressed`, while `navigate` drops it and names the destination, because a row that leaves is not a toggle.',
      },
    },
  },
  argTypes: {
    rows: { description: 'Pre-computed, sorted rows (top-N + optional "Other").' },
    activeValues: {
      description: 'Canonical values currently selected as filters (for highlight).',
    },
    onRowClick: { description: 'Called when a clickable value row is toggled.' },
    onShowOther: {
      description: 'Called when the aggregated "Other" row is clicked, to reveal its values.',
    },
    rowIntent: {
      description: 'Whether a value row toggles a facet or navigates to the Members tab.',
    },
    emptyMessage: { description: 'Optional empty-state message when there are no rows.' },
  },
  args: {
    rows: sampleRows,
    activeValues: new Set<string>(),
    onRowClick: fn(),
  },
} satisfies Meta<typeof BreakdownReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TogglingAValue: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Engineering/ }));
    await expect(args.onRowClick).toHaveBeenCalledWith(sampleRows[0]);
  },
};

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
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Other \(4 values\)/ }));
    await expect(args.onShowOther).toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: /Other \(4 values\)/ })).not.toHaveAttribute(
      'aria-pressed',
    );
  },
};

export const NavigatesToMembers: Story = {
  args: { rowIntent: 'navigate' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const row = canvas.getByRole('button', {
      name: 'Filter Members by Engineering — 420 members. Opens the Members tab.',
    });
    await expect(row).toBeVisible();

    await expect(row).not.toHaveAttribute('aria-pressed');
  },
};

export const ToggleIntentKeepsPressedState: Story = {
  args: { activeValues: new Set(['Engineering']) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { pressed: true })).toHaveLength(1);
    await expect(canvas.queryByText(/Filter Members/)).toBeNull();
  },
};
