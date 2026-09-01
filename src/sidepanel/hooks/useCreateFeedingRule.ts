import { useCallback, useMemo, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import { RulesCache } from '../../shared/rulesCache';
import { parseRuleExpression } from '../../shared/ruleEvaluator';
import { unevaluableReasonText } from '../../shared/rules/unevaluableReasonText';
import { createLogger } from '../../shared/utils/logger';
import type { GroupSummary } from '../../shared/types';

const log = createLogger('useCreateFeedingRule');

const OKTA_EXPRESSION_TYPE = 'urn:okta:expression:1.0';

const OKTA_GROUP_RULE_TYPE = 'group_rule';

export const MAX_RULE_NAME_LENGTH = 50;

export interface UseCreateFeedingRuleOptions {
  targetTabId: number | null;
  group: GroupSummary;
}

export interface UseCreateFeedingRuleReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  name: string;
  setName: (value: string) => void;
  nameError: string | null;
  expression: string;
  setExpression: (value: string) => void;
  expressionNotice: string | null;
  canSubmit: boolean;
  isCreating: boolean;
  error: string | null;
  createdRuleName: string | null;
  createdRuleId: string | null;
  confirm: () => Promise<void>;
}

export function useCreateFeedingRule({
  targetTabId,
  group,
}: UseCreateFeedingRuleOptions): UseCreateFeedingRuleReturn {
  const { createGroupRule } = useOktaApi({ targetTabId });

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRuleName, setCreatedRuleName] = useState<string | null>(null);
  const [createdRuleId, setCreatedRuleId] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedExpression = expression.trim();

  const nameError =
    trimmedName.length > MAX_RULE_NAME_LENGTH
      ? `Okta allows ${MAX_RULE_NAME_LENGTH} characters; this is ${trimmedName.length}.`
      : null;

  const expressionNotice = useMemo(() => {
    if (!trimmedExpression) return null;
    const parsed = parseRuleExpression(trimmedExpression);
    if (parsed.ok) return null;
    return `${unevaluableReasonText(parsed.reasonCode)} Okta is the authority on its own expression language — this panel reads a subset of it, so the rule may still be valid.`;
  }, [trimmedExpression]);

  const canSubmit =
    targetTabId !== null &&
    trimmedName.length > 0 &&
    nameError === null &&
    trimmedExpression.length > 0 &&
    !isCreating &&
    createdRuleName === null;

  const reset = useCallback(() => {
    setName('');
    setExpression('');
    setError(null);
    setIsCreating(false);
    setCreatedRuleName(null);
    setCreatedRuleId(null);
  }, []);

  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const close = useCallback(() => {
    setIsOpen(false);
    reset();
  }, [reset]);

  const confirm = useCallback(async () => {
    if (!canSubmit) return;
    setIsCreating(true);
    setError(null);

    try {
      const created = await createGroupRule({
        type: OKTA_GROUP_RULE_TYPE,
        name: trimmedName,
        conditions: { expression: { value: trimmedExpression, type: OKTA_EXPRESSION_TYPE } },
        actions: { assignUserToGroups: { groupIds: [group.id] } },
      });

      if (!created.success || !created.rule) {
        setError(created.error || 'Failed to create the rule');
        return;
      }

      await RulesCache.clear();
      log.info('Created group rule', { ruleId: created.rule.id, groupId: group.id });
      setCreatedRuleName(created.rule.name);
      setCreatedRuleId(created.rule.id);
    } catch (err) {
      log.error('Failed to create group rule', err);
      setError(err instanceof Error ? err.message : 'Failed to create the rule');
    } finally {
      setIsCreating(false);
    }
  }, [canSubmit, createGroupRule, trimmedName, trimmedExpression, group.id]);

  return {
    isOpen,
    open,
    close,
    name,
    setName,
    nameError,
    expression,
    setExpression,
    expressionNotice,
    canSubmit,
    isCreating,
    error,
    createdRuleName,
    createdRuleId,
    confirm,
  };
}
