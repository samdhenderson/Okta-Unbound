import { membershipSourceLine, sourceLineLabel } from '../../../shared/membership/sourceLine';
import type { GroupMembership } from '../../../shared/types';
import type { AppAssignmentScope } from '../../../shared/schemas/okta';
import type { UserAppAssignment } from '../../hooks/useOktaApi/userOperations';
import type { AppScopeIndicatorState } from './comparison/AppScopeIndicator';
import type { BadgeVariant } from '../shared';

export type AppSourceState = Extract<AppScopeIndicatorState, AppAssignmentScope | 'unknown'>;

export type AppSourceBucket = 'direct' | 'viaGroup' | 'unknown';

export type AppSourceCounts = Record<AppSourceBucket, number>;

export type AppsByGroupId = Record<string, string[]>;

export const APP_SOURCE_COPY: Record<
  AppSourceState,
  { label: string; caveat: string; variant: BadgeVariant; bucket: AppSourceBucket }
> = {
  USER: {
    label: 'Direct',
    caveat:
      'Okta reports a direct assignment to this app for this user. A group may grant the same app as well — Okta reports only one source per app, so this does not rule out a group path.',
    variant: 'success',
    bucket: 'direct',
  },
  GROUP: {
    label: 'Via group',
    caveat:
      'Okta reports this assignment as coming from a group rather than from a direct assignment. Which group is named only where Okta identified it; this never guesses.',
    variant: 'primary',
    bucket: 'viaGroup',
  },
  unknown: {
    label: 'Source unknown',
    caveat:
      'Okta reported no assignment source for this app, so the source is unknown — this is not a way of saying "via group", and not a way of saying "direct".',
    variant: 'warning',
    bucket: 'unknown',
  },
};

const PRIVILEGED_APP_LABELS: ReadonlySet<string> = new Set([
  'okta admin console',
  'aws account federation',
  'google cloud platform',
  'microsoft azure',
]);

export function isPrivilegedApp(label: string): boolean {
  return PRIVILEGED_APP_LABELS.has(label.trim().toLowerCase());
}

export interface AppSourceRow {
  id: string;
  label: string;
  name?: string;
  state: AppSourceState;
  bucket: AppSourceBucket;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  caveat: string;
  sourceLine: string;
  sourceKnown: boolean;
  isPrivileged: boolean;
  grantGroupId?: string;
  grantGroupName?: string;
  grantGroupSourceLine?: string;
  filterText: string;
}

export interface AppSourceSummary {
  rows: AppSourceRow[];
  counts: AppSourceCounts;
  summary: string;
}

const SUMMARY_TERMS: ReadonlyArray<readonly [AppSourceBucket, string]> = [
  ['direct', 'direct'],
  ['viaGroup', 'via group'],
  ['unknown', 'unknown source'],
];

export function appSourceSummaryLine(counts: AppSourceCounts): string {
  return SUMMARY_TERMS.filter(([bucket]) => counts[bucket] > 0)
    .map(([bucket, word]) => `${counts[bucket]} ${word}`)
    .join(' · ');
}

function toRow(app: UserAppAssignment, byGroupId: Map<string, GroupMembership>): AppSourceRow {
  const state: AppSourceState = app.scope ?? 'unknown';
  const copy = APP_SOURCE_COPY[state];

  const membership = app.grantGroupId ? byGroupId.get(app.grantGroupId) : undefined;
  const grantGroupName = app.grantGroupId
    ? (membership?.group.profile.name ?? app.grantGroupId)
    : undefined;

  const sourceKnown = grantGroupName !== undefined;

  return {
    id: app.id,
    label: app.label,
    name: app.name,
    state,
    bucket: copy.bucket,
    badgeLabel: copy.label,
    badgeVariant: copy.variant,
    caveat: copy.caveat,
    sourceLine: sourceKnown ? `Through ${grantGroupName}` : copy.caveat,
    sourceKnown,
    isPrivileged: isPrivilegedApp(app.label),
    grantGroupId: app.grantGroupId,
    grantGroupName,
    grantGroupSourceLine: membership
      ? sourceLineLabel(membershipSourceLine(membership))
      : undefined,
    filterText: `${app.label} ${grantGroupName ?? ''}`.toLowerCase(),
  };
}

export function summarizeAppSources(
  apps: UserAppAssignment[],
  memberships: GroupMembership[],
): AppSourceSummary {
  const byGroupId = new Map(memberships.map((m) => [m.group.id, m]));
  const rows = apps.map((app) => toRow(app, byGroupId));

  const counts: AppSourceCounts = { direct: 0, viaGroup: 0, unknown: 0 };
  for (const row of rows) counts[row.bucket] += 1;

  return { rows, counts, summary: appSourceSummaryLine(counts) };
}

export function indexAppsByGroup(rows: AppSourceRow[]): AppsByGroupId {
  const index: AppsByGroupId = {};
  for (const row of rows) {
    if (!row.grantGroupId) continue;
    (index[row.grantGroupId] ??= []).push(row.label);
  }
  return index;
}
