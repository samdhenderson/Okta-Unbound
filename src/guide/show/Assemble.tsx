import React, { useLayoutEffect, useRef } from 'react';

export interface AssembleProps {
  selector?: string;
  live?: boolean;
  as?: 'div' | 'ul' | 'ol';
  className?: string;
  children: React.ReactNode;
}

const Assemble: React.FC<AssembleProps> = ({
  selector = ':scope > *',
  live = true,
  as: Tag = 'div',
  className,
  children,
}) => {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(selector).forEach((el, index) => {
      el.style.setProperty('--guide-i', String(index));
      el.setAttribute('data-guide-piece', '');
    });
  }, [selector, children]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLUListElement & HTMLOListElement>}
      className={`guide-assemble${className ? ` ${className}` : ''}`}
      data-live={live || undefined}
    >
      {children}
    </Tag>
  );
};

export default Assemble;
