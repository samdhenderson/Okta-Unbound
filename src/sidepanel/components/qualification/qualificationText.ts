import type { BadgeVariant } from '../shared';
import type {
  GroupUserVerdict,
  QualificationUndeterminedReason,
  RuleUserHeadline,
  RuleUserVerdict,
} from '../../../shared/membership/qualificationTypes';
import type { ExclusionRoute } from '../../../shared/utils/membershipAnalysis';

export interface HeadlinePresentation {
  readonly label: string;
  readonly variant: BadgeVariant;
  readonly sentence: string;
}

const HEADLINES: Record<RuleUserHeadline, HeadlinePresentation> = {
  grants: {
    label: 'Qualifies',
    variant: 'success',
    sentence: 'The condition matches and the rule is active, so it places this user in its groups.',
  },
  'inactive-would-match': {
    label: 'Inactive',
    variant: 'warning',
    sentence: 'The condition matches, but the rule is not active, so it places nobody today.',
  },
  'does-not-match': {
    label: 'Does not match',
    variant: 'danger',
    sentence: 'The condition does not match this user.',
  },
  excluded: {
    label: 'Excluded',
    variant: 'danger',
    sentence: 'The rule excludes this user, whatever its condition says.',
  },
  undetermined: {
    label: 'Not determined',
    variant: 'neutral',
    sentence: 'Whether the condition matches cannot be stated.',
  },
};

export function headlinePresentation(headline: RuleUserHeadline): HeadlinePresentation {
  return HEADLINES[headline];
}

export function undeterminedSentence(reason: QualificationUndeterminedReason): string {
  return reason === 'no-condition'
    ? 'The rule carries no condition expression.'
    : 'A clause could not be evaluated for this user; the raw expression names it.';
}

export function exclusionSentence(route: Exclude<ExclusionRoute, 'none'>): string {
  return route === 'user'
    ? "Named on the rule's exclusion list."
    : 'A member of a group the rule excludes.';
}

export function groupVerdictSentence(verdict: GroupUserVerdict, groupName: string): string {
  switch (verdict.kind) {
    case 'already-member':
      return `This user is a member of ${groupName} today.`;
    case 'app-managed':
      return `${groupName} is managed by its application; no rule places anyone in it.`;
    case 'inventory-unavailable':
      return 'The rule inventory could not be loaded, so no rule can be assessed.';
    case 'no-feeding-rule':
      return `No rule assigns users into ${groupName}. Membership is granted directly.`;
    case 'would-be-added':
      return `An active rule qualifies this user for ${groupName}. Okta applies rules asynchronously.`;
    case 'not-qualified':
      return `No rule feeding ${groupName} qualifies this user.`;
    case 'undetermined':
      return `No rule feeding ${groupName} qualifies this user for certain, and at least one could not be determined.`;
  }
}

export function groupVerdictVariant(kind: GroupUserVerdict['kind']): BadgeVariant {
  switch (kind) {
    case 'already-member':
    case 'would-be-added':
      return 'success';
    case 'not-qualified':
      return 'danger';
    case 'app-managed':
    case 'no-feeding-rule':
    case 'inventory-unavailable':
    case 'undetermined':
      return 'neutral';
  }
}

export function groupVerdictLabel(kind: GroupUserVerdict['kind']): string {
  switch (kind) {
    case 'already-member':
      return 'Member';
    case 'would-be-added':
      return 'Qualifies';
    case 'not-qualified':
      return 'Not qualified';
    case 'app-managed':
      return 'App-managed';
    case 'no-feeding-rule':
      return 'No feeding rule';
    case 'inventory-unavailable':
      return 'Rules unavailable';
    case 'undetermined':
      return 'Not determined';
  }
}

export function rulesOf(verdict: GroupUserVerdict): readonly RuleUserVerdict[] {
  return 'rules' in verdict ? verdict.rules : [];
}

const HEADLINE_ORDER: Record<RuleUserHeadline, number> = {
  grants: 0,
  undetermined: 1,
  'does-not-match': 2,
  excluded: 3,
  'inactive-would-match': 4,
};

export function orderByHeadline(rules: readonly RuleUserVerdict[]): RuleUserVerdict[] {
  return [...rules].sort((a, b) => HEADLINE_ORDER[a.headline] - HEADLINE_ORDER[b.headline]);
}
