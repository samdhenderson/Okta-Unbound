export interface AttributeReferencingRule {
  id: string;
  name: string;
  status: string;
  userAttributes?: string[];
}

export interface AttributeRuleRef {
  ruleId: string;
  ruleName: string;
}

export function indexRulesByAttribute(
  rules: readonly AttributeReferencingRule[],
): Map<string, AttributeRuleRef[]> {
  const index = new Map<string, AttributeRuleRef[]>();
  for (const rule of rules) {
    const seen = new Set<string>();
    for (const attribute of rule.userAttributes ?? []) {
      if (seen.has(attribute)) continue;
      seen.add(attribute);
      const refs = index.get(attribute);
      const ref = { ruleId: rule.id, ruleName: rule.name };
      if (refs) {
        refs.push(ref);
      } else {
        index.set(attribute, [ref]);
      }
    }
  }
  return index;
}
