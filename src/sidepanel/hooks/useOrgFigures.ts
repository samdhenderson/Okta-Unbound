import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildBox,
  buildFigure,
  buildSubCount,
  oldestWalkAt,
  type FigureSource,
  type OrgBox,
} from '../components/home/orgFigures';
import { countRulesByGroup } from '../../shared/rules/groupRuleIndex';
import type { OrgEntityIndex } from './useOrgEntityIndex';

export const ORG_FIGURES_MAX_AGE_MS = 60 * 60 * 1000;

export interface UseOrgFiguresResult {
  boxes: OrgBox[];
  readAt: number | null;
  isRefreshing: boolean;
  refresh: () => void;
  canRefresh: boolean;
}

export interface UseOrgFiguresOptions {
  index: OrgEntityIndex;
  enabled: boolean;
  connected: boolean;
}

function toSource(snapshot: {
  isReading: boolean;
  complete: boolean;
  lastFullWalkAt: number | null;
  rows: unknown[];
  error: string | null;
  status?: number | null;
}): FigureSource {
  return {
    isReading: snapshot.isReading,
    complete: snapshot.complete,
    lastFullWalkAt: snapshot.lastFullWalkAt,
    count: snapshot.rows.length,
    error: snapshot.error,
    status: snapshot.status,
  };
}

export function useOrgFigures({
  index,
  enabled,
  connected,
}: UseOrgFiguresOptions): UseOrgFiguresResult {
  const { groups, rules } = index;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const groupSource = toSource(groups);
  const ruleSource = toSource(rules);

  const pausedRules = useMemo(
    () => rules.rows.filter((rule) => rule.status === 'INACTIVE').length,
    [rules.rows],
  );

  const emptyUnfilledGroups = useMemo(() => {
    const assigned = countRulesByGroup(
      rules.rows.map((rule) => ({ groupIds: rule.actions?.assignUserToGroups?.groupIds ?? [] })),
    );
    return groups.rows.filter(
      (group) =>
        (group._embedded?.stats?.usersCount ?? 0) === 0 && (assigned.get(group.id) ?? 0) === 0,
    ).length;
  }, [groups.rows, rules.rows]);

  const groupsNamed = { source: groupSource, noun: 'groups' };
  const rulesNamed = { source: ruleSource, noun: 'group rules' };

  const boxes = useMemo(
    () => [
      buildBox(buildFigure('rules', 'Group rules', 'bolt', ruleSource), 'rules', 'group rules', [
        buildSubCount({
          key: 'rules-paused',
          label: 'Group rules paused',
          icon: 'pause',
          counted: rulesNamed,
          count: pausedRules,
          request: { tab: 'rules', view: 'paused' },
        }),
      ]),
      buildBox(buildFigure('groups', 'Groups', 'users', groupSource), 'groups', 'groups', [
        buildSubCount({
          key: 'groups-empty-unfilled',
          label: 'Groups with no members that no rule fills',
          icon: 'users',
          counted: groupsNamed,
          gates: [rulesNamed],
          count: emptyUnfilledGroups,
          request: { tab: 'groups', view: 'empty-no-rules' },
        }),
      ]),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      groupSource.isReading,
      groupSource.complete,
      groupSource.lastFullWalkAt,
      groupSource.count,
      groupSource.error,
      groupSource.status,
      ruleSource.isReading,
      ruleSource.complete,
      ruleSource.lastFullWalkAt,
      ruleSource.count,
      ruleSource.error,
      ruleSource.status,
      emptyUnfilledGroups,
      pausedRules,
    ],
  );

  const readAt = oldestWalkAt([groupSource, ruleSource]);

  const toppedUp = useRef(false);

  const sawReading = useRef(false);
  const anyReading = groups.isReading || rules.isReading;
  const syncRef = useRef(groups.sync);
  syncRef.current = groups.sync;

  useEffect(() => {
    if (anyReading) {
      sawReading.current = true;
      return;
    }
    if (!sawReading.current) return;
    if (!enabled || !connected || toppedUp.current) return;
    toppedUp.current = true;
    if (readAt !== null && Date.now() - readAt <= ORG_FIGURES_MAX_AGE_MS) return;
    void syncRef.current(false);
  }, [enabled, connected, readAt, anyReading]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    void syncRef.current(true).finally(() => setIsRefreshing(false));
  }, []);

  return {
    boxes,
    readAt,
    isRefreshing: isRefreshing || groups.isSyncing || rules.isSyncing,
    refresh,
    canRefresh: connected,
  };
}
