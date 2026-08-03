import { useCallback } from 'react';
import type { GroupInfo, UserInfo, PolicyInfo } from '../../shared/types';
import {
  useOktaTabContext,
  type ConnectionStatus,
  type EntityLoadContext,
} from './useOktaTabContext';

export type PageType = 'group' | 'user' | 'app' | 'policy' | 'admin' | 'unknown';

export interface AppInfo {
  appId: string;
  appName: string;
  appLabel?: string;
}

interface PageDetection {
  pageType: PageType;
  groupInfo: GroupInfo | null;
  userInfo: UserInfo | null;
  appInfo: AppInfo | null;
  policyInfo: PolicyInfo | null;
}

export interface OktaPageContext extends PageDetection {
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
  resyncPending: boolean;
}

const NO_ENTITY = { groupInfo: null, userInfo: null, appInfo: null, policyInfo: null } as const;

const UNKNOWN: PageDetection = { pageType: 'unknown', ...NO_ENTITY };
const ADMIN: PageDetection = { pageType: 'admin', ...NO_ENTITY };

export function useOktaPageContext(enabled = true): OktaPageContext {
  const loadEntity = useCallback(
    async ({ sendToTab }: EntityLoadContext): Promise<PageDetection> => {
      const [groupResponse, userResponse, appResponse, policyResponse] = await Promise.all([
        sendToTab<GroupInfo>('getGroupInfo'),
        sendToTab<UserInfo>('getUserInfo'),
        sendToTab<AppInfo>('getAppInfo'),
        sendToTab<PolicyInfo>('getPolicyInfo'),
      ]);

      if (groupResponse.success && groupResponse.data) {
        return { ...NO_ENTITY, pageType: 'group', groupInfo: groupResponse.data };
      }
      if (userResponse.success && userResponse.data) {
        return { ...NO_ENTITY, pageType: 'user', userInfo: userResponse.data };
      }
      if (appResponse.success && appResponse.data) {
        return { ...NO_ENTITY, pageType: 'app', appInfo: appResponse.data };
      }
      if (policyResponse.success && policyResponse.data) {
        return { ...NO_ENTITY, pageType: 'policy', policyInfo: policyResponse.data };
      }
      return ADMIN;
    },
    [],
  );

  const { data, ...rest } = useOktaTabContext<PageDetection>({
    scope: 'useOktaPageContext',
    initialData: UNKNOWN,
    commsFailedData: ADMIN,
    loadEntity,
    enabled,
  });

  return { ...data, ...rest };
}
