import type { RuleUnevaluableReason } from '../ruleEvaluator';
import type { ClauseGroupMatch } from '../rules/explainExpression';
import type { GroupMembership, GroupRuleStatus, MembershipRule, OktaUser } from '../types';
import type { MembershipBucket } from '../../sidepanel/components/users/membershipVerdict';

export type RuleInventoryState =
  | { readonly status: 'unresolved' }
  | { readonly status: 'available'; readonly rules: readonly MembershipRule[] }
  | { readonly status: 'unavailable' };

export interface BlastRadiusInput {
  readonly user: OktaUser;
  readonly draft: Readonly<Record<string, unknown>>;
  readonly memberships: readonly GroupMembership[];
  readonly rules: RuleInventoryState;
  readonly groupNames: ReadonlyMap<string, string>;
}

export type RuleTransition =
  'starts-matching' | 'stops-matching' | 'unchanged-match' | 'unchanged-no-match' | 'undetermined';

export interface RuleEffect {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly expression: string;
  readonly transition: RuleTransition;
  readonly beforeReason?: RuleUnevaluableReason;
  readonly afterReason?: RuleUnevaluableReason;
  readonly targetGroupIds: readonly string[];
  readonly targetGroupNames: readonly string[];
  readonly touchedAttributes: readonly string[];
  readonly active: boolean;
  readonly status?: GroupRuleStatus;
}

export type GroupEffectKind = 'added' | 'removed' | 'not-predicted';

export type WithheldReason =
  | 'rule-unevaluable-after'
  | 'another-active-rule-still-matches'
  | 'membership-not-credited-to-rule'
  | 'membership-attribution-deduced'
  | 'rule-inactive'
  | 'app-mastered-group';

export type CascadeDirection = 'toward-match' | 'away-from-match' | 'undetermined';

export interface GroupCascadeRule {
  readonly ruleId: string;
  readonly direction: CascadeDirection;
  readonly matchedBy: ClauseGroupMatch;
}

export interface GroupCascade {
  readonly groupId: string;
  readonly rules: readonly GroupCascadeRule[];
}

export interface GroupEffect {
  readonly groupId: string;
  readonly groupName: string;
  readonly kind: GroupEffectKind;
  readonly ruleId?: string;
  readonly ruleName?: string;
  readonly contributingRuleIds: readonly string[];
  readonly withheldReason?: WithheldReason;
  readonly blockingRuleName?: string;
  readonly currentBucket?: MembershipBucket;
  readonly currentlyHeld: boolean;
}

export interface BlastRadiusCounts {
  readonly added: number;
  readonly removed: number;
  readonly notPredicted: number;
  readonly starts: number;
  readonly stops: number;
  readonly undetermined: number;
}

export interface BlastRadiusReport {
  readonly status: 'not-computed' | 'unavailable' | 'computed';
  readonly groups: readonly GroupEffect[];
  readonly rules: readonly RuleEffect[];
  readonly counts: BlastRadiusCounts;
  readonly cascades: readonly GroupCascade[];
}
