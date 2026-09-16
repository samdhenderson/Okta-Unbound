import React from 'react';
import { Button, EmptyState, ListRow, typeNounForms } from '../../shared';
import { costSentence } from '../../../selection/verbs/costSentence';
import { availableVerbs, isVerbAvailable, missingKinds } from '../../../selection/verbs/registry';
import type { BasketVerb } from '../../../selection/verbs/types';
import type { SelectionBasket, SelectionKind } from '../../../selection/selectionStore';
import type { IconType } from '../../shared/Icon';

export interface VerbListProps {
  verbs: readonly BasketVerb[];
  basket: SelectionBasket;
  counts: Partial<Record<SelectionKind, number>>;
  onRun: (verb: BasketVerb) => void;
  emptyIcon: IconType;
  emptyTitle: string;
  emptyDescription: string;
}

function namedKinds(kinds: readonly SelectionKind[]): string {
  const nouns = kinds.map((kind) => typeNounForms[kind].other);
  if (nouns.length <= 1) return nouns.join('');
  return `${nouns.slice(0, -1).join(', ')} and ${nouns[nouns.length - 1]}`;
}

const VerbList: React.FC<VerbListProps> = ({
  verbs,
  basket,
  counts,
  onRun,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}) => {
  if (verbs.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  const runnable = availableVerbs(verbs, counts, basket);

  if (runnable.length === 0) {
    const waiting = [...new Set(verbs.flatMap((verb) => missingKinds(verb, counts)))];
    const conditions = [
      ...new Set(
        verbs
          .filter(
            (verb) =>
              missingKinds(verb, counts).length === 0 && !isVerbAvailable(verb, counts, basket),
          )
          .map((verb) => verb.unavailableReason)
          .filter((reason): reason is string => reason !== undefined),
      ),
    ];

    const sentences = [
      waiting.length > 0 ? `Tick some ${namedKinds(waiting)} and these appear.` : null,
      ...conditions,
    ].filter((sentence): sentence is string => sentence !== null);

    return (
      <EmptyState
        icon={emptyIcon}
        title="Nothing here applies yet"
        description={sentences.join(' ')}
      />
    );
  }

  return (
    <div className="space-y-(--sp-inline)">
      {runnable.map((verb) => {
        const cost = verb.cost(basket);
        return (
          <ListRow key={verb.id}>
            <div className="flex items-start justify-between gap-(--sp-field)">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-900">{verb.title}</span>
                <span className="block text-xs text-neutral-600">{costSentence(cost)}</span>
              </span>
              <Button
                variant={verb.path === 'write' ? 'danger' : 'secondary'}
                size="sm"
                ariaLabel={verb.title}
                onClick={() => onRun(verb)}
              >
                {verb.label}
              </Button>
            </div>
          </ListRow>
        );
      })}
    </div>
  );
};

export default VerbList;
