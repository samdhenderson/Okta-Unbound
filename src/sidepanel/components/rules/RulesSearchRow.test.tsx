import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RulesSearchRow from './RulesSearchRow';

function renderRow(over: Partial<React.ComponentProps<typeof RulesSearchRow>> = {}) {
  const props: React.ComponentProps<typeof RulesSearchRow> = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    filtersOpen: false,
    onToggleFilters: vi.fn(),
    activeFilterCount: 0,
    ...over,
  };
  return { props, ...render(<RulesSearchRow {...props} />) };
}

describe('RulesSearchRow search', () => {
  it('renders the current query and reports each keystroke', async () => {
    const uev = userEvent.setup();
    const { props } = renderRow({ searchQuery: 'Eng' });

    const field = screen.getByPlaceholderText(/Search rules/i);
    expect(field).toHaveValue('Eng');

    await uev.type(field, 'i');
    expect(props.onSearchChange).toHaveBeenCalledWith('Engi');
  });
});

describe('RulesSearchRow filter disclosure', () => {
  it('reports its pressed state and toggles', async () => {
    const uev = userEvent.setup();
    const { props } = renderRow();

    const toggle = screen.getByRole('button', { name: /Filters/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await uev.click(toggle);
    expect(props.onToggleFilters).toHaveBeenCalledTimes(1);
  });

  it('is pressed while the panel is open', () => {
    renderRow({ filtersOpen: true });
    expect(screen.getByRole('button', { name: /Filters/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('states the applied-filter count in its name, and says nothing at zero', () => {
    const { unmount } = renderRow({ activeFilterCount: 0 });
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();

    unmount();
    renderRow({ activeFilterCount: 2 });
    expect(screen.getByRole('button', { name: 'Filters, 2 applied' })).toBeInTheDocument();
  });
});
