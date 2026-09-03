import { z } from 'zod';
import { parseOktaList } from '@/shared/schemas/okta';
import { splitShardedId } from '@/shared/snapshot/types';
import { formatDateShort } from '@/shared/utils/dateFormat';
import {
  appNamesByGroup,
  dormantAccessCaveat,
  dormantAnchorNote,
  findCleanupCandidates,
  findDormantAccess,
  findUnmaintainedAppAccess,
  groupIdsFilledByRules,
  resolveDormantAnchor,
  APP_ACCESS_CAVEAT,
  CLEANUP_CAVEAT,
  DORMANT_ACCESS_CAVEAT_UNANCHORED,
  type GroupFinding,
  type OrphanCandidateGroup,
} from '@/sidepanel/components/groups/ruleOrphans';
import { resolveReportCount } from '@/sidepanel/components/home/homeReports';
import type { CountResolution, NamedSource } from '@/sidepanel/components/home/orgFigures';
import { collectionSource, type OrgSnapshotView } from './snapshot';
import type { SnapshotRows } from './types';

export const reportRowSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  finding: z.string(),
  caveat: z.string(),
  completeness: z.string(),
});

export type ReportRow = z.infer<typeof reportRowSchema>;

export const COMPLETENESS_COLUMN_ID = 'completeness';

const snapshotGroupSchema = z
  .object({
    id: z.string(),
    type: z.string().nullish().catch(undefined),
    profile: z
      .object({ name: z.string().nullish().catch(undefined) })
      .passthrough()
      .nullish()
      .catch(undefined),
    _embedded: z
      .object({
        stats: z
          .object({ usersCount: z.number().nullish().catch(undefined) })
          .passthrough()
          .nullish()
          .catch(undefined),
      })
      .passthrough()
      .nullish()
      .catch(undefined),
    lastMembershipUpdated: z.string().nullish().catch(undefined),
  })
  .passthrough();

const snapshotRuleSchema = z
  .object({
    actions: z
      .object({
        assignUserToGroups: z
          .object({ groupIds: z.array(z.string()).nullish().catch(undefined) })
          .passthrough()
          .nullish()
          .catch(undefined),
      })
      .passthrough()
      .nullish()
      .catch(undefined),
  })
  .passthrough();

const snapshotAppSchema = z
  .object({
    id: z.string(),
    label: z.string().nullish().catch(undefined),
    name: z.string().nullish().catch(undefined),
  })
  .passthrough();

interface JoinInputs {
  candidates: OrphanCandidateGroup[];
  filled: Set<string>;
  appsByGroup: Map<string, string[]>;
  appLinked: Set<string>;
  dropped: number;
  groups: NamedSource;
  rules: NamedSource;
  apps: NamedSource;
  appGroups: NamedSource;
  lastGroupWalkAt: number | null;
}

export function readJoinInputs(snapshot: OrgSnapshotView): JoinInputs {
  const rawGroups = snapshot.groups.rows;
  const rawRules = snapshot.rules.rows;
  const rawApps = snapshot.apps.rows;

  const groupRows = parseOktaList(snapshotGroupSchema, rawGroups, 'SNAPSHOT report groups');
  const ruleRows = parseOktaList(snapshotRuleSchema, rawRules, 'SNAPSHOT report rules');
  const appRows = parseOktaList(snapshotAppSchema, rawApps, 'SNAPSHOT report apps');

  const dropped =
    rawGroups.length -
    groupRows.length +
    (rawRules.length - ruleRows.length) +
    (rawApps.length - appRows.length);

  const candidates: OrphanCandidateGroup[] = groupRows.map((group) => ({
    id: group.id,
    name: group.profile?.name || group.id,
    memberCount: group._embedded?.stats?.usersCount ?? 0,
    type: group.type ?? undefined,
    lastMembershipUpdated: group.lastMembershipUpdated ?? undefined,
  }));

  const filled = groupIdsFilledByRules(
    ruleRows.map((rule) => ({ groupIds: rule.actions?.assignUserToGroups?.groupIds ?? [] })),
  );

  const appNames = new Map<string, string>();
  for (const app of appRows) appNames.set(app.id, app.label || app.name || app.id);

  const recordIds = snapshot.appGroups.records.map((record) => record.id);
  const appsByGroup = appNamesByGroup(recordIds, appNames);

  const appLinked = new Set<string>();
  for (const recordId of recordIds) {
    const split = splitShardedId(recordId);
    if (split) appLinked.add(split.entityId);
  }

  return {
    candidates,
    filled,
    appsByGroup,
    appLinked,
    dropped,
    groups: { source: collectionSource(snapshot.groups), noun: 'groups' },
    rules: { source: collectionSource(snapshot.rules), noun: 'group rules' },
    apps: { source: collectionSource(snapshot.apps), noun: 'applications' },
    appGroups: { source: collectionSource(snapshot.appGroups), noun: 'app group assignments' },
    lastGroupWalkAt: snapshot.groups.lastFullWalkAt,
  };
}

function toSnapshotRows(
  findings: readonly GroupFinding[],
  caveat: string,
  resolution: CountResolution,
  dropped: number,
): SnapshotRows<ReportRow> {
  const completeness = resolution.status === 'partial' ? (resolution.note ?? '') : '';
  const rows =
    resolution.value === null
      ? []
      : findings.map((finding) => ({
          groupId: finding.id,
          groupName: finding.name,
          finding: finding.detail,
          caveat,
          completeness,
        }));
  return { rows, resolution, dropped };
}

export function readGroupCleanupRows(snapshot: OrgSnapshotView): SnapshotRows<ReportRow> {
  const input = readJoinInputs(snapshot);
  const findings = findCleanupCandidates(input.candidates, input.filled, input.appLinked);
  const resolution = resolveReportCount({
    counted: input.groups,
    gates: [input.rules, input.appGroups],
    count: findings.length,
  });
  return toSnapshotRows(findings, CLEANUP_CAVEAT, resolution, input.dropped);
}

export function readUnmaintainedAppAccessRows(snapshot: OrgSnapshotView): SnapshotRows<ReportRow> {
  const input = readJoinInputs(snapshot);
  const findings = findUnmaintainedAppAccess(input.candidates, input.filled, input.appsByGroup);
  const resolution = resolveReportCount({
    counted: input.groups,
    floors: [input.appGroups, input.apps],
    gates: [input.rules],
    count: findings.length,
  });
  return toSnapshotRows(findings, APP_ACCESS_CAVEAT, resolution, input.dropped);
}

export function readDormantAccessRows(
  snapshot: OrgSnapshotView,
  now: number = Date.now(),
): SnapshotRows<ReportRow> {
  const input = readJoinInputs(snapshot);
  const anchor = resolveDormantAnchor(input.lastGroupWalkAt, now);
  const findings = anchor.usable
    ? findDormantAccess(input.candidates, input.filled, input.appsByGroup, anchor.at)
    : [];
  const resolution = resolveReportCount(
    {
      counted: input.groups,
      floors: [input.appGroups, input.apps],
      gates: [input.rules],
      count: findings.length,
    },
    anchor.usable ? undefined : dormantAnchorNote(anchor.reason, formatDateShort(anchor.at)),
  );
  const caveat = anchor.usable
    ? dormantAccessCaveat(formatDateShort(anchor.at))
    : DORMANT_ACCESS_CAVEAT_UNANCHORED;
  return toSnapshotRows(findings, caveat, resolution, input.dropped);
}
