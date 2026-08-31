import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RuleDetailView from './RuleDetailView';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { FormattedRule } from '../../../shared/types';

const TARGET_GROUP_ID = '00gFAKE0000000000TGT';
const CONDITION_GROUP_ID = '00gFAKE0000000000CND';
const ORIGIN = 'https://example.okta.com';

const unresolved: FormattedRule = {
  id: '00rFAKE0000000000001',
  name: 'Engineering auto-assign',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: `isMemberOfAnyGroup("${CONDITION_GROUP_ID}")`,
  groupIds: [TARGET_GROUP_ID],
  groupNames: undefined,
  allGroupNamesMap: {},
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  affectsCurrentGroup: false,
};

const resolved: FormattedRule = {
  ...unresolved,
  groupNames: ['Engineering – All'],
  allGroupNamesMap: { [CONDITION_GROUP_ID]: 'Condition Group' },
};

const strip = {
  tierOpen: false,
  onTierOpenChange: vi.fn(),
  isConfirmingActivate: false,
  onRequestActivate: vi.fn(),
  onCancelActivate: vi.fn(),
  onConfirmActivate: vi.fn(),
  onRequestDeactivate: vi.fn(),
};

const renderView = (rule: FormattedRule = unresolved, oktaOrigin: string | null = null) =>
  render(
    <NavigationProvider handlers={{ group: vi.fn() }}>
      <RuleDetailView rule={rule} oktaOrigin={oktaOrigin} sticky={false} {...strip} />
    </NavigationProvider>,
  );

const rerenderView = (rerender: ReturnType<typeof renderView>['rerender'], rule: FormattedRule) =>
  rerender(
    <NavigationProvider handlers={{ group: vi.fn() }}>
      <RuleDetailView rule={rule} oktaOrigin={null} sticky={false} {...strip} />
    </NavigationProvider>,
  );

describe('RuleDetailView', () => {
  it('repaints its target groups when their names arrive after first paint', () => {
    const { rerender } = renderView();

    expect(screen.getByText('Group name not loaded')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open group Engineering – All' }),
    ).not.toBeInTheDocument();

    rerenderView(rerender, resolved);

    expect(
      screen.getByRole('button', { name: 'Open group Engineering – All' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Group name not loaded')).not.toBeInTheDocument();
  });

  it('repaints a condition-expression group id when its name arrives after first paint', () => {
    const { rerender } = renderView();

    expect(screen.getByText(new RegExp(CONDITION_GROUP_ID))).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Open group Condition Group' }),
    ).not.toBeInTheDocument();

    rerenderView(rerender, resolved);

    expect(screen.getByRole('button', { name: 'Open group Condition Group' })).toBeInTheDocument();
  });

  it('states an unresolved target group rather than printing its id as a name', () => {
    renderView();

    expect(screen.getByText('Group name not loaded')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: `Copy group id ${TARGET_GROUP_ID}` }),
    ).toBeInTheDocument();
  });

  it('shows the attributes the condition reads', () => {
    renderView();

    expect(screen.getByText('Profile attributes it reads')).toBeInTheDocument();
    expect(screen.getByText('department')).toBeInTheDocument();
  });

  it('says so when the rule assigns to no groups', () => {
    renderView({ ...unresolved, groupIds: [], groupNames: [] });

    expect(screen.getByText(/assigns to no groups/)).toBeInTheDocument();
    expect(screen.queryByText('Group name not loaded')).not.toBeInTheDocument();
  });

  it('lists a detected conflict with the rule it collides with', () => {
    renderView({
      ...unresolved,
      conflicts: [
        {
          rule1: { id: unresolved.id, name: unresolved.name },
          rule2: { id: '00rFAKE0000000000002', name: 'Contractors auto-assign' },
          reason: 'Both rules assign users to the same group on overlapping conditions.',
          severity: 'high',
          affectedGroups: [TARGET_GROUP_ID],
        },
      ],
    });

    expect(screen.getByText('Conflicts')).toBeInTheDocument();
    expect(screen.getByText('Contractors auto-assign')).toBeInTheDocument();
    expect(screen.getByText(/overlapping conditions/)).toBeInTheDocument();
  });

  it('omits the conflicts section when there are none', () => {
    renderView();
    expect(screen.queryByText('Conflicts')).not.toBeInTheDocument();
  });

  it('does not claim the Okta link opens this rule', () => {
    renderView(unresolved, ORIGIN);

    const link = screen.getByRole('link', { name: /Open the rules page/ });
    expect(link).toHaveAttribute('href', `${ORIGIN}/admin/groups#rules`);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/no direct link to a single rule/)).toBeInTheDocument();
  });

  it('omits the Okta section entirely when no org origin is known', () => {
    renderView();
    expect(screen.queryByRole('link', { name: /Open the rules page/ })).not.toBeInTheDocument();
  });

  it('does not repeat the identity the header already carries', () => {
    renderView();

    expect(screen.queryByText(unresolved.name)).not.toBeInTheDocument();
    expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
  });
});
