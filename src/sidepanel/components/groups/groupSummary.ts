import type { GroupSummary, GroupType } from '../../../shared/types';

export interface RawOktaGroup {
  id: string;
  type: GroupType;
  profile?: { name?: string; description?: string };
  _embedded?: { stats?: { usersCount?: number } };
  _links?: { apps?: { href?: string } };
  source?: { id: string; name?: string };
  lastUpdated?: string;
  created?: string;
}

export function toGroupSummary(group: RawOktaGroup): GroupSummary {
  const memberCount = group._embedded?.stats?.usersCount ?? 0;

  let sourceAppId: string | undefined;
  let sourceAppName: string | undefined;

  if (group.type === 'APP_GROUP') {
    if (group._links?.apps?.href) {
      const appIdMatch = group._links.apps.href.match(/\/apps\/([^/]+)/);
      if (appIdMatch) sourceAppId = appIdMatch[1];
    }
    if (group.source) {
      sourceAppId = group.source.id;
      if (group.source.name && group.source.name !== group.source.id) {
        sourceAppName = group.source.name;
      }
    }
  }

  return {
    id: group.id,
    name: group.profile?.name || group.id,
    description: group.profile?.description,
    type: group.type,
    memberCount,
    lastUpdated: group.lastUpdated ? new Date(group.lastUpdated) : undefined,
    created: group.created ? new Date(group.created) : undefined,
    hasRules: false,
    ruleCount: 0,
    selected: false,
    sourceAppId,
    sourceAppName,
  };
}

export function liveSearchToGroupSummary(group: RawOktaGroup): GroupSummary {
  return {
    id: group.id,
    name: group.profile?.name || group.id,
    description: group.profile?.description,
    type: group.type,
    memberCount: group._embedded?.stats?.usersCount ?? 0,
    lastUpdated: group.lastUpdated ? new Date(group.lastUpdated) : undefined,
    created: group.created ? new Date(group.created) : undefined,
    hasRules: false,
    ruleCount: 0,
    selected: false,
  };
}
