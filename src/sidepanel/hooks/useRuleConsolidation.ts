import { useCallback, useState } from 'react';
import type { FormattedRule, OktaGroupRule, AuditLogEntry } from '../../shared/types';
import type { RetiredRuleSnapshot } from '../../shared/undoTypes';
import type { AlertMessageData } from '../components/shared/AlertMessage';
import { useOktaApi } from './useOktaApi';
import { useActorNotice } from './useActorNotice';
import { logAction } from '../../shared/undoManager';
import { auditStore } from '../../shared/storage/auditStore';
import { RulesCache } from '../../shared/rulesCache';
import {
  buildConsolidatedRulePayload,
  consolidatedRuleName,
  unionTargetGroups,
} from '../../shared/rules/consolidation';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useRuleConsolidation');

export type ConsolidationPhase =
  'idle' | 'loading' | 'select' | 'preview' | 'running' | 'done' | 'error';

export type ConsolidationMode = 'add-target' | 'merge';

export interface RetireRuleRef {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ConsolidationPreview {
  mode: ConsolidationMode;
  baseName: string;
  resultingName: string;
  resultingGroupIds: string[];
  addedGroupIds: string[];
  addedGroupNames: string[];
  retireRules: RetireRuleRef[];
  willActivate: boolean;
}

export interface ConsolidationResult {
  createdRuleId: string;
  createdRuleName: string;
  retired: number;
  retireFailed: number;
}

interface UseRuleConsolidationOptions {
  targetTabId?: number;
  reload: () => Promise<void>;
  onError: (message: string) => void;
}

export interface UseRuleConsolidationReturn {
  phase: ConsolidationPhase;
  preview: ConsolidationPreview | null;
  result: ConsolidationResult | null;
  error: string | null;
  actorNotice: AlertMessageData | null;
  dismissActorNotice: () => void;
  openAddTarget: (rule: FormattedRule) => void;
  chooseGroup: (groupId: string, groupName: string) => void;
  openMerge: (baseRuleId: string, cluster: RetireRuleRef[], unionGroupIds: string[]) => void;
  execute: () => Promise<void>;
  close: () => void;
}

export function useRuleConsolidation({
  targetTabId,
  reload,
  onError,
}: UseRuleConsolidationOptions): UseRuleConsolidationReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const {
    getRawGroupRule,
    createGroupRule,
    deleteGroupRule,
    activateGroupRule,
    deactivateGroupRule,
    getCurrentUser,
  } = api;
  const { actorNotice, noteActor, dismissActorNotice } = useActorNotice();

  const [phase, setPhase] = useState<ConsolidationPhase>('idle');
  const [baseRule, setBaseRule] = useState<OktaGroupRule | null>(null);
  const [preview, setPreview] = useState<ConsolidationPreview | null>(null);
  const [result, setResult] = useState<ConsolidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAddTarget = useCallback(
    (rule: FormattedRule) => {
      setPhase('loading');
      setPreview(null);
      setResult(null);
      setError(null);
      getRawGroupRule(rule.id)
        .then((raw) => {
          if (!raw) {
            setError('Could not load the rule to consolidate.');
            setPhase('error');
            return;
          }
          setBaseRule(raw);
          setPhase('select');
        })
        .catch((err) => {
          log.error('Failed to load rule:', err);
          setError(err instanceof Error ? err.message : 'Failed to load rule');
          setPhase('error');
        });
    },
    [getRawGroupRule],
  );

  const chooseGroup = useCallback(
    (groupId: string, groupName: string) => {
      if (!baseRule) return;
      const resultingGroupIds = unionTargetGroups(baseRule, [groupId]);
      setPreview({
        mode: 'add-target',
        baseName: baseRule.name,
        resultingName: consolidatedRuleName(baseRule.name),
        resultingGroupIds,
        addedGroupIds: [groupId],
        addedGroupNames: [groupName],
        retireRules: [{ id: baseRule.id, name: baseRule.name, status: baseRule.status }],
        willActivate: baseRule.status === 'ACTIVE',
      });
      setPhase('preview');
    },
    [baseRule],
  );

  const openMerge = useCallback(
    (baseRuleId: string, cluster: RetireRuleRef[], unionGroupIds: string[]) => {
      setPhase('loading');
      setPreview(null);
      setResult(null);
      setError(null);
      getRawGroupRule(baseRuleId)
        .then((raw) => {
          if (!raw) {
            setError('Could not load the primary rule to merge.');
            setPhase('error');
            return;
          }
          setBaseRule(raw);
          setPreview({
            mode: 'merge',
            baseName: raw.name,
            resultingName: consolidatedRuleName(raw.name),
            resultingGroupIds: unionGroupIds,
            addedGroupIds: [],
            addedGroupNames: [],
            retireRules: cluster,
            willActivate: cluster.some((r) => r.status === 'ACTIVE'),
          });
          setPhase('preview');
        })
        .catch((err) => {
          log.error('Failed to load primary rule:', err);
          setError(err instanceof Error ? err.message : 'Failed to load rule');
          setPhase('error');
        });
    },
    [getRawGroupRule],
  );

  const execute = useCallback(async () => {
    if (!baseRule || !preview) return;
    setPhase('running');
    setError(null);
    const startTime = Date.now();

    const actor = await getCurrentUser();
    noteActor(actor);

    try {
      const addGroupIds =
        preview.mode === 'add-target' ? preview.addedGroupIds : preview.resultingGroupIds; // merge: union (dedup handled by builder)
      const payload = buildConsolidatedRulePayload(baseRule, addGroupIds);
      const created = await createGroupRule(payload);
      if (!created.success || !created.rule) {
        onError(created.error || 'Failed to create the consolidated rule');
        setError(created.error || 'Failed to create the consolidated rule');
        setPhase('error');
        return;
      }

      await RulesCache.clear();

      if (preview.willActivate) {
        const activated = await activateGroupRule(created.rule.id);
        if (!activated.success) {
          const msg = `Created "${created.rule.name}" but could not activate it; source rules left untouched.`;
          onError(activated.error || msg);
          setError(activated.error || msg);
          setPhase('error');
          return;
        }
      }

      const retiredSnapshots: RetiredRuleSnapshot[] = [];
      let retired = 0;
      let retireFailed = 0;
      for (const ref of preview.retireRules) {
        const raw = ref.id === baseRule.id ? baseRule : await getRawGroupRule(ref.id);
        if (ref.status === 'ACTIVE') {
          await deactivateGroupRule(ref.id);
        }
        const del = await deleteGroupRule(ref.id);
        if (del.success) {
          retired++;
          if (raw) {
            retiredSnapshots.push({
              id: raw.id,
              name: raw.name,
              expression: raw.conditions?.expression?.value ?? '',
              groupIds: raw.actions?.assignUserToGroups?.groupIds ?? [],
            });
          }
        } else {
          retireFailed++;
        }
      }

      await logAction(
        `Consolidated ${preview.retireRules.length} rule${preview.retireRules.length === 1 ? '' : 's'} into ${created.rule.name}`,
        {
          type: 'CONSOLIDATE_RULE',
          createdRuleId: created.rule.id,
          createdRuleName: created.rule.name,
          createdGroupIds: preview.resultingGroupIds,
          retiredRules: retiredSnapshots,
        },
      );
      const auditEntry: AuditLogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'activate_rule',
        groupId: preview.resultingGroupIds[0] || 'multiple',
        groupName: created.rule.name,
        performedBy: actor.kind === 'resolved' ? actor.email : null,
        actorResolution: actor.kind === 'resolved' ? 'resolved' : 'unavailable',
        affectedUsers: [],
        result: retireFailed === 0 ? 'success' : 'partial',
        details: {
          usersSucceeded: retired,
          usersFailed: retireFailed,
          apiRequestCount: 2 + preview.retireRules.length,
          durationMs: Date.now() - startTime,
        },
      };
      auditStore.logOperation(auditEntry).catch((e) => log.error('audit failed', e));

      setResult({
        createdRuleId: created.rule.id,
        createdRuleName: created.rule.name,
        retired,
        retireFailed,
      });
      setPhase('done');
      await reload();
    } catch (err) {
      log.error('Consolidation failed:', err);
      const msg = err instanceof Error ? err.message : 'Consolidation failed';
      onError(msg);
      setError(msg);
      setPhase('error');
    }
  }, [
    baseRule,
    preview,
    createGroupRule,
    activateGroupRule,
    deactivateGroupRule,
    deleteGroupRule,
    getRawGroupRule,
    getCurrentUser,
    noteActor,
    onError,
    reload,
  ]);

  const close = useCallback(() => {
    setPhase('idle');
    setBaseRule(null);
    setPreview(null);
    setResult(null);
    setError(null);
    dismissActorNotice();
  }, [dismissActorNotice]);

  return {
    phase,
    preview,
    result,
    error,
    actorNotice,
    dismissActorNotice,
    openAddTarget,
    chooseGroup,
    openMerge,
    execute,
    close,
  };
}
