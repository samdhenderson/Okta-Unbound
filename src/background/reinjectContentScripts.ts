import { createLogger } from '../shared/utils/logger';

const log = createLogger('Background');

export async function reinjectContentScripts(): Promise<void> {
  const entries = chrome.runtime.getManifest().content_scripts ?? [];

  if (entries.length === 0) {
    log.debug('No content scripts declared; nothing to re-inject');
    return;
  }

  for (const entry of entries) {
    const files = entry.js ?? [];
    const matches = entry.matches ?? [];

    if (files.length === 0 || matches.length === 0) {
      log.debug('Skipping content script entry with no files or matches');
      continue;
    }

    let tabs: chrome.tabs.Tab[];
    try {
      tabs = await chrome.tabs.query({ url: matches });
    } catch (error) {
      log.warn('Tab query for content script re-injection failed', error);
      continue;
    }

    for (const tab of tabs) {
      const tabId = tab.id;
      if (typeof tabId !== 'number') continue;

      try {
        await chrome.scripting.executeScript({ target: { tabId }, files });
        log.debug('Re-injected content script', { tabId });
      } catch {
        log.debug('Content script re-injection skipped for tab', { tabId });
      }
    }
  }
}
