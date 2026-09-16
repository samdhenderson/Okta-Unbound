import type { CoreApi } from './core';
import type { AuditLogEntry } from './types';
import type { EntityExport, CellValue } from '@/sidepanel/export/types';
import type { CountResolution } from '@/sidepanel/components/home/orgFigures';
import type { SelectionBasket } from '@/sidepanel/selection/selectionStore';
import {
  buildSelectionRequests,
  collectSelectionRows,
  parseSelectionEntity,
  type SelectionOutcome,
  type SelectionRequest,
  type SelectionRowsResult,
} from '@/sidepanel/export/fromSelection';
import { OperationCancelledError } from '@/shared/scheduler/cancellation';
import { parseNextLink, nextPageUrl } from '@/shared/utils/oktaPagination';
import { openingWalkEstimate, refinedWalkEstimate } from '@/shared/scheduler/planEstimate';
import { parseOktaList } from '@/shared/schemas/okta';
import {
  generateCSV,
  downloadCSV,
  sanitizeFilename,
  getDateForFilename,
} from '@/shared/utils/csvUtils';
import { auditStore } from '@/shared/storage/auditStore';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

const DEFAULT_MAX_ROWS = 50_000;

const ENTITY_GONE_STATUSES: readonly number[] = [404, 410];

export interface FetchAllResult<Row> {
  rows: Row[];
  fetched: number;
  dropped: number;
  capped: boolean;
}

export interface CountResult {
  count: number;
  hasMore: boolean;
}

export interface RunExportArgs<Row> {
  descriptor: EntityExport<Row>;
  rows: Row[];
  enabledColumnIds: string[];
  contextLabel?: string;
  resolution?: CountResolution;
  selection?: { requested: number; missing: number };
}

export interface SelectionFetchResult<Row> extends SelectionRowsResult<Row> {
  fetched: number;
  dropped: number;
  capped: boolean;
}

export function createExportEngineOperations(coreApi: CoreApi) {
  const fetchAllRows = async <Row>(
    descriptor: EntityExport<Row>,
    resolvedEndpoint: string,
    onPage?: (rowsSoFar: number) => void,
  ): Promise<FetchAllResult<Row>> => {
    const cap = descriptor.maxRows ?? DEFAULT_MAX_ROWS;
    const context = `EXPORT ${descriptor.id}`;

    return coreApi.withPlan(
      `Export: ${descriptor.displayName}`,
      [{ endpoint: resolvedEndpoint, method: 'GET', estimate: openingWalkEstimate() }],
      async (plan) => {
        const rows: Row[] = [];
        let fetched = 0;
        let dropped = 0;
        let capped = false;
        let pages = 0;
        let nextUrl: string | null = resolvedEndpoint;

        while (nextUrl) {
          coreApi.checkCancelled();
          const response = await coreApi.makeApiRequest(nextUrl, {
            method: 'GET',
            priority: 'low',
            reason: `Export: ${descriptor.displayName}`,
            planId: plan.planId,
          });
          if (!response.success) {
            throw new Error(response.error || `Export fetch failed (${descriptor.id})`);
          }
          pages++;

          const rawLength = Array.isArray(response.data) ? response.data.length : 0;
          fetched += rawLength;
          const page = parseOktaList(descriptor.schema, response.data, context) as Row[];
          dropped += rawLength - page.length;
          rows.push(...page);
          onPage?.(rows.length);
          coreApi.callbacks.onResult?.({ message: `Loaded ${rows.length} rows…`, type: 'info' });

          if (rows.length >= cap) {
            capped = true;
            rows.length = cap;
            break;
          }
          nextUrl = nextPageUrl(nextUrl, response.headers?.link, rawLength);
          plan.refine(resolvedEndpoint, refinedWalkEstimate(pages, nextUrl !== null));
        }

        if (capped) plan.refine(resolvedEndpoint, refinedWalkEstimate(pages, false));

        return { rows, fetched, dropped, capped };
      },
    );
  };

  const countRows = async <Row>(
    descriptor: EntityExport<Row>,
    resolvedEndpoint: string,
  ): Promise<CountResult> => {
    const response = await coreApi.makeApiRequest(resolvedEndpoint, {
      method: 'GET',
      priority: 'low',
      reason: `Count matches: ${descriptor.displayName}`,
    });
    if (!response.success) {
      throw new Error(response.error || `Count failed (${descriptor.id})`);
    }
    const page = parseOktaList(descriptor.schema, response.data, `COUNT ${descriptor.id}`);
    return { count: page.length, hasMore: parseNextLink(response.headers?.link) !== null };
  };

  const fetchSelectionRows = async <Row>(
    descriptor: EntityExport<Row>,
    basket: SelectionBasket,
    onProgress?: (rowsSoFar: number) => void,
  ): Promise<SelectionFetchResult<Row>> => {
    const requests = buildSelectionRequests(descriptor, basket);
    const cap = descriptor.maxRows ?? DEFAULT_MAX_ROWS;
    const context = `EXPORT ${descriptor.id}`;

    if (requests.length === 0) {
      return {
        rows: [],
        requested: 0,
        missing: [],
        duplicates: 0,
        fetched: 0,
        dropped: 0,
        capped: false,
      };
    }

    let fetched = 0;
    let dropped = 0;
    let capped = false;
    let rowsSoFar = 0;

    const batch = await coreApi.runOperation<SelectionRequest, SelectionOutcome<Row>>(
      `Export: ${descriptor.displayName}`,
      requests,
      async (request, _index, planId) => {
        coreApi.checkCancelled();
        const rows: Row[] = [];
        let nextUrl: string | null = request.endpoint;

        while (nextUrl) {
          const response = await coreApi.makeApiRequest(nextUrl, {
            method: 'GET',
            priority: 'low',
            reason: `Export: ${descriptor.displayName}`,
            planId,
          });

          if (!response.success) {
            if (!ENTITY_GONE_STATUSES.includes(response.status)) {
              throw new Error(response.error || `Export fetch failed (${descriptor.id})`);
            }
            log.warn('Ticked entity is gone; counted as missing', {
              entity: descriptor.id,
              kind: request.ref.kind,
              id: request.ref.id,
              status: response.status,
            });
            return { status: 'missing', ref: request.ref };
          }

          if (request.rows === 'entity') {
            fetched += 1;
            const row = parseSelectionEntity(descriptor, response.data);
            if (!row) {
              dropped += 1;
              return { status: 'missing', ref: request.ref };
            }
            rows.push(row);
            break;
          }

          const rawLength = Array.isArray(response.data) ? response.data.length : 0;
          fetched += rawLength;
          const page = parseOktaList(descriptor.schema, response.data, context) as Row[];
          dropped += rawLength - page.length;
          rows.push(...page);

          if (rows.length >= cap) {
            capped = true;
            break;
          }
          nextUrl = nextPageUrl(nextUrl, response.headers?.link, rawLength);
          coreApi.checkCancelled();
        }

        rowsSoFar += rows.length;
        onProgress?.(rowsSoFar);
        return { status: 'rows', ref: request.ref, rows };
      },
      {
        plan: { endpoint: requests[0].endpoint, method: 'GET', requestsPerItem: 1 },
        message: (progress) =>
          `Read ${progress.completed} of ${progress.total} ticked ${descriptor.context.kind === 'from-selection' ? descriptor.context.label : 'entities'}…`,
      },
    );

    if (batch.cancelled) throw new OperationCancelledError();
    const rejected = batch.results.find((result) => result.status === 'rejected');
    if (rejected) {
      throw rejected.error instanceof Error ? rejected.error : new Error(String(rejected.error));
    }

    const outcomes = batch.results.flatMap((result) => (result.value ? [result.value] : []));
    const collected = collectSelectionRows(descriptor, outcomes);
    if (collected.rows.length > cap) {
      collected.rows.length = cap;
      capped = true;
    }
    return { ...collected, fetched, dropped, capped };
  };

  const runExport = async <Row>(args: RunExportArgs<Row>): Promise<void> => {
    const { descriptor, rows, enabledColumnIds, contextLabel, resolution, selection } = args;
    const startTime = Date.now();

    const snapshotSource = descriptor.source?.kind === 'snapshot' ? descriptor.source : null;
    const isPartial = snapshotSource !== null && resolution?.status === 'partial';
    const forcedId = isPartial ? snapshotSource.completenessColumnId : undefined;
    const columns = descriptor.columnCatalog.filter(
      (column) => enabledColumnIds.includes(column.id) || column.id === forcedId,
    );
    const headers = columns.map((column) => column.label);
    const dataRows: CellValue[][] = rows.map((row) =>
      columns.map((column) => {
        const raw = column.accessor(row);
        if (column.format) return column.format(raw, row);
        return raw == null ? '' : String(raw);
      }),
    );

    const csv = generateCSV(headers, dataRows);
    const stem = sanitizeFilename(contextLabel ?? descriptor.displayName);
    const partialMarker = isPartial ? '-partial' : '';
    const selectionMarker = selection
      ? `-${selection.requested}-ticked${selection.missing > 0 ? `-${selection.missing}-missing` : ''}`
      : '';
    downloadCSV(
      csv,
      `${stem}-${descriptor.id}${selectionMarker}${partialMarker}-${getDateForFilename()}.csv`,
    );

    await logExportAudit(coreApi, descriptor, rows.length, startTime);
  };

  return { fetchAllRows, fetchSelectionRows, countRows, runExport };
}

async function logExportAudit(
  coreApi: CoreApi,
  descriptor: EntityExport,
  rowCount: number,
  startTime: number,
): Promise<void> {
  try {
    const actor = await coreApi.getCurrentUser();
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: 'export',
      groupId: descriptor.id,
      groupName: descriptor.displayName,
      performedBy: actor.kind === 'resolved' ? actor.email : null,
      actorResolution: actor.kind === 'resolved' ? 'resolved' : 'unavailable',
      affectedUsers: [],
      result: 'success',
      details: {
        usersSucceeded: rowCount,
        usersFailed: 0,
        apiRequestCount: 1,
        durationMs: Date.now() - startTime,
      },
    };
    auditStore.logOperation(entry).catch((err) => log.error('Failed to log export audit:', err));
  } catch (err) {
    log.error('Failed to build export audit entry:', err);
  }
}
