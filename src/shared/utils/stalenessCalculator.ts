import type { GroupSummary } from '../types';

export interface StalenessConfig {
  membershipThresholdDays: number; // Default: 180 (6 months)
  emptyGroupWeight: number; // Default: 40 points
  noActivityWeight: number; // Default: 30 points
  veryFewMembersWeight: number; // Default: 20 points
  stalenessThreshold: number; // Default: 50 (score >= this = stale)
}

export const DEFAULT_STALENESS_CONFIG: StalenessConfig = {
  membershipThresholdDays: 180, // 6 months
  emptyGroupWeight: 40,
  noActivityWeight: 30,
  veryFewMembersWeight: 20,
  stalenessThreshold: 50,
};

export interface StalenessResult {
  score: number;
  reasons: string[];
  isStale: boolean;
}

function toDate(value: Date | string | undefined | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateStaleness(
  group: GroupSummary,
  config: StalenessConfig = DEFAULT_STALENESS_CONFIG,
): StalenessResult {
  let score = 0;
  const reasons: string[] = [];
  const now = new Date();

  const lastMembershipUpdated = toDate(group.lastMembershipUpdated);
  const created = toDate(group.created);

  if (lastMembershipUpdated) {
    const daysSinceUpdate = daysBetween(lastMembershipUpdated, now);
    if (daysSinceUpdate > config.membershipThresholdDays) {
      score += config.noActivityWeight;
      const monthsSinceUpdate = Math.floor(daysSinceUpdate / 30);
      reasons.push(`No membership changes in ${monthsSinceUpdate} months`);
    }
  } else if (created) {
    const daysSinceCreation = daysBetween(created, now);
    if (daysSinceCreation > config.membershipThresholdDays) {
      score += config.noActivityWeight * 0.7; // Slightly lower weight since it's less certain
      const monthsSinceCreation = Math.floor(daysSinceCreation / 30);
      reasons.push(`Created ${monthsSinceCreation} months ago with no tracked membership updates`);
    }
  }

  if (group.memberCount === 0) {
    score += config.emptyGroupWeight;
    reasons.push('Group is empty');
  } else if (group.memberCount <= 2) {
    score += config.veryFewMembersWeight;
    reasons.push(`Only ${group.memberCount} member${group.memberCount > 1 ? 's' : ''}`);
  }

  if (!group.hasRules && group.memberCount > 0) {
    score += 5;
    reasons.push('No automated rules');
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    isStale: score >= config.stalenessThreshold,
  };
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Unknown';
  }

  const now = new Date();
  const days = daysBetween(dateObj, now);

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 30) {
    return `${days} days ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

export function applyStalenessScore(group: GroupSummary, config?: StalenessConfig): GroupSummary {
  const result = calculateStaleness(group, config);
  return {
    ...group,
    stalenessScore: result.score,
    stalenessReasons: result.reasons,
    isStale: result.isStale,
  };
}
