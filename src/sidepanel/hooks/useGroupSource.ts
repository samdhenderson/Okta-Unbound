import { useCallback, useRef, useState } from 'react';
import type { GroupSummary } from '../../shared/types';
import { useOktaApi } from './useOktaApi';
import {
  summarizeMemberSources,
  type MemberSourceBreakdown,
} from '../../shared/membership/groupSource';
import { writeMemberSource } from '../cache/memberSourceCache';
import { getOrFetch } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useGroupSource');

export type SourceStatus = 'idle' | 'loading' | 'done' | 'error';

export interface FeedingRule {
  id: string;
  name: string;
  status: string;
}

export interface UseGroupSourceReturn {
  group: GroupSummary | null;
  feedingRules: FeedingRule[];
  rulesStatus: SourceStatus;
  breakdown: MemberSourceBreakdown | null;
  memberStatus: SourceStatus;
  error: string | null;
  open: (group: GroupSummary) => void;
  analyzeMembers: () => void;
  close: () => void;
}

export function useGroupSource(targetTabId?: number): UseGroupSourceReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const { getGroupRulesForGroup, getAllGroupMembers } = api;

  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [feedingRules, setFeedingRules] = useState<FeedingRule[]>([]);
  const [rulesStatus, setRulesStatus] = useState<SourceStatus>('idle');
  const [breakdown, setBreakdown] = useState<MemberSourceBreakdown | null>(null);
  const [memberStatus, setMemberStatus] = useState<SourceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const open = useCallback(
    (nextGroup: GroupSummary) => {
      const runId = ++runIdRef.current;
      setGroup(nextGroup);
      setFeedingRules([]);
      setBreakdown(null);
      setMemberStatus('idle');
      setError(null);
      setRulesStatus('loading');

      getGroupRulesForGroup(nextGroup.id)
        .then((rules) => {
          if (runId !== runIdRef.current) return;
          setFeedingRules(rules.map((r) => ({ id: r.id, name: r.name, status: r.status })));
          setRulesStatus('done');
        })
        .catch((err) => {
          if (runId !== runIdRef.current) return;
          log.error('Failed to load feeding rules:', err);
          setError(err instanceof Error ? err.message : 'Failed to load feeding rules');
          setRulesStatus('error');
        });
    },
    [getGroupRulesForGroup],
  );

  const analyzeMembers = useCallback(() => {
    if (!group) return;
    const runId = runIdRef.current;
    setMemberStatus('loading');
    setError(null);

    Promise.all([
      getOrFetch(cacheKeys.groupMembers(group.id), () => getAllGroupMembers(group.id)),
      getGroupRulesForGroup(group.id),
    ])
      .then(([members, rules]) => {
        if (runId !== runIdRef.current) return;
        const summary = summarizeMemberSources(
          { id: group.id, name: group.name, type: group.type },
          members,
          rules,
        );
        setBreakdown(summary);
        writeMemberSource(group.id, summary);
        setMemberStatus('done');
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        log.error('Failed to analyze members:', err);
        setError(err instanceof Error ? err.message : 'Failed to analyze members');
        setMemberStatus('error');
      });
  }, [group, getAllGroupMembers, getGroupRulesForGroup]);

  const close = useCallback(() => {
    runIdRef.current++;
    setGroup(null);
    setFeedingRules([]);
    setRulesStatus('idle');
    setBreakdown(null);
    setMemberStatus('idle');
    setError(null);
  }, []);

  return {
    group,
    feedingRules,
    rulesStatus,
    breakdown,
    memberStatus,
    error,
    open,
    analyzeMembers,
    close,
  };
}
