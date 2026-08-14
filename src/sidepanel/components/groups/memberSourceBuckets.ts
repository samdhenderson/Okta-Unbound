import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';
import type { MembershipAttribution } from '../../../shared/types';
import { INDIGO_RAMP, CHART_OTHER_COLOR } from '../../theme/chartPalette';

export type MemberSourceBucketKey =
  'ruleBased' | 'direct' | 'unattributed' | 'multiRule' | 'otherRules' | `rule:${string}`;

export interface MemberSourceBucket {
  key: MemberSourceBucketKey;
  label: string;
  description: string;
  count: number;
  percent: number;
  barClass: string;
  dotClass: string;
  color?: string;
  aggregatedRuleCount?: number;
}

export type StaticMemberSourceBucketKey = 'ruleBased' | 'direct' | 'unattributed' | 'multiRule';

export interface MemberSourceBucketMeta {
  label: string;
  description: string;
  barClass: string;
  dotClass: string;
}

const BUCKET_META: Record<StaticMemberSourceBucketKey, MemberSourceBucketMeta> = {
  ruleBased: {
    label: 'Rule-managed',
    description: "Matched a targeting rule's condition, so that rule accounts for this membership.",
    barClass: 'bg-primary',
    dotClass: 'bg-primary',
  },
  direct: {
    label: 'Manual',
    description: 'Added directly — no rule accounts for this membership.',
    barClass: 'bg-neutral-400',
    dotClass: 'bg-neutral-400',
  },
  unattributed: {
    label: 'Indeterminate',
    description: 'A targeting rule could not be evaluated here, so the source is unconfirmed.',
    barClass: 'bg-warning',
    dotClass: 'bg-warning',
  },
  multiRule: {
    label: 'Matched by 2+ rules',
    description:
      'Attributed to more than one rule, so no single rule owns the membership. Counted once.',
    barClass: 'bg-primary-dark',
    dotClass: 'bg-primary-dark',
  },
};

const BUCKET_ORDER: ('ruleBased' | 'direct' | 'unattributed')[] = [
  'ruleBased',
  'direct',
  'unattributed',
];

export const ATTRIBUTION_BUCKET = {
  exact: 'ruleBased',
  inferred: 'unattributed',
  ambiguous: 'unattributed',
} as const satisfies Record<MembershipAttribution, MemberSourceBucketKey>;

export interface AttributionBucketDescription extends MemberSourceBucketMeta {
  key: StaticMemberSourceBucketKey;
}

export function describeAttribution(
  attribution: MembershipAttribution,
): AttributionBucketDescription {
  const key = ATTRIBUTION_BUCKET[attribution];
  return { key, ...BUCKET_META[key] };
}

export const MAX_RULE_SEGMENTS = INDIGO_RAMP.length;

function budgetTaker(available: number): (wanted: number) => number {
  let remaining = Math.max(0, available);
  return (wanted: number) => {
    const taken = Math.max(0, Math.min(wanted, remaining));
    remaining -= taken;
    return taken;
  };
}

function withPercent(buckets: Omit<MemberSourceBucket, 'percent'>[]): MemberSourceBucket[] {
  const analyzed = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  return buckets.map((bucket) => ({
    ...bucket,
    percent: analyzed === 0 ? 0 : (bucket.count / analyzed) * 100,
  }));
}

function splitRuleBased(breakdown: MemberSourceBreakdown): {
  confirmed: number;
  indeterminate: number;
} {
  const indeterminate = Math.max(0, Math.min(breakdown.unattributed, breakdown.ruleBased));
  return { confirmed: breakdown.ruleBased - indeterminate, indeterminate };
}

export function toMemberSourceBuckets(breakdown: MemberSourceBreakdown): MemberSourceBucket[] {
  const { confirmed, indeterminate } = splitRuleBased(breakdown);

  const counts: Record<'ruleBased' | 'direct' | 'unattributed', number> = {
    ruleBased: confirmed,
    direct: breakdown.direct,
    unattributed: indeterminate,
  };

  return withPercent(BUCKET_ORDER.map((key) => ({ key, ...BUCKET_META[key], count: counts[key] })));
}

export interface MemberSourceSegmentOptions {
  maxRules?: number;
}

export function toMemberSourceSegments(
  breakdown: MemberSourceBreakdown,
  options: MemberSourceSegmentOptions = {},
): MemberSourceBucket[] {
  const maxRules = Math.max(0, Math.min(options.maxRules ?? MAX_RULE_SEGMENTS, MAX_RULE_SEGMENTS));
  const { confirmed, indeterminate } = splitRuleBased(breakdown);

  const named = (breakdown.byRuleMembers ?? [])
    .filter((rule) => rule.soleCount > 0)
    .slice()
    .sort((a, b) => b.soleCount - a.soleCount || a.ruleName.localeCompare(b.ruleName));

  const shown = named.slice(0, maxRules);
  const dropped = named.slice(maxRules);

  const take = budgetTaker(confirmed);
  const segments: Omit<MemberSourceBucket, 'percent'>[] = [];

  shown.forEach((rule, index) => {
    const count = take(rule.soleCount);
    if (count === 0) return;
    segments.push({
      key: `rule:${rule.ruleId}`,
      label: rule.ruleName,
      description: `Attributed to the rule "${rule.ruleName}" and to no other rule.`,
      count,
      barClass: '',
      dotClass: '',
      color: INDIGO_RAMP[index],
    });
  });

  const otherCount = take(dropped.reduce((sum, rule) => sum + rule.soleCount, 0));
  if (otherCount > 0) {
    segments.push({
      key: 'otherRules',
      label: 'Other rules',
      description:
        `${dropped.length} further rule${dropped.length === 1 ? '' : 's'}, aggregated — ` +
        'each accounts for fewer members than the rules listed above.',
      count: otherCount,
      barClass: '',
      dotClass: '',
      color: CHART_OTHER_COLOR,
      aggregatedRuleCount: dropped.length,
    });
  }

  const multiCount = take(Math.max(0, breakdown.multiRuleMembers ?? 0));
  if (multiCount > 0) {
    segments.push({ key: 'multiRule', ...BUCKET_META.multiRule, count: multiCount });
  }

  segments.push({ key: 'ruleBased', ...BUCKET_META.ruleBased, count: take(confirmed) });
  segments.push({ key: 'direct', ...BUCKET_META.direct, count: breakdown.direct });
  segments.push({ key: 'unattributed', ...BUCKET_META.unattributed, count: indeterminate });

  return withPercent(segments);
}

export type RuleAttributionProvenance = 'okta' | 'inferred' | 'mixed';

export interface RuleAttributionRow {
  ruleId: string;
  ruleName: string;
  count: number;
  provenance?: RuleAttributionProvenance;
  provenanceLabel?: string;
  provenanceTitle?: string;
  provenanceClass?: string;
}

const PROVENANCE_META: Record<
  RuleAttributionProvenance,
  { label: string; title: string; className: string }
> = {
  okta: {
    label: 'Okta-attributed',
    title: 'Okta itself reports these members as assigned by this rule.',
    className: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  },
  inferred: {
    label: 'Inferred',
    title:
      'Okta did not attribute these members — the rule was matched client-side, ' +
      'so this is a deduction, not a fact.',
    className: 'bg-warning-light text-warning-text border-warning-light',
  },
  mixed: {
    label: 'Partly inferred',
    title:
      'Okta attributed some of these members; the rest were matched client-side, ' +
      'so part of this count is a deduction rather than a fact.',
    className: 'bg-warning-light text-warning-text border-warning-light',
  },
};

export function toRuleAttributionRows(breakdown: MemberSourceBreakdown): RuleAttributionRow[] {
  const counts = new Map((breakdown.byRuleMembers ?? []).map((rule) => [rule.ruleId, rule]));

  return breakdown.byRule.map((contribution) => {
    const detail = counts.get(contribution.ruleId);
    const okta = detail?.oktaAttributedCount ?? 0;
    const client = detail?.clientAttributedCount ?? 0;

    if (okta + client === 0) {
      return {
        ruleId: contribution.ruleId,
        ruleName: contribution.ruleName,
        count: contribution.count,
      };
    }

    const provenance: RuleAttributionProvenance =
      client === 0 ? 'okta' : okta === 0 ? 'inferred' : 'mixed';
    const meta = PROVENANCE_META[provenance];

    return {
      ruleId: contribution.ruleId,
      ruleName: contribution.ruleName,
      count: contribution.count,
      provenance,
      provenanceLabel: meta.label,
      provenanceTitle:
        provenance === 'mixed'
          ? `${okta.toLocaleString()} of ${(okta + client).toLocaleString()} attributed by Okta. ${meta.title}`
          : meta.title,
      provenanceClass: meta.className,
    };
  });
}
