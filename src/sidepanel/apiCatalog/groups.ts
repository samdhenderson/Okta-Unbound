import type { CatalogGroupId } from './types';

export interface CatalogGroupDef {
  readonly id: CatalogGroupId;
  readonly label: string;
}

export const CATALOG_GROUPS: readonly CatalogGroupDef[] = [
  { id: 'users', label: 'Users' },
  { id: 'groups', label: 'Groups' },
  { id: 'rules', label: 'Group rules' },
  { id: 'apps', label: 'Apps' },
  { id: 'policies', label: 'Policies' },
  { id: 'logs', label: 'System Log' },
  { id: 'org', label: 'Org and admin' },
] as const;

export const CATALOG_GROUP_LABEL: Readonly<Record<CatalogGroupId, string>> = Object.fromEntries(
  CATALOG_GROUPS.map((group) => [group.id, group.label]),
) as Record<CatalogGroupId, string>;
