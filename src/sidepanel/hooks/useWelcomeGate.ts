import { useCallback, useEffect, useState } from 'react';
import { openGuide as openGuideTab } from '../../shared/guide';
import {
  markWelcomeSeen,
  readWelcomeSeen,
  resetWelcomeSeen,
} from '../../shared/storage/welcomeStore';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('WelcomeGate');

export type WelcomeGateState = 'unknown' | 'unseen' | 'seen';

export interface WelcomeGate {
  state: WelcomeGateState;
  dismiss: () => void;
  showAgain: () => void;
  openGuide: () => void;
}

export function useWelcomeGate(): WelcomeGate {
  const [state, setState] = useState<WelcomeGateState>('unknown');

  useEffect(() => {
    let cancelled = false;
    void readWelcomeSeen().then((seen) => {
      if (cancelled) return;
      setState(seen ? 'seen' : 'unseen');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setState('seen');
    void markWelcomeSeen();
  }, []);

  const showAgain = useCallback(() => {
    setState('unseen');
    void resetWelcomeSeen();
  }, []);

  const openGuide = useCallback(() => {
    setState('seen');
    void markWelcomeSeen();
    openGuideTab('welcome').catch((error: unknown) => {
      log.error('Failed to open the guide', error);
    });
  }, []);

  return { state, dismiss, showAgain, openGuide };
}
