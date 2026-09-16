import React from 'react';
import VerbList from './VerbList';
import type { BasketVerb } from '../../../selection/verbs/types';
import type { SelectionBasket, SelectionKind } from '../../../selection/selectionStore';

export interface ActionsPaneProps {
  verbs: readonly BasketVerb[];
  basket: SelectionBasket;
  counts: Partial<Record<SelectionKind, number>>;
  onRun: (verb: BasketVerb) => void;
}

const ActionsPane: React.FC<ActionsPaneProps> = ({ verbs, basket, counts, onRun }) => (
  <div role="tabpanel" aria-label="Actions">
    <VerbList
      verbs={verbs}
      basket={basket}
      counts={counts}
      onRun={onRun}
      emptyIcon="bolt"
      emptyTitle="No actions yet"
      emptyDescription="Verbs that spend a selection run here — membership changes, rule switches, profile edits. None are wired yet, so there is nothing to run. Apps and policies have none at all: this panel only reads them."
    />
  </div>
);

export default ActionsPane;
