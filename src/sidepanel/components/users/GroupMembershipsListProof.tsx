import React, { useCallback, useState } from 'react';
import { Button } from '../shared';
import Icon from '../shared/Icon';
import { membershipSourceLine, sourceLineLabel } from '../../../shared/membership/sourceLine';
import { withMembershipProvenance } from '../../../shared/membership/provenance';
import type { MemberRuleAttribution } from '../../../shared/membership/memberRuleAttribution';
import type { GroupMembership } from '../../../shared/types';

export type MembershipProofOutcome =
  | { status: 'pending' }
  | { status: 'proven'; membership: GroupMembership }
  | { status: 'unanswered' };

export interface MembershipProofs {
  outcomeFor: (rowKey: string) => MembershipProofOutcome | undefined;
  prove: (membership: GroupMembership, rowKey?: string) => void;
  enabled: boolean;
}

export function useMembershipProofs(
  onProve?: (membership: GroupMembership, rowKey: string) => Promise<MemberRuleAttribution>,
): MembershipProofs {
  const [outcomes, setOutcomes] = useState<Record<string, MembershipProofOutcome>>({});

  const prove = useCallback(
    (membership: GroupMembership, key?: string) => {
      if (!onProve) return;
      const rowKey = key ?? membership.group.id;

      setOutcomes((current) => {
        if (current[rowKey]?.status === 'pending') return current;
        return { ...current, [rowKey]: { status: 'pending' } };
      });

      void onProve(membership, rowKey)
        .catch((): MemberRuleAttribution => ({ state: 'unknown' }))
        .then((answer) => {
          const proven = withMembershipProvenance(membership, answer);
          setOutcomes((current) => ({
            ...current,
            [rowKey]: proven.provenance
              ? { status: 'proven', membership: proven }
              : { status: 'unanswered' },
          }));
        });
    },
    [onProve],
  );

  const outcomeFor = useCallback((rowKey: string) => outcomes[rowKey], [outcomes]);

  return { outcomeFor, prove, enabled: Boolean(onProve) };
}

interface MembershipProofActionProps {
  membership: GroupMembership;
  outcome?: MembershipProofOutcome;
  onProve: (membership: GroupMembership) => void;
}

const MembershipProofAction: React.FC<MembershipProofActionProps> = ({
  membership,
  outcome,
  onProve,
}) => {
  if (outcome?.status === 'proven') {
    const line = membershipSourceLine(outcome.membership);
    const label = sourceLineLabel(line);
    return (
      <div
        className="mt-3 rounded-md border border-success-light bg-success-light p-3"
        title={`${label} — ${line.description}`}
      >
        <p className="flex items-center gap-2 text-xs font-medium text-success-text">
          <Icon type="check" size="xs" className="shrink-0" />
          {label}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        icon="shield"
        loading={outcome?.status === 'pending'}
        onClick={() => onProve(membership)}
        title="Ask Okta which rules manage this membership (one API call)"
      >
        Ask Okta
      </Button>
      {outcome?.status === 'unanswered' && (
        <span className="text-xs italic text-neutral-500">
          Okta did not answer for this membership — the classification above still stands as a
          deduction.
        </span>
      )}
    </div>
  );
};

export default MembershipProofAction;
