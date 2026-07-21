import React, { useCallback, useMemo, useState } from 'react';
import { PageHeader, AlertMessage, Button } from '../shared';
import { useOktaApi } from '../../hooks/useOktaApi';
import { useExportTab } from '../../hooks/useExportTab';
import { buildRegistry } from '../../export/registry';
import type { ExportApiDeps } from '../../export/types.deps';
import EntityPicker from './EntityPicker';
import ExportContextBar from './ExportContextBar';
import ExportFilterBox from './ExportFilterBox';
import ColumnPicker from './ColumnPicker';
import PresetControls from './PresetControls';
import ExportPreviewTable from './ExportPreviewTable';

interface ExportTabProps {
  targetTabId?: number;
  oktaOrigin?: string;
}

const ExportTab: React.FC<ExportTabProps> = ({ targetTabId, oktaOrigin }) => {
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
      if (type === 'error') setError(message);
    },
    [],
  );

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
  });

  const { descriptor } = tab;

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader title="Export" subtitle="Download reports across your org" />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
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
          <div className="space-y-6">
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
