import React from 'react';
import { Button } from '../shared';
import Icon from './shared/Icon';
import StatCard from './shared/StatCard';
import { useAppOverviewData } from '../../hooks/useAppOverviewData';

interface AppOverviewProps {
  appId: string;
  appName: string;
  targetTabId?: number | null;
  onExport: (descriptorId: string, appId: string, appName: string) => void;
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-success-light text-success-text',
  INACTIVE: 'bg-neutral-100 text-neutral-700',
};

const UNAVAILABLE = '—';

const AppOverview: React.FC<AppOverviewProps> = ({ appId, appName, targetTabId, onExport }) => {
  const { app, isLoadingApp, counts, accessPolicyId, isLoadingAssignments } = useAppOverviewData(
    appId,
    targetTabId,
  );

  const status = app?.status;
  const signOnMode = app?.signOnMode;

  const countValue = (value?: number) =>
    isLoadingAssignments || counts == null ? UNAVAILABLE : (value ?? UNAVAILABLE);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">{appName}</h2>
          {status && (
            <span
              className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${
                STATUS_CLASSES[status] ?? 'bg-neutral-100 text-neutral-700'
              }`}
            >
              {status}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Sign-on mode{' '}
          <span className="font-medium text-neutral-700">
            {isLoadingApp && !signOnMode ? UNAVAILABLE : (signOnMode ?? UNAVAILABLE)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Assigned Users"
          value={countValue(counts?.users)}
          color="primary"
          icon="users"
        />
        <StatCard
          title="Assigned Groups"
          value={countValue(counts?.groups)}
          color="neutral"
          icon="building"
        />
      </div>

      {accessPolicyId && (
        <div className="flex items-start gap-2 rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
          <Icon type="shield" size="sm" className="mt-0.5 shrink-0 text-neutral-500" />
          <span>
            Has app-specific authentication policy
            <span className="block text-xs text-neutral-500">
              Navigate to the policy in Okta to inspect its rules.
            </span>
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon="download"
          onClick={() => onExport('app-users', appId, appName)}
          title="Export the users assigned to this app (opens the Export tab pre-scoped)"
        >
          Export App Users
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon="download"
          onClick={() => onExport('app-groups', appId, appName)}
          title="Export the groups assigned to this app (opens the Export tab pre-scoped)"
        >
          Export App Groups
        </Button>
      </div>
    </div>
  );
};

export default AppOverview;
