import { createLogger } from '../utils/logger';

const log = createLogger('WelcomeStore');

export const WELCOME_SEEN_STORAGE_KEY = 'okta_unbound_welcome_seen';

export async function readWelcomeSeen(): Promise<boolean> {
  try {
    const stored = await chrome.storage.local.get(WELCOME_SEEN_STORAGE_KEY);
    return stored[WELCOME_SEEN_STORAGE_KEY] === true;
  } catch (error) {
    log.error('Failed to read welcome flag', error);
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    await chrome.storage.local.set({ [WELCOME_SEEN_STORAGE_KEY]: true });
  } catch (error) {
    log.error('Failed to write welcome flag', error);
  }
}

export async function resetWelcomeSeen(): Promise<void> {
  try {
    await chrome.storage.local.remove(WELCOME_SEEN_STORAGE_KEY);
  } catch (error) {
    log.error('Failed to clear welcome flag', error);
  }
}
