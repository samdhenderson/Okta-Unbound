export interface RedactionResult {
  data: unknown;
  redactedCount: number;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;

const KNOWN_OKTA_ID_PREFIXES: ReadonlyArray<readonly [prefix: string, label: string]> = [
  ['00u', 'USER_ID'],
  ['00g', 'GROUP_ID'],
  ['0oa', 'APP_ID'],
  ['00p', 'POLICY_ID'],
  ['rst', 'POLICY_ID'],
  ['aus', 'AUTH_SERVER_ID'],
];

const KNOWN_ID_RE = new RegExp(
  `\\b(${KNOWN_OKTA_ID_PREFIXES.map(([prefix]) => prefix).join('|')})[A-Za-z0-9]{17}\\b`,
  'g',
);

const GENERIC_ID_RE = /\b[a-z][a-z0-9]{2}[A-Za-z0-9]{17}\b/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractHostname(oktaOrigin: string): string | null {
  try {
    return new URL(oktaOrigin).hostname || null;
  } catch {
    const stripped = oktaOrigin.replace(/^[a-z]+:\/\//i, '').split('/')[0];
    return stripped || null;
  }
}

function redactString(input: string, orgHostname: string | null, bump: () => void): string {
  let out = input;

  if (orgHostname) {
    const hostRe = new RegExp(escapeRegExp(orgHostname), 'g');
    out = out.replace(hostRe, () => {
      bump();
      return '<OKTA_ORG>';
    });
  }

  out = out.replace(EMAIL_RE, () => {
    bump();
    return '<EMAIL>';
  });

  out = out.replace(PHONE_RE, () => {
    bump();
    return '<PHONE>';
  });

  out = out.replace(KNOWN_ID_RE, (_match, prefix: string) => {
    bump();
    const label = KNOWN_OKTA_ID_PREFIXES.find(([p]) => p === prefix)?.[1] ?? 'OKTA_ID';
    return `<${label}>`;
  });

  out = out.replace(GENERIC_ID_RE, () => {
    bump();
    return '<OKTA_ID>';
  });

  return out;
}

function walk(value: unknown, orgHostname: string | null, bump: () => void): unknown {
  if (typeof value === 'string') return redactString(value, orgHostname, bump);
  if (Array.isArray(value)) return value.map((item) => walk(item, orgHostname, bump));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, walk(item, orgHostname, bump)]),
    );
  }
  return value;
}

export function redactJson(value: unknown, oktaOrigin?: string): RedactionResult {
  let redactedCount = 0;
  const orgHostname = oktaOrigin ? extractHostname(oktaOrigin) : null;
  const data = walk(value, orgHostname, () => {
    redactedCount += 1;
  });
  return { data, redactedCount };
}
