import { useMemo, useState } from 'react';
import {
  explainRuleExpression,
  type RuleExplanation,
} from '../../../shared/rules/explainExpression';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import type { OktaUser } from '../../../shared/types';
import type { GroupNameResolver } from './RuleExpressionText';

export interface UseClauseLedgerOptions {
  maxClauses?: number;
  groupContext?: RuleGroupContext;
  resolveGroupName?: GroupNameResolver;
  defaultShowRaw?: boolean;
}

export interface UseClauseLedgerResult {
  explanation: RuleExplanation;
  resolveGroupName?: GroupNameResolver;
  showRaw: boolean;
  toggleRaw: () => void;
}

export function useClauseLedger(
  expression: string,
  user: OktaUser,
  options: UseClauseLedgerOptions = {},
): UseClauseLedgerResult {
  const {
    maxClauses,
    groupContext,
    resolveGroupName: resolveFromHost,
    defaultShowRaw = false,
  } = options;

  const explanation = useMemo(
    () => explainRuleExpression(expression, user, { maxClauses, groups: groupContext }),
    [expression, user, maxClauses, groupContext],
  );

  const resolveGroupName = useMemo<GroupNameResolver | undefined>(() => {
    const namesById = new Map((groupContext ?? []).map((entry) => [entry.id, entry.name]));
    if (namesById.size === 0 && !resolveFromHost) return undefined;
    return (groupId) => namesById.get(groupId) ?? resolveFromHost?.(groupId);
  }, [groupContext, resolveFromHost]);

  const [showRaw, setShowRaw] = useState(defaultShowRaw);
  const toggleRaw = (): void => setShowRaw((previous) => !previous);

  return { explanation, resolveGroupName, showRaw, toggleRaw };
}
