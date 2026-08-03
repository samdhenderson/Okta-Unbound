import { useOktaApi } from './useOktaApi';
import { useEntityQuery } from '../cache/useEntityQuery';
import type { OktaAppListItem } from '@/shared/schemas/okta';
import type { AppAssignmentCounts } from './useOktaApi/appOperations';

export interface AppAssignmentSummary {
  counts: AppAssignmentCounts | null;
  accessPolicyId: string | null;
}

export interface AppOverviewData {
  app: OktaAppListItem | null;
  isLoadingApp: boolean;
  counts: AppAssignmentCounts | null;
  accessPolicyId: string | null;
  isLoadingAssignments: boolean;
}

export function useAppOverviewData(appId: string, targetTabId?: number | null): AppOverviewData {
  const { getAppById, getAppAssignmentCounts, getAppAccessPolicyId } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });

  const enabled = Boolean(appId && targetTabId);

  const { data: app, isLoading: isLoadingApp } = useEntityQuery<OktaAppListItem | null>(
    ['appDetail', appId],
    () => getAppById(appId),
    { enabled },
  );

  const { data: assignments, isLoading: isLoadingAssignments } =
    useEntityQuery<AppAssignmentSummary>(
      ['appAssignments', appId],
      async () => {
        const [counts, accessPolicyId] = await Promise.all([
          getAppAssignmentCounts(appId),
          getAppAccessPolicyId(appId),
        ]);
        return { counts, accessPolicyId };
      },
      { enabled },
    );

  return {
    app: app ?? null,
    isLoadingApp,
    counts: assignments?.counts ?? null,
    accessPolicyId: assignments?.accessPolicyId ?? null,
    isLoadingAssignments,
  };
}
