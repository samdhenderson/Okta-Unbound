import React, { useMemo, useState } from 'react';
import { AlertMessage, EmptyState, Eyebrow, FilterPill } from '../shared';
import BlastRadiusGroupRow from './BlastRadiusGroupRow';
import BlastRadiusRuleRow from './BlastRadiusRuleRow';
import type {
  BlastRadiusReport as BlastRadiusReportData,
  GroupEffect,
  RuleEffect,
} from '../../../shared/membership/blastRadiusTypes';

export interface BlastRadiusReportProps {
  report: BlastRadiusReportData;
  className?: string;
}

type ReportView = 'groups' | 'rules';

const AFFECTED_TRANSITIONS = new Set(['starts-matching', 'stops-matching', 'undetermined']);

const GroupSection: React.FC<{ title: string; effects: readonly GroupEffect[] }> = ({
  title,
  effects,
}) =>
  effects.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <Eyebrow as="h3">{title}</Eyebrow>
      <ul className="space-y-(--sp-rung)">
        {effects.map((effect) => (
          <BlastRadiusGroupRow key={effect.groupId} effect={effect} />
        ))}
      </ul>
    </section>
  );

const RuleSection: React.FC<{ title: string; effects: readonly RuleEffect[] }> = ({
  title,
  effects,
}) =>
  effects.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <Eyebrow as="h3">{title}</Eyebrow>
      <ul className="space-y-(--sp-rung)">
        {effects.map((effect) => (
          <BlastRadiusRuleRow key={effect.ruleId} effect={effect} />
        ))}
      </ul>
    </section>
  );

const Footnote: React.FC = () => (
  <p className="text-xs text-neutral-500">
    Predictions are likely, not certain: this panel cannot see a rule&rsquo;s exclusion list,
    evaluates conditions with its own implementation of Okta&rsquo;s expression language, and Okta
    applies rules asynchronously.
  </p>
);

const BlastRadiusReport: React.FC<BlastRadiusReportProps> = ({ report, className = '' }) => {
  const [view, setView] = useState<ReportView>('groups');

  const { added, removed, notPredicted } = useMemo(
    () => ({
      added: report.groups.filter((effect) => effect.kind === 'likely-added'),
      removed: report.groups.filter((effect) => effect.kind === 'likely-removed'),
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
        <Footnote />
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
              <GroupSection title="Likely added" effects={added} />
              <GroupSection title="Likely removed" effects={removed} />
              <GroupSection title="Not predicted" effects={notPredicted} />
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
              <RuleSection title="Starts matching" effects={starts} />
              <RuleSection title="Stops matching" effects={stops} />
              <RuleSection title="Could not be evaluated" effects={undetermined} />
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

      {report.secondOrderPossible && (
        <p className="text-xs text-neutral-600" title={report.secondOrderRuleNames.join(', ')}>
          {report.secondOrderRuleNames.length === 1
            ? '1 rule tests membership of a group this change would affect.'
            : `${report.secondOrderRuleNames.length} rules test membership of a group this change would affect.`}{' '}
          What they do next is not predicted here.
        </p>
      )}

      <Footnote />
    </div>
  );
};

export default BlastRadiusReport;
