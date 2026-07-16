import type { CoreApi } from './core';
import type { OktaGroupRule } from '../../../shared/types';
import { oktaGroupRuleSchema, parseOkta } from '../../../shared/schemas/okta';
import type { CreateRulePayload } from '../../../shared/rules/consolidation';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('useOktaApi');

export interface RuleWriteResult {
  success: boolean;
  error?: string;
}

export interface CreateRuleResult extends RuleWriteResult {
  rule?: OktaGroupRule;
}

export interface RuleWriteOperations {
  getRawGroupRule: (ruleId: string) => Promise<OktaGroupRule | null>;
  createGroupRule: (payload: CreateRulePayload) => Promise<CreateRuleResult>;
  deleteGroupRule: (ruleId: string) => Promise<RuleWriteResult>;
  activateGroupRule: (ruleId: string) => Promise<RuleWriteResult>;
  deactivateGroupRule: (ruleId: string) => Promise<RuleWriteResult>;
}

export function createRuleWriteOperations(coreApi: CoreApi): RuleWriteOperations {
  const getRawGroupRule = async (ruleId: string): Promise<OktaGroupRule | null> => {
    const response = await coreApi.makeApiRequest(`/api/v1/groups/rules/${ruleId}`);
    if (!response.success || !response.data) return null;
    try {
      return parseOkta(
        oktaGroupRuleSchema,
        response.data,
        'GET /api/v1/groups/rules/{id}',
      ) as unknown as OktaGroupRule;
    } catch (err) {
      log.error('Rule response failed validation', err);
      return null;
    }
  };

  const createGroupRule = async (payload: CreateRulePayload): Promise<CreateRuleResult> => {
    const response = await coreApi.makeApiRequest('/api/v1/groups/rules', 'POST', payload);
    if (!response.success) {
      return { success: false, error: response.error || 'Failed to create rule' };
    }
    try {
      const rule = parseOkta(
        oktaGroupRuleSchema,
        response.data,
        'POST /api/v1/groups/rules',
      ) as unknown as OktaGroupRule;
      return { success: true, rule };
    } catch (err) {
      log.error('Created-rule response failed validation', err);
      return { success: false, error: 'Created rule response was not in the expected shape' };
    }
  };

  const deleteGroupRule = async (ruleId: string): Promise<RuleWriteResult> => {
    const response = await coreApi.makeApiRequest(`/api/v1/groups/rules/${ruleId}`, 'DELETE');
    return { success: response.success, error: response.error };
  };

  const activateGroupRule = async (ruleId: string): Promise<RuleWriteResult> => {
    const response = await coreApi.makeApiRequest(
      `/api/v1/groups/rules/${ruleId}/lifecycle/activate`,
      'POST',
    );
    return { success: response.success, error: response.error };
  };

  const deactivateGroupRule = async (ruleId: string): Promise<RuleWriteResult> => {
    const response = await coreApi.makeApiRequest(
      `/api/v1/groups/rules/${ruleId}/lifecycle/deactivate`,
      'POST',
    );
    return { success: response.success, error: response.error };
  };

  return {
    getRawGroupRule,
    createGroupRule,
    deleteGroupRule,
    activateGroupRule,
    deactivateGroupRule,
  };
}
