import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExportEngineOperations } from '@/sidepanel/hooks/useOktaApi/exportEngine';
import { downloadCSV } from '@/shared/utils/csvUtils';
import { makeFakeCore } from '@/test/factories/coreApi';
import type { OrgSnapshotView, SnapshotCollection } from '../snapshot';
import type { ReportRow } from '../orgReportSource';
import type { EntityExport } from '../types';
import { DORMANT_ACCESS_DAYS, dormantAccessLabel } from '@/sidepanel/components/groups/ruleOrphans';
import reportDescriptors, {
  dormantAccessReportDescriptor,
  groupCleanupReportDescriptor,
  unmaintainedAppAccessReportDescriptor,
} from './orgReports';

vi.mock('@/shared/utils/csvUtils', async (importActual) => {
  const actual = await importActual<typeof import('@/shared/utils/csvUtils')>();
  return { ...actual, downloadCSV: vi.fn() };
});
vi.mock('@/shared/storage/auditStore', () => ({
  auditStore: { logOperation: vi.fn().mockResolvedValue(undefined) },
}));

const mockedDownloadCSV = vi.mocked(downloadCSV);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const WALK_AT = Date.parse('2026-08-20T00:00:00.000Z');

function collection(
  rows: unknown[],
  records: { id: string }[],
  overrides: Partial<SnapshotCollection> = {},
): SnapshotCollection {
  return {
    rows,
    records,
    isReading: false,
    complete: true,
    lastFullWalkAt: WALK_AT,
    error: null,
    ...overrides,
  };
}

function snapshotWithNames(
  names: string[],
  overrides: Partial<OrgSnapshotView> = {},
): OrgSnapshotView {
  return {
    groups: collection(
      names.map((name, i) => ({
        id: `00gFAKE${i}`,
        profile: { name },
        _embedded: { stats: { usersCount: 0 } },
      })),
      [],
    ),
    rules: collection([], []),
    apps: collection([], []),
    appGroups: collection([], []),
    ...overrides,
  };
}

async function exportToCsv(
  descriptor: EntityExport<ReportRow>,
  snapshot: OrgSnapshotView,
  enabledColumnIds: string[],
): Promise<{ csv: string; filename: string }> {
  const source = descriptor.source;
  if (source?.kind !== 'snapshot') throw new Error('expected a snapshot-sourced descriptor');
  const { rows, resolution } = source.read(snapshot);

  const { runExport } = createExportEngineOperations(makeFakeCore());
  await runExport({ descriptor, rows, enabledColumnIds, resolution });
  await flush();

  const [csv, filename] = mockedDownloadCSV.mock.calls[0];
  return { csv, filename };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('the report descriptors as a contract', () => {
  it('registers three snapshot-sourced, whole-org descriptors', () => {
    expect(reportDescriptors).toHaveLength(3);
    for (const descriptor of reportDescriptors) {
      expect(descriptor.source?.kind).toBe('snapshot');
      expect(descriptor.context.kind).toBe('whole-org');
      expect(descriptor.endpoint).toBeUndefined();
      expect(descriptor.filter.kind).toBe('none');
    }
  });

  it('points every completenessColumnId at a column that exists', () => {
    for (const descriptor of reportDescriptors) {
      const source = descriptor.source;
      if (source?.kind !== 'snapshot') throw new Error('expected snapshot source');
      const ids = descriptor.columnCatalog.map((column) => column.id);
      expect(ids).toContain(source.completenessColumnId);
    }
  });
});

describe('CSV escaping of tenant-authored group names', () => {
  it.each([
    ['=', '=cmd|/c calc'],
    ['+', '+1+1'],
    ['-', '-2+3'],
    ['@', '@SUM(A1:A9)'],
  ])('neutralises a group name beginning with %s', async (_prefix, name) => {
    const { csv } = await exportToCsv(groupCleanupReportDescriptor, snapshotWithNames([name]), [
      'group-name',
    ]);

    const cell = csv.split('\n')[1];
    expect(cell.startsWith(`'${name}`)).toBe(true);
    expect(cell.startsWith(name)).toBe(false);
  });

  it('quotes a name containing a comma, a quote, or a newline (RFC 4180)', async () => {
    const { csv } = await exportToCsv(
      groupCleanupReportDescriptor,
      snapshotWithNames(['Sales, EMEA', 'The "Big" Group', 'Two\nLines']),
      ['group-name'],
    );

    const lines = csv.split('\n');
    expect(lines[1]).toBe('"Sales, EMEA"');
    expect(lines[2]).toBe('"The ""Big"" Group"');
    expect(csv).toContain('"Two\nLines"');
  });
});

describe('the caveat travels with the rows', () => {
  it('writes the caveat as a cell on every row', async () => {
    const { csv } = await exportToCsv(
      groupCleanupReportDescriptor,
      snapshotWithNames(['Alpha', 'Beta']),
      ['group-name', 'caveat'],
    );

    const lines = csv.split('\n');
    expect(lines[0]).toBe('Group,Caveat');
    expect(lines).toHaveLength(3);
    for (const line of lines.slice(1)) {
      expect(line).toContain('Findings, not a delete list.');
      expect(line).toContain('Okta Workflows, SCIM and HR provisioning');
    }
  });

  it('carries the dormant-access caveat, which is what permits the export at all', async () => {
    const snapshot: OrgSnapshotView = {
      groups: collection(
        [
          {
            id: '00gFAKE9',
            profile: { name: 'Legacy Contractors' },
            _embedded: { stats: { usersCount: 7 } },
            lastMembershipUpdated: new Date(WALK_AT - 400 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        [],
      ),
      rules: collection([], []),
      apps: collection([{ id: '0oaFAKE1', label: 'Concur' }], []),
      appGroups: collection([{ id: '00gFAKE9' }], [{ id: '0oaFAKE1::00gFAKE9' }]),
    };

    const { csv } = await exportToCsv(dormantAccessReportDescriptor, snapshot, [
      'group-name',
      'caveat',
    ]);

    const row = csv.split('\n')[1];
    expect(row).toContain('Measured from the last complete read of your groups');
    expect(row).toContain('none of them has written to this group');
  });
});

describe('a partial answer states its shortfall on every row', () => {
  function partialSnapshot(): OrgSnapshotView {
    return {
      groups: collection(
        [
          {
            id: '00gFAKE1',
            profile: { name: 'Sales Access' },
            _embedded: { stats: { usersCount: 5 } },
          },
        ],
        [],
      ),
      rules: collection([], []),
      apps: collection([{ id: '0oaFAKE1', label: 'Salesforce' }], []),
      appGroups: collection([{ id: '00gFAKE1' }], [{ id: '0oaFAKE1::00gFAKE1' }], {
        complete: false,
        lastFullWalkAt: null,
      }),
    };
  }

  it('forces the completeness column in even when the reader deselected it', async () => {
    const { csv } = await exportToCsv(unmaintainedAppAccessReportDescriptor, partialSnapshot(), [
      'group-name',
    ]);

    const lines = csv.split('\n');
    expect(lines[0]).toBe('Group,Completeness');
    expect(lines[1]).toContain('At least');
  });

  it('marks the filename -partial so the file is identifiable before it is opened', async () => {
    const { filename } = await exportToCsv(
      unmaintainedAppAccessReportDescriptor,
      partialSnapshot(),
      ['group-name'],
    );

    expect(filename).toContain('-report-unmaintained-app-access-partial-');
  });

  it('adds neither the column nor the marker when the answer is complete', async () => {
    const { csv, filename } = await exportToCsv(
      groupCleanupReportDescriptor,
      snapshotWithNames(['Alpha']),
      ['group-name'],
    );

    expect(csv.split('\n')[0]).toBe('Group');
    expect(filename).not.toContain('-partial-');
  });

  it('names the dormant report with the threshold the join actually applies (ADR-0067 §1)', () => {
    expect(dormantAccessReportDescriptor.displayName).toBe(`Report: ${dormantAccessLabel()}`);
    expect(dormantAccessReportDescriptor.displayName).toContain('6 months');
    expect(DORMANT_ACCESS_DAYS).toBe(180);
  });
});
