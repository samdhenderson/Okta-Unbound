import React from 'react';
import { Button } from '../shared';

interface AppOverviewProps {
  appId: string;
  appName: string;
  onExport: (descriptorId: string, appId: string, appName: string) => void;
}

const AppOverview: React.FC<AppOverviewProps> = ({ appId, appName, onExport }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-semibold text-neutral-900">{appName}</h2>
      <p className="mt-0.5 text-sm text-neutral-600">
        Detected app. Export its assignments below — more app insights are coming here.
      </p>
    </div>

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

export default AppOverview;
