import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WELCOME_SEEN_STORAGE_KEY,
  markWelcomeSeen,
  readWelcomeSeen,
  resetWelcomeSeen,
} from './welcomeStore';

const storageGet = () => chrome.storage.local.get as ReturnType<typeof vi.fn>;
const storageSet = () => chrome.storage.local.set as ReturnType<typeof vi.fn>;
const storageRemove = () => chrome.storage.local.remove as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('readWelcomeSeen', () => {
  it('reports seen when the flag is stored as true', async () => {
    storageGet().mockResolvedValue({ [WELCOME_SEEN_STORAGE_KEY]: true });

    await expect(readWelcomeSeen()).resolves.toBe(true);
    expect(storageGet()).toHaveBeenCalledWith(WELCOME_SEEN_STORAGE_KEY);
  });

  it('reports not seen when the key is absent', async () => {
    storageGet().mockResolvedValue({});

    await expect(readWelcomeSeen()).resolves.toBe(false);
  });

  it('reports not seen for any stored value other than true', async () => {
    storageGet().mockResolvedValue({ [WELCOME_SEEN_STORAGE_KEY]: 'true' });

    await expect(readWelcomeSeen()).resolves.toBe(false);
  });

  it('counts a failed read as not seen', async () => {
    storageGet().mockRejectedValue(new Error('storage unavailable'));

    await expect(readWelcomeSeen()).resolves.toBe(false);
  });
});

describe('markWelcomeSeen', () => {
  it('writes the flag as true under its one key', async () => {
    storageSet().mockResolvedValue(undefined);

    await markWelcomeSeen();

    expect(storageSet()).toHaveBeenCalledTimes(1);
    expect(storageSet()).toHaveBeenCalledWith({ [WELCOME_SEEN_STORAGE_KEY]: true });
  });

  it('swallows a failed write', async () => {
    storageSet().mockRejectedValue(new Error('storage unavailable'));

    await expect(markWelcomeSeen()).resolves.toBeUndefined();
  });
});

describe('resetWelcomeSeen', () => {
  it('removes the key rather than writing false', async () => {
    storageRemove().mockResolvedValue(undefined);

    await resetWelcomeSeen();

    expect(storageRemove()).toHaveBeenCalledWith(WELCOME_SEEN_STORAGE_KEY);
    expect(storageSet()).not.toHaveBeenCalled();
  });

  it('swallows a failed remove', async () => {
    storageRemove().mockRejectedValue(new Error('storage unavailable'));

    await expect(resetWelcomeSeen()).resolves.toBeUndefined();
  });
});
