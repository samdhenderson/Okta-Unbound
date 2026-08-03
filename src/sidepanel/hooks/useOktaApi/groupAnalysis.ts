import type { OktaUser, GroupComparisonResult } from '../../../shared/types';

type GetAllGroupMembers = (groupId: string) => Promise<OktaUser[]>;

export function createGroupAnalysisOperations(getAllGroupMembers: GetAllGroupMembers) {
  const compareGroups = async (
    groups: Array<{ id: string; name: string }>,
    onProgress?: (current: number, total: number, message?: string) => void,
    memberCache?: Map<string, OktaUser[]>,
  ): Promise<GroupComparisonResult> => {
    if (groups.length < 2 || groups.length > 5) {
      throw new Error('Select 2-5 groups to compare');
    }

    const groupMembers = new Map<string, Set<string>>();
    const groupInfo: GroupComparisonResult['groups'] = [];

    for (let i = 0; i < groups.length; i++) {
      const { id, name } = groups[i];
      onProgress?.(i + 1, groups.length, `Loading members for ${name}...`);

      let members: OktaUser[];
      if (memberCache?.has(id)) {
        members = memberCache.get(id)!;
      } else {
        members = await getAllGroupMembers(id);
        memberCache?.set(id, members);
      }

      const userIds = new Set(members.map((m) => m.id));
      groupMembers.set(id, userIds);
      groupInfo.push({ id, name, memberCount: userIds.size });
    }

    const allSets = Array.from(groupMembers.values());
    const intersection = [...allSets[0]].filter((userId) => allSets.every((s) => s.has(userId)));

    const uniqueMembers: Record<string, string[]> = {};
    for (const [groupId, members] of groupMembers) {
      const otherSets = Array.from(groupMembers.entries())
        .filter(([id]) => id !== groupId)
        .map(([, s]) => s);

      uniqueMembers[groupId] = [...members].filter(
        (userId) => !otherSets.some((s) => s.has(userId)),
      );
    }

    const allUsers = new Set<string>();
    for (const members of groupMembers.values()) {
      for (const userId of members) {
        allUsers.add(userId);
      }
    }

    return {
      groups: groupInfo,
      intersection,
      uniqueMembers,
      totalUniqueUsers: allUsers.size,
    };
  };

  const searchUserAcrossGroups = (
    query: string,
    groupMembersCache: Map<string, OktaUser[]>,
    groupNames: Map<string, string>,
  ): Array<{ groupId: string; groupName: string; user: OktaUser }> => {
    const q = query.toLowerCase();
    const results: Array<{ groupId: string; groupName: string; user: OktaUser }> = [];
    const seenUserGroups = new Set<string>();

    for (const [groupId, members] of groupMembersCache) {
      for (const user of members) {
        const matches =
          user.profile.email?.toLowerCase().includes(q) ||
          user.profile.login?.toLowerCase().includes(q) ||
          user.profile.firstName?.toLowerCase().includes(q) ||
          user.profile.lastName?.toLowerCase().includes(q) ||
          `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(q);

        if (matches) {
          const key = `${user.id}_${groupId}`;
          if (!seenUserGroups.has(key)) {
            seenUserGroups.add(key);
            results.push({
              groupId,
              groupName: groupNames.get(groupId) || groupId,
              user,
            });
          }
        }
      }
    }

    return results;
  };

  return {
    compareGroups,
    searchUserAcrossGroups,
  };
}
