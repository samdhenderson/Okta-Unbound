import { auditStore } from '../shared/storage/auditStore';
import { ApiScheduler } from '../shared/scheduler/apiScheduler';
import { TabStateManager } from '../shared/tabState/tabStateManager';
import type { SchedulerState } from '../shared/scheduler/types';
import type { SchedulerStateChangedMessage, UpdateOperationPlanMessage } from '../shared/types';
import { createLogger } from '../shared/utils/logger';
import { isOktaUrl } from '../shared/utils/oktaUrl';
import { createThrottledRelay } from './throttledRelay';
import { reinjectContentScripts } from './reinjectContentScripts';
import { syncSnapshot } from './snapshotBridge';
import { ensureRateLimitThreshold } from './rateLimitThreshold';
import { startSnapshotScheduler } from './snapshotScheduler';

const log = createLogger('Background');

log.info('Service worker started');

const globalScheduler = new ApiScheduler({
  maxConcurrent: 10,
  maxConcurrentPerBucket: 4,
  minRemainingThreshold: 10, // Cooldown at 10% remaining
  cooldownDuration: 30000, // 30 seconds fallback
  retryDelay: 2000,
  maxRetries: 3,
  requestTimeout: 30000,
});

log.info('Global API scheduler initialized');

const relaySchedulerState = createThrottledRelay<SchedulerStateChangedMessage>(
  (message) => {
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors if no listeners (sidepanel not open)
    });
  },
  { isUrgent: (previous, next) => previous.state.status !== next.state.status },
);

globalScheduler.onStateChange((state: SchedulerState) => {
  relaySchedulerState({
    action: 'schedulerStateChanged',
    state,
    metrics: globalScheduler.getMetrics(),
  });
});

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const ALLOWED_PRIORITIES = new Set(['interactive', 'high', 'normal', 'low']);
const MAX_REASON_LENGTH = 80;

function isValidScheduleRequest(request: {
  endpoint?: unknown;
  tabId?: unknown;
  method?: unknown;
  priority?: unknown;
  reason?: unknown;
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
  if (
    request.reason !== undefined &&
    (typeof request.reason !== 'string' || request.reason.length > MAX_REASON_LENGTH)
  ) {
    return false;
  }
  return true;
}

const MAX_PLAN_NAME_LENGTH = 80;
const MAX_PLAN_ID_LENGTH = 64;
const MAX_PLAN_LEGS = 16;
const PLAN_OPS = new Set(['declare', 'refine', 'complete', 'cancel']);
const ESTIMATE_KINDS = new Set(['exact', 'atLeast', 'unknown']);

function isValidPlanEstimate(estimate: unknown): boolean {
  if (typeof estimate !== 'object' || estimate === null) return false;
  const { kind, requests } = estimate as { kind?: unknown; requests?: unknown };
  if (typeof kind !== 'string' || !ESTIMATE_KINDS.has(kind)) return false;
  if (kind === 'unknown') return true;
  return typeof requests === 'number' && Number.isFinite(requests) && requests >= 0;
}

function isValidPlanUpdate(request: {
  op?: unknown;
  planId?: unknown;
  name?: unknown;
  tabId?: unknown;
  legs?: unknown;
  endpoint?: unknown;
  estimate?: unknown;
}): request is UpdateOperationPlanMessage {
  if (typeof request.op !== 'string' || !PLAN_OPS.has(request.op)) return false;
  if (
    typeof request.planId !== 'string' ||
    request.planId.length === 0 ||
    request.planId.length > MAX_PLAN_ID_LENGTH
  ) {
    return false;
  }

  const isPlainPath = (value: unknown): boolean =>
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');

  if (request.op === 'declare') {
    if (
      typeof request.name !== 'string' ||
      request.name.length === 0 ||
      request.name.length > MAX_PLAN_NAME_LENGTH
    ) {
      return false;
    }
    if (typeof request.tabId !== 'number' || !Number.isInteger(request.tabId)) return false;
    if (!Array.isArray(request.legs) || request.legs.length === 0) return false;
    if (request.legs.length > MAX_PLAN_LEGS) return false;

    return request.legs.every((leg: unknown) => {
      if (typeof leg !== 'object' || leg === null) return false;
      const { endpoint, method, estimate } = leg as {
        endpoint?: unknown;
        method?: unknown;
        estimate?: unknown;
      };
      if (!isPlainPath(endpoint)) return false;
      if (method !== undefined && !ALLOWED_METHODS.has(String(method).toUpperCase())) return false;
      return isValidPlanEstimate(estimate);
    });
  }

  if (request.op === 'refine') {
    return isPlainPath(request.endpoint) && isValidPlanEstimate(request.estimate);
  }

  return true;
}

function isValidSyncSnapshotRequest(request: {
  origin?: unknown;
  tabId?: unknown;
  force?: unknown;
}): boolean {
  if (typeof request.origin !== 'string' || !isOktaUrl(request.origin)) return false;
  if (request.force !== undefined && typeof request.force !== 'boolean') return false;
  return typeof request.tabId === 'number' && Number.isInteger(request.tabId);
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

      ensureRateLimitThreshold(globalScheduler, request.tabId);

      globalScheduler
        .scheduleRequest(
          request.endpoint,
          request.method || 'GET',
          request.body,
          request.tabId,
          request.priority || 'normal',
          request.reason,
          typeof request.planId === 'string' ? request.planId : undefined,
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

    case 'updateOperationPlan': {
      if (rejectIfFromTab(sender, 'updateOperationPlan', sendResponse)) {
        return true;
      }

      if (!isValidPlanUpdate(request)) {
        sendResponse({ success: false, error: 'Invalid updateOperationPlan message' });
        return true;
      }

      switch (request.op) {
        case 'declare':
          sendResponse({
            success: globalScheduler.declarePlan({
              id: request.planId,
              name: request.name,
              tabId: request.tabId,
              legs: request.legs,
            }),
          });
          break;
        case 'refine':
          globalScheduler.refinePlan(request.planId, request.endpoint, request.estimate);
          sendResponse({ success: true });
          break;
        case 'complete':
          globalScheduler.completePlan(request.planId);
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: true, dropped: globalScheduler.cancelPlan(request.planId) });
          break;
      }

      return true;
    }

    case 'syncSnapshot':
      if (rejectIfFromTab(sender, 'syncSnapshot', sendResponse)) {
        return true;
      }

      if (!isValidSyncSnapshotRequest(request)) {
        sendResponse({ success: false, error: 'Invalid syncSnapshot message' });
        return true;
      }

      syncSnapshot(
        globalScheduler,
        request.origin,
        request.tabId,
        Date.now(),
        request.force === true,
      )
        .then((outcomes) => {
          const failed = outcomes.find((outcome) => !outcome.complete);
          sendResponse({
            success: !failed,
            error: failed?.error,
            outcomes: outcomes.map((outcome) => ({
              collection: outcome.collection,
              mode: outcome.mode,
              complete: outcome.complete,
              written: outcome.written,
              status: outcome.status ?? null,
            })),
          });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error?.message || 'Snapshot sync failed' });
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
      defaultView: 'home',
    });

    setupAuditRetentionAlarm();
  }

  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    log.info(`Extension updated from ${previousVersion} to ${version}`);

    setupAuditRetentionAlarm();
  }

  if (details.reason === 'install' || details.reason === 'update') {
    reinjectContentScripts().catch((error) => {
      log.error('Content script re-injection failed', error);
    });
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

function setupTabStateCleanupAlarm(): void {
  chrome.alarms.create('tabStateCleanup', { periodInMinutes: 60 });
  log.debug('Tab state cleanup alarm created');
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

  if (alarm.name === 'tabStateCleanup') {
    log.debug('Running tab state cleanup');

    try {
      await TabStateManager.cleanupExpiredStates();
      log.debug('Tab state cleanup completed');
    } catch (error) {
      log.error('Failed to cleanup expired tab states', error);
    }
  }
});

setupAuditRetentionAlarm();
setupTabStateCleanupAlarm();

startSnapshotScheduler(globalScheduler);
