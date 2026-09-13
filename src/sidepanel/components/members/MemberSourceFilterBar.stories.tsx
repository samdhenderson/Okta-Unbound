import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import MemberSourceFilterBar from './MemberSourceFilterBar';
import type { MemberSourceBucket } from '../groups/memberSourceBuckets';
import { CHART_OTHER_COLOR, INDIGO_RAMP } from '../../theme/chartPalette';

const engineering: MemberSourceBucket = {
  key: 'rule:0prFAKE1',
  label: 'Engineering department',
  description: 'Solely explained by this rule.',
  count: 42,
  percent: 42,
  barClass: '',
  dotClass: '',
  color: INDIGO_RAMP[0],
};

const platform: MemberSourceBucket = {
  key: 'rule:0prFAKE2',
  label: 'Platform department',
  description: 'Solely explained by this rule.',
  count: 18,
  percent: 18,
  barClass: '',
  dotClass: '',
  color: INDIGO_RAMP[1],
};

const manual: MemberSourceBucket = {
  key: 'direct',
  label: 'Manual',
  description: 'Added directly — no rule accounts for this membership.',
  count: 30,
  percent: 30,
  barClass: 'bg-neutral-400',
  dotClass: 'bg-neutral-400',
};

const segments: MemberSourceBucket[] = [
  engineering,
  platform,
  {
    key: 'multiRule',
    label: 'Multiple rules',
    description: 'Matched by more than one rule, so no single rule explains it.',
    count: 5,
    percent: 5,
    barClass: 'bg-primary-dark',
    dotClass: 'bg-primary-dark',
  },
  {
    key: 'unattributed',
    label: 'Indeterminate',
    description: 'A targeting rule could not be evaluated here, so the source is unconfirmed.',
    count: 5,
    percent: 5,
    barClass: 'bg-warning',
    dotClass: 'bg-warning',
  },
  manual,
];

const meta = {
  title: 'Members/MemberSourceFilterBar',
  component: MemberSourceFilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The membership-source split where the reader can act on it: the bar for proportion at a glance, and one full-size pill per segment to narrow the member list. The bar itself is `aria-hidden` and is never the click target — each pill states its bucket, its count and its share as text.\n\n' +
          'Zero-count segments are dropped rather than offered as a pill that filters to nobody, and an aggregated tail says in words how many rules it folded in.',
      },
    },
  },
  argTypes: {
    segments: {
      description: 'The exclusive segments, in render order, from `toMemberSourceSegments`.',
    },
    activeKeys: { description: 'Bucket keys currently filtered on.' },
    total: { description: 'Total analyzed members, shown on the "All" pill.' },
  },
  args: {
    segments,
    activeKeys: new Set<string>(),
    onToggle: fn(),
    onClearAll: fn(),
    total: 100,
  },
} satisfies Meta<typeof MemberSourceFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filtered: Story = {
  args: { activeKeys: new Set(['rule:0prFAKE1']) },
};

export const MultipleSelected: Story = {
  args: { activeKeys: new Set(['direct', 'unattributed']) },
};

export const SingleSegment: Story = {
  args: {
    segments: [{ ...engineering, count: 100, percent: 100 }],
  },
};

export const DropsEmptySegments: Story = {
  args: {
    segments: [
      { ...engineering, count: 60, percent: 60 },
      { ...platform, count: 0, percent: 0 },
      { ...manual, count: 40, percent: 40 },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: /Platform department/ })).toBeNull();
    await expect(
      canvas.getByRole('button', { name: /Engineering department 60 \(60%\)/ }),
    ).toBeVisible();
  },
};

export const AggregatedTail: Story = {
  args: {
    segments: [
      { ...engineering, count: 55, percent: 55 },
      {
        key: 'otherRules',
        label: 'Other rules',
        description: 'Rules past the chart ramp, folded together.',
        count: 45,
        percent: 45,
        barClass: '',
        dotClass: '',
        color: CHART_OTHER_COLOR,
        aggregatedRuleCount: 3,
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /Other rules 45 \(45%\)/ })).toBeVisible();
    await expect(canvas.getByText(/folds in \+3 more rules/)).toBeVisible();
  },
};

export const StatesEveryShare: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Engineering department 42 \(42%\)/ }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Multiple rules 5 \(5%\)/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Indeterminate 5 \(5%\)/ })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Manual 30 \(30%\)/ })).toBeVisible();
  },
};

export const TogglesAndClears: Story = {
  args: { activeKeys: new Set(['direct']) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Manual 30/ }));
    await expect(args.onToggle).toHaveBeenCalledWith('direct', 'Manual');

    await userEvent.click(canvas.getByRole('button', { name: /All 100/ }));
    await expect(args.onClearAll).toHaveBeenCalled();

    await expect(canvasElement.querySelector('[aria-hidden="true"].flex.h-2')).not.toBeNull();
  },
};
