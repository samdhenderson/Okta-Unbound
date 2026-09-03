import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEntityHandoff } from './useEntityHandoff';
import type { OktaPageContext, PageType } from './useOktaPageContext';
import type { JumpKind } from './useJumpResolver';

function pageContext(over: Partial<OktaPageContext> = {}): OktaPageContext {
  return {
    pageType: 'unknown',
    groupInfo: null,
    userInfo: null,
    appInfo: null,
    policyInfo: null,
    connectionStatus: 'connected',
    targetTabId: 1,
    error: null,
    isLoading: false,
    refetch: async () => {},
    oktaOrigin: 'https://example.okta.com',
    resyncPending: false,
    ...over,
  };
}

const PAGES: Record<PageType, { page: OktaPageContext; offers: string | null }> = {
  group: {
    page: pageContext({
      pageType: 'group',
      groupInfo: { groupId: '00gFAKE0001', groupName: 'Payments Team' },
    }),
    offers: 'Payments Team',
  },
  user: {
    page: pageContext({
      pageType: 'user',
      userInfo: { userId: '00uFAKE0001', userName: 'user@example.com', userStatus: 'ACTIVE' },
    }),
    offers: 'user@example.com',
  },
  app: {
    page: pageContext({
      pageType: 'app',
      appInfo: { appId: '0oaFAKE0001', appName: 'Salesforce' },
    }),
    offers: 'Salesforce',
  },
  policy: {
    page: pageContext({
      pageType: 'policy',
      policyInfo: { policyId: 'rstFAKE0001', policyName: 'Default Policy' },
    }),
    offers: 'Default Policy',
  },
  admin: { page: pageContext({ pageType: 'admin' }), offers: null },
  unknown: { page: pageContext({ pageType: 'unknown' }), offers: null },
};

function options(page: OktaPageContext, over: Record<string, unknown> = {}) {
  return {
    page,
    suppressed: false,
    canNavigateTo: () => true,
    navigateTo: vi.fn(),
    ...over,
  };
}

describe('useEntityHandoff', () => {
  describe('one case per PageType', () => {
    for (const [pageType, { page, offers }] of Object.entries(PAGES)) {
      it(`${offers === null ? 'offers nothing' : 'offers the entity'} on a ${pageType} page`, () => {
        const { result } = renderHook(() => useEntityHandoff(options(page)));

        if (offers === null) {
          expect(result.current.offer).toBeNull();
        } else {
          expect(result.current.offer?.name).toBe(offers);
          expect(result.current.offer?.kind).toBe(pageType);
        }
      });
    }
  });

  it('offers nothing while the probe has not landed — unknown is not the same as empty', () => {
    const { result } = renderHook(() =>
      useEntityHandoff(
        options(
          pageContext({
            pageType: 'group',
            groupInfo: { groupId: '00gFAKE0001', groupName: 'Payments Team' },
            connectionStatus: 'error',
            error: 'Content script is gone',
          }),
        ),
      ),
    );
    expect(result.current.offer).toBeNull();
  });

  it('offers nothing for a kind this build cannot reach', () => {
    const { result } = renderHook(() =>
      useEntityHandoff(
        options(PAGES.policy.page, { canNavigateTo: (kind: JumpKind) => kind !== 'policy' }),
      ),
    );
    expect(result.current.offer).toBeNull();
  });

  it('is withheld while pinned, where the bar has its own switch hint', () => {
    const { result } = renderHook(() =>
      useEntityHandoff(options(PAGES.group.page, { suppressed: true })),
    );
    expect(result.current.offer).toBeNull();
  });

  it('offers; it does not navigate, until it is accepted', () => {
    const navigateTo = vi.fn();
    const { result } = renderHook(() => useEntityHandoff(options(PAGES.user.page, { navigateTo })));

    expect(navigateTo).not.toHaveBeenCalled();

    act(() => result.current.accept());
    expect(navigateTo).toHaveBeenCalledWith('user', '00uFAKE0001');
    expect(result.current.offer).toBeNull();
  });

  describe('dismissal', () => {
    it('hides the offer for that entity, without navigating', () => {
      const navigateTo = vi.fn();
      const { result } = renderHook(() =>
        useEntityHandoff(options(PAGES.group.page, { navigateTo })),
      );

      act(() => result.current.dismiss());

      expect(result.current.offer).toBeNull();
      expect(navigateTo).not.toHaveBeenCalled();
    });

    it('returns when the live tab moves to a different entity', () => {
      const { result, rerender } = renderHook(
        ({ page }: { page: OktaPageContext }) => useEntityHandoff(options(page)),
        { initialProps: { page: PAGES.group.page } },
      );

      act(() => result.current.dismiss());
      expect(result.current.offer).toBeNull();

      rerender({
        page: pageContext({
          pageType: 'group',
          groupInfo: { groupId: '00gFAKE0002', groupName: 'Finance Team' },
        }),
      });
      expect(result.current.offer?.name).toBe('Finance Team');
    });

    it('stays dismissed while the live tab is still on the same entity', () => {
      const { result, rerender } = renderHook(
        ({ page }: { page: OktaPageContext }) => useEntityHandoff(options(page)),
        { initialProps: { page: PAGES.group.page } },
      );

      act(() => result.current.dismiss());
      rerender({
        page: pageContext({
          pageType: 'group',
          groupInfo: { groupId: '00gFAKE0001', groupName: 'Payments Team' },
        }),
      });
      expect(result.current.offer).toBeNull();
    });
  });
});
