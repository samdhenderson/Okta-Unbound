import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import BlastRadiusReport from './BlastRadiusReport';
import type {
  BlastRadiusReport as BlastRadiusReportData,
  GroupEffect,
  RuleEffect,
} from '../../../shared/membership/blastRadiusTypes';

const SALES_RULE = '0prFAKErule00001';
const ENG_RULE = '0prFAKErule00002';

const GROUPS: GroupEffect[] = [
  {
    groupId: '00gFAKE00000000000001',
    groupName: 'Sales-All',
    kind: 'added',
    ruleId: SALES_RULE,
    ruleName: 'Sales auto-add',
    contributingRuleIds: [SALES_RULE],
    currentlyHeld: false,
  },
  {
    groupId: '00gFAKE00000000000002',
    groupName: 'Engineering-All',
    kind: 'removed',
    ruleId: ENG_RULE,
    ruleName: 'Eng auto-add',
    contributingRuleIds: [ENG_RULE],
    currentlyHeld: true,
    currentBucket: 'rule',
  },
  {
    groupId: '00gFAKE00000000000003',
    groupName: 'Contractors',
    kind: 'not-predicted',
    contributingRuleIds: [ENG_RULE],
    withheldReason: 'membership-not-credited-to-rule',
    currentlyHeld: true,
    currentBucket: 'direct',
  },
];

const RULES: RuleEffect[] = [
  {
    ruleId: SALES_RULE,
    ruleName: 'Sales auto-add',
    expression: 'user.department == "Sales"',
    transition: 'starts-matching',
    targetGroupIds: ['00gFAKE00000000000001'],
    targetGroupNames: ['Sales-All'],
    touchedAttributes: ['department'],
    active: true,
  },
  {
    ruleId: ENG_RULE,
    ruleName: 'Eng auto-add',
    expression: 'user.department == "Engineering"',
    transition: 'stops-matching',
    targetGroupIds: ['00gFAKE00000000000002'],
    targetGroupNames: ['Engineering-All'],
    touchedAttributes: ['department'],
    active: true,
  },
  {
    ruleId: '0prFAKErule00003',
    ruleName: 'Reviewers — by group',
    expression: 'isMemberOfGroupNameRegex("(?=sec)sec-.*")',
    transition: 'undetermined',
    afterReason: 'regex-unsupported-syntax',
    targetGroupIds: ['00gFAKE00000000000004'],
    targetGroupNames: ['Security-Reviewers'],
    touchedAttributes: [],
    active: true,
  },
  {
    ruleId: '0prFAKErule00004',
    ruleName: 'Everyone',
    expression: 'user.status == "ACTIVE"',
    transition: 'unchanged-match',
    targetGroupIds: ['00gFAKE00000000000005'],
    targetGroupNames: ['Everyone'],
    touchedAttributes: [],
    active: true,
  },
  {
    ruleId: '0prFAKErule00005',
    ruleName: 'Tokyo office',
    expression: 'user.city == "Tokyo"',
    transition: 'unchanged-no-match',
    targetGroupIds: ['00gFAKE00000000000006'],
    targetGroupNames: ['Tokyo-Everyone'],
    touchedAttributes: [],
    active: true,
  },
];

const COMPUTED: BlastRadiusReportData = {
  status: 'computed',
  groups: GROUPS,
  rules: RULES,
  counts: { added: 1, removed: 1, notPredicted: 1, starts: 1, stops: 1, undetermined: 1 },
  cascades: [
    {
      groupId: '00gFAKE00000000000001',
      rules: [
        { ruleId: '0prFAKErule00005', direction: 'toward-match', matchedBy: 'name' },
        { ruleId: '0prFAKErule00004', direction: 'away-from-match', matchedBy: 'nameStartsWith' },
      ],
    },
  ],
};

const EMPTY = (status: BlastRadiusReportData['status']): BlastRadiusReportData => ({
  status,
  groups: [],
  rules: [],
  counts: { added: 0, removed: 0, notPredicted: 0, starts: 0, stops: 0, undetermined: 0 },
  cascades: [],
});

const meta = {
  title: 'Users/BlastRadiusReport',
  component: BlastRadiusReport,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What a profile edit is predicted to do to a user’s group access. The engine ' +
          'behind it is pure and synchronous — it reads the user, the draft, the membership ' +
          'list and the rule inventory the panel already holds — so the report costs zero API ' +
          'calls and recomputes on nothing.\n\n' +
          'Three statuses say three different things: `not-computed` renders nothing, because ' +
          'the parent owns the button that asks; `unavailable` says the rule inventory could ' +
          'not be loaded, so no prediction is possible, which is never the same as "no ' +
          'changes"; `computed` renders the report, and a computed report with zero effects ' +
          'says so explicitly. The Groups and Rules pills are two views of the one answer — ' +
          'nothing is recomputed by the switch.',
      },
    },
  },
  argTypes: {
    report: { description: 'The report from `useBlastRadius`. Every string on it is untrusted.' },
    className: { description: 'Layout and spacing classes on the outer container.' },
  },
  args: { report: COMPUTED },
} satisfies Meta<typeof BlastRadiusReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Added' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Removed' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Not predicted' })).toBeInTheDocument();

    await expect(canvas.getByText('Sales-All')).toBeInTheDocument();
    await expect(canvas.getByText('Engineering-All')).toBeInTheDocument();

    await expect(canvas.getByText(/credits this membership to a direct add/i)).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', { name: /Rules that use this group/ }),
    ).toBeInTheDocument();
  },
};

export const RulesView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rules = canvas.getByRole('button', { name: 'Rules 3' });

    await expect(rules).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(rules);
    await expect(rules).toHaveAttribute('aria-pressed', 'true');

    await expect(canvas.getByRole('heading', { name: 'Starts matching' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Stops matching' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'Could not be evaluated' }),
    ).toBeInTheDocument();

    await expect(canvas.getByText('And 2 rules are unaffected by this edit.')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Groups 3' }));
    await expect(canvas.getByText('Sales-All')).toBeInTheDocument();
  },
};

export const Unavailable: Story = {
  args: { report: EMPTY('unavailable') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/could not be loaded/i)).toBeInTheDocument();
    await expect(canvas.getByText(/not the same as predicting no change/i)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /^Groups/ })).toBeNull();
  },
};

export const NoEffects: Story = {
  args: { report: EMPTY('computed') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No group changes predicted')).toBeInTheDocument();
    await expect(canvas.queryByText(/Predictions are likely, not certain/i)).toBeNull();
  },
};

export const NotComputed: Story = {
  args: { report: EMPTY('not-computed') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent?.trim()).toBe('');
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const OpeningACascade: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Rules that use this group/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await expect(canvas.getByText('Tokyo office')).toBeInTheDocument();
    await expect(canvas.getByText(/Tokyo-Everyone/)).toBeInTheDocument();
    await expect(canvas.getAllByText(/prediction stops at one hop/i)).toHaveLength(1);
  },
};

export const CascadeSurvivesTheViewSwitch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /Rules that use this group/ }));
    await userEvent.click(canvas.getByRole('button', { name: /^Rules \d/ }));
    await userEvent.click(canvas.getByRole('button', { name: /^Groups \d/ }));

    await expect(canvas.getByRole('button', { name: /Rules that use this group/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
