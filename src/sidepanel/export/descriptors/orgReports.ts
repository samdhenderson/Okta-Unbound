import type { EntityExport, ExportColumn } from '../types';
import { dormantAccessLabel } from '../../components/groups/ruleOrphans';
import {
  readDormantAccessRows,
  readGroupCleanupRows,
  readUnmaintainedAppAccessRows,
  reportRowSchema,
  COMPLETENESS_COLUMN_ID,
  type ReportRow,
} from '../orgReportSource';

function reportColumns(): ExportColumn<ReportRow>[] {
  return [
    {
      id: 'group-id',
      label: 'Group ID',
      group: 'base',
      defaultEnabled: true,
      accessor: (row: ReportRow) => row.groupId,
      description: 'The Okta group id — the deep-link target.',
    },
    {
      id: 'group-name',
      label: 'Group',
      group: 'base',
      defaultEnabled: true,
      accessor: (row: ReportRow) => row.groupName,
      description: 'The group name, exactly as the Home report names it.',
    },
    {
      id: 'finding',
      label: 'Finding',
      group: 'base',
      defaultEnabled: true,
      accessor: (row: ReportRow) => row.finding,
      description: 'The one-line explanation shown under the name on Home.',
    },
    {
      id: 'caveat',
      label: 'Caveat',
      group: 'base',
      defaultEnabled: true,
      accessor: (row: ReportRow) => row.caveat,
      description:
        'What this report cannot see. Constant across rows, and on every row on ' +
        'purpose: a caveat that only appears once is the first thing lost when a ' +
        'subset is pasted into a ticket.',
    },
    {
      id: COMPLETENESS_COLUMN_ID,
      label: 'Completeness',
      group: 'base',
      defaultEnabled: true,
      accessor: (row: ReportRow) => row.completeness,
      description:
        'Blank when the answer is complete. When a collection behind it did not ' +
        'finish reading, this names the shortfall — and the column is included ' +
        'even if you turn it off.',
    },
  ];
}

const REPORT_SHAPE = {
  context: { kind: 'whole-org' },
  defaultQuery: {},
  schema: reportRowSchema,
  filter: { kind: 'none' },
  linkify: { entityType: 'group', idColumnId: 'group-id' },
} as const satisfies Partial<EntityExport<ReportRow>>;

export const groupCleanupReportDescriptor: EntityExport<ReportRow> = {
  ...REPORT_SHAPE,
  id: 'report-group-cleanup',
  displayName: 'Report: Empty groups nothing fills',
  icon: 'chart',
  description:
    'Groups with no members that no rule fills and no app is assigned to. Findings, ' +
    'not a delete list — read the caveat column. Costs no requests.',
  columnCatalog: reportColumns(),
  source: {
    kind: 'snapshot',
    completenessColumnId: COMPLETENESS_COLUMN_ID,
    read: readGroupCleanupRows,
  },
};

export const unmaintainedAppAccessReportDescriptor: EntityExport<ReportRow> = {
  ...REPORT_SHAPE,
  id: 'report-unmaintained-app-access',
  displayName: 'Report: App access no rule maintains',
  icon: 'app',
  description:
    'Groups that hold an app open and that no group rule fills. Findings, not a ' +
    'delete list — read the caveat column. Costs no requests.',
  columnCatalog: reportColumns(),
  source: {
    kind: 'snapshot',
    completenessColumnId: COMPLETENESS_COLUMN_ID,
    read: readUnmaintainedAppAccessRows,
  },
};

export const dormantAccessReportDescriptor: EntityExport<ReportRow> = {
  ...REPORT_SHAPE,
  id: 'report-dormant-app-access',
  displayName: `Report: ${dormantAccessLabel()}`,
  icon: 'clock',
  description:
    'Groups holding an app open into which no membership write has landed since the ' +
    'last complete read of your groups. Read the caveat column. Costs no requests.',
  columnCatalog: reportColumns(),
  source: {
    kind: 'snapshot',
    completenessColumnId: COMPLETENESS_COLUMN_ID,
    read: (snapshot) => readDormantAccessRows(snapshot),
  },
};

export default [
  groupCleanupReportDescriptor,
  unmaintainedAppAccessReportDescriptor,
  dormantAccessReportDescriptor,
];
