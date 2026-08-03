import type { GroupSummary, GroupType } from '../../../shared/types';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';
import { toMemberSourceBuckets, type MemberSourceBucket } from './memberSourceBuckets';

export interface GroupTypeBadge {
  label: string;
  className: string;
}

const TYPE_BADGES: Record<GroupType, GroupTypeBadge> = {
  OKTA_GROUP: {
    label: 'OKTA',
    className: 'bg-primary-light text-primary-text border-primary-highlight',
  },
  APP_GROUP: {
    label: 'APP',
    className: 'bg-warning-light text-warning-text border-warning-light',
  },
  BUILT_IN: {
    label: 'BUILT-IN',
    className: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  },
};

const UNKNOWN_TYPE_BADGE = TYPE_BADGES.BUILT_IN;

export interface GroupIdentityLine {
  text: string;
  kind: 'description' | 'id';
  title: string;
}

export interface GroupRowFact {
  key: 'fedBy' | 'usedIn' | 'push';
  label: string;
  title: string;
}

export type MemberSourceState =
  | { kind: 'no-members'; summary: string; title: string }
  | { kind: 'unknown'; summary: string; title: string }
  | { kind: 'computed'; segments: MemberSourceBucket[]; summary: string; title: string };

export interface GroupRowModel {
  typeBadge: GroupTypeBadge;
  sourceApp: string | null;
  identity: GroupIdentityLine;
  memberCount: number;
  memberNoun: string;
  facts: GroupRowFact[];
  source: MemberSourceState;
}

const plural = (n: number): string => (n === 1 ? '' : 's');

export function groupTypeBadge(type: GroupType): GroupTypeBadge {
  return TYPE_BADGES[type] ?? UNKNOWN_TYPE_BADGE;
}

export function groupIdentityLine(group: GroupSummary): GroupIdentityLine {
  const description = group.description?.trim();
  if (description) return { text: description, kind: 'description', title: description };
  return { text: group.id, kind: 'id', title: `Group id ${group.id} — no description set` };
}

export function groupRowFacts(group: GroupSummary): GroupRowFact[] {
  const facts: GroupRowFact[] = [];

  if (group.ruleCount > 0) {
    facts.push({
      key: 'fedBy',
      label: `Fed by ${group.ruleCount} rule${plural(group.ruleCount)}`,
      title: `${group.ruleCount} group rule${plural(group.ruleCount)} assign${
        group.ruleCount === 1 ? 's' : ''
      } users into this group`,
    });
  }

  const usedIn = group.usedInRuleCount;
  if (usedIn !== undefined && usedIn > 0) {
    facts.push({
      key: 'usedIn',
      label: `Used in ${usedIn} rule${plural(usedIn)}`,
      title:
        `This group's id appears in the condition of ${usedIn} rule${plural(usedIn)} — ` +
        'those rules test membership here, they do not assign it. ' +
        'Rules that reference the group by name are not counted.',
    });
  }

  const apps = [...new Set((group.pushMappings ?? []).map((m) => m.appName || m.appId))];
  if (apps.length > 0) {
    facts.push({
      key: 'push',
      label: `Pushed to ${apps.length} app${plural(apps.length)}`,
      title: `Pushed to: ${apps.join(', ')}`,
    });
  }

  return facts;
}

export function describeMemberSource(
  memberCount: number,
  breakdown: MemberSourceBreakdown | null,
): MemberSourceState {
  if (memberCount === 0) {
    return {
      kind: 'no-members',
      summary: 'No members',
      title: 'This group has no members, so there is nothing to attribute.',
    };
  }

  if (!breakdown) {
    return {
      kind: 'unknown',
      summary: 'Source not analyzed',
      title:
        'Where these members came from has not been analyzed. It reads every member of ' +
        'the group once, so the list never does it automatically.',
    };
  }

  const segments = toMemberSourceBuckets(breakdown).filter((bucket) => bucket.count > 0);
  const summary = segments
    .map((bucket) => `${bucket.label} ${bucket.count.toLocaleString()}`)
    .join(' · ');

  return {
    kind: 'computed',
    segments,
    summary: summary || 'No members to attribute',
    title: segments
      .map((bucket) => `${bucket.label}: ${bucket.count.toLocaleString()} — ${bucket.description}`)
      .join('\n'),
  };
}

export function summarizeGroupRow(
  group: GroupSummary,
  breakdown: MemberSourceBreakdown | null,
): GroupRowModel {
  return {
    typeBadge: groupTypeBadge(group.type),
    sourceApp: group.type === 'APP_GROUP' ? (group.sourceAppName ?? null) : null,
    identity: groupIdentityLine(group),
    memberCount: group.memberCount,
    memberNoun: `member${plural(group.memberCount)}`,
    facts: groupRowFacts(group),
    source: describeMemberSource(group.memberCount, breakdown),
  };
}
