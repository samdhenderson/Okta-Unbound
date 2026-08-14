import React, { useState, useCallback } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import AlertMessage from '../shared/AlertMessage';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Checkbox } from '../shared';
import type { GroupSummary, OktaUser } from '../../../shared/types';
import {
  generateCSV,
  downloadCSV,
  formatDateForCSV,
  sanitizeFilename,
  getDateForFilename,
} from '../../../shared/utils/csvUtils';
import { createLogger } from '../../../shared/utils/logger';

const log = createLogger('GroupExportModal');

interface ExportColumn {
  id: string;
  label: string;
  enabled: boolean;
  description?: string;
}

interface GroupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupSummary[];
  targetTabId: number | null;
  exportType: 'selection' | 'collection';
  collectionName?: string;
  onFetchMembers: (groupId: string) => Promise<OktaUser[]>;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { id: 'groupName', label: 'Group Name', enabled: true },
  { id: 'groupId', label: 'Group ID', enabled: true },
  { id: 'description', label: 'Description', enabled: true },
  { id: 'type', label: 'Type', enabled: true },
  { id: 'memberCount', label: 'Member Count', enabled: true },
  { id: 'hasRules', label: 'Has Rules', enabled: false },
  { id: 'ruleCount', label: 'Rule Count', enabled: false },
  { id: 'created', label: 'Created Date', enabled: false },
  { id: 'lastUpdated', label: 'Last Updated', enabled: false },
];

function getColumnValue(group: GroupSummary, columnId: string): string {
  switch (columnId) {
    case 'groupName':
      return group.name;
    case 'groupId':
      return group.id;
    case 'description':
      return group.description || '';
    case 'type':
      return group.type;
    case 'memberCount':
      return String(group.memberCount);
    case 'hasRules':
      return group.hasRules ? 'Yes' : 'No';
    case 'ruleCount':
      return String(group.ruleCount);
    case 'created':
      return group.created ? formatDateForCSV(group.created) : 'N/A';
    case 'lastUpdated':
      return group.lastUpdated ? formatDateForCSV(group.lastUpdated) : 'N/A';
    default:
      return '';
  }
}

const GroupExportModal: React.FC<GroupExportModalProps> = ({
  isOpen,
  onClose,
  groups,
  targetTabId,
  exportType,
  collectionName,
  onFetchMembers,
}) => {
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_COLUMNS);
  const [includeMemberList, setIncludeMemberList] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setExportError(null);
  }

  const toggleColumn = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, enabled: !col.enabled } : col)),
    );
  }, []);

  const handleExport = useCallback(async () => {
    setExportError(null);

    if (!targetTabId) {
      setExportError('No Okta tab connected');
      return;
    }

    const enabledColumns = columns.filter((col) => col.enabled);
    if (enabledColumns.length === 0) {
      setExportError('Please select at least one column to export');
      return;
    }

    setIsExporting(true);
    setExportProgress('Generating groups CSV...');

    try {
      const headers = enabledColumns.map((col) => col.label);
      const rows = groups.map((group) =>
        enabledColumns.map((col) => getColumnValue(group, col.id)),
      );
      const groupsCSV = generateCSV(headers, rows);

      const date = getDateForFilename();
      let baseFilename: string;
      if (exportType === 'collection' && collectionName) {
        baseFilename = `collection-${sanitizeFilename(collectionName)}`;
      } else {
        baseFilename = `groups-export-${groups.length}-groups`;
      }

      downloadCSV(groupsCSV, `${baseFilename}-${date}.csv`);

      if (includeMemberList) {
        setExportProgress(`Fetching members for ${groups.length} groups...`);

        const memberHeaders = [
          'Group ID',
          'Group Name',
          'User ID',
          'Email',
          'First Name',
          'Last Name',
          'Status',
        ];

        let completed = 0;
        const perGroupRows = await Promise.all(
          groups.map(async (group): Promise<string[][]> => {
            let groupRows: string[][];
            try {
              const members = await onFetchMembers(group.id);
              groupRows = members.map((member) => [
                group.id,
                group.name,
                member.id,
                member.profile.email,
                member.profile.firstName,
                member.profile.lastName,
                member.status,
              ]);
            } catch (err) {
              log.error(`Failed to fetch members for group ${group.id}:`, err);
              groupRows = [
                [
                  group.id,
                  group.name,
                  'ERROR',
                  `Failed to fetch: ${err instanceof Error ? err.message : 'Unknown error'}`,
                  '',
                  '',
                  '',
                ],
              ];
            }
            completed++;
            setExportProgress(`Fetched members for ${completed} of ${groups.length} groups...`);
            return groupRows;
          }),
        );

        setExportProgress('Generating members CSV...');
        const membersCSV = generateCSV(memberHeaders, perGroupRows.flat());

        downloadCSV(membersCSV, `${baseFilename}-members-${date}.csv`);
      }

      setExportProgress(null);
      onClose();
    } catch (err) {
      log.error('Export failed:', err);
      setExportError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [
    columns,
    groups,
    includeMemberList,
    exportType,
    collectionName,
    targetTabId,
    onFetchMembers,
    onClose,
  ]);

  const enabledCount = columns.filter((c) => c.enabled).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exportType === 'collection' ? `Export Collection: ${collectionName}` : 'Export Groups'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || enabledCount === 0}
          >
            {isExporting ? 'Exporting...' : `Export (${groups.length})`}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {exportError && (
          <AlertMessage
            message={{ text: exportError, type: 'danger' }}
            onDismiss={() => setExportError(null)}
          />
        )}

        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Select columns to include:</h4>
          <div className="grid grid-cols-2 gap-2">
            {columns.map((col) => (
              <Checkbox
                key={col.id}
                checked={col.enabled}
                onChange={() => toggleColumn(col.id)}
                label={col.label}
                className="p-2 rounded-md hover:bg-neutral-50 transition-colors"
              />
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200" />

        <div>
          <Checkbox
            checked={includeMemberList}
            onChange={setIncludeMemberList}
            label={<span className="font-medium">Include member list</span>}
            description="Generates a second CSV file with member details (Group ID, Group Name, User ID, Email, First Name, Last Name, Status)"
            className="p-3 rounded-md border border-neutral-200 hover:border-neutral-300 transition-colors"
          />
        </div>

        {exportProgress && (
          <div className="flex items-center gap-2 p-3 bg-info-light rounded-md border border-primary/20">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-primary-text">{exportProgress}</span>
          </div>
        )}

        {includeMemberList && groups.length > 20 && (
          <div className="flex items-start gap-2 p-3 bg-warning-light rounded-md border border-warning/20">
            <svg
              className="w-4 h-4 text-warning-text mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm text-warning-text">
              Exporting members for {groups.length} groups may take a while. Consider exporting
              fewer groups at a time.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GroupExportModal;
