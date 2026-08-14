import React, { useId, useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  itemCount?: number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
  itemCount,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className="rounded-md border border-neutral-200 bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left font-semibold text-neutral-900 bg-white hover:bg-neutral-50 transition-colors duration-(--dur-instant) border-b border-neutral-200"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-controls={bodyId}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-neutral-400 transition-transform duration-(--dur-instant) ease-standard ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold">{title}</span>
          {itemCount !== undefined && (
            <span className="px-2 py-0.5 bg-neutral-50 rounded-md text-xs font-medium text-neutral-600 border border-neutral-200">
              {itemCount}
            </span>
          )}
        </div>
      </button>
      <div id={bodyId} className="disclose" data-open={isOpen} inert={!isOpen || undefined}>
        <div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
