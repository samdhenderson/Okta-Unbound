import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readAppGroupsFromSnapshot } from './appGroupSnapshot';
import { SHARD_KEY_SEPARATOR } from '../../shared/snapshot/types';

const getRecords = vi.fn();

vi.mock('../../shared/snapshot/orgSnapshotStore', () => ({
  orgSnapshotStore: { getRecords: (...args: unknown[]) => getRecords(...args) },
}));

const ORIGIN = 'https://example.okta.com';

function row(appId: string, groupId: string) {
  return {
    origin: ORIGIN,
    id: `${appId}${SHARD_KEY_SEPARATOR}${groupId}`,
    entity: { id: groupId },
    syncedAt: 0,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getRecords.mockResolvedValue([]);
});

describe('readAppGroupsFromSnapshot', () => {
  it('groups stored assignments by app id', async () => {
    getRecords.mockResolvedValue([
      row('0oaFAKE1', '00gFAKE1'),
      row('0oaFAKE1', '00gFAKE2'),
      row('0oaFAKE2', '00gFAKE3'),
    ]);

    const byApp = await readAppGroupsFromSnapshot(ORIGIN);

    expect(getRecords).toHaveBeenCalledWith('appGroups', ORIGIN);
    expect([...byApp.keys()].sort()).toEqual(['0oaFAKE1', '0oaFAKE2']);
    expect(byApp.get('0oaFAKE1')).toEqual(['00gFAKE1', '00gFAKE2']);
    expect(byApp.get('0oaFAKE2')).toEqual(['00gFAKE3']);
  });

  it('keeps two apps that assign the SAME group distinct', async () => {
    getRecords.mockResolvedValue([row('0oaFAKE1', '00gSHARED'), row('0oaFAKE2', '00gSHARED')]);

    const byApp = await readAppGroupsFromSnapshot(ORIGIN);

    expect(byApp.get('0oaFAKE1')).toEqual(['00gSHARED']);
    expect(byApp.get('0oaFAKE2')).toEqual(['00gSHARED']);
  });

  it('omits an app with no rows rather than reporting it as having no groups', async () => {
    getRecords.mockResolvedValue([row('0oaFAKE1', '00gFAKE1')]);

    const byApp = await readAppGroupsFromSnapshot(ORIGIN);

    expect(byApp.get('0oaNEVERWALKED')).toBeUndefined();
    expect(byApp.has('0oaNEVERWALKED')).toBe(false);
  });

  it('drops a row whose id does not split into an app and a group', async () => {
    getRecords.mockResolvedValue([
      { origin: ORIGIN, id: '00gNOAPPKEY', entity: {}, syncedAt: 0 },
      row('0oaFAKE1', '00gFAKE1'),
    ]);

    const byApp = await readAppGroupsFromSnapshot(ORIGIN);

    expect([...byApp.keys()]).toEqual(['0oaFAKE1']);
  });

  it.each([[null], [undefined], ['']])(
    'reads nothing for a %s origin rather than reading across orgs',
    async (origin) => {
      const byApp = await readAppGroupsFromSnapshot(origin);

      expect(byApp.size).toBe(0);
      expect(getRecords).not.toHaveBeenCalled();
    },
  );

  it('is an empty map when the store returns nothing', async () => {
    expect((await readAppGroupsFromSnapshot(ORIGIN)).size).toBe(0);
  });
});
