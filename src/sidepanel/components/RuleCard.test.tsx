import type { ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RuleCard from './RuleCard';
import type { FormattedRule } from '../../shared/types';

const TARGET_GROUP_ID = '00gFAKE0000000000TGT';

const initial: FormattedRule = {
  id: '00rFAKE0000000000001',
  name: 'Engineering auto-assign',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: [TARGET_GROUP_ID],
  groupNames: undefined,
  allGroupNamesMap: {},
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  affectsCurrentGroup: false,
};

const withConflict: FormattedRule = {
  ...initial,
  conflicts: [
    {
      rule1: { id: initial.id, name: initial.name },
      rule2: { id: '00rFAKE0000000000002', name: 'Contractors auto-assign' },
      reason: 'Both rules assign users to the same group on overlapping conditions.',
      severity: 'high',
      affectedGroups: [TARGET_GROUP_ID],
    },
  ],
};

const renderCard = (props: Partial<ComponentProps<typeof RuleCard>> = {}) =>
  render(<RuleCard rule={initial} {...props} />);

const rerenderCard = (
  rerender: ReturnType<typeof renderCard>['rerender'],
  props: Partial<ComponentProps<typeof RuleCard>> = {},
) => rerender(<RuleCard rule={initial} {...props} />);

describe('RuleCard', () => {
  it('repaints when a later pass adds a conflict to a rule already on screen', () => {
    const { rerender } = renderCard();
    expect(screen.queryByText(/Conflict/)).not.toBeInTheDocument();

    rerenderCard(rerender, { rule: withConflict });

    expect(screen.getByText('1 Conflict')).toBeInTheDocument();
  });

  it('repaints when the rule it was handed changes status underneath it', () => {
    const { rerender } = renderCard();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();

    rerenderCard(rerender, { rule: { ...initial, status: 'INACTIVE' } });

    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
  });

  describe('a broken (INVALID) rule (D-085)', () => {
    it('is marked Broken, not as a second flavour of INACTIVE', () => {
      renderCard({ rule: { ...initial, status: 'INVALID' } });

      expect(screen.getByText('Broken')).toBeInTheDocument();
      expect(screen.queryByText('INACTIVE')).not.toBeInTheDocument();
      expect(screen.queryByText('INVALID')).not.toBeInTheDocument();
    });

    it('says what being broken means, where INACTIVE says something else', () => {
      const { rerender } = render(<RuleCard rule={{ ...initial, status: 'INVALID' }} />);
      const brokenTitle = screen.getByText('Broken').getAttribute('title');
      expect(brokenTitle).toContain('INVALID');

      rerender(<RuleCard rule={{ ...initial, status: 'INACTIVE' }} />);
      const pausedTitle = screen.getByText('INACTIVE').getAttribute('title');
      expect(pausedTitle).toContain('deactivated');
      expect(pausedTitle).not.toBe(brokenTitle);
    });
  });

  it('shows the way in once its handler is wired up after first paint', () => {
    const { rerender } = renderCard();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerenderCard(rerender, { onOpenRule: vi.fn() });

    expect(screen.getByRole('button', { name: 'Open rule' })).toBeInTheDocument();
  });

  it('opens the rule when the row is pressed', async () => {
    const onOpenRule = vi.fn();
    renderCard({ onOpenRule });

    await userEvent.click(screen.getByRole('button', { name: 'Open rule' }));

    expect(onOpenRule).toHaveBeenCalledWith(initial);
  });

  it('says where the press lands when it deep-links across tabs', async () => {
    const onOpenInRulesTab = vi.fn();
    renderCard({ onOpenInRulesTab });

    await userEvent.click(screen.getByRole('button', { name: 'Open rule in the Rules tab' }));

    expect(onOpenInRulesTab).toHaveBeenCalledWith(initial.id);
  });

  it('renders no affordance when it can open nothing', () => {
    renderCard();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(initial.name)).toBeInTheDocument();
  });

  it('names the specific rule its overlay opens', () => {
    renderCard({ onOpenRule: vi.fn() });

    const describedBy = screen
      .getByRole('button', { name: 'Open rule' })
      .getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(screen.getByText(initial.name)).toHaveAttribute('id', describedBy);
  });
});
