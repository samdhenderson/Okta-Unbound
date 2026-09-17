import React, { useMemo, useState } from 'react';
import { EmptyState, Eyebrow } from '../../shared';
import ComparisonAttributeRow from './ComparisonAttributeRow';
import ComparisonAttributesToolbar, { type AttributeFilter } from './ComparisonAttributesToolbar';
import { UNCATEGORIZED, UNCATEGORIZED_LABEL } from '../profileAttributeBlocks';
import type { AttributeParityRow, AttributeVerdict } from './attributeParity';
import type { ProfileRuleReads } from '../profileRuleReads';
import type { ComparisonEditSide } from '../../../hooks/useComparisonProfileEdit';
import type { ProfileDisplayConfig } from '../../../../shared/storage/profileDisplayStore';

export interface ComparisonAttributesTabProps {
  contextName: string;
  comparedName: string;
  rows: readonly AttributeParityRow[];
  hiddenRows: readonly AttributeParityRow[];
  hiddenDifferences: number;
  config: ProfileDisplayConfig;
  ruleReads: ProfileRuleReads | undefined;
  contextEdit?: ComparisonEditSide;
  comparedEdit?: ComparisonEditSide;
}

interface AttributeBlock {
  key: string;
  name: string;
  rows: AttributeParityRow[];
}

const isDifference = (verdict: AttributeVerdict): boolean =>
  verdict === 'differs' || verdict === 'onlyContext' || verdict === 'onlyCompared';

function buildBlocks(
  rows: readonly AttributeParityRow[],
  categories: ProfileDisplayConfig['categories'],
): AttributeBlock[] {
  const byKey = new Map<string, AttributeParityRow[]>();
  for (const row of rows) {
    const bucket = byKey.get(row.categoryKey);
    if (bucket) bucket.push(row);
    else byKey.set(row.categoryKey, [row]);
  }

  const blocks: AttributeBlock[] = [];
  for (const category of categories) {
    const held = byKey.get(category.key);
    if (held && held.length > 0) blocks.push({ ...category, rows: held });
  }
  const uncategorized = byKey.get(UNCATEGORIZED);
  if (uncategorized && uncategorized.length > 0) {
    blocks.push({ key: UNCATEGORIZED, name: UNCATEGORIZED_LABEL, rows: uncategorized });
  }
  return blocks;
}

const ComparisonAttributesTab: React.FC<ComparisonAttributesTabProps> = ({
  contextName,
  comparedName,
  rows,
  hiddenRows,
  hiddenDifferences,
  config,
  ruleReads,
  contextEdit,
  comparedEdit,
}) => {
  const [filter, setFilter] = useState<AttributeFilter>('differences');
  const [query, setQuery] = useState('');
  const [revealHidden, setRevealHidden] = useState(false);

  const contextCells = contextEdit?.cells;
  const comparedCells = comparedEdit?.cells;

  const dirtyNames = useMemo(() => {
    const names = new Set<string>();
    for (const cells of [contextCells, comparedCells]) {
      if (cells === undefined) continue;
      for (const cell of Object.values(cells)) if (cell.dirty) names.add(cell.name);
    }
    return names;
  }, [contextCells, comparedCells]);

  const listed = useMemo(
    () =>
      revealHidden
        ? [...rows, ...hiddenRows]
        : [...rows, ...hiddenRows.filter((row) => dirtyNames.has(row.name))],
    [rows, hiddenRows, revealHidden, dirtyNames],
  );

  const differenceCount = listed.filter((row) => isDifference(row.verdict)).length;
  const sharedCount = listed.length - differenceCount;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listed.filter((row) => {
      if (filter === 'differences' && !isDifference(row.verdict)) return false;
      if (filter === 'shared' && isDifference(row.verdict)) return false;
      if (needle === '') return true;
      return (
        row.label.toLowerCase().includes(needle) ||
        row.name.toLowerCase().includes(needle) ||
        row.contextValue.toLowerCase().includes(needle) ||
        row.comparedValue.toLowerCase().includes(needle)
      );
    });
  }, [listed, filter, query]);

  const blocks = useMemo(
    () => buildBlocks(visible, config.categories),
    [visible, config.categories],
  );

  return (
    <div className="flex min-h-[calc(100vh-22rem)] flex-1 flex-col gap-2">
      <ComparisonAttributesToolbar
        filter={filter}
        onFilterChange={setFilter}
        differenceCount={differenceCount}
        sharedCount={sharedCount}
        totalCount={listed.length}
        query={query}
        onQueryChange={setQuery}
        hiddenDifferences={hiddenDifferences}
        revealHidden={revealHidden}
        onToggleHidden={() => setRevealHidden((shown) => !shown)}
        contextEdit={contextEdit}
        comparedEdit={comparedEdit}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-white">
        {blocks.length === 0 ? (
          <EmptyState
            icon="list"
            title={listed.length === 0 ? 'No attributes to compare' : 'No attributes match'}
            description={
              listed.length === 0
                ? 'Neither user has any profile attributes this org defines.'
                : 'No attribute matches this filter. Try another term, or switch to All.'
            }
          />
        ) : (
          <div className="scrollable-list min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
            {blocks.map((block) => (
              <section key={block.key}>
                <Eyebrow as="div" className="px-(--sp-row-x) pt-3 pb-1">
                  {block.name}
                </Eyebrow>
                <ul aria-label={block.name} className="divide-y divide-neutral-100">
                  {block.rows.map((row) => (
                    <ComparisonAttributeRow
                      key={row.key}
                      row={row}
                      contextName={contextName}
                      comparedName={comparedName}
                      showApiNames={config.showApiNames}
                      readers={config.showRuleChips ? ruleReads?.[row.name] : undefined}
                      contextCell={contextCells?.[row.name]}
                      comparedCell={comparedCells?.[row.name]}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonAttributesTab;
