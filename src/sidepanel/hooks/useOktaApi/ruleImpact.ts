import type { CoreApi } from './core';
import type { OktaUser, OktaGroupRule, GroupType } from '../../../shared/types';
import { RulesCache } from '../../../shared/rulesCache';
import { OperationCancelledError } from '../../../shared/scheduler/cancellation';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { oktaGroupRuleSchema, type OktaGroupRuleResponse } from '@/shared/schemas/okta';
import { createLogger } from '../../../shared/utils/logger';
import {
  toImpactRule,
  summarizeRuleImpact,
  type TargetGroupMembers,
  type RuleImpactSummary,
} from '../../../shared/membership/ruleImpact';

const log = createLogger('useOktaApi');

export interface RuleImpactInput {
  id: string;
  name: string;
  groupIds: string[];
  groupNames?: string[];
}

export interface CaptureRuleImpactOptions {
  onProgress?: (current: number, total: number, message: string) => void;
}

export interface RuleImpactOperations {
  captureRuleImpact: (
    rule: RuleImpactInput,
    opts?: CaptureRuleImpactOptions,
  ) => Promise<RuleImpactSummary>;
}

export function createRuleImpactOperations(
  coreApi: CoreApi,
  getAllGroupMembers: (groupId: string) => Promise<OktaUser[]>,
): RuleImpactOperations {
  const fetchRawRules = async (): Promise<OktaGroupRule[]> => {
    const cached = await RulesCache.get();
    if (cached && cached.rawRules.length > 0) {
      log.debug('Serving raw rules from RulesCache', { count: cached.rawRules.length });
      return cached.rawRules;
    }

    const rules = await fetchAllPages<OktaGroupRuleResponse>(
      (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'low'),
      `/api/v1/groups/rules?limit=${OKTA_PAGE_SIZE}`,
      {
        schema: oktaGroupRuleSchema,
        errorMessage: 'Failed to fetch group rules',
      },
    );
    return rules as unknown as OktaGroupRule[];
  };

  const fetchGroupMeta = async (
    groupId: string,
    fallbackName: string,
  ): Promise<{ name: string; type?: GroupType }> => {
    try {
      const response = await coreApi.makeApiRequest(
        `/api/v1/groups/${groupId}`,
        'GET',
        undefined,
        'low',
      );
      if (response.success && response.data) {
        return {
          name: response.data.profile?.name || fallbackName,
          type: response.data.type as GroupType | undefined,
        };
      }
    } catch (error) {
      log.warn('Failed to fetch group meta for impact preview', { groupId }, error);
    }
    return { name: fallbackName };
  };

  const captureRuleImpact = async (
    rule: RuleImpactInput,
    opts?: CaptureRuleImpactOptions,
  ): Promise<RuleImpactSummary> => {
    const rawRules = await fetchRawRules();
    const impactRules = rawRules.map(toImpactRule);

    const total = rule.groupIds.length;
    const groupInputs = rule.groupIds.map((groupId, i) => ({
      groupId,
      fallbackName: rule.groupNames?.[i] || groupId,
    }));
    let started = 0;

    const outcome = await coreApi.runOperation(
      'Rule impact preview',
      groupInputs,
      async ({ groupId, fallbackName }): Promise<TargetGroupMembers> => {
        started += 1;
        opts?.onProgress?.(Math.min(started, total), total, `Loading members for ${fallbackName}…`);

        const meta = await fetchGroupMeta(groupId, fallbackName);
        const members = await getAllGroupMembers(groupId);
        return { groupId, groupName: meta.name, groupType: meta.type, members };
      },
      {
        stopOnError: () => true,
        message: (p) => `Loading rule targets (${p.completed}/${p.total})`,
      },
    );

    if (outcome.cancelled) {
      throw new OperationCancelledError();
    }
    const rejected = outcome.results.find((r) => r.status === 'rejected');
    if (rejected) {
      throw rejected.error instanceof Error
        ? rejected.error
        : new Error('Failed to load rule target group');
    }

    const targets: TargetGroupMembers[] = [];
    for (const r of outcome.results) {
      if (r.status === 'fulfilled' && r.value) targets.push(r.value);
    }

    return summarizeRuleImpact(rule.id, rule.name, targets, impactRules);
  };

  return { captureRuleImpact };
}
