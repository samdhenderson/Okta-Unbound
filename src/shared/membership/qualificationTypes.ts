import type { ClauseGroupReference, LeafClauseNode } from '../rules/explainExpression';
import type { RuleMatchResult } from '../ruleEvaluator';
import type { GroupRuleStatus } from '../types';
import type { ExclusionRoute } from '../utils/membershipAnalysis';

export interface TargetGroupFact {
  readonly groupId: string;
  readonly groupName?: string;
  readonly member: boolean;
  readonly missing?: boolean;
}

export type TargetCoverage = 'no-targets' | 'none' | 'some' | 'all';

export type RuleUserHeadline =
  'grants' | 'inactive-would-match' | 'does-not-match' | 'excluded' | 'undetermined';

export type QualificationUndeterminedReason = 'unevaluable-clause' | 'no-condition';

export interface RuleUserVerdict {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly status: GroupRuleStatus;
  readonly active: boolean;
  readonly expression: string;
  readonly exclusion: ExclusionRoute;
  readonly condition: RuleMatchResult;
  readonly headline: RuleUserHeadline;
  readonly failure?: {
    readonly failingClauses: readonly LeafClauseNode[];
    readonly onlyGroupClausesFailed: boolean;
    readonly requiredGroups: readonly ClauseGroupReference[];
    readonly blockingGroups: readonly ClauseGroupReference[];
  };
  readonly undeterminedReason?: QualificationUndeterminedReason;
  readonly targets: readonly TargetGroupFact[];
  readonly coverage: TargetCoverage;
}

export type GroupUserVerdict =
  | { readonly kind: 'already-member'; readonly rules: readonly RuleUserVerdict[] }
  | { readonly kind: 'app-managed' }
  | { readonly kind: 'inventory-unavailable' }
  | { readonly kind: 'no-feeding-rule' }
  | {
      readonly kind: 'would-be-added';
      readonly grantingRuleIds: readonly string[];
      readonly rules: readonly RuleUserVerdict[];
    }
  | { readonly kind: 'not-qualified'; readonly rules: readonly RuleUserVerdict[] }
  | { readonly kind: 'undetermined'; readonly rules: readonly RuleUserVerdict[] };
