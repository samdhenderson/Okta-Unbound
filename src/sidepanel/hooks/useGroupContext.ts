import { useState, useEffect, useCallback, useRef } from 'react';
import type { GroupInfo, MessageResponse } from '../../shared/types';

type ConnectionStatus = 'connecting' | 'connected' | 'error';

interface UseGroupContextReturn {
  groupInfo: GroupInfo | null;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
}

export function useGroupContext(): UseGroupContextReturn {
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [targetTabId, setTargetTabId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [oktaOrigin, setOktaOrigin] = useState<string | null>(null);

  const fetchIdRef = useRef(0);

  const fetchGroupInfo = useCallback(async (retryCount = 0) => {
    const currentFetchId = ++fetchIdRef.current;

    try {
      console.log('[useGroupContext] Fetching group info... (attempt', retryCount + 1, ')');
      setIsLoading(true);
      setError(null);

      const currentWindow = await chrome.windows.getCurrent();
      console.log('[useGroupContext] Current window ID:', currentWindow.id);

      const allTabsInWindow = await chrome.tabs.query({ windowId: currentWindow.id });
      console.log('[useGroupContext] Tabs in current window:', allTabsInWindow.length);

      const oktaTabs = allTabsInWindow.filter(
        (tab) =>
          tab.url &&
          (tab.url.includes('okta.com') ||
            tab.url.includes('oktapreview.com') ||
            tab.url.includes('okta-emea.com')),
      );

      console.log(
        '[useGroupContext] Okta tabs found:',
        oktaTabs.length,
        oktaTabs.map((t) => ({ id: t.id, url: t.url, active: t.active })),
      );

      if (oktaTabs.length === 0) {
        throw new Error('Please open an Okta admin page in this window');
      }

      const tab = oktaTabs.find((t) => t.active) || oktaTabs[0];
      console.log('[useGroupContext] Selected Okta tab:', {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        active: tab.active,
      });

      if (currentFetchId !== fetchIdRef.current) {
        console.log('[useGroupContext] Skipping stale request');
        return;
      }

      setTargetTabId(tab.id!);

      try {
        console.log('[useGroupContext] Fetching Okta origin from tab', tab.id);
        const originResponse: MessageResponse<string> = await chrome.tabs.sendMessage(tab.id!, {
          action: 'getOktaOrigin',
        });

        if (originResponse.success && originResponse.data) {
          setOktaOrigin(originResponse.data);
          console.log('[useGroupContext] Okta origin:', originResponse.data);
        }

        if (currentFetchId !== fetchIdRef.current) {
          console.log('[useGroupContext] Skipping stale request after origin fetch');
          return;
        }

        console.log('[useGroupContext] Sending getGroupInfo message to tab', tab.id);
        const response: MessageResponse<GroupInfo> = await chrome.tabs.sendMessage(tab.id!, {
          action: 'getGroupInfo',
        });

        console.log('[useGroupContext] Received response:', response);

        if (currentFetchId !== fetchIdRef.current) {
          console.log('[useGroupContext] Skipping stale request after group info fetch');
          return;
        }

        setConnectionStatus('connected');
        setError(null);

        if (response.success && response.data) {
          setGroupInfo(response.data);
          console.log(
            '[useGroupContext] Connected to Okta and on group page:',
            response.data.groupName,
          );
        } else {
          setGroupInfo(null);
          console.log('[useGroupContext] Connected to Okta admin, but not on a group page');
        }
      } catch (messageErr) {
        console.warn('[useGroupContext] Content script communication error:', messageErr);

        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
          console.log(`[useGroupContext] Retrying in ${delay}ms...`);
          setTimeout(() => fetchGroupInfo(retryCount + 1), delay);
          return; // Don't finalize loading state yet
        } else {
          setConnectionStatus('connected');
          setGroupInfo(null);
          setError('Connected to Okta, but extension communication delayed');
          console.warn('[useGroupContext] Max retries reached, showing as connected anyway');
        }
      }
    } catch (err) {
      console.error('[useGroupContext] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setConnectionStatus('error');
      setGroupInfo(null);
      setOktaOrigin(null);
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchGroupInfo();

    let debounceTimer: NodeJS.Timeout | null = null;

    const debouncedFetch = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        fetchGroupInfo();
      }, 150); // 150ms debounce
    };

    const handleTabUpdate = (
      _tabId: number,
      changeInfo: { url?: string; status?: string },
      tab: chrome.tabs.Tab,
    ) => {
      if (
        changeInfo.url &&
        tab.url &&
        (tab.url.includes('okta.com') ||
          tab.url.includes('oktapreview.com') ||
          tab.url.includes('okta-emea.com'))
      ) {
        console.log('[useGroupContext] Okta tab URL changed, refetching (debounced)');
        debouncedFetch();
      }

      if (
        changeInfo.status === 'complete' &&
        tab.url &&
        (tab.url.includes('okta.com') ||
          tab.url.includes('oktapreview.com') ||
          tab.url.includes('okta-emea.com'))
      ) {
        console.log('[useGroupContext] Okta tab loaded, verifying group context (debounced)');
        debouncedFetch();
      }
    };

    const handleTabActivated = (activeInfo: { tabId: number; windowId: number }) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (
          tab.url &&
          (tab.url.includes('okta.com') ||
            tab.url.includes('oktapreview.com') ||
            tab.url.includes('okta-emea.com'))
        ) {
          console.log('[useGroupContext] Okta tab activated, refetching group info (debounced)');
          debouncedFetch();
        }
      });
    };

    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    chrome.tabs.onActivated.addListener(handleTabActivated);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, [fetchGroupInfo]);

  return {
    groupInfo,
    connectionStatus,
    targetTabId,
    error,
    isLoading,
    refetch: fetchGroupInfo,
    oktaOrigin,
  };
}
