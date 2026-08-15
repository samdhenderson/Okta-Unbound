import React from 'react';
import {
  AlertMessage,
  Badge,
  DetailSection,
  EmptyState,
  EntityLink,
  LoadingSpinner,
} from '../../shared';
import type { AppGrant, RoleGrant, RolesReadStatus } from '../../../hooks/useGroupAccessGrants';
import type { SourceStatus } from '../../../hooks/useGroupSource';

interface GroupAccessSectionProps {
  apps: AppGrant[];
  appsStatus: SourceStatus;
  appsError: string | null;
  roles: RoleGrant[];
  rolesStatus: RolesReadStatus;
}

const ROLE_SCOPE_CAVEAT =
  "Okta's group-roles listing reports the role type but not which apps or groups it applies to, so this is not the full grant.";

const AppChip: React.FC<{ app: AppGrant }> = ({ app }) => (
  <EntityLink type="app" id={app.id} name={app.label} />
);

const RoleRow: React.FC<{ role: RoleGrant }> = ({ role }) => (
  <li className="flex items-center justify-between gap-2">
    <span className="text-sm text-neutral-700">{role.label}</span>
    <Badge variant="neutral" title={ROLE_SCOPE_CAVEAT}>
      role assigned (scope not shown)
    </Badge>
  </li>
);

const GroupAccessSection: React.FC<GroupAccessSectionProps> = ({
  apps,
  appsStatus,
  appsError,
  roles,
  rolesStatus,
}) => {
  const loading = appsStatus === 'loading' || rolesStatus === 'loading';
  const confirmedNoRoles = rolesStatus === 'available' && roles.length === 0;
  const genuinelyEmpty = !loading && appsStatus === 'done' && apps.length === 0 && confirmedNoRoles;

  return (
    <DetailSection
      title="Grants access to"
      description="What membership in this group actually gives a member."
    >
      {loading ? (
        <LoadingSpinner size="sm" message="Loading access grants…" centered />
      ) : appsStatus === 'error' ? (
        <AlertMessage
          message={{ text: appsError || 'Failed to load app assignments.', type: 'danger' }}
        />
      ) : genuinelyEmpty ? (
        <EmptyState
          icon="shield"
          title="No access granted"
          description="This group is not assigned to any app and carries no admin role."
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-neutral-600">
              Assigned apps{apps.length > 0 && ` (${apps.length})`}
            </h3>
            {apps.length === 0 ? (
              <p className="mt-1.5 text-sm text-neutral-500">Not assigned to any app.</p>
            ) : (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {apps.map((app) => (
                  <li key={app.id}>
                    <AppChip app={app} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {rolesStatus === 'available' && (
            <div>
              <h3 className="text-xs font-medium text-neutral-600">
                Admin roles{roles.length > 0 && ` (${roles.length})`}
              </h3>
              {roles.length === 0 ? (
                <p className="mt-1.5 text-sm text-neutral-500">No admin role granted.</p>
              ) : (
                <ul className="mt-1.5 space-y-1.5">
                  {roles.map((role) => (
                    <RoleRow key={role.id} role={role} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </DetailSection>
  );
};

export default GroupAccessSection;
