import type { OktaPolicyListItem } from '../../../shared/schemas/okta';

export function filterPolicies(
  policies: OktaPolicyListItem[],
  query: string,
): OktaPolicyListItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return policies;
  return policies.filter(
    (policy) =>
      (policy.name ?? '').toLowerCase().includes(needle) ||
      (policy.description ?? '').toLowerCase().includes(needle),
  );
}
