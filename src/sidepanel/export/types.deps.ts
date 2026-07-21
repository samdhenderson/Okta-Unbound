import type { EntityContextOption } from './types';

export interface ExportApiDeps {
  searchGroups: (query: string) => Promise<EntityContextOption[]>;
  searchApps?: (query: string) => Promise<EntityContextOption[]>;
}
