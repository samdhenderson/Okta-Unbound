import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import AttributeHealthCard, { type AttributeHealthCardProps } from './AttributeHealthCard';
import BreakdownDetailsModal from '../../members/BreakdownDetailsModal';
import {
  attributeSignals,
  NONE_VALUE,
  OTHER_VALUE,
  type AttributeSummary,
  type BreakdownRow,
} from '../../members/memberAnalytics';
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
    { value: NONE_VALUE, label: '(none)', count: 3, pct: 25 },
  ],
  driftValues: [],
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
          '**One anatomy, ranked.** Every attribute gets the same card. Severity is carried by ' +
          '*order* and by *badges*, never by a second card shape for the bad ones — a reader ' +
          'would otherwise have to learn two layouts and diff them, and the quiet attributes ' +
          'would read as a different kind of thing when the only difference is that today ' +
          'nothing is wrong with them.\n\n' +
          '**Three stages.** Collapsed (title, badges, spread bar, value count) → expanded (the ' +
          'value list, the blank line, the dependent rules) → the modal reveal over the full ' +
          'distribution, via `onShowOther`.\n\n' +
          '**The badges survive the collapse.** A collapsed card that hid its reasons would ' +
          'leave the ranking looking arbitrary — an order with no visible cause. Each badge is ' +
          'a phrase, never a bare number, and none of them needs its colour to be understood.\n\n' +
          '**The disclosure is a real control.** The header is covered by a `StretchedButton` ' +
          'carrying `aria-expanded`/`aria-controls`: a real `<button>`, focusable and ' +
          'Enter/Space operable. The overlay is scoped to the header, so clicking inside the ' +
          'body it just opened does not collapse it.\n\n' +
          '**Outliers are marked, never corrected.** The value list flags what `outlierValues` ' +
          'judges to be drift from a dominant house style — conservatively, and as a flag ' +
          'rather than a claim the record is wrong. The marker is the word "Outlier:", not ' +
          'colour alone. The drift **badge** is a wider claim: near-duplicate spellings ' +
          'anywhere in the attribute, including inside the tail this card never names.\n\n' +
          '**Storybook renders no Tailwind**, so no story here asserts the bar’s geometry, its ' +
          'segment widths, or the hatch — those remain visual claims, checked by eye.',
      },
    },
  },
  argTypes: {
    summary: { description: "The attribute's precomputed distribution." },
    signals: { description: 'Why this attribute ranks where it does. Rendered as badges.' },
    rules: {
      description:
        'The feeding rules that reference this attribute. Empty is an answer — no block renders.',
    },
    onNavigateToRule: { description: 'Deep-links a dependent rule into the Rules tab.' },
    onShowOther: { description: 'Opens the full distribution, tail included.' },
    defaultExpanded: { description: 'Starts the card expanded. For stories and tests.' },
  },
  args: { summary, rules, signals: attributeSignals(summary, 1), onNavigateToRule: fn() },
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

export const Collapsed: Story = {};

export const CollapsedKeepsItsBadges: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('A rule depends on it')).toBeVisible();
    await expect(canvas.queryByText('1')).toBeNull();

    const toggle = canvas.getByRole('button', { name: /Show the value breakdown/ });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const regionId = toggle.getAttribute('aria-controls');
    const region = regionId ? canvasElement.ownerDocument.getElementById(regionId) : null;
    await expect(region).not.toBeNull();
    await expect(region).toHaveAttribute('inert');
  },
};

export const Expanded: Story = {
  args: { defaultExpanded: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Engineering')).toBeVisible();
    await expect(canvas.getByText('Depended on by 1 rule')).toBeVisible();
    await expect(canvas.getByText(/Blank in 3 of 12 members/)).toBeVisible();
    await expect(canvas.getByText('A rule depends on it')).toBeVisible();
  },
};

export const KeyboardOperable: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: /Show the value breakdown/ });

    toggle.focus();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    const opened = canvas.getByRole('button', { name: /Hide the value breakdown/ });
    await expect(opened).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Engineering')).toBeVisible();

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: /Show the value breakdown/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const MultipleRules: Story = {
  args: {
    defaultExpanded: true,
    signals: attributeSignals(summary, 2),
    rules: [
      { ruleId: '0prFAKE1', ruleName: 'Eng & Product — full-time' },
      { ruleId: '0prFAKE2', ruleName: 'Legacy import' },
    ],
  },
};

export const FullyPopulated: Story = {
  args: {
    defaultExpanded: true,
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
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Blank in/)).toBeNull();
  },
};

export const Quiet: Story = {
  args: { signals: [], rules: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('department')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Show the value breakdown/ })).toBeVisible();
  },
};

export const NoDependentRules: Story = {
  args: { rules: [], signals: [], defaultExpanded: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Depended on by/)).toBeNull();
    await expect(canvas.getByText('Engineering')).toBeVisible();
  },
};

const driftSummary: AttributeSummary = {
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
  driftValues: ['Engineering', 'engineering', 'ENGINEERING'],
};

export const WithDrift: Story = {
  args: {
    rules: [],
    summary: driftSummary,
    signals: attributeSignals(driftSummary, 0),
    defaultExpanded: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3 near-duplicate values')).toBeVisible();
    await expect(canvas.getAllByText('Outlier:')).toHaveLength(2);
    await expect(canvas.getByText('Engineering')).toBeVisible();
  },
};

const spreadSummary: AttributeSummary = {
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
  driftValues: [],
};

export const LegitimateSpreadIsNotDrift: Story = {
  args: {
    rules: [],
    summary: spreadSummary,
    signals: attributeSignals(spreadSummary, 0),
    defaultExpanded: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/outlier/i)).toBeNull();
    await expect(canvas.queryByText(/near-duplicate/)).toBeNull();
  },
};

const truncated: AttributeSummary = {
  key: 'costCenter',
  label: 'Cost center',
  distinct: 9,
  populated: 40,
  total: 40,
  fillRate: 100,
  rows: [
    { value: 'CC-1000', label: 'CC-1000', count: 12, pct: 30 },
    { value: 'CC-1001', label: 'CC-1001', count: 10, pct: 25 },
    { value: 'CC-1002', label: 'CC-1002', count: 6, pct: 15 },
    { value: OTHER_VALUE, label: 'Other (6 values)', count: 12, pct: 30 },
  ],
  driftValues: [],
};

const fullRows: BreakdownRow[] = [
  { value: 'CC-1000', label: 'CC-1000', count: 12, pct: 30 },
  { value: 'CC-1001', label: 'CC-1001', count: 10, pct: 25 },
  { value: 'CC-1002', label: 'CC-1002', count: 6, pct: 15 },
  { value: 'CC-2001', label: 'CC-2001', count: 3, pct: 7.5 },
  { value: 'CC-2002', label: 'CC-2002', count: 3, pct: 7.5 },
  { value: 'CC-2003', label: 'CC-2003', count: 2, pct: 5 },
  { value: 'CC-2004', label: 'CC-2004', count: 2, pct: 5 },
  { value: 'CC-2005', label: 'CC-2005', count: 1, pct: 2.5 },
  { value: 'CC-2006', label: 'CC-2006', count: 1, pct: 2.5 },
];

const OtherDrillIn = (props: AttributeHealthCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AttributeHealthCard {...props} onShowOther={() => setOpen(true)} />
      <BreakdownDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Cost center"
        rows={fullRows}
        activeValues={new Set()}
      />
    </>
  );
};

export const ThreeStages: Story = {
  args: {
    rules: [],
    summary: truncated,
    signals: attributeSignals(truncated, 0),
  },
  render: (args) => <OtherDrillIn {...args} />,
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByText('30% hidden in the tail')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Show the value breakdown/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await userEvent.click(canvas.getByRole('button', { name: /Show the value breakdown/ }));
    await expect(canvas.getByText('CC-1000')).toBeVisible();
    await expect(canvas.queryByText('CC-2006')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: /Show all 9 values/ }));
    const dialog = await body.findByRole('dialog');
    await expect(within(dialog).getByText('CC-2006')).toBeVisible();
    await expect(within(dialog).getByText('CC-2001')).toBeVisible();

    await expect(within(dialog).queryByText(/filter the member list/)).toBeNull();
    await expect(within(dialog).getByRole('button', { name: /CC-2006/ })).toBeDisabled();
  },
};

export const NoRevealWhenUnwired: Story = {
  args: {
    rules: [],
    summary: truncated,
    signals: attributeSignals(truncated, 0),
    defaultExpanded: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Other (6 values)')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: /Show all/ })).toBeNull();
  },
};
