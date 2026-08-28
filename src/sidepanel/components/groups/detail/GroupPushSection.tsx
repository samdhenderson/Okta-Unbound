import React from 'react';
import { CopyableId, DetailSection, EntityLink } from '../../shared';
import Icon from '../../shared/Icon';
import type { PushGroupMapping } from '../../../../shared/types';

interface GroupPushSectionProps {
  mappings?: PushGroupMapping[];
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

const GroupPushSection: React.FC<GroupPushSectionProps> = ({ mappings }) => (
  <DetailSection
    title="App push"
    description="Applications this group's membership is pushed out to."
  >
    {mappings === undefined ? (
      <p className="text-sm text-neutral-500">
        Push mappings were not loaded for this group — reload the groups list to check.
      </p>
    ) : mappings.length === 0 ? (
      <p className="text-sm text-neutral-500">Not pushed to any application.</p>
    ) : (
      <ul className="space-y-1.5">
        {mappings.map((mapping) => (
          <li
            key={mapping.mappingId}
            className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-(--sp-row-x) py-(--sp-row-y)"
          >
            <span className="flex min-w-0 flex-col items-start">
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
                <span className="mt-0.5 truncate text-xs text-neutral-500">
                  Target group: {mapping.targetGroupName}
                </span>
              )}
            </span>
            {mapping.priority !== undefined && (
              <span
                className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600"
                title="Okta assignment priority — not an activation status"
              >
                Priority {mapping.priority}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </DetailSection>
);

export default GroupPushSection;
