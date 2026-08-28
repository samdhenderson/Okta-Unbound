export type OktaIdKind = 'group' | 'user' | 'app' | 'rule';

const ID_PREFIX_KINDS: ReadonlyMap<string, OktaIdKind> = new Map([
  ['00g', 'group' as const],
  ['00u', 'user' as const],
  ['0oa', 'app' as const],
  ['0pr', 'rule' as const],
]);

const OKTA_ID_PREFIX_LENGTH = 3;

const OKTA_ID_BODY_LENGTH = 17;

const OKTA_ID_RE = new RegExp(
  `^(${[...ID_PREFIX_KINDS.keys()].join('|')})[A-Za-z0-9]{${OKTA_ID_BODY_LENGTH}}$`,
);

export function oktaIdKind(candidate: string): OktaIdKind | null {
  const trimmed = candidate.trim();
  if (!OKTA_ID_RE.test(trimmed)) return null;
  return ID_PREFIX_KINDS.get(trimmed.slice(0, OKTA_ID_PREFIX_LENGTH)) ?? null;
}
