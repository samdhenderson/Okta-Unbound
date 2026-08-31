import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ActivityBarView from './ActivityBarView';
import type { ActivityView } from '../hooks/useActivityBar';
import type { PlanSummary } from '@/shared/scheduler/plan';

const FIXED_NOW = 1_760_000_000_000;

function idleView(overrides: Partial<ActivityView> = {}): ActivityView {
  return {
    statusLabel: 'Ready',
    statusColorVar: 'var(--color-success)',
    busy: false,
    operationActive: false,
    operationName: undefined,
    message: undefined,
    current: 0,
    total: 0,
    percentage: 0,
    elapsedLabel: undefined,
    etaLabel: undefined,
    apiCalls: undefined,
    queueLength: 0,
    activeRequests: 0,
    rateLimit: { remaining: 600, limit: 600, low: false },
    cooldownLabel: undefined,
    processed: 0,
    failed: 0,
    opCompleted: 0,
    opActive: 0,
    opFailed: 0,
    isCancelling: false,
    canCancel: false,
    buckets: [],
    lowThresholdPercent: 10,
    operations: [],
    now: FIXED_NOW,
    ...overrides,
  };
}

const renderView = (view: ActivityView, onCancel = vi.fn()) => {
  render(<ActivityBarView view={view} onCancel={onCancel} />);
  return { onCancel };
};

describe('ActivityBarView', () => {
  it('renders a single slim bar when idle: status + rate limit, no operation', () => {
    renderView(idleView());
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByTestId('activity-rate-limit')).toHaveTextContent('600/600');
    expect(screen.queryByTestId('activity-operation-name')).not.toBeInTheDocument();
  });

  it('keeps the metric slots and action area mounted across idle → active (no reflow)', () => {
    const { unmount } = render(<ActivityBarView view={idleView()} onCancel={vi.fn()} />);
    for (const id of ['activity-queue', 'activity-active', 'activity-rate-limit', 'activity-eta']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
    expect(screen.getByTestId('activity-actions')).toBeInTheDocument();
    unmount();

    render(
      <ActivityBarView
        view={idleView({
          operationActive: true,
          operationName: 'Removing users',
          busy: true,
          current: 3,
          total: 10,
          percentage: 30,
          queueLength: 4,
          activeRequests: 2,
          canCancel: true,
        })}
        onCancel={vi.fn()}
      />,
    );
    for (const id of ['activity-queue', 'activity-active', 'activity-rate-limit', 'activity-eta']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
    expect(screen.getByTestId('activity-actions')).toBeInTheDocument();
  });

  it('shows operation name, progress counter and ETA when an operation is active', () => {
    renderView(
      idleView({
        operationActive: true,
        operationName: 'Exporting members',
        busy: true,
        current: 4,
        total: 20,
        percentage: 20,
        elapsedLabel: '0:12',
        etaLabel: '~0:48 left',
        apiCalls: 4,
      }),
    );
    expect(screen.getByTestId('activity-operation-name')).toHaveTextContent('Exporting members');
    expect(screen.getByTestId('activity-progress-counter')).toHaveTextContent('4 / 20');
    expect(screen.getByTestId('activity-eta')).toHaveTextContent('0:48');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
  });

  it('shows the operation breakdown (done / active / failed) while running', () => {
    renderView(
      idleView({
        operationActive: true,
        operationName: 'Removing deprovisioned users',
        busy: true,
        current: 20,
        total: 30,
        percentage: 67,
        opCompleted: 18,
        opActive: 5,
        opFailed: 2,
      }),
    );
    const breakdown = screen.getByTestId('activity-op-breakdown');
    expect(breakdown).toHaveTextContent('18 done');
    expect(breakdown).toHaveTextContent('5 active');
    expect(breakdown).toHaveTextContent('2 failed');
  });

  it('omits the operation breakdown when idle', () => {
    renderView(idleView());
    expect(screen.queryByTestId('activity-op-breakdown')).not.toBeInTheDocument();
  });

  it('shows queue and active counts when present', () => {
    renderView(idleView({ queueLength: 7, activeRequests: 3 }));
    expect(screen.getByTestId('activity-queue')).toHaveTextContent('7');
    expect(screen.getByTestId('activity-active')).toHaveTextContent('3');
  });

  it('shows a cooldown countdown when cooling down', () => {
    renderView(idleView({ statusLabel: 'Cooldown', cooldownLabel: '12s' }));
    expect(screen.getByTestId('activity-eta')).toHaveTextContent('12s');
  });

  it('flags a low rate-limit budget for the user', () => {
    renderView(idleView({ rateLimit: { remaining: 20, limit: 600, low: true } }));
    expect(screen.getByTestId('activity-rate-limit')).toHaveAttribute('data-low', 'true');
  });

  it('enables Cancel and fires onCancel when there is work to cancel', () => {
    const { onCancel } = renderView(idleView({ queueLength: 5, canCancel: true }));
    const cancel = screen.getByRole('button', { name: /cancel/i });
    expect(cancel).toBeEnabled();
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables Cancel when there is nothing to cancel', () => {
    renderView(idleView({ canCancel: false }));
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('reflects the cancelling state on the action', () => {
    renderView(idleView({ operationActive: true, canCancel: true, isCancelling: true }));
    const actions = screen.getByTestId('activity-actions');
    expect(within(actions).getByRole('button')).toBeDisabled();
    expect(actions).toHaveTextContent(/cancel/i);
  });

  it('does not offer the collapse toggle when not collapsible', () => {
    render(<ActivityBarView view={idleView()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /activity stats/i })).not.toBeInTheDocument();
  });

  describe('condensed layout (narrow panel)', () => {
    it('shows only status, rate and the processed tally — full metric slots hidden', () => {
      render(
        <ActivityBarView
          view={idleView({
            rateLimit: { remaining: 480, limit: 600, low: false },
            processed: 118,
            failed: 3,
          })}
          onCancel={vi.fn()}
          collapsible
          collapsed
          onToggleCollapse={vi.fn()}
        />,
      );
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByTestId('activity-rate-compact')).toHaveTextContent('480/600');
      expect(screen.getByTestId('activity-processed-compact')).toHaveTextContent('118');
      expect(screen.getByTestId('activity-processed-compact')).toHaveTextContent('3 failed');
      expect(screen.queryByTestId('activity-queue')).not.toBeInTheDocument();
      expect(screen.queryByTestId('activity-active')).not.toBeInTheDocument();
      expect(screen.queryByTestId('activity-eta')).not.toBeInTheDocument();
      expect(screen.queryByTestId('activity-op-breakdown')).not.toBeInTheDocument();
    });

    it('shows live progress instead of the tally while an operation runs', () => {
      render(
        <ActivityBarView
          view={idleView({
            operationActive: true,
            operationName: 'Removing members',
            busy: true,
            current: 42,
            total: 120,
            opFailed: 1,
          })}
          onCancel={vi.fn()}
          collapsible
          collapsed
          onToggleCollapse={vi.fn()}
        />,
      );
      expect(screen.getByTestId('activity-operation-name')).toHaveTextContent('Removing members');
      expect(screen.getByTestId('activity-progress-compact')).toHaveTextContent('42/120');
      expect(screen.getByTestId('activity-progress-compact')).toHaveTextContent('1 failed');
      expect(screen.queryByTestId('activity-processed-compact')).not.toBeInTheDocument();
    });

    it('keeps Cancel available in the condensed layout', () => {
      const onCancel = vi.fn();
      render(
        <ActivityBarView
          view={idleView({ queueLength: 5, canCancel: true })}
          onCancel={onCancel}
          collapsible
          collapsed
          onToggleCollapse={vi.fn()}
        />,
      );
      const actions = screen.getByTestId('activity-actions');
      fireEvent.click(within(actions).getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('fires onToggleCollapse when the expand chevron is clicked', () => {
      const onToggleCollapse = vi.fn();
      render(
        <ActivityBarView
          view={idleView()}
          onCancel={vi.fn()}
          collapsible
          collapsed
          onToggleCollapse={onToggleCollapse}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /show all activity stats/i }));
      expect(onToggleCollapse).toHaveBeenCalledTimes(1);
    });

    it('offers a re-collapse toggle and the full stats when narrow but expanded', () => {
      render(
        <ActivityBarView
          view={idleView({ queueLength: 7, activeRequests: 3 })}
          onCancel={vi.fn()}
          collapsible
          collapsed={false}
          onToggleCollapse={vi.fn()}
        />,
      );
      expect(screen.getByTestId('activity-queue')).toHaveTextContent('7');
      expect(screen.getByTestId('activity-active')).toHaveTextContent('3');
      expect(
        screen.getByRole('button', { name: /hide extra activity stats/i }),
      ).toBeInTheDocument();
    });
  });
});

describe('per-bucket headroom', () => {
  const NOW = FIXED_NOW;

  function bucket(overrides: { bucket: string } & Partial<ActivityView['buckets'][number]>) {
    return {
      limit: 600,
      remaining: 600,
      resetAt: NOW + 60_000,
      queued: 0,
      active: 0,
      planned: 0,
      gatedUntil: null,
      ...overrides,
    };
  }

  it('adds no bucket section at all when the scheduler has seen nothing', () => {
    render(<ActivityBarView view={idleView()} onCancel={vi.fn()} />);

    expect(screen.queryByTestId('activity-buckets')).not.toBeInTheDocument();
  });

  it('collapses quiet buckets to a single line rather than a row each', () => {
    render(
      <ActivityBarView
        view={idleView({
          buckets: [
            bucket({ bucket: '/api/v1/groups' }),
            bucket({ bucket: '/api/v1/policies' }),
            bucket({ bucket: '/api/v1/meta', limit: null, remaining: null }),
          ],
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryAllByTestId(/^activity-bucket-/)).toHaveLength(0);
    expect(screen.getByTestId('activity-buckets-quiet')).toHaveTextContent('3 buckets idle');
  });

  it('shows the planned work against a bucket before any of it is sent', () => {
    render(
      <ActivityBarView
        view={idleView({
          buckets: [bucket({ bucket: '/api/v1/users', planned: 812 })],
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByTestId('activity-bucket-/api/v1/users')).toHaveTextContent('812 planned');
  });

  it('surfaces the gated bucket-s own countdown, not just the global one', () => {
    render(
      <ActivityBarView
        view={idleView({
          buckets: [
            bucket({ bucket: '/api/v1/users', remaining: 18, gatedUntil: NOW + 24_000 }),
            bucket({ bucket: '/api/v1/groups' }),
          ],
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByTestId('activity-bucket-cooldown-/api/v1/users')).toHaveTextContent('24s');
    expect(screen.getByTestId('activity-buckets-quiet')).toHaveTextContent('groups');
  });

  it('colours low headroom at the org threshold the view carries', () => {
    const buckets = [bucket({ bucket: '/api/v1/users', limit: 100, remaining: 30, queued: 1 })];

    const { unmount } = render(
      <ActivityBarView view={idleView({ buckets, lowThresholdPercent: 10 })} onCancel={vi.fn()} />,
    );
    expect(screen.getByTestId('activity-bucket-/api/v1/users')).not.toHaveAttribute('data-low');
    unmount();

    render(
      <ActivityBarView view={idleView({ buckets, lowThresholdPercent: 35 })} onCancel={vi.fn()} />,
    );
    expect(screen.getByTestId('activity-bucket-/api/v1/users')).toHaveAttribute('data-low', 'true');
  });

  it('is absent from the condensed layout, which stays a single line', () => {
    render(
      <ActivityBarView
        view={idleView({ buckets: [bucket({ bucket: '/api/v1/users', planned: 40 })] })}
        onCancel={vi.fn()}
        collapsible
        collapsed
      />,
    );

    expect(screen.queryByTestId('activity-buckets')).not.toBeInTheDocument();
  });
});

describe('ActivityBarView operation ledger', () => {
  function bucket(overrides: { bucket: string } & Partial<ActivityView['buckets'][number]>) {
    return {
      limit: 600,
      remaining: 600,
      resetAt: FIXED_NOW + 60_000,
      queued: 0,
      active: 0,
      planned: 0,
      gatedUntil: null,
      ...overrides,
    };
  }

  function plan(overrides: { id: string; name: string } & Partial<PlanSummary>): PlanSummary {
    return {
      startedAt: FIXED_NOW,
      legs: [
        {
          id: 'leg',
          bucket: '/api/v1/users',
          method: 'GET',
          estimated: 50,
          spent: 0,
          remaining: 50,
          approximate: false,
        },
      ],
      spent: 0,
      estimated: 50,
      remaining: 50,
      approximate: false,
      ...overrides,
    };
  }

  it('adds no ledger section when nothing has declared work', () => {
    render(<ActivityBarView view={idleView()} onCancel={vi.fn()} />);

    expect(screen.queryByTestId('activity-operations')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-reset-timeline')).not.toBeInTheDocument();
  });

  it('lists each declared operation with its own stop control', () => {
    const onCancelOperation = vi.fn();
    render(
      <ActivityBarView
        view={idleView({
          operations: [
            plan({ id: 'export', name: 'Export all users', spent: 12 }),
            plan({ id: 'search', name: 'Search groups' }),
          ],
        })}
        onCancel={vi.fn()}
        onCancelOperation={onCancelOperation}
      />,
    );

    expect(screen.getByTestId('activity-operation-export')).toHaveTextContent('12 / 50');

    fireEvent.click(screen.getByRole('button', { name: 'Stop Export all users' }));
    expect(onCancelOperation).toHaveBeenCalledExactlyOnceWith('export');
  });

  it('renames the queue-wide Cancel once it would stop more than one thing', () => {
    const onCancel = vi.fn();
    const { unmount } = render(
      <ActivityBarView
        view={idleView({ operations: [plan({ id: 'export', name: 'Export all users' })] })}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    unmount();

    render(
      <ActivityBarView
        view={idleView({
          queueLength: 3,
          canCancel: true,
          operations: [
            plan({ id: 'export', name: 'Export all users' }),
            plan({ id: 'search', name: 'Search groups' }),
          ],
        })}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel all' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows the reset timeline only while a bucket is actually gated', () => {
    const { unmount } = render(
      <ActivityBarView
        view={idleView({ buckets: [bucket({ bucket: '/api/v1/users', queued: 4 })] })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('activity-reset-timeline')).not.toBeInTheDocument();
    unmount();

    render(
      <ActivityBarView
        view={idleView({
          buckets: [bucket({ bucket: '/api/v1/users', gatedUntil: FIXED_NOW + 24_000 })],
        })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByTestId('activity-reset-timeline')).toHaveTextContent('users in 24s');
  });

  it('keeps both sections out of the condensed layout', () => {
    render(
      <ActivityBarView
        view={idleView({
          operations: [plan({ id: 'export', name: 'Export all users' })],
          buckets: [bucket({ bucket: '/api/v1/users', gatedUntil: FIXED_NOW + 24_000 })],
        })}
        onCancel={vi.fn()}
        collapsible
        collapsed
      />,
    );

    expect(screen.queryByTestId('activity-operations')).not.toBeInTheDocument();
    expect(screen.queryByTestId('activity-reset-timeline')).not.toBeInTheDocument();
  });
});
