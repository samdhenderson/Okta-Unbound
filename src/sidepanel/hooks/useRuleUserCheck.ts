import { useCallback, useMemo } from 'react';
import type { FormattedRule } from '../../shared/types';
import { assessRuleForUser } from '../../shared/membership/qualification';
import type { RuleUserVerdict } from '../../shared/membership/qualificationTypes';
import { useQualificationSubject, type QualificationSubjectState } from './useQualificationSubject';
import { useUserPicker, type UseUserPickerReturn } from './useUserPicker';

export interface UseRuleUserCheckOptions {
  rule: FormattedRule;
  targetTabId: number | null;
  enabled: boolean;
}

export interface UseRuleUserCheckReturn {
  picker: UseUserPickerReturn;
  subject: QualificationSubjectState;
  verdict: RuleUserVerdict | null;
  openPicker: (() => void) | undefined;
  clear: () => void;
}

export function useRuleUserCheck({
  rule,
  targetTabId,
  enabled,
}: UseRuleUserCheckOptions): UseRuleUserCheckReturn {
  const {
    state: subject,
    load,
    clear,
  } = useQualificationSubject({
    targetTabId,
    scopeKey: rule.id,
  });

  const onPick = useCallback((user: { id: string }) => load(user.id), [load]);
  const picker = useUserPicker({ targetTabId, onPick, enabled });

  const names = rule.allGroupNamesMap;
  const groupNames = useMemo(() => (names ? new Map(Object.entries(names)) : undefined), [names]);

  const verdict = useMemo(
    () =>
      subject.status === 'loaded'
        ? assessRuleForUser(
            rule,
            { user: subject.user, groupContext: subject.groupContext },
            groupNames,
            rule.missingGroupIds,
          )
        : null,
    [rule, subject, groupNames],
  );

  return {
    picker,
    subject,
    verdict,
    openPicker: targetTabId === null ? undefined : picker.open,
    clear,
  };
}
