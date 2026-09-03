import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BucketList from './BucketList';
import type { BucketState } from '@/shared/scheduler/types';

const NOW = 1_760_000_000_000;

function bucket(overrides: Partial<BucketState> & { bucket: string }): BucketState {
  return {
    limit: 600,
    remaining: 600,
    resetAt: NOW + 60_000,
    queued: 0,
    active: 0,
    planned: 0,
    gatedUntil: null,
    lastActiveAt: null,
    ...overrides,
  };
}

describe('BucketList', () => {
  it('renders nothing at all when no bucket is being tracked', () => {
    const { container } = render(<BucketList buckets={[]} lowThresholdPercent={10} now={NOW} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('gives every published bucket a lane, including one that has never settled anything', () => {
    render(
      <BucketList
        buckets={[
          bucket({ bucket: '/api/v1/groups' }),
          bucket({ bucket: '/api/v1/policies' }),
          bucket({ bucket: '/api/v1/meta', limit: null, remaining: null }),
        ]}
        lowThresholdPercent={10}
        now={NOW}
      />,
    );

    expect(screen.getByTestId('activity-bucket-/api/v1/groups')).toBeInTheDocument();
    expect(screen.getByTestId('activity-bucket-/api/v1/policies')).toBeInTheDocument();
    expect(screen.getByTestId('activity-bucket-/api/v1/meta')).toBeInTheDocument();
  });

  it('keeps the lane of a bucket that has just gone quiet', () => {
    render(
      <BucketList
        buckets={[bucket({ bucket: '/api/v1/users', lastActiveAt: NOW - 4_000 })]}
        lowThresholdPercent={10}
        now={NOW}
      />,
    );

    expect(screen.getByTestId('activity-bucket-/api/v1/users')).toHaveAttribute(
      'data-state',
      'at-rest',
    );
  });

  it('summarises nothing away', () => {
    render(
      <BucketList
        buckets={[
          bucket({ bucket: '/api/v1/users', queued: 5 }),
          bucket({ bucket: '/api/v1/groups', queued: 4 }),
          bucket({ bucket: '/api/v1/apps', queued: 3 }),
          bucket({ bucket: '/api/v1/zones', queued: 2 }),
          bucket({ bucket: '/api/v1/policies', queued: 1 }),
          bucket({ bucket: '/api/v1/devices' }),
          bucket({ bucket: '/api/v1/idps' }),
        ]}
        lowThresholdPercent={10}
        now={NOW}
      />,
    );

    expect(screen.getAllByTestId(/^activity-bucket-\/api/)).toHaveLength(7);
    expect(screen.queryByTestId('activity-buckets-quiet')).not.toBeInTheDocument();
  });

  it("keeps the scheduler's pressure order rather than re-sorting", () => {
    render(
      <BucketList
        buckets={[
          bucket({ bucket: '/api/v1/zones', queued: 1 }),
          bucket({ bucket: '/api/v1/apps', queued: 1 }),
        ]}
        lowThresholdPercent={10}
        now={NOW}
      />,
    );

    const rows = screen.getAllByTestId(/^activity-bucket-\/api/);
    expect(rows.map((row) => row.getAttribute('data-testid'))).toEqual([
      'activity-bucket-/api/v1/zones',
      'activity-bucket-/api/v1/apps',
    ]);
  });

  it('keys the lane vocabulary once, beneath the lanes', () => {
    render(
      <BucketList
        buckets={[bucket({ bucket: '/api/v1/users', active: 2 })]}
        lowThresholdPercent={10}
        now={NOW}
      />,
    );

    const legend = screen.getByTestId('activity-rack-legend');
    for (const term of ['running', 'queued', 'budget remaining', 'cooling down', 'at rest']) {
      expect(legend).toHaveTextContent(term);
    }
  });
});
