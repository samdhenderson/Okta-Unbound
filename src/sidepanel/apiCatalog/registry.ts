import type { CatalogEndpoint, CatalogParam } from './types';

interface EndpointModule {
  default: readonly CatalogEndpoint[];
}

interface ParamModule {
  default: readonly CatalogParam[];
}

const endpointModules = import.meta.glob<EndpointModule>(
  ['./endpoints/*.ts', '!./endpoints/*.test.ts'],
  { eager: true },
);

const paramModules = import.meta.glob<ParamModule>(['./params/*.ts', '!./params/*.test.ts'], {
  eager: true,
});

export const CATALOG_ENDPOINTS: readonly CatalogEndpoint[] = Object.values(endpointModules)
  .flatMap((module) => module.default)
  .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

export const CATALOG_PARAMS: readonly CatalogParam[] = Object.values(paramModules)
  .flatMap((module) => module.default)
  .sort((a, b) => a.name.localeCompare(b.name));

export const CATALOG_ENDPOINTS_BY_ID: ReadonlyMap<string, CatalogEndpoint> = (() => {
  const byId = new Map<string, CatalogEndpoint>();
  for (const endpoint of CATALOG_ENDPOINTS) {
    if (byId.has(endpoint.id)) {
      throw new Error(`Duplicate catalog endpoint id: ${endpoint.id}`);
    }
    byId.set(endpoint.id, endpoint);
  }
  return byId;
})();
