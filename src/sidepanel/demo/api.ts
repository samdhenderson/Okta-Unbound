import type { MemberMfaResult, OktaGroup, OktaUser } from '../../shared/types';
import { summarizeFactors } from '../../shared/utils/mfaUtils';
import {
  summarizeRuleImpact,
  toImpactRule,
  type RuleImpactSummary,
  type TargetGroupMembers,
} from '../../shared/membership/ruleImpact';
import type { DemoControls } from './control';
import { demoFactorsFor } from './factors';
import { demoGroupMembers, demoUserGroups } from './memberships';
import { demoApps, demoGroups, demoGroupsById, demoRules } from './snapshot';
import { demoUsers, demoUsersById } from './users';

interface DemoResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

const ok = (data: unknown): DemoResult => ({ success: true, data });

function asOktaGroup(id: string): OktaGroup | null {
  const raw = demoGroupsById.get(id);
  if (!raw) return null;
  return {
    id: raw.id,
    type: raw.type,
    profile: { name: raw.profile?.name ?? raw.id, description: raw.profile?.description },
  };
}

interface FlatUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  status: string;
}

function flatten(user: OktaUser): FlatUser {
  return {
    id: user.id,
    email: user.profile.email,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    login: user.profile.login,
    status: user.status,
  };
}

function matchesQuery(user: OktaUser, query: string): boolean {
  const q = query.toLowerCase();
  const { firstName, lastName, email, login } = user.profile;
  return (
    firstName.toLowerCase().includes(q) ||
    lastName.toLowerCase().includes(q) ||
    email.toLowerCase().includes(q) ||
    login.toLowerCase().includes(q) ||
    `${firstName} ${lastName}`.toLowerCase().includes(q)
  );
}

export function demoMembersOf(groupId: string): OktaUser[] {
  const ids = demoGroupMembers.get(groupId) ?? [];
  return ids.map((id) => demoUsersById.get(id)).filter((u): u is OktaUser => Boolean(u));
}

function queryParam(queryString: string, name: string): string {
  for (const pair of queryString.split('&')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    if (decodeURIComponent(pair.slice(0, eq)) === name) {
      return decodeURIComponent(pair.slice(eq + 1));
    }
  }
  return '';
}

export async function demoMakeApiRequest(endpoint?: string): Promise<DemoResult> {
  if (typeof endpoint !== 'string') return ok([]);

  const [path = '', queryString = ''] = endpoint.split('?');
  const captured = (pattern: RegExp): string | undefined => pattern.exec(path)?.[1];

  const userId = captured(/^\/api\/v1\/users\/([^/]+)\/groups$/);
  if (userId !== undefined) {
    const ids = demoUserGroups.get(userId) ?? [];
    return ok(ids.map((id) => demoGroupsById.get(id)).filter(Boolean));
  }

  const memberGroupId = captured(/^\/api\/v1\/groups\/([^/]+)\/users$/);
  if (memberGroupId !== undefined) return ok(demoMembersOf(memberGroupId));

  if (path === '/api/v1/groups/rules') return ok(demoRules);

  const groupId = captured(/^\/api\/v1\/groups\/([^/]+)$/);
  if (groupId !== undefined) return ok(demoGroupsById.get(groupId) ?? null);

  if (path === '/api/v1/groups') {
    const q = queryParam(queryString, 'q');
    const hits = demoGroups.filter((g) =>
      (g.profile?.name ?? '').toLowerCase().includes(q.toLowerCase()),
    );
    return ok(hits.slice(0, 20));
  }

  if (path === '/api/v1/users') {
    const q = queryParam(queryString, 'q') || queryParam(queryString, 'search');
    return ok(demoUsers.filter((u) => matchesQuery(u, q)).slice(0, 20));
  }

  const factorsUserId = captured(/^\/api\/v1\/users\/([^/]+)\/factors$/);
  if (factorsUserId !== undefined) return ok(demoFactorsFor(factorsUserId));

  const singleUserId = captured(/^\/api\/v1\/users\/([^/]+)$/);
  if (singleUserId !== undefined) return ok(demoUsersById.get(singleUserId) ?? null);

  if (path.startsWith('/api/v1/apps')) return ok(demoApps);

  return ok([]);
}

export async function demoCaptureRuleImpact(rule: {
  id: string;
  name?: string;
}): Promise<RuleImpactSummary> {
  const subject = demoRules.find((r) => r.id === rule.id);
  const targetIds = subject?.actions?.assignUserToGroups?.groupIds ?? [];

  const targets: TargetGroupMembers[] = targetIds.map((groupId) => {
    const raw = demoGroupsById.get(groupId);
    return {
      groupId,
      groupName: raw?.profile?.name ?? groupId,
      groupType: raw?.type,
      members: demoMembersOf(groupId),
    };
  });

  return summarizeRuleImpact(
    rule.id,
    rule.name ?? subject?.name ?? rule.id,
    targets,
    demoRules.map(toImpactRule),
  );
}

export async function demoGetAllGroupMembers(groupId: string): Promise<OktaUser[]> {
  return demoMembersOf(groupId);
}

export async function demoGetGroupById(groupId: string): Promise<OktaGroup | null> {
  return asOktaGroup(groupId);
}

export async function demoGetGroupMemberCount(groupId: string): Promise<number> {
  return demoGroupMembers.get(groupId)?.length ?? 0;
}

export async function demoSearchUsers(query: string): Promise<FlatUser[]> {
  if (query.trim().length < 2) return [];
  return demoUsers
    .filter((u) => matchesQuery(u, query))
    .slice(0, 20)
    .map(flatten);
}

export async function demoGetUserById(userId: string): Promise<FlatUser | null> {
  const user = demoUsersById.get(userId);
  return user ? flatten(user) : null;
}

export async function demoGetUserRaw(userId: string): Promise<OktaUser | null> {
  return demoUsersById.get(userId) ?? null;
}

export async function demoGetUserGroupMemberships(userId: string): Promise<number> {
  return demoUserGroups.get(userId)?.length ?? 0;
}

export async function demoGetUserLastLogin(userId: string): Promise<Date | null> {
  const last = demoUsersById.get(userId)?.lastLogin;
  return last ? new Date(last) : null;
}

export async function demoBatchGetUserDetails(userIds: string[]): Promise<Map<string, OktaUser>> {
  const out = new Map<string, OktaUser>();
  for (const id of userIds) {
    const user = demoUsersById.get(id);
    if (user) out.set(id, user);
  }
  return out;
}

export async function demoGetUserApps(
  userId: string,
): Promise<{ apps: { id: string; label: string; groupId?: string }[]; complete: boolean }> {
  const groupIds = demoUserGroups.get(userId) ?? [];
  const apps = new Map<string, { id: string; label: string; groupId?: string }>();

  for (const groupId of groupIds) {
    const source = demoGroupsById.get(groupId)?.source;
    if (!source) continue;
    if (!apps.has(source.id)) {
      apps.set(source.id, { id: source.id, label: source.name ?? source.id, groupId });
    }
  }

  return { apps: [...apps.values()], complete: true };
}

export async function demoGetAllGroups(): Promise<typeof demoGroups> {
  return demoGroups;
}

export async function demoSearchGroups(query: string): Promise<typeof demoGroups> {
  const q = query.toLowerCase();
  return demoGroups.filter((g) => (g.profile?.name ?? '').toLowerCase().includes(q)).slice(0, 20);
}

export async function demoGetGroupRulesForGroup(groupId: string): Promise<typeof demoRules> {
  return demoRules.filter((r) => (r.actions?.assignUserToGroups?.groupIds ?? []).includes(groupId));
}

const SCAN_WALL_CLOCK_MS = 7000;

export async function demoScanGroupMfa(
  userIds: string[],
  onProgress?: (current: number, total: number) => void,
): Promise<Map<string, MemberMfaResult>> {
  const total = userIds.length;
  const results = new Map<string, MemberMfaResult>();
  const progress = (globalThis as { __OKTA_DEMO__?: DemoControls }).__OKTA_DEMO__?.progress;

  progress?.start('MFA scan', `Scanning 0/${total} members`, total);

  const started = Date.now();
  for (const [i, userId] of userIds.entries()) {
    const completed = i + 1;
    results.set(userId, summarizeFactors(userId, demoFactorsFor(userId)));

    const due = started + (SCAN_WALL_CLOCK_MS * completed) / Math.max(total, 1);
    const wait = due - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));

    progress?.update(completed, total, `Scanned ${completed}/${total} members`);
    onProgress?.(completed, total);
  }

  progress?.complete();
  return results;
}
