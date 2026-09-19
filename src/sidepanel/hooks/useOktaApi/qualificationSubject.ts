import type { CoreApi } from './core';
import type { OktaGroup, OktaUser } from '../../../shared/types';
import { getUserGroupsRequest } from '../getUserGroupsRequest';
import {
  fanOutEstimate,
  openingWalkEstimate,
  refinedWalkEstimate,
} from '../../../shared/scheduler/planEstimate';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('qualificationSubject');

export type QualificationSubjectFailure = 'user-not-found' | 'groups-failed';

export type QualificationSubjectResult =
  | { readonly ok: true; readonly user: OktaUser; readonly groups: readonly OktaGroup[] }
  | { readonly ok: false; readonly reason: QualificationSubjectFailure };

type GetUserRaw = (
  userId: string,
  options?: { planId?: string; reason?: string },
) => Promise<OktaUser | null>;

const USER_ENDPOINT = '/api/v1/users/{id}';
const GROUPS_ENDPOINT = '/api/v1/users/{id}/groups';

export function createQualificationSubjectOperations(coreApi: CoreApi, getUserRaw: GetUserRaw) {
  const loadQualificationSubject = async (userId: string): Promise<QualificationSubjectResult> =>
    coreApi.withPlan(
      'Evaluate user against rules',
      [
        { endpoint: USER_ENDPOINT, estimate: fanOutEstimate(1) },
        { endpoint: GROUPS_ENDPOINT, estimate: openingWalkEstimate() },
      ],
      async (plan) => {
        const user = await getUserRaw(userId, {
          planId: plan.planId,
          reason: 'Load user for rule check',
        });
        if (!user) {
          log.warn('Subject user unavailable', { userId });
          return { ok: false, reason: 'user-not-found' };
        }

        const groups = await getUserGroupsRequest(coreApi.makeApiRequest, userId, {
          planId: plan.planId,
          onPage: (pagesFetched, hasMore) =>
            plan.refine(GROUPS_ENDPOINT, refinedWalkEstimate(pagesFetched, hasMore)),
        });
        if (!groups.success || !groups.data) {
          log.warn('Subject groups unavailable', { userId });
          return { ok: false, reason: 'groups-failed' };
        }

        log.debug('Subject loaded', { userId, groupCount: groups.data.length });
        return { ok: true, user, groups: groups.data.map((membership) => membership.group) };
      },
    );

  return { loadQualificationSubject };
}
