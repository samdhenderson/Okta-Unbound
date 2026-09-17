import type { CoreApi } from './core';
import {
  oktaPolicyListItemSchema,
  oktaPolicyRuleSchema,
  parseOktaList,
  type OktaPolicyListItem,
  type OktaPolicyRule,
} from '@/shared/schemas/okta';
import { fetchAllPages, PaginatedFetchError, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('policyOperations');

export const OKTA_POLICY_TYPES = [
  'ACCESS_POLICY',
  'OKTA_SIGN_ON',
  'MFA_ENROLL',
  'PASSWORD',
] as const;

export type OktaPolicyType = (typeof OKTA_POLICY_TYPES)[number];

export type PolicyListResult =
  | { readonly outcome: 'listed'; readonly policies: OktaPolicyListItem[] }
  | { readonly outcome: 'forbidden' }
  | { readonly outcome: 'failed'; readonly message: string };

const FORBIDDEN_STATUS = 403;

export function policiesOrNone(result: PolicyListResult): OktaPolicyListItem[] {
  return result.outcome === 'listed' ? result.policies : [];
}

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

export function extractAccessPolicyId(links: unknown): string | null {
  const href = readAccessPolicyHref(links);
  if (!href) return null;

  const candidate = trailingSegment(href);
  if (!candidate || !POLICY_ID_PATTERN.test(candidate)) return null;

  return candidate;
}

export function createPolicyOperations(coreApi: CoreApi) {
  const listPolicies = async (
    type: OktaPolicyType = 'ACCESS_POLICY',
  ): Promise<PolicyListResult> => {
    try {
      const policies = await fetchAllPages<OktaPolicyListItem>(
        (url) =>
          coreApi.makeApiRequest(url, {
            method: 'GET',
            priority: 'normal',
            reason: `List ${type} policies`,
          }),
        `/api/v1/policies?type=${encodeURIComponent(type)}&limit=${OKTA_PAGE_SIZE}`,
        {
          schema: oktaPolicyListItemSchema,
          context: 'GET /api/v1/policies',
        },
      );
      return { outcome: 'listed', policies };
    } catch (error) {
      const forbidden = error instanceof PaginatedFetchError && error.status === FORBIDDEN_STATUS;
      log.error('listPolicies failed', {
        code: forbidden ? 'list_policies_forbidden' : 'list_policies_failed',
        type,
      });
      if (forbidden) return { outcome: 'forbidden' };
      return {
        outcome: 'failed',
        message: error instanceof Error ? error.message : 'Failed to list policies',
      };
    }
  };

  const getPolicyRules = async (policyId: string): Promise<OktaPolicyRule[]> => {
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/policies/${encodeURIComponent(policyId)}/rules`,
        { method: 'GET', priority: 'normal', reason: 'Load policy rules' },
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
      const response = await coreApi.makeApiRequest(`/api/v1/apps/${encodeURIComponent(appId)}`, {
        method: 'GET',
        priority: 'normal',
        reason: 'Resolve app access policy',
      });
      if (!response.success || !response.data || typeof response.data !== 'object') return null;

      return extractAccessPolicyId((response.data as Record<string, unknown>)._links);
    } catch {
      log.error('getAppAccessPolicyId failed', { code: 'app_access_policy_failed', appId });
      return null;
    }
  };

  return { listPolicies, getPolicyRules, getAppAccessPolicyId };
}
