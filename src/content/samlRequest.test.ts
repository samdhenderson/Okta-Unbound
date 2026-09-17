import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleExtractSamlResponse } from './samlRequest';

const fetchMock = vi.fn();

const ssoPage = (assertion: string) => `
<html><body>
  <form method="POST" action="https://sp.example.com/acs">
    <input name="SAMLResponse" type="hidden" value="${assertion}"/>
    <input name="RelayState" type="hidden" value="/app/home"/>
  </form>
  <script>document.forms[0].submit();</script>
</body></html>`;

const page = (html: string, status = 200): Response =>
  new Response(html, { status, headers: { 'content-type': 'text/html' } });

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('handleExtractSamlResponse', () => {
  it('returns the assertion and nothing else', async () => {
    fetchMock.mockResolvedValue(page(ssoPage('FAKEBASE64ASSERTION')));

    const result = await handleExtractSamlResponse(
      '/app/example_saml/0oaFAKE000000000000/sso/saml',
    );

    expect(result).toEqual({ success: true, data: 'FAKEBASE64ASSERTION' });
    expect(JSON.stringify(result)).not.toContain('RelayState');
    expect(JSON.stringify(result)).not.toContain('sp.example.com');
  });

  it('fetches the path against this page’s origin, with the session cookie', async () => {
    fetchMock.mockResolvedValue(page(ssoPage('FAKE')));

    await handleExtractSamlResponse('/app/example/0oaFAKE000000000000/sso/saml');

    expect(fetchMock).toHaveBeenCalledWith(
      `${window.location.origin}/app/example/0oaFAKE000000000000/sso/saml`,
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('refuses an absolute URL without fetching', async () => {
    const result = await handleExtractSamlResponse('https://evil.example.com/sso/saml');

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a protocol-relative host without fetching', async () => {
    const result = await handleExtractSamlResponse('//evil.example.com/sso/saml');

    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a traversal without fetching', async () => {
    const result = await handleExtractSamlResponse('/app/../admin/users');

    expect(result).toEqual({
      success: false,
      error: 'Rejected request: endpoint path is not normalized',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a page that carries no assertion as exactly that', async () => {
    fetchMock.mockResolvedValue(page('<html><body>Signed in</body></html>'));

    const result = await handleExtractSamlResponse('/app/example/0oaFAKE000000000000/sso/saml');

    expect(result).toEqual({
      success: false,
      error: 'That sign-on response carried no SAML assertion',
    });
  });

  it('reports the status when Okta refuses the SSO link', async () => {
    fetchMock.mockResolvedValue(page('nope', 403));

    const result = await handleExtractSamlResponse('/app/example/0oaFAKE000000000000/sso/saml');

    expect(result.error).toContain('403');
  });

  it('says nothing about the URL when the fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('net::ERR_FAILED https://example.okta.com/app/secret'));

    const result = await handleExtractSamlResponse('/app/example/0oaFAKE000000000000/sso/saml');

    expect(result).toEqual({ success: false, error: 'Could not reach that SSO link' });
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it('reads the field by parsing the page, not by matching text in it', async () => {
    const html = `
      <html><body>
        <!-- <input name="SAMLResponse" value="DECOY"/> -->
        <div data-name="SAMLResponse" value="ALSO-DECOY"></div>
        <form><input name="SAMLResponse" value="REAL"/></form>
      </body></html>`;
    fetchMock.mockResolvedValue(page(html));

    const result = await handleExtractSamlResponse('/app/example/0oaFAKE000000000000/sso/saml');

    expect(result.data).toBe('REAL');
  });
});
