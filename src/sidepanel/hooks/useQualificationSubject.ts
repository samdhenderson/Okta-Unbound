import { useCallback, useEffect, useRef, useState } from 'react';
import type { OktaGroup, OktaUser } from '../../shared/types';
import type { RuleGroupContext } from '../../shared/ruleEvaluator';
import { groupContextOfGroups } from '../../shared/membership/groupContext';
import { createLogger } from '../../shared/utils/logger';
import { useOktaApi } from './useOktaApi';
import type { QualificationSubjectFailure } from './useOktaApi/qualificationSubject';

const log = createLogger('useQualificationSubject');

export type QualificationSubjectState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading'; readonly userId: string }
  | {
      readonly status: 'loaded';
      readonly userId: string;
      readonly user: OktaUser;
      readonly groups: readonly OktaGroup[];
      readonly groupContext: RuleGroupContext;
    }
  | {
      readonly status: 'failed';
      readonly userId: string;
      readonly reason: QualificationSubjectFailure | 'no-tab';
    };

export interface UseQualificationSubjectOptions {
  targetTabId: number | null;
  scopeKey: string | null;
}

export interface UseQualificationSubjectReturn {
  state: QualificationSubjectState;
  load: (userId: string) => void;
  clear: () => void;
}

const IDLE = { scopeKey: null, state: { status: 'idle' } } as const;

interface Held {
  readonly scopeKey: string | null;
  readonly state: QualificationSubjectState;
}

export function useQualificationSubject({
  targetTabId,
  scopeKey,
}: UseQualificationSubjectOptions): UseQualificationSubjectReturn {
  const { loadQualificationSubject } = useOktaApi({ targetTabId });
  const [held, setHeld] = useState<Held>(IDLE);
  const mountedRef = useRef(true);
  const runIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const state: QualificationSubjectState = held.scopeKey === scopeKey ? held.state : IDLE.state;

  const clear = useCallback(() => {
    runIdRef.current += 1;
    setHeld(IDLE);
  }, []);

  const load = useCallback(
    (userId: string) => {
      runIdRef.current += 1;
      const runId = runIdRef.current;

      if (targetTabId === null) {
        setHeld({ scopeKey, state: { status: 'failed', userId, reason: 'no-tab' } });
        return;
      }

      setHeld({ scopeKey, state: { status: 'loading', userId } });

      void (async () => {
        const result = await loadQualificationSubject(userId);
        if (!mountedRef.current || runIdRef.current !== runId) return;

        if (!result.ok) {
          log.debug('Subject failed', { userId, reason: result.reason });
          setHeld({ scopeKey, state: { status: 'failed', userId, reason: result.reason } });
          return;
        }

        log.debug('Subject loaded', { userId, groupCount: result.groups.length });
        setHeld({
          scopeKey,
          state: {
            status: 'loaded',
            userId,
            user: result.user,
            groups: result.groups,
            groupContext: groupContextOfGroups(result.groups),
          },
        });
      })();
    },
    [loadQualificationSubject, scopeKey, targetTabId],
  );

  return { state, load, clear };
}
