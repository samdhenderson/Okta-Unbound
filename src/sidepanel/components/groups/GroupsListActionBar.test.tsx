import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import GroupsListActionBar from './GroupsListActionBar';

const handlers = {
  onSelectAll: vi.fn(),
  onDeselectAll: vi.fn(),
  onCompare: vi.fn(),
  onExportSelection: vi.fn(),
  onExportGroupsList: vi.fn(),
};

const bar = (selectedCount: number, filteredCount = 42) => (
  <GroupsListActionBar selectedCount={selectedCount} filteredCount={filteredCount} {...handlers} />
);

const band = (): HTMLElement => {
  const node = screen.getByTestId('groups-list-action-bar');
  return node;
};

const register = (): HTMLElement =>
  screen.getByRole('group', { name: 'Selection actions for the groups list' });

describe('the selection register shares its row rather than stacking a new one', () => {
  it('adds no row to the band when the first group is ticked', () => {
    const { rerender } = render(bar(0));

    const before = band().children.length;
    const registerBefore = register();
    expect(registerBefore).toBeInTheDocument();

    rerender(bar(1));

    expect(band().children.length).toBe(before);
    expect(register()).toBe(registerBefore);
  });

  it('keeps the same row count all the way to a full selection', () => {
    const { rerender } = render(bar(0));
    const rows = band().children.length;

    for (const selected of [1, 2, 3, 6, 42]) {
      rerender(bar(selected));
      expect({ selected, rows: band().children.length }).toEqual({ selected, rows });
    }
  });

  it('grows the register in place instead of moving verbs into the action row', () => {
    const { rerender } = render(bar(0));
    expect(within(register()).getAllByRole('button')).toHaveLength(1);

    rerender(bar(3));

    expect(
      within(register())
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Deselect all', 'Select all (42)', 'Compare (3)']);
  });
});

describe('position one of the register is a selection control', () => {
  it.each([0, 1, 2, 3, 6, 42])('leads with a selection control at %i selected', (selected) => {
    render(bar(selected));

    const first = within(register()).getAllByRole('button')[0];
    expect(first.textContent).toBe(selected > 0 ? 'Deselect all' : 'Select all (42)');
  });

  it('never moves a verb under the pointer as rows are ticked', () => {
    const { rerender } = render(bar(0));

    for (const selected of [2, 3, 6, 42]) {
      rerender(bar(selected));
      const first = within(register()).getAllByRole('button')[0];
      expect({ selected, first: first.textContent }).toEqual({ selected, first: 'Deselect all' });
    }
  });
});

describe('a disabled control says why', () => {
  it('explains a full selection rather than vanishing or swapping label', () => {
    render(bar(42));

    const selectAll = screen.getByRole('button', { name: 'Select all (42)' });
    expect(selectAll).toBeDisabled();
    expect(selectAll).toHaveAccessibleDescription(
      'All 42 groups matching the filter are already selected',
    );
    expect(screen.getByRole('button', { name: 'Deselect all' })).toBeEnabled();
  });

  it('explains an empty filter differently from a full selection', () => {
    render(bar(0, 0));

    expect(screen.getByRole('button', { name: 'Select all (0)' })).toHaveAccessibleDescription(
      'No groups match the current filter',
    );
    expect(screen.getByRole('button', { name: 'Export list' })).toHaveAccessibleDescription(
      'No groups match the current filter, so there is nothing to export',
    );
  });
});
