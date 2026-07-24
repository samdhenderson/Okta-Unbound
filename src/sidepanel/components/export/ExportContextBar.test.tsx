import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportContextBar from './ExportContextBar';
import type { EntityContextOption } from '../../export/types';

const noSearch = vi.fn(async (): Promise<EntityContextOption[]> => []);

describe('ExportContextBar initialSelected', () => {
  it('renders a pre-seeded context as the chosen entity (deep-link pre-scope)', () => {
    render(
      <ExportContextBar
        label="Group"
        placeholder="Search groups…"
        search={noSearch}
        onSelect={vi.fn()}
        initialSelected={{ id: '00gABC', label: 'Engineering' }}
      />,
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(noSearch).not.toHaveBeenCalled();
  });

  it('clearing the seeded selection reports null upward', async () => {
    const onSelect = vi.fn();
    render(
      <ExportContextBar
        label="Group"
        placeholder="Search groups…"
        search={noSearch}
        onSelect={onSelect}
        initialSelected={{ id: '00gABC', label: 'Engineering' }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('renders no selection when nothing is seeded', () => {
    render(
      <ExportContextBar
        label="Group"
        placeholder="Search groups…"
        search={noSearch}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
  });
});
