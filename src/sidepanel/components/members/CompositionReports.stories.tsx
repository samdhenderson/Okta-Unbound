import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import CompositionReports from './CompositionReports';
import { discoverAttributeBreakdowns, NONE_VALUE, OTHER_VALUE } from './memberAnalytics';
import type { AttributeSummary, BreakdownRow, MemberFilter } from './memberAnalytics';
import type { MemberMfaResult } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/fixtures';

const discoveredAttributes = discoverAttributeBreakdowns(mockUsers);

const manyAttributes: AttributeSummary[] = [
  ...discoveredAttributes,
  {
    key: 'manager',
    label: 'Manager',
    distinct: 12,
    populated: 900,
    total: 1000,
    fillRate: 90,
    rows: [
      { value: 'Alex Kim', label: 'Alex Kim', count: 220, pct: 22 },
      { value: 'Jordan Lee', label: 'Jordan Lee', count: 180, pct: 18 },
      { value: NONE_VALUE, label: '(none)', count: 100, pct: 10 },
      { value: OTHER_VALUE, label: 'Other (10 values)', count: 500, pct: 50 },
    ],
  },
  {
    key: 'city',
    label: 'City',
    distinct: 4,
    populated: 1000,
    total: 1000,
    fillRate: 100,
    rows: [
      { value: 'Austin', label: 'Austin', count: 400, pct: 40 },
      { value: 'Denver', label: 'Denver', count: 350, pct: 35 },
      { value: 'Remote', label: 'Remote', count: 250, pct: 25 },
    ],
  },
  {
    key: 'costCenter',
    label: 'Cost center',
    distinct: 3,
    populated: 1000,
    total: 1000,
    fillRate: 100,
    rows: [
      { value: '1000', label: '1000', count: 500, pct: 50 },
      { value: '2000', label: '2000', count: 300, pct: 30 },
      { value: '3000', label: '3000', count: 200, pct: 20 },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    distinct: 3,
    populated: 980,
    total: 1000,
    fillRate: 98,
    rows: [
      { value: 'HQ', label: 'HQ', count: 600, pct: 60 },
      { value: 'Satellite', label: 'Satellite', count: 380, pct: 38 },
      { value: NONE_VALUE, label: '(none)', count: 20, pct: 2 },
    ],
  },
  {
    key: 'division',
    label: 'Division',
    distinct: 2,
    populated: 1000,
    total: 1000,
    fillRate: 100,
    rows: [
      { value: 'North America', label: 'North America', count: 700, pct: 70 },
      { value: 'EMEA', label: 'EMEA', count: 300, pct: 30 },
    ],
  },
];

const activeFilters: MemberFilter[] = [
  { dimension: 'department', value: 'Engineering', label: 'Engineering' },
];

const mfaRows: BreakdownRow[] = [
  { value: 'Okta Verify (Fastpass)', label: 'Okta Verify (Fastpass)', count: 620, pct: 62 },
  { value: 'WebAuthn', label: 'WebAuthn', count: 240, pct: 24 },
  { value: 'SMS', label: 'SMS', count: 140, pct: 14 },
];
const mfaResults = new Map<string, MemberMfaResult>([
  ['u1', { userId: 'u1', factors: [], enrolled: true, factorCount: 2, factorLabels: [] }],
]);

const meta = {
  title: 'Members/CompositionReports',
  component: CompositionReports,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Collapsible "Composition" panel — what a group is made of. A tab strip toggles ' +
          'between **Attributes** (one facet per discovered profile attribute) and **MFA ' +
          "factors** (the scan's distribution); above a threshold of attributes it adds a " +
          '"Find attribute…" filter.\n\n' +
          'The section starts collapsed and owns both its open state and its active tab, so ' +
          'every story here opens it before there is anything to see.',
      },
    },
  },
  argTypes: {
    attributes: { description: 'Discovered profile attributes with their value distributions.' },
    filters: { description: 'Active member-list filters, used to highlight selected values.' },
    onToggle: { description: 'Toggle a value within an attribute as a member-list filter.' },
    onExpand: { description: 'Open the full-distribution details view for an attribute.' },
    mfaRows: { description: 'Pre-computed MFA factor distribution rows (empty before a scan).' },
    mfaResults: { description: 'Per-member MFA scan results, or null before a scan has run.' },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
    memberCount: {
      description: "Member count; drives the scan button's disabled/confirm behaviour.",
    },
    onToggleMfa: { description: 'Toggle an MFA breakdown row as a member-list filter.' },
    onRunScanClick: {
      description: "Start (or confirm) the MFA scan from the MFA tab's empty state.",
    },
  },
  args: {
    attributes: discoveredAttributes,
    filters: [],
    onToggle: fn(),
    onExpand: fn(),
    mfaRows: [],
    mfaResults: null,
    scanStatus: 'idle',
    memberCount: 250,
    onToggleMfa: fn(),
    onRunScanClick: fn(),
  },
} satisfies Meta<typeof CompositionReports>;

export default meta;
type Story = StoryObj<typeof meta>;

const openSection = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: /Composition/ }));
  return canvas;
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = await openSection(canvasElement);
    await expect(canvas.getByRole('tab', { name: /Attributes/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const Empty: Story = {
  args: { attributes: [] },
  play: async ({ canvasElement }) => {
    const canvas = await openSection(canvasElement);
    await expect(canvas.getByText(/No profile attributes/)).toBeInTheDocument();
  },
};

export const ManyAttributes: Story = {
  args: { attributes: manyAttributes },
  play: async ({ canvasElement }) => {
    const canvas = await openSection(canvasElement);

    await userEvent.type(canvas.getByPlaceholderText('Find attribute…'), 'cost');
    await expect(canvas.getByText('Cost center')).toBeInTheDocument();
    await expect(canvas.queryByText('City')).not.toBeInTheDocument();
  },
};

export const WithActiveFilter: Story = {
  args: { attributes: manyAttributes, filters: activeFilters },
  play: async ({ canvasElement }) => {
    await openSection(canvasElement);
  },
};

export const MfaTabNotScanned: Story = {
  args: { mfaResults: null, scanStatus: 'idle' },
  play: async ({ canvasElement }) => {
    const canvas = await openSection(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'MFA factors' }));
    await expect(canvas.getByText(/Scan the group to see the distribution/)).toBeInTheDocument();
  },
};

export const MfaTabScanned: Story = {
  args: { mfaResults, scanStatus: 'complete', mfaRows },
  play: async ({ canvasElement }) => {
    const canvas = await openSection(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'MFA factors' }));
    await expect(canvas.getByText('WebAuthn')).toBeInTheDocument();
  },
};
