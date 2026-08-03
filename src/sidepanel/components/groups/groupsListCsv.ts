import type { GroupSummary } from '../../../shared/types';
import { escapeCSV } from '../../../shared/utils/csvUtils';

const HEADERS = [
  'ID',
  'Name',
  'Description',
  'Type',
  'Member Count',
  'Staleness Score',
  'Push Status',
];

function quoteCell(value: string | number): string {
  const escaped = escapeCSV(value);
  return escaped.startsWith('"') ? escaped : `"${escaped}"`;
}

export function buildGroupsListCsv(groups: GroupSummary[]): string {
  const rows = groups.map((g) => [
    g.id,
    g.name,
    g.description || '',
    g.type || '',
    g.memberCount ?? 0,
    g.staleness?.score ?? '',
    g.pushMappings?.length ? `Pushed (${g.pushMappings.length})` : 'Not Pushed',
  ]);
  return [HEADERS, ...rows].map((row) => row.map(quoteCell).join(',')).join('\n');
}
