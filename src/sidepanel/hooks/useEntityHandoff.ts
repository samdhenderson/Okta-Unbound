import { useCallback, useState } from 'react';
import type { OktaPageContext, PageType } from './useOktaPageContext';
import type { JumpKind } from './useJumpResolver';

export interface HandoffOffer {
  kind: JumpKind;
  id: string;
  name: string;
}

function handoffKindOf(pageType: PageType): JumpKind | null {
  return pageType === 'admin' || pageType === 'unknown' ? null : pageType;
}

function liveEntityOf(page: OktaPageContext): HandoffOffer | null {
  if (page.connectionStatus !== 'connected') return null;
  const kind = handoffKindOf(page.pageType);
  if (kind === null) return null;

  switch (kind) {
    case 'group':
      return page.groupInfo
        ? { kind, id: page.groupInfo.groupId, name: page.groupInfo.groupName }
        : null;
    case 'user':
      return page.userInfo
        ? { kind, id: page.userInfo.userId, name: page.userInfo.userName }
        : null;
    case 'app':
      return page.appInfo ? { kind, id: page.appInfo.appId, name: page.appInfo.appName } : null;
    case 'policy':
      return page.policyInfo?.policyName
        ? { kind, id: page.policyInfo.policyId, name: page.policyInfo.policyName }
        : null;
    default:
      return null;
  }
}

export interface UseEntityHandoffOptions {
  page: OktaPageContext;
  canNavigateTo: (kind: JumpKind) => boolean;
  navigateTo: (kind: JumpKind, id: string) => void;
}

export interface UseEntityHandoffReturn {
  offer: HandoffOffer | null;
  accept: () => void;
  dismiss: () => void;
}

export function useEntityHandoff({
  page,
  canNavigateTo,
  navigateTo,
}: UseEntityHandoffOptions): UseEntityHandoffReturn {
  const [handledId, setHandledId] = useState<string | null>(null);

  const live = liveEntityOf(page);
  const offer = live !== null && live.id !== handledId && canNavigateTo(live.kind) ? live : null;

  const accept = useCallback(() => {
    if (offer === null) return;
    setHandledId(offer.id);
    navigateTo(offer.kind, offer.id);
  }, [offer, navigateTo]);

  const dismiss = useCallback(() => {
    if (offer === null) return;
    setHandledId(offer.id);
  }, [offer]);

  return { offer, accept, dismiss };
}
