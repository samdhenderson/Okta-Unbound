import React from 'react';
import { AlertMessage, Badge, Button, EmptyState, JsonViewer, PageHeader, Tabs } from './shared';
import { useApiExplorer } from '../hooks/useApiExplorer';
import PathCombobox from './explorer/PathCombobox';
import SamlTracer from './explorer/SamlTracer';
import { useHoleCandidates, type TabEntity } from '../hooks/useHoleCandidates';
import type { Suggestion } from '../apiCatalog/suggest';

export interface ApiExplorerTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
  isActive?: boolean;
  tabEntity?: TabEntity | null;
}

const statusVariant = (
  status: number | undefined,
): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === undefined) return 'neutral';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'danger';
  return 'neutral';
};

const ApiExplorerTab: React.FC<ApiExplorerTabProps> = ({
  targetTabId,
  oktaOrigin,
  isActive = true,
  tabEntity,
}) => {
  const { path, setPath, send, isLoading, error, clearError, result } = useApiExplorer({
    targetTabId,
    oktaOrigin,
  });

  const [pane, setPane] = React.useState<'request' | 'saml'>('request');

  const [hole, setHole] = React.useState<Suggestion['hole'] | null>(null);
  const { candidates } = useHoleCandidates({
    kind: hole?.kind ?? null,
    query: hole?.query ?? '',
    tabEntity,
    targetTabId,
    oktaOrigin,
    enabled: isActive,
  });

  const canSend = Boolean(targetTabId) && path.trim().length > 0 && !isLoading;

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="API Explorer"
        subtitle="Fire a read-only GET request and inspect the response"
      />

      <div className="max-w-7xl mx-auto px-(--sp-gutter) py-(--sp-gutter) space-y-(--sp-rung)">
        <Tabs
          ariaLabel="Explorer panes"
          activeKey={pane}
          onChange={(key) => setPane(key as 'request' | 'saml')}
          tabs={[
            { key: 'request', label: 'Request' },
            { key: 'saml', label: 'SAML' },
          ]}
        />

        {pane === 'saml' && (
          <SamlTracer isActive={isActive} targetTabId={targetTabId} oktaOrigin={oktaOrigin} />
        )}

        <div className={pane === 'request' ? 'space-y-(--sp-rung)' : 'hidden'}>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" solid title="Read-only for now — writes are a future feature">
              GET
            </Badge>
            <PathCombobox
              value={path}
              onChange={setPath}
              onSend={send}
              canSend={canSend}
              placeholder="/api/v1/apps?expand=user/{userId}"
              candidates={candidates}
              onHoleChange={setHole}
            />
            <Button variant="primary" onClick={send} disabled={!canSend} loading={isLoading}>
              Send
            </Button>
          </div>

          {error && (
            <AlertMessage message={{ text: error, type: 'danger' }} onDismiss={clearError} />
          )}

          {result && (
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(result.status)} testId="explorer-status-badge">
                {result.status ?? 'unknown'}
              </Badge>
            </div>
          )}

          {result ? (
            <JsonViewer
              raw={result.raw}
              redacted={result.redacted}
              redactedCount={result.redactedCount}
              shape={result.shape}
            />
          ) : (
            !error && (
              <EmptyState
                icon="search"
                title="No request sent yet"
                description="Type a same-origin Okta API path (e.g. /api/v1/apps?expand=user/{userId}) and press Send."
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiExplorerTab;
