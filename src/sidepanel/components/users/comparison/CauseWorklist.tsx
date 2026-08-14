import React from 'react';
import Icon, { type IconType } from '../../overview/shared/Icon';
import CauseWorklistRow from './CauseWorklistRow';
import { groupCausesByRemedy, type AccessCause, type AccessRemedy } from './accessCause';
import type { ClauseGroupReference } from '../../../../shared/rules/explainExpression';

interface RemedyPresentation {
  readonly heading: string;
  readonly description: string;
  readonly icon: IconType;
  readonly groupClass: string;
  readonly iconClass: string;
}

const remedyPresentation: Record<AccessRemedy, RemedyPresentation> = {
  'blocked-by-attribute': {
    heading: 'Fix a profile attribute',
    description:
      'A rule feeds this group and a clause that was actually checked failed. Change the profile value — or the rule.',
    icon: 'alert',
    groupClass: 'border-warning-light bg-warning-light',
    iconClass: 'text-warning',
  },
  'needs-group-membership': {
    heading: 'Grant a prerequisite group',
    description:
      'A rule feeds this group but asks for another group membership this user does not have. Add them to one of the groups it names.',
    icon: 'users',
    groupClass: 'border-primary-highlight bg-primary-light',
    iconClass: 'text-primary-text',
  },
  'blocked-by-group-membership': {
    heading: 'Remove a blocking membership',
    description:
      'A rule feeds this group but excludes members of certain other groups, and this user is in one of them. No profile edit or added group closes it — the membership has to go.',
    icon: 'hand',
    groupClass: 'border-danger-light bg-danger-light',
    iconClass: 'text-danger',
  },
  'excluded-by-rule': {
    heading: 'Remove a rule exclusion',
    description:
      'A rule targets this group but lists this user as an exclusion, so they would otherwise qualify.',
    icon: 'lock',
    groupClass: 'border-danger-light bg-danger-light',
    iconClass: 'text-danger',
  },
  'manual-add': {
    heading: 'Add the user manually',
    description:
      'No rule accounts for this access, so it was granted by hand. Grant it by hand here too.',
    icon: 'plus',
    groupClass: 'border-primary-highlight bg-primary-light',
    iconClass: 'text-primary-text',
  },
  'app-managed': {
    heading: 'Assign the application',
    description:
      'An app masters this group and manages its own members. No profile edit or manual add reproduces it — assign the app instead.',
    icon: 'app',
    groupClass: 'border-neutral-200 bg-neutral-50',
    iconClass: 'text-neutral-500',
  },
  'cannot-determine': {
    heading: 'Needs investigation',
    description:
      'We could not work these out. Nothing here is known to be wrong — check them before you act.',
    icon: 'minus',
    groupClass: 'border-neutral-200 bg-neutral-50',
    iconClass: 'text-neutral-500',
  },
};

interface CauseWorklistProps {
  causes?: readonly AccessCause[];
  contextName: string;
  comparedName: string;
  onViewClauses?: (cause: AccessCause) => void;
  renderGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  renderBlockingGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  resolveGroupName?: (groupId: string) => string | undefined;
}

const CauseWorklist: React.FC<CauseWorklistProps> = ({
  causes,
  contextName,
  comparedName,
  onViewClauses,
  renderGroupAction,
  renderBlockingGroupAction,
  resolveGroupName,
}) => (
  <section
    aria-labelledby="cause-worklist-heading"
    className="rounded-md border border-neutral-200 bg-white p-3"
  >
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-neutral-100 p-1.5 text-neutral-700">
        <Icon type="list" size="sm" />
      </span>
      <h4 id="cause-worklist-heading" className="text-sm font-semibold text-neutral-900">
        What to fix
      </h4>
    </div>
    <p className="mt-1 text-xs text-neutral-600">
      Access {comparedName} has that {contextName} does not, grouped by what would close it.
    </p>

    {causes === undefined ? (
      <WorklistNote
        title="Causes not computed"
        body={`This comparison has not worked out why ${comparedName} has access ${contextName} does not. Nothing has been ruled out.`}
      />
    ) : causes.length === 0 ? (
      <WorklistNote
        title="No access differences to explain"
        body={`${comparedName} has no group access ${contextName} is missing.`}
      />
    ) : (
      <div className="mt-3 space-y-3">
        {groupCausesByRemedy(causes).map(({ remedy, causes: rows }) => (
          <RemedyGroup
            key={remedy}
            remedy={remedy}
            causes={rows}
            contextName={contextName}
            onViewClauses={onViewClauses}
            renderGroupAction={renderGroupAction}
            renderBlockingGroupAction={renderBlockingGroupAction}
            resolveGroupName={resolveGroupName}
          />
        ))}
      </div>
    )}
  </section>
);

const WorklistNote: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
    <p className="text-sm font-medium text-neutral-900">{title}</p>
    <p className="mt-1 text-xs text-neutral-600">{body}</p>
  </div>
);

interface RemedyGroupProps {
  remedy: AccessRemedy;
  causes: readonly AccessCause[];
  onViewClauses?: (cause: AccessCause) => void;
  contextName: string;
  renderGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  renderBlockingGroupAction?: (reference: ClauseGroupReference) => React.ReactNode;
  resolveGroupName?: (groupId: string) => string | undefined;
}

const RemedyGroup: React.FC<RemedyGroupProps> = ({
  remedy,
  causes,
  contextName,
  onViewClauses,
  renderGroupAction,
  renderBlockingGroupAction,
  resolveGroupName,
}) => {
  const presentation = remedyPresentation[remedy];

  return (
    <section
      aria-labelledby={`remedy-${remedy}`}
      className={`rounded-md border p-3 ${presentation.groupClass}`}
    >
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="mt-0.5 inline-flex shrink-0">
          <Icon type={presentation.icon} size="sm" className={presentation.iconClass} />
        </span>
        <div className="min-w-0 flex-1">
          <h5 id={`remedy-${remedy}`} className="text-sm font-semibold text-neutral-900">
            {presentation.heading}
          </h5>
          <p className="mt-0.5 text-xs text-neutral-700">{presentation.description}</p>
        </div>
        <span className="shrink-0 rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700">
          {causes.length} {causes.length === 1 ? 'group' : 'groups'}
        </span>
      </div>

      <ul className="mt-2 space-y-2">
        {causes.map((cause) => (
          <CauseWorklistRow
            key={cause.groupId}
            cause={cause}
            contextName={contextName}
            onViewClauses={onViewClauses}
            renderGroupAction={renderGroupAction}
            renderBlockingGroupAction={renderBlockingGroupAction}
            resolveGroupName={resolveGroupName}
          />
        ))}
      </ul>
    </section>
  );
};

export default CauseWorklist;
