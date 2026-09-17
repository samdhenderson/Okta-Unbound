import type { CatalogParam } from '../types';

const LOG_PARAMS: readonly CatalogParam[] = [
  {
    name: 'since',
    kind: 'timestamp',
    description: 'Start of the window, as an ISO-8601 timestamp.',
    group: 'Time',
    appliesTo: { kind: 'endpoints', ids: ['logs.list'] },
    note: 'The log retains 90 days. A since older than that is not an error and not a smaller answer — it is simply the earliest the log goes.',
  },
  {
    name: 'until',
    kind: 'timestamp',
    description: 'End of the window. Omit it to poll forward instead of reading history.',
    group: 'Time',
    appliesTo: { kind: 'endpoints', ids: ['logs.list'] },
  },
  {
    name: 'sortOrder',
    kind: 'enum',
    values: ['ASCENDING', 'DESCENDING'],
    description: 'Direction over the published timestamp.',
    defaultValue: 'ASCENDING',
    group: 'Time',
    appliesTo: { kind: 'endpoints', ids: ['logs.list'] },
    note: 'DESCENDING for "what just happened". ASCENDING for a poll, because the cursor then advances with the history rather than against it.',
  },
] as const;

export default LOG_PARAMS;
