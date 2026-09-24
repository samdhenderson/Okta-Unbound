import React, { useEffect, useState } from 'react';
import { Button } from '../shared';
import Icon from '../shared/Icon';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ConnectionStatus } from '../../hooks/useOktaTabContext';

export interface WelcomeViewProps {
  connectionStatus: ConnectionStatus;
  oktaOrigin: string | null;
  onOpenGuide: () => void;
  onDismiss: () => void;
}

function connectedHostname(status: ConnectionStatus, origin: string | null): string | null {
  if (status !== 'connected' || origin === null) return null;
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

function useSettled(reduced: boolean): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSettled(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return settled || reduced;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  connectionStatus,
  oktaOrigin,
  onOpenGuide,
  onDismiss,
}) => {
  const hostname = connectedHostname(connectionStatus, oktaOrigin);
  const reduced = useReducedMotion();
  const settled = useSettled(reduced);

  return (
    <main className="flex flex-col h-screen overflow-y-auto bg-canvas p-(--sp-gutter)">
      <div className="rise-in-stagger m-auto w-full max-w-md bg-white border border-neutral-200 rounded-md p-(--sp-card) text-center">
        <div className="mb-4">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light transition-transform duration-(--dur-move) ease-(--ease-affirm) ${
              settled ? 'scale-100' : 'scale-75'
            }`}
          >
            <Icon type="sparkles" size="xl" className="text-primary-text" />
          </div>
        </div>

        <h1
          className="text-xl font-semibold text-neutral-900 mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Welcome to Okta Unbound
        </h1>

        <p className="text-neutral-600 mb-6">
          Answers about who has what, why, and what happens if you change it, beside the console you
          already use.
        </p>

        <div className="flex flex-col gap-(--sp-field)">
          <Button variant="primary" fullWidth onClick={onOpenGuide}>
            Open the user guide
          </Button>
          <Button variant="secondary" fullWidth onClick={onDismiss}>
            Start using it
          </Button>
        </div>

        <p className="inline-flex items-center justify-center gap-2 text-sm text-neutral-600 mt-6">
          <span
            aria-hidden="true"
            data-connected={hostname !== null}
            className={`shrink-0 w-2 h-2 rounded-full border transition-[background-color,border-color,transform] duration-(--dur-tell) ease-(--ease-affirm) ${
              hostname === null
                ? 'bg-transparent border-neutral-400 scale-100'
                : 'bg-success border-success scale-125'
            }`}
          />
          <span key={hostname ?? 'none'} className="animate-rise-in">
            {hostname === null
              ? 'Open an Okta admin tab to connect.'
              : `Connected to ${hostname}. You're set.`}
          </span>
        </p>
      </div>
    </main>
  );
};

export default WelcomeView;
