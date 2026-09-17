import type { MessageResponse } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import { isNormalizedPath } from '../shared/utils/apiPath';
import { isSameOriginPath } from './apiRequest';

const log = createLogger('Content');

const MAX_PAGE_CHARS = 5_000_000;

function readSamlResponse(html: string): string | null {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const field = document.querySelector('input[name="SAMLResponse"]');
  const value = field?.getAttribute('value')?.trim();
  return value ? value : null;
}

export async function handleExtractSamlResponse(
  endpoint: string,
): Promise<MessageResponse<string>> {
  if (!isSameOriginPath(endpoint)) {
    log.warn('Rejected SAML extraction: endpoint is not a same-origin path');
    return { success: false, error: 'Rejected request: endpoint must be a same-origin path' };
  }

  if (!isNormalizedPath(endpoint)) {
    log.warn('Rejected SAML extraction: endpoint path does not survive normalization');
    return { success: false, error: 'Rejected request: endpoint path is not normalized' };
  }

  try {
    const response = await fetch(window.location.origin + endpoint, {
      method: 'GET',
      credentials: 'include',
      redirect: 'follow',
    });

    log.debug('SSO link fetched', { status: response.status, ok: response.ok });

    if (!response.ok) {
      return { success: false, error: `Okta answered ${response.status} for that SSO link` };
    }

    const html = await response.text();
    if (html.length > MAX_PAGE_CHARS) {
      return { success: false, error: 'That sign-on page is too large to read' };
    }

    const assertion = readSamlResponse(html);
    if (!assertion) {
      return { success: false, error: 'That sign-on response carried no SAML assertion' };
    }

    return { success: true, data: assertion };
  } catch {
    log.error('SSO link fetch failed');
    return { success: false, error: 'Could not reach that SSO link' };
  }
}
