import type { FormattedRule, GroupMembership, OktaUser } from '../../../shared/types';
import {
  explainRuleExpression,
  type ClauseTreeNode,
} from '../../../shared/rules/explainExpression';
import { isExcludedProfileField } from '../../../shared/utils/profileFields';

export type ProfileRuleReads = Record<string, string[]>;

function attributeNameOf(path: string): string | undefined {
  if (path.startsWith('user.')) return path.slice('user.'.length) || undefined;
  if (path.startsWith('user["') && path.endsWith('"]')) {
    try {
      const parsed: unknown = JSON.parse(path.slice('user['.length, -1));
      return typeof parsed === 'string' && parsed !== '' ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function collectReads(node: ClauseTreeNode, into: Set<string>): void {
  if (node.node === 'connective') {
    for (const child of node.children) collectReads(child, into);
    return;
  }
  for (const read of node.reads) {
    const name = attributeNameOf(read.path);
    if (name !== undefined) into.add(name);
  }
}

function attributesReadBy(rule: FormattedRule, user: OktaUser): Set<string> {
  const names = new Set<string>();

  const expression = rule.conditionExpression ?? '';
  if (expression !== '') {
    collectReads(explainRuleExpression(expression, user).tree, names);
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
): ProfileRuleReads {
  const memberGroupIds = new Set(memberships.map((membership) => membership.group.id));
  const reads: ProfileRuleReads = {};

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
