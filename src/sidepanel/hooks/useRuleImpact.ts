import { useCallback, useRef, useState } from 'react';
import type { RuleImpactSummary } from '../../shared/membership/ruleImpact';
import type { RuleImpactInput } from './useOktaApi/ruleImpact';
import { createLogger } from '../../shared/utils/logger';

const log = createLogger('useRuleImpact');

export type RuleImpactMode = 'preview' | 'deactivate';

export type RuleImpactStatus = 'idle' | 'loading' | 'done' | 'error';

export interface RuleImpactProgress {
  current: number;
  total: number;
  message: string;
}

type CaptureRuleImpact = (
  rule: RuleImpactInput,
  opts?: { onProgress?: (current: number, total: number, message: string) => void },
) => Promise<RuleImpactSummary>;

export interface UseRuleImpactReturn {
  rule: RuleImpactInput | null;
  mode: RuleImpactMode;
  status: RuleImpactStatus;
  summary: RuleImpactSummary | null;
  error: string | null;
  progress: RuleImpactProgress | null;
  open: (rule: RuleImpactInput, mode: RuleImpactMode) => void;
  close: () => void;
}

export function useRuleImpact(captureRuleImpact: CaptureRuleImpact): UseRuleImpactReturn {
  const [rule, setRule] = useState<RuleImpactInput | null>(null);
  const [mode, setMode] = useState<RuleImpactMode>('preview');
  const [status, setStatus] = useState<RuleImpactStatus>('idle');
  const [summary, setSummary] = useState<RuleImpactSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RuleImpactProgress | null>(null);

  const runIdRef = useRef(0);

  const open = useCallback(
    (nextRule: RuleImpactInput, nextMode: RuleImpactMode) => {
      const runId = ++runIdRef.current;
      setRule(nextRule);
      setMode(nextMode);
      setStatus('loading');
      setSummary(null);
      setError(null);
      setProgress({ current: 0, total: nextRule.groupIds.length, message: 'Starting analysis…' });

      captureRuleImpact(nextRule, {
        onProgress: (current, total, message) => {
          if (runId === runIdRef.current) setProgress({ current, total, message });
        },
      })
        .then((result) => {
          if (runId !== runIdRef.current) return;
          setSummary(result);
          setStatus('done');
          setProgress(null);
        })
        .catch((err) => {
          if (runId !== runIdRef.current) return;
          log.error('Failed to capture rule impact:', err);
          setError(err instanceof Error ? err.message : 'Failed to analyze rule impact');
          setStatus('error');
          setProgress(null);
        });
    },
    [captureRuleImpact],
  );

  const close = useCallback(() => {
    runIdRef.current++;
    setRule(null);
    setStatus('idle');
    setSummary(null);
    setError(null);
    setProgress(null);
  }, []);

  return { rule, mode, status, summary, error, progress, open, close };
}
