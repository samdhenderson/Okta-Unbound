import React from 'react';
import type { AppAssignmentScope } from '../../../../shared/schemas/okta';

export type AppScopeIndicatorState = AppAssignmentScope | 'unknown' | 'notCompared';

const baseClasses = 'shrink-0 whitespace-nowrap text-xs';

const chipClasses =
  'rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700';

const nonAnswerClasses = 'italic text-neutral-400';

const stateStyles: Record<
  AppScopeIndicatorState,
  { label: string; description: string; className: string }
> = {
  USER: {
    label: 'Direct',
    description:
      'Okta reports a direct assignment to this app for this user. A group may grant the same app as well — Okta reports only one source per app, so this does not rule out a group path.',
    className: chipClasses,
  },
  GROUP: {
    label: 'Via group',
    description:
      'Okta reports this assignment as coming from a group rather than from a direct assignment. Which group grants it is not shown — naming it costs an extra request per app.',
    className: chipClasses,
  },
  unknown: {
    label: 'Source unknown',
    description:
      'Okta reported no assignment source for this app, so the source is unknown — this is not a way of saying "via group", and not a way of saying "direct".',
    className: nonAnswerClasses,
  },
  notCompared: {
    label: 'Source not compared',
    description:
      "Both users hold this app, but Okta reports an assignment source per user and only the compared user's source is loaded here. Showing it would state one user's source as if it described both.",
    className: nonAnswerClasses,
  },
};

interface AppScopeIndicatorProps {
  state: AppScopeIndicatorState;
}

const AppScopeIndicator: React.FC<AppScopeIndicatorProps> = ({ state }) => {
  const s = stateStyles[state];
  return (
    <span className={`${baseClasses} ${s.className}`} title={s.description}>
      {s.label}
    </span>
  );
};

export default AppScopeIndicator;
