import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserSearchPanel from './UserSearchPanel';
import { selectionStore } from '../../selection/selectionStore';
import type { OktaUser } from '../../../shared/types';

const makeUser = (id: string, first: string, last: string): OktaUser => ({
  id,
  status: 'ACTIVE',
  profile: {
    login: `${first.toLowerCase()}@example.com`,
    email: `${first.toLowerCase()}@example.com`,
    firstName: first,
    lastName: last,
  },
});

const ada = makeUser('00uFAKE0001', 'Ada', 'Lovelace');
const grace = makeUser('00uFAKE0002', 'Grace', 'Hopper');
const alan = makeUser('00uFAKE0003', 'Alan', 'Turing');

const renderPanel = (searchResults: OktaUser[], onSelectUser = vi.fn()) =>
  render(
    <UserSearchPanel
      searchQuery="a"
      onSearchQueryChange={vi.fn()}
      onClearSearch={vi.fn()}
      isSearching={false}
      searchResults={searchResults}
      resultsTruncated={false}
      onSelectUser={onSelectUser}
      hasSelectedUser={false}
      hasError={false}
    />,
  );

beforeEach(() => {
  selectionStore.clearAll();
});

describe('UserSearchPanel selection', () => {
  it('keeps a pick when the next search replaces the results, and re-ticks the row when that user comes back', async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel([ada, grace]);

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
    expect(screen.getByText('1 user selected')).toBeInTheDocument();

    rerender(
      <UserSearchPanel
        searchQuery="t"
        onSearchQueryChange={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
        searchResults={[alan]}
        resultsTruncated={false}
        onSelectUser={vi.fn()}
        hasSelectedUser={false}
        hasError={false}
      />,
    );

    expect(screen.queryByRole('checkbox', { name: 'Select Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.getByText('1 user selected')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Select Alan Turing' }));
    expect(screen.getByText('2 users selected')).toBeInTheDocument();

    rerender(
      <UserSearchPanel
        searchQuery="ada"
        onSearchQueryChange={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
        searchResults={[ada]}
        resultsTruncated={false}
        onSelectUser={vi.fn()}
        hasSelectedUser={false}
        hasError={false}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).toBeChecked();
  });

  it('releases a user ticked in an earlier search once her row returns, leaving the rest of the cohort held', async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel([ada, grace]);

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Grace Hopper' }));
    expect(screen.getByText('2 users selected')).toBeInTheDocument();

    rerender(
      <UserSearchPanel
        searchQuery="ada"
        onSearchQueryChange={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
        searchResults={[ada]}
        resultsTruncated={false}
        onSelectUser={vi.fn()}
        hasSelectedUser={false}
        hasError={false}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));

    expect(screen.getByText('1 user selected')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' })).not.toBeChecked();
  });

  it('states nothing at all when the basket is empty, rather than reading 0 selected', () => {
    renderPanel([ada, grace]);

    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('reports the cohort even when the current query matches nobody', async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel([ada]);

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));

    rerender(
      <UserSearchPanel
        searchQuery="zzz"
        onSearchQueryChange={vi.fn()}
        onClearSearch={vi.fn()}
        isSearching={false}
        searchResults={[]}
        resultsTruncated={false}
        onSelectUser={vi.fn()}
        hasSelectedUser={false}
        hasError={false}
      />,
    );

    expect(screen.getByText('1 user selected')).toBeInTheDocument();
  });

  it('ticking a row adds the user without opening them', async () => {
    const user = userEvent.setup();
    const onSelectUser = vi.fn();
    renderPanel([ada], onSelectUser);

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace' }));

    expect(onSelectUser).not.toHaveBeenCalled();
    expect(screen.getByText('1 user selected')).toBeInTheDocument();
  });

  it('the row itself still opens the user it names', async () => {
    const user = userEvent.setup();
    const onSelectUser = vi.fn();
    renderPanel([ada, grace], onSelectUser);

    await user.click(screen.getAllByRole('button', { name: /View user details/ })[1]);

    expect(onSelectUser).toHaveBeenCalledWith(grace);
  });
});
