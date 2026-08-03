import type { GroupInfo, UserInfo } from '../shared/types';
import type { PageType } from './hooks/useOktaPageContext';

export type PinnablePageType = Extract<PageType, 'group' | 'user'>;

export interface PinnedContext {
  pageType: PinnablePageType;
  groupInfo: GroupInfo | null;
  userInfo: UserInfo | null;
  targetTabId: number;
  oktaOrigin: string | null;
}

export interface LiveTabContext {
  targetTabId: number | null;
  groupInfo: GroupInfo | null;
  oktaOrigin: string | null;
}

export interface TabContext {
  targetTabId: number | null;
  currentGroupId: string | undefined;
  oktaOrigin: string | null;
}

export function deriveTabContext(pinned: PinnedContext | null, live: LiveTabContext): TabContext {
  if (pinned) {
    return {
      targetTabId: pinned.targetTabId,
      currentGroupId: pinned.groupInfo?.groupId,
      oktaOrigin: pinned.oktaOrigin,
    };
  }
  return {
    targetTabId: live.targetTabId,
    currentGroupId: live.groupInfo?.groupId,
    oktaOrigin: live.oktaOrigin,
  };
}
