import React from 'react';
import Icon from '../shared/Icon';
import Skeleton from '../shared/Skeleton';
import EntityChooser, { type EntityChoice } from './EntityChooser';
import { RowDisclosure, RowLines } from './ReportRow';
import { MFA_PARTIAL_NOTE, MFA_SCAN_CAVEAT, MFA_UNAVAILABLE_NOTE } from './homeReports';
import type { OrgFigureStatus } from './orgFigures';

export interface MfaCoverageLauncherProps {
  choices: EntityChoice[];
  status: OrgFigureStatus;
  onScan: (groupId: string) => void;
}

const LauncherGlyph: React.FC = () => (
  <span className="flex shrink-0 items-center self-stretch">
    <span className="flex min-w-[2.6ch] justify-end">
      <Icon type="shield" size="lg" className="text-neutral-400" />
    </span>
  </span>
);

const MfaCoverageLauncher: React.FC<MfaCoverageLauncherProps> = ({ choices, status, onScan }) => {
  if (status === 'reading') {
    return (
      <li className="px-(--sp-row-x) py-(--sp-row-y)">
        <Skeleton variant="text" size="sm" width="w-3/4" label="Reading groups" />
      </li>
    );
  }

  if (status === 'unavailable' || choices.length === 0) {
    return (
      <li className="flex items-stretch gap-3 bg-neutral-50 px-(--sp-row-x) py-(--sp-row-y)">
        <LauncherGlyph />
        <RowLines
          label="MFA coverage for a group"
          note={MFA_UNAVAILABLE_NOTE}
          id="home-report-mfa-coverage"
          recessed
        />
      </li>
    );
  }

  return (
    <RowDisclosure
      rowKey="mfa-coverage"
      figure={<LauncherGlyph />}
      label="MFA coverage for a group"
      note="Pick a group — nothing is read until you do."
      warn={status === 'partial'}
    >
      <p className="text-xs text-neutral-600">{MFA_SCAN_CAVEAT}</p>
      {status === 'partial' && <p className="mt-1 text-xs text-warning-text">{MFA_PARTIAL_NOTE}</p>}
      <div className="mt-2">
        <EntityChooser
          choices={choices}
          filterLabel="Filter groups"
          actionLabel="Scan MFA coverage for this group"
          onChoose={onScan}
          emptyLabel="No group matches that name."
        />
      </div>
    </RowDisclosure>
  );
};

export default MfaCoverageLauncher;
