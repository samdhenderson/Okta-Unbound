import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserAppsList from './UserAppsList';
import { selectionStore } from '../../selection/selectionStore';
import type { UserAppAssignment } from '../../hooks/useOktaApi/userOperations';

beforeEach(() => {
  selectionStore.clearAll();
});

const apps: UserAppAssignment[] = [
  { id: '0oaFAKE0001', label: 'Salesforce', scope: 'USER', isProfileSource: false },
  { id: '0oaFAKE0002', label: 'Workday', scope: 'USER', isProfileSource: false },
];

const base = { apps, memberships: [], isLoading: false, complete: true };

describe('UserAppsList selection', () => {
  it('ticks and unticks one app from its own row', async () => {
    const user = userEvent.setup();
    render(<UserAppsList {...base} />);

    const box = screen.getByRole('checkbox', { name: 'Select Salesforce' });
    await user.click(box);
    expect(screen.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Select Salesforce' }));
    expect(screen.getByRole('checkbox', { name: 'Select Salesforce' })).not.toBeChecked();
  });

  it('takes only the apps the filter left on screen when Select all is pressed', async () => {
    const user = userEvent.setup();
    render(<UserAppsList {...base} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter apps or granting group' }),
      'salesforce',
    );
    await user.click(screen.getByRole('button', { name: 'Select all' }));

    expect(screen.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();
  });

  it('keeps a pick that the filter has since hidden', async () => {
    const user = userEvent.setup();
    render(<UserAppsList {...base} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter apps or granting group' }),
      'salesforce',
    );
    await user.click(screen.getByRole('button', { name: 'Select all' }));
    expect(screen.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();

    await user.clear(screen.getByRole('searchbox', { name: 'Filter apps or granting group' }));

    expect(screen.getByRole('checkbox', { name: 'Select Salesforce' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Workday' })).not.toBeChecked();
  });
});
