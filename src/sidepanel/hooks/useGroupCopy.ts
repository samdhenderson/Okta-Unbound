import { useState, useCallback } from 'react';
import { useOktaApi } from './useOktaApi';
import type { OktaUser, OktaGroup } from '../../shared/types';

interface UseGroupCopyOptions {
  targetTabId: number;
  contextUser: OktaUser;
  comparedUser: OktaUser | null;
  onContextGroupsChanged: () => void;
  onComparedGroupsChanged: () => void;
}

interface UseGroupCopyReturn {
  addedToContextIds: Set<string>;
  addedToComparedIds: Set<string>;
  addingGroupId: string | null;
  addError: string | null;
  setAddError: (v: string | null) => void;
  addToContext: (group: OktaGroup) => Promise<void>;
  addToCompared: (group: OktaGroup) => Promise<void>;
  resetCopyState: () => void;
  resetForChangeUser: () => void;
}

export function useGroupCopy({
  targetTabId,
  contextUser,
  comparedUser,
  onContextGroupsChanged,
  onComparedGroupsChanged,
}: UseGroupCopyOptions): UseGroupCopyReturn {
  const { addUserToGroup } = useOktaApi({ targetTabId: targetTabId ?? null });

  const [addedToContextIds, setAddedToContextIds] = useState<Set<string>>(new Set());
  const [addedToComparedIds, setAddedToComparedIds] = useState<Set<string>>(new Set());
  const [addingGroupId, setAddingGroupId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const runAdd = useCallback(
    async (
      group: OktaGroup,
      user: OktaUser,
      markAdded: (id: string) => void,
      onChanged: () => void,
    ) => {
      setAddingGroupId(group.id);
      setAddError(null);
      try {
        const result = await addUserToGroup(group.id, group.profile.name, {
          id: user.id,
          profile: {
            login: user.profile.login,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            email: user.profile.email,
          },
        });

        if (result.success) {
          markAdded(group.id);
          onChanged();
        } else {
          setAddError(result.error || `Failed to add to ${group.profile.name}`);
        }
      } catch (err) {
        setAddError(err instanceof Error ? err.message : 'Failed to add user to group');
      } finally {
        setAddingGroupId(null);
      }
    },
    [addUserToGroup],
  );

  const addToContext = useCallback(
    (group: OktaGroup) =>
      runAdd(
        group,
        contextUser,
        (id) => setAddedToContextIds((prev) => new Set(prev).add(id)),
        onContextGroupsChanged,
      ),
    [runAdd, contextUser, onContextGroupsChanged],
  );

  const addToCompared = useCallback(
    (group: OktaGroup) => {
      if (!comparedUser) return Promise.resolve();
      return runAdd(
        group,
        comparedUser,
        (id) => setAddedToComparedIds((prev) => new Set(prev).add(id)),
        onComparedGroupsChanged,
      );
    },
    [runAdd, comparedUser, onComparedGroupsChanged],
  );

  const resetCopyState = useCallback(() => {
    setAddedToContextIds(new Set());
    setAddedToComparedIds(new Set());
    setAddingGroupId(null);
    setAddError(null);
  }, []);

  const resetForChangeUser = useCallback(() => {
    setAddedToContextIds(new Set());
    setAddedToComparedIds(new Set());
    setAddError(null);
  }, []);

  return {
    addedToContextIds,
    addedToComparedIds,
    addingGroupId,
    addError,
    setAddError,
    addToContext,
    addToCompared,
    resetCopyState,
    resetForChangeUser,
  };
}
