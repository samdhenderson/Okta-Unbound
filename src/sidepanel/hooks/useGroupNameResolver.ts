import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadCachedGroupIndex } from './fetchGroupRulesRequest';
import { useOktaApi } from './useOktaApi';
import { peek, setEntry } from '../cache/entityCache';
import { cacheKeys, TTL_LONG } from '../cache/keys';
import { createLogger } from '../../shared/utils/logger';
import type { GroupNameResolver } from '../components/shared';

const log = createLogger('useGroupNameResolver');

const GROUP_ID_SHAPE = /^00g[a-zA-Z0-9]{17}$/;

export interface GroupNameResolution {
  resolveGroupName: GroupNameResolver;
  request: (groupIds: readonly string[]) => void;
}

export interface UseGroupNameResolverOptions {
  targetTabId: number | null | undefined;
  oktaOrigin?: string | null;
  known?: ReadonlyMap<string, string>;
  enabled?: boolean;
}

export function useGroupNameResolver({
  targetTabId,
  oktaOrigin,
  known,
  enabled = true,
}: UseGroupNameResolverOptions): GroupNameResolution {
  const { getGroupById } = useOktaApi({ targetTabId: targetTabId ?? null, oktaOrigin });

  const [resolved, setResolved] = useState<ReadonlyMap<string, string>>(new Map());
  const inFlight = useRef<Set<string>>(new Set());
  const unnameable = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !oktaOrigin) return;
    let live = true;
    void loadCachedGroupIndex(oktaOrigin).then((index) => {
      if (!live || index.nameById.size === 0) return;
      setResolved((current) => {
        const next = new Map(current);
        for (const [id, name] of index.nameById) if (!next.has(id)) next.set(id, name);
        return next;
      });
    });
    return () => {
      live = false;
    };
  }, [enabled, oktaOrigin]);

  const request = useCallback(
    (groupIds: readonly string[]) => {
      if (!enabled || targetTabId === undefined || targetTabId === null) return;
      for (const groupId of groupIds) {
        if (!GROUP_ID_SHAPE.test(groupId)) continue;
        if (known?.has(groupId) || resolved.has(groupId)) continue;
        if (inFlight.current.has(groupId) || unnameable.current.has(groupId)) continue;

        const cached = peek<string>(cacheKeys.groupName(groupId));
        if (cached) {
          setResolved((current) => new Map(current).set(groupId, cached));
          continue;
        }

        inFlight.current.add(groupId);
        void getGroupById(groupId)
          .then((group) => {
            if (!group || group.name === groupId) {
              unnameable.current.add(groupId);
              return;
            }
            setEntry(cacheKeys.groupName(groupId), group.name, { ttl: TTL_LONG });
            setResolved((current) => new Map(current).set(groupId, group.name));
          })
          .catch(() => {
            unnameable.current.add(groupId);
          })
          .finally(() => {
            inFlight.current.delete(groupId);
          });
      }
      log.debug('Group-name lookup requested', { count: groupIds.length });
    },
    [enabled, targetTabId, getGroupById, known, resolved],
  );

  const resolveGroupName = useCallback<GroupNameResolver>(
    (groupId) => known?.get(groupId) ?? resolved.get(groupId),
    [known, resolved],
  );

  return useMemo(() => ({ resolveGroupName, request }), [resolveGroupName, request]);
}
