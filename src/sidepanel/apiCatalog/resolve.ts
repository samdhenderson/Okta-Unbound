import { CATALOG_ENDPOINTS_BY_ID, CATALOG_PARAMS } from './registry';
import type { CatalogEndpoint, CatalogParam, ParamScope } from './types';

function scopeCovers(scope: ParamScope, endpoint: CatalogEndpoint): boolean {
  switch (scope.kind) {
    case 'all-collections':
      return endpoint.collection;
    case 'endpoints':
      return scope.ids.includes(endpoint.id);
    case 'prefix':
      return scope.prefixes.some((prefix) => endpoint.path.startsWith(prefix));
  }
}

export function resolveParams(endpointId: string): readonly CatalogParam[] {
  const endpoint = CATALOG_ENDPOINTS_BY_ID.get(endpointId);
  if (!endpoint) return [];

  const local = endpoint.params ?? [];
  const localNames = new Set(local.map((param) => param.name));

  const inherited = CATALOG_PARAMS.filter(
    (param) => !localNames.has(param.name) && scopeCovers(param.appliesTo, endpoint),
  ).map((param) => {
    const override = endpoint.paramOverrides?.[param.name];
    return override ? { ...param, ...override } : param;
  });

  return [...inherited, ...local];
}
