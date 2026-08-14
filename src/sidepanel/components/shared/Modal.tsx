import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from '../overview/shared/Icon';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const EXIT_MS = 140;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduced = useReducedMotion();

  const [present, setPresent] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(isOpen);

  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setPresent(true);
      setClosing(false);
    } else if (present) {
      if (reduced) setPresent(false);
      else setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const panel = panelRef.current;

    const finish = (event?: { target: unknown }) => {
      if (event && event.target !== panel) return;
      setPresent(false);
      setClosing(false);
    };

    const timer = window.setTimeout(finish, EXIT_MS);
    panel?.addEventListener('animationend', finish);
    panel?.addEventListener('transitionend', finish);
    return () => {
      window.clearTimeout(timer);
      panel?.removeEventListener('animationend', finish);
      panel?.removeEventListener('transitionend', finish);
    };
  }, [closing]);

  const requestClose = useCallback(() => {
    if (closing) return;
    onClose();
  }, [closing, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [requestClose],
  );

  if (!present) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-50 isolate ${
        closing ? 'animate-overlay-out pointer-events-none' : 'animate-overlay-in'
      }`}
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={closing || undefined}
        inert={closing || undefined}
        tabIndex={-1}
        className={`bg-white rounded-md shadow-xl ${sizeClasses[size]} w-full mx-4 my-4 max-h-[calc(100vh-2rem)] flex flex-col focus:outline-none ${
          closing ? 'animate-panel-out' : 'animate-panel-in'
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{ fontFamily: 'var(--font-primary)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <h3 id={titleId} className="text-lg font-semibold text-neutral-900">
            {title}
          </h3>
          <button
            onClick={requestClose}
            className="text-neutral-400 hover:text-neutral-700 transition-colors duration-(--dur-instant) p-1 rounded-md hover:bg-neutral-50"
            aria-label="Close modal"
          >
            <Icon type="close" size="md" />
          </button>
        </div>

        <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto scrollable-list">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 rounded-b-md border-t border-neutral-200 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
