import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import { useExportPresets } from './useExportPresets';
import { buildExportEndpoint } from '../export/endpoint';
import { listDescriptors } from '../export/registry';
import type { EntityExport, ExportColumn, EntityContextOption } from '../export/types';
import type { ExportApiDeps } from '../export/types.deps';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useExportTab');

export interface ExportMatchCount {
  count: number;
  hasMore: boolean;
}

interface FetchResult<Row> {
  rows: Row[];
  fetched: number;
  dropped: number;
  capped: boolean;
}

export interface ExportTabApi {
  fetchExportRows: <Row>(
    descriptor: EntityExport<Row>,
    resolvedEndpoint: string,
    onPage?: (rowsSoFar: number) => void,
  ) => Promise<FetchResult<Row>>;
  countExportRows: <Row>(
    descriptor: EntityExport<Row>,
    resolvedEndpoint: string,
  ) => Promise<ExportMatchCount>;
  runExport: <Row>(args: {
    descriptor: EntityExport<Row>;
    rows: Row[];
    enabledColumnIds: string[];
    contextLabel?: string;
  }) => Promise<void>;
}

export interface UseExportTabOptions {
  api: ExportTabApi;
  registry: Record<string, EntityExport>;
  deps: ExportApiDeps;
  oktaOrigin?: string;
  hasConnectedTab: boolean;
  onError: (message: string | null) => void;
}

export type ExportPhase = 'pick' | 'configure';

export interface UseExportTab {
  phase: ExportPhase;
  descriptors: EntityExport[];
  descriptor: EntityExport | null;
  selectEntity: (id: string) => void;
  backToPick: () => void;

  enabledColumnIds: Set<string>;
  enabledColumns: ExportColumn<unknown>[];
  enabledCount: number;
  toggleColumn: (id: string) => void;

  contextId: string | null;
  contextLabel: string | null;
  setContext: (option: EntityContextOption | null) => void;
  contextSearch: (query: string) => Promise<EntityContextOption[]>;

  filterText: string;
  setFilterText: (text: string) => void;
  matchCount: ExportMatchCount | null;
  matchCountLoading: boolean;

  presets: ReturnType<typeof useExportPresets>['presets'];
  activePresetId: string | null;
  applyPreset: (id: string) => void;
  savePreset: (name: string) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;

  previewRows: unknown[] | null;
  fetched: number;
  dropped: number;
  capped: boolean;
  loadPreview: () => Promise<void>;
  download: () => Promise<void>;
  isBusy: boolean;

  canExport: boolean;
  hasConnectedTab: boolean;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useExportTab({
  api,
  registry,
  deps,
  oktaOrigin: _oktaOrigin,
  hasConnectedTab,
  onError,
}: UseExportTabOptions): UseExportTab {
  const { startProgress, updateProgress, completeProgress } = useProgress();

  const [phase, setPhase] = useState<ExportPhase>('pick');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enabledColumnIds, setEnabledColumnIds] = useState<Set<string>>(new Set());
  const [contextId, setContextId] = useState<string | null>(null);
  const [contextLabel, setContextLabel] = useState<string | null>(null);
  const [filterText, setFilterTextState] = useState('');
  const [matchCount, setMatchCount] = useState<ExportMatchCount | null>(null);
  const [matchCountLoading, setMatchCountLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<unknown[] | null>(null);
  const [fetched, setFetched] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [capped, setCapped] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const descriptors = useMemo(() => listDescriptors(registry), [registry]);
  const descriptor = selectedId ? (registry[selectedId] ?? null) : null;

  const validColumnIds = useMemo(
    () => descriptor?.columnCatalog.map((column) => column.id) ?? [],
    [descriptor],
  );
  const { presets, save, remove, loadLastUsed, saveLastUsed, reconcile } = useExportPresets(
    descriptor?.id ?? '',
    validColumnIds,
  );

  const enabledColumns = useMemo(
    () => descriptor?.columnCatalog.filter((column) => enabledColumnIds.has(column.id)) ?? [],
    [descriptor, enabledColumnIds],
  );
  const orderedEnabledIds = useMemo(
    () => enabledColumns.map((column) => column.id),
    [enabledColumns],
  );

  const selectEntity = useCallback(
    (id: string) => {
      const next = registry[id];
      if (!next) return;
      setSelectedId(id);
      setPhase('configure');
      setEnabledColumnIds(
        new Set(next.columnCatalog.filter((column) => column.defaultEnabled).map((c) => c.id)),
      );
      setFilterTextState('');
      setContextId(null);
      setContextLabel(null);
      setPreviewRows(null);
      setFetched(0);
      setDropped(0);
      setCapped(false);
      setActivePresetId(null);
      setMatchCount(null);
      onError(null);
    },
    [registry, onError],
  );

  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!descriptor) return;
    if (hydratedRef.current === descriptor.id) return;
    hydratedRef.current = descriptor.id;
    void (async () => {
      const last = await loadLastUsed();
      if (last && last.enabledColumnIds.length > 0) {
        setEnabledColumnIds(new Set(last.enabledColumnIds));
        setFilterTextState('');
      }
    })();
  }, [descriptor, loadLastUsed]);

  const backToPick = useCallback(() => {
    setPhase('pick');
    setSelectedId(null);
    hydratedRef.current = null;
    setPreviewRows(null);
    setActivePresetId(null);
    setMatchCount(null);
    onError(null);
  }, [onError]);

  const toggleColumn = useCallback((id: string) => {
    setEnabledColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setActivePresetId(null);
  }, []);

  const setFilterText = useCallback((text: string) => {
    setFilterTextState(text);
    setPreviewRows(null);
    setActivePresetId(null);
  }, []);

  const setContext = useCallback((option: EntityContextOption | null) => {
    setContextId(option?.id ?? null);
    setContextLabel(option?.label ?? null);
    setPreviewRows(null);
  }, []);

  const contextSearch = useCallback(
    (query: string): Promise<EntityContextOption[]> => {
      const context = descriptor?.context;
      if (!context || context.kind !== 'search-to-select') return Promise.resolve([]);
      if (/app/i.test(context.label) && deps.searchApps) return deps.searchApps(query);
      return deps.searchGroups(query);
    },
    [descriptor, deps],
  );

  const matchReqRef = useRef(0);
  useEffect(() => {
    if (!descriptor || descriptor.filter.kind === 'none') {
      setMatchCount(null);
      return;
    }
    if (descriptor.context.kind === 'search-to-select' && !contextId) {
      setMatchCount(null);
      return;
    }
    const reqId = ++matchReqRef.current;
    setMatchCountLoading(true);
    const timer = setTimeout(async () => {
      try {
        const endpoint = buildExportEndpoint(descriptor, {
          contextId: contextId ?? undefined,
          filterText,
        });
        const result = await api.countExportRows(descriptor, endpoint);
        if (matchReqRef.current === reqId) setMatchCount(result);
      } catch {
        log.warn('Match-count probe failed', { entity: descriptor.id });
        if (matchReqRef.current === reqId) setMatchCount(null);
      } finally {
        if (matchReqRef.current === reqId) setMatchCountLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [descriptor, contextId, filterText, api]);

  const applyPreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;
      setEnabledColumnIds(new Set(reconcile(preset.enabledColumnIds)));
      setFilterTextState(preset.filterText ?? '');
      setPreviewRows(null);
      setActivePresetId(id);
    },
    [presets, reconcile],
  );

  const savePreset = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const preset = await save(trimmed, orderedEnabledIds, filterText || undefined);
      if (preset) setActivePresetId(preset.id);
    },
    [save, orderedEnabledIds, filterText],
  );

  const deletePreset = useCallback(
    async (id: string) => {
      await remove(id);
      setActivePresetId((prev) => (prev === id ? null : prev));
    },
    [remove],
  );

  const fetchRows = useCallback(
    async (target: EntityExport): Promise<unknown[]> => {
      const endpoint = buildExportEndpoint(descriptor as EntityExport, {
        contextId: contextId ?? undefined,
        filterText,
      });
      startProgress(`Export: ${target.displayName}`, 'Fetching…', 0, true);
      try {
        const result = await api.fetchExportRows(target, endpoint, (n) => updateProgress(n));
        setPreviewRows(result.rows);
        setFetched(result.fetched);
        setDropped(result.dropped);
        setCapped(result.capped);
        return result.rows;
      } finally {
        completeProgress();
      }
    },
    [descriptor, contextId, filterText, api, startProgress, updateProgress, completeProgress],
  );

  const loadPreview = useCallback(async () => {
    if (!descriptor) return;
    setIsBusy(true);
    onError(null);
    try {
      await fetchRows(descriptor);
    } catch (error) {
      onError(toMessage(error));
    } finally {
      setIsBusy(false);
    }
  }, [descriptor, fetchRows, onError]);

  const download = useCallback(async () => {
    if (!descriptor) return;
    setIsBusy(true);
    onError(null);
    try {
      const rows = previewRows ?? (await fetchRows(descriptor));
      await api.runExport({
        descriptor,
        rows,
        enabledColumnIds: orderedEnabledIds,
        contextLabel: contextLabel ?? undefined,
      });
      await saveLastUsed(orderedEnabledIds);
    } catch (error) {
      onError(toMessage(error));
    } finally {
      setIsBusy(false);
    }
  }, [
    descriptor,
    previewRows,
    fetchRows,
    api,
    orderedEnabledIds,
    contextLabel,
    saveLastUsed,
    filterText,
    onError,
  ]);

  const contextReady = descriptor?.context.kind !== 'search-to-select' || contextId !== null;
  const canExport = enabledColumns.length > 0 && hasConnectedTab && contextReady && !isBusy;

  return {
    phase,
    descriptors,
    descriptor,
    selectEntity,
    backToPick,

    enabledColumnIds,
    enabledColumns,
    enabledCount: enabledColumns.length,
    toggleColumn,

    contextId,
    contextLabel,
    setContext,
    contextSearch,

    filterText,
    setFilterText,
    matchCount,
    matchCountLoading,

    presets,
    activePresetId,
    applyPreset,
    savePreset,
    deletePreset,

    previewRows,
    fetched,
    dropped,
    capped,
    loadPreview,
    download,
    isBusy,

    canExport,
    hasConnectedTab,
  };
}
