import React, { useState } from 'react';
import Button from '../shared/Button';
import type { MergeableRuleGroup } from '../../../shared/rules/consolidation';

interface RulesMergeBannerProps {
  clusters: MergeableRuleGroup[];
  onMerge: (cluster: MergeableRuleGroup) => void;
  onFocusRule?: (ruleId: string) => void;
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const active = status === 'ACTIVE';
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${
        active
          ? 'bg-success-light text-success-text border-success-light'
          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
};

const MergeClusterRow: React.FC<{
  cluster: MergeableRuleGroup;
  onMerge: (cluster: MergeableRuleGroup) => void;
  onFocusRule?: (ruleId: string) => void;
}> = ({ cluster, onMerge, onFocusRule }) => {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-md border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="press-subtle flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-(--dur-instant) ${
              open ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="truncate text-sm text-neutral-900">
            {cluster.rules.length} rules → {cluster.unionGroupIds.length} target group
            {cluster.unionGroupIds.length === 1 ? '' : 's'}
          </span>
        </button>
        <Button variant="secondary" size="sm" icon="link" onClick={() => onMerge(cluster)}>
          Review &amp; merge
        </Button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-neutral-100 px-3 py-2.5">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              Shared condition
            </div>
            <code className="block break-words rounded bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-700">
              {cluster.expression}
            </code>
          </div>
          <ul className="space-y-1">
            {cluster.rules.map((rule) => {
              const targetCount = rule.actions?.assignUserToGroups?.groupIds?.length ?? 0;
              return (
                <li
                  key={rule.id}
                  className="flex items-center justify-between gap-2 rounded border border-neutral-100 px-2 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-(--sp-inline)">
                    <StatusPill status={rule.status} />
                    <span className="truncate text-sm text-neutral-800">{rule.name}</span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {targetCount} group{targetCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  {onFocusRule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFocusRule(rule.id)}
                      title="Scroll to this rule's card"
                    >
                      View
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-neutral-400">
            Merge creates one rule with the union of these target groups and retires the originals —
            no change to who is matched. You&apos;ll see a full preview before anything is written.
          </p>
        </div>
      )}
    </li>
  );
};

const RulesMergeBanner: React.FC<RulesMergeBannerProps> = ({ clusters, onMerge, onFocusRule }) => {
  const [open, setOpen] = useState(false);
  if (clusters.length === 0) return null;

  return (
    <div className="rounded-md border border-primary-highlight bg-primary-light">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="press-subtle flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <svg
          className={`h-4 w-4 shrink-0 text-primary-text transition-transform duration-(--dur-instant) ${
            open ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-primary-text">
            {clusters.length} set{clusters.length === 1 ? '' : 's'} of duplicate-condition rules
          </h3>
          {!open && (
            <p className="truncate text-xs text-neutral-600">
              Rules sharing an identical condition — expand to review and merge.
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-md border border-primary-highlight bg-white px-2 py-0.5 text-xs font-medium text-primary-text">
          {open ? 'Hide' : 'Review'}
        </span>
      </button>

      {open && (
        <div className="space-y-(--sp-rung) px-(--sp-card) pb-(--sp-card)">
          <p className="text-xs text-neutral-600">
            Each set below shares an identical condition. Merging one folds its rules into a single
            rule carrying the union of their target groups — no change to who is matched.
          </p>
          <ul className="space-y-(--sp-rung)">
            {clusters.map((cluster) => (
              <MergeClusterRow
                key={cluster.expression}
                cluster={cluster}
                onMerge={onMerge}
                onFocusRule={onFocusRule}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RulesMergeBanner;
