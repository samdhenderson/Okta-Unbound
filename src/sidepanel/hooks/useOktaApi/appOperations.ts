import type { CoreApi } from './core';
import { oktaAppListItemSchema } from '@/shared/schemas/okta';
import { parseOktaList } from '@/shared/schemas/okta';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

export interface AppSummary {
  id: string;
  label: string;
  status?: string;
}

export function createAppOperations(coreApi: CoreApi) {
  const searchApps = async (query: string): Promise<AppSummary[]> => {
    if (!query || query.length < 2) return [];
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/apps?q=${encodeURIComponent(query)}&limit=20`,
      );
      if (!response.success) return [];
      const apps = parseOktaList(oktaAppListItemSchema, response.data, 'GET /api/v1/apps?q');
      return apps.map((app) => ({
        id: app.id,
        label: app.label || app.name || app.id,
        status: app.status,
      }));
    } catch {
      log.error('searchApps failed', { code: 'search_failed' });
      return [];
    }
  };

  return { searchApps };
}
