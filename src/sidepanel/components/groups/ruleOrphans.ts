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
}

export interface RuleAssignment {
  groupIds: readonly string[];
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
