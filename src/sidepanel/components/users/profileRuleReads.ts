import type { FormattedRule, GroupMembership, OktaUser } from '../../../shared/types';
import { explainRuleExpression } from '../../../shared/rules/explainExpression';
import { isExcludedProfileField } from '../../../shared/utils/profileFields';

const DOT_REFERENCE = /\buser\.([A-Za-z_$][A-Za-z0-9_$]*)/g;

const BRACKET_REFERENCE = /\buser\[(['"])([^'"]*)\1\]/g;

const STRING_LITERAL = /(['"])(?:\\.|(?!\1)[^\\])*\1/g;

function collectReferences(text: string, into: Set<string>): void {
  for (const match of text.matchAll(BRACKET_REFERENCE)) into.add(match[2]);
  for (const match of text.replace(STRING_LITERAL, '""').matchAll(DOT_REFERENCE)) {
    into.add(match[1]);
  }
}

function attributesReadBy(rule: FormattedRule, user: OktaUser): Set<string> {
  const names = new Set<string>();

  const expression = rule.conditionExpression ?? '';
  if (expression !== '') {
    for (const clause of explainRuleExpression(expression, user).clauses) {
      collectReferences(clause.expressionText, names);
    }
  }

  for (const name of rule.userAttributes ?? []) names.add(name);

  return names;
}

function grantsAccess(rule: FormattedRule, memberGroupIds: ReadonlySet<string>): boolean {
  if (rule.status !== 'ACTIVE') return false;
  return rule.groupIds.some((groupId) => memberGroupIds.has(groupId));
}

export function profileRuleReads(
  rules: readonly FormattedRule[],
  user: OktaUser,
  memberships: readonly GroupMembership[],
): Record<string, string[]> {
  const memberGroupIds = new Set(memberships.map((membership) => membership.group.id));
  const reads: Record<string, string[]> = {};

  for (const rule of rules) {
    if (!grantsAccess(rule, memberGroupIds)) continue;

    for (const name of attributesReadBy(rule, user)) {
      if (isExcludedProfileField(name)) continue;
      const named = reads[name] ?? (reads[name] = []);
      if (!named.includes(rule.name)) named.push(rule.name);
    }
  }

  return reads;
}
