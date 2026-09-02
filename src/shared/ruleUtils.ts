import type { OktaGroupRule, RuleConflict, FormattedRule, GroupRuleStatus } from '../shared/types';

export function expressionText(rule: OktaGroupRule): string {
  const value: unknown = rule.conditions?.expression?.value;
  return typeof value === 'string' ? value : '';
}

function excludedUserIdsOf(rule: OktaGroupRule): string[] {
  const value: unknown = rule.conditions?.people?.users?.exclude;
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

export function extractUserAttributes(rule: OktaGroupRule): string[] {
  const attributes = new Set<string>();
  const expression = expressionText(rule);

  const matches = expression.match(/user\.(\w+)/g) || [];
  matches.forEach((match) => {
    const attr = match.replace('user.', '');
    attributes.add(attr);
  });

  return Array.from(attributes);
}

export function assignToSameGroups(rule1: OktaGroupRule, rule2: OktaGroupRule): string[] {
  const groups1 = rule1.actions?.assignUserToGroups?.groupIds || [];
  const groups2 = rule2.actions?.assignUserToGroups?.groupIds || [];

  return groups1.filter((g) => groups2.includes(g));
}

export function checkRuleOverlap(rule1: OktaGroupRule, rule2: OktaGroupRule): RuleConflict | null {
  if (rule1.status !== 'ACTIVE' || rule2.status !== 'ACTIVE') {
    return null;
  }

  const sharedGroups = assignToSameGroups(rule1, rule2);
  if (sharedGroups.length === 0) {
    return null;
  }

  const attrs1 = extractUserAttributes(rule1);
  const attrs2 = extractUserAttributes(rule2);
  const commonAttrs = attrs1.filter((a) => attrs2.includes(a));

  if (commonAttrs.length > 0) {
    return {
      rule1: {
        id: rule1.id,
        name: rule1.name,
      },
      rule2: {
        id: rule2.id,
        name: rule2.name,
      },
      reason: `Both rules use ${commonAttrs.join(', ')} and assign to ${sharedGroups.length} shared group(s)`,
      severity: sharedGroups.length > 2 ? 'high' : sharedGroups.length > 1 ? 'medium' : 'low',
      affectedGroups: sharedGroups,
    };
  }

  return null;
}

export function detectConflicts(rules: OktaGroupRule[]): RuleConflict[] {
  const conflicts: RuleConflict[] = [];

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const conflict = checkRuleOverlap(rules[i], rules[j]);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }

  return conflicts;
}

export function formatRuleForDisplay(
  rule: OktaGroupRule,
  currentGroupId?: string,
  conflicts?: RuleConflict[],
): FormattedRule {
  const groupIds = rule.actions?.assignUserToGroups?.groupIds || [];
  const userAttributes = extractUserAttributes(rule);
  const expression = expressionText(rule) || 'No condition specified';

  let simpleCondition = expression
    .replace(/user\./g, '')
    .replace(/isMemberOfAnyGroup/g, 'is member of group')
    .replace(/isMemberOfGroup/g, 'is member of group');

  const affectsCurrentGroup = currentGroupId ? groupIds.includes(currentGroupId) : false;

  const ruleConflicts =
    conflicts?.filter((c) => c.rule1.id === rule.id || c.rule2.id === rule.id) || [];

  return {
    id: rule.id,
    name: rule.name,
    status: rule.status,
    condition: simpleCondition,
    conditionExpression: expression,
    groupIds,
    userAttributes,
    excludedUserIds: excludedUserIdsOf(rule),
    created: rule.created,
    lastUpdated: rule.lastUpdated,
    affectsCurrentGroup,
    conflicts: ruleConflicts,
  };
}

export function timeAgo(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

export function filterRules(rules: FormattedRule[], query: string): FormattedRule[] {
  if (!query || query.trim() === '') {
    return rules;
  }

  const lowerQuery = query.toLowerCase();

  return rules.filter((rule) => {
    return (
      rule.name.toLowerCase().includes(lowerQuery) ||
      rule.id.toLowerCase().includes(lowerQuery) ||
      rule.condition.toLowerCase().includes(lowerQuery) ||
      rule.conditionExpression?.toLowerCase().includes(lowerQuery) ||
      rule.userAttributes.some((attr) => attr.toLowerCase().includes(lowerQuery))
    );
  });
}

export interface RuleStatusBadge {
  text: string;
  variant: 'success' | 'neutral' | 'danger';
  title: string;
}

export function ruleStatusBadge(status: GroupRuleStatus): RuleStatusBadge {
  switch (status) {
    case 'ACTIVE':
      return { text: 'ACTIVE', variant: 'success', title: 'This rule is in force.' };
    case 'INACTIVE':
      return {
        text: 'INACTIVE',
        variant: 'neutral',
        title:
          'This rule is deactivated, so it places nobody. Members it placed before remain in the group.',
      };
    case 'INVALID':
      return {
        text: 'Broken',
        variant: 'danger',
        title:
          'Okta reports this rule as INVALID: it can no longer be evaluated — usually because a group it references was deleted — so it places nobody.',
      };
  }
}
