import type { UserStatus, OktaUser } from '../../../shared/types';
import { getUserFriendlyStatus } from '../../../shared/utils/statusNormalizer';

export interface ChartData {
  name: string;
  value: number;
  color: string;
  id?: string; // For rules: the rule ID
  [key: string]: any; // Allow additional properties for Recharts compatibility
}

export const STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: '#4a934e',
  DEPROVISIONED: '#c94a3f',
  SUSPENDED: '#d4880f',
  LOCKED_OUT: '#ef5350',
  STAGED: '#3b82a6',
  PROVISIONED: '#007BBF',
  RECOVERY: '#d4880f',
  PASSWORD_EXPIRED: '#d4880f',
};

export const RULE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ef4444', // red
];

export const DIRECT_MEMBERSHIP_COLOR = '#64748b'; // slate gray

export function buildStatusData(statusBreakdown: Record<UserStatus, number>): ChartData[] {
  return Object.entries(statusBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: getUserFriendlyStatus(status as UserStatus),
      value: count,
      color: STATUS_COLORS[status as UserStatus],
    }));
}

export function buildRuleData(members: OktaUser[]): ChartData[] {
  const ruleCounts = new Map<string, { name: string; count: number }>();
  let directCount = 0;

  members.forEach((user) => {
    if (user.managedBy?.rules && user.managedBy.rules.length > 0) {
      user.managedBy.rules.forEach((rule) => {
        const existing = ruleCounts.get(rule.id);
        if (existing) {
          existing.count++;
        } else {
          ruleCounts.set(rule.id, { name: rule.name, count: 1 });
        }
      });
    } else {
      directCount++;
    }
  });

  const ruleData: ChartData[] = [];

  let colorIndex = 0;
  ruleCounts.forEach((data, ruleId) => {
    ruleData.push({
      name: data.name,
      value: data.count,
      color: RULE_COLORS[colorIndex % RULE_COLORS.length],
      id: ruleId,
    });
    colorIndex++;
  });

  if (directCount > 0) {
    ruleData.push({
      name: 'Direct Membership',
      value: directCount,
      color: DIRECT_MEMBERSHIP_COLOR,
      id: 'direct',
    });
  }

  return ruleData.sort((a, b) => b.value - a.value);
}
