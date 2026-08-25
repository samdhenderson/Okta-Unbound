import React from 'react';

export interface DetailSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  band?: React.ReactNode;
  headingId?: string;
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  actions,
  band,
  headingId,
  children,
}) => {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={`rounded-md border border-neutral-200 bg-white${band ? ' overflow-hidden' : ''}`}
    >
      {band && <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">{band}</div>}
      <div className="px-4 py-3">
        {hasHeader && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h2
                  id={headingId}
                  className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        )}
        <div className={hasHeader ? 'mt-3' : undefined}>{children}</div>
      </div>
    </section>
  );
};

export default DetailSection;
