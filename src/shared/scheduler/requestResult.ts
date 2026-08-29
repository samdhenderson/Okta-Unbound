import type { RequestResult } from './types';

export const NO_HTTP_STATUS = 0;

const HTTP_UNAUTHORIZED = 401;

export function isSessionExpired(result: RequestResult): boolean {
  return !result.success && result.status === HTTP_UNAUTHORIZED;
}

export function normalizeRequestResult(raw: unknown): RequestResult {
  const candidate = (raw ?? {}) as Partial<RequestResult> & { status?: unknown };
  if (candidate.success === true) {
    return candidate as RequestResult;
  }
  return {
    ...(candidate as object),
    success: false,
    status: typeof candidate.status === 'number' ? candidate.status : NO_HTTP_STATUS,
  };
}
