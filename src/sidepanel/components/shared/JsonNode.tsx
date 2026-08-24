import React, { useState } from 'react';
import Icon from '../overview/shared/Icon';

interface JsonNodeProps {
  keyLabel?: string;
  value: unknown;
  depth: number;
}

const PrimitiveValue: React.FC<{ value: unknown }> = ({ value }) => {
  if (value === null) return <span className="text-neutral-400">null</span>;
  if (typeof value === 'string')
    return <span className="text-success-text">&quot;{value}&quot;</span>;
  if (typeof value === 'number') return <span className="text-primary">{value}</span>;
  if (typeof value === 'boolean') return <span className="text-warning-text">{String(value)}</span>;
  return <span>{String(value)}</span>;
};

const JsonNode: React.FC<JsonNodeProps> = ({ keyLabel, value, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object' && !isArray;

  if (!isArray && !isObject) {
    return (
      <div
        className="flex items-baseline gap-1 py-0.5 font-mono text-xs"
        style={{ paddingLeft: depth * 12 + 16 }}
      >
        {keyLabel !== undefined && <span className="text-primary-dark">{keyLabel}:</span>}
        <PrimitiveValue value={value} />
      </div>
    );
  }

  const entries: Array<[string, unknown]> = isArray
    ? (value as unknown[]).map((item, index) => [String(index), item])
    : Object.entries(value as Record<string, unknown>);
  const [openBracket, closeBracket] = isArray ? ['[', ']'] : ['{', '}'];

  return (
    <div className="font-mono text-xs">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-1 rounded py-0.5 text-left hover:bg-neutral-50"
        style={{ paddingLeft: depth * 12 }}
        aria-expanded={isOpen}
      >
        <Icon
          type="chevron-right"
          size="xs"
          className={`shrink-0 transition-transform duration-(--dur-instant) ${isOpen ? 'rotate-90' : ''}`}
        />
        {keyLabel !== undefined && <span className="text-primary-dark">{keyLabel}:</span>}
        <span className="text-neutral-400">
          {openBracket}
          {!isOpen && ` ${entries.length} ${isArray ? 'items' : 'keys'} ${closeBracket}`}
        </span>
      </button>
      {isOpen && (
        <div>
          {entries.map(([entryKey, entryValue]) => (
            <JsonNode
              key={entryKey}
              keyLabel={isArray ? undefined : entryKey}
              value={entryValue}
              depth={depth + 1}
            />
          ))}
          <div className="text-neutral-400" style={{ paddingLeft: (depth + 1) * 12 }}>
            {closeBracket}
          </div>
        </div>
      )}
    </div>
  );
};

export default JsonNode;
