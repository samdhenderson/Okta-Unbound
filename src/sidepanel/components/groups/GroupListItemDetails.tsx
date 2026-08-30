import React from 'react';
import { CopyableId, CopyButton, EntityLink } from '../shared';
import Icon from '../shared/Icon';
import MemberSourceMeter from './detail/MemberSourceMeter';
import type { GroupSummary } from '../../../shared/types';
import type { MemberSourceBreakdown } from '../../../shared/membership/groupSource';
import { formatDate } from '../../../shared/utils/dateFormat';

interface GroupListItemDetailsProps {
  group: GroupSummary;
  breakdown: MemberSourceBreakdown | null;
}

const UnnamedPushApp: React.FC<{
  appId: string;
}> = ({ appId }) => (
  <span
    className="inline-flex max-w-full items-center gap-1 text-xs"
    title="Okta returned no name for this application, so only its id is known here."
  >
    <Icon type="app" size="xs" className="shrink-0 text-neutral-500" />
    <span className="shrink-0 italic text-neutral-600">App name not loaded</span>
    <CopyableId value={appId} label={`Copy application id ${appId}`} />
  </span>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-xs font-medium text-neutral-600">{label}</div>
    <div className="mt-0.5 text-xs text-neutral-900">{children}</div>
  </div>
);

const GroupListItemDetails: React.FC<GroupListItemDetailsProps> = ({ group, breakdown }) => (
  <div className="space-y-(--sp-rung) border-t border-neutral-200 p-(--sp-card)">
    {group.description?.trim() && (
      <Field label="Description">
        <p className="text-neutral-700">{group.description}</p>
      </Field>
    )}

    {breakdown && (
      <div>
        <div className="mb-1.5 text-xs font-medium text-neutral-600">Membership source</div>
        <MemberSourceMeter breakdown={breakdown} />
      </div>
    )}

    <div className="grid grid-cols-1 gap-(--sp-field) sm:grid-cols-2">
      <Field label="Group ID">
        <div className="flex items-center gap-(--sp-inline)">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-900">
            {group.id}
          </code>
          <CopyButton label="Copy ID" getText={() => group.id} />
        </div>
      </Field>

      {group.created && <Field label="Created">{formatDate(group.created)}</Field>}
      {group.lastUpdated && <Field label="Profile updated">{formatDate(group.lastUpdated)}</Field>}
      {group.lastMembershipUpdated && (
        <Field label="Membership changed">{formatDate(group.lastMembershipUpdated)}</Field>
      )}
    </div>

    {group.pushMappings && group.pushMappings.length > 0 && (
      <div>
        <div className="mb-1.5 text-xs font-medium text-neutral-600">Push mappings</div>
        <ul className="space-y-(--sp-inline)">
          {group.pushMappings.map((mapping) => (
            <li
              key={mapping.mappingId}
              className="flex items-center justify-between gap-(--sp-field) rounded-md border border-neutral-200 bg-neutral-50 px-(--sp-row-x) py-(--sp-row-y)"
            >
              <div className="min-w-0">
                {mapping.appName ? (
                  <EntityLink
                    type="app"
                    id={mapping.appId}
                    name={mapping.appName}
                    copyId
                    copyIdLabel={`Copy application id ${mapping.appId}`}
                  />
                ) : (
                  <UnnamedPushApp appId={mapping.appId} />
                )}
                {mapping.targetGroupName && (
                  <div className="truncate text-xs text-neutral-600">
                    Target group: {mapping.targetGroupName}
                  </div>
                )}
              </div>
              {mapping.priority !== undefined && (
                <span
                  className="shrink-0 rounded-md bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-600"
                  title="Okta assignment priority — not an activation status"
                >
                  Priority {mapping.priority}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default GroupListItemDetails;
