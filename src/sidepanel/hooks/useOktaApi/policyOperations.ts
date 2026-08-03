import type { CoreApi } from './core';
import {
  oktaPolicyListItemSchema,
  oktaPolicyRuleSchema,
  parseOktaList,
  type OktaPolicyListItem,
  type OktaPolicyRule,
} from '@/shared/schemas/okta';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('policyOperations');

export const OKTA_POLICY_TYPES = [
  'ACCESS_POLICY',
  'OKTA_SIGN_ON',
  'MFA_ENROLL',
  'PASSWORD',
] as const;

export type OktaPolicyType = (typeof OKTA_POLICY_TYPES)[number];

const POLICY_ID_PATTERN = /^(?:rst|00p)[A-Za-z0-9]{15,}$/;

function readAccessPolicyHref(links: unknown): string | null {
  if (!links || typeof links !== 'object') return null;
  const accessPolicy = (links as Record<string, unknown>).accessPolicy;
  if (!accessPolicy || typeof accessPolicy !== 'object') return null;
  const href = (accessPolicy as Record<string, unknown>).href;
  return typeof href === 'string' ? href : null;
}

function trailingSegment(href: string): string | null {
  const path = href.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const segment = path.split('/').pop();
  return segment ? segment : null;
}

export function createPolicyOperations(coreApi: CoreApi) {
  const listPolicies = async (
    type: OktaPolicyType = 'ACCESS_POLICY',
  ): Promise<OktaPolicyListItem[]> => {
    try {
      return await fetchAllPages<OktaPolicyListItem>(
        (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'normal'),
        `/api/v1/policies?type=${encodeURIComponent(type)}&limit=${OKTA_PAGE_SIZE}`,
        {
          schema: oktaPolicyListItemSchema,
          context: 'GET /api/v1/policies',
        },
      );
    } catch {
      log.error('listPolicies failed', { code: 'list_policies_failed', type });
      return [];
    }
  };

  const getPolicyRules = async (policyId: string): Promise<OktaPolicyRule[]> => {
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/policies/${encodeURIComponent(policyId)}/rules`,
        'GET',
        undefined,
        'normal',
      );
      if (!response.success) return [];
      return parseOktaList(oktaPolicyRuleSchema, response.data, 'GET /api/v1/policies/{id}/rules');
    } catch {
      log.error('getPolicyRules failed', { code: 'policy_rules_failed', policyId });
      return [];
    }
  };

  const getAppAccessPolicyId = async (appId: string): Promise<string | null> => {
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/apps/${encodeURIComponent(appId)}`,
        'GET',
        undefined,
        'normal',
      );
      if (!response.success || !response.data || typeof response.data !== 'object') return null;

      const href = readAccessPolicyHref((response.data as Record<string, unknown>)._links);
      if (!href) return null;

      const candidate = trailingSegment(href);
      if (!candidate || !POLICY_ID_PATTERN.test(candidate)) return null;

      return candidate;
    } catch {
      log.error('getAppAccessPolicyId failed', { code: 'app_access_policy_failed', appId });
      return null;
    }
  };

  return { listPolicies, getPolicyRules, getAppAccessPolicyId };
}
