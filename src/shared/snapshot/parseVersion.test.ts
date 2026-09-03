import { describe, it, expect } from 'vitest';
import {
  fingerprintSpec,
  isParseVersionStale,
  readParseVersion,
  type SpecFingerprint,
  type VersionedSpec,
} from './parseVersion';
import { emptySyncMeta } from './syncMeta';
import type { SnapshotCollection, SyncMeta } from './types';
import { APP_GROUPS_SPEC, APPS_SPEC, GROUPS_SPEC, RULES_SPEC } from './snapshotSync';

const ORIGIN = 'https://example.okta.com';

function metaWith(parseVersion: unknown): SyncMeta {
  return { ...emptySyncMeta(ORIGIN, 'groups'), parseVersion } as SyncMeta;
}

function specAt(parseVersion: number): VersionedSpec {
  return { collection: 'groups', parseVersion, firstUrl: '/api/v1/groups?limit=200' };
}

describe('readParseVersion', () => {
  it('reads a version a completed walk recorded', () => {
    expect(readParseVersion(metaWith(3))).toBe(3);
  });

  it('reads an absent field as "not knowable" rather than as version zero', () => {
    const legacy = emptySyncMeta(ORIGIN, 'groups');
    expect('parseVersion' in legacy).toBe(false);
    expect(readParseVersion(legacy)).toBeNull();
  });

  it('reads an explicit null the same way as an absent field', () => {
    expect(readParseVersion(metaWith(null))).toBeNull();
  });

  it.each([
    ['a non-integer', 1.5],
    ['a negative number', -1],
    ['a string', '2'],
    ['a boolean', true],
  ])('treats %s on disk as no version at all', (_label, value) => {
    expect(readParseVersion(metaWith(value))).toBeNull();
  });
});

describe('isParseVersionStale', () => {
  it('is not stale when the stored version matches the spec', () => {
    expect(isParseVersionStale(specAt(2), metaWith(2))).toBe(false);
  });

  it('is stale when the stored version is behind the spec', () => {
    expect(isParseVersionStale(specAt(2), metaWith(1))).toBe(true);
  });

  it('is stale when the stored version is ahead — a downgrade re-walks too', () => {
    expect(isParseVersionStale(specAt(1), metaWith(2))).toBe(true);
  });

  it('is stale for a never-synced org', () => {
    expect(isParseVersionStale(specAt(1), emptySyncMeta(ORIGIN, 'groups'))).toBe(true);
  });
});

describe('fingerprintSpec', () => {
  it('sorts preserveParams, so reordering them is not a false alarm', () => {
    const a = fingerprintSpec({ ...specAt(1), preserveParams: ['expand', 'search'] });
    const b = fingerprintSpec({ ...specAt(1), preserveParams: ['search', 'expand'] });
    expect(a.preserveParams).toEqual(['expand', 'search']);
    expect(a).toEqual(b);
  });

  it('moves when the first URL gains an expand', () => {
    const before = fingerprintSpec(specAt(1));
    const after = fingerprintSpec({
      ...specAt(1),
      firstUrl: '/api/v1/groups?limit=200&expand=app',
    });
    expect(after.firstUrl).not.toBe(before.firstUrl);
  });

  it('moves when identify changes, which is a change to the storage key', () => {
    const before = fingerprintSpec({ ...specAt(1), identify: () => null });
    const after = fingerprintSpec({ ...specAt(1), identify: () => ({ id: 'x' }) });
    expect(before.identifyHash).not.toBe(after.identifyHash);
    expect(before.identifyHash).toHaveLength(8);
  });

  it('records no identify hash and no shard provider for a plain listing', () => {
    expect(fingerprintSpec(specAt(1))).toMatchObject({
      identifyHash: null,
      shardProvider: null,
    });
  });

  it('names the shard provider, so swapping which apps are walked is visible', () => {
    async function pushEnabled() {
      return [];
    }
    expect(fingerprintSpec({ ...specAt(1), shards: pushEnabled }).shardProvider).toBe(
      'pushEnabled',
    );
  });
});

const SPEC_FINGERPRINTS: Record<SnapshotCollection, SpecFingerprint> = {
  groups: {
    parseVersion: 1,
    firstUrl: '/api/v1/groups?limit=200&expand=stats&expand=app',
    preserveParams: ['expand'],
    shardProvider: null,
    identifyHash: null,
  },
  rules: {
    parseVersion: 1,
    firstUrl: '/api/v1/groups/rules?limit=200',
    preserveParams: [],
    shardProvider: null,
    identifyHash: null,
  },
  apps: {
    parseVersion: 1,
    firstUrl: '/api/v1/apps?limit=200',
    preserveParams: [],
    shardProvider: null,
    identifyHash: null,
  },
  appGroups: {
    parseVersion: 1,
    firstUrl: '/api/v1/apps/{appId}/groups?limit=200',
    preserveParams: [],
    shardProvider: 'pushEnabledAppShards',
    identifyHash: '41449c7c',
  },
};

describe('the shipped specs are locked to their versions', () => {
  it.each([
    ['groups', GROUPS_SPEC],
    ['rules', RULES_SPEC],
    ['apps', APPS_SPEC],
    ['appGroups', APP_GROUPS_SPEC],
  ] as const)('%s matches its recorded fingerprint', (name, spec) => {
    expect(fingerprintSpec(spec)).toEqual(SPEC_FINGERPRINTS[name]);
  });

  it('gives every collection a fingerprint entry', () => {
    expect(Object.keys(SPEC_FINGERPRINTS).sort()).toEqual(
      ['appGroups', 'apps', 'groups', 'rules'].sort(),
    );
  });
});
