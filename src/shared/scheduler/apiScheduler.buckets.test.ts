import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiScheduler } from './apiScheduler';

let scheduler: ApiScheduler;
const sendMessage = vi.fn();

function dispatchedEndpoints(): string[] {
  return sendMessage.mock.calls
    .filter((c) => c[1]?.action === 'makeApiRequest')
    .map((c) => c[1].endpoint as string);
}

function rateLimitHeaders(remaining: number, limit = 100): Record<string, string> {
  return {
    'x-rate-limit-limit': String(limit),
    'x-rate-limit-remaining': String(remaining),
    'x-rate-limit-reset': String(Math.floor(Date.now() / 1000) + 60),
  };
}

function respondPerBucket(budgets: Record<string, number>) {
  return vi.fn(async (_tabId: number, msg: { endpoint: string }) => {
    const prefix = Object.keys(budgets).find((key) => msg.endpoint.startsWith(key));
    return {
      success: true,
      data: msg.endpoint,
      headers: prefix === undefined ? {} : rateLimitHeaders(budgets[prefix]),
    };
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (chrome as unknown as { tabs: { sendMessage: typeof sendMessage } }).tabs = {
    sendMessage,
  };
});

afterEach(() => {
  scheduler?.stop();
});

describe('ApiScheduler per-bucket gating', () => {
  it('lets a healthy bucket through while an exhausted one cools down', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 2, '/api/v1/groups': 95 }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/groups?limit=200', 'GET', undefined, 1, 'high');
    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();

    let appsResolved = false;
    void scheduler
      .scheduleRequest('/api/v1/apps/0oaFAKE1/groups?limit=200', 'GET', undefined, 1, 'normal')
      .then(() => {
        appsResolved = true;
      })
      .catch(() => {});

    const groups = await scheduler.scheduleRequest(
      '/api/v1/groups/00gFAKE1/users?limit=200',
      'GET',
      undefined,
      1,
      'normal',
    );

    await new Promise((r) => setTimeout(r, 200));

    expect(groups.data).toBe('/api/v1/groups/00gFAKE1/users?limit=200');
    expect(appsResolved).toBe(false);
    expect(dispatchedEndpoints()).toEqual([
      '/api/v1/groups?limit=200',
      '/api/v1/apps?limit=200',
      '/api/v1/groups/00gFAKE1/users?limit=200',
    ]);
  });

  it('skips past a gated request rather than stopping the drain at it', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 2, '/api/v1/groups': 95 }));
    scheduler = new ApiScheduler({ maxConcurrent: 1, maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/groups?limit=200', 'GET', undefined, 1, 'high');
    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');

    void scheduler
      .scheduleRequest('/api/v1/apps/0oaFAKE1/users?limit=200', 'GET', undefined, 1, 'high')
      .catch(() => {});
    const groups = await scheduler.scheduleRequest(
      '/api/v1/groups/00gFAKE1/users?limit=200',
      'GET',
      undefined,
      1,
      'low',
    );

    expect(groups.data).toBe('/api/v1/groups/00gFAKE1/users?limit=200');
    expect(dispatchedEndpoints()).not.toContain('/api/v1/apps/0oaFAKE1/users?limit=200');
  });

  it('still stops everything when the global backstop is what tripped', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 2 }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();

    let usersResolved = false;
    void scheduler
      .scheduleRequest('/api/v1/users?limit=200', 'GET', undefined, 1, 'normal')
      .then(() => {
        usersResolved = true;
      })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 200));

    expect(usersResolved).toBe(false);
    expect(dispatchedEndpoints()).toEqual(['/api/v1/apps?limit=200']);
  });

  it('reports the latest gate end, so the countdown never promises a clear queue early', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 2, '/api/v1/groups': 95 }));
    scheduler = new ApiScheduler({ maxRetries: 0, cooldownDuration: 30_000 });

    await scheduler.scheduleRequest('/api/v1/groups?limit=200', 'GET', undefined, 1, 'high');
    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');

    const { cooldownEndsAt } = scheduler.getState();
    expect(cooldownEndsAt).toBeTruthy();
    expect(cooldownEndsAt! - Date.now()).toBeLessThanOrEqual(30_000);
    expect(cooldownEndsAt! - Date.now()).toBeGreaterThan(0);
  });

  it('cools down at the threshold the org set, not the configured default', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 12 }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeNull();

    scheduler.setMinRemainingThreshold(15);

    let appsResolved = false;
    void scheduler
      .scheduleRequest('/api/v1/apps/0oaFAKE1/users?limit=200', 'GET', undefined, 1, 'normal')
      .then(() => {
        appsResolved = true;
      })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 200));

    expect(appsResolved).toBe(false);
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();
  });

  it('ignores a threshold outside 0-100 rather than stalling forever', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 12 }));
    scheduler = new ApiScheduler({ maxRetries: 0 });

    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    scheduler.setMinRemainingThreshold(140);

    const result = await scheduler.scheduleRequest(
      '/api/v1/apps/0oaFAKE1/users?limit=200',
      'GET',
      undefined,
      1,
      'normal',
    );
    expect(result.success).toBe(true);
  });

  it('reports no cooldown once every gate has expired', async () => {
    sendMessage.mockImplementation(respondPerBucket({ '/api/v1/apps': 2 }));
    scheduler = new ApiScheduler({ maxRetries: 0, cooldownDuration: 60 });

    await scheduler.scheduleRequest('/api/v1/apps?limit=200', 'GET', undefined, 1, 'high');
    expect(scheduler.getState().cooldownEndsAt).toBeTruthy();

    await new Promise((r) => setTimeout(r, 150));

    expect(scheduler.getState().cooldownEndsAt).toBeNull();
  });
});
