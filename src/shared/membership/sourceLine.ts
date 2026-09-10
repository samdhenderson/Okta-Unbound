import { attributionNamesRules, isDeducedAttribution } from '../utils/membershipAnalysis';
import type { GroupMembership, MembershipAttribution, MembershipProvenance } from '../types';

const attributionCaption: Record<MembershipAttribution, string> = {
  exact: 'Added by Rule:',
  inferred: 'Added by rule:',
  ambiguous: 'Rule:',
};

export interface MembershipSourceLine {
  caption: string;
  detail: string;
  description: string;
  proven: boolean;
}

export function sourceLineLabel(line: MembershipSourceLine): string {
  return line.detail ? `${line.caption} ${line.detail}` : line.caption;
}

function ruleDescription(namesRules: boolean, deduced: boolean): string {
  if (!namesRules) {
    return 'The classifier could not resolve which rule granted this membership, so everything listed is a candidate rather than the answer, and none of them is credited.';
  }
  if (deduced) {
    return 'Not every rule condition could be evaluated against this user. The rules listed are the source of this membership; Okta does not record which rule added a member.';
  }
  return 'Every rule listed provably matches this user. Okta does not record which rule added a member, so this is the classifier evaluating rule conditions, not an Okta assertion.';
}

function oktaSourceLine(provenance: MembershipProvenance): MembershipSourceLine {
  if (provenance.rules.length === 0) {
    return {
      caption: 'Okta confirms: added directly',
      detail: '',
      description:
        "Okta's own record for this user and group names no rule managing the membership, so it was added by hand. This is Okta answering rather than the classifier evaluating rule conditions, and it is the answer where the two differ.",
      proven: true,
    };
  }

  const several = provenance.rules.length > 1 ? ` (${provenance.rules.length} rules)` : '';
  return {
    caption: 'Okta confirms: added by rule:',
    detail: `${provenance.rules.map((r) => r.name).join(', ')}${several}`,
    description:
      "Okta's own record for this user and group names the rule(s) managing the membership. This is Okta answering rather than the classifier evaluating rule conditions, and it is the answer where the two differ.",
    proven: true,
  };
}

export function membershipSourceLine(membership: GroupMembership): MembershipSourceLine {
  const { membershipType, rules, attribution, group, provenance } = membership;

  if (provenance) return oktaSourceLine(provenance);

  const deduced = isDeducedAttribution(attribution);

  if (membershipType === 'UNKNOWN') {
    return {
      caption: 'Source not determined',
      detail: '',
      description:
        'This membership was never classified — the group rules it would be checked against could not be loaded. It is not a manual add and not a rule grant; the answer is missing.',
      proven: false,
    };
  }

  if (membershipType === 'DIRECT') {
    return {
      caption: 'Added directly',
      detail: '',
      description: deduced
        ? 'No rule was matched, though not every rule condition could be evaluated. The user was added to the group by hand.'
        : 'No active group rule explains this membership, so the user was added to the group by hand.',
      proven: !deduced,
    };
  }

  if (rules.length === 0) {
    if (group.type === 'APP_GROUP') {
      return {
        caption: 'Managed by app',
        detail: '',
        description:
          'This group is mastered by an application, which manages its own members. No group rule explains the membership.',
        proven: !deduced,
      };
    }
    return {
      caption: 'Rule-managed, rule not identified',
      detail: '',
      description:
        'The membership is rule-managed, but no rule is attributed to it, so the granting rule cannot be named here.',
      proven: false,
    };
  }

  const namesRules = attributionNamesRules(attribution);
  const several =
    rules.length > 1 ? ` (${rules.length} ${namesRules ? 'rules' : 'candidates, unresolved'})` : '';

  return {
    caption: attributionCaption[attribution],
    detail: `${rules.map((r) => r.name).join(', ')}${several}`,
    description: ruleDescription(namesRules, deduced),
    proven: !deduced,
  };
}
