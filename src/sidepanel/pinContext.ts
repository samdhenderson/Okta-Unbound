import type { GroupInfo, UserInfo } from '../shared/types';
import { isOktaUrl } from '../shared/utils/oktaUrl';
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

export async function revalidatePinnedContext(saved: PinnedContext): Promise<PinnedContext | null> {
  try {
    const tab = await chrome.tabs.get(saved.targetTabId);
    if (isOktaUrl(tab.url)) return saved;
  } catch {
    // The tab no longer exists — fall through and re-resolve against live tabs.
  }

  try {
    const currentWindow = await chrome.windows.getCurrent();
    const tabsInWindow = await chrome.tabs.query({ windowId: currentWindow.id });
    const oktaTabs = tabsInWindow.filter((tab) => isOktaUrl(tab.url));
    const liveTab = oktaTabs.find((t) => t.active) ?? oktaTabs[0];
    if (!liveTab || liveTab.id == null) return null;
    return { ...saved, targetTabId: liveTab.id };
  } catch {
    return null;
  }
}
