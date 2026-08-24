import React from 'react';
import { AlertMessage, Badge, Button, EmptyState, Input, JsonViewer, PageHeader } from './shared';
import { useApiExplorer } from '../hooks/useApiExplorer';

export interface ApiExplorerTabProps {
  targetTabId: number | null;
  oktaOrigin?: string;
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

const ApiExplorerTab: React.FC<ApiExplorerTabProps> = ({ targetTabId, oktaOrigin }) => {
  const { path, setPath, send, isLoading, error, clearError, result } = useApiExplorer({
    targetTabId,
    oktaOrigin,
  });

  const canSend = Boolean(targetTabId) && path.trim().length > 0 && !isLoading;

  return (
    <div className="tab-content active" style={{ fontFamily: 'var(--font-primary)', padding: 0 }}>
      <PageHeader
        title="API Explorer"
        subtitle="Fire a read-only GET request and inspect the response"
      />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="neutral" solid title="Read-only for now — writes are a future feature">
            GET
          </Badge>
          <Input
            value={path}
            onChange={setPath}
            placeholder="/api/v1/apps?expand=user/{userId}"
            ariaLabel="API path"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSend) send();
            }}
          />
          <Button variant="primary" onClick={send} disabled={!canSend} loading={isLoading}>
            Send
          </Button>
        </div>

        {error && <AlertMessage message={{ text: error, type: 'danger' }} onDismiss={clearError} />}

        {result && (
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(result.status)}>{result.status ?? 'unknown'}</Badge>
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
  );
};

export default ApiExplorerTab;
