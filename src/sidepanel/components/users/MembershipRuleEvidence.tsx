import React from 'react';
import type jsep from 'jsep';
import { Badge, EntityLink, Eyebrow } from '../shared';
import ClauseChecklist from '../groups/detail/ClauseChecklist';
import { parseRuleExpression, type RuleGroupContext } from '../../../shared/ruleEvaluator';
import { conditionExpressionOf } from '../../../shared/membership/ruleExpression';
import type { MembershipRule, OktaUser } from '../../../shared/types';

const MAX_WALK_DEPTH = 64;

const MAX_ATTRIBUTE_CHIPS = 12;

function isExpressionNode(value: unknown): value is jsep.Expression {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { type?: unknown }).type === 'string'
  );
}

function collectUserAttributes(node: jsep.Expression, found: Set<string>, depth: number): void {
  if (depth > MAX_WALK_DEPTH || found.size >= MAX_ATTRIBUTE_CHIPS) return;

  if (node.type === 'MemberExpression') {
    const member = node as jsep.MemberExpression;
    const object = member.object;
    const property = member.property;
    if (
      !member.computed &&
      object.type === 'Identifier' &&
      (object as jsep.Identifier).name === 'user' &&
      property.type === 'Identifier'
    ) {
      found.add((property as jsep.Identifier).name);
      return;
    }
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isExpressionNode(item)) collectUserAttributes(item, found, depth + 1);
      }
    } else if (isExpressionNode(value)) {
      collectUserAttributes(value, found, depth + 1);
    }
  }
}

function conditionAttributes(expression: string): string[] {
  const parsed = parseRuleExpression(expression);
  if (!parsed.ok) return [];

  const found = new Set<string>();
  try {
    collectUserAttributes(parsed.ast, found, 0);
  } catch {
    return [];
  }
  return [...found];
}

export interface RuleEvidenceProps {
  rule: MembershipRule;
  user?: OktaUser;
  groupContext?: RuleGroupContext;
}

const MembershipRuleEvidence: React.FC<RuleEvidenceProps> = ({ rule, user, groupContext }) => {
  const expression = conditionExpressionOf(rule);
  const attributes = conditionAttributes(expression);

  return (
    <div className="rounded-md border border-neutral-200 bg-canvas p-(--sp-card)">
      <EntityLink type="rule" id={rule.id} name={rule.name} />

      {attributes.length > 0 && (
        <div className="mt-2">
          <Eyebrow className="mb-1 block">Reads</Eyebrow>
          <div className="flex flex-wrap gap-(--sp-inline)">
            {attributes.map((attribute) => (
              <Badge key={attribute} variant="neutral" className="font-mono">
                {attribute}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2">
        <Eyebrow className="mb-1 block">Condition</Eyebrow>
        {user ? (
          <ClauseChecklist expression={expression} user={user} groupContext={groupContext} />
        ) : (
          <code className="block overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-neutral-200 bg-white p-2 font-mono text-xs text-neutral-900">
            {expression || 'No condition expression'}
          </code>
        )}
      </div>
    </div>
  );
};

export default MembershipRuleEvidence;
