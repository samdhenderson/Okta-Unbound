import React, { useState } from 'react';
import {
  Button,
  DetailSection,
  EmptyState,
  IconButton,
  ListRow,
  Modal,
  typeIcon,
  typeNounForms,
} from '../../shared';
import Icon from '../../shared/Icon';
import { pluralNoun } from '../../../../shared/utils/plural';
import { costSentence } from '../../../selection/verbs/costSentence';
import { availableVerbs } from '../../../selection/verbs/registry';
import type { BasketVerb } from '../../../selection/verbs/types';
import type { SelectionBasket, SelectionKind } from '../../../selection/selectionStore';

const KIND_ORDER: readonly SelectionKind[] = ['user', 'group', 'app', 'rule', 'policy'];

export interface SelectionPaneProps {
  basket: SelectionBasket;
  counts: Partial<Record<SelectionKind, number>>;
  query: string;
  onRemove: (ref: { kind: SelectionKind; id: string }) => void;
  onClearKind: (kind: SelectionKind) => void;
  converters?: readonly BasketVerb[];
  onRunConverter?: (verb: BasketVerb) => void;
}

const SelectionPane: React.FC<SelectionPaneProps> = ({
  basket,
  counts,
  query,
  onRemove,
  onClearKind,
  converters = [],
  onRunConverter,
}) => {
  const [pendingClearKind, setPendingClearKind] = useState<SelectionKind | null>(null);

  const needle = query.trim().toLowerCase();
  const matches = (name: string) => needle.length === 0 || name.toLowerCase().includes(needle);

  const nonEmptyKinds = KIND_ORDER.filter((kind) => (counts[kind] ?? 0) > 0);
  const pendingCount = pendingClearKind ? (counts[pendingClearKind] ?? 0) : 0;
  const pendingNoun = pendingClearKind
    ? pluralNoun(pendingCount, typeNounForms[pendingClearKind])
    : '';

  const total = nonEmptyKinds.reduce((sum, kind) => sum + (counts[kind] ?? 0), 0);

  const runnableConverters = onRunConverter ? availableVerbs(converters, counts, basket) : [];

  return (
    <div role="tabpanel" aria-label="Selection" className="space-y-(--sp-rung)">
      {total === 0 ? (
        <EmptyState
          icon="clipboard-check"
          title="Nothing selected"
          description="Tick rows on any rung — a group's member list, the Users tab, wherever you're working — and they land here. The running count shows up beside Refresh at the top of the panel."
        />
      ) : (
        <>
          {runnableConverters.length > 0 && onRunConverter && (
            <DetailSection title="Shape the selection">
              <div className="space-y-(--sp-inline)">
                {runnableConverters.map((verb) => (
                  <ListRow key={verb.id} density="compact">
                    <div className="flex items-start justify-between gap-(--sp-field)">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-neutral-900">
                          {verb.title}
                        </span>
                        <span className="block text-xs text-neutral-600">
                          {costSentence(verb.cost(basket))}
                        </span>
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        ariaLabel={verb.title}
                        onClick={() => onRunConverter(verb)}
                      >
                        {verb.label}
                      </Button>
                    </div>
                  </ListRow>
                ))}
              </div>
            </DetailSection>
          )}

          {nonEmptyKinds.map((kind) => {
            const count = counts[kind] ?? 0;
            const forms = typeNounForms[kind];
            const entries = basket.picked.filter((ref) => ref.kind === kind);
            const shown = entries.filter((ref) => matches(ref.name));

            return (
              <DetailSection
                key={kind}
                title={`${count.toLocaleString()} ${pluralNoun(count, forms)} selected`}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash"
                    ariaLabel={`Clear ${forms.other}`}
                    onClick={() => setPendingClearKind(kind)}
                  >
                    Clear
                  </Button>
                }
              >
                {needle.length > 0 && (
                  <p className="mb-(--sp-inline) text-xs text-neutral-600">
                    {shown.length === 0
                      ? `No ${forms.other} match "${query.trim()}".`
                      : `Showing ${shown.length.toLocaleString()} of ${count.toLocaleString()}.`}
                  </p>
                )}
                <div className="space-y-(--sp-inline)">
                  {shown.map((ref) => (
                    <ListRow key={ref.id} density="compact">
                      <div className="flex items-center justify-between gap-(--sp-inline)">
                        <span className="flex min-w-0 items-center gap-(--sp-inline)">
                          <Icon
                            type={typeIcon[kind]}
                            size="sm"
                            className="shrink-0 text-neutral-400"
                          />
                          <span className="truncate text-sm font-semibold text-neutral-900">
                            {ref.name}
                          </span>
                        </span>
                        <IconButton
                          label={`Remove ${ref.name} from the selection`}
                          variant="ghost"
                          onClick={() => onRemove({ kind: ref.kind, id: ref.id })}
                        >
                          <Icon type="close" size="sm" />
                        </IconButton>
                      </div>
                    </ListRow>
                  ))}
                </div>
              </DetailSection>
            );
          })}
        </>
      )}

      <Modal
        isOpen={pendingClearKind !== null}
        onClose={() => setPendingClearKind(null)}
        title={pendingClearKind ? `Clear selected ${pendingNoun}?` : ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPendingClearKind(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (pendingClearKind) onClearKind(pendingClearKind);
                setPendingClearKind(null);
              }}
            >
              Clear
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-700">
          Clear {pendingCount.toLocaleString()} selected {pendingNoun}? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default SelectionPane;
