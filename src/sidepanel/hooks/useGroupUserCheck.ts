import { useCallback, useMemo } from 'react';
import type { GroupSummary } from '../../shared/types';
import { assessGroupForUser } from '../../shared/membership/qualification';
import type { GroupUserVerdict } from '../../shared/membership/qualificationTypes';
import type { FeedingRule, SourceStatus } from './useGroupSource';
import { useQualificationSubject, type QualificationSubjectState } from './useQualificationSubject';
import { useUserPicker, type UseUserPickerReturn } from './useUserPicker';

export interface UseGroupUserCheckOptions {
  group: GroupSummary;
  feedingRules: readonly FeedingRule[];
  rulesStatus: SourceStatus;
  targetTabId: number | null;
  enabled: boolean;
}

export type GroupUserCheck =
  | { readonly kind: 'none' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'verdict'; readonly verdict: GroupUserVerdict };

export interface UseGroupUserCheckReturn {
  picker: UseUserPickerReturn;
  subject: QualificationSubjectState;
  check: GroupUserCheck;
  openPicker: (() => void) | undefined;
  clear: () => void;
}

export function useGroupUserCheck({
  group,
  feedingRules,
  rulesStatus,
  targetTabId,
  enabled,
}: UseGroupUserCheckOptions): UseGroupUserCheckReturn {
  const {
    state: subject,
    load,
    clear,
  } = useQualificationSubject({
    targetTabId,
    scopeKey: group.id,
  });

  const onPick = useCallback((user: { id: string }) => load(user.id), [load]);
  const picker = useUserPicker({ targetTabId, onPick, enabled });

  const check = useMemo<GroupUserCheck>(() => {
    if (subject.status !== 'loaded') return { kind: 'none' };
    if (rulesStatus === 'idle' || rulesStatus === 'loading') return { kind: 'pending' };
    const names = new Map<string, string>([[group.id, group.name]]);
    for (const rule of feedingRules) {
      for (const [id, name] of Object.entries(rule.allGroupNamesMap ?? {})) names.set(id, name);
    }
    return {
      kind: 'verdict',
      verdict: assessGroupForUser({
        group: { id: group.id, type: group.type },
        feedingRules: rulesStatus === 'error' ? null : feedingRules,
        subject: { user: subject.user, groupContext: subject.groupContext },
        groupNames: names,
      }),
    };
  }, [subject, rulesStatus, feedingRules, group.id, group.name, group.type]);

  return {
    picker,
    subject,
    check,
    openPicker: targetTabId === null ? undefined : picker.open,
    clear,
  };
}
