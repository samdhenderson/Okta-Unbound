import { pluralize } from '../../../shared/utils/plural';
import { splitShardedId } from '../../../shared/snapshot/types';

export const INVISIBLE_MAINTAINERS =
  'Okta Workflows, SCIM and HR provisioning, direct API writes, and IdP group sync ' +
  'can all fill a group without leaving anything here to see.';

export const PUSH_APPS_ONLY =
  'Covers the apps this extension reads group assignments for — those with group ' +
  'push enabled. An app outside that set contributes nothing here.';

export const CLEANUP_CAVEAT = `Findings, not a delete list. ${INVISIBLE_MAINTAINERS} ${PUSH_APPS_ONLY}`;

export const APP_ACCESS_CAVEAT = `${PUSH_APPS_ONLY} ${INVISIBLE_MAINTAINERS}`;

export interface OrphanCandidateGroup {
  id: string;
  name: string;
  memberCount: number;
  type?: string;
  lastMembershipUpdated?: string;
}

export interface RuleAssignment {
  groupIds: readonly string[];
}

export interface RuleTargets extends RuleAssignment {
  id: string;
  name: string;
}

export interface MissingTargetFinding {
  id: string;
  name: string;
  missingGroupIds: string[];
}

export interface GroupFinding {
  id: string;
  name: string;
  detail: string;
}

export function groupIdsFilledByRules(rules: readonly RuleAssignment[]): Set<string> {
  const filled = new Set<string>();
  for (const rule of rules) {
    for (const groupId of rule.groupIds) filled.add(groupId);
  }
  return filled;
}

export function appNamesByGroup(
  recordIds: readonly string[],
  appNames: ReadonlyMap<string, string>,
): Map<string, string[]> {
  const byGroup = new Map<string, string[]>();
  for (const recordId of recordIds) {
    const split = splitShardedId(recordId);
    if (!split) continue;
    const names = byGroup.get(split.entityId);
    const name = appNames.get(split.shardKey) ?? split.shardKey;
    if (names) names.push(name);
    else byGroup.set(split.entityId, [name]);
  }
  return byGroup;
}

export function findRulesWithMissingTargets(
  rules: readonly RuleTargets[],
  knownGroupIds: ReadonlySet<string>,
  groupWalkComplete: boolean,
): MissingTargetFinding[] {
  if (!groupWalkComplete) return [];
  const findings: MissingTargetFinding[] = [];
  for (const rule of rules) {
    const missingGroupIds = rule.groupIds.filter((id) => !knownGroupIds.has(id));
    if (missingGroupIds.length > 0) {
      findings.push({ id: rule.id, name: rule.name, missingGroupIds });
    }
  }
  return findings;
}

function byName(a: GroupFinding, b: GroupFinding): number {
  return a.name.localeCompare(b.name);
}

export function findCleanupCandidates(
  groups: readonly OrphanCandidateGroup[],
  filledGroupIds: ReadonlySet<string>,
  appLinkedGroupIds: ReadonlySet<string>,
): GroupFinding[] {
  return groups
    .filter(
      (group) =>
        group.memberCount === 0 &&
        group.type !== 'APP_GROUP' &&
        group.type !== 'BUILT_IN' &&
        !filledGroupIds.has(group.id) &&
        !appLinkedGroupIds.has(group.id),
    )
    .map((group) => ({
      id: group.id,
      name: group.name,
      detail: 'No members · no rule fills it · no app assigned',
    }))
    .sort(byName);
}

export function findUnmaintainedAppAccess(
  groups: readonly OrphanCandidateGroup[],
  filledGroupIds: ReadonlySet<string>,
  appsByGroup: ReadonlyMap<string, readonly string[]>,
): GroupFinding[] {
  return groups
    .filter(
      (group) =>
        group.memberCount > 0 && !filledGroupIds.has(group.id) && appsByGroup.has(group.id),
    )
    .map((group) => {
      const apps = appsByGroup.get(group.id) ?? [];
      const members = `${group.memberCount.toLocaleString()} ${group.memberCount === 1 ? 'member' : 'members'}`;
      return {
        id: group.id,
        name: group.name,
        detail: `${members} · ${apps.join(', ')}`,
        memberCount: group.memberCount,
      };
    })
    .sort((a, b) => b.memberCount - a.memberCount || byName(a, b))
    .map(({ id, name, detail }) => ({ id, name, detail }));
}

export const DORMANT_MAINTAINERS =
  'Okta Workflows, SCIM and HR provisioning, direct API writes and IdP group sync ' +
  'all move a group’s membership date, so none of them has written to this group ' +
  'either. What the date cannot show is a maintainer who reviewed the roster and ' +
  'correctly changed nothing.';

export const APP_SOURCED_NOTE =
  'Rows marked app-sourced are mastered by another directory: the quiet is that ' +
  'directory’s, not an administrator’s.';

export const dormantClockNote = (when: string): string =>
  `Measured from the last complete read of your groups, ${when} — not from today. ` +
  `A membership change since then is not yet visible here.`;

export const dormantAccessCaveat = (when: string): string =>
  `${dormantClockNote(when)} ${DORMANT_MAINTAINERS} ${APP_SOURCED_NOTE} ${PUSH_APPS_ONLY}`;

export const DORMANT_ACCESS_CAVEAT_UNANCHORED = `${DORMANT_MAINTAINERS} ${APP_SOURCED_NOTE} ${PUSH_APPS_ONLY}`;

const DAY_MS = 24 * 60 * 60 * 1000;

export const DORMANT_ACCESS_DAYS = 180;

export const DORMANT_ANCHOR_MAX_AGE_DAYS = 30;

export const DORMANT_ANCHOR_UNREAD_NOTE =
  'Needs a complete read of your groups, which has not finished yet.';

export const dormantStaleAnchorNote = (when: string): string =>
  `Needs a complete read of your groups from the last ${DORMANT_ANCHOR_MAX_AGE_DAYS} days. ` +
  `The last one finished ${when}.`;

export type DormantAnchorReason = 'never-walked' | 'stale';

export type DormantAnchor =
  | { usable: true; at: number; reason?: undefined }
  | { usable: false; at: number | null; reason: DormantAnchorReason };

export function resolveDormantAnchor(lastFullWalkAt: number | null, now: number): DormantAnchor {
  if (lastFullWalkAt === null) return { usable: false, at: null, reason: 'never-walked' };
  if (now - lastFullWalkAt > DORMANT_ANCHOR_MAX_AGE_DAYS * DAY_MS) {
    return { usable: false, at: lastFullWalkAt, reason: 'stale' };
  }
  return { usable: true, at: lastFullWalkAt };
}

export function dormantAnchorNote(reason: DormantAnchorReason, when: string): string {
  return reason === 'never-walked' ? DORMANT_ANCHOR_UNREAD_NOTE : dormantStaleAnchorNote(when);
}

export function describeDormancy(days: number): string {
  const years = Math.floor(days / 365);
  if (years >= 1) return pluralize(years, 'year');
  return pluralize(Math.max(1, Math.floor(days / 30)), 'month');
}

export function dormantAccessLabel(): string {
  return `App access with no membership change in ${describeDormancy(DORMANT_ACCESS_DAYS)}`;
}

export function findDormantAccess(
  groups: readonly OrphanCandidateGroup[],
  filledGroupIds: ReadonlySet<string>,
  appsByGroup: ReadonlyMap<string, readonly string[]>,
  anchorAt: number,
): GroupFinding[] {
  const threshold = DORMANT_ACCESS_DAYS * DAY_MS;
  return groups
    .filter(
      (group) =>
        group.memberCount > 0 && !filledGroupIds.has(group.id) && appsByGroup.has(group.id),
    )
    .map((group) => {
      const changedAt = group.lastMembershipUpdated
        ? Date.parse(group.lastMembershipUpdated)
        : Number.NaN;
      return { group, silentFor: anchorAt - changedAt };
    })
    .filter(({ silentFor }) => Number.isFinite(silentFor) && silentFor >= threshold)
    .sort(
      (a, b) =>
        b.silentFor - a.silentFor ||
        b.group.memberCount - a.group.memberCount ||
        a.group.name.localeCompare(b.group.name),
    )
    .map(({ group, silentFor }) => {
      const apps = appsByGroup.get(group.id) ?? [];
      const parts = [
        pluralize(group.memberCount, 'member'),
        apps.join(', '),
        `no membership change in ${describeDormancy(silentFor / DAY_MS)}`,
      ];
      if (group.type === 'APP_GROUP') parts.push('app-sourced');
      return { id: group.id, name: group.name, detail: parts.join(' · ') };
    });
}
