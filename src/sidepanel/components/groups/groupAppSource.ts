import { appStatusVariant, type AppStatusVariant } from '../apps/appFilters';
import type { AppGrant } from '../../hooks/useGroupAccessGrants';
import type { PushGroupMapping } from '../../../shared/types';

export type GroupAppPush =
  | { state: 'unknown' }
  | { state: 'not-pushed' }
  | {
      state: 'pushed';
      targetGroupName: string;
      priority?: number;
    };

export interface GroupAppRowModel {
  id: string;
  label: string;
  name?: string;
  status?: string;
  statusVariant: AppStatusVariant;
  signOnMode?: string;
  lastUpdated?: Date;
  push: GroupAppPush;
}

export function toGroupAppRows(
  apps: readonly AppGrant[],
  pushMappings: readonly PushGroupMapping[] | undefined,
): GroupAppRowModel[] {
  const byAppId = new Map<string, PushGroupMapping>();
  for (const mapping of pushMappings ?? []) {
    if (!byAppId.has(mapping.appId)) byAppId.set(mapping.appId, mapping);
  }

  return apps.map((app) => ({
    id: app.id,
    label: app.label,
    name: app.name,
    status: app.status,
    statusVariant: appStatusVariant(app.status),
    signOnMode: app.signOnMode,
    lastUpdated: app.lastUpdated,
    push: pushStateFor(app.id, pushMappings, byAppId),
  }));
}

function pushStateFor(
  appId: string,
  pushMappings: readonly PushGroupMapping[] | undefined,
  byAppId: ReadonlyMap<string, PushGroupMapping>,
): GroupAppPush {
  if (pushMappings === undefined) return { state: 'unknown' };
  const mapping = byAppId.get(appId);
  if (!mapping) return { state: 'not-pushed' };
  return {
    state: 'pushed',
    targetGroupName: mapping.targetGroupName,
    priority: mapping.priority,
  };
}
