import { describe, it, expect, vi } from 'vitest';
import { createSamlOperations, ssoPathFrom } from './samlOperations';
import type { CoreApi } from './core';
import { makeFakeCore } from '@/test/factories/coreApi';

const ORIGIN = 'https://example.okta.com';
const APP_ID = '0oaFAKE000000000000';

const appWithLink = (href: string) => ({
  success: true,
  data: { id: APP_ID, _links: { appLinks: [{ href }] } },
});

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    targetTabId: 7,
    makeApiRequest: vi
      .fn()
      .mockResolvedValue(appWithLink(`${ORIGIN}/app/example/${APP_ID}/sso/saml`)),
    sendMessage: vi.fn().mockResolvedValue({ success: true, data: 'FAKEBASE64ASSERTION' }),
    ...overrides,
  });

describe('ssoPathFrom', () => {
  it('keeps the path and its query, and drops the origin', () => {
    expect(ssoPathFrom(`${ORIGIN}/app/example/${APP_ID}/sso/saml?from=1`, ORIGIN)).toBe(
      `/app/example/${APP_ID}/sso/saml?from=1`,
    );
  });

  it('refuses a link belonging to another origin', () => {
    expect(ssoPathFrom('https://evil.example.com/app/x/sso/saml', ORIGIN)).toBeNull();
  });

  it('refuses anything that is not an absolute http(s) URL', () => {
    expect(ssoPathFrom('not a url', ORIGIN)).toBeNull();
    expect(ssoPathFrom(`/app/example/${APP_ID}/sso/saml`, ORIGIN)).toBeNull();
    expect(ssoPathFrom('javascript:alert(1)', undefined)).toBeNull();
    expect(ssoPathFrom(42, ORIGIN)).toBeNull();
    expect(ssoPathFrom(undefined, ORIGIN)).toBeNull();
  });
});

describe('fetchAppAssertion', () => {
  it('reads the app, then asks the content script for the assertion', async () => {
    const core = makeCore();
    const { fetchAppAssertion } = createSamlOperations(core);

    const result = await fetchAppAssertion(APP_ID, ORIGIN);

    expect(core.makeApiRequest).toHaveBeenCalledWith(
      `/api/v1/apps/${APP_ID}`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(core.sendMessage).toHaveBeenCalledWith({
      action: 'extractSamlResponse',
      endpoint: `/app/example/${APP_ID}/sso/saml`,
    });
    expect(result).toEqual({ ok: true, assertion: 'FAKEBASE64ASSERTION' });
  });

  it('sends a path, never the absolute URL Okta returned', async () => {
    const core = makeCore();
    const { fetchAppAssertion } = createSamlOperations(core);

    await fetchAppAssertion(APP_ID, ORIGIN);

    const [sent] = vi.mocked(core.sendMessage).mock.calls[0] as [{ endpoint: string }];
    expect(sent.endpoint.startsWith('/')).toBe(true);
    expect(sent.endpoint).not.toContain(ORIGIN);
  });

  it('reports disconnected without asking anything', async () => {
    const core = makeCore({ targetTabId: null });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({ ok: false, reason: 'disconnected' });
    expect(core.makeApiRequest).not.toHaveBeenCalled();
  });

  it('reports app-unreadable when Okta refuses the app', async () => {
    const core = makeCore({
      makeApiRequest: vi
        .fn()
        .mockResolvedValue({ success: false, status: 403, error: 'Forbidden' }),
    });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({
      ok: false,
      reason: 'app-unreadable',
    });
    expect(core.sendMessage).not.toHaveBeenCalled();
  });

  it('refuses to follow anything when the org origin is not known yet', async () => {
    const core = makeCore();
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID)).toEqual({ ok: false, reason: 'origin-unknown' });
    expect(core.makeApiRequest).not.toHaveBeenCalled();
  });

  it('reports app-unreadable when the app row does not validate', async () => {
    const core = makeCore({
      makeApiRequest: vi
        .fn()
        .mockResolvedValue({ success: true, data: { id: APP_ID, _links: { appLinks: 'nope' } } }),
    });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({
      ok: false,
      reason: 'app-unreadable',
    });
    expect(core.sendMessage).not.toHaveBeenCalled();
  });

  it('reports no-sso-link when the app has no appLinks', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: { id: APP_ID } }),
    });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({ ok: false, reason: 'no-sso-link' });
    expect(core.sendMessage).not.toHaveBeenCalled();
  });

  it('refuses a foreign sign-on link rather than following it', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue(appWithLink('https://evil.example.com/sso/saml')),
    });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({ ok: false, reason: 'no-sso-link' });
    expect(core.sendMessage).not.toHaveBeenCalled();
  });

  it('reports fetch-failed when the content script returns no assertion', async () => {
    const core = makeCore({
      sendMessage: vi.fn().mockResolvedValue({
        success: false,
        error: 'That sign-on response carried no SAML assertion',
      }),
    });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({ ok: false, reason: 'fetch-failed' });
  });

  it('reports fetch-failed when the message itself rejects', async () => {
    const core = makeCore({ sendMessage: vi.fn().mockRejectedValue(new Error('port closed')) });
    const { fetchAppAssertion } = createSamlOperations(core);

    expect(await fetchAppAssertion(APP_ID, ORIGIN)).toEqual({ ok: false, reason: 'fetch-failed' });
  });
});
