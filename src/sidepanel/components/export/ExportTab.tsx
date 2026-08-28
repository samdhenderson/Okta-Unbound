import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader, AlertMessage, Button } from '../shared';
import { useOktaApi } from '../../hooks/useOktaApi';
import type { OperationResult } from '../../hooks/useOktaApi/types';
import { useExportTab } from '../../hooks/useExportTab';
import { buildRegistry } from '../../export/registry';
import type { ExportApiDeps } from '../../export/types.deps';
import EntityPicker from './EntityPicker';
import ExportContextBar from './ExportContextBar';
import ExportFilterBox from './ExportFilterBox';
import ColumnPicker from './ColumnPicker';
import PresetControls from './PresetControls';
import ExportPreviewTable from './ExportPreviewTable';

export interface ExportRequest {
  descriptorId: string;
  contextId: string;
  contextLabel: string;
}

interface ExportTabProps {
  targetTabId?: number;
  oktaOrigin?: string;
  exportRequest?: ExportRequest | null;
  onExportRequestConsumed?: () => void;
  isActive?: boolean;
}

const ExportTab: React.FC<ExportTabProps> = ({
  targetTabId,
  oktaOrigin,
  exportRequest,
  onExportRequestConsumed,
  isActive = true,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback(({ message, type }: OperationResult) => {
    if (type === 'error') setError(message);
  }, []);

  const api = useOktaApi({ targetTabId: targetTabId ?? null, onResult: handleResult });

  const deps: ExportApiDeps = useMemo(
    () => ({
      searchGroups: async (query: string) => {
        const groups = await api.searchGroups(query);
        return groups.map((group) => ({
          id: group.id,
          label: group.name,
          sublabel: group.type,
        }));
      },
      searchApps: async (query: string) => {
        const apps = await api.searchApps(query);
        return apps.map((app) => ({
          id: app.id,
          label: app.label,
          sublabel: app.status,
        }));
      },
    }),
    [api],
  );

  const registry = useMemo(() => buildRegistry(deps), [deps]);

  const tab = useExportTab({
    api,
    registry,
    deps,
    oktaOrigin,
    hasConnectedTab: targetTabId != null,
    onError: setError,
    enabled: isActive,
  });

  const { descriptor, selectEntity, setContext } = tab;

  const handledExportRef = useRef<string | null>(null);
  useEffect(() => {
    if (!exportRequest) {
      handledExportRef.current = null;
      return;
    }
    const key = `${exportRequest.descriptorId}:${exportRequest.contextId}`;
    if (handledExportRef.current === key) return;
    handledExportRef.current = key;
    selectEntity(exportRequest.descriptorId);
    setContext({ id: exportRequest.contextId, label: exportRequest.contextLabel });
    onExportRequestConsumed?.();
  }, [exportRequest, selectEntity, setContext, onExportRequestConsumed]);

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader title="Export" subtitle="Download reports across your org" />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        {!tab.hasConnectedTab && (
          <AlertMessage message={{ type: 'danger', text: 'Connect an Okta tab to export.' }} />
        )}

        {error && (
          <AlertMessage
            message={{ type: 'danger', text: error }}
            onDismiss={() => setError(null)}
          />
        )}

        {tab.phase === 'pick' || !descriptor ? (
          <EntityPicker descriptors={tab.descriptors} onSelect={tab.selectEntity} />
        ) : (
          <div className="space-y-(--sp-rung)">
            <Button variant="secondary" size="sm" icon="minus" onClick={tab.backToPick}>
              All exports
            </Button>

            <div>
              <h2 className="text-lg font-semibold text-neutral-900">{descriptor.displayName}</h2>
              <p className="mt-0.5 text-sm text-neutral-600">{descriptor.description}</p>
            </div>

            {descriptor.context.kind === 'search-to-select' && (
              <ExportContextBar
                key={descriptor.id}
                label={descriptor.context.label}
                placeholder={descriptor.context.placeholder}
                search={tab.contextSearch}
                onSelect={tab.setContext}
                initialSelected={
                  tab.contextId
                    ? { id: tab.contextId, label: tab.contextLabel ?? tab.contextId }
                    : null
                }
              />
            )}

            {descriptor.filter.kind !== 'none' && (
              <ExportFilterBox
                value={tab.filterText}
                onChange={tab.setFilterText}
                help={descriptor.filter.help}
                placeholder={descriptor.filter.placeholder}
                matchCount={tab.matchCount}
                matchCountLoading={tab.matchCountLoading}
                disabled={descriptor.context.kind === 'search-to-select' && tab.contextId === null}
              />
            )}

            <ColumnPicker
              catalog={descriptor.columnCatalog}
              enabled={tab.enabledColumnIds}
              onToggle={tab.toggleColumn}
            />

            <PresetControls
              presets={tab.presets}
              activePresetId={tab.activePresetId}
              onApply={tab.applyPreset}
              onSave={tab.savePreset}
              onDelete={tab.deletePreset}
              canSave={tab.enabledCount > 0}
            />

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={tab.loadPreview}
                disabled={!tab.canExport}
                loading={tab.isBusy}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                icon="download"
                onClick={tab.download}
                disabled={!tab.canExport}
                loading={tab.isBusy}
              >
                Download CSV
              </Button>
            </div>

            {tab.previewRows !== null && (
              <ExportPreviewTable
                columns={tab.enabledColumns}
                rows={tab.previewRows}
                fetched={tab.fetched}
                dropped={tab.dropped}
                capped={tab.capped}
                linkify={descriptor.linkify}
                oktaOrigin={oktaOrigin}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportTab;
