import { useRef, useState } from 'react';
import { useOwedLoad } from './useOwedLoad';
import { useOktaApi } from './useOktaApi';
import { extractReferencedGroupIds } from '../../shared/rules/groupRuleIndex';
import { createLogger } from '../../shared/utils/logger';
import type { SourceStatus } from './useGroupSource';
import type { FormattedRule } from '../../shared/types';

const log = createLogger('useGroupRuleReferences');

export type ReferencingRule = FormattedRule;

export interface UseGroupRuleReferencesReturn {
  rules: ReferencingRule[];
  status: SourceStatus;
  error: string | null;
}

export function useGroupRuleReferences(
  groupId: string,
  targetTabId?: number,
  enabled = true,
): UseGroupRuleReferencesReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const { ensureGroupRulesLoaded } = api;

  const [rules, setRules] = useState<ReferencingRule[]>([]);
  const [status, setStatus] = useState<SourceStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const [lastGroupId, setLastGroupId] = useState(groupId);
  if (groupId !== lastGroupId) {
    setLastGroupId(groupId);
    setRules([]);
    setStatus('loading');
    setError(null);
  }

  useOwedLoad(targetTabId == null ? groupId : `${targetTabId}:${groupId}`, enabled, () => {
    const runId = ++runIdRef.current;

    ensureGroupRulesLoaded()
      .then((all) => {
        if (runId !== runIdRef.current) return;
        if (!all) {
          setError('Could not load the org rules, so references to this group are unknown.');
          setStatus('error');
          return;
        }
        setRules(
          all.filter((rule) =>
            extractReferencedGroupIds(rule.conditionExpression).includes(groupId),
          ),
        );
        setStatus('done');
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        log.error('Failed to load referencing rules:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referencing rules');
        setStatus('error');
      });
  });

  return { rules, status, error };
}
