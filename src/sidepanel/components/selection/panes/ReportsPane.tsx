import React from 'react';
import VerbList from './VerbList';
import type { BasketVerb } from '../../../selection/verbs/types';
import type { SelectionBasket, SelectionKind } from '../../../selection/selectionStore';

export interface ReportsPaneProps {
  verbs: readonly BasketVerb[];
  basket: SelectionBasket;
  counts: Partial<Record<SelectionKind, number>>;
  onRun: (verb: BasketVerb) => void;
}

const ReportsPane: React.FC<ReportsPaneProps> = ({ verbs, basket, counts, onRun }) => (
  <div role="tabpanel" aria-label="Reports">
    <VerbList
      verbs={verbs}
      basket={basket}
      counts={counts}
      onRun={onRun}
      emptyIcon="chart"
      emptyTitle="No reports yet"
      emptyDescription="Read-only answers about a selection are reported here — overlap between groups, MFA enrolment, what a rule would change. None are wired yet, so there is nothing to ask."
    />
  </div>
);

export default ReportsPane;
