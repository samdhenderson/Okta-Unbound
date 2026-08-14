import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('localizes a numeric value with thousands separators', () => {
    render(<StatCard title="Total Members" value={1234567} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders a string value verbatim', () => {
    render(<StatCard title="Status" value="DEPROVISIONED" />);

    expect(screen.getByText('DEPROVISIONED')).toBeInTheDocument();
  });

  it('renders the value with tabular figures so counting cannot change its width', () => {
    render(<StatCard title="Total Members" value={42} />);

    expect(screen.getByText('42')).toHaveClass('tabular-nums');
  });

  describe('countUp', () => {
    it('shows the final figure on the first render when motion is unavailable', () => {
      render(<StatCard title="Total Members" value={4820} countUp />);

      expect(screen.getByText('4,820')).toBeInTheDocument();
    });

    it('lands on a changed figure in the same render, not a commit later', () => {
      const { rerender } = render(<StatCard title="Total Rules" value={0} countUp />);
      expect(screen.getByText('0')).toBeInTheDocument();

      rerender(<StatCard title="Total Rules" value={3} countUp />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('is ignored for a string value', () => {
      render(<StatCard title="Assigned Users" value="—" countUp />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });
});
