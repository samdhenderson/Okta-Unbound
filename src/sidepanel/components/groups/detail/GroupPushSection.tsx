import React from 'react';
import { DetailSection } from '../../shared';
import type { PushGroupMapping } from '../../../../shared/types';

interface GroupPushSectionProps {
  mappings?: PushGroupMapping[];
}

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
            className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-neutral-900">
                {mapping.appName || mapping.appId}
              </span>
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
