import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OktaUser } from '../../../shared/types';
import type { FormattedRule } from '../../../shared/types';
import type { QualificationSubjectResult } from '../../hooks/useOktaApi/qualificationSubject';

const api = vi.hoisted(() => ({
  makeApiRequest: vi.fn(),
  loadQualificationSubject: vi.fn(),
}));

vi.mock('../../hooks/useOktaApi', () => ({
  useOktaApi: () => api,
}));

import RuleDetailView from './RuleDetailView';
import { NavigationProvider } from '../../contexts/NavigationContext';

const subjectUser: OktaUser = {
  id: '00uFAKESUBJECT',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
  },
};

const rule = (over: Partial<FormattedRule> = {}): FormattedRule => ({
  id: '0prFAKE0000000001',
  name: 'Engineering auto-assign',
  status: 'ACTIVE',
  condition: 'user.department == "Engineering"',
  conditionExpression: 'user.department == "Engineering"',
  groupIds: ['00gFAKETARGET1'],
  groupNames: ['Engineering – All'],
  allGroupNamesMap: {},
  userAttributes: ['department'],
  created: '2024-01-01T00:00:00.000Z',
  lastUpdated: '2025-01-01T00:00:00.000Z',
  ...over,
});

const strip = {
  tierOpen: false,
  onTierOpenChange: vi.fn(),
  isConfirmingActivate: false,
  onRequestActivate: vi.fn(),
  onCancelActivate: vi.fn(),
  onConfirmActivate: vi.fn(),
  onRequestDeactivate: vi.fn(),
};

const view = (r: FormattedRule, targetTabId: number | null) => (
  <NavigationProvider handlers={{ group: vi.fn() }}>
    <RuleDetailView
      rule={r}
      oktaOrigin={null}
      sticky={false}
      targetTabId={targetTabId}
      {...strip}
    />
  </NavigationProvider>
);

function deferredSubject() {
  let resolve!: (value: QualificationSubjectResult) => void;
  const promise = new Promise<QualificationSubjectResult>((r) => {
    resolve = r;
  });
  api.loadQualificationSubject.mockReturnValue(promise);
  return { resolve };
}

async function pickSubject(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Evaluate user' }));
  await user.type(screen.getByPlaceholderText('Search users...'), 'ada');
  await user.click(await screen.findByText('Ada Lovelace'));
}

beforeEach(() => {
  api.makeApiRequest.mockReset();
  api.loadQualificationSubject.mockReset();
  api.makeApiRequest.mockResolvedValue({ success: true, data: [subjectUser], headers: {} });
});

describe('RuleDetailView — Evaluate user', () => {
  it('omits the verb when there is no tab to read from — never disabled', () => {
    render(view(rule(), null));
    expect(screen.queryByRole('button', { name: 'Evaluate user' })).not.toBeInTheDocument();
    expect(screen.queryByText('For one user')).not.toBeInTheDocument();
  });

  it('shows no verdict while the subject loads, then the headline and ledger once it has', async () => {
    const user = userEvent.setup();
    const pending = deferredSubject();
    render(view(rule(), 1));

    await pickSubject(user);

    expect(api.loadQualificationSubject).toHaveBeenCalledWith(subjectUser.id);
    expect(screen.getByText('For one user')).toBeInTheDocument();
    expect(screen.getByText(/Reading the user and their groups/)).toBeInTheDocument();
    expect(screen.queryByText('Qualifies')).not.toBeInTheDocument();
    expect(screen.queryByText('Rule matches this user')).not.toBeInTheDocument();

    await act(async () => {
      pending.resolve({ ok: true, user: subjectUser, groups: [] });
    });

    expect(screen.getByText('Qualifies')).toBeInTheDocument();
    expect(screen.getByText('Rule matches this user')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Not a member')).toBeInTheDocument();
  });

  it('states a failed load and shows no verdict', async () => {
    const user = userEvent.setup();
    api.loadQualificationSubject.mockResolvedValue({ ok: false, reason: 'user-not-found' });
    render(view(rule(), 1));

    await pickSubject(user);

    expect(await screen.findByText(/The user could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByText('Qualifies')).not.toBeInTheDocument();
  });

  it('Clear drops the section', async () => {
    const user = userEvent.setup();
    api.loadQualificationSubject.mockResolvedValue({ ok: true, user: subjectUser, groups: [] });
    render(view(rule(), 1));

    await pickSubject(user);
    expect(await screen.findByText('Qualifies')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByText('For one user')).not.toBeInTheDocument();
  });

  it('retracts the subject when the rule changes, without another load', async () => {
    const user = userEvent.setup();
    api.loadQualificationSubject.mockResolvedValue({ ok: true, user: subjectUser, groups: [] });
    const { rerender } = render(view(rule(), 1));

    await pickSubject(user);
    expect(await screen.findByText('Qualifies')).toBeInTheDocument();

    rerender(view(rule({ id: '0prFAKE0000000002', name: 'Another rule' }), 1));

    expect(screen.queryByText('For one user')).not.toBeInTheDocument();
    expect(api.loadQualificationSubject).toHaveBeenCalledTimes(1);
  });
});
