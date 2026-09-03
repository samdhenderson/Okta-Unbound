import React from 'react';
import Eyebrow from '../shared/Eyebrow';
import Skeleton from '../shared/Skeleton';
import { EntityChoiceRow, type EntityChoice } from './EntityChooser';
import FigureNumber from './FigureNumber';
import MfaCoverageLauncher from './MfaCoverageLauncher';
import { RowDisclosure, RowLines } from './ReportRow';
import type { HomeReport } from './homeReports';
import type { OrgFigureStatus } from './orgFigures';

export interface ReportsCardProps {
  reports: HomeReport[];
  onOpenGroup: (groupId: string) => void;
  groupChoices: EntityChoice[];
  groupChoicesStatus: OrgFigureStatus;
  onScanGroupMfa: (groupId: string) => void;
}

const ReportPanel: React.FC<{
  report: HomeReport;
  onOpenGroup: (id: string) => void;
}> = ({ report, onOpenGroup }) => (
  <>
    <p className="text-xs text-neutral-600">{report.caveat}</p>
    <ul className="mt-2 space-y-px">
      {report.findings.map((finding) => (
        <EntityChoiceRow
          key={finding.id}
          choice={finding}
          actionLabel="Open this group"
          onChoose={onOpenGroup}
        />
      ))}
    </ul>
    {report.value !== null && report.value > report.findings.length && (
      <p className="mt-2 text-xs text-neutral-600">
        Showing the first {report.findings.length.toLocaleString()} of{' '}
        {report.value.toLocaleString()}.
      </p>
    )}
  </>
);

const Report: React.FC<{ report: HomeReport; onOpenGroup: (id: string) => void }> = ({
  report,
  onOpenGroup,
}) => {
  const labelId = `home-report-${report.key}`;

  if (report.status === 'reading') {
    return (
      <li className="px-(--sp-row-x) py-(--sp-row-y)">
        <Skeleton variant="text" size="sm" width="w-3/4" label={`Reading ${report.label}`} />
      </li>
    );
  }

  if (report.value === null || report.findings.length === 0) {
    return (
      <li
        className={`flex items-stretch gap-3 px-(--sp-row-x) py-(--sp-row-y) ${
          report.value === null ? 'bg-neutral-50' : ''
        }`}
      >
        <FigureNumber value={report.value} />
        <RowLines
          label={report.label}
          note={report.note}
          id={labelId}
          recessed={report.value === null}
          warn={report.status === 'partial'}
        />
      </li>
    );
  }

  return (
    <RowDisclosure
      rowKey={report.key}
      figure={<FigureNumber value={report.value} />}
      label={report.label}
      note={report.note}
      warn={report.status === 'partial'}
    >
      <ReportPanel report={report} onOpenGroup={onOpenGroup} />
    </RowDisclosure>
  );
};

const ReportsCard: React.FC<ReportsCardProps> = ({
  reports,
  onOpenGroup,
  groupChoices,
  groupChoicesStatus,
  onScanGroupMfa,
}) => (
  <section aria-label="Reports" className="space-y-2">
    <Eyebrow as="h3">Reports</Eyebrow>
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200 bg-white">
      {reports.map((report) => (
        <Report key={report.key} report={report} onOpenGroup={onOpenGroup} />
      ))}
      <MfaCoverageLauncher
        choices={groupChoices}
        status={groupChoicesStatus}
        onScan={onScanGroupMfa}
      />
    </ul>
  </section>
);

export default ReportsCard;
