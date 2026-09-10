import { useMemo, useState } from 'react';
import type { GroupMembership, OktaUser } from '../../shared/types';
import type { OktaUserProfileSchema } from '../../shared/schemas/okta';
import type { ProfileDisplayConfig } from '../../shared/storage/profileDisplayStore';
import { useEntityQuery } from '../cache/useEntityQuery';
import { cacheKeys, TTL_LONG } from '../cache/keys';
import {
  allProfileAttributes,
  type AttributeDescriptor,
} from '../components/users/profileAttributes';
import { profileMastering, type ProfileMastering } from '../components/users/profileEditability';
import { profileRuleReads } from '../components/users/profileRuleReads';
import { useOktaApi } from './useOktaApi';
import { useProfileDisplayConfig } from './useProfileDisplayConfig';
import { useUserApps, type AppsByGroupId } from './useUserApps';
import type { UserAppAssignment, UserAppsResult } from './useOktaApi/userOperations';
import type { RuleInventoryState } from './useUserMemberships';
import { userDisplayName } from '../../shared/utils/userDisplay';
import { useWorkingSetEntry } from './useWorkingSetEntry';

export type UserDetailPane = 'groups' | 'apps' | 'profile';

const PANE_LABEL: Record<UserDetailPane, string> = {
  groups: 'Groups',
  apps: 'Apps',
  profile: 'Profile',
};

export interface UseUserDetailPanesOptions {
  user: OktaUser | null;
  targetTabId?: number;
  oktaOrigin: string | null;
  memberships: GroupMembership[];
  rules: RuleInventoryState;
  enabled?: boolean;
}

export interface UseUserDetailPanesReturn {
  pane: UserDetailPane;
  setPane: (pane: UserDetailPane) => void;

  apps: UserAppAssignment[];
  isLoadingApps: boolean;
  appsComplete: boolean;
  appsByGroupId: AppsByGroupId;
  appCount?: number;

  attributes: AttributeDescriptor[];
  isLoadingProfile: boolean;
  profileConfig: ProfileDisplayConfig;
  updateProfileConfig: (patch: Partial<ProfileDisplayConfig>) => void;
  ruleReads: Record<string, string[]>;
  mastering: ProfileMastering;
}

export function useUserDetailPanes({
  user,
  targetTabId,
  oktaOrigin,
  memberships,
  rules,
  enabled = true,
}: UseUserDetailPanesOptions): UseUserDetailPanesReturn {
  const [pane, setPane] = useState<UserDetailPane>('groups');
  const { getUserProfileSchema, getUserApps } = useOktaApi({ targetTabId: targetTabId ?? null });

  const userId = user?.id ?? null;
  const [paneUserId, setPaneUserId] = useState<string | null>(userId);
  if (paneUserId !== userId) {
    setPaneUserId(userId);
    setPane('groups');
  }

  useWorkingSetEntry({
    origin: oktaOrigin,
    kind: 'user',
    id: userId,
    name: user ? userDisplayName(user) : null,
    pane: PANE_LABEL[pane],
    enabled,
  });

  const appsResult = useUserApps(userId, {
    targetTabId: targetTabId ?? null,
    memberships,
    oktaOrigin,
    enabled: enabled && pane === 'apps',
  });

  const schemaQuery = useEntityQuery<OktaUserProfileSchema | null>(
    cacheKeys.userSchema(oktaOrigin),
    () => getUserProfileSchema(),
    { ttl: TTL_LONG, enabled: enabled && pane === 'profile' && Boolean(targetTabId) },
  );

  const masteringApps = useEntityQuery<UserAppsResult>(
    cacheKeys.userApps(userId ?? 'none'),
    () => getUserApps(userId as string),
    { enabled: enabled && pane === 'profile' && Boolean(userId) },
  );

  const mastering = useMemo(
    () => profileMastering(masteringApps.data?.apps, masteringApps.data?.complete ?? false),
    [masteringApps.data],
  );

  const attributes = useMemo(
    () => (user ? allProfileAttributes(user, schemaQuery.data) : []),
    [user, schemaQuery.data],
  );

  const attributeNames = attributes.map((attribute) => attribute.name);
  const { config: profileConfig, update: updateProfileConfig } = useProfileDisplayConfig(
    oktaOrigin,
    attributeNames,
  );

  const ruleReads = useMemo(
    () =>
      user && rules.status === 'available' ? profileRuleReads(rules.rules, user, memberships) : {},
    [rules, user, memberships],
  );

  return {
    pane,
    setPane,

    apps: appsResult.apps,
    isLoadingApps: appsResult.isLoading,
    appsComplete: appsResult.complete,
    appsByGroupId: appsResult.appsByGroupId,
    appCount: appsResult.hasLoaded ? appsResult.apps.length : undefined,

    attributes,
    isLoadingProfile: schemaQuery.isLoading,
    profileConfig,
    updateProfileConfig,
    ruleReads,
    mastering,
  };
}
