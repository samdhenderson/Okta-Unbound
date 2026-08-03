import React from 'react';
import Icon from '../../overview/shared/Icon';

interface RuleLinkRowProps {
  name: string;
  trailing?: React.ReactNode;
  detail?: string;
  onSelect?: () => void;
}

const rowClasses = 'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2';

const RuleLinkRow: React.FC<RuleLinkRowProps> = ({ name, trailing, detail, onSelect }) => {
  const body = (
    <>
      <span className="flex min-w-0 flex-col items-start text-left">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm text-neutral-900">{name}</span>
          {onSelect && (
            <span aria-hidden="true" className="flex shrink-0 text-neutral-400">
              <Icon type="chevron-right" size="sm" />
            </span>
          )}
        </span>
        {detail && (
          <span className="mt-0.5 truncate font-mono text-xs text-neutral-500">{detail}</span>
        )}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </>
  );

  if (!onSelect) {
    return <div className={`${rowClasses} border-neutral-200`}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open rule ${name} in the Rules tab`}
      className={`${rowClasses} border-neutral-200 text-left transition-colors duration-100 hover:border-primary hover:bg-primary-light focus:outline-2 focus:outline-offset-2 focus:outline-primary`}
    >
      {body}
    </button>
  );
};

export default RuleLinkRow;
