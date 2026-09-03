import { z } from 'zod';
import type { SnapshotCollection, SyncMeta } from './types';

const storedParseVersionSchema = z.number().int().nonnegative();

export function readParseVersion(meta: SyncMeta): number | null {
  const parsed = storedParseVersionSchema.safeParse(meta.parseVersion);
  return parsed.success ? parsed.data : null;
}

export interface VersionedSpec {
  collection: SnapshotCollection;
  parseVersion: number;
  firstUrl: string;
  preserveParams?: string[];
  shards?: (...args: never[]) => unknown;
  identify?: (...args: never[]) => unknown;
}

export function isParseVersionStale(spec: VersionedSpec, meta: SyncMeta): boolean {
  return readParseVersion(meta) !== spec.parseVersion;
}

export interface SpecFingerprint {
  parseVersion: number;
  firstUrl: string;
  preserveParams: string[];
  shardProvider: string | null;
  identifyHash: string | null;
}

function hashSource(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function fingerprintSpec(spec: VersionedSpec): SpecFingerprint {
  return {
    parseVersion: spec.parseVersion,
    firstUrl: spec.firstUrl,
    preserveParams: [...(spec.preserveParams ?? [])].sort(),
    shardProvider: spec.shards ? (spec.shards.name ?? '') : null,
    identifyHash: spec.identify ? hashSource(spec.identify.toString()) : null,
  };
}
