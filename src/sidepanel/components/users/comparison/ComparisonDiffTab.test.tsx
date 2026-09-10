import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparisonDiffTab from './ComparisonDiffTab';
import type { ParityRow } from './comparisonAnalytics';

const baseProps = {
  contextName: 'Alice Context',
  comparedName: 'Bob Compared',
  noun: 'group',
  emptyText: 'Neither user is in any groups.',
};

const row = (over: Partial<ParityRow> = {}): ParityRow => ({
  id: '00gFAKE1',
  label: 'VPN Access',
  inContext: false,
  inCompared: true,
  ...over,
});

const rowFor = (label: string): HTMLElement => {
  const li = screen.getByTitle(label).closest('li');
  if (!li) throw new Error(`no row for "${label}"`);
  return li;
};

describe('the row states the comparison', () => {
  it('marks a shared item with = and a difference with ≠', () => {
    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[
          row({ id: 'g1', label: 'Shared Group', inContext: true, inCompared: true }),
          row({ id: 'g2', label: 'Only Bob' }),
        ]}
      />,
    );

    return userEvent.click(screen.getByRole('button', { name: /^All/ })).then(() => {
      expect(within(rowFor('Shared Group')).getByText('=')).toBeInTheDocument();
      expect(within(rowFor('Only Bob')).getByText('≠')).toBeInTheDocument();
    });
  });

  it('gives the marker a label and keeps it out of the tab order', () => {
    render(<ComparisonDiffTab {...baseProps} rows={[row()]} />);

    const marker = within(rowFor('VPN Access')).getByRole('img', {
      name: /only one user has this/i,
    });
    expect(marker.tagName).toBe('SPAN');
    expect(marker).not.toHaveAttribute('tabindex');
  });

  it('offers the action on the side that LACKS the item, in each direction', () => {
    const toContext = vi.fn((r: ParityRow) => (
      <button type="button">Add to Alice {r.label}</button>
    ));
    const toCompared = vi.fn((r: ParityRow) => <button type="button">Add to Bob {r.label}</button>);

    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[
          row({ id: 'g1', label: 'Only Bob', inContext: false, inCompared: true }),
          row({ id: 'g2', label: 'Only Alice', inContext: true, inCompared: false }),
        ]}
        renderContextAction={toContext}
        renderComparedAction={toCompared}
      />,
    );

    expect(
      within(rowFor('Only Bob')).getByRole('button', { name: 'Add to Alice Only Bob' }),
    ).toBeInTheDocument();
    expect(
      within(rowFor('Only Alice')).getByRole('button', { name: 'Add to Bob Only Alice' }),
    ).toBeInTheDocument();
  });

  it('states a non-answer rather than a button that would fail', () => {
    render(<ComparisonDiffTab {...baseProps} rows={[row()]} renderContextAction={() => null} />);

    expect(within(rowFor('VPN Access')).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTitle('Alice Context does not have this')).toBeInTheDocument();
  });

  it('NAMES BOTH sides, so neither has to be inferred from position', () => {
    render(<ComparisonDiffTab {...baseProps} rows={[row()]} />);

    const li = rowFor('VPN Access');
    expect(within(li).getByText('Bob Compared')).toBeInTheDocument();
    expect(within(li).getByText('Alice Context')).toBeInTheDocument();
  });

  it('hands each cell the name of the user who would RECEIVE the item', () => {
    const toContext = vi.fn((_row: ParityRow, _recipientName: string) => null);
    const toCompared = vi.fn((_row: ParityRow, _recipientName: string) => null);

    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[
          row({ id: 'g1', label: 'Only Bob', inContext: false, inCompared: true }),
          row({ id: 'g2', label: 'Only Alice', inContext: true, inCompared: false }),
        ]}
        renderContextAction={toContext}
        renderComparedAction={toCompared}
      />,
    );

    expect(toContext.mock.calls[0][1]).toBe('Alice Context');
    expect(toCompared.mock.calls[0][1]).toBe('Bob Compared');
  });
});

describe('filtering and search', () => {
  const rows = [
    row({ id: 'g1', label: 'Only Bob' }),
    row({ id: 'g2', label: 'Shared Group', inContext: true, inCompared: true }),
    row({ id: 'g3', label: 'Also Shared', inContext: true, inCompared: true }),
  ];

  it('opens on the differences, so the actionable rows are not buried', () => {
    render(<ComparisonDiffTab {...baseProps} rows={rows} />);

    expect(screen.getByTitle('Only Bob')).toBeInTheDocument();
    expect(screen.queryByTitle('Shared Group')).not.toBeInTheDocument();
  });

  it('counts each filter so the split is visible without switching', () => {
    render(<ComparisonDiffTab {...baseProps} rows={rows} />);

    expect(screen.getByRole('button', { name: /Differences 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shared 2/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All 3/ })).toBeInTheDocument();
  });

  it('leads with All, then Differences, then Shared — widest selection first', () => {
    render(<ComparisonDiffTab {...baseProps} rows={rows} />);

    const pills = screen.getAllByRole('button', { name: /^(All|Differences|Shared) \d+$/ });
    expect(pills.map((pill) => pill.textContent)).toEqual(['All 3', 'Differences 1', 'Shared 2']);
  });

  it('shows the shared rows on demand', async () => {
    render(<ComparisonDiffTab {...baseProps} rows={rows} />);

    await userEvent.click(screen.getByRole('button', { name: /^Shared/ }));
    expect(screen.getByTitle('Shared Group')).toBeInTheDocument();
    expect(screen.queryByTitle('Only Bob')).not.toBeInTheDocument();
  });

  it('filters by name within the current selection', async () => {
    render(<ComparisonDiffTab {...baseProps} rows={rows} />);

    await userEvent.click(screen.getByRole('button', { name: /^All/ }));
    await userEvent.type(screen.getByLabelText('Filter groups by name'), 'shared');

    expect(screen.getByTitle('Shared Group')).toBeInTheDocument();
    expect(screen.getByTitle('Also Shared')).toBeInTheDocument();
    expect(screen.queryByTitle('Only Bob')).not.toBeInTheDocument();
  });

  it('distinguishes "nothing here" from "nothing matches"', async () => {
    const { rerender } = render(<ComparisonDiffTab {...baseProps} rows={[]} />);
    expect(screen.getByText('Neither user is in any groups.')).toBeInTheDocument();

    rerender(<ComparisonDiffTab {...baseProps} rows={rows} />);
    await userEvent.type(screen.getByLabelText('Filter groups by name'), 'zzz');
    expect(screen.getByText('No groups match this filter.')).toBeInTheDocument();
  });
});

describe('carried forward from the bucket suite', () => {
  it('never lets a long detail displace the row action', () => {
    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[row()]}
        renderContextAction={() => <button type="button">Add</button>}
        renderMeta={() => (
          <span>Added by rule: Contractors → VPN Access, Remote Access Baseline</span>
        )}
      />,
    );

    const li = rowFor('VPN Access');
    const action = within(li).getByRole('button', { name: 'Add' });
    const detail = within(li).getByText(/Added by rule/);

    const column = within(li).getByTitle('VPN Access').parentElement;
    expect(column).toContainElement(detail);
    expect(column).not.toContainElement(action);
  });

  it('stacks the detail in a column that does not stretch it across the row', () => {
    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[row()]}
        renderMeta={() => <span>Managed by app</span>}
      />,
    );

    const li = rowFor('VPN Access');
    const column = within(li).getByTitle('VPN Access').parentElement;
    expect(column).toContainElement(within(li).getByText('Managed by app'));
    expect(column?.className).toContain('items-start');
    expect(column?.className).toContain('flex-col');
  });

  it('lets the list grow instead of capping it at a fixed height', () => {
    render(
      <ComparisonDiffTab
        {...baseProps}
        rows={[row({ id: 'g1', label: 'A' }), row({ id: 'g2', label: 'B' })]}
      />,
    );

    const list = rowFor('A').closest('ul');
    expect(list?.className).not.toContain('max-h-44');
    expect(list?.className).toContain('flex-1');
  });
});
