import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { MemberMfaResult } from '../../../shared/types';
import MemberFilterPanel from './MemberFilterPanel';
import type { BreakdownRow, MemberFilter } from './memberAnalytics';

const statusRows: BreakdownRow[] = [
  { value: 'ACTIVE', label: 'ACTIVE', count: 240, pct: 96 },
  { value: 'SUSPENDED', label: 'SUSPENDED', count: 5, pct: 2 },
  { value: 'DEPROVISIONED', label: 'DEPROVISIONED', count: 5, pct: 2 },
];

const mfaResults = new Map<string, MemberMfaResult>([
  [
    'user1',
    {
      userId: 'user1',
      factors: [],
      enrolled: true,
      factorCount: 2,
      factorLabels: ['Okta Verify (Fastpass)', 'SMS'],
    },
  ],
  ['user2', { userId: 'user2', factors: [], enrolled: false, factorCount: 0, factorLabels: [] }],
]);

const activeFilters: MemberFilter[] = [
  { dimension: 'status', value: 'ACTIVE', label: 'Status: ACTIVE' },
  { dimension: 'mfa', value: 'has:SMS', label: 'Has SMS' },
];

const meta = {
  title: 'Members/MemberFilterPanel',
  component: MemberFilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Status, MFA-factor and sort controls for the member list. Fully presentational: it ' +
          'reflects the active filter set into pressed pill states and reports every change ' +
          'through callbacks. The MFA scan trigger sits inline beside the factor filters it ' +
          'enables, and those filters stay hidden until scan results exist.',
      },
    },
  },
  argTypes: {
    filters: { description: 'Active facet filters, reflected into pressed pill states.' },
    statusRows: { description: 'Status distribution (value + count) used to build status pills.' },
    mfaResults: { description: 'Per-member MFA scan results, or null before a scan has run.' },
    factorLabels: {
      description: 'Observed factor labels across the group, for per-factor toggles.',
    },
    memberCount: {
      description: "Member count; drives the scan button's disabled/confirm behaviour.",
    },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
    onRunScanClick: { description: 'Start (or confirm) the MFA scan.' },
    sortBy: { description: 'Current sort field.' },
    sortDesc: { description: 'Whether the current sort is descending.' },
    onToggleStatus: { description: 'Toggle a status value as a filter.' },
    onClearStatus: { description: 'Clear all status filters.' },
    onToggleMfaValue: { description: "Toggle a count-based MFA value (e.g. 'none', 'multiple')." },
    onSetFactorMode: { description: 'Set a per-factor has/missing/off mode.' },
    onToggleSort: { description: 'Toggle the sort field (or flip direction if already selected).' },
  },
  args: {
    filters: [],
    statusRows,
    mfaResults: null,
    factorLabels: [],
    memberCount: 250,
    scanStatus: 'idle',
    onRunScanClick: fn(),
    sortBy: 'name',
    sortDesc: false,
    onToggleStatus: fn(),
    onClearStatus: fn(),
    onToggleMfaValue: fn(),
    onSetFactorMode: fn(),
    onToggleSort: fn(),
  },
} satisfies Meta<typeof MemberFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const active = canvas.getByRole('button', { name: 'ACTIVE (240)' });
    await expect(active).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(active);
    await expect(args.onToggleStatus).toHaveBeenCalledWith(statusRows[0]);

    await userEvent.click(canvas.getByRole('button', { name: 'Name' }));
    await expect(args.onToggleSort).toHaveBeenCalledWith('name');
  },
};

export const WithMfaResults: Story = {
  args: {
    mfaResults,
    factorLabels: ['Okta Verify (Fastpass)', 'SMS'],
    scanStatus: 'complete',
  },
};

export const WithActiveFilters: Story = {
  args: {
    filters: activeFilters,
    mfaResults,
    factorLabels: ['Okta Verify (Fastpass)', 'SMS'],
    scanStatus: 'complete',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'ACTIVE (240)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(canvas.getByRole('button', { name: 'SUSPENDED (5)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  },
};

export const SortedByFactors: Story = {
  args: {
    mfaResults,
    factorLabels: ['Okta Verify (Fastpass)', 'SMS'],
    scanStatus: 'complete',
    sortBy: 'factors',
    sortDesc: true,
  },
};

export const Scanning: Story = {
  args: {
    scanStatus: 'scanning',
  },
};
