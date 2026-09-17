export type CatalogMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type CatalogParamKind = 'string' | 'number' | 'enum' | 'timestamp' | 'expression' | 'none';

export type ParamScope =
  | { readonly kind: 'all-collections' }
  | { readonly kind: 'endpoints'; readonly ids: readonly string[] }
  | { readonly kind: 'prefix'; readonly prefixes: readonly string[] };

export type ParamGroup = 'Paging' | 'Filtering' | 'Embedding' | 'Time' | 'Other';

export interface CatalogParam {
  readonly name: string;
  readonly kind: CatalogParamKind;
  readonly description: string;
  readonly values?: readonly string[];
  readonly defaultValue?: string;
  readonly max?: number;
  readonly repeatable?: true;
  readonly group: ParamGroup;
  readonly appliesTo: ParamScope;
  readonly note?: string;
}

export interface CatalogParamOverride {
  readonly defaultValue?: string;
  readonly max?: number;
  readonly note?: string;
}

export interface CatalogEndpoint {
  readonly id: string;
  readonly path: string;
  readonly method: CatalogMethod;
  readonly group: CatalogGroupId;
  readonly summary: string;
  readonly collection: boolean;
  readonly keywords?: readonly string[];
  readonly params?: readonly CatalogParam[];
  readonly paramOverrides?: Readonly<Record<string, CatalogParamOverride>>;
}

export type CatalogGroupId = 'users' | 'groups' | 'rules' | 'apps' | 'policies' | 'logs' | 'org';
