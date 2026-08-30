import React from 'react';
import { CopyButton } from '../../shared';
import { formatDate } from '../../../../shared/utils/dateFormat';

interface GroupMetadataSectionProps {
  groupId: string;
  description?: string;
  created?: Date;
  lastUpdated?: Date;
  lastMembershipUpdated?: Date;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-xs font-medium text-neutral-600">{label}</div>
    <div className="mt-0.5 text-sm text-neutral-900">{children}</div>
  </div>
);

const GroupMetadataSection: React.FC<GroupMetadataSectionProps> = ({
  groupId,
  description,
  created,
  lastUpdated,
  lastMembershipUpdated,
}) => (
  <div className="space-y-3">
    <Field label="Description">
      {description?.trim() ? (
        description
      ) : (
        <span className="text-neutral-500 italic">No description in Okta.</span>
      )}
    </Field>

    <Field label="Group ID">
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-900">
          {groupId}
        </code>
        <CopyButton label="Copy ID" getText={() => groupId} />
      </div>
    </Field>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Created">
        {created ? (
          formatDate(created)
        ) : (
          <span className="text-neutral-500 italic">Not reported by Okta</span>
        )}
      </Field>
      <Field label="Profile updated">
        {lastUpdated ? (
          formatDate(lastUpdated)
        ) : (
          <span className="text-neutral-500 italic">Not reported by Okta</span>
        )}
      </Field>
      <Field label="Membership changed">
        {lastMembershipUpdated ? (
          formatDate(lastMembershipUpdated)
        ) : (
          <span className="text-neutral-500 italic">Not reported by Okta</span>
        )}
      </Field>
    </div>
  </div>
);

export default GroupMetadataSection;
