import type { FormattedRule } from '../types';

export type RuleSortMode = 'default' | 'name' | 'similarity';

export const RULE_SORT_LABELS: Record<RuleSortMode, string> = {
  default: 'Default order',
  name: 'Name (A–Z)',
  similarity: 'Group similar',
};

export const EXPRESSION_SIMILARITY_THRESHOLD = 0.6;
export const NAME_SIMILARITY_THRESHOLD = 0.5;

const CONSOLIDATED_SUFFIX = /\s*\(consolidated\)\s*$/i;

export function normalizeRuleName(name: string): string {
  return name
    .replace(CONSOLIDATED_SUFFIX, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeRuleExpression(expression: string): string {
  return expression.replace(/\s+/g, ' ').trim().toLowerCase();
}

function attributeSignature(expression: string): Set<string> {
  const matches = expression.toLowerCase().match(/user\.[a-z0-9_]+/g) ?? [];
  return new Set(matches);
}

function expressionTokens(expression: string): Set<string> {
  return new Set(expression.toLowerCase().match(/[a-z0-9_.']+/g) ?? []);
}

interface RuleSignature {
  normName: string;
  nameTokens: Set<string>;
  normExpression: string;
  exprTokens: Set<string>;
  attrs: Set<string>;
}

function signatureOf(rule: FormattedRule): RuleSignature {
  const expression = rule.conditionExpression ?? rule.condition ?? '';
  const normName = normalizeRuleName(rule.name);
  return {
    normName,
    nameTokens: new Set(normName ? normName.split(' ') : []),
    normExpression: normalizeRuleExpression(expression),
    exprTokens: expressionTokens(expression),
    attrs: attributeSignature(expression),
  };
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size || a.size === 0) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

export function rulesAreSimilar(a: FormattedRule, b: FormattedRule): boolean {
  return signaturesAreSimilar(signatureOf(a), signatureOf(b));
}

function signaturesAreSimilar(a: RuleSignature, b: RuleSignature): boolean {
  if (a.normExpression && a.normExpression === b.normExpression) return true;
  if (jaccard(a.exprTokens, b.exprTokens) >= EXPRESSION_SIMILARITY_THRESHOLD) return true;
  if (setsEqual(a.attrs, b.attrs)) return true;
  if (a.normName && a.normName === b.normName) return true;
  if (jaccard(a.nameTokens, b.nameTokens) >= NAME_SIMILARITY_THRESHOLD) return true;
  return false;
}

export interface SimilarRuleCluster {
  rules: FormattedRule[];
  hasSiblings: boolean;
}

export function clusterSimilarRules(rules: FormattedRule[]): SimilarRuleCluster[] {
  const n = rules.length;
  const signatures = rules.map(signatureOf);

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root];
    while (parent[i] !== root) {
      const next = parent[i];
      parent[i] = root;
      i = next;
    }
    return root;
  };
  const union = (i: number, j: number) => {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (signaturesAreSimilar(signatures[i], signatures[j])) union(i, j);
    }
  }

  const components = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const bucket = components.get(root);
    if (bucket) bucket.push(i);
    else components.set(root, [i]);
  }

  const clusters: SimilarRuleCluster[] = [];
  for (const indices of components.values()) {
    indices.sort((a, b) => {
      const sa = signatures[a];
      const sb = signatures[b];
      return (
        sa.normExpression.localeCompare(sb.normExpression) ||
        sa.normName.localeCompare(sb.normName) ||
        rules[a].id.localeCompare(rules[b].id)
      );
    });
    clusters.push({
      rules: indices.map((i) => rules[i]),
      hasSiblings: indices.length > 1,
    });
  }

  clusters.sort((a, b) => {
    if (a.hasSiblings !== b.hasSiblings) return a.hasSiblings ? -1 : 1;
    if (a.rules.length !== b.rules.length) return b.rules.length - a.rules.length;
    return normalizeRuleName(a.rules[0].name).localeCompare(normalizeRuleName(b.rules[0].name));
  });

  return clusters;
}

export function sortRules(rules: FormattedRule[], mode: RuleSortMode): FormattedRule[] {
  switch (mode) {
    case 'name':
      return [...rules].sort(
        (a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
          a.id.localeCompare(b.id),
      );
    case 'similarity':
      return clusterSimilarRules(rules).flatMap((cluster) => cluster.rules);
    case 'default':
    default:
      return [...rules];
  }
}
