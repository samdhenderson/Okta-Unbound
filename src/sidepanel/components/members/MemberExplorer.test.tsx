import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberExplorer from './MemberExplorer';
import { SELECTION_LIMIT, selectionStore } from '../../selection/selectionStore';
import type { MemberSourceContext } from './memberSourceContext';
import { toMemberSourceSegments } from '../groups/memberSourceBuckets';
import { buildMemberSourceIndex } from '../../../shared/membership/memberSourceIndex';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';
import type { OktaUser, UserStatus } from '../../../shared/types';

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

beforeEach(() => {
  selectionStore.clearAll();
});

function member(
  n: number,
  status: UserStatus,
  department: string,
  title: string,
  firstName = 'Ada',
): OktaUser {
  return {
    id: `00uFAKE0000000000${n}`,
    status,
    profile: {
      firstName,
      lastName: `Lovelace ${n}`,
      email: `member${n}@example.com`,
      login: `member${n}@example.com`,
      department,
      title,
    },
  };
}

const members: OktaUser[] = [
  member(1, 'ACTIVE', 'Engineering', 'Engineer'),
  member(2, 'ACTIVE', 'Engineering', 'Engineer'),
  member(3, 'ACTIVE', 'Support', 'Agent'),
  member(4, 'ACTIVE', 'Support', 'Agent', 'Grace'),
  member(5, 'SUSPENDED', 'Engineering', 'Engineer'),
  member(6, 'SUSPENDED', 'Support', 'Agent'),
];

const identity = { id: '00gFAKE1', name: 'Engineering', type: 'OKTA_GROUP' as const };

const breakdown: MemberSourceBreakdown = {
  total: 6,
  direct: 6,
  ruleBased: 0,
  unattributed: 0,
  byRule: [],
};

const memberSource: MemberSourceContext = {
  index: buildMemberSourceIndex(identity, members, []),
  segments: toMemberSourceSegments(breakdown),
};

const base = {
  members,
  mfaResults: null,
  scanStatus: 'idle' as const,
  onRunScan: () => {},
  onRequestConfirm: () => {},
  onCancelConfirm: () => {},
};

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /^Filters/ }));
}

function shownOfTotal(): string {
  return screen.getByText(/^\d+ of \d+$/).textContent ?? '';
}

describe('MemberExplorer filtering', () => {
  it('lists every member and reports the full count before anything is filtered', () => {
    render(<MemberExplorer {...base} />);

    expect(screen.getByText('Ada Lovelace 1')).toBeInTheDocument();
    expect(screen.getByText('Grace Lovelace 4')).toBeInTheDocument();
    expect(shownOfTotal()).toBe('6 of 6');
  });

  it('narrows the list to the members matching the search text', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'grace');

    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));
    expect(screen.getByText('Grace Lovelace 4')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace 1')).not.toBeInTheDocument();
  });

  it('says so rather than showing an empty box when nothing matches', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'nobody-by-this-name');

    await waitFor(() => expect(shownOfTotal()).toBe('0 of 6'));
    expect(
      screen.getByText('No members match the current search and filters.'),
    ).toBeInTheDocument();
  });

  it('applies a status facet, and says which filter is applied', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));

    expect(shownOfTotal()).toBe('2 of 6');
    expect(screen.getByText('Status: SUSPENDED')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace 1')).not.toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace 5')).toBeInTheDocument();
  });

  it('ORs two values of the same dimension rather than intersecting them', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));
    await user.click(screen.getByRole('button', { name: /ACTIVE \(4\)/ }));

    expect(shownOfTotal()).toBe('6 of 6');
  });

  it('ANDs across dimensions — a source pill and a status pill intersect', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} memberSource={memberSource} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /Manual 6/ }));
    expect(shownOfTotal()).toBe('6 of 6');

    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));

    expect(shownOfTotal()).toBe('2 of 6');
    expect(screen.getByText('Source: Manual')).toBeInTheDocument();
    expect(screen.getByText('Status: SUSPENDED')).toBeInTheDocument();
  });

  it('composes a filter with the search text', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /ACTIVE \(4\)/ }));
    await user.type(screen.getByRole('searchbox'), 'grace');

    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));
    expect(screen.getByText('Grace Lovelace 4')).toBeInTheDocument();
  });

  it('removes one filter from its chip and leaves the others applied', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} memberSource={memberSource} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /Manual 6/ }));
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));
    expect(shownOfTotal()).toBe('2 of 6');

    await user.click(screen.getByRole('button', { name: 'Remove Status: SUSPENDED filter' }));

    expect(shownOfTotal()).toBe('6 of 6');
    expect(screen.queryByText('Status: SUSPENDED')).not.toBeInTheDocument();
    expect(screen.getByText('Source: Manual')).toBeInTheDocument();
  });

  it('toggling the same value twice removes it again', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));
    expect(shownOfTotal()).toBe('2 of 6');

    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));
    expect(shownOfTotal()).toBe('6 of 6');
  });

  it('clears every filter at once, across dimensions', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} memberSource={memberSource} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /Manual 6/ }));
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(shownOfTotal()).toBe('6 of 6');
    expect(screen.queryByText('Status: SUSPENDED')).not.toBeInTheDocument();
    expect(screen.queryByText('Source: Manual')).not.toBeInTheDocument();
  });

  it('leaves the search text alone when the filters are cleared', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'grace');
    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /ACTIVE \(4\)/ }));
    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));

    await user.click(screen.getByRole('button', { name: 'Clear all' }));

    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));
    expect(screen.getByRole('searchbox')).toHaveValue('grace');
  });

  it('counts the applied filters on the Filters control', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} memberSource={memberSource} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /Manual 6/ }));
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));

    expect(screen.getByRole('button', { name: 'Filters, 2 applied' })).toBeInTheDocument();
  });

  it('empties the copy affordance rather than offering it over nobody', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'nobody-by-this-name');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Copy members/ })).toBeDisabled(),
    );
  });

  it('shows the source pill as pressed once it is applied', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} memberSource={memberSource} />);

    await openFilters(user);
    const manual = screen.getByRole('button', { name: /Manual 6/ });
    expect(manual).toHaveAttribute('aria-pressed', 'false');

    await user.click(manual);
    expect(screen.getByRole('button', { name: /Manual 6/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps the roster reachable behind a filter that matches nobody', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: /SUSPENDED \(2\)/ }));
    await user.type(screen.getByRole('searchbox'), 'grace');

    await waitFor(() => expect(shownOfTotal()).toBe('0 of 6'));

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => expect(shownOfTotal()).toBe('2 of 6'));
  });
});

describe('the filter drawer', () => {
  it('is a disclosure that names the region it opens, not a pressed toggle', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-pressed');

    const regionId = trigger.getAttribute('aria-controls');
    expect(regionId).toBeTruthy();
    expect(document.getElementById(regionId as string)).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('holds its controls out of the tab order while it is closed', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    const trigger = screen.getByRole('button', { name: 'Filters' });
    const region = document.getElementById(trigger.getAttribute('aria-controls') as string);

    expect(region).toHaveAttribute('inert');
    await user.click(trigger);
    expect(region).not.toHaveAttribute('inert');
  });

  it('routes an attribute to the shared value reveal, and a value to a filter', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(
      screen.getByRole('button', { name: 'Department: choose a value to filter by' }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Department' });
    expect(within(dialog).getByText('Engineering')).toBeInTheDocument();
    expect(within(dialog).getByText('Support')).toBeInTheDocument();

    await user.click(within(dialog).getByText('Engineering'));

    expect(screen.getByText('Department: Engineering')).toBeInTheDocument();
    expect(shownOfTotal()).toBe('3 of 6');
  });

  it('lets the chip that appeared undo it, without reopening anything', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    await user.click(
      screen.getByRole('button', { name: 'Department: choose a value to filter by' }),
    );
    await user.click(within(screen.getByRole('dialog')).getByText('Engineering'));
    expect(shownOfTotal()).toBe('3 of 6');

    await user.click(screen.getByRole('button', { name: 'Remove Department: Engineering filter' }));

    expect(shownOfTotal()).toBe('6 of 6');
    expect(screen.queryByText('Department: Engineering')).not.toBeInTheDocument();
  });

  it('draws no pointer to Insights when the caller cannot open it', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await openFilters(user);
    expect(screen.queryByRole('button', { name: 'Open Insights' })).not.toBeInTheDocument();
  });

  it('opens Insights when the caller can', async () => {
    const user = userEvent.setup();
    const onOpenInsights = vi.fn();
    render(<MemberExplorer {...base} onOpenInsights={onOpenInsights} />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'Open Insights' }));
    expect(onOpenInsights).toHaveBeenCalledTimes(1);
  });
});

describe('a filter handed over by a neighbouring surface', () => {
  it('applies it to the live list and states it as a removable chip', () => {
    const { rerender } = render(<MemberExplorer {...base} />);
    expect(shownOfTotal()).toBe('6 of 6');

    rerender(
      <MemberExplorer
        {...base}
        pendingFilter={{
          dimension: 'department',
          value: 'Engineering',
          label: 'Department: Engineering',
        }}
      />,
    );

    expect(shownOfTotal()).toBe('3 of 6');
    expect(screen.getByText('Department: Engineering')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Department: Engineering filter' }),
    ).toBeInTheDocument();
  });

  it('does not put the filter back when the reader removes it', async () => {
    const user = userEvent.setup();
    const pendingFilter = {
      dimension: 'department',
      value: 'Engineering',
      label: 'Department: Engineering',
    };
    const { rerender } = render(<MemberExplorer {...base} pendingFilter={pendingFilter} />);

    await user.click(screen.getByRole('button', { name: 'Remove Department: Engineering filter' }));
    expect(shownOfTotal()).toBe('6 of 6');

    rerender(<MemberExplorer {...base} pendingFilter={pendingFilter} isReloading={false} />);
    expect(shownOfTotal()).toBe('6 of 6');
  });
});

describe('selecting the filtered cohort', () => {
  function selectedReadout(): HTMLElement | null {
    return screen.queryByText(/^·\s\d+ selected$/);
  }

  it('takes only the members the filters left on screen', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'grace');
    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));

    await user.click(screen.getByRole('button', { name: 'Select all' }));

    expect(screen.getByRole('checkbox', { name: 'Select Grace Lovelace 4' })).toBeChecked();
    expect(selectedReadout()).toHaveTextContent('1 selected');
  });

  it('keeps a pick that the filters have since hidden', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.type(screen.getByRole('searchbox'), 'grace');
    await waitFor(() => expect(shownOfTotal()).toBe('1 of 6'));
    await user.click(screen.getByRole('button', { name: 'Select all' }));

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => expect(shownOfTotal()).toBe('6 of 6'));

    expect(screen.getByRole('checkbox', { name: 'Select Grace Lovelace 4' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' })).not.toBeChecked();
    expect(selectedReadout()).toHaveTextContent('1 selected');
  });

  it('ticks and unticks one member from their own row', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    const box = screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' });
    await user.click(box);
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' })).toBeChecked();
    expect(selectedReadout()).toHaveTextContent('1 selected');

    await user.click(screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' }));
    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' })).not.toBeChecked();
    expect(selectedReadout()).toBeNull();
  });

  it('offers no way to clear a selection that does not exist yet', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    expect(screen.queryByRole('button', { name: 'Deselect all' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Select all' }));
    await user.click(screen.getByRole('button', { name: 'Deselect all' }));

    expect(screen.getByRole('checkbox', { name: 'Select Ada Lovelace 1' })).not.toBeChecked();
    expect(selectedReadout()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Deselect all' })).toBeNull();
  });

  it('says which boundary Select all is standing on once everyone is taken', async () => {
    const user = userEvent.setup();
    render(<MemberExplorer {...base} />);

    await user.click(screen.getByRole('button', { name: 'Select all' }));

    const selectAll = screen.getByRole('button', { name: 'Select all' });
    expect(selectAll).toBeDisabled();
    expect(selectAll).toHaveAttribute(
      'title',
      'All 6 members matching the current search and filters are already selected',
    );
  });

  it('reports a batch the basket refused rather than showing an unchanged count', async () => {
    const user = userEvent.setup();
    const crowd = Array.from({ length: SELECTION_LIMIT + 1 }, (_, i) =>
      member(i, 'ACTIVE', 'Engineering', 'Engineer'),
    );
    render(<MemberExplorer {...base} members={crowd} />);

    await user.click(screen.getByRole('button', { name: 'Select all' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(`${(SELECTION_LIMIT + 1).toLocaleString()} members`);
    expect(alert).toHaveTextContent('nothing changed');
    expect(selectedReadout()).toBeNull();
  });

  it('leaves an existing selection intact when a Select-all is refused', async () => {
    const user = userEvent.setup();
    const crowd = Array.from({ length: SELECTION_LIMIT + 1 }, (_, i) =>
      member(i, 'ACTIVE', 'Engineering', 'Engineer'),
    );
    selectionStore.toggle({ kind: 'user', id: crowd[0].id, name: 'Already picked' });

    render(<MemberExplorer {...base} members={crowd} />);
    await user.click(screen.getByRole('button', { name: 'Select all' }));

    expect(screen.getByRole('alert')).toHaveTextContent('nothing changed');
    expect(selectionStore.getSnapshot().picked).toHaveLength(1);
    expect(selectionStore.getSnapshot().picked[0].id).toBe(crowd[0].id);
  });
});
