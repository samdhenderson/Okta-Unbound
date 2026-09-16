import { useCallback, useMemo } from 'react';
import type { OktaUser } from '../../../../shared/types';
import { userCohortBasket } from '../../../selection/cohortBasket';
import { countsByKind, type SelectionBasket } from '../../../selection/selectionStore';
import { useSelection } from '../../../selection/useSelection';
import { setUserProfileAttribute } from '../../../selection/verbs/definitions/profile';
import type { VerbApi, VerbContext } from '../../../selection/verbs/types';
import { useVerbRun, type VerbRun } from '../../selection/run/useVerbRun';

export interface UseGroupCohortVerbOptions {
  cohort: OktaUser[];
  api: VerbApi;
  oktaOrigin?: string | null;
  enabled: boolean;
}

export interface GroupCohortVerb {
  run: VerbRun;
  basket: SelectionBasket;
  count: number | undefined;
  start: () => void;
}

export function useGroupCohortVerb(options: UseGroupCohortVerbOptions): GroupCohortVerb {
  const { cohort, api, oktaOrigin, enabled } = options;

  const { addMany } = useSelection();

  const basket = useMemo(() => userCohortBasket(cohort), [cohort]);
  const counts = useMemo(() => countsByKind(basket), [basket]);

  const makeContext = useCallback(
    (
      report: (message: string) => void,
      values: Record<string, string>,
      memo: Map<string, unknown>,
    ): VerbContext => ({
      basket,
      counts,
      addMany,
      report,
      api,
      oktaOrigin: oktaOrigin ?? null,
      values,
      memo,
    }),
    [basket, counts, addMany, api, oktaOrigin],
  );

  const run = useVerbRun({ makeContext });

  const { start: startRun } = run;
  const start = useCallback(() => startRun(setUserProfileAttribute), [startRun]);

  return { run, basket, count: enabled ? cohort.length : undefined, start };
}
