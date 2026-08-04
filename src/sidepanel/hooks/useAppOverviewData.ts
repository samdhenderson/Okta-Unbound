import { useOktaApi } from './useOktaApi';
import { useEntityQuery } from '../cache/useEntityQuery';
import { extractAccessPolicyId } from './useOktaApi/policyOperations';
import type { OktaAppListItem } from '@/shared/schemas/okta';
import type { AppAssignmentCounts } from './useOktaApi/appOperations';

export interface AppOverviewData {
  app: OktaAppListItem | null;
  isLoadingApp: boolean;
  counts: AppAssignmentCounts | null;
  accessPolicyId: string | null;
  isLoadingAssignments: boolean;
}

export function useAppOverviewData(appId: string, targetTabId?: number | null): AppOverviewData {
  const { getAppById, getAppAssignmentCounts } = useOktaApi({
    targetTabId: targetTabId ?? null,
  });

  const enabled = Boolean(appId && targetTabId);

  const { data: app, isLoading: isLoadingApp } = useEntityQuery<OktaAppListItem | null>(
    ['appDetail', appId],
    () => getAppById(appId),
    { enabled },
  );

  const { data: counts, isLoading: isLoadingAssignments } =
    useEntityQuery<AppAssignmentCounts | null>(
      ['appAssignmentCounts', appId],
      () => getAppAssignmentCounts(appId),
      { enabled },
    );

  return {
    app: app ?? null,
    isLoadingApp,
    counts: counts ?? null,
    accessPolicyId: extractAccessPolicyId(app?._links),
    isLoadingAssignments,
  };
}
