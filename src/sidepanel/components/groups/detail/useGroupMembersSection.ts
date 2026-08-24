import { useCallback, useMemo, useState } from 'react';
import type { GroupSummary, OktaUser } from '../../../../shared/types';
import { useOktaApi } from '../../../hooks/useOktaApi';
import { peek, setEntry } from '../../../cache/entityCache';
import { cacheKeys } from '../../../cache/keys';
import type { SourceStatus } from '../../../hooks/useGroupSource';
import { createLogger } from '../../../../shared/utils/logger';

const log = createLogger('useGroupMembersSection');

export type MemberWriteStatus = 'idle' | 'loading' | 'error';

export interface UseGroupMembersSectionReturn {
  members: OktaUser[] | null;

  removeTarget: OktaUser | null;
  requestRemove: (user: OktaUser) => void;
  cancelRemove: () => void;
  confirmRemove: () => void;
  removeStatus: MemberWriteStatus;
  removeError: string | null;

  onMemberAdded: (user: OktaUser) => void;
}

export function useGroupMembersSection(
  group: GroupSummary,
  targetTabId: number | null,
  memberStatus: SourceStatus,
  onRosterChanged?: (members: OktaUser[]) => void,
): UseGroupMembersSectionReturn {
  const api = useOktaApi({ targetTabId });
  const { removeUserFromGroup } = api;

  const [cacheTick, setCacheTick] = useState(0);

  const members = useMemo<OktaUser[] | null>(() => {
    void cacheTick;
    if (memberStatus !== 'done') return null;
    return peek<OktaUser[]>(cacheKeys.groupMembers(group.id)) ?? [];
  }, [group.id, memberStatus, cacheTick]);

  const writeBack = useCallback(
    (next: OktaUser[]) => {
      setEntry(cacheKeys.groupMembers(group.id), next);
      setCacheTick((t) => t + 1);
      onRosterChanged?.(next);
    },
    [group.id, onRosterChanged],
  );

  const [removeTarget, setRemoveTarget] = useState<OktaUser | null>(null);
  const [removeStatus, setRemoveStatus] = useState<MemberWriteStatus>('idle');
  const [removeError, setRemoveError] = useState<string | null>(null);

  const requestRemove = useCallback((user: OktaUser) => {
    setRemoveTarget(user);
    setRemoveStatus('idle');
    setRemoveError(null);
  }, []);

  const cancelRemove = useCallback(() => {
    setRemoveTarget(null);
    setRemoveStatus('idle');
    setRemoveError(null);
  }, []);

  const confirmRemove = useCallback(() => {
    if (!removeTarget || !members) return;
    const target = removeTarget;
    setRemoveStatus('loading');
    setRemoveError(null);

    removeUserFromGroup(group.id, group.name, target)
      .then((result) => {
        if (!result.success) {
          setRemoveStatus('error');
          setRemoveError(result.error || 'Failed to remove member.');
          return;
        }
        writeBack(members.filter((m) => m.id !== target.id));
        setRemoveTarget(null);
        setRemoveStatus('idle');
      })
      .catch((err: unknown) => {
        log.error('Failed to remove member:', err);
        setRemoveStatus('error');
        setRemoveError(err instanceof Error ? err.message : 'Failed to remove member.');
      });
  }, [removeTarget, members, removeUserFromGroup, group.id, group.name, writeBack]);

  const onMemberAdded = useCallback(
    (user: OktaUser) => {
      if (!members) return;
      writeBack([...members, user]);
    },
    [members, writeBack],
  );

  return {
    members,
    removeTarget,
    requestRemove,
    cancelRemove,
    confirmRemove,
    removeStatus,
    removeError,
    onMemberAdded,
  };
}
