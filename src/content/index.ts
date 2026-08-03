import type { MessageRequest, MessageResponse, PolicyInfo } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import { oktaPolicyListItemSchema, parseOkta } from '../shared/schemas/okta';
import {
  extractAppIdFromUrl,
  extractAppNameFromPage,
  extractPolicyIdFromUrl,
  extractPolicyNameFromPage,
} from './pageContext';
import { handleMakeApiRequest } from './apiRequest';
import { injectIndicator } from './indicator';
import { handleGetGroupInfo } from './groupHandlers';
import { handleGetUserInfo } from './userHandlers';

declare global {
  interface Window {
    __oktaUnboundClaim?: () => string | undefined;
  }
}

const log = createLogger('Content');

log.debug('Content script loaded', {
  readyState: document.readyState,
});

const isDuplicateInjection = (() => {
  try {
    return window.__oktaUnboundClaim?.() === chrome.runtime.id;
  } catch {
    return false;
  }
})();

if (isDuplicateInjection) {
  log.debug('Content script already active on this page; skipping initialization');
} else {
  window.__oktaUnboundClaim = () => chrome.runtime.id;
}

function handleMessage(
  request: MessageRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void,
): boolean {
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

    case 'getPolicyInfo':
      handleGetPolicyInfo().then(sendResponse);
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
}

if (!isDuplicateInjection) {
  chrome.runtime.onMessage.addListener(handleMessage);
}

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

async function handleGetPolicyInfo(): Promise<MessageResponse<PolicyInfo>> {
  log.debug('Processing getPolicyInfo request');

  try {
    const url = window.location.href;
    log.debug('Current page location', { path: window.location.pathname });

    const policyId = extractPolicyIdFromUrl(url);
    log.debug('Extracted policyId', { policyId });

    if (!policyId) {
      return {
        success: false,
        error: 'Not on an authentication policy page. Please navigate to a specific policy page.',
      };
    }

    let policyName = extractPolicyNameFromPage();
    let policyStatus: string | undefined;
    log.debug('Extracted policyName from page', { found: Boolean(policyName) });

    log.debug('Fetching policy details from API');
    try {
      const response = await handleMakeApiRequest(`/api/v1/policies/${policyId}`, 'GET');
      if (response.success && response.data) {
        const policy = parseOkta(
          oktaPolicyListItemSchema,
          response.data,
          'GET /api/v1/policies/{id}',
        );
        policyName = policyName || policy.name || null;
        policyStatus = policy.status;
        log.debug('Fetched policy details from API', {
          hasName: Boolean(policyName),
          hasStatus: Boolean(policyStatus),
        });
      }
    } catch (e) {
      log.warn('Failed to fetch policy details from API', e);
    }

    const result: PolicyInfo = { policyId, policyName, policyStatus };

    log.debug('getPolicyInfo result', {
      policyId: result.policyId,
      hasName: Boolean(result.policyName),
      hasStatus: Boolean(result.policyStatus),
    });
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('getPolicyInfo error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

if (!isDuplicateInjection) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      log.debug('DOMContentLoaded fired');
      injectIndicator();
    });
  } else {
    log.debug('DOM already loaded, injecting indicator');
    injectIndicator();
  }
}
