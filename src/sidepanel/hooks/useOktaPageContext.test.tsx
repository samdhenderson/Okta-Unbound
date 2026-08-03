import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOktaPageContext } from './useOktaPageContext';

type SendResponse = { success: boolean; data?: unknown };

function mockOktaTab(responder: (action: string) => SendResponse) {
  (chrome as unknown as { windows: unknown }).windows = {
    getCurrent: vi.fn().mockResolvedValue({ id: 1 }),
  };
  chrome.tabs.query = vi
    .fn()
    .mockResolvedValue([{ id: 42, url: 'https://acme.okta.com/admin/dashboard', active: true }]);
  chrome.tabs.sendMessage = vi
    .fn()
    .mockImplementation((_tabId: number, msg: { action: string }) =>
      Promise.resolve(responder(msg.action)),
    ) as unknown as typeof chrome.tabs.sendMessage;
  chrome.tabs.get = vi.fn();
}

const origin = (action: string): SendResponse =>
  action === 'getOktaOrigin'
    ? { success: true, data: 'https://acme.okta.com' }
    : { success: false };

const POLICY_ID = 'rstFAKE0123456789abc';

const policyData = { policyId: POLICY_ID, policyName: 'Contractor MFA', policyStatus: 'ACTIVE' };

describe('useOktaPageContext policy detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects a policy page', async () => {
    mockOktaTab((action) =>
      action === 'getPolicyInfo' ? { success: true, data: policyData } : origin(action),
    );

    const { result } = renderHook(() => useOktaPageContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageType).toBe('policy');
    expect(result.current.policyInfo).toEqual(policyData);
    expect(result.current.groupInfo).toBeNull();
    expect(result.current.userInfo).toBeNull();
    expect(result.current.appInfo).toBeNull();
  });

  it('leaves policyInfo null on a non-policy page', async () => {
    mockOktaTab(origin);

    const { result } = renderHook(() => useOktaPageContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageType).toBe('admin');
    expect(result.current.policyInfo).toBeNull();
  });

  it('ranks an app page above a policy page when both probes answer', async () => {
    mockOktaTab((action) => {
      if (action === 'getAppInfo')
        return { success: true, data: { appId: '0oaFAKE001', appName: 'Salesforce' } };
      if (action === 'getPolicyInfo') return { success: true, data: policyData };
      return origin(action);
    });

    const { result } = renderHook(() => useOktaPageContext());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pageType).toBe('app');
    expect(result.current.policyInfo).toBeNull();
  });
});
