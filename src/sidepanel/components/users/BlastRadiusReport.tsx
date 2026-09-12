import React, { useMemo, useState } from 'react';
import { AlertMessage, EmptyState, Eyebrow, FilterPill, type GroupNameResolver } from '../shared';
import BlastRadiusGroupRow from './BlastRadiusGroupRow';
import { cascadeLinesByGroupId, type CascadeLine } from './cascadeLines';
import type { CascadeGroupBlock } from './BlastRadiusCascade';
import BlastRadiusRuleRow from './BlastRadiusRuleRow';
import type {
  BlastRadiusReport as BlastRadiusReportData,
  GroupEffect,
  RuleEffect,
} from '../../../shared/membership/blastRadiusTypes';

export interface BlastRadiusReportProps {
  report: BlastRadiusReportData;
  className?: string;
  resolveGroupName?: GroupNameResolver;
}

type ReportView = 'groups' | 'rules';

const AFFECTED_TRANSITIONS = new Set(['starts-matching', 'stops-matching', 'undetermined']);

const GroupSection: React.FC<{
  title: string;
  effects: readonly GroupEffect[];
  cascadeLines: ReadonlyMap<string, readonly CascadeLine[]>;
  openRowIds: ReadonlySet<string>;
  onToggle: (rowId: string) => void;
}> = ({ title, effects, cascadeLines, openRowIds, onToggle }) =>
  effects.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <Eyebrow as="h3">{title}</Eyebrow>
      <ul className="space-y-(--sp-rung)">
        {effects.map((effect) => (
          <BlastRadiusGroupRow
            key={effect.groupId}
            effect={effect}
            cascade={cascadeLines.get(effect.groupId)}
            expanded={openRowIds.has(effect.groupId)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  );

const RuleSection: React.FC<{
  title: string;
  effects: readonly RuleEffect[];
  resolveGroupName?: GroupNameResolver;
  cascadeLines: ReadonlyMap<string, readonly CascadeLine[]>;
  openRowIds: ReadonlySet<string>;
  onToggle: (rowId: string) => void;
}> = ({ title, effects, resolveGroupName, cascadeLines, openRowIds, onToggle }) =>
  effects.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <Eyebrow as="h3">{title}</Eyebrow>
      <ul className="space-y-(--sp-rung)">
        {effects.map((effect) => (
          <BlastRadiusRuleRow
            key={effect.ruleId}
            effect={effect}
            resolveGroupName={resolveGroupName}
            cascadeBlocks={blocksFor(effect, cascadeLines)}
            expanded={openRowIds.has(effect.ruleId)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  );

function blocksFor(
  effect: RuleEffect,
  cascadeLines: ReadonlyMap<string, readonly CascadeLine[]>,
): CascadeGroupBlock[] {
  return effect.targetGroupIds
    .map((groupId, index) => ({
      groupId,
      groupName: effect.targetGroupNames[index] ?? groupId,
      lines: cascadeLines.get(groupId),
    }))
    .filter((block): block is CascadeGroupBlock => block.lines !== undefined);
}

const BlastRadiusReport: React.FC<BlastRadiusReportProps> = ({
  report,
  className = '',
  resolveGroupName,
}) => {
  const [view, setView] = useState<ReportView>('groups');
  const [openRowIds, setOpenRowIds] = useState<ReadonlySet<string>>(() => new Set());
  const toggleRow = React.useCallback((rowId: string) => {
    setOpenRowIds((open) => {
      const next = new Set(open);
      if (!next.delete(rowId)) next.add(rowId);
      return next;
    });
  }, []);
  const cascadeLines = useMemo(() => cascadeLinesByGroupId(report), [report]);

  const { added, removed, notPredicted } = useMemo(
    () => ({
      added: report.groups.filter((effect) => effect.kind === 'added'),
      removed: report.groups.filter((effect) => effect.kind === 'removed'),
      notPredicted: report.groups.filter((effect) => effect.kind === 'not-predicted'),
    }),
    [report.groups],
  );

  const { starts, stops, undetermined, unaffectedCount } = useMemo(() => {
    const affected = report.rules.filter((effect) => AFFECTED_TRANSITIONS.has(effect.transition));
    return {
      starts: affected.filter((effect) => effect.transition === 'starts-matching'),
      stops: affected.filter((effect) => effect.transition === 'stops-matching'),
      undetermined: affected.filter((effect) => effect.transition === 'undetermined'),
      unaffectedCount: report.rules.length - affected.length,
    };
  }, [report.rules]);

  if (report.status === 'not-computed') return null;

  if (report.status === 'unavailable') {
    return (
      <div className={className}>
        <AlertMessage
          message={{
            type: 'info',
            text: "This org's group rules could not be loaded, so no prediction can be made about this edit. That is not the same as predicting no change.",
          }}
        />
      </div>
    );
  }

  const groupCount = report.groups.length;
  const ruleCount = starts.length + stops.length + undetermined.length;

  if (groupCount === 0 && ruleCount === 0) {
    return (
      <div className={`flex flex-col gap-(--sp-rung) ${className}`}>
        <EmptyState
          icon="check"
          title="No group changes predicted"
          description="No group rule's verdict about this user moves under this edit, so no membership is predicted to change."
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-(--sp-rung) ${className}`}>
      <div
        className="flex flex-wrap items-center gap-(--sp-inline)"
        role="group"
        aria-label="Report view"
      >
        <FilterPill active={view === 'groups'} onClick={() => setView('groups')}>
          Groups {groupCount}
        </FilterPill>
        <FilterPill active={view === 'rules'} onClick={() => setView('rules')}>
          Rules {ruleCount}
        </FilterPill>
      </div>

      {view === 'groups' ? (
        <div className="flex flex-col gap-(--sp-rung)">
          {groupCount === 0 ? (
            <p className="text-sm text-neutral-600">
              No membership is predicted to change, even though rules below move.
            </p>
          ) : (
            <>
              <GroupSection
                title="Added"
                effects={added}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
              <GroupSection
                title="Removed"
                effects={removed}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
              <GroupSection
                title="Not predicted"
                effects={notPredicted}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-(--sp-rung)">
          {ruleCount === 0 ? (
            <p className="text-sm text-neutral-600">
              No rule&rsquo;s verdict about this user moves.
            </p>
          ) : (
            <>
              <RuleSection
                title="Starts matching"
                effects={starts}
                resolveGroupName={resolveGroupName}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
              <RuleSection
                title="Stops matching"
                effects={stops}
                resolveGroupName={resolveGroupName}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
              <RuleSection
                title="Could not be evaluated"
                effects={undetermined}
                resolveGroupName={resolveGroupName}
                cascadeLines={cascadeLines}
                openRowIds={openRowIds}
                onToggle={toggleRow}
              />
            </>
          )}
          {unaffectedCount > 0 && (
            <p className="text-xs text-neutral-500">
              {unaffectedCount === 1
                ? 'And 1 rule is unaffected by this edit.'
                : `And ${unaffectedCount} rules are unaffected by this edit.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BlastRadiusReport;
