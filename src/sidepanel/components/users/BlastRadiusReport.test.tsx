import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlastRadiusReport from './BlastRadiusReport';
import type {
  BlastRadiusReport as BlastRadiusReportData,
  GroupEffect,
  RuleEffect,
} from '../../../shared/membership/blastRadiusTypes';

const SALES_RULE = '0prFAKErule00001';
const ENG_RULE = '0prFAKErule00002';

const groups: GroupEffect[] = [
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
    groupId: '00gFAKE00000000000003',
    groupName: 'Contractors',
    kind: 'not-predicted',
    contributingRuleIds: [ENG_RULE],
    withheldReason: 'another-active-rule-still-matches',
    blockingRuleName: 'Contractor catch-all',
    currentlyHeld: true,
    currentBucket: 'rule',
  },
];

const rules: RuleEffect[] = [
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

const computed: BlastRadiusReportData = {
  status: 'computed',
  groups,
  rules,
  counts: { added: 1, removed: 0, notPredicted: 1, starts: 1, stops: 0, undetermined: 0 },
  cascades: [
    {
      groupId: '00gFAKE00000000000001',
      rules: [{ ruleId: '0prFAKErule00005', direction: 'toward-match', matchedBy: 'name' }],
    },
  ],
};

const emptyOf = (status: BlastRadiusReportData['status']): BlastRadiusReportData => ({
  status,
  groups: [],
  rules: [],
  counts: { added: 0, removed: 0, notPredicted: 0, starts: 0, stops: 0, undetermined: 0 },
  cascades: [],
});

describe('BlastRadiusReport', () => {
  it('switches between the group and rule projections of one report', async () => {
    render(<BlastRadiusReport report={computed} />);

    const groupsPill = screen.getByRole('button', { name: 'Groups 2' });
    const rulesPill = screen.getByRole('button', { name: 'Rules 1' });

    expect(groupsPill).toHaveAttribute('aria-pressed', 'true');
    expect(rulesPill).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Sales-All')).toBeInTheDocument();

    await userEvent.click(rulesPill);

    expect(rulesPill).toHaveAttribute('aria-pressed', 'true');
    expect(groupsPill).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Starts matching' })).toBeInTheDocument();
    expect(screen.getByText('Sales auto-add')).toBeInTheDocument();
    expect(screen.getByText('And 2 rules are unaffected by this edit.')).toBeInTheDocument();

    await userEvent.click(groupsPill);
    expect(screen.getByRole('heading', { name: 'Added' })).toBeInTheDocument();
  });

  it('keeps an open cascade across a switch, and hedges nothing else', async () => {
    render(<BlastRadiusReport report={computed} />);

    const trigger = screen.getByRole('button', { name: /Rules that use this group/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/prediction stops at one hop/i)).toBeInTheDocument();
    expect(screen.queryByText(/Predictions are likely, not certain/i)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Rules 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Groups 2' }));

    expect(screen.getByRole('button', { name: /Rules that use this group/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.queryByText(/Predictions are likely, not certain/i)).toBeNull();
  });

  it('states the cascade as structure, never as a prediction', async () => {
    render(<BlastRadiusReport report={computed} />);

    await userEvent.click(screen.getByRole('button', { name: /Rules that use this group/ }));

    expect(screen.getByText('Tokyo office')).toBeInTheDocument();
    expect(screen.getByText(/Tokyo-Everyone/)).toBeInTheDocument();
    expect(screen.getByText('Toward matching')).toBeInTheDocument();
    expect(screen.queryByText(/\bmay\b/i)).toBeNull();
    expect(screen.queryByText(/\b1 rule uses\b/i)).toBeNull();
  });

  it('offers no cascade trigger for a group nothing reads', () => {
    render(<BlastRadiusReport report={{ ...computed, cascades: [] }} />);

    expect(screen.queryByRole('button', { name: /Rules that use/ })).toBeNull();
    expect(screen.queryByText(/prediction stops at one hop/i)).toBeNull();
  });

  it('names why a prediction was withheld instead of omitting the group', () => {
    render(<BlastRadiusReport report={computed} />);

    expect(screen.getByText('Contractors')).toBeInTheDocument();
    expect(screen.getByText(/Contractor catch-all/)).toBeInTheDocument();
  });

  it('renders nothing at all until a report has been computed', () => {
    const { container } = render(<BlastRadiusReport report={emptyOf('not-computed')} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('reports an unavailable inventory as an inability, never as "no changes"', () => {
    render(<BlastRadiusReport report={emptyOf('unavailable')} />);

    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    expect(screen.queryByText('No group changes predicted')).toBeNull();
    expect(screen.queryByText(/no membership is predicted to change/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Groups/ })).toBeNull();
  });

  it('states a computed-but-empty result rather than leaving it implicit', () => {
    render(<BlastRadiusReport report={emptyOf('computed')} />);

    expect(screen.getByText('No group changes predicted')).toBeInTheDocument();
    expect(screen.queryByText(/Predictions are likely, not certain/i)).toBeNull();
  });
});
