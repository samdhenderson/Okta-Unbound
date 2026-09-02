import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RulesDuplicatesPanel from './RulesDuplicatesPanel';
import type { MergeableRuleGroup } from '../../../shared/rules/consolidation';
import type { OktaGroupRule } from '../../../shared/types';

function rawRule(id: string, name: string, groupIds: string[], status = 'ACTIVE'): OktaGroupRule {
  return {
    id,
    name,
    status: status as OktaGroupRule['status'],
    type: 'group_rule',
    created: '2024-01-01T00:00:00.000Z',
    lastUpdated: '2024-01-01T00:00:00.000Z',
    conditions: { expression: { value: "user.department == 'Eng'", type: 'urn' } },
    actions: { assignUserToGroups: { groupIds } },
  };
}

const cluster: MergeableRuleGroup = {
  expression: "user.department == 'eng'",
  rules: [rawRule('r1', 'Eng West', ['g1']), rawRule('r2', 'Eng East', ['g2'], 'INACTIVE')],
  unionGroupIds: ['g1', 'g2'],
};

describe('RulesDuplicatesPanel', () => {
  it('renders nothing when there are no clusters', () => {
    const { container } = render(<RulesDuplicatesPanel clusters={[]} onMerge={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('heads the panel with the set count, with member rules still behind each set', () => {
    render(<RulesDuplicatesPanel clusters={[cluster]} onMerge={vi.fn()} />);

    expect(screen.getByText('1 set of duplicate-condition rules')).toBeInTheDocument();
    expect(screen.getByText('2 rules → 2 target groups')).toBeInTheDocument();
    expect(screen.queryByText('Eng West')).not.toBeInTheDocument();
  });

  it('expands a set to show its shared condition, member rules, and status', async () => {
    const uev = userEvent.setup();
    render(<RulesDuplicatesPanel clusters={[cluster]} onMerge={vi.fn()} />);

    await uev.click(screen.getByRole('button', { name: /2 rules → 2 target groups/ }));

    expect(screen.getByText("user.department == 'eng'")).toBeInTheDocument();
    expect(screen.getByText('Eng West')).toBeInTheDocument();
    expect(screen.getByText('Eng East')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('marks a broken rule Broken, not Inactive (D-085)', async () => {
    const uev = userEvent.setup();
    const broken: MergeableRuleGroup = {
      ...cluster,
      rules: [rawRule('r1', 'Eng West', ['g1']), rawRule('r3', 'Eng Broken', ['g3'], 'INVALID')],
    };
    render(<RulesDuplicatesPanel clusters={[broken]} onMerge={vi.fn()} />);

    await uev.click(screen.getByRole('button', { name: /2 rules → 2 target groups/ }));

    expect(screen.getByText('Broken')).toBeInTheDocument();
    expect(screen.queryByText('INACTIVE')).not.toBeInTheDocument();
  });

  it('links to a member rule via onFocusRule', async () => {
    const uev = userEvent.setup();
    const onFocusRule = vi.fn();
    render(
      <RulesDuplicatesPanel clusters={[cluster]} onMerge={vi.fn()} onFocusRule={onFocusRule} />,
    );

    await uev.click(screen.getByRole('button', { name: /2 rules → 2 target groups/ }));
    await uev.click(screen.getAllByRole('button', { name: 'View' })[0]);

    expect(onFocusRule).toHaveBeenCalledWith('r1');
  });

  it('starts the merge (preview) for a set', async () => {
    const uev = userEvent.setup();
    const onMerge = vi.fn();
    render(<RulesDuplicatesPanel clusters={[cluster]} onMerge={onMerge} />);

    await uev.click(screen.getByRole('button', { name: /Review & merge/ }));

    expect(onMerge).toHaveBeenCalledWith(cluster);
  });
});
