import type { CatalogParam } from '../types';

const PAGING_PARAMS: readonly CatalogParam[] = [
  {
    name: 'limit',
    kind: 'number',
    description: 'How many results to return per page.',
    defaultValue: '200',
    max: 200,
    group: 'Paging',
    appliesTo: { kind: 'all-collections' },
    note: 'Always set it explicitly — the default varies per endpoint and has changed over time. limit=1 with the x-total-count response header gives an exact total without walking the collection.',
  },
  {
    name: 'after',
    kind: 'string',
    description: 'Opaque cursor marking where the next page starts.',
    group: 'Paging',
    appliesTo: { kind: 'all-collections' },
    note: 'Copy it from the Link: rel="next" response header, unchanged. It is not a user id and not a timestamp, the format can change without notice, and URL-decoding it turns a + into a space and fetches the wrong page.',
  },
] as const;

export default PAGING_PARAMS;
