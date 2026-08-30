import { orgSnapshotStore } from '../../shared/snapshot/orgSnapshotStore';
import { SHARD_KEY_SEPARATOR } from '../../shared/snapshot/types';
import { DEMO_ORIGIN } from './org';
import { DEMO_GROUP_COUNT, currentGroups, demoAppGroups, demoApps, demoRules } from './snapshot';

let latencyMs = 450;

let installedControls: DemoControls | null = null;

export function setDemoLatency(ms: number): void {
  latencyMs = Math.max(0, ms);
}

export function demoDelay(): Promise<void> {
  return latencyMs === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, latencyMs));
}

export async function seedDemoSnapshot(): Promise<void> {
  const now = Date.now();
  await orgSnapshotStore.clearOrigin(DEMO_ORIGIN);

  await orgSnapshotStore.upsertMany(
    'groups',
    DEMO_ORIGIN,
    currentGroups().map((entity) => ({ id: entity.id, entity })),
    now,
  );
  await orgSnapshotStore.upsertMany(
    'rules',
    DEMO_ORIGIN,
    demoRules.map((entity) => ({ id: entity.id, entity })),
    now,
  );
  await orgSnapshotStore.upsertMany(
    'apps',
    DEMO_ORIGIN,
    demoApps.map((entity) => ({ id: entity.id, entity })),
    now,
  );
  await orgSnapshotStore.upsertMany(
    'appGroups',
    DEMO_ORIGIN,
    demoAppGroups.map(({ appId, assignment }) => ({
      id: `${appId}${SHARD_KEY_SEPARATOR}${assignment.id}`,
      entity: assignment,
    })),
    now,
  );

  for (const collection of ['groups', 'rules', 'apps', 'appGroups'] as const) {
    await orgSnapshotStore.patchMeta(collection, DEMO_ORIGIN, {
      complete: true,
      lastFullWalkAt: now,
      itemCount:
        collection === 'groups'
          ? DEMO_GROUP_COUNT
          : collection === 'rules'
            ? demoRules.length
            : collection === 'apps'
              ? demoApps.length
              : demoAppGroups.length,
    });
  }
}

export async function seedDemoSnapshotPartial(groupCount: number): Promise<void> {
  const now = Date.now();
  await orgSnapshotStore.clearOrigin(DEMO_ORIGIN);
  await orgSnapshotStore.upsertMany(
    'groups',
    DEMO_ORIGIN,
    currentGroups()
      .slice(0, groupCount)
      .map((entity) => ({ id: entity.id, entity })),
    now,
  );
  await orgSnapshotStore.patchMeta('groups', DEMO_ORIGIN, {
    complete: false,
    itemCount: DEMO_GROUP_COUNT,
  });
}

export async function republishDemoGroups(): Promise<void> {
  await orgSnapshotStore.upsertMany(
    'groups',
    DEMO_ORIGIN,
    currentGroups().map((entity) => ({ id: entity.id, entity })),
    Date.now(),
  );
  await orgSnapshotStore.patchMeta('groups', DEMO_ORIGIN, {
    complete: true,
    lastFullWalkAt: Date.now(),
    itemCount: DEMO_GROUP_COUNT,
  });
  installedControls?.emitSnapshotUpdated();
}

export interface DemoProgressHandle {
  start: (operationName: string, message: string, total: number) => void;
  update: (completed: number, total: number, message?: string) => void;
  complete: () => void;
}

export interface DemoControls {
  setLatency: (ms: number) => void;
  seed: () => Promise<void>;
  seedPartial: (groupCount: number) => Promise<void>;
  emitSnapshotUpdated: () => void;
  progress?: DemoProgressHandle;
}

export function installDemoControls(emitSnapshotUpdated: () => void): DemoControls {
  const controls: DemoControls = {
    setLatency: setDemoLatency,
    seed: seedDemoSnapshot,
    seedPartial: seedDemoSnapshotPartial,
    emitSnapshotUpdated,
  };
  installedControls = controls;
  (globalThis as unknown as { __OKTA_DEMO__?: DemoControls }).__OKTA_DEMO__ = controls;
  return controls;
}
