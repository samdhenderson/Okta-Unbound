import type { GroupSummary } from '../types';

export interface RuleTarget {
  groupIds: string[];
}

export interface RuleAttribution extends RuleTarget {
  conditionExpression?: string | null;
}

const GROUP_ID_FN_RE = /\bisMemberOf(?:Any)?Group\s*\(/g;

function readStringLiteral(
  src: string,
  start: number,
  quote: string,
): { value: string; end: number } {
  let value = '';
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\' && i + 1 < src.length) {
      value += src[i + 1];
      i += 2;
      continue;
    }
    if (c === quote) {
      i++;
      break;
    }
    value += c;
    i++;
  }
  return { value, end: i };
}

export function extractReferencedGroupIds(expression?: string | null): string[] {
  if (!expression) return [];
  const ids = new Set<string>();
  const re = new RegExp(GROUP_ID_FN_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(expression)) !== null) {
    let i = match.index + match[0].length; // first char after the '('
    let depth = 1;
    while (i < expression.length && depth > 0) {
      const ch = expression[i];
      if (ch === '"' || ch === "'") {
        const { value, end } = readStringLiteral(expression, i + 1, ch);
        const id = value.trim();
        if (id) ids.add(id);
        i = end;
        continue;
      }
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      i++;
    }
  }
  return [...ids];
}

export function countRulesByGroup(rules: readonly RuleTarget[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const rule of rules) {
    const seen = new Set<string>();
    for (const groupId of rule.groupIds ?? []) {
      if (seen.has(groupId)) continue;
      seen.add(groupId);
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
  }
  return counts;
}

export function countReferencedGroups(rules: readonly RuleAttribution[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const rule of rules) {
    for (const groupId of extractReferencedGroupIds(rule.conditionExpression)) {
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
  }
  return counts;
}

export function annotateGroupsWithRuleCounts(
  groups: readonly GroupSummary[],
  rules: readonly RuleAttribution[],
): GroupSummary[] {
  const assignedCounts = countRulesByGroup(rules);
  const referencedCounts = countReferencedGroups(rules);
  return groups.map((group) => {
    const ruleCount = assignedCounts.get(group.id) ?? 0;
    const usedInRuleCount = referencedCounts.get(group.id) ?? 0;
    return { ...group, hasRules: ruleCount > 0, ruleCount, usedInRuleCount };
  });
}
