import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OktaPolicyListItem, OktaPolicyRule } from '../../shared/schemas/okta';

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
  listPolicies: vi.fn(async () => [] as OktaPolicyListItem[]),
  getPolicyRules: vi.fn(async () => [] as OktaPolicyRule[]),
}));

vi.mock('../hooks/useOktaApi', () => ({ useOktaApi: () => api }));

import AuthPoliciesTab from './AuthPoliciesTab';
import { resetEntityCache } from '../cache/entityCache';

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  api.listPolicies.mockResolvedValue(policies);
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
    expect(screen.queryByTestId('policy-rules-list')).not.toBeInTheDocument();

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

  it('explains the admin-role caveat when no policies come back', async () => {
    api.listPolicies.mockResolvedValue([]);

    render(<AuthPoliciesTab targetTabId={1} />);

    expect(await screen.findByText('No App Authentication Policies')).toBeInTheDocument();
    expect(
      screen.getByText(
        "No app authentication policies found — or your admin role can't read policies.",
      ),
    ).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Load Policies' }));
    await waitFor(() => expect(screen.getByText('No Okta tab connected')).toBeInTheDocument());
    expect(api.listPolicies).not.toHaveBeenCalled();
  });
});
