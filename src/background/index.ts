import { auditStore } from '../shared/storage/auditStore';
import { ApiScheduler } from '../shared/scheduler/apiScheduler';
import { TabStateManager } from '../shared/tabState/tabStateManager';
import type { SchedulerState } from '../shared/scheduler/types';
import { createLogger } from '../shared/utils/logger';
import { isOktaUrl as isOktaUrlShared } from '../shared/utils/oktaUrl';

const log = createLogger('Background');

log.info('Service worker started');

const globalScheduler = new ApiScheduler({
  maxConcurrent: 5,
  minRemainingThreshold: 10, // Cooldown at 10% remaining
  cooldownDuration: 30000, // 30 seconds fallback
  retryDelay: 2000,
  maxRetries: 3,
  requestTimeout: 30000,
});

log.info('Global API scheduler initialized');

globalScheduler.onStateChange((state: SchedulerState) => {
  chrome.runtime
    .sendMessage({
      action: 'schedulerStateChanged',
      state,
    })
    .catch(() => {
      // Ignore errors if no listeners (sidepanel not open)
    });
});

setInterval(
  () => {
    TabStateManager.cleanupExpiredStates().catch((err) => {
      log.error('Failed to cleanup expired tab states', err);
    });
  },
  60 * 60 * 1000,
);

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const ALLOWED_PRIORITIES = new Set(['interactive', 'high', 'normal', 'low']);

function isValidScheduleRequest(request: {
  endpoint?: unknown;
  tabId?: unknown;
  method?: unknown;
  priority?: unknown;
}): boolean {
  if (
    typeof request.endpoint !== 'string' ||
    !request.endpoint.startsWith('/') ||
    request.endpoint.startsWith('//')
  ) {
    return false;
  }
  if (typeof request.tabId !== 'number' || !Number.isInteger(request.tabId)) {
    return false;
  }
  if (request.method !== undefined && !ALLOWED_METHODS.has(String(request.method).toUpperCase())) {
    return false;
  }
  if (request.priority !== undefined && !ALLOWED_PRIORITIES.has(String(request.priority))) {
    return false;
  }
  return true;
}

function rejectIfFromTab(
  sender: chrome.runtime.MessageSender,
  action: string,
  sendResponse: (response: { success: false; error: string }) => void,
): boolean {
  if (sender.tab) {
    sendResponse({ success: false, error: `${action} not allowed from tabs` });
    return true;
  }
  return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    log.warn('Ignoring message from foreign sender');
    return false;
  }

  log.debug('Received message', { action: request.action });

  switch (request.action) {
    case 'scheduleApiRequest':
      if (rejectIfFromTab(sender, 'scheduleApiRequest', sendResponse)) {
        return true;
      }

      if (!request.endpoint || !request.tabId) {
        sendResponse({ success: false, error: 'Missing endpoint or tabId' });
        return true;
      }

      if (!isValidScheduleRequest(request)) {
        sendResponse({ success: false, error: 'Invalid scheduleApiRequest message' });
        return true;
      }

      globalScheduler
        .scheduleRequest(
          request.endpoint,
          request.method || 'GET',
          request.body,
          request.tabId,
          request.priority || 'normal',
        )
        .then((result) => {
          sendResponse(result);
        })
        .catch((error) => {
          sendResponse({
            success: false,
            error: error.message || 'Request failed',
          });
        });

      return true; // Keep message channel open for async response

    case 'getSchedulerState':
      sendResponse({ success: true, state: globalScheduler.getState() });
      return true;

    case 'getSchedulerMetrics':
      sendResponse({ success: true, metrics: globalScheduler.getMetrics() });
      return true;

    case 'pauseScheduler':
      if (rejectIfFromTab(sender, 'pauseScheduler', sendResponse)) {
        return true;
      }
      globalScheduler.pause();
      sendResponse({ success: true });
      return true;

    case 'resumeScheduler':
      if (rejectIfFromTab(sender, 'resumeScheduler', sendResponse)) {
        return true;
      }
      globalScheduler.resume();
      sendResponse({ success: true });
      return true;

    case 'clearSchedulerQueue':
      if (rejectIfFromTab(sender, 'clearSchedulerQueue', sendResponse)) {
        return true;
      }
      globalScheduler.clearQueue();
      sendResponse({ success: true });
      return true;

    case 'saveTabState':
      if (rejectIfFromTab(sender, 'saveTabState', sendResponse)) {
        return true;
      }
      if (!request.tabName || !request.state) {
        sendResponse({ success: false, error: 'Missing tabName or state' });
        return true;
      }

      TabStateManager.saveTabState(request.tabName, request.state, request.options)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });

      return true;

    case 'loadTabState':
      if (rejectIfFromTab(sender, 'loadTabState', sendResponse)) {
        return true;
      }
      if (!request.tabName) {
        sendResponse({ success: false, error: 'Missing tabName' });
        return true;
      }

      TabStateManager.loadTabState(request.tabName)
        .then((state) => {
          sendResponse({ success: true, state });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });

      return true;

    case 'clearTabState':
      if (rejectIfFromTab(sender, 'clearTabState', sendResponse)) {
        return true;
      }
      if (!request.tabName) {
        sendResponse({ success: false, error: 'Missing tabName' });
        return true;
      }

      TabStateManager.clearTabState(request.tabName)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });

      return true;

    default:
      return false;
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  const version = chrome.runtime.getManifest().version;

  if (details.reason === 'install') {
    log.info('Extension installed successfully');

    chrome.storage.sync.set({
      version,
      operationDelay: 100,
      defaultView: 'overview',
    });

    setupAuditRetentionAlarm();
  }

  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    log.info(`Extension updated from ${previousVersion} to ${version}`);

    setupAuditRetentionAlarm();
  }

  chrome.contextMenus.create({
    id: 'openSidebar',
    title: 'Open Okta Unbound',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://*.okta.com/*',
      'https://*.oktapreview.com/*',
      'https://*.okta-emea.com/*',
    ],
  });
});

chrome.action.onClicked.addListener((tab) => {
  log.debug('Extension icon clicked', { tabId: tab.id });

  if (tab.url && isOktaUrl(tab.url)) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    log.debug('Side panel opened');
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/assets/icons/icon128.png',
      title: 'Okta Unbound',
      message: 'Please navigate to an Okta page to use this extension.',
    });
    log.debug('Notification shown - not on Okta page');
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidebar' && tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    log.debug('Side panel opened from context menu');
  }
});

function setupAuditRetentionAlarm(): void {
  chrome.alarms.create('auditRetentionCleanup', {
    periodInMinutes: 24 * 60, // Every 24 hours
    when: getNextMidnight(),
  });
  log.debug('Audit retention alarm created');
}

function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auditRetentionCleanup') {
    log.debug('Running audit retention cleanup');

    try {
      const settings = await auditStore.getSettings();
      const retentionDays = settings.retentionDays || 90;

      await auditStore.clearOldLogs(retentionDays);

      log.debug('Audit retention cleanup completed', { retentionDays });
    } catch (error) {
      log.error('Audit retention cleanup failed', error);
    }
  }
});

function isOktaUrl(url: string): boolean {
  return isOktaUrlShared(url);
}

setupAuditRetentionAlarm();
