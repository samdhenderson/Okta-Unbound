const MAX_SEGMENT_LENGTH = 256;

const STRUCTURAL = /[/?#%\\]/;

// eslint-disable-next-line no-control-regex
const CONTROL = /[\s\u0000-\u001f\u007f]/;

export function isSafePathSegment(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_SEGMENT_LENGTH) return false;
  if (STRUCTURAL.test(value) || CONTROL.test(value)) return false;
  return value !== '.' && value !== '..';
}

export type SubstitutionError =
  | { readonly reason: 'unfilled'; readonly token: string }
  | { readonly reason: 'unsafe'; readonly token: string };

export type SubstitutionResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly error: SubstitutionError };

export function substitutePathHoles(
  template: string,
  values: Readonly<Record<string, string>>,
): SubstitutionResult {
  let error: SubstitutionError | null = null;

  const path = template.replace(/\{([^{}]+)\}/g, (_match, token: string) => {
    if (error) return '';
    const value = values[token];
    if (value === undefined || value === '') {
      error = { reason: 'unfilled', token };
      return '';
    }
    if (!isSafePathSegment(value)) {
      error = { reason: 'unsafe', token };
      return '';
    }
    return encodeURIComponent(value);
  });

  return error ? { ok: false, error } : { ok: true, path };
}

export function isNormalizedPath(
  endpoint: string,
  origin: string = window.location.origin,
): boolean {
  if (typeof endpoint !== 'string' || !endpoint.startsWith('/')) return false;

  const queryAt = endpoint.indexOf('?');
  const pathPart = queryAt === -1 ? endpoint : endpoint.slice(0, queryAt);

  try {
    return new URL(pathPart, origin).pathname === pathPart;
  } catch {
    return false;
  }
}
