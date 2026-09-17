import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../shared/schemas/okta';
import type { PolicyListResult } from '../hooks/useOktaApi/policyOperations';

const policies: OktaPolicyListItem[] = [
  {
    id: 'rstFAKE000000000001',
    name: 'Any two factors',
    status: 'ACTIVE',
    type: 'ACCESS_POLICY',
    priority: 1,
    description: 'Requires two factors',
    system: false,
  },
  {
    id: 'rstFAKE000000000002',
    name: 'Default Policy',
    status: 'INACTIVE',
    type: 'ACCESS_POLICY',
    priority: 2,
    description: 'Catch-all for unassigned apps',
    system: true,
  },
];

const policyRules: OktaPolicyRule[] = [
  {
    id: '0prFAKE000000000001',
    name: 'Catch-all Rule',
    status: 'ACTIVE',
    priority: 1,
    system: true,
  },
  { id: '0prFAKE000000000002', name: 'Contractors', status: 'INACTIVE', priority: 2 },
];

const api = vi.hoisted(() => ({
  isLoading: false,
  isCancelled: false,
  cancelOperation: vi.fn(),
  listPolicies: vi.fn(async (): Promise<PolicyListResult> => ({ outcome: 'listed', policies: [] })),
  getPolicyRules: vi.fn(async () => [] as OktaPolicyRule[]),
}));

vi.mock('../hooks/useOktaApi', () => ({ useOktaApi: () => api }));

import AuthPoliciesTab from './AuthPoliciesTab';
import { resetEntityCache } from '../cache/entityCache';
import { selectionStore } from '../selection/selectionStore';

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  selectionStore.clearAll();
  api.listPolicies.mockResolvedValue({ outcome: 'listed', policies });
  api.getPolicyRules.mockResolvedValue(policyRules);
});

describe('AuthPoliciesTab', () => {
  it('loads access policies on arrival and renders them', async () => {
    render(<AuthPoliciesTab targetTabId={1} oktaOrigin="https://example.okta.com" />);

    expect(await screen.findByText('Any two factors')).toBeInTheDocument();
    expect(screen.getByText('Default Policy')).toBeInTheDocument();

    expect(api.listPolicies).toHaveBeenCalledWith('ACCESS_POLICY');
    expect(screen.getByText('2 Policies')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('filters the list by a name or description substring', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    const search = screen.getByLabelText('Search auth policies');

    await user.type(search, 'default');
    expect(screen.queryByText('Any two factors')).not.toBeInTheDocument();
    expect(screen.getByText('Default Policy')).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'two factors');
    expect(screen.getByText('Any two factors')).toBeInTheDocument();
    expect(screen.queryByText('Default Policy')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzzz-no-such-policy');
    expect(await screen.findByText('No Matching Policies')).toBeInTheDocument();
  });

  it('lazily fetches a policy’s rules on expand and caches them for re-expansion', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    expect(api.getPolicyRules).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Show rules for Any two factors' }));

    const rulesList = await screen.findByTestId('policy-rules-list');
    expect(within(rulesList).getByText('Catch-all Rule')).toBeInTheDocument();
    expect(within(rulesList).getByText('Contractors')).toBeInTheDocument();
    expect(api.getPolicyRules).toHaveBeenCalledTimes(1);
    expect(api.getPolicyRules).toHaveBeenCalledWith('rstFAKE000000000001');

    await user.click(screen.getByRole('button', { name: 'Hide rules for Any two factors' }));
    const disclosure = within(screen.getByTestId('policy-rstFAKE000000000001')).getByTestId(
      'policy-rules-disclosure',
    );
    expect(disclosure).toHaveAttribute('data-open', 'false');
    expect(disclosure).toHaveAttribute('inert');

    await user.click(screen.getByRole('button', { name: 'Show rules for Any two factors' }));
    expect(await screen.findByTestId('policy-rules-list')).toBeInTheDocument();
    expect(api.getPolicyRules).toHaveBeenCalledTimes(1);
  });

  it('shows an inline danger state when a policy’s rules fail to load', async () => {
    const user = userEvent.setup();
    api.getPolicyRules.mockRejectedValue(new Error('Policy rules unavailable'));

    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    await user.click(screen.getByRole('button', { name: 'Show rules for Any two factors' }));

    expect(await screen.findByText(/Could not load rules: Policy rules unavailable/)).toBeVisible();
    expect(screen.getByText('Default Policy')).toBeInTheDocument();
  });

  it('states an empty org as an answer, with no disjunction (D-D)', async () => {
    api.listPolicies.mockResolvedValue({ outcome: 'listed', policies: [] });

    render(<AuthPoliciesTab targetTabId={1} />);

    expect(await screen.findByText('No app authentication policies')).toBeInTheDocument();
    expect(
      screen.getByText('Okta reports this org has no app authentication policies.'),
    ).toBeInTheDocument();
  });

  it('names a refused read as a refusal, and does not call it an empty org', async () => {
    api.listPolicies.mockResolvedValue({ outcome: 'forbidden' });

    render(<AuthPoliciesTab targetTabId={1} />);

    expect(
      await screen.findByText('Policies are not readable by this admin role'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/this org has no app authentication policies/)).toBeNull();
    expect(screen.queryByText(/Nothing has been read from Okta yet/)).toBeNull();
  });

  it('routes a refusal to the empty state rather than the error banner', async () => {
    api.listPolicies.mockResolvedValue({ outcome: 'forbidden' });

    render(<AuthPoliciesTab targetTabId={1} />);

    await screen.findByText('Policies are not readable by this admin role');
    expect(screen.queryByRole('button', { name: /dismiss/i })).toBeNull();
  });

  it('renders no mutation affordances anywhere (read-only tab)', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    await user.click(screen.getByRole('button', { name: 'Show rules for Any two factors' }));
    await screen.findByTestId('policy-rules-list');

    const forbidden =
      /activate|deactivate|delete|remove|edit|create|save|disable|enable|add rule|new policy/i;
    for (const control of screen.getAllByRole('button')) {
      const label = `${control.textContent ?? ''} ${control.getAttribute('aria-label') ?? ''}`;
      expect(label).not.toMatch(forbidden);
    }
  });

  it('reports a missing Okta tab instead of fetching', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab />);

    expect(api.listPolicies).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Load policies' }));
    await waitFor(() => expect(screen.getByText('No Okta tab connected')).toBeInTheDocument());
    expect(api.listPolicies).not.toHaveBeenCalled();
  });

  it('arrives at a deep-linked policy with the list filtered to it, once', async () => {
    const onPolicySelected = vi.fn();
    const { rerender } = render(
      <AuthPoliciesTab
        targetTabId={1}
        selectedPolicyId="rstFAKE000000000002"
        onPolicySelected={onPolicySelected}
      />,
    );

    expect(await screen.findByText('Default Policy')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Any two factors')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('Default Policy')).toBeInTheDocument();
    await waitFor(() => expect(onPolicySelected).toHaveBeenCalledTimes(1));

    rerender(
      <AuthPoliciesTab
        targetTabId={1}
        selectedPolicyId="rstFAKE000000000002"
        onPolicySelected={onPolicySelected}
      />,
    );
    expect(onPolicySelected).toHaveBeenCalledTimes(1);
  });

  it('waits for the policy list before consuming a deep link into a cold tab', async () => {
    const onPolicySelected = vi.fn();
    const { rerender } = render(
      <AuthPoliciesTab
        targetTabId={1}
        isActive={false}
        selectedPolicyId="rstFAKE000000000002"
        onPolicySelected={onPolicySelected}
      />,
    );

    await waitFor(() => expect(api.listPolicies).not.toHaveBeenCalled());
    expect(onPolicySelected).not.toHaveBeenCalled();

    rerender(
      <AuthPoliciesTab
        targetTabId={1}
        isActive
        selectedPolicyId="rstFAKE000000000002"
        onPolicySelected={onPolicySelected}
      />,
    );

    expect(await screen.findByText('Default Policy')).toBeInTheDocument();
    await waitFor(() => expect(onPolicySelected).toHaveBeenCalledTimes(1));
    expect(screen.getByDisplayValue('Default Policy')).toBeInTheDocument();
  });

  it('defers the arrival load while the tab is mounted but not the visible one', async () => {
    const { rerender } = render(<AuthPoliciesTab targetTabId={1} isActive={false} />);

    await waitFor(() => expect(api.listPolicies).not.toHaveBeenCalled());

    rerender(<AuthPoliciesTab targetTabId={1} isActive />);
    expect(await screen.findByText('Any two factors')).toBeInTheDocument();
    expect(api.listPolicies).toHaveBeenCalledTimes(1);
  });
});

describe("AuthPoliciesTab's selection controls", () => {
  const checkbox = (label: string) => screen.getByRole('checkbox', { name: `Select ${label}` });

  it('takes the searched policies, not the whole loaded list', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    await user.type(screen.getByLabelText('Search auth policies'), 'default');
    expect(screen.queryByText('Any two factors')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(checkbox('Default Policy')).toBeChecked();

    await user.clear(screen.getByLabelText('Search auth policies'));
    expect(await screen.findByText('Any two factors')).toBeInTheDocument();
    expect(checkbox('Default Policy')).toBeChecked();
    expect(checkbox('Any two factors')).not.toBeChecked();
  });

  it('disables select-all once it has nothing left to take, and deselect-all gives it back', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    const selectAll = () => screen.getByRole('button', { name: 'Select all' });
    expect(selectAll()).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Deselect all' })).not.toBeInTheDocument();

    await user.click(selectAll());
    expect(checkbox('Any two factors')).toBeChecked();
    expect(checkbox('Default Policy')).toBeChecked();
    await waitFor(() => expect(selectAll()).toBeDisabled());

    await user.click(screen.getByRole('button', { name: 'Deselect all' }));
    expect(checkbox('Any two factors')).not.toBeChecked();
    expect(checkbox('Default Policy')).not.toBeChecked();
    expect(selectAll()).toBeEnabled();
  });

  it('states the counts once, above the rows', async () => {
    const user = userEvent.setup();
    render(<AuthPoliciesTab targetTabId={1} />);
    await screen.findByText('Any two factors');

    const line = () => screen.getByTestId('policies-count-line');
    expect(line().textContent).toBe('Showing 2 of 2');

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(line().textContent).toBe('Showing 2 of 2 \u00b7 2 selected');

    for (const name of ['Select all', 'Deselect all']) {
      expect(screen.getByRole('button', { name }).textContent).toBe(name);
    }
  });
});
