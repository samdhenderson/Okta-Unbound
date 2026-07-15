import { createLogger } from './utils/logger';
import type { OktaUser } from './types';

const log = createLogger('RuleEvaluator');

export function evaluateRuleExpression(expression: string, user: OktaUser): boolean {
  if (!expression || !expression.trim()) return false;

  let expr = expression.trim();

  try {
    expr = expr.replace(/\s+eq\s+/gi, ' === ');

    expr = expr.replace(/\s+and\s+/gi, ' && ');

    expr = expr.replace(/\s+or\s+/gi, ' || ');

    expr = expr.replace(/user\.([a-zA-Z0-9_]+)/g, (_match, attr) => {
      const val = user.profile[attr];
      if (val === undefined || val === null) return 'null';
      if (typeof val === 'string') return JSON.stringify(val);
      return String(val);
    });

    expr = expr.replace(/isMemberOfGroup\s*\(([^)]+)\)/g, (_match, _args) => {
      log.warn(
        'isMemberOfGroup is not fully supported in client-side evaluation without group list context',
      );
      return 'false';
    });

    const result = new Function(`return ${expr}`);
    return Boolean(result());
  } catch (err) {
    log.warn(`Failed to evaluate expression: "${expression}"`, err);
    return false;
  }
}

export function canEvaluateClientSide(expression: string): boolean {
  if (!expression) return false;

  if (expression.includes('isMemberOf')) return false;

  if (expression.includes('app.')) return false;

  return true;
}
