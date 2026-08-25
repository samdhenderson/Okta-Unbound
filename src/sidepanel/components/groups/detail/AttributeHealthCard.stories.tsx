import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import AttributeHealthCard from './AttributeHealthCard';
import type { AttributeSummary } from '../../members/memberAnalytics';
import type { AttributeRuleRef } from '../../../../shared/rules/groupAttributeIndex';

const summary: AttributeSummary = {
  key: 'department',
  label: 'Department',
  distinct: 2,
  populated: 9,
  total: 12,
  fillRate: 75,
  rows: [
    { value: 'Engineering', label: 'Engineering', count: 5, pct: 41.7 },
    { value: 'Product', label: 'Product', count: 4, pct: 33.3 },
    { value: '', label: '(none)', count: 3, pct: 25 },
  ],
};

const rules: AttributeRuleRef[] = [{ ruleId: '0prFAKE1', ruleName: 'Eng & Product — full-time' }];

const meta = {
  title: 'Groups/AttributeHealthCard',
  component: AttributeHealthCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "One card in the Insights tab's attribute grid: how one profile attribute is " +
          "actually populated across this group's members.\n\n" +
          '**Rules are an annotation, not the filter.** A card used to exist only for ' +
          'attributes a feeding rule referenced, which hid the drift worth catching most — a ' +
          '`department` nobody\u2019s rule reads, spelled four different ways, is invisible ' +
          'until the day someone writes a rule against it. Every discovered attribute gets a ' +
          'card now, and an empty `rules` list renders as **no block** rather than "0 rules", ' +
          'because it is an answer about coupling and not a defect.\n\n' +
          '**Outliers are marked, never corrected.** The value list flags what `outlierValues` ' +
          'judges to be drift from a dominant house style — conservatively, and as a flag on a ' +
          'card rather than a claim that the record is wrong. The marker is the word ' +
          '"Outlier:", not colour alone.',
      },
    },
  },
  argTypes: {
    summary: { description: "The attribute's precomputed distribution." },
    rules: {
      description:
        'The feeding rules that reference this attribute. Empty is an answer — no block renders.',
    },
    onNavigateToRule: { description: 'Deep-links a dependent rule into the Rules tab.' },
  },
  args: { summary, rules, onNavigateToRule: fn() },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttributeHealthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleRules: Story = {
  args: {
    rules: [
      { ruleId: '0prFAKE1', ruleName: 'Eng & Product — full-time' },
      { ruleId: '0prFAKE2', ruleName: 'Legacy import' },
    ],
  },
};

export const FullyPopulated: Story = {
  args: {
    summary: {
      ...summary,
      populated: 12,
      fillRate: 100,
      rows: [
        { value: 'Engineering', label: 'Engineering', count: 8, pct: 66.7 },
        { value: 'Product', label: 'Product', count: 4, pct: 33.3 },
      ],
    },
  },
};

export const NoDependentRules: Story = {
  args: { rules: [] },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Depended on by/)).toBeNull();
    await expect(canvas.getByText('Values')).toBeVisible();
  },
};

export const WithOutliers: Story = {
  args: {
    rules: [],
    summary: {
      key: 'department',
      label: 'Department',
      distinct: 3,
      populated: 100,
      total: 100,
      fillRate: 100,
      rows: [
        { value: 'Engineering', label: 'Engineering', count: 94, pct: 94 },
        { value: 'engineering', label: 'engineering', count: 4, pct: 4 },
        { value: 'ENGINEERING', label: 'ENGINEERING', count: 2, pct: 2 },
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2 outliers')).toBeVisible();
    await expect(canvas.getAllByText('Outlier:')).toHaveLength(2);
    await expect(canvas.getByText('Engineering')).toBeVisible();
  },
};

export const LegitimateSpreadIsNotDrift: Story = {
  args: {
    rules: [],
    summary: {
      key: 'department',
      label: 'Department',
      distinct: 3,
      populated: 100,
      total: 100,
      fillRate: 100,
      rows: [
        { value: 'Engineering', label: 'Engineering', count: 40, pct: 40 },
        { value: 'Sales', label: 'Sales', count: 35, pct: 35 },
        { value: 'Support', label: 'Support', count: 25, pct: 25 },
      ],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/outlier/i)).toBeNull();
  },
};
