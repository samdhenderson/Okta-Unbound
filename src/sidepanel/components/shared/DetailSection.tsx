import React, { useId, useState } from 'react';
import Badge from './Badge';
import Icon from './Icon';

export interface DetailSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  band?: React.ReactNode;
  headingId?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  itemCount?: number;
  summary?: React.ReactNode;
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  actions,
  band,
  headingId,
  collapsible = false,
  defaultOpen = true,
  itemCount,
  summary,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyId = useId();

  const discloses = collapsible && Boolean(title);

  const hasHeader = Boolean(title || description || actions || itemCount !== undefined);

  const count =
    itemCount !== undefined ? (
      <Badge variant="neutral" testId="detail-section-count">
        {itemCount}
      </Badge>
    ) : null;

  const heading = title ? (
    <h2
      id={headingId}
      className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      {discloses ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex items-center gap-(--sp-inline) text-left uppercase tracking-wide"
        >
          <Icon
            type="chevron-right"
            size="sm"
            aria-hidden="true"
            className={`shrink-0 text-neutral-400 transition-transform duration-(--dur-quick) ease-standard ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
          <span>{title}</span>
          {count}
        </button>
      ) : (
        <span className="flex items-center gap-(--sp-inline)">
          <span>{title}</span>
          {count}
        </span>
      )}
    </h2>
  ) : null;

  const header = hasHeader ? (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {heading}
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  ) : null;

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={`rounded-md border border-neutral-200 bg-white${band ? ' overflow-hidden' : ''}`}
    >
      {band && <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">{band}</div>}
      {discloses ? (
        <>
          <div className="px-4 py-3">
            {header}
            {summary && !isOpen && <div className="mt-2">{summary}</div>}
          </div>
          <div id={bodyId} className="disclose" data-open={isOpen} inert={!isOpen || undefined}>
            <div>
              <div className="px-4 pb-3">{children}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 py-3">
          {header}
          <div className={hasHeader ? 'mt-3' : undefined}>{children}</div>
        </div>
      )}
    </section>
  );
};

export default DetailSection;
