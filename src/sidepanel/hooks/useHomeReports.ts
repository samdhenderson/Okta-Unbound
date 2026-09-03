import { useMemo } from 'react';
import { buildReport, type HomeReport } from '../components/home/homeReports';
import {
  appNamesByGroup,
  findUnmaintainedAppAccess,
  groupIdsFilledByRules,
  APP_ACCESS_CAVEAT,
  type OrphanCandidateGroup,
} from '../components/groups/ruleOrphans';
import { pluralize } from '../../shared/utils/plural';
import {
  figureStatus,
  type FigureSource,
  type OrgFigureStatus,
} from '../components/home/orgFigures';
import type { EntityChoice } from '../components/home/EntityChooser';
import type { OrgEntityIndex } from './useOrgEntityIndex';

export interface UseHomeReportsResult {
  reports: HomeReport[];
  groupChoices: EntityChoice[];
  groupChoicesStatus: OrgFigureStatus;
}

export interface UseHomeReportsOptions {
  index: OrgEntityIndex;
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

export function useHomeReports({ index }: UseHomeReportsOptions): UseHomeReportsResult {
  const { groups, rules, apps, appGroups } = index;

  const candidates = useMemo<OrphanCandidateGroup[]>(
    () =>
      groups.rows.map((group) => ({
        id: group.id,
        name: group.profile?.name || group.id,
        memberCount: group._embedded?.stats?.usersCount ?? 0,
        type: group.type,
        lastMembershipUpdated: group.lastMembershipUpdated,
      })),
    [groups.rows],
  );

  const filled = useMemo(
    () =>
      groupIdsFilledByRules(
        rules.rows.map((rule) => ({ groupIds: rule.actions?.assignUserToGroups?.groupIds ?? [] })),
      ),
    [rules.rows],
  );

  const appNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const app of apps.rows) names.set(app.id, app.label || app.name || app.id);
    return names;
  }, [apps.rows]);

  const byGroup = useMemo(
    () =>
      appNamesByGroup(
        appGroups.records.map((record) => record.id),
        appNames,
      ),
    [appGroups.records, appNames],
  );

  const groupChoices = useMemo<EntityChoice[]>(
    () =>
      candidates.map((group) => ({
        id: group.id,
        name: group.name,
        detail: pluralize(group.memberCount, 'members'),
      })),
    [candidates],
  );

  const groupSource = toSource(groups);
  const ruleSource = toSource(rules);
  const appSource = toSource(apps);
  const appGroupSource = toSource(appGroups);

  const groupsNamed = { source: groupSource, noun: 'groups' };
  const rulesNamed = { source: ruleSource, noun: 'group rules' };
  const appsNamed = { source: appSource, noun: 'applications' };
  const appGroupsNamed = { source: appGroupSource, noun: 'app group assignments' };

  const reports = useMemo(
    () => [
      buildReport({
        key: 'unmaintained-app-access',
        label: 'App access no rule maintains',
        counted: groupsNamed,
        floors: [appGroupsNamed, appsNamed],
        gates: [rulesNamed],
        findings: findUnmaintainedAppAccess(candidates, filled, byGroup),
        caveat: APP_ACCESS_CAVEAT,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      candidates,
      filled,
      byGroup,
      groupSource.isReading,
      groupSource.complete,
      groupSource.lastFullWalkAt,
      groupSource.count,
      groupSource.error,
      ruleSource.isReading,
      ruleSource.complete,
      ruleSource.lastFullWalkAt,
      ruleSource.count,
      ruleSource.error,
      appSource.isReading,
      appSource.complete,
      appSource.lastFullWalkAt,
      appSource.count,
      appSource.error,
      appGroupSource.isReading,
      appGroupSource.complete,
      appGroupSource.lastFullWalkAt,
      appGroupSource.count,
      appGroupSource.error,
    ],
  );

  return { reports, groupChoices, groupChoicesStatus: figureStatus(groupSource) };
}
