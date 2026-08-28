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
import { isGroupPushApp } from '../../shared/schemas/okta';
import { splitShardedId } from '../../shared/snapshot/types';
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
}): FigureSource {
  return {
    isReading: snapshot.isReading,
    complete: snapshot.complete,
    lastFullWalkAt: snapshot.lastFullWalkAt,
    count: snapshot.rows.length,
    error: snapshot.error,
  };
}

export function useOrgFigures({
  index,
  enabled,
  connected,
}: UseOrgFiguresOptions): UseOrgFiguresResult {
  const { groups, rules, apps, appGroups } = index;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const groupSource = toSource(groups);
  const ruleSource = toSource(rules);
  const appSource = toSource(apps);
  const appGroupSource = toSource(appGroups);

  const pausedRules = useMemo(
    () => rules.rows.filter((rule) => rule.status === 'INACTIVE').length,
    [rules.rows],
  );

  const emptyGroups = useMemo(
    () => groups.rows.filter((group) => (group._embedded?.stats?.usersCount ?? 0) === 0).length,
    [groups.rows],
  );

  const unruledGroups = useMemo(() => {
    const assigned = countRulesByGroup(
      rules.rows.map((rule) => ({ groupIds: rule.actions?.assignUserToGroups?.groupIds ?? [] })),
    );
    return groups.rows.filter((group) => (assigned.get(group.id) ?? 0) === 0).length;
  }, [groups.rows, rules.rows]);

  const inactiveApps = useMemo(
    () => apps.rows.filter((app) => app.status?.toUpperCase() !== 'ACTIVE').length,
    [apps.rows],
  );

  const idlePushApps = useMemo(() => {
    const withAssignments = new Set<string>();
    for (const record of appGroups.records) {
      const split = splitShardedId(record.id);
      if (split) withAssignments.add(split.shardKey);
    }
    return apps.rows.filter((app) => isGroupPushApp(app.features) && !withAssignments.has(app.id))
      .length;
  }, [apps.rows, appGroups.records]);

  const groupsNamed = { source: groupSource, noun: 'groups' };
  const appsNamed = { source: appSource, noun: 'applications' };
  const rulesNamed = { source: ruleSource, noun: 'group rules' };
  const appGroupsNamed = { source: appGroupSource, noun: 'app group assignments' };

  const boxes = useMemo(
    () => [
      buildBox(buildFigure('groups', 'Groups', 'users', groupSource), 'groups', 'groups', [
        buildSubCount({
          key: 'groups-empty',
          label: 'Groups with no members',
          counted: groupsNamed,
          count: emptyGroups,
          request: { tab: 'groups', view: 'empty' },
        }),
        buildSubCount({
          key: 'groups-unruled',
          label: 'Groups no rule fills',
          counted: groupsNamed,
          gates: [rulesNamed],
          count: unruledGroups,
          request: { tab: 'groups', view: 'no-rules' },
        }),
      ]),
      buildBox(buildFigure('apps', 'Applications', 'app', appSource), 'apps', 'applications', [
        buildSubCount({
          key: 'apps-inactive',
          label: 'Deactivated applications',
          counted: appsNamed,
          count: inactiveApps,
          request: { tab: 'apps', view: 'inactive' },
        }),
        buildSubCount({
          key: 'apps-idle-push',
          label: 'Push apps pushing nothing',
          counted: appsNamed,
          gates: [appGroupsNamed],
          count: idlePushApps,
          request: { tab: 'apps', view: 'pushes-nothing' },
        }),
      ]),
      buildBox(buildFigure('rules', 'Group rules', 'bolt', ruleSource), 'rules', 'group rules', [
        buildSubCount({
          key: 'rules-paused',
          label: 'Paused group rules',
          counted: rulesNamed,
          count: pausedRules,
          request: { tab: 'rules', view: 'paused' },
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
      appSource.isReading,
      appSource.complete,
      appSource.lastFullWalkAt,
      appSource.count,
      appSource.error,
      ruleSource.isReading,
      ruleSource.complete,
      ruleSource.lastFullWalkAt,
      ruleSource.count,
      ruleSource.error,
      appGroupSource.isReading,
      appGroupSource.complete,
      appGroupSource.lastFullWalkAt,
      appGroupSource.count,
      appGroupSource.error,
      emptyGroups,
      unruledGroups,
      inactiveApps,
      idlePushApps,
      pausedRules,
    ],
  );

  const readAt = oldestWalkAt([groupSource, appSource, ruleSource]);

  const toppedUp = useRef(false);

  const sawReading = useRef(false);
  const anyReading = groups.isReading || apps.isReading || rules.isReading || appGroups.isReading;
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
    isRefreshing: isRefreshing || groups.isSyncing || apps.isSyncing || rules.isSyncing,
    refresh,
    canRefresh: connected,
  };
}
