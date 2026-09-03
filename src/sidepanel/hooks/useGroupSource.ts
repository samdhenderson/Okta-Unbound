import { useCallback, useRef, useState } from 'react';
import type { GroupSummary, OktaUser } from '../../shared/types';
import { useOktaApi } from './useOktaApi';
import {
  summarizeMemberSources,
  type MemberSourceBreakdown,
} from '../../shared/membership/groupSource';
import {
  buildMemberSourceIndex,
  type MemberSourceIndex,
} from '../../shared/membership/memberSourceIndex';
import { writeMemberSource } from '../cache/memberSourceCache';
import { getOrFetch } from '../cache/entityCache';
import { cacheKeys } from '../cache/keys';
import { createLogger } from '../../shared/utils/logger';
import type { FormattedRule } from '../../shared/types';

const log = createLogger('useGroupSource');

export type SourceStatus = 'idle' | 'loading' | 'done' | 'error';

export type FeedingRule = FormattedRule;

export interface UseGroupSourceReturn {
  group: GroupSummary | null;
  feedingRules: FeedingRule[];
  rulesStatus: SourceStatus;
  breakdown: MemberSourceBreakdown | null;
  memberStatus: SourceStatus;
  memberSourceIndex: MemberSourceIndex | null;
  error: string | null;
  open: (group: GroupSummary) => void;
  refreshRules: () => void;
  analyzeMembers: () => void;
  resummarize: (members: OktaUser[]) => void;
  close: () => void;
}

export function useGroupSource(targetTabId?: number): UseGroupSourceReturn {
  const api = useOktaApi({ targetTabId: targetTabId ?? null });
  const { getGroupRulesForGroup, getAllGroupMembers } = api;

  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [feedingRules, setFeedingRules] = useState<FeedingRule[]>([]);
  const [rulesStatus, setRulesStatus] = useState<SourceStatus>('idle');
  const [breakdown, setBreakdown] = useState<MemberSourceBreakdown | null>(null);
  const [memberSourceIndex, setMemberSourceIndex] = useState<MemberSourceIndex | null>(null);
  const [memberStatus, setMemberStatus] = useState<SourceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const runIdRef = useRef(0);

  const lastRulesRef = useRef<Parameters<typeof summarizeMemberSources>[2] | null>(null);

  const open = useCallback(
    (nextGroup: GroupSummary) => {
      const runId = ++runIdRef.current;
      setGroup(nextGroup);
      setFeedingRules([]);
      setBreakdown(null);
      setMemberSourceIndex(null);
      setMemberStatus('idle');
      setError(null);
      setRulesStatus('loading');

      getGroupRulesForGroup(nextGroup.id)
        .then((rules) => {
          if (runId !== runIdRef.current) return;
          setFeedingRules(rules);
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

  const refreshRules = useCallback(() => {
    if (!group) return;
    const runId = runIdRef.current;

    if (feedingRules.length === 0) setRulesStatus('loading');

    getGroupRulesForGroup(group.id)
      .then((rules) => {
        if (runId !== runIdRef.current) return;
        setFeedingRules(rules);
        setRulesStatus('done');
      })
      .catch((err) => {
        if (runId !== runIdRef.current) return;
        log.error('Failed to refresh feeding rules:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feeding rules');
        setRulesStatus('error');
      });
  }, [group, feedingRules.length, getGroupRulesForGroup]);

  const analyzeMembers = useCallback(() => {
    if (!group) return;
    const runId = runIdRef.current;
    setMemberStatus('loading');
    setError(null);

    Promise.all([
      getOrFetch(cacheKeys.groupMembers(group.id), () =>
        getAllGroupMembers(group.id, { memberCount: group.memberCount }),
      ),
      getGroupRulesForGroup(group.id),
    ])
      .then(([members, rules]) => {
        if (runId !== runIdRef.current) return;
        lastRulesRef.current = rules;
        const summary = summarizeMemberSources(
          { id: group.id, name: group.name, type: group.type },
          members,
          rules,
        );
        setBreakdown(summary);
        setMemberSourceIndex(
          buildMemberSourceIndex(
            { id: group.id, name: group.name, type: group.type },
            members,
            rules,
          ),
        );
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

  const resummarize = useCallback(
    (members: OktaUser[]) => {
      const rules = lastRulesRef.current;
      if (!group || !rules) return;
      const summary = summarizeMemberSources(
        { id: group.id, name: group.name, type: group.type },
        members,
        rules,
      );
      setBreakdown(summary);
      setMemberSourceIndex(
        buildMemberSourceIndex(
          { id: group.id, name: group.name, type: group.type },
          members,
          rules,
        ),
      );
      writeMemberSource(group.id, summary);
    },
    [group],
  );

  const close = useCallback(() => {
    runIdRef.current++;
    setGroup(null);
    setFeedingRules([]);
    setMemberSourceIndex(null);
    setRulesStatus('idle');
    setBreakdown(null);
    setMemberStatus('idle');
    setError(null);
    lastRulesRef.current = null;
  }, []);

  return {
    group,
    feedingRules,
    rulesStatus,
    breakdown,
    memberStatus,
    memberSourceIndex,
    error,
    open,
    refreshRules,
    analyzeMembers,
    resummarize,
    close,
  };
}
