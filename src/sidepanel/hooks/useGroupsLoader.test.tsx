import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupsLoader } from './useGroupsLoader';

const { fakeDB, idbTables, gate } = vi.hoisted(() => {
  const idbTables = new Map<string, Map<string, any>>();
  const gate = { origin: null as string | null, waited: Promise.resolve(), release: () => {} };
  const keyOf = (key: unknown) => (Array.isArray(key) ? key.join('::') : String(key));
  const table = (name: string) => {
    if (!idbTables.has(name)) idbTables.set(name, new Map());
    return idbTables.get(name)!;
  };
  const fakeDB = {
    get: async (name: string, key: unknown) => table(name).get(keyOf(key)),
    put: async () => {},
    delete: async () => {},
    getAllFromIndex: async (name: string, _i: string, origin: string) => {
      if (name === 'groups' && origin === gate.origin) await gate.waited;
      return [...table(name).values()].filter((v) => v.origin === origin);
    },
    getAllKeysFromIndex: async () => [],
    transaction: () => ({
      store: { put: async () => {}, delete: async () => {} },
      done: Promise.resolve(),
    }),
  };
  return { fakeDB, idbTables, gate };
});

vi.mock('idb', () => ({ openDB: vi.fn(async () => fakeDB) }));

const runtimeSendMessage = vi.fn();
const listeners = new Set<(msg: any) => void>();

globalThis.chrome = {
  runtime: {
    sendMessage: runtimeSendMessage,
    getURL: (p: string) => p,
    onMessage: {
      addListener: (fn: any) => listeners.add(fn),
      removeListener: (fn: any) => listeners.delete(fn),
    },
  },
} as any;

const ORIGIN = 'https://x.okta.com';
const OTHER_ORIGIN = 'https://y.okta.com';

function broadcastPage(origin = ORIGIN, collection = 'groups') {
  for (const listener of [...listeners]) {
    listener({ action: 'snapshotUpdated', origin, collection, loaded: 1, complete: false });
  }
}

function rawGroup(over: Record<string, any> = {}) {
  return {
    id: 'g1',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering' },
    _embedded: { stats: { usersCount: 4 } },
    ...over,
  };
}

function seed(collection: string, rows: Record<string, any>[], origin = ORIGIN, complete = true) {
  const table = idbTables.get(collection) ?? new Map();
  for (const entity of rows) {
    table.set(`${origin}::${entity.id}`, { origin, id: entity.id, entity, syncedAt: 1 });
  }
  idbTables.set(collection, table);
  const meta = idbTables.get('syncMeta') ?? new Map();
  meta.set(`${origin}::${collection}`, {
    origin,
    collection,
    complete,
    lastFullWalkAt: complete ? 1 : null,
    lastDeltaAt: null,
    watermark: null,
    itemCount: rows.length,
    cursor: null,
    walkStartedAt: null,
    deltaSupported: null,
  });
  idbTables.set('syncMeta', meta);
}

function harness(over: Record<string, any> = {}) {
  const options = {
    targetTabId: 1 as number | null,
    oktaOrigin: ORIGIN as string | null,
    setError: vi.fn(),
    setSearchMode: vi.fn(),
    onLoaded: vi.fn(),
    ...over,
  };
  return { options };
}

function seedAssignments(
  entries: Array<{ appId: string; groupId: string; name?: string }>,
  origin = ORIGIN,
) {
  const table = idbTables.get('appGroups') ?? new Map();
  for (const { appId, groupId, name } of entries) {
    const id = `${appId}::${groupId}`;
    table.set(`${origin}::${id}`, {
      origin,
      id,
      entity: {
        id: groupId,
        priority: 0,
        profile: { name: name ?? 'Pushed Group' },
        _links: { group: { href: `${origin}/api/v1/groups/${groupId}` } },
      },
      syncedAt: 1,
    });
  }
  idbTables.set('appGroups', table);
}

beforeEach(() => {
  vi.clearAllMocks();
  idbTables.clear();
  listeners.clear();
  gate.origin = null;
  gate.waited = Promise.resolve();
  runtimeSendMessage.mockResolvedValue({ success: true });
});

describe('useGroupsLoader', () => {
  it('paints a seeded org without issuing a request', async () => {
    seed('groups', [rawGroup()]);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));

    await waitFor(() => expect(result.current.groups.map((g) => g.name)).toEqual(['Engineering']));
    expect(runtimeSendMessage).not.toHaveBeenCalled();
    expect(result.current.complete).toBe(true);
    expect(options.setSearchMode).toHaveBeenCalledWith('cached');
  });

  it('repaints per page as the background broadcasts progress', async () => {
    seed('groups', [rawGroup()], ORIGIN, false);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));
    await waitFor(() => expect(result.current.groups).toHaveLength(1));
    expect(result.current.complete).toBe(false);

    seed(
      'groups',
      [rawGroup(), rawGroup({ id: 'g2', profile: { name: 'Design' } })],
      ORIGIN,
      false,
    );
    await act(async () => broadcastPage());

    await waitFor(() => expect(result.current.groups).toHaveLength(2));
  });

  it('ignores a broadcast for another org or another collection', async () => {
    seed('groups', [rawGroup()]);
    const { options } = harness();
    const { result } = renderHook(() => useGroupsLoader(options as any));
    await waitFor(() => expect(result.current.groups).toHaveLength(1));

    seed('groups', [rawGroup({ id: 'g2', profile: { name: 'Design' } })]);
    await act(async () => broadcastPage(OTHER_ORIGIN));
    await act(async () => broadcastPage(ORIGIN, 'apps'));

    expect(result.current.groups).toHaveLength(1);
  });

  it('attributes rules from the snapshot rules collection', async () => {
    seed('groups', [rawGroup()]);
    seed('rules', [
      {
        id: '0prFAKE',
        name: 'Engineers',
        status: 'ACTIVE',
        type: 'group_rule',
        created: '2024-01-01T00:00:00.000Z',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        conditions: {
          expression: { value: 'user.department=="Eng"', type: 'urn:okta:expression:1.0' },
        },
        actions: { assignUserToGroups: { groupIds: ['g1'] } },
      },
    ]);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));

    await waitFor(() => expect(result.current.groups[0]?.ruleCount).toBe(1));
    expect(result.current.groups[0]?.hasRules).toBe(true);
  });

  it('shows push mappings from the snapshot without asking Okta for anything', async () => {
    seed('groups', [rawGroup({ id: 'g1', type: 'APP_GROUP', source: { id: 'app1' } })]);
    seed('apps', [{ id: 'app1', label: 'Slack' }]);
    seedAssignments([{ appId: 'app1', groupId: 'g1' }]);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));

    await waitFor(() => expect(result.current.groups).toHaveLength(1));
    await waitFor(() =>
      expect(result.current.groups[0]?.pushMappings).toEqual([
        expect.objectContaining({ appId: 'app1', appName: 'Slack', sourceUserGroupId: 'g1' }),
      ]),
    );
    expect(runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('names a source app from the inventory when the group walk did not embed one', async () => {
    seed('groups', [rawGroup({ id: 'g1', type: 'APP_GROUP', source: { id: 'app1' } })]);
    seed('apps', [{ id: 'app1', label: 'Slack' }]);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));

    await waitFor(() => expect(result.current.groups[0]?.sourceAppName).toBe('Slack'));
    expect(runtimeSendMessage).not.toHaveBeenCalled();
  });

  it("keeps one app's mappings when another app assigns the same group", async () => {
    seed('groups', [rawGroup({ id: 'g1', type: 'APP_GROUP', source: { id: 'app1' } })]);
    seed('apps', [
      { id: 'app1', label: 'Slack' },
      { id: 'app2', label: 'Zoom' },
    ]);
    seedAssignments([
      { appId: 'app1', groupId: 'g1' },
      { appId: 'app2', groupId: 'g1' },
    ]);
    const { options } = harness();

    const { result } = renderHook(() => useGroupsLoader(options as any));

    await waitFor(() => expect(result.current.groups[0]?.pushMappings).toHaveLength(2));
    expect(result.current.groups[0]?.pushMappings?.map((m) => m.appName).sort()).toEqual([
      'Slack',
      'Zoom',
    ]);
  });

  it('asks for the cheapest honest mode, and forces a full walk only on Refresh', async () => {
    const { options } = harness();
    const { result } = renderHook(() => useGroupsLoader(options as any));

    await act(async () => {
      await result.current.loadAllGroups();
    });
    await act(async () => {
      await result.current.loadAllGroups(true);
    });

    const forces = runtimeSendMessage.mock.calls
      .map((call) => call[0])
      .filter((msg) => msg?.action === 'syncSnapshot')
      .map((msg) => msg.force);
    expect(forces).toEqual([false, true]);
  });

  it('does not sync while the tab is hidden', async () => {
    seed('groups', []);
    const { options } = harness({ enabled: false });
    const { result } = renderHook(() => useGroupsLoader(options as any));

    await act(async () => {
      await result.current.loadAllGroups();
    });

    expect(runtimeSendMessage).not.toHaveBeenCalled();
  });

  it('banners the failure message when a walk does not complete', async () => {
    runtimeSendMessage.mockResolvedValue({ success: false, error: 'Failed to fetch groups' });
    const { options } = harness();
    const { result } = renderHook(() => useGroupsLoader(options as any));

    await act(async () => {
      await result.current.loadAllGroups();
    });

    expect(options.setError).toHaveBeenCalledWith('Failed to fetch groups');
    expect(options.setSearchMode).not.toHaveBeenCalledWith('cached');
    expect(options.onLoaded).not.toHaveBeenCalled();
  });

  it('drops a read that resolves for an org the panel has already left', async () => {
    seed('groups', [rawGroup({ id: 'gA', profile: { name: 'OrgA Group' } })], ORIGIN);
    seed('groups', [rawGroup({ id: 'gB', profile: { name: 'OrgB Group' } })], OTHER_ORIGIN);

    gate.origin = ORIGIN;
    gate.waited = new Promise<void>((resolve) => {
      gate.release = resolve;
    });

    const { options } = harness();
    const { result, rerender } = renderHook((props: any) => useGroupsLoader(props), {
      initialProps: options,
    });
    expect(result.current.groups).toEqual([]);

    rerender({ ...options, oktaOrigin: OTHER_ORIGIN });
    await waitFor(() => expect(result.current.groups.map((g) => g.name)).toEqual(['OrgB Group']));

    await act(async () => {
      gate.release();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.groups.map((g) => g.name)).toEqual(['OrgB Group']);
  });
});
