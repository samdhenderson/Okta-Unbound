import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleMakeApiRequest, isSameOriginPath } from './apiRequest';
import { NO_HTTP_STATUS } from '../shared/scheduler/requestResult';
import { RateLimitDetector } from '../shared/scheduler/rateLimitDetector';
import { nextPageUrl } from '../shared/utils/oktaPagination';
import { readTotalCount } from '../shared/snapshot/syncMeta';

const fetchMock = vi.fn();

const res = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(document, 'getElementById').mockReturnValue(null);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('isSameOriginPath', () => {
  it('accepts a single-slash same-origin path and rejects the rest', () => {
    expect(isSameOriginPath('/api/v1/apps')).toBe(true);
    expect(isSameOriginPath('//evil.example.com/api')).toBe(false);
    expect(isSameOriginPath('https://evil.example.com/api')).toBe(false);
    expect(isSameOriginPath('api/v1/apps')).toBe(false);
  });
});

describe('handleMakeApiRequest failure statuses', () => {
  it('reports the real HTTP status when Okta answered', async () => {
    fetchMock.mockResolvedValue(res({ errorSummary: 'Too many requests' }, 429));

    const result = await handleMakeApiRequest('/api/v1/apps/0oaFAKE1');

    expect(result).toMatchObject({ success: false, status: 429 });
  });

  it('reports 401 as itself, so the session-expiry predicate can see it', async () => {
    fetchMock.mockResolvedValue(res({ errorSummary: 'Invalid session' }, 401));

    const result = await handleMakeApiRequest('/api/v1/apps/0oaFAKE1');

    expect(result).toMatchObject({ success: false, status: 401 });
  });

  it('uses the sentinel when fetch throws — a transport failure has no status', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await handleMakeApiRequest('/api/v1/apps/0oaFAKE1');

    expect(result).toEqual({
      success: false,
      error: 'Failed to fetch',
      status: NO_HTTP_STATUS,
    });
  });

  it('uses the sentinel when the same-origin guard rejects the endpoint', async () => {
    const result = await handleMakeApiRequest('//evil.example.com/api/v1/apps');

    expect(result).toEqual({
      success: false,
      error: 'Rejected request: endpoint must be a same-origin path',
      status: NO_HTTP_STATUS,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a path that resolves somewhere other than where it reads', async () => {
    const result = await handleMakeApiRequest('/api/v1/../admin/users');

    expect(result).toEqual({
      success: false,
      error: 'Rejected request: endpoint path is not normalized',
      status: NO_HTTP_STATUS,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('still sends a query string carrying spaces and quotes', async () => {
    fetchMock.mockResolvedValue(res({ ok: true }));

    await handleMakeApiRequest('/api/v1/users?search=status eq "ACTIVE"');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users?search=status eq "ACTIVE"'),
      expect.anything(),
    );
  });

  it('uses the sentinel when the method allow-list rejects the request', async () => {
    const result = await handleMakeApiRequest('/api/v1/apps', 'TRACE');

    expect(result).toEqual({
      success: false,
      error: 'Rejected request: unsupported HTTP method',
      status: NO_HTTP_STATUS,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never invents a status on the success path', async () => {
    fetchMock.mockResolvedValue(res({ id: '0oaFAKE1' }, 200));

    const result = await handleMakeApiRequest('/api/v1/apps/0oaFAKE1');

    expect(result).toMatchObject({ success: true, status: 200, data: { id: '0oaFAKE1' } });
  });
});

describe('forwarded response headers (D-087)', () => {
  it('forwards ONLY the keys a consumer reads, dropping the rest of the bag', async () => {
    fetchMock.mockResolvedValue(
      res({ ok: true }, 200, {
        'X-Rate-Limit-Limit': '600',
        'X-Rate-Limit-Remaining': '99',
        'X-Rate-Limit-Reset': '1700000000',
        'X-Total-Count': '42',
        Link: '<https://example.okta.com/api/v1/apps?after=2>; rel="next"',
        'X-Okta-Request-Id': 'reqFAKE1',
        'X-Okta-Version': '2026.01.0',
        'Cache-Control': 'no-cache',
        Vary: 'Accept-Encoding',
      }),
    );

    const result = await handleMakeApiRequest('/api/v1/apps');

    expect(Object.keys(result.headers ?? {}).sort()).toEqual([
      'link',
      'x-rate-limit-limit',
      'x-rate-limit-remaining',
      'x-rate-limit-reset',
      'x-total-count',
    ]);
    expect(result.headers).not.toHaveProperty('content-type');
  });

  it('omits an absent allow-listed header rather than sending an empty string', async () => {
    fetchMock.mockResolvedValue(res({ ok: true }, 200, { 'X-Rate-Limit-Remaining': '99' }));

    const result = await handleMakeApiRequest('/api/v1/apps');

    expect(result.headers).toEqual({ 'x-rate-limit-remaining': '99' });
    expect(result.headers).not.toHaveProperty('x-total-count');
  });

  it('keeps the paginator working: the `link` header still resolves a next page', async () => {
    fetchMock.mockResolvedValue(
      res([{ id: '0oaFAKE1' }], 200, {
        Link: '<https://example.okta.com/api/v1/apps?after=0oaFAKE1&limit=200>; rel="next"',
      }),
    );

    const result = await handleMakeApiRequest('/api/v1/apps?limit=200');

    expect(nextPageUrl('/api/v1/apps?limit=200', result.headers?.link, 1)).toBe(
      '/api/v1/apps?after=0oaFAKE1&limit=200',
    );
  });

  it('keeps the count probe working: `x-total-count` still reads', async () => {
    fetchMock.mockResolvedValue(res([], 200, { 'X-Total-Count': '9814' }));

    const result = await handleMakeApiRequest('/api/v1/apps/0oaFAKE1/users?limit=1');

    expect(readTotalCount(result.headers)).toBe(9814);
  });
});

describe('handleMakeApiRequest rate-limit headers on a failure (D-064)', () => {
  const NOW_MS = 1_700_000_000_000;
  const NOW_SECONDS = Math.floor(NOW_MS / 1000);
  const RESET_SECONDS = NOW_SECONDS + 60;
  const ENDPOINT = '/api/v1/groups/00gFAKE1/users';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('a 429 reaches RateLimitDetector with its X-Rate-Limit-* headers intact', async () => {
    fetchMock.mockResolvedValue(
      res({ errorSummary: 'Too many requests' }, 429, {
        'X-Rate-Limit-Limit': '600',
        'X-Rate-Limit-Remaining': '0',
        'X-Rate-Limit-Reset': String(RESET_SECONDS),
      }),
    );

    const result = await handleMakeApiRequest(ENDPOINT);

    expect(result).toMatchObject({ success: false, status: 429 });
    expect(result.headers).toBeDefined();

    const detector = new RateLimitDetector();
    const info = result.headers ? detector.parseHeaders(result.headers, ENDPOINT) : null;

    expect(info).toMatchObject({ limit: 600, remaining: 0, reset: RESET_SECONDS });
    expect(detector.isLimitExceeded()).toBe(true);
    expect(detector.getSecondsUntilReset()).toBe(60);
    expect(detector.getForEndpoint(ENDPOINT)).toMatchObject({ remaining: 0 });
  });
});
