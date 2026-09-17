import { describe, it, expect } from 'vitest';
import { CATALOG_ENDPOINTS, CATALOG_ENDPOINTS_BY_ID, CATALOG_PARAMS } from './registry';
import { CATALOG_GROUPS } from './groups';

const GROUP_IDS = new Set(CATALOG_GROUPS.map((group) => group.id));

describe('the endpoint catalog', () => {
  it('is not empty', () => {
    expect(CATALOG_ENDPOINTS.length).toBeGreaterThan(0);
  });

  it('gives every endpoint a unique id', () => {
    expect(CATALOG_ENDPOINTS_BY_ID.size).toBe(CATALOG_ENDPOINTS.length);
  });

  it('names only headings that exist', () => {
    const unknown = CATALOG_ENDPOINTS.filter((endpoint) => !GROUP_IDS.has(endpoint.group));
    expect(unknown.map((endpoint) => endpoint.id)).toEqual([]);
  });

  it('states every path as an absolute same-origin path', () => {
    const malformed = CATALOG_ENDPOINTS.filter(
      (endpoint) => !/^\/[^/]/.test(endpoint.path) || endpoint.path.includes('//'),
    );
    expect(malformed.map((endpoint) => endpoint.path)).toEqual([]);
  });

  it('balances every hole in every path', () => {
    const unbalanced = CATALOG_ENDPOINTS.filter((endpoint) => {
      const opens = (endpoint.path.match(/\{/g) ?? []).length;
      const closes = (endpoint.path.match(/\}/g) ?? []).length;
      return opens !== closes || /\{[^}]*\{/.test(endpoint.path);
    });
    expect(unbalanced.map((endpoint) => endpoint.path)).toEqual([]);
  });

  it('writes every summary as a sentence', () => {
    const fragments = CATALOG_ENDPOINTS.filter(
      (endpoint) => !/^[A-Z"']/.test(endpoint.summary) || !endpoint.summary.endsWith('.'),
    );
    expect(fragments.map((endpoint) => endpoint.id)).toEqual([]);
  });

  it('sorts deterministically, so glob order cannot reorder the suggestions', () => {
    const sorted = [...CATALOG_ENDPOINTS].sort(
      (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
    );
    expect(CATALOG_ENDPOINTS.map((endpoint) => endpoint.id)).toEqual(
      sorted.map((endpoint) => endpoint.id),
    );
  });
});

describe('the parameter library', () => {
  it('describes each name-and-scope pair once', () => {
    const keys = CATALOG_PARAMS.map((param) => `${param.name} ${JSON.stringify(param.appliesTo)}`);
    expect(keys.length).toBe(new Set(keys).size);
  });

  it('gives every enum parameter its values', () => {
    const empty = CATALOG_PARAMS.filter(
      (param) => param.kind === 'enum' && (param.values ?? []).length === 0,
    );
    expect(empty.map((param) => param.name)).toEqual([]);
  });

  it('scopes every parameter to endpoints that exist', () => {
    const ids = new Set(CATALOG_ENDPOINTS.map((endpoint) => endpoint.id));
    const dangling = CATALOG_PARAMS.flatMap((param) =>
      param.appliesTo.kind === 'endpoints'
        ? param.appliesTo.ids.filter((id) => !ids.has(id)).map((id) => `${param.name} → ${id}`)
        : [],
    );
    expect(dangling).toEqual([]);
  });
});
