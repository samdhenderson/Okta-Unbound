import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OktaUser } from '../../../shared/types';
import MemberList from './MemberList';

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

function member(n: number): OktaUser {
  return {
    id: `00uFAKE00000000000${n}`,
    status: 'ACTIVE',
    profile: {
      firstName: 'Ada',
      lastName: `Lovelace ${n}`,
      email: `ada${n}@example.com`,
      login: `ada${n}@example.com`,
    },
  } as OktaUser;
}

const members = Array.from({ length: 12 }, (_, i) => member(i));

const baseProps = {
  mfaResults: null,
  mfaScanned: false,
  visibleCount: 12,
  onLoadMore: vi.fn(),
};

describe('MemberList', () => {
  it('renders the visible rows inside one rise-in-stagger wrapper', () => {
    const { container } = render(<MemberList {...baseProps} members={members} />);

    const stagger = container.querySelector('.rise-in-stagger');
    expect(stagger).not.toBeNull();
    expect(stagger?.children).toHaveLength(members.length);
    expect(screen.getByText('Ada Lovelace 0')).toBeInTheDocument();
  });

  it('keeps the paging sentinel out of the stagger wrapper', () => {
    const { container } = render(<MemberList {...baseProps} members={members} visibleCount={5} />);

    const stagger = container.querySelector('.rise-in-stagger');
    expect(stagger?.children).toHaveLength(5);
    expect(stagger?.querySelector('[aria-hidden="true"].h-px')).toBeNull();
  });

  it('swaps the rows for skeleton placeholders while reloading', () => {
    render(<MemberList {...baseProps} members={members} loading />);

    expect(screen.getByRole('status', { name: 'Reloading members' })).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace 0')).not.toBeInTheDocument();
  });

  it('shows the no-match message for an empty list once loading has finished', () => {
    render(<MemberList {...baseProps} members={[]} visibleCount={12} />);

    expect(screen.getByText(/No members match/)).toBeInTheDocument();
  });

  it('does not show the no-match message while an empty list is reloading', () => {
    render(<MemberList {...baseProps} members={[]} visibleCount={12} loading />);

    expect(screen.queryByText(/No members match/)).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Reloading members' })).toBeInTheDocument();
  });
});
