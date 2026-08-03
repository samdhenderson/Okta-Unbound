import type { MessageRequest, MessageResponse } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import { extractAppIdFromUrl, extractAppNameFromPage } from './pageContext';
import { handleMakeApiRequest } from './apiRequest';
import { injectIndicator } from './indicator';
import { handleGetGroupInfo } from './groupHandlers';
import { handleGetUserInfo } from './userHandlers';

const log = createLogger('Content');

log.debug('Content script loaded', {
  readyState: document.readyState,
});

chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    if (sender.id !== chrome.runtime.id) {
      log.warn('Ignoring message from foreign sender');
      return false;
    }

    log.debug('Received message', {
      action: request.action,
      from: sender.id,
    });

    switch (request.action) {
      case 'getGroupInfo':
        handleGetGroupInfo().then(sendResponse);
        return true;

      case 'getUserInfo':
        handleGetUserInfo().then(sendResponse);
        return true;

      case 'getAppInfo':
        handleGetAppInfo().then(sendResponse);
        return true;

      case 'makeApiRequest':
        if (!request.endpoint) {
          sendResponse({ success: false, error: 'Missing endpoint' });
          return true;
        }
        handleMakeApiRequest(request.endpoint, request.method, request.body).then(sendResponse);
        return true;

      case 'getOktaOrigin':
        sendResponse({ success: true, data: window.location.origin });
        return true;

      default:
        log.warn('Unknown action', { action: request.action });
        sendResponse({ success: false, error: 'Unknown action' });
        return true;
    }
  },
);

async function handleGetAppInfo(): Promise<MessageResponse<import('../shared/types').AppInfo>> {
  log.debug('Processing getAppInfo request');

  try {
    const url = window.location.href;
    log.debug('Current page location', { path: window.location.pathname });

    const appId = extractAppIdFromUrl(url);
    log.debug('Extracted appId', { appId });

    if (!appId) {
      return {
        success: false,
        error: 'Not on an app page. Please navigate to a specific app page.',
      };
    }

    let appName = extractAppNameFromPage();
    let appLabel: string | undefined;
    log.debug('Extracted appName from page', { found: Boolean(appName) });

    log.debug('Fetching app details from API');
    try {
      const response = await handleMakeApiRequest(`/api/v1/apps/${appId}`, 'GET');
      if (response.success && response.data) {
        appName = appName || response.data.name || response.data.label || 'Unknown';
        appLabel = response.data.label;
        log.debug('Fetched app details from API', {
          hasName: Boolean(appName),
          hasLabel: Boolean(appLabel),
        });
      }
    } catch (e) {
      log.warn('Failed to fetch app details from API', e);
    }

    const result = {
      appId,
      appName: appName || 'Unknown',
      appLabel,
    };

    log.debug('getAppInfo result', {
      appId: result.appId,
      hasName: result.appName !== 'Unknown',
      hasLabel: Boolean(result.appLabel),
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('getAppInfo error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    log.debug('DOMContentLoaded fired');
    injectIndicator();
  });
} else {
  log.debug('DOM already loaded, injecting indicator');
  injectIndicator();
}
