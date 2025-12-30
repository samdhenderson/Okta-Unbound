import { useState, useEffect, useCallback } from 'react';
import type {
  GroupHealthMetrics,
  OktaUser,
  UserStatus,
  DashboardCache,
  FormattedRule,
} from '../../shared/types';
import { normalizeUserStatus } from '../../shared/utils/statusNormalizer';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'dashboard_cache';

interface UseGroupHealthOptions {
  groupId: string | undefined;
  targetTabId: number | null;
}

export function useGroupHealth({ groupId, targetTabId }: UseGroupHealthOptions) {
  const [metrics, setMetrics] = useState<GroupHealthMetrics | null>(null);
  const [members, setMembers] = useState<OktaUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessageSafely = useCallback(async (tabId: number, message: any) => {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab) {
        throw new Error('Tab not found');
      }

      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Receiving end does not exist')) {
        throw new Error('Connection lost. Please refresh the Okta page and try again.');
      }
      if (err instanceof Error && err.message.includes('Tab not found')) {
        throw new Error('The Okta tab is no longer available. Please navigate to a group page.');
      }
      throw err;
    }
  }, []);

  const fetchGroupMembers = useCallback(async (): Promise<OktaUser[]> => {
    if (!targetTabId || !groupId) {
      throw new Error('Missing target tab ID or group ID');
    }

    const allMembers: OktaUser[] = [];
    let currentOffset = 0;
    const pageSize = 200;
    let hasMore = true;

    while (hasMore) {
      const endpoint = `/admin/users/search?iDisplayLength=${pageSize}&iColumns=6&sColumns=user.id%2Cstatus.statusLabel%2Cuser.fullName%2Cuser.login%2CmanagedBy.rules&orderBy=membershipId&enableSQLQueryGenerator=true&enableESUserLookup=true&skipCountTotal=true&groupId=${groupId}&sortDirection=desc&iDisplayStart=${currentOffset}&sSearch=`;

      const response: { success: boolean; data?: any; error?: string } = await sendMessageSafely(
        targetTabId,
        {
          action: 'makeApiRequest',
          endpoint,
          method: 'GET',
        },
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch group members');
      }

      const responseData = response.data;
      const pageMembers = responseData?.aaData || [];

      if (pageMembers.length === 0) {
        hasMore = false;
        break;
      }

      if (currentOffset === 0 && pageMembers.length > 0) {
        console.log('[useGroupHealth] Raw API response sample (first member):', {
          raw: pageMembers[0],
          userId: pageMembers[0]?.[0],
          statusLabel: pageMembers[0]?.[1],
          statusLabelType: typeof pageMembers[0]?.[1],
          fullName: pageMembers[0]?.[2],
          login: pageMembers[0]?.[3],
          managedByRules: pageMembers[0]?.[4],
        });
      }

      const transformedMembers = pageMembers.map((member: any[]) => {
        const userId = member[0];
        const statusLabel = member[1];
        const fullName = member[2] || '';
        const login = member[3];

        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        let managedByRules: Array<{ id: string; name: string }> = [];
        const rulesData = member[4];

        if (currentOffset === 0 && allMembers.length < 5) {
          console.log('[useGroupHealth] managedBy.rules data for user:', {
            userId,
            rulesData,
            type: typeof rulesData,
            isArray: Array.isArray(rulesData),
            isObject: typeof rulesData === 'object' && rulesData !== null,
            isEmpty: rulesData === '' || rulesData === null || rulesData === 'null',
            objectKeys:
              typeof rulesData === 'object' && rulesData !== null ? Object.keys(rulesData) : [],
          });
        }

        if (rulesData && typeof rulesData === 'object' && !Array.isArray(rulesData)) {
          const ruleIds = Object.keys(rulesData);
          if (ruleIds.length > 0) {
            managedByRules = ruleIds.map((id) => ({
              id,
              name: rulesData[id] || 'Unknown',
            }));
          }
        }

        return {
          id: userId,
          status: normalizeUserStatus(statusLabel, `user:${userId}`),
          managedBy: { rules: managedByRules.length > 0 ? managedByRules : undefined },
          profile: {
            login: login || '',
            email: login || '', // Login is typically the email
            firstName,
            lastName,
          },
        };
      });

      allMembers.push(...transformedMembers);

      if (pageMembers.length < pageSize) {
        hasMore = false;
      } else {
        currentOffset += pageSize;
      }
    }

    return allMembers;
  }, [groupId, targetTabId, sendMessageSafely]);

  const fetchGroupRules = useCallback(async (): Promise<FormattedRule[]> => {
    if (!targetTabId || !groupId) {
      return [];
    }

    try {
      const response = await sendMessageSafely(targetTabId, {
        action: 'fetchGroupRules',
        groupId,
      });

      if (response.success && response.rules) {
        return response.rules.filter(
          (rule: FormattedRule) => rule.affectsCurrentGroup && rule.status === 'ACTIVE',
        );
      }
      return [];
    } catch (err) {
      console.warn('[useGroupHealth] Failed to fetch group rules:', err);
      return [];
    }
  }, [groupId, targetTabId, sendMessageSafely]);

  const calculateMetrics = useCallback(
    async (members: OktaUser[], _activeRules: FormattedRule[]): Promise<GroupHealthMetrics> => {
      const statusBreakdown: Record<UserStatus, number> = {
        ACTIVE: 0,
        DEPROVISIONED: 0,
        SUSPENDED: 0,
        STAGED: 0,
        PROVISIONED: 0,
        RECOVERY: 0,
        LOCKED_OUT: 0,
        PASSWORD_EXPIRED: 0,
      };

      console.log('[useGroupHealth] Processing', members.length, 'members for status breakdown');
      members.forEach((user, index) => {
        if (index < 5) {
          console.log(`[useGroupHealth] User ${index}:`, {
            id: user.id,
            status: user.status,
            statusType: typeof user.status,
          });
        }
        if (statusBreakdown[user.status] !== undefined) {
          statusBreakdown[user.status]++;
        } else {
          console.warn('[useGroupHealth] Unknown status:', user.status, 'for user:', user.id);
        }
      });

      console.log('[useGroupHealth] Final status breakdown:', statusBreakdown);

      let ruleBased = 0;
      let direct = 0;

      members.forEach((user) => {
        if (user.managedBy?.rules && user.managedBy.rules.length > 0) {
          ruleBased++;
        } else {
          direct++;
        }
      });

      console.log('[useGroupHealth] Final membership counts (Authentic Source):', {
        direct,
        ruleBased,
        total: members.length,
      });

      const membershipSources = {
        direct,
        ruleBased,
      };

      const inactiveCount =
        statusBreakdown.DEPROVISIONED + statusBreakdown.SUSPENDED + statusBreakdown.LOCKED_OUT;
      const inactivePercentage = members.length > 0 ? (inactiveCount / members.length) * 100 : 0;

      const riskFactors: string[] = [];
      let riskScore = 0;

      if (inactivePercentage > 20) {
        riskScore += 40;
        riskFactors.push(`${inactivePercentage.toFixed(1)}% inactive users`);
      } else if (inactivePercentage > 10) {
        riskScore += 20;
        riskFactors.push(`${inactivePercentage.toFixed(1)}% inactive users`);
      } else if (inactivePercentage > 5) {
        riskScore += 10;
        riskFactors.push(`${inactivePercentage.toFixed(1)}% inactive users`);
      }

      if (members.length > 500) {
        riskScore += 15;
        riskFactors.push(`Large group size (${members.length} members)`);
      }

      if (statusBreakdown.SUSPENDED > 0) {
        riskScore += 15;
        riskFactors.push(`${statusBreakdown.SUSPENDED} suspended users`);
      }

      if (statusBreakdown.LOCKED_OUT > 0) {
        riskScore += 10;
        riskFactors.push(`${statusBreakdown.LOCKED_OUT} locked out users`);
      }

      if (statusBreakdown.PASSWORD_EXPIRED > 0) {
        riskScore += 10;
        riskFactors.push(`${statusBreakdown.PASSWORD_EXPIRED} users with expired passwords`);
      }

      riskScore = Math.min(100, riskScore);

      if (riskFactors.length === 0) {
        riskFactors.push('No issues detected');
      }

      const lastCleanup = null;
      const daysSinceCleanup = null;

      const trends = {
        membershipChange30d: 0,
        newUsersThisWeek: 0,
      };

      return {
        totalUsers: members.length,
        statusBreakdown,
        membershipSources,
        riskScore,
        riskFactors,
        lastCleanup,
        daysSinceCleanup,
        trends,
      };
    },
    [],
  );

  const loadMetrics = useCallback(async () => {
    if (!groupId || !targetTabId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cached = await chrome.storage.local.get(CACHE_KEY);
      const cacheData = cached[CACHE_KEY] as DashboardCache | undefined;

      if (
        cacheData &&
        cacheData.groupId === groupId &&
        Date.now() - cacheData.timestamp < CACHE_DURATION
      ) {
        console.log('[useGroupHealth] Cache hit - fetching fresh members for pie chart');
        setMetrics(cacheData.metrics);

        const members = await fetchGroupMembers();
        setMembers(members);

        setIsLoading(false);
        return;
      }

      console.log('[useGroupHealth] Fetching fresh metrics');

      const [members, activeRules] = await Promise.all([fetchGroupMembers(), fetchGroupRules()]);

      const newMetrics = await calculateMetrics(members, activeRules);

      await chrome.storage.local.set({
        [CACHE_KEY]: {
          metrics: newMetrics,
          timestamp: Date.now(),
          groupId,
        } as DashboardCache,
      });

      setMembers(members);
      setMetrics(newMetrics);
    } catch (err) {
      console.error('[useGroupHealth] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load health metrics');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, targetTabId, fetchGroupMembers, fetchGroupRules, calculateMetrics]);

  const refresh = useCallback(async () => {
    await chrome.storage.local.remove(CACHE_KEY);
    await loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    members,
    isLoading,
    error,
    refresh,
  };
}
