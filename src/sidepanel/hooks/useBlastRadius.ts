import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeBlastRadius } from '../../shared/membership/blastRadius';
import type {
  BlastRadiusReport,
  RuleInventoryState,
} from '../../shared/membership/blastRadiusTypes';
import type { GroupMembership, OktaUser } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { loadCachedGroupNames } from './fetchGroupRulesRequest';

const log = createLogger('BlastRadius');

const NOT_COMPUTED: BlastRadiusReport = Object.freeze({
  status: 'not-computed',
  groups: [],
  rules: [],
  counts: { added: 0, removed: 0, notPredicted: 0, starts: 0, stops: 0, undetermined: 0 },
  secondOrderPossible: false,
  secondOrderRuleNames: [],
}) as BlastRadiusReport;

interface ReportState {
  readonly userId: string | null;
  readonly report: BlastRadiusReport;
}

const IDLE: ReportState = { userId: null, report: NOT_COMPUTED };

export interface UseBlastRadiusOptions {
  user: OktaUser | null;
  memberships: readonly GroupMembership[];
  rules: RuleInventoryState;
}

export interface UseBlastRadiusReturn {
  report: BlastRadiusReport;
  analyze: (draft: Readonly<Record<string, unknown>>) => void;
  reset: () => void;
  isAnalyzing: boolean;
}

export function useBlastRadius({
  user,
  memberships,
  rules,
}: UseBlastRadiusOptions): UseBlastRadiusReturn {
  const [state, setState] = useState<ReportState>(IDLE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const groupNamesRef = useRef<ReadonlyMap<string, string> | null>(null);
  const mountedRef = useRef(true);
  const runIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setState(IDLE);
    setIsAnalyzing(false);
  }, []);

  const currentUserId = user?.id ?? null;
  const report = state.userId === currentUserId ? state.report : NOT_COMPUTED;

  const analyze = useCallback(
    (draft: Readonly<Record<string, unknown>>) => {
      if (!user) {
        reset();
        return;
      }

      runIdRef.current += 1;
      const runId = runIdRef.current;
      setIsAnalyzing(true);

      void (async () => {
        let groupNames = groupNamesRef.current;
        if (!groupNames) {
          groupNames = await loadCachedGroupNames();
          groupNamesRef.current = groupNames;
        }
        if (!mountedRef.current || runIdRef.current !== runId) return;

        const next = analyzeBlastRadius({ user, draft, memberships, rules, groupNames });
        setState({ userId: user.id, report: next });
        setIsAnalyzing(false);
        log.debug('Analyzed', next.status, next.counts);
      })();
    },
    [user, memberships, rules, reset],
  );

  return { report, analyze, reset, isAnalyzing };
}
