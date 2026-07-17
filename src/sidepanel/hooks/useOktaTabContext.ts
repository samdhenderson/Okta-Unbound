import { useState, useEffect, useCallback, useRef } from 'react';
import type { MessageResponse } from '../../shared/types';
import { createLogger } from '../../shared/utils/logger';
import { isOktaUrl } from '../../shared/utils/oktaUrl';

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

export interface EntityLoadContext {
  tabId: number;
  sendToTab: <R>(action: string) => Promise<MessageResponse<R>>;
  isStale: () => boolean;
  log: ReturnType<typeof createLogger>;
}

export interface OktaTabContextConfig<T> {
  scope: string;
  initialData: T;
  commsFailedData: T;
  loadEntity: (ctx: EntityLoadContext) => Promise<T>;
  enabled?: boolean;
}

export interface OktaTabContext<T> {
  data: T;
  connectionStatus: ConnectionStatus;
  targetTabId: number | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  oktaOrigin: string | null;
  resyncPending: boolean;
}

const MAX_RETRIES = 3;
const DEBOUNCE_MS = 150;

function normalizeEntityUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function useOktaTabContext<T>(config: OktaTabContextConfig<T>): OktaTabContext<T> {
  const { scope, initialData, commsFailedData, loadEntity, enabled = true } = config;
  const log = useRef(createLogger(scope)).current;

  const [data, setData] = useState<T>(initialData);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [targetTabId, setTargetTabId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [oktaOrigin, setOktaOrigin] = useState<string | null>(null);
  const [resyncPending, setResyncPending] = useState(false);

  const fetchIdRef = useRef(0);
  const lastEntityUrlRef = useRef<string | null>(null);
  const pendingResyncRef = useRef(false);

  const fetchContext = useCallback(
    async (retryCount = 0) => {
      const currentFetchId = ++fetchIdRef.current;
      const isStale = () => currentFetchId !== fetchIdRef.current;
      setResyncPending(false);

      try {
        log.debug('Fetching context', { attempt: retryCount + 1 });
        setIsLoading(true);
        setError(null);

        const currentWindow = await chrome.windows.getCurrent();
        const allTabsInWindow = await chrome.tabs.query({ windowId: currentWindow.id });
        const oktaTabs = allTabsInWindow.filter((tab) => isOktaUrl(tab.url));

        if (oktaTabs.length === 0) {
          throw new Error('Please open an Okta admin page in this window');
        }

        const tab = oktaTabs.find((t) => t.active) || oktaTabs[0];

        if (isStale()) {
          log.debug('Skipping stale request');
          return;
        }

        setTargetTabId(tab.id!);
        lastEntityUrlRef.current = normalizeEntityUrl(tab.url);

        const sendToTab = <R>(action: string): Promise<MessageResponse<R>> =>
          chrome.tabs.sendMessage(tab.id!, { action });

        try {
          const originResponse = await sendToTab<string>('getOktaOrigin');
          if (originResponse.success && originResponse.data) {
            setOktaOrigin(originResponse.data);
          }

          if (isStale()) return;

          const entity = await loadEntity({ tabId: tab.id!, sendToTab, isStale, log });

          if (isStale()) return;

          setConnectionStatus('connected');
          setError(null);
          setData(entity);
        } catch (messageErr) {
          log.warn('Content script communication error', messageErr);

          if (retryCount < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
            log.debug('Retrying content script', { delayMs: delay });
            setTimeout(() => fetchContext(retryCount + 1), delay);
            return; // Leave loading state until the retry settles.
          }

          log.warn('Max retries reached; showing as connected');
          setConnectionStatus('connected');
          setData(commsFailedData);
          setError('Connected to Okta, but extension communication delayed');
        }
      } catch (err) {
        log.error('Context fetch failed', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('error');
        setData(initialData);
        setOktaOrigin(null);
      } finally {
        if (!isStale()) {
          setIsLoading(false);
        }
      }
    },
    [scope, initialData, commsFailedData, loadEntity, log],
  );

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const fetchContextRef = useRef(fetchContext);
  fetchContextRef.current = fetchContext;

  useEffect(() => {
    if (enabledRef.current && !document.hidden) {
      fetchContextRef.current();
    } else {
      pendingResyncRef.current = true;
    }

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchContextRef.current(), DEBOUNCE_MS);
    };

    const requestFetch = (nextUrl?: string) => {
      if (nextUrl && normalizeEntityUrl(nextUrl) === lastEntityUrlRef.current) {
        return; // hash-only / same-page navigation — nothing to refetch
      }
      if (!enabledRef.current || document.hidden) {
        pendingResyncRef.current = true;
        setResyncPending(true);
        return;
      }
      debouncedFetch();
    };

    const handleTabUpdate = (
      _tabId: number,
      changeInfo: { url?: string; status?: string },
      tab: chrome.tabs.Tab,
    ) => {
      if ((changeInfo.url || changeInfo.status === 'complete') && isOktaUrl(tab.url)) {
        requestFetch(changeInfo.url ?? tab.url);
      }
    };

    const handleTabActivated = (activeInfo: { tabId: number; windowId: number }) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (isOktaUrl(tab.url)) requestFetch(tab.url);
      });
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        enabledRef.current &&
        pendingResyncRef.current
      ) {
        pendingResyncRef.current = false;
        fetchContextRef.current();
      }
    };

    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    chrome.tabs.onActivated.addListener(handleTabActivated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (enabled && !document.hidden && pendingResyncRef.current) {
      pendingResyncRef.current = false;
      fetchContext();
    }
  }, [enabled, fetchContext]);

  return {
    data,
    connectionStatus,
    targetTabId,
    error,
    isLoading,
    refetch: fetchContext,
    oktaOrigin,
    resyncPending,
  };
}
