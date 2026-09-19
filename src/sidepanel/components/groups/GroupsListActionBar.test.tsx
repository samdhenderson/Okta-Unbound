import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import GroupsListActionBar from './GroupsListActionBar';

const handlers = {
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

const registerLabels = (): string[] =>
  within(register())
    .queryAllByRole('button')
    .map((b) => b.textContent);

describe('the selection register shares its row rather than stacking a new one', () => {
  it('adds no row to the band when the first group is ticked', () => {
    const { rerender } = render(bar(0));

    const before = band().children.length;
    const registerBefore = register();
    expect(registerBefore).toBeInTheDocument();
    expect(registerLabels()).toEqual([]);

    rerender(bar(2));

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
    expect(registerLabels()).toEqual([]);

    rerender(bar(3));

    expect(registerLabels()).toEqual(['Compare']);
  });
});

describe('position one of the register is never a verb that leaves the rung', () => {
  it.each([0, 1, 2, 3, 6, 42])('leads with no export at %i selected', (selected) => {
    render(bar(selected));

    const first = within(register()).queryAllByRole('button')[0];
    expect({ selected, first: first?.textContent ?? null }).toEqual({
      selected,
      first: selected >= 2 && selected <= 5 ? 'Compare' : null,
    });
  });

  it('never moves a verb under the pointer as rows are ticked', () => {
    const { rerender } = render(bar(0));

    for (const selected of [2, 3, 6, 42]) {
      rerender(bar(selected));
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect({ selected, leads: registerLabels()[0] ?? null }).toEqual({
        selected,
        leads: selected <= 5 ? 'Compare' : null,
      });
    }
  });
});

describe('a disabled control says why', () => {
  it('explains an empty filter rather than vanishing', () => {
    render(bar(0, 0));

    const exportList = screen.getByRole('button', { name: 'Export list' });
    expect(exportList).toBeDisabled();
    expect(exportList).toHaveAccessibleDescription(
      'No groups match the current filter, so there is nothing to export',
    );
  });

  it('keeps Export list wired and enabled once the filter matches rows', () => {
    render(bar(0));

    const exportList = screen.getByRole('button', { name: 'Export list' });
    expect(exportList).toBeEnabled();
    expect(exportList).toHaveAccessibleDescription('Export the current groups list as CSV');
  });
});

describe('the strip states no counts', () => {
  it.each([0, 1, 3, 42])('writes no digit in any label at %i selected', (selected) => {
    render(bar(selected));

    for (const button of screen.getAllByRole('button')) {
      expect({ selected, label: button.textContent }).toEqual({
        selected,
        label: expect.not.stringMatching(/\d/) as unknown as string,
      });
    }
  });

  it('keeps the count in the title, where it describes rather than labels', () => {
    render(bar(3));

    expect(screen.getByRole('button', { name: 'Compare' })).toHaveAccessibleDescription(
      'Compare the 3 selected groups',
    );
    expect(screen.getByRole('button', { name: 'Export' })).toHaveAccessibleDescription(
      'Export the 3 selected groups',
    );
  });

  it('writes the export title in the singular for one group', () => {
    render(bar(1));

    expect(screen.getByRole('button', { name: 'Export' })).toHaveAccessibleDescription(
      'Export the 1 selected group',
    );
  });
});
