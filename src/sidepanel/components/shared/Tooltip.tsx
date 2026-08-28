import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const HOVER_INTENT_MS = 400;

const EDGE_GUTTER = 4;

export interface TooltipTriggerProps {
  'aria-describedby': string | undefined;
  onPointerEnter: React.PointerEventHandler<HTMLElement>;
  onPointerLeave: React.PointerEventHandler<HTMLElement>;
  onFocus: React.FocusEventHandler<HTMLElement>;
  onBlur: React.FocusEventHandler<HTMLElement>;
}

interface TooltipProps {
  label: string;
  disabled?: boolean;
  children: (trigger: TooltipTriggerProps) => React.ReactNode;
}

interface ChipAnchor {
  centre: number;
  bottom: number;
}

const Tooltip: React.FC<TooltipProps> = ({ label, disabled = false, children }) => {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [anchor, setAnchor] = useState<ChipAnchor | null>(null);
  const [pending, setPending] = useState<HTMLElement | null>(null);
  const chipRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setPending(null);
    setAnchor(null);
  }, []);

  const open = useCallback(
    (event: React.SyntheticEvent<HTMLElement>) => {
      if (!disabled) setPending(event.currentTarget);
    },
    [disabled],
  );

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      const rect = pending.getBoundingClientRect();
      setAnchor({ centre: rect.left + rect.width / 2, bottom: rect.bottom });
    }, HOVER_INTENT_MS);
    return () => window.clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    if (!anchor) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [anchor, close]);

  useLayoutEffect(() => {
    const chip = chipRef.current;
    if (!chip || !anchor) return;
    const half = chip.offsetWidth / 2;
    const min = EDGE_GUTTER + half;
    const max = window.innerWidth - EDGE_GUTTER - half;
    const clamped = max < min ? anchor.centre : Math.min(Math.max(anchor.centre, min), max);
    if (clamped !== anchor.centre) {
      setAnchor({ centre: clamped, bottom: anchor.bottom });
    }
  }, [anchor]);

  const trigger: TooltipTriggerProps = {
    'aria-describedby': anchor ? id : undefined,
    onPointerEnter: open,
    onPointerLeave: close,
    onFocus: open,
    onBlur: close,
  };

  const chip = anchor ? (
    <div
      className="pointer-events-none fixed z-50 mt-1.5 -translate-x-1/2"
      style={{ left: anchor.centre, top: anchor.bottom }}
    >
      <div
        ref={chipRef}
        id={id}
        role="tooltip"
        className={`whitespace-nowrap rounded-sm bg-neutral-900 px-(--sp-inline) py-1 text-xs font-medium leading-none text-white ${
          reducedMotion ? '' : 'animate-rise-in'
        }`}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        {label}
      </div>
    </div>
  ) : null;

  return (
    <>
      {children(trigger)}
      {chip && typeof document !== 'undefined' ? createPortal(chip, document.body) : null}
    </>
  );
};

export default Tooltip;
