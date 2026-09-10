import React, { useState } from 'react';
import Tabs from './Tabs';
import CopyButton from './CopyButton';
import AlertMessage from './AlertMessage';
import JsonNode from './JsonNode';

type ViewMode = 'shape' | 'redacted' | 'raw';

interface JsonViewerProps {
  raw: unknown;
  redacted: unknown;
  redactedCount: number;
  shape: string;
  className?: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({
  raw,
  redacted,
  redactedCount,
  shape,
  className = '',
}) => {
  const [view, setView] = useState<ViewMode>('shape');

  const getCopyText = () => {
    if (view === 'shape') return shape;
    return JSON.stringify(view === 'redacted' ? redacted : raw, null, 2);
  };

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Tabs
          ariaLabel="Response view"
          activeKey={view}
          onChange={(key) => setView(key as ViewMode)}
          tabs={[
            { key: 'shape', label: 'Shape' },
            {
              key: 'redacted',
              label: 'Redacted',
              count: redactedCount > 0 ? redactedCount : undefined,
            },
            { key: 'raw', label: 'Raw' },
          ]}
        />
        <CopyButton label="Copy" getText={getCopyText} size="sm" />
      </div>

      {view === 'raw' && (
        <AlertMessage
          className="mb-2"
          message={{
            type: 'warning',
            text: 'Raw is fully unredacted — confirm before pasting this anywhere else.',
          }}
        />
      )}

      <div className="max-h-[60vh] overflow-auto rounded-md border border-neutral-200 bg-white p-3">
        {view === 'shape' ? (
          <pre className="whitespace-pre-wrap font-mono text-xs">{shape}</pre>
        ) : (
          <JsonNode value={view === 'redacted' ? redacted : raw} depth={0} />
        )}
      </div>
    </div>
  );
};

export default JsonViewer;
