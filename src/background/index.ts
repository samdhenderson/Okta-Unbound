import { auditStore } from '../shared/storage/auditStore';
import { ApiScheduler } from '../shared/scheduler/apiScheduler';
import { TabStateManager } from '../shared/tabState/tabStateManager';
import type { SchedulerState } from '../shared/scheduler/types';

console.log('[Background] Service worker started');

const globalScheduler = new ApiScheduler({
  maxConcurrent: 3,
  minRemainingThreshold: 10, // Cooldown at 10% remaining
  cooldownDuration: 60000, // 60 seconds
  retryDelay: 2000,
  maxRetries: 3,
  requestTimeout: 30000,
});

console.log('[Background] Global API scheduler initialized');

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
      console.error('[Background] Failed to cleanup expired tab states:', err);
    });
  },
  60 * 60 * 1000,
);

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('[Background] Received message:', request.action);

  switch (request.action) {
    case 'scheduleApiRequest':
      if (!request.endpoint || !request.tabId) {
        sendResponse({ success: false, error: 'Missing endpoint or tabId' });
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
      globalScheduler.pause();
      sendResponse({ success: true });
      return true;

    case 'resumeScheduler':
      globalScheduler.resume();
      sendResponse({ success: true });
      return true;

    case 'clearSchedulerQueue':
      globalScheduler.clearQueue();
      sendResponse({ success: true });
      return true;

    case 'saveTabState':
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
  if (details.reason === 'install') {
    console.log('[Background] Extension installed successfully');

    chrome.storage.sync.set({
      version: '0.3.0',
      operationDelay: 100,
      defaultView: 'operations',
    });

    setupAuditRetentionAlarm();
  }

  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    console.log(`[Background] Extension updated from ${previousVersion} to 0.3.0`);

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
  console.log('[Background] Extension icon clicked for tab:', tab.id);

  if (tab.url && isOktaUrl(tab.url)) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    console.log('[Background] Side panel opened');
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/assets/icons/icon128.png',
      title: 'Okta Unbound',
      message: 'Please navigate to an Okta page to use this extension.',
    });
    console.log('[Background] Notification shown - not on Okta page');
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidebar' && tab?.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    console.log('[Background] Side panel opened from context menu');
  }
});

function setupAuditRetentionAlarm(): void {
  chrome.alarms.create('auditRetentionCleanup', {
    periodInMinutes: 24 * 60, // Every 24 hours
    when: getNextMidnight(),
  });
  console.log('[Background] Audit retention alarm created');
}

function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auditRetentionCleanup') {
    console.log('[Background] Running audit retention cleanup...');

    try {
      const settings = await auditStore.getSettings();
      const retentionDays = settings.retentionDays || 90;

      await auditStore.clearOldLogs(retentionDays);

      console.log(
        `[Background] Audit retention cleanup completed (${retentionDays} days retention)`,
      );
    } catch (error) {
      console.error('[Background] Audit retention cleanup failed:', error);
    }
  }
});

function isOktaUrl(url: string): boolean {
  return (
    url.includes('okta.com') || url.includes('oktapreview.com') || url.includes('okta-emea.com')
  );
}

setupAuditRetentionAlarm();
