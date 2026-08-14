import React from 'react';
import {
  attributionNamesRules,
  isDeducedAttribution,
} from '../../../../shared/utils/membershipAnalysis';
import type { GroupMembership, MembershipAttribution } from '../../../../shared/types';

const attributionCaption: Record<MembershipAttribution, string> = {
  exact: 'Added by Rule:',
  inferred: 'Likely added by rule:',
  ambiguous: 'Possible rule:',
};

type SourceTone = 'answer' | 'nonAnswer';

interface GroupSourceLine {
  label: string;
  description: string;
  tone: SourceTone;
}

const ruleNames = (membership: GroupMembership): string =>
  membership.rules.map((rule) => rule.name).join(', ');

function sourceLine(membership: GroupMembership): GroupSourceLine {
  const { membershipType, rules, attribution, group } = membership;
  const deduced = isDeducedAttribution(attribution);
  const tone: SourceTone = deduced ? 'nonAnswer' : 'answer';

  if (membershipType === 'UNKNOWN') {
    return {
      label: 'Source not determined',
      description:
        'This membership was never classified — the group rules it would be checked against could not be loaded. It is not a manual add and not a rule grant; the answer is missing.',
      tone: 'nonAnswer',
    };
  }

  if (membershipType === 'DIRECT') {
    return {
      label: deduced ? 'Likely added directly' : 'Added directly',
      description: deduced
        ? 'No rule was matched, but not every rule condition could be evaluated, so a manual add is the likely explanation rather than a confirmed one.'
        : 'No active group rule explains this membership, so the user was added to the group by hand.',
      tone,
    };
  }

  if (rules.length === 0) {
    if (group.type === 'APP_GROUP') {
      return {
        label: 'Managed by app',
        description:
          'This group is mastered by an application, which manages its own members. No group rule explains the membership.',
        tone,
      };
    }
    return {
      label: 'Rule-managed, rule not identified',
      description:
        'The membership is rule-managed, but no rule is attributed to it, so the granting rule cannot be named here.',
      tone: 'nonAnswer',
    };
  }

  const namesRules = attributionNamesRules(attribution);
  const several =
    rules.length > 1 ? ` (${rules.length} ${namesRules ? 'rules' : 'candidates, unresolved'})` : '';

  return {
    label: `${attributionCaption[attribution]} ${ruleNames(membership)}${several}`,
    description: ruleDescription(namesRules, deduced),
    tone,
  };
}

function ruleDescription(namesRules: boolean, deduced: boolean): string {
  if (!namesRules) {
    return 'The classifier could not resolve which rule granted this membership, so everything listed is a candidate rather than the answer, and none of them is credited.';
  }
  if (deduced) {
    return 'Not every rule condition could be evaluated against this user, so the rules listed are the plausible source rather than a confirmed one. Okta does not record which rule added a member.';
  }
  return 'Every rule listed provably matches this user. Okta does not record which rule added a member, so this is the classifier evaluating rule conditions, not an Okta assertion.';
}

const baseClasses = 'min-w-0 truncate text-xs';

const chipClasses = 'rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-700';

const nonAnswerClasses = 'italic text-neutral-400';

const toneClasses: Record<SourceTone, string> = {
  answer: chipClasses,
  nonAnswer: nonAnswerClasses,
};

interface GroupSourceIndicatorProps {
  membership?: GroupMembership;
}

const GroupSourceIndicator: React.FC<GroupSourceIndicatorProps> = ({ membership }) => {
  if (!membership) return null;

  const { label, description, tone } = sourceLine(membership);
  return (
    <span className={`${baseClasses} ${toneClasses[tone]}`} title={`${label} — ${description}`}>
      {label}
    </span>
  );
};

export default GroupSourceIndicator;
