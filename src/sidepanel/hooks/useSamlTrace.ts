import { useCallback, useRef, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import type { SamlTraceResult, SamlTraceReason } from './useOktaApi/samlOperations';

export type { SamlTraceResult, SamlTraceReason };

export interface UseSamlTraceResult {
  trace: (appId: string) => Promise<SamlTraceResult>;
  isTracing: boolean;
}

export interface UseSamlTraceOptions {
  targetTabId: number | null;
  oktaOrigin?: string;
}

export function useSamlTrace({ targetTabId, oktaOrigin }: UseSamlTraceOptions): UseSamlTraceResult {
  const { fetchAppAssertion } = useOktaApi({ targetTabId, oktaOrigin });
  const [isTracing, setIsTracing] = useState(false);
  const inFlight = useRef(false);

  const trace = useCallback(
    async (appId: string): Promise<SamlTraceResult> => {
      if (inFlight.current) return { ok: false, reason: 'fetch-failed' };
      inFlight.current = true;
      setIsTracing(true);
      try {
        return await fetchAppAssertion(appId, oktaOrigin);
      } finally {
        inFlight.current = false;
        setIsTracing(false);
      }
    },
    [fetchAppAssertion, oktaOrigin],
  );

  return { trace, isTracing };
}
