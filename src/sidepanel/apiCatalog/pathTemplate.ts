import { CATALOG_ENDPOINTS } from './registry';
import type { CatalogEndpoint } from './types';

export type HoleKind = 'user' | 'group' | 'rule' | 'app' | 'policy' | 'unknown';

export const HOLE_KINDS: Readonly<Record<string, HoleKind>> = {
  userId: 'user',
  groupId: 'group',
  ruleId: 'rule',
  appId: 'app',
  policyId: 'policy',
};

export interface PathHole {
  readonly token: string;
  readonly kind: HoleKind;
  readonly start: number;
  readonly end: number;
}

export function parseHoles(path: string): readonly PathHole[] {
  const holes: PathHole[] = [];
  const pattern = /\{([^{}]+)\}/g;
  let match = pattern.exec(path);
  while (match !== null) {
    holes.push({
      token: match[1],
      kind: HOLE_KINDS[match[1]] ?? 'unknown',
      start: match.index,
      end: match.index + match[0].length,
    });
    match = pattern.exec(path);
  }
  return holes;
}

export function matchesTemplate(path: string, template: string): boolean {
  const typed = path.split('/');
  const expected = template.split('/');
  if (typed.length !== expected.length) return false;

  return expected.every((segment, index) =>
    segment.startsWith('{') && segment.endsWith('}')
      ? typed[index].length > 0
      : typed[index] === segment,
  );
}

export function findEndpoint(
  path: string,
  method?: CatalogEndpoint['method'],
): CatalogEndpoint | null {
  const normalised = path.split('?')[0];
  return (
    CATALOG_ENDPOINTS.find(
      (endpoint) =>
        (method === undefined || endpoint.method === method) &&
        matchesTemplate(normalised, endpoint.path),
    ) ?? null
  );
}
