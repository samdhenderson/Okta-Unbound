import React from 'react';

export type ListRowDensity = 'compact' | 'comfortable';

export type ListRowState = 'default' | 'selected' | 'highlighted';

export type ListRowAs = 'div' | 'li' | 'a' | 'button';

const densityClasses: Record<ListRowDensity, string> = {
  compact: 'py-(--sp-row-y) px-(--sp-row-x)',
  comfortable: 'p-(--sp-card)',
};

const stateClasses: Record<ListRowState, string> = {
  default: 'border-neutral-200 bg-white',
  selected: 'border-primary bg-primary-light',
  highlighted: 'border-primary bg-primary-light ring-2 ring-primary ring-offset-2',
};

const baseClasses = 'rounded-md border';

const restingTransitionClass = 'transition-colors duration-(--dur-instant)';

const pressClasses = 'press press-subtle';

const hoverBorderClass = 'hover:border-neutral-500';

const interactiveClasses =
  'w-full text-left cursor-pointer ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const elementClasses: Partial<Record<ListRowAs, string>> = {
  a: 'block',
};

export interface ListRowProps {
  children: React.ReactNode;
  density?: ListRowDensity;
  state?: ListRowState;
  flash?: boolean;
  as?: ListRowAs;
  body?: React.ReactNode;
  headerClassName?: string;
  onHeaderClick?: () => void;
  onClick?: () => void;
  href?: string;
  target?: string;
  ariaLabel?: string;
  role?: string;
  ariaChecked?: boolean;
  title?: string;
  describedBy?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  elementRef?: React.Ref<HTMLElement>;
  testId?: string;
}

const ListRow: React.FC<ListRowProps> = ({
  children,
  density = 'comfortable',
  state = 'default',
  flash = false,
  as = 'div',
  body,
  headerClassName = '',
  onHeaderClick,
  onClick,
  href,
  target,
  ariaLabel,
  role,
  ariaChecked,
  title,
  describedBy,
  className = '',
  dataAttributes,
  elementRef,
  testId,
}) => {
  const interactive = as === 'button' || as === 'a' || onClick !== undefined;

  const hasBody = body !== undefined && body !== null;

  const classes = [
    baseClasses,
    interactive ? pressClasses : restingTransitionClass,
    hasBody ? 'overflow-hidden' : densityClasses[density],
    stateClasses[state],
    state === 'default' ? hoverBorderClass : '',
    interactive ? interactiveClasses : '',
    elementClasses[as] ?? '',
    flash ? 'animate-affirm-flash' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = hasBody ? (
    <>
      <div
        className={[densityClasses[density], headerClassName].filter(Boolean).join(' ')}
        onClick={onHeaderClick}
      >
        {children}
      </div>
      {body}
    </>
  ) : (
    children
  );

  const shared = {
    className: classes,
    onClick,
    title,
    'aria-label': ariaLabel,
    role,
    'aria-checked': ariaChecked,
    'aria-describedby': describedBy,
    'data-testid': testId,
    ...dataAttributes,
  };

  if (as === 'button') {
    return (
      <button type="button" ref={elementRef as React.Ref<HTMLButtonElement>} {...shared}>
        {content}
      </button>
    );
  }

  if (as === 'a') {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        ref={elementRef as React.Ref<HTMLAnchorElement>}
        {...shared}
      >
        {content}
      </a>
    );
  }

  if (as === 'li') {
    return (
      <li ref={elementRef as React.Ref<HTMLLIElement>} {...shared}>
        {content}
      </li>
    );
  }

  return (
    <div ref={elementRef as React.Ref<HTMLDivElement>} {...shared}>
      {content}
    </div>
  );
};

export default ListRow;
