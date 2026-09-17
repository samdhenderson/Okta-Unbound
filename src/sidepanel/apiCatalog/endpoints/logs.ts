import type { CatalogEndpoint } from '../types';

const LOG_ENDPOINTS: readonly CatalogEndpoint[] = [
  {
    id: 'logs.list',
    path: '/api/v1/logs',
    method: 'GET',
    group: 'logs',
    summary: 'System Log events, newest first, within the last 90 days.',
    collection: true,
    keywords: ['audit', 'events', 'history', 'when', 'who'],
    paramOverrides: {
      limit: {
        defaultValue: '100',
        max: 1000,
        note: 'The log is the one place where large pages are both allowed and wanted.',
      },
      after: {
        note: 'The log always returns a rel="next" link, even on an empty page — that is how polling works here. Stop on an empty page rather than on a missing link.',
      },
    },
  },
] as const;

export default LOG_ENDPOINTS;
