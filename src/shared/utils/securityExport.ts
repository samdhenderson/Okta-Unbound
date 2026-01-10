import type { OrphanedAccount, StaleGroupMembership, SecurityPosture } from '../types';
import { escapeCSV, downloadCSV, sanitizeFilename, getDateForFilename } from './csvUtils';

function formatDateForCSV(date: Date | null): string {
  if (!date) return 'Never';
  return date.toISOString().split('T')[0];
}

export function exportOrphanedAccountsToCSV(
  orphanedAccounts: OrphanedAccount[],
  groupName: string,
): void {
  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'Status',
    'Last Login',
    'Days Inactive',
    'Risk Level',
    'Reason',
    'Membership Source',
  ];

  const rows = orphanedAccounts.map((account) => [
    escapeCSV(account.email),
    escapeCSV(account.firstName),
    escapeCSV(account.lastName),
    escapeCSV(account.status),
    escapeCSV(formatDateForCSV(account.lastLogin)),
    escapeCSV(account.daysSinceLogin || 'N/A'),
    escapeCSV(account.riskLevel.toUpperCase()),
    escapeCSV(getReasonLabel(account.orphanReason)),
    escapeCSV(account.membershipSource),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const filename = `security-findings-orphaned-accounts-${sanitizeFilename(groupName)}-${getDateForFilename()}.csv`;
  downloadCSV(csvContent, filename);
}

export function exportStaleMembershipsToCSV(
  staleMemberships: StaleGroupMembership[],
  groupName: string,
): void {
  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'Account Created (Not Group Membership Date)*',
    'Account Age (Days)',
    'Source (Approximate)*',
    'Matches Rules',
    'Recommendation',
  ];

  const rows = staleMemberships.map((membership) => [
    escapeCSV(membership.email),
    escapeCSV(membership.firstName),
    escapeCSV(membership.lastName),
    escapeCSV(formatDateForCSV(membership.userCreatedDate)),
    escapeCSV(membership.daysSinceCreated ?? 'N/A'),
    escapeCSV(membership.source),
    escapeCSV(membership.matchesRules ? 'Yes' : 'No'),
    escapeCSV(membership.shouldReview ? 'Review required' : 'OK'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const filename = `security-findings-stale-memberships-${sanitizeFilename(groupName)}-${getDateForFilename()}.csv`;
  downloadCSV(csvContent, filename);
}

export function exportSecurityReportToCSV(
  posture: SecurityPosture,
  _orphanedAccounts: OrphanedAccount[],
  _staleMemberships: StaleGroupMembership[],
): void {
  const sanitizedGroupName = sanitizeFilename(posture.groupName);
  const date = getDateForFilename();

  const summaryHeaders = ['Security Score', 'Total Findings', 'Critical', 'High', 'Medium', 'Low'];
  const criticalCount = posture.findings.filter((f) => f.severity === 'critical').length;
  const highCount = posture.findings.filter((f) => f.severity === 'high').length;
  const mediumCount = posture.findings.filter((f) => f.severity === 'medium').length;
  const lowCount = posture.findings.filter((f) => f.severity === 'low').length;

  const summaryRow = [
    escapeCSV(posture.overallScore),
    escapeCSV(posture.findings.length),
    escapeCSV(criticalCount),
    escapeCSV(highCount),
    escapeCSV(mediumCount),
    escapeCSV(lowCount),
  ];

  const findingsHeaders = ['Severity', 'Category', 'Count', 'Description'];
  const findingsRows = posture.findings.map((finding) => [
    escapeCSV(finding.severity.toUpperCase()),
    escapeCSV(finding.category.replace(/_/g, ' ').toUpperCase()),
    escapeCSV(finding.count),
    escapeCSV(finding.description),
  ]);

  const recoHeaders = ['Priority', 'Title', 'Description'];
  const recoRows = posture.recommendations.map((reco) => [
    escapeCSV(reco.priority.toUpperCase()),
    escapeCSV(reco.title),
    escapeCSV(reco.description),
  ]);

  const csvContent = [
    `Security Report for ${posture.groupName}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    'SUMMARY',
    summaryHeaders.join(','),
    summaryRow.join(','),
    '',
    'FINDINGS',
    findingsHeaders.join(','),
    ...findingsRows.map((row) => row.join(',')),
    '',
    'RECOMMENDATIONS',
    recoHeaders.join(','),
    ...recoRows.map((row) => row.join(',')),
  ].join('\n');

  const filename = `security-report-${sanitizedGroupName}-${date}.csv`;
  downloadCSV(csvContent, filename);
}

function getReasonLabel(reason: OrphanedAccount['orphanReason']): string {
  const labels: Record<OrphanedAccount['orphanReason'], string> = {
    never_logged_in: 'Never Logged In (30+ days old)',
    inactive_90d: 'Inactive 90-179 Days',
    inactive_180d: 'Inactive 180+ Days',
    no_apps: 'No App Assignments',
    deprovisioned_in_groups: 'Deprovisioned but Still in Group',
  };
  return labels[reason] || reason;
}
