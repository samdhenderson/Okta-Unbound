import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupRulesSection from './GroupRulesSection';
import type { FormattedRule } from '../../../../shared/types';

const ASSIGNS = 'Assigns members into this group';
const REFERENCES = 'References this group in a condition';

const rule = (
  over: Partial<FormattedRule> & Pick<FormattedRule, 'id' | 'name'>,
): FormattedRule => ({
  status: 'ACTIVE',
  condition: 'department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00gFAKE1'],
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  ...over,
});

const base = {
  assigningRules: [rule({ id: 'r1', name: 'All Engineers' })],
  assigningStatus: 'done' as const,
  assigningError: null,
  referencingRules: [rule({ id: 'r2', name: 'Contractors gate', status: 'INACTIVE' })],
  referencingStatus: 'done' as const,
  referencingError: null,
};

function listUnder(heading: string) {
  const block = screen.getByText(new RegExp(`^${heading}`)).parentElement as HTMLElement;
  return within(block);
}

describe('GroupRulesSection', () => {
  it('lists the two rule relationships separately rather than summing them', async () => {
    render(<GroupRulesSection {...base} />);

    expect(listUnder(ASSIGNS).getByText('All Engineers')).toBeInTheDocument();
    expect(listUnder(ASSIGNS).queryByText('Contractors gate')).not.toBeInTheDocument();

    expect(listUnder(REFERENCES).getByText('Contractors gate')).toBeInTheDocument();
    expect(listUnder(REFERENCES).queryByText('All Engineers')).not.toBeInTheDocument();
  });

  it('counts each list independently in its heading', () => {
    render(
      <GroupRulesSection
        {...base}
        assigningRules={[rule({ id: 'r1', name: 'A' }), rule({ id: 'r3', name: 'B' })]}
      />,
    );

    expect(screen.getByText(`${ASSIGNS} (2)`)).toBeInTheDocument();
    expect(screen.getByText(`${REFERENCES} (1)`)).toBeInTheDocument();
  });

  it('shows a distinct empty message per axis', () => {
    render(<GroupRulesSection {...base} assigningRules={[]} referencingRules={[]} />);

    expect(screen.getByText(/No rule assigns users to this group/)).toBeInTheDocument();
    expect(screen.getByText(/No rule condition references this group by id/)).toBeInTheDocument();
  });

  it('states the empty fact without growing a create control of its own', () => {
    render(<GroupRulesSection {...base} assigningRules={[]} referencingRules={[]} />);

    expect(screen.getByText(/Members are added manually or by app push/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Create/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rule/i })).not.toBeInTheDocument();
  });

  it('does not overclaim: says name-based references are not detected', () => {
    render(<GroupRulesSection {...base} />);
    expect(screen.getByText(/matching on group name is not listed/)).toBeInTheDocument();
  });

  it('renders a spinner while an axis is still loading', () => {
    render(<GroupRulesSection {...base} referencingStatus="loading" referencingRules={[]} />);
    expect(screen.getAllByText('Loading rules…').length).toBe(1);
    expect(screen.getByText('All Engineers')).toBeInTheDocument();
  });

  it('renders a danger alert for the failing axis only', () => {
    render(
      <GroupRulesSection
        {...base}
        referencingStatus="error"
        referencingError="Rules listing unavailable"
        referencingRules={[]}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Rules listing unavailable');
    expect(screen.getByText('All Engineers')).toBeInTheDocument();
  });

  it('deep-links a rule by pressing its row', async () => {
    const onNavigateToRule = vi.fn();
    render(<GroupRulesSection {...base} onNavigateToRule={onNavigateToRule} />);

    await userEvent.click(await screen.findByTitle('Open rule Contractors gate in the Rules tab'));

    expect(onNavigateToRule).toHaveBeenCalledWith('r2');
  });

  it('offers no jump control when no navigation handler is supplied', () => {
    render(<GroupRulesSection {...base} />);
    expect(screen.queryByRole('button', { name: /Open rule/ })).not.toBeInTheDocument();
    expect(screen.getByText('All Engineers')).toBeInTheDocument();
  });

  it("shows each rule's condition on the row, with nothing to open first", () => {
    render(<GroupRulesSection {...base} />);

    expect(listUnder(ASSIGNS).getByText('department == "Engineering"')).toBeInTheDocument();
  });

  it('renders no write verb it cannot perform', () => {
    render(<GroupRulesSection {...base} onNavigateToRule={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Deactivate/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Open rule/ }).length).toBe(2);
  });

  it('states the condition expression in place, with no press and no tab change', () => {
    const onNavigateToRule = vi.fn();
    render(<GroupRulesSection {...base} onNavigateToRule={onNavigateToRule} />);

    expect(listUnder(ASSIGNS).getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(listUnder(REFERENCES).getByText('user.department == "Engineering"')).toBeInTheDocument();
    expect(onNavigateToRule).not.toHaveBeenCalled();
  });

  it('resolves a group id inside the condition to its name', () => {
    render(
      <GroupRulesSection
        {...base}
        referencingRules={[
          rule({
            id: 'r9',
            name: 'Contractors gate',
            conditionExpression: 'isMemberOfAnyGroup("00gFAKE1")',
            allGroupNamesMap: { '00gFAKE1': 'Engineering — Platform' },
          }),
        ]}
      />,
    );

    const references = listUnder(REFERENCES);
    expect(references.getByText('Engineering — Platform')).toBeInTheDocument();
    expect(references.queryByText(/00gFAKE1/)).not.toBeInTheDocument();
  });

  it('adds no control alongside the inline condition', () => {
    render(<GroupRulesSection {...base} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it("shows each rule's Okta status verbatim", () => {
    render(<GroupRulesSection {...base} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });
});
