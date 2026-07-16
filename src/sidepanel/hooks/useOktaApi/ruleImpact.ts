import type { CoreApi } from './core';
import type { OktaUser, OktaGroupRule, GroupType } from '../../../shared/types';
import { parseNextLink } from './utilities';
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
    const all: OktaGroupRule[] = [];
    let nextUrl: string | null = '/api/v1/groups/rules?limit=200';

    while (nextUrl) {
      const response = await coreApi.makeApiRequest(nextUrl, 'GET', undefined, 'low');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch group rules');
      }
      all.push(...((response.data as OktaGroupRule[]) || []));
      nextUrl = parseNextLink(response.headers?.link);
    }

    return all;
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

    const targets: TargetGroupMembers[] = [];
    const total = rule.groupIds.length;

    for (let i = 0; i < total; i++) {
      const groupId = rule.groupIds[i];
      const fallbackName = rule.groupNames?.[i] || groupId;
      opts?.onProgress?.(i + 1, total, `Loading members for ${fallbackName}…`);

      const meta = await fetchGroupMeta(groupId, fallbackName);
      const members = await getAllGroupMembers(groupId);

      targets.push({ groupId, groupName: meta.name, groupType: meta.type, members });
    }

    return summarizeRuleImpact(rule.id, rule.name, targets, impactRules);
  };

  return { captureRuleImpact };
}
