import type { z } from 'zod';
import {
  oktaAppGroupAssignmentSchema,
  oktaAppListItemSchema,
  oktaGroupListItemSchema,
  oktaGroupRuleSchema,
  type OktaAppListItem,
} from '../schemas/okta';
import { fetchAllPages, OKTA_PAGE_SIZE, type PaginatedPageResult } from '../utils/oktaPagination';
import { createLogger } from '../utils/logger';
import { orgSnapshotStore } from './orgSnapshotStore';
import {
  advanceWatermark,
  driftVerdict,
  nextSyncMode,
  readTotalCount,
  type SyncMode,
} from './syncMeta';
import { SHARD_KEY_SEPARATOR, type SnapshotCollection, type SyncMeta } from './types';

const log = createLogger('SnapshotSync');

export type PageRequest = (url: string) => Promise<PaginatedPageResult>;

export interface Shard {
  key: string;
  firstUrl: string;
}

export type ShardProvider = (origin: string) => Promise<Shard[]>;

export interface CollectionSpec<T = unknown> {
  collection: SnapshotCollection;
  firstUrl: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  preserveParams?: string[];
  context: string;
  shards?: ShardProvider;
  identify?: (row: unknown, shard: Shard | null) => { id: string; lastUpdated?: string } | null;
  refreshIntervalMs?: number;
}

const SHARD_CONCURRENCY = 5;

export interface WalkOutcome {
  collection: SnapshotCollection;
  complete: boolean;
  written: number;
  swept: number;
  error?: string;
  mode?: SyncMode;
}

function identify(row: unknown): { id: string; lastUpdated?: string } | null {
  if (typeof row !== 'object' || row === null) return null;
  const record = row as { id?: unknown; lastUpdated?: unknown };
  if (typeof record.id !== 'string' || record.id === '') return null;
  return {
    id: record.id,
    lastUpdated: typeof record.lastUpdated === 'string' ? record.lastUpdated : undefined,
  };
}

export type PageSink = (collection: SnapshotCollection, totalSoFar: number) => void;

export interface FullWalkOptions {
  origin: string;
  request: PageRequest;
  now: number;
  onPage?: PageSink;
  force?: boolean;
}

export async function runFullWalk<T>(
  spec: CollectionSpec<T>,
  options: FullWalkOptions,
): Promise<WalkOutcome> {
  const { origin, request, now, onPage } = options;
  const { collection } = spec;

  const previous = await orgSnapshotStore.getMeta(collection, origin);
  const resuming = previous.cursor !== null && previous.walkStartedAt !== null;
  const mark = resuming ? (previous.walkStartedAt as number) : now;
  const startUrl = resuming ? (previous.cursor as string) : spec.firstUrl;

  await orgSnapshotStore.patchMeta(collection, origin, {
    walkStartedAt: mark,
    cursor: startUrl,
    complete: false,
  });

  let watermark = previous.watermark;
  let written = 0;

  let drained: Promise<void> = Promise.resolve();
  const enqueue = (work: () => Promise<unknown>): void => {
    drained = drained.then(() => work()).then(() => undefined);
  };

  try {
    await fetchAllPages<T>(request, startUrl, {
      schema: spec.schema,
      context: spec.context,
      preserveParams: spec.preserveParams,
      paramSource: spec.firstUrl,
      onPage: (rows, totalSoFar) => {
        const identified: Array<{ id: string; entity: T; lastUpdated?: string }> = [];
        for (const row of rows) {
          const meta = identify(row);
          if (meta) identified.push({ id: meta.id, entity: row, lastUpdated: meta.lastUpdated });
        }

        watermark = advanceWatermark(
          watermark,
          identified.map((item) => item.lastUpdated),
        );
        written = totalSoFar;

        enqueue(() => orgSnapshotStore.upsertMany(collection, origin, identified, mark));
        onPage?.(collection, totalSoFar);
      },
      onCursor: (nextUrl) => {
        const at = watermark;
        enqueue(() =>
          orgSnapshotStore.patchMeta(collection, origin, { cursor: nextUrl, watermark: at }),
        );
      },
    });
    await drained;
  } catch (error) {
    await drained.catch(() => undefined);
    const message = error instanceof Error ? error.message : 'Walk failed';
    log.error('Full walk did not complete', { code: 'snapshot_walk_failed', collection });
    await orgSnapshotStore.patchMeta(collection, origin, { watermark });
    return { collection, complete: false, written, swept: 0, error: message };
  }

  const swept = await orgSnapshotStore.sweepStale(collection, origin, mark);
  const itemCount = await orgSnapshotStore.countCollection(collection, origin);

  await orgSnapshotStore.patchMeta(collection, origin, {
    complete: true,
    lastFullWalkAt: now,
    cursor: null,
    walkStartedAt: null,
    watermark,
    itemCount,
  });

  log.debug('Full walk complete', { collection, written, swept, itemCount });
  return { collection, complete: true, written, swept };
}

const UNREACHABLE_WATERMARK = '9999-01-01T00:00:00.000Z';

function countUrl(spec: CollectionSpec, search?: string): string {
  const path = spec.firstUrl.split('?')[0];
  const params = new URLSearchParams({ limit: '1' });
  if (search) params.set('search', search);
  return `${path}?${params.toString()}`;
}

function deltaUrl(spec: CollectionSpec, watermark: string): string {
  const separator = spec.firstUrl.includes('?') ? '&' : '?';
  const search = encodeURIComponent(`lastUpdated gt "${watermark}"`);
  return `${spec.firstUrl}${separator}search=${search}`;
}

async function probeDeltaSupport(spec: CollectionSpec, request: PageRequest): Promise<boolean> {
  const result = await request(countUrl(spec, `lastUpdated gt "${UNREACHABLE_WATERMARK}"`));
  if (!result.success) return false;
  return readTotalCount(result.headers) === 0;
}

async function runDriftCheck(
  spec: CollectionSpec,
  options: FullWalkOptions,
): Promise<ReturnType<typeof driftVerdict>> {
  const { origin, request } = options;
  const result = await request(countUrl(spec));
  if (!result.success) return 'unknown';
  const stored = await orgSnapshotStore.countCollection(spec.collection, origin);
  return driftVerdict(readTotalCount(result.headers), stored);
}

async function runDelta<T>(
  spec: CollectionSpec<T>,
  options: FullWalkOptions,
  meta: SyncMeta,
): Promise<WalkOutcome> {
  const { origin, request, now, onPage } = options;
  const { collection } = spec;

  if (meta.deltaSupported === null) {
    const supported = await probeDeltaSupport(spec, request);
    await orgSnapshotStore.patchMeta(collection, origin, { deltaSupported: supported });
    if (!supported) {
      log.debug('Delta filter not honoured; falling back to a full walk', { collection });
      return { ...(await runFullWalk(spec, options)), mode: 'full' };
    }
  }

  if (meta.watermark === null) {
    await orgSnapshotStore.patchMeta(collection, origin, { lastDeltaAt: now });
    return { collection, complete: true, written: 0, swept: 0, mode: 'none' };
  }

  let watermark = meta.watermark;
  let written = 0;
  let drained: Promise<void> = Promise.resolve();
  const enqueue = (work: () => Promise<unknown>): void => {
    drained = drained.then(() => work()).then(() => undefined);
  };

  try {
    await fetchAllPages<T>(request, deltaUrl(spec, watermark), {
      schema: spec.schema,
      context: `${spec.context} (delta)`,
      preserveParams: spec.preserveParams ? [...spec.preserveParams, 'search'] : ['search'],
      onPage: (rows, totalSoFar) => {
        const identified: Array<{ id: string; entity: T; lastUpdated?: string }> = [];
        for (const row of rows) {
          const item = identify(row);
          if (item) identified.push({ id: item.id, entity: row, lastUpdated: item.lastUpdated });
        }
        watermark = advanceWatermark(
          watermark,
          identified.map((item) => item.lastUpdated),
        ) as string;
        written = totalSoFar;
        enqueue(() => orgSnapshotStore.upsertMany(collection, origin, identified, now));
        onPage?.(collection, totalSoFar);
      },
    });
    await drained;
  } catch (error) {
    await drained.catch(() => undefined);
    const message = error instanceof Error ? error.message : 'Delta failed';
    log.error('Delta sync did not complete', { code: 'snapshot_delta_failed', collection });
    return {
      collection,
      complete: meta.complete,
      written,
      swept: 0,
      error: message,
      mode: 'delta',
    };
  }

  const itemCount = await orgSnapshotStore.countCollection(collection, origin);
  await orgSnapshotStore.patchMeta(collection, origin, { watermark, lastDeltaAt: now, itemCount });
  log.debug('Delta sync complete', { collection, written, itemCount });
  return { collection, complete: true, written, swept: 0, mode: 'delta' };
}

export async function runShardedWalk<T>(
  spec: CollectionSpec<T>,
  options: FullWalkOptions,
): Promise<WalkOutcome> {
  const { origin, request, now, onPage } = options;
  const { collection } = spec;
  const shardsOf = spec.shards;
  if (!shardsOf) return runFullWalk(spec, options);

  const identifyRow = spec.identify ?? ((row: unknown) => identify(row));

  const previous = await orgSnapshotStore.getMeta(collection, origin);
  const resuming = previous.walkStartedAt !== null && !previous.complete;
  const mark = resuming ? (previous.walkStartedAt as number) : now;
  const done = new Set<string>(resuming ? previous.completedShards : []);

  let shards: Shard[];
  try {
    shards = await shardsOf(origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shard discovery failed';
    log.error('Sharded walk could not determine its shards', {
      code: 'snapshot_shards_failed',
      collection,
    });
    return { collection, complete: false, written: 0, swept: 0, error: message };
  }

  await orgSnapshotStore.patchMeta(collection, origin, {
    walkStartedAt: mark,
    complete: false,
    deltaSupported: false,
    completedShards: [...done],
    cursor: null,
  });

  const pending = shards.filter((shard) => !done.has(shard.key));
  let written = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i += SHARD_CONCURRENCY) {
    const batch = pending.slice(i, i + SHARD_CONCURRENCY);
    const settled = await Promise.all(
      batch.map(async (shard) => {
        const rows: Array<{ id: string; entity: T; lastUpdated?: string }> = [];
        try {
          await fetchAllPages<T>(request, shard.firstUrl, {
            schema: spec.schema,
            context: `${spec.context} (${shard.key})`,
            preserveParams: spec.preserveParams,
            paramSource: shard.firstUrl,
            onPage: (page) => {
              for (const row of page) {
                const item = identifyRow(row, shard);
                if (item) rows.push({ id: item.id, entity: row, lastUpdated: item.lastUpdated });
              }
            },
          });
        } catch {
          return { shard, rows, ok: false };
        }
        return { shard, rows, ok: true };
      }),
    );

    for (const result of settled) {
      if (!result.ok) {
        failed += 1;
        continue;
      }
      if (result.rows.length > 0) {
        await orgSnapshotStore.upsertMany(collection, origin, result.rows, mark);
      }
      written += result.rows.length;
      done.add(result.shard.key);
    }

    await orgSnapshotStore.patchMeta(collection, origin, { completedShards: [...done] });
    onPage?.(collection, written);
  }

  if (failed > 0) {
    log.warn('Sharded walk did not reach every shard', {
      code: 'snapshot_shards_incomplete',
      collection,
      failed,
      total: shards.length,
    });
    return {
      collection,
      complete: false,
      written,
      swept: 0,
      error: `${failed} of ${shards.length} listings failed`,
    };
  }

  const swept = await orgSnapshotStore.sweepStale(collection, origin, mark);
  const itemCount = await orgSnapshotStore.countCollection(collection, origin);

  await orgSnapshotStore.patchMeta(collection, origin, {
    complete: true,
    lastFullWalkAt: now,
    cursor: null,
    walkStartedAt: null,
    completedShards: [],
    itemCount,
  });

  log.debug('Sharded walk complete', { collection, shards: shards.length, written, swept });
  return { collection, complete: true, written, swept };
}

export async function syncCollection<T>(
  spec: CollectionSpec<T>,
  options: FullWalkOptions,
): Promise<WalkOutcome> {
  const meta = await orgSnapshotStore.getMeta(spec.collection, options.origin);
  const mode: SyncMode = options.force
    ? 'full'
    : nextSyncMode(meta, options.now, spec.refreshIntervalMs);

  if (spec.shards) {
    if (mode === 'none')
      return { collection: spec.collection, complete: true, written: 0, swept: 0, mode };
    return { ...(await runShardedWalk(spec, options)), mode: 'full' };
  }

  if (mode === 'full') return { ...(await runFullWalk(spec, options)), mode: 'full' };
  if (mode === 'none')
    return { collection: spec.collection, complete: true, written: 0, swept: 0, mode };

  if (mode === 'drift-check') {
    const verdict = await runDriftCheck(spec, options);
    if (verdict !== 'in-sync') {
      log.debug('Drift check escalating to a full walk', { collection: spec.collection, verdict });
      return { ...(await runFullWalk(spec, options)), mode: 'full' };
    }
    return runDelta(spec, options, meta);
  }

  return runDelta(spec, options, meta);
}

export const GROUPS_SPEC: CollectionSpec = {
  collection: 'groups',
  firstUrl: `/api/v1/groups?limit=${OKTA_PAGE_SIZE}&expand=stats&expand=app`,
  schema: oktaGroupListItemSchema,
  preserveParams: ['expand'],
  context: 'GET /api/v1/groups',
};

export const RULES_SPEC: CollectionSpec = {
  collection: 'rules',
  firstUrl: `/api/v1/groups/rules?limit=${OKTA_PAGE_SIZE}`,
  schema: oktaGroupRuleSchema,
  context: 'GET /api/v1/groups/rules',
};

export const APPS_SPEC: CollectionSpec = {
  collection: 'apps',
  firstUrl: `/api/v1/apps?limit=${OKTA_PAGE_SIZE}`,
  schema: oktaAppListItemSchema,
  context: 'GET /api/v1/apps',
};

const GROUP_PUSH_FEATURE = 'GROUP_PUSH';

const APP_GROUPS_REFRESH_MS = 6 * 60 * 60 * 1000;

interface StoredGroupSource {
  type?: unknown;
  source?: { id?: unknown };
  _links?: { apps?: { href?: unknown } };
}

function sourceAppIdOf(group: StoredGroupSource): string | null {
  if (group.type !== 'APP_GROUP') return null;
  const sourceId = group.source?.id;
  if (typeof sourceId === 'string' && sourceId !== '') return sourceId;
  const href = group._links?.apps?.href;
  if (typeof href !== 'string') return null;
  const match = href.match(/\/apps\/([^/]+)/);
  return match ? match[1] : null;
}

async function pushEnabledAppShards(origin: string): Promise<Shard[]> {
  const [apps, appsMeta] = await Promise.all([
    orgSnapshotStore.getCollection<OktaAppListItem>('apps', origin),
    orgSnapshotStore.getMeta('apps', origin),
  ]);

  const appIds = new Set<string>();
  for (const app of apps) {
    if (app.features?.includes(GROUP_PUSH_FEATURE) && app.id) appIds.add(app.id);
  }

  if (appIds.size === 0) {
    const groups = await orgSnapshotStore.getCollection<StoredGroupSource>('groups', origin);
    for (const group of groups) {
      const sourceId = sourceAppIdOf(group);
      if (sourceId) appIds.add(sourceId);
    }
    if (appIds.size === 0 && !appsMeta.complete) {
      throw new Error('app inventory not yet walked');
    }
  }

  return [...appIds].sort().map((id) => ({
    key: id,
    firstUrl: `/api/v1/apps/${encodeURIComponent(id)}/groups?limit=${OKTA_PAGE_SIZE}`,
  }));
}

export const APP_GROUPS_SPEC: CollectionSpec = {
  collection: 'appGroups',
  firstUrl: `/api/v1/apps/{appId}/groups?limit=${OKTA_PAGE_SIZE}`,
  schema: oktaAppGroupAssignmentSchema,
  context: 'GET /api/v1/apps/{appId}/groups',
  shards: pushEnabledAppShards,
  identify: (row, shard) => {
    if (!shard || typeof row !== 'object' || row === null) return null;
    const assignment = row as { id?: unknown };
    const groupId = typeof assignment.id === 'string' ? assignment.id : '';
    if (groupId === '') return null;
    return { id: `${shard.key}${SHARD_KEY_SEPARATOR}${groupId}` };
  },
  refreshIntervalMs: APP_GROUPS_REFRESH_MS,
};

export async function syncOrg(
  options: FullWalkOptions,
  specs: ReadonlyArray<CollectionSpec> = [GROUPS_SPEC, RULES_SPEC, APPS_SPEC],
  derivedSpecs: ReadonlyArray<CollectionSpec> = [APP_GROUPS_SPEC],
): Promise<WalkOutcome[]> {
  const independent = await Promise.all(specs.map((spec) => syncCollection(spec, options)));
  const derived = await Promise.all(derivedSpecs.map((spec) => syncCollection(spec, options)));
  return [...independent, ...derived];
}
