/* eslint-disable @typescript-eslint/no-explicit-any */

const noop = () => {};

const storageBacking = new Map<string, unknown>();

export function setStorageSeed(items: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(items)) storageBacking.set(key, value);
}

export function resetStorageSeed(): void {
  storageBacking.clear();
}

const readKeys = (keys?: any): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (keys == null) {
    for (const [k, v] of storageBacking) out[k] = v;
    return out;
  }
  const wanted = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys);
  for (const key of wanted) {
    if (storageBacking.has(key)) out[key] = storageBacking.get(key);
  }
  return out;
};

const storageGet = (keys?: any, cb?: (items: Record<string, unknown>) => void) => {
  if (typeof cb === 'function') {
    cb(readKeys(keys));
    return undefined as any;
  }
  if (typeof keys === 'function') {
    (keys as (items: Record<string, unknown>) => void)(readKeys());
    return undefined as any;
  }
  return Promise.resolve(readKeys(keys));
};

const storageArea = {
  get: storageGet,
  set: (items?: any, cb?: () => void) => {
    if (items && typeof items === 'object') {
      for (const [k, v] of Object.entries(items)) storageBacking.set(k, v);
    }
    return cb ? (cb(), undefined) : Promise.resolve();
  },
  remove: (keys?: any, cb?: () => void) => {
    for (const key of Array.isArray(keys) ? keys : [keys]) storageBacking.delete(key);
    return cb ? (cb(), undefined) : Promise.resolve();
  },
};

const listenerSlot = { addListener: noop, removeListener: noop, hasListener: () => false };

type RuntimeListener = (message: unknown, sender: unknown, sendResponse: () => void) => void;
const runtimeListeners = new Set<RuntimeListener>();

const runtimeOnMessage = {
  addListener: (fn: RuntimeListener) => runtimeListeners.add(fn),
  removeListener: (fn: RuntimeListener) => runtimeListeners.delete(fn),
  hasListener: (fn: RuntimeListener) => runtimeListeners.has(fn),
};

export function emitRuntimeMessage(message: unknown): void {
  for (const listener of [...runtimeListeners]) listener(message, {}, noop);
}

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

const pageContext: Record<string, unknown> = {};

export function setPageContext(context: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(context)) pageContext[key] = value;
}

export function resetPageContext(): void {
  for (const key of Object.keys(pageContext)) delete pageContext[key];
}

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
    case 'getPolicyInfo':
      return { success: true, data: pageContext[message.action] ?? null };

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

let schedulerState: unknown = null;

export function setSchedulerState(state: unknown): void {
  schedulerState = state;
}

export function resetSchedulerState(): void {
  schedulerState = null;
}

const chromeFake = {
  runtime: {
    sendMessage: (message?: any) => {
      if (message?.action === 'syncSnapshot') return syncSnapshotResponder();
      if (
        schedulerState &&
        (message?.action === 'getSchedulerState' || message?.action === 'getSchedulerMetrics')
      ) {
        return Promise.resolve({ success: true, data: schedulerState });
      }
      return Promise.resolve({ ok: true });
    },
    onMessage: runtimeOnMessage,
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
    reload: (_tabId?: number, _opts?: any, cb?: () => void) => (cb ? cb() : undefined),
    get: (_tabId?: number, cb?: (tab: unknown) => void) => {
      const tab = {
        id: 1,
        active: true,
        windowId: 1,
        url: 'https://example.okta.com/admin/getting-started',
      };
      if (typeof cb === 'function') {
        cb(tab);
        return undefined as any;
      }
      return Promise.resolve(tab);
    },
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
