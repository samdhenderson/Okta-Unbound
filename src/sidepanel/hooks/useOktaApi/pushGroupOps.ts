import type { CoreApi } from './core';
import type { PushGroupMapping, GroupSummary } from '../../../shared/types';
import { fetchAllPages, OKTA_PAGE_SIZE } from '@/shared/utils/oktaPagination';
import { oktaAppGroupAssignmentSchema, type OktaAppGroupAssignment } from '@/shared/schemas/okta';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('pushGroupOps');

export function createPushGroupOperations(coreApi: CoreApi) {
  const getAppPushGroupMappings = async (
    appId: string,
    appName?: string,
  ): Promise<PushGroupMapping[]> => {
    const mappings: PushGroupMapping[] = [];

    try {
      await fetchAllPages<OktaAppGroupAssignment>(
        (url) => coreApi.makeApiRequest(url, 'GET', undefined, 'low'),
        `/api/v1/apps/${appId}/groups?limit=${OKTA_PAGE_SIZE}`,
        {
          schema: oktaAppGroupAssignmentSchema,
          onPage: (assignments) => {
            for (const assignment of assignments) {
              mappings.push({
                mappingId:
                  assignment.id ||
                  `${appId}_${assignment._links?.group?.href?.split('/').pop() || 'unknown'}`,
                sourceUserGroupId: assignment._links?.group?.href?.split('/').pop() || '',
                targetGroupName: assignment.profile?.name || assignment.profile?.groupName || '',
                priority: assignment.priority,
                appId,
                appName,
              });
            }
          },
        },
      );
    } catch (error) {
      log.error(`Failed to fetch push mappings for app ${appId}:`, error);
    }

    return mappings;
  };

  const applyPushGroupMappings = async (
    groups: GroupSummary[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<GroupSummary[]> => {
    const appIds = new Map<string, string>(); // appId -> appName
    for (const group of groups) {
      if (group.type === 'APP_GROUP' && group.sourceAppId) {
        appIds.set(group.sourceAppId, group.sourceAppName || group.sourceAppId);
      }
    }

    if (appIds.size === 0) return groups;

    await coreApi.runOperation(
      'Resolve app names',
      Array.from(appIds.keys()),
      async (appId) => {
        try {
          const response = await coreApi.makeApiRequest(
            `/api/v1/apps/${appId}`,
            'GET',
            undefined,
            'low',
          );
          if (response.success && response.data) {
            const label = response.data.label || response.data.name;
            if (label) appIds.set(appId, label);
          }
        } catch (error) {
          log.error(`Failed to resolve app label for app ${appId}:`, error);
        }
      },
      { message: (p) => `Resolving app names (${p.completed}/${p.total})` },
    );

    const appEntries = Array.from(appIds.entries());
    const total = appEntries.length;
    let processed = 0;

    const mappingOutcome = await coreApi.runOperation(
      'Load push-group mappings',
      appEntries,
      async ([appId, appName]) => {
        const mappings = await getAppPushGroupMappings(appId, appName);
        processed++;
        onProgress?.(processed, total);
        return mappings;
      },
      { message: (p) => `Loading push mappings (${p.completed}/${p.total})` },
    );

    const allMappings: PushGroupMapping[] = [];
    for (const r of mappingOutcome.results) {
      if (r.status === 'fulfilled' && r.value) allMappings.push(...r.value);
    }

    const mappingsByGroup = new Map<string, PushGroupMapping[]>();
    for (const mapping of allMappings) {
      const existing = mappingsByGroup.get(mapping.sourceUserGroupId) || [];
      existing.push(mapping);
      mappingsByGroup.set(mapping.sourceUserGroupId, existing);
    }

    return groups.map((group) => {
      const pushMappings = mappingsByGroup.get(group.id);
      const resolvedAppName = group.sourceAppId ? appIds.get(group.sourceAppId) : undefined;
      const updates: Partial<GroupSummary> = {};

      if (pushMappings && pushMappings.length > 0) {
        updates.pushMappings = pushMappings;
      }
      if (resolvedAppName && resolvedAppName !== group.sourceAppId) {
        updates.sourceAppName = resolvedAppName;
      }

      return Object.keys(updates).length > 0 ? { ...group, ...updates } : group;
    });
  };

  return {
    getAppPushGroupMappings,
    applyPushGroupMappings,
  };
}
