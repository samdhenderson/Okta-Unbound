import React, { useCallback, useMemo, useState } from 'react';
import { PageHeader, Tabs, type TabItem } from '../shared';
import { useSelection } from '../../selection/useSelection';
import { useCollections } from '../../selection/useCollections';
import { useOktaApi } from '../../hooks/useOktaApi';
import { buildVerbRegistry, verbsForPath } from '../../selection/verbs/registry';
import type { VerbContext } from '../../selection/verbs/types';
import type { CollectionRow } from '../../selection/collectionStore';
import SelectionActionBar from './SelectionActionBar';
import SaveCollectionModal, { type SaveScope } from './SaveCollectionModal';
import SelectionPane from './panes/SelectionPane';
import ActionsPane from './panes/ActionsPane';
import ReportsPane from './panes/ReportsPane';
import CollectionsPane from './panes/CollectionsPane';
import VerbRunner from './run/VerbRunner';
import { useVerbRun } from './run/useVerbRun';

type SelectionPaneKey = 'selection' | 'actions' | 'reports' | 'collections';

export interface SelectionTabProps {
  isActive?: boolean;
  oktaOrigin?: string;
  targetTabId?: number | null;
}

const SelectionTab: React.FC<SelectionTabProps> = ({
  isActive = true,
  oktaOrigin,
  targetTabId = null,
}) => {
  const { basket, total, counts, clearKind, clearAll, remove, addMany } = useSelection();
  const {
    collections,
    isReading,
    save,
    rename,
    remove: removeCollection,
  } = useCollections(oktaOrigin);

  const api = useOktaApi({ targetTabId, oktaOrigin });

  const registry = useMemo(() => buildVerbRegistry(), []);
  const converters = useMemo(() => verbsForPath(registry, 'convert'), [registry]);
  const writes = useMemo(() => verbsForPath(registry, 'write'), [registry]);
  const reads = useMemo(() => verbsForPath(registry, 'read'), [registry]);

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

  const [pane, setPane] = useState<SelectionPaneKey>('selection');
  const [saveOpen, setSaveOpen] = useState(false);
  const [query, setQuery] = useState('');

  const existingNames = useMemo(() => collections.map((entry) => entry.name), [collections]);

  const tabs: TabItem[] = [
    { key: 'selection', label: 'Selection', count: total, countDisplay: 'nonzero' },
    { key: 'actions', label: 'Actions' },
    { key: 'reports', label: 'Reports' },
    {
      key: 'collections',
      label: 'Collections',
      count: collections.length,
      countDisplay: 'nonzero',
    },
  ];

  const handleSave = (name: string, scope: SaveScope, rememberNames: boolean) => {
    const picked = scope === 'all' ? basket.picked : basket.picked.filter((r) => r.kind === scope);
    const rows: CollectionRow[] = picked.map((ref) =>
      ref.kind === 'user' && rememberNames
        ? { kind: ref.kind, id: ref.id, name: ref.name }
        : { kind: ref.kind, id: ref.id },
    );
    return save(name, rows);
  };

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="Selection"
        subtitle="Review what you've ticked across the panel, and keep it"
        sticky={isActive}
      />

      <SelectionActionBar
        total={total}
        hasCollections={collections.length > 0}
        query={query}
        onQueryChange={setQuery}
        onSaveCollection={() => setSaveOpen(true)}
        onClearAll={clearAll}
        sticky={isActive}
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter)">
        <Tabs
          tabs={tabs}
          activeKey={pane}
          onChange={(key) => setPane(key as SelectionPaneKey)}
          variant="underline"
          ariaLabel="Selection sections"
        />

        <div className="mt-(--sp-rung)">
          {pane === 'selection' && (
            <SelectionPane
              basket={basket}
              counts={counts}
              query={query}
              onRemove={remove}
              onClearKind={clearKind}
              converters={converters}
              onRunConverter={run.start}
            />
          )}

          {pane === 'actions' && (
            <ActionsPane verbs={writes} basket={basket} counts={counts} onRun={run.start} />
          )}

          {pane === 'reports' && (
            <ReportsPane verbs={reads} basket={basket} counts={counts} onRun={run.start} />
          )}

          {pane === 'collections' && (
            <CollectionsPane
              collections={collections}
              isReading={isReading}
              query={query}
              oktaOrigin={oktaOrigin}
              targetTabId={targetTabId}
              addMany={addMany}
              onDelete={removeCollection}
              onRename={rename}
            />
          )}
        </div>
      </div>

      <VerbRunner run={run} basket={basket} />

      <SaveCollectionModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        counts={counts}
        existingNames={existingNames}
        onSave={handleSave}
      />
    </div>
  );
};

export default SelectionTab;
