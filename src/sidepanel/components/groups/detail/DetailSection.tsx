import React from 'react';

interface DetailSectionProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  headingId?: string;
  children: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  description,
  actions,
  headingId,
  children,
}) => (
  <section
    aria-labelledby={headingId}
    className="rounded-md border border-neutral-200 bg-white px-4 py-3"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2
          id={headingId}
          className="text-xs font-semibold uppercase tracking-wide text-neutral-600"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

export default DetailSection;
