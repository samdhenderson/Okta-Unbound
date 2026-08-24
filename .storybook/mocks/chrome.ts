/* eslint-disable @typescript-eslint/no-explicit-any */

const noop = () => {};

const storageGet = (keys?: any, cb?: (items: Record<string, unknown>) => void) => {
  if (typeof cb === 'function') {
    cb({});
    return undefined as any;
  }
  if (typeof keys === 'function') {
    (keys as (items: Record<string, unknown>) => void)({});
    return undefined as any;
  }
  return Promise.resolve({});
};

const storageArea = {
  get: storageGet,
  set: (_items?: any, cb?: () => void) => (cb ? (cb(), undefined) : Promise.resolve()),
  remove: (_keys?: any, cb?: () => void) => (cb ? (cb(), undefined) : Promise.resolve()),
};

const listenerSlot = { addListener: noop, removeListener: noop, hasListener: () => false };

const sampleUser = {
  id: 'user1',
  status: 'ACTIVE',
  profile: {
    login: 'ada.lovelace@example.com',
    email: 'ada.lovelace@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Principal Engineer',
  },
};
const sampleGroups = [
  {
    id: 'g-eng',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering', description: 'All engineers' },
  },
  {
    id: 'g-admins',
    type: 'APP_GROUP',
    profile: { name: 'Okta Admins', description: 'Admin console' },
  },
];

function respondToTabAction(message?: { action?: string }): unknown {
  switch (message?.action) {
    case 'getOktaOrigin':
      return { success: true, data: 'https://example.okta.com' };

    case 'getUserDetails':
      return { success: true, data: sampleUser };
    case 'getUserGroups':
      return {
        success: true,
        data: sampleGroups.map((group) => ({
          group,
          membershipType: 'DIRECT',
          addedDate: '2024-01-01',
        })),
      };
    case 'fetchGroupRules':
      return { success: true, data: [], conflicts: [] };

    case 'getUserInfo':
    case 'getUserContext':
    case 'getGroupInfo':
    case 'getAppInfo':
      return { success: true, data: null };

    default:
      return { ok: true };
  }
}

let syncSnapshotResponder: () => Promise<unknown> = async () => ({ success: true });

export function setSyncSnapshotResponder(responder: () => Promise<unknown>): void {
  syncSnapshotResponder = responder;
}

export function resetSyncSnapshotResponder(): void {
  syncSnapshotResponder = async () => ({ success: true });
}

const chromeFake = {
  runtime: {
    sendMessage: (message?: any) =>
      message?.action === 'syncSnapshot' ? syncSnapshotResponder() : Promise.resolve({ ok: true }),
    onMessage: listenerSlot,
    getURL: (path: string) => `chrome-extension://storybook-mock/${path}`,
    lastError: undefined as unknown,
  },
  tabs: {
    query: (_q?: any) =>
      Promise.resolve([
        {
          id: 1,
          active: true,
          windowId: 1,
          url: 'https://example.okta.com/admin/getting-started',
        },
      ]),
    getCurrent: () => Promise.resolve({ id: 1 }),
    sendMessage: (_tabId?: number, message?: any) => Promise.resolve(respondToTabAction(message)),
    onActivated: listenerSlot,
    onUpdated: listenerSlot,
  },
  windows: {
    getCurrent: () => Promise.resolve({ id: 1, focused: true, tabs: [] }),
  },
  storage: {
    local: storageArea,
    sync: storageArea,
    onChanged: listenerSlot,
  },
};

export function installChromeFake(): void {
  (globalThis as any).chrome = chromeFake;
}
