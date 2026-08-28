import React, { useId } from 'react';
import { Badge, IconButton, ListRow } from './shared';
import Icon from './shared/Icon';
import { formatActionTime } from '../../shared/undoManager';
import type { RequestLogEntry } from '../../shared/requestLogTypes';

const OUTCOME_BADGE: Partial<
  Record<RequestLogEntry['outcome'], { label: string; variant: 'warning' | 'danger' }>
> = {
  partial: { label: 'Some failed', variant: 'warning' },
  none: { label: 'Failed', variant: 'danger' },
};

export interface RequestLogRowProps {
  entry: RequestLogEntry;
  isExpanded: boolean;
  onToggle: (entryId: string) => void;
}

const RequestLogRow: React.FC<RequestLogRowProps> = ({ entry, isExpanded, onToggle }) => {
  const disclosureId = useId();
  const outcomeBadge = OUTCOME_BADGE[entry.outcome];
  const isBatch = entry.requestCount > 1;

  return (
    <ListRow
      density="compact"
      dataAttributes={{ 'data-request-log-id': entry.id }}
      body={
        <div
          id={disclosureId}
          className="disclose"
          data-open={isExpanded}
          inert={!isExpanded || undefined}
        >
          <div>
            <ul className="space-y-1 border-t border-neutral-200 px-3 pb-3 pt-2">
              {entry.endpoints.map((endpoint, index) => (
                <li key={`${endpoint.method} ${endpoint.endpoint} ${index}`} className="text-sm">
                  <span className="font-mono text-xs text-neutral-600">{endpoint.method}</span>{' '}
                  <span className="break-all text-neutral-900">{endpoint.endpoint}</span>
                </li>
              ))}
              {entry.endpointsTruncated && (
                <li className="text-xs text-neutral-500">
                  Showing {entry.endpoints.length} of {entry.requestCount} requests.
                </li>
              )}
            </ul>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {isBatch ? `${entry.requestCount} requests — ${entry.reason}` : entry.reason}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {!isBatch && (
              <Badge>
                {entry.endpoints[0]?.method} {entry.endpoints[0]?.endpoint}
              </Badge>
            )}
            {outcomeBadge && <Badge variant={outcomeBadge.variant}>{outcomeBadge.label}</Badge>}
            <span className="text-xs text-neutral-500">{formatActionTime(entry.timestamp)}</span>
          </div>
        </div>

        {isBatch && (
          <IconButton
            label={`${isExpanded ? 'Hide' : 'Show'} the ${entry.requestCount} requests for ${entry.reason}`}
            variant="ghost"
            size="sm"
            expanded={isExpanded}
            controls={disclosureId}
            className="shrink-0"
            onClick={() => onToggle(entry.id)}
          >
            <Icon
              type="chevron-right"
              size="sm"
              className={`transition-transform duration-(--dur-quick) ${isExpanded ? 'rotate-90' : ''}`}
            />
          </IconButton>
        )}
      </div>
    </ListRow>
  );
};

export default RequestLogRow;
