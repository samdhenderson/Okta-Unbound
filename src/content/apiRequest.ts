import type { ApiResponse } from '../shared/types';
import { NO_HTTP_STATUS } from '../shared/scheduler/requestResult';
import { createLogger } from '../shared/utils/logger';

const log = createLogger('Content');

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

function failure(error: string, status: number): ApiResponse {
  return { success: false, error, status };
}

function getXsrfToken(): string {
  const xsrfElement = document.getElementById('_xsrfToken');
  return xsrfElement ? xsrfElement.textContent || '' : '';
}

export function isSameOriginPath(endpoint: string): boolean {
  if (typeof endpoint !== 'string' || !endpoint.startsWith('/') || endpoint.startsWith('//')) {
    return false;
  }
  try {
    return new URL(endpoint, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export async function handleMakeApiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
): Promise<ApiResponse> {
  log.debug('makeApiRequest called', {
    endpoint: endpoint.split('?')[0],
    method,
    hasBody: !!body,
  });

  if (!isSameOriginPath(endpoint)) {
    log.warn('Rejected API request: endpoint is not a same-origin path');
    return failure('Rejected request: endpoint must be a same-origin path', NO_HTTP_STATUS);
  }

  const normalizedMethod = (method || 'GET').toUpperCase();
  if (!ALLOWED_METHODS.has(normalizedMethod)) {
    log.warn('Rejected API request: unsupported HTTP method', { method: normalizedMethod });
    return failure('Rejected request: unsupported HTTP method', NO_HTTP_STATUS);
  }

  try {
    const url = window.location.origin + endpoint;

    const xsrfToken = getXsrfToken();
    log.debug('XSRF token check', { present: xsrfToken.length > 0 });

    const options: RequestInit = {
      method: normalizedMethod,
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'X-Requested-With': 'XMLHttpRequest',
        ...(xsrfToken && { 'X-Okta-Xsrftoken': xsrfToken }),
      },
      credentials: 'include',
      cache: 'no-store',
      mode: 'cors',
      redirect: 'follow',
    };

    if (body && normalizedMethod !== 'GET') {
      options.body = JSON.stringify(body);
    }

    log.debug('About to call fetch()');
    const response = await fetch(url, options);
    log.debug('fetch() completed');

    log.debug('Okta API response', {
      endpoint: endpoint.split('?')[0],
      status: response.status,
      ok: response.ok,
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (normalizedMethod === 'DELETE' && response.ok) {
      return {
        success: true,
        data: null,
        headers,
        status: response.status,
      };
    }

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        log.warn('Failed to parse JSON response');
      }
    }

    if (!response.ok) {
      const errorBody = data as { errorSummary?: string; message?: string } | null;
      return {
        success: false,
        error:
          errorBody?.errorSummary ||
          errorBody?.message ||
          `Request failed with status ${response.status}`,
        status: response.status,
        data,
      };
    }

    return {
      success: true,
      data,
      headers,
      status: response.status,
    };
  } catch (error) {
    log.error('makeApiRequest error', error);
    return failure(error instanceof Error ? error.message : 'Unknown error', NO_HTTP_STATUS);
  }
}
