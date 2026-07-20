import type { OktaUser } from '../shared/types';
import { escapeCSV } from '../shared/utils/csvUtils';

export function convertToCSV(users: OktaUser[]): string {
  if (users.length === 0) return '';

  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Status'];
  const rows = users.map((u) => [
    u.id,
    u.profile.login,
    u.profile.firstName,
    u.profile.lastName,
    u.status,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => escapeCSV(cell)).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
