import { describe, it, expect } from 'vitest';
import { resolveParams } from './resolve';
import { CATALOG_ENDPOINTS } from './registry';

const names = (endpointId: string) => resolveParams(endpointId).map((param) => param.name);

describe('resolveParams', () => {
  it('offers paging on a collection', () => {
    expect(names('users.list')).toEqual(expect.arrayContaining(['limit', 'after']));
  });

  it('withholds paging from an endpoint that returns one object', () => {
    expect(names('users.get')).not.toContain('limit');
  });

  it('returns nothing for an endpoint id the catalog does not hold', () => {
    expect(resolveParams('nothing.here')).toEqual([]);
  });

  it('applies the endpoint-specific correction to a library parameter', () => {
    const limit = resolveParams('groups.members.list').find((param) => param.name === 'limit');
    expect(limit?.defaultValue).toBe('1000');
    expect(limit?.max).toBe(1000);
  });

  it('leaves the library parameter itself untouched for every other endpoint', () => {
    expect(resolveParams('users.list').find((param) => param.name === 'limit')?.defaultValue).toBe(
      '200',
    );
  });

  it('offers only the expand values that belong to the endpoint asked about', () => {
    const groupExpand = resolveParams('groups.list').find((param) => param.name === 'expand');
    const memberExpand = resolveParams('groups.members.list').find(
      (param) => param.name === 'expand',
    );
    expect(groupExpand?.values).toEqual(['stats', 'app']);
    expect(memberExpand?.values).toEqual(['group-rules']);
  });

  it('never offers the same parameter name twice, for any endpoint in the catalog', () => {
    const repeated = CATALOG_ENDPOINTS.filter((endpoint) => {
      const resolved = names(endpoint.id);
      return resolved.length !== new Set(resolved).size;
    });
    expect(repeated.map((endpoint) => endpoint.id)).toEqual([]);
  });
});
