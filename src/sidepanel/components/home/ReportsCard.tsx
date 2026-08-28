import React, { useId, useState } from 'react';
import Eyebrow from '../shared/Eyebrow';
import Icon from '../shared/Icon';
import Skeleton from '../shared/Skeleton';
import StretchedButton from '../shared/StretchedButton';
import FigureNumber from './FigureNumber';
import type { HomeReport } from './homeReports';
import type { GroupFinding } from '../groups/ruleOrphans';

export interface ReportsCardProps {
  reports: HomeReport[];
  onOpenGroup: (groupId: string) => void;
}

const ReportLines: React.FC<{ report: HomeReport; id: string }> = ({ report, id }) => (
  <span className="flex min-w-0 flex-1 flex-col gap-px text-left">
    <span
      id={id}
      className={`text-sm ${
        report.value === null ? 'font-medium text-neutral-600' : 'font-semibold text-neutral-900'
      }`}
    >
      {report.label}
    </span>
    {report.note && (
      <span
        className={`text-xs ${
          report.status === 'partial' ? 'text-warning-text' : 'text-neutral-600'
        }`}
      >
        {report.note}
      </span>
    )}
  </span>
);

const FindingRow: React.FC<{ finding: GroupFinding; onOpen: (id: string) => void }> = ({
  finding,
  onOpen,
}) => {
  const nameId = useId();
  return (
    <li className="relative flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-(--dur-instant) hover:bg-white">
      <StretchedButton
        label="Open this group"
        describedBy={nameId}
        onClick={() => onOpen(finding.id)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span id={nameId} className="truncate text-sm font-medium text-neutral-900">
          {finding.name}
        </span>
        <span className="truncate text-xs text-neutral-600">{finding.detail}</span>
      </span>
      <Icon type="chevron-right" size="xs" className="shrink-0 text-neutral-400" />
    </li>
  );
};

const ReportPanel: React.FC<{
  report: HomeReport;
  id: string;
  onOpenGroup: (id: string) => void;
}> = ({ report, id, onOpenGroup }) => (
  <div id={id} className="border-t border-neutral-100 bg-neutral-50 p-(--sp-card)">
    <p className="text-xs text-neutral-600">{report.caveat}</p>
    <ul className="mt-2 space-y-px">
      {report.findings.map((finding) => (
        <FindingRow key={finding.id} finding={finding} onOpen={onOpenGroup} />
      ))}
    </ul>
    {report.value !== null && report.value > report.findings.length && (
      <p className="mt-2 text-xs text-neutral-600">
        Showing the first {report.findings.length.toLocaleString()} of{' '}
        {report.value.toLocaleString()}.
      </p>
    )}
  </div>
);

const Report: React.FC<{ report: HomeReport; onOpenGroup: (id: string) => void }> = ({
  report,
  onOpenGroup,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const labelId = `home-report-${report.key}`;
  const panelId = `home-report-panel-${report.key}`;

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
        <ReportLines report={report} id={labelId} />
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="press press-subtle flex w-full items-stretch gap-3 px-(--sp-row-x) py-(--sp-row-y) hover:bg-neutral-50 active:brightness-90 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        <FigureNumber value={report.value} />
        <ReportLines report={report} id={labelId} />
        <Icon
          type="chevron-down"
          size="xs"
          className={`shrink-0 self-center text-neutral-400 transition-transform duration-(--dur-quick) ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <ReportPanel report={report} id={panelId} onOpenGroup={onOpenGroup} />}
    </li>
  );
};

const ReportsCard: React.FC<ReportsCardProps> = ({ reports, onOpenGroup }) => (
  <section aria-label="Reports" className="space-y-2">
    <Eyebrow as="h3">Reports</Eyebrow>
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-md border border-neutral-200 bg-white">
      {reports.map((report) => (
        <Report key={report.key} report={report} onOpenGroup={onOpenGroup} />
      ))}
    </ul>
  </section>
);

export default ReportsCard;
