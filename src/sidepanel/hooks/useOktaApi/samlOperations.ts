import { z } from 'zod';
import type { CoreApi } from './core';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

export type SamlTraceReason =
  'disconnected' | 'app-unreadable' | 'no-sso-link' | 'origin-unknown' | 'fetch-failed';

export type SamlTraceResult =
  | { readonly ok: true; readonly assertion: string }
  | { readonly ok: false; readonly reason: SamlTraceReason };

const appLinksSchema = z.object({
  _links: z
    .object({
      appLinks: z.array(z.object({ href: z.unknown() })).optional(),
    })
    .optional(),
});

export function ssoPathFrom(href: unknown, oktaOrigin: string | undefined): string | null {
  if (typeof href !== 'string' || href.length === 0) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (oktaOrigin && url.origin !== oktaOrigin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export interface SamlOperations {
  fetchAppAssertion: (appId: string, oktaOrigin?: string) => Promise<SamlTraceResult>;
}

export function createSamlOperations(core: CoreApi): SamlOperations {
  const fetchAppAssertion = async (
    appId: string,
    oktaOrigin?: string,
  ): Promise<SamlTraceResult> => {
    if (core.targetTabId === null) return { ok: false, reason: 'disconnected' };
    if (!oktaOrigin) return { ok: false, reason: 'origin-unknown' };

    const app = await core.makeApiRequest(`/api/v1/apps/${appId}`, {
      method: 'GET',
      priority: 'interactive',
      reason: 'Read app sign-on link',
    });

    if (!app.success) {
      log.error('Could not read app for SAML trace', { appId });
      return { ok: false, reason: 'app-unreadable' };
    }

    const parsed = appLinksSchema.safeParse(app.data);
    if (!parsed.success) {
      log.error('App response did not validate for SAML trace', { appId });
      return { ok: false, reason: 'app-unreadable' };
    }

    const links = parsed.data._links?.appLinks ?? [];
    const path = links.map((link) => ssoPathFrom(link.href, oktaOrigin)).find(Boolean);
    if (!path) {
      log.info('App has no sign-on link', { appId });
      return { ok: false, reason: 'no-sso-link' };
    }

    try {
      const response = await core.sendMessage<string>({
        action: 'extractSamlResponse',
        endpoint: path,
      });

      if (!response?.success || typeof response.data !== 'string') {
        log.error('SAML extraction returned no assertion', { appId });
        return { ok: false, reason: 'fetch-failed' };
      }

      return { ok: true, assertion: response.data };
    } catch {
      log.error('SAML extraction failed', { appId });
      return { ok: false, reason: 'fetch-failed' };
    }
  };

  return { fetchAppAssertion };
}
