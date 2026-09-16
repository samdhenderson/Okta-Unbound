import { useCallback, useRef, useState } from 'react';
import {
  RUN_WRITE_CAP,
  VerbRefusal,
  type BasketVerb,
  type VerbContext,
  type VerbField,
  type VerbOutcome,
  type VerbPreflight,
} from '../../../selection/verbs/types';
import { createLogger } from '../../../../shared/utils/logger';

const log = createLogger('VerbRun');

export type RunStage =
  'idle' | 'preparing' | 'compose' | 'measuring' | 'confirm' | 'running' | 'results';

export interface VerbRun {
  verb: BasketVerb | null;
  stage: RunStage;
  preflight: VerbPreflight | null;
  fields: readonly VerbField[];
  values: Record<string, string>;
  setValue: (id: string, value: string) => void;
  isComposed: boolean;
  isRefreshing: boolean;
  submitFields: () => void;
  progress: string;
  outcome: VerbOutcome | null;
  error: string | null;
  start: (verb: BasketVerb) => void;
  confirm: () => void;
  close: () => void;
}

export interface UseVerbRunOptions {
  makeContext: (
    report: (message: string) => void,
    values: Record<string, string>,
    memo: Map<string, unknown>,
  ) => VerbContext;
}

function seededAnswers(
  resolved: readonly VerbField[],
  keep: Record<string, string>,
): Record<string, string> {
  const seeded: Record<string, string> = {};
  for (const field of resolved) {
    const kept = keep[field.id];
    if (kept !== undefined && kept !== '') {
      seeded[field.id] = kept;
      continue;
    }
    if (field.options?.length === 1) seeded[field.id] = field.options[0].value;
  }
  return seeded;
}

function refusedBefore(thrown: VerbRefusal): VerbPreflight {
  return {
    cost: { requests: 0, writes: 0 },
    items: 0,
    lines: [],
    refusal: { code: thrown.code, message: thrown.message },
  };
}

export function useVerbRun({ makeContext }: UseVerbRunOptions): VerbRun {
  const [verb, setVerb] = useState<BasketVerb | null>(null);
  const [stage, setStage] = useState<RunStage>('idle');
  const [preflight, setPreflight] = useState<VerbPreflight | null>(null);
  const [progress, setProgress] = useState('');
  const [outcome, setOutcome] = useState<VerbOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<readonly VerbField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = useRef(0);

  const memo = useRef<Map<string, unknown>>(new Map());

  const close = useCallback(() => {
    setVerb(null);
    setStage('idle');
    setPreflight(null);
    setProgress('');
    setOutcome(null);
    setError(null);
    setFields([]);
    setValues({});
    setIsRefreshing(false);
    refreshToken.current += 1;
    memo.current = new Map();
  }, []);

  const measureOrConfirm = useCallback(
    (next: BasketVerb, answers: Record<string, string>) => {
      const measure = next.preflight;
      if (!measure) {
        setStage('confirm');
        return;
      }

      setStage('measuring');
      void (async () => {
        try {
          const measured = await measure(makeContext(setProgress, answers, memo.current));
          setPreflight(
            measured.cost.writes > RUN_WRITE_CAP
              ? {
                  ...measured,
                  refusal: {
                    code: 'over-write-cap',
                    message: `This would change ${measured.cost.writes.toLocaleString()} entities, past the ${RUN_WRITE_CAP.toLocaleString()} one run may change. Nothing has been changed. Narrow the selection and run it again.`,
                  },
                }
              : measured,
          );
          setStage('confirm');
        } catch (thrown) {
          if (thrown instanceof VerbRefusal) {
            setPreflight(refusedBefore(thrown));
            setStage('confirm');
            return;
          }
          log.error('A verb preflight failed', { verb: next.id });
          setError(thrown instanceof Error ? thrown.message : 'The preflight failed.');
          setStage('results');
        }
      })();
    },
    [makeContext],
  );

  const start = useCallback(
    (next: BasketVerb) => {
      setVerb(next);
      setPreflight(null);
      setProgress('');
      setOutcome(null);
      setError(null);
      setFields([]);
      setValues({});
      memo.current = new Map();

      const prepare = next.prepareFields;
      if (!prepare) {
        measureOrConfirm(next, {});
        return;
      }

      setStage('preparing');
      void (async () => {
        try {
          const resolved = await prepare(makeContext(setProgress, {}, memo.current));
          setFields(resolved);
          setValues(seededAnswers(resolved, {}));
          setStage('compose');
        } catch (thrown) {
          if (thrown instanceof VerbRefusal) {
            setPreflight(refusedBefore(thrown));
            setStage('confirm');
            return;
          }
          log.error('Resolving a verb’s inputs failed', { verb: next.id });
          setError(thrown instanceof Error ? thrown.message : 'The inputs could not be loaded.');
          setStage('results');
        }
      })();
    },
    [makeContext, measureOrConfirm],
  );

  const setValue = useCallback(
    (id: string, value: string) => {
      const answers = { ...values, [id]: value };
      setValues(answers);

      const driver = fields.find((field) => field.id === id);
      const prepare = verb?.prepareFields;
      if (!driver?.refreshesFields || !prepare) return;

      const keep: Record<string, string> = {};
      for (const field of fields) {
        if (field.refreshesFields) keep[field.id] = answers[field.id] ?? '';
      }

      refreshToken.current += 1;
      const token = refreshToken.current;
      setIsRefreshing(true);
      void (async () => {
        try {
          const resolved = await prepare(makeContext(setProgress, answers, memo.current));
          if (token !== refreshToken.current) return;
          setFields(resolved);
          setValues(seededAnswers(resolved, keep));
        } catch (thrown) {
          if (token !== refreshToken.current) return;
          if (thrown instanceof VerbRefusal) {
            setPreflight(refusedBefore(thrown));
            setStage('confirm');
            return;
          }
          log.error('Re-resolving a verb’s inputs failed', { verb: verb?.id });
          setError(thrown instanceof Error ? thrown.message : 'The inputs could not be loaded.');
          setStage('results');
        } finally {
          if (token === refreshToken.current) setIsRefreshing(false);
        }
      })();
    },
    [fields, values, verb, makeContext],
  );

  const isComposed =
    !isRefreshing &&
    fields.every((field) => field.required === false || (values[field.id] ?? '').trim().length > 0);

  const submitFields = useCallback(() => {
    if (verb && isComposed) measureOrConfirm(verb, values);
  }, [verb, isComposed, values, measureOrConfirm]);

  const confirm = useCallback(() => {
    if (!verb) return;
    setStage('running');
    setProgress('');
    void (async () => {
      try {
        const result = await verb.run(
          makeContext(setProgress, values, memo.current),
          preflight ?? undefined,
        );
        setOutcome(result);
      } catch (thrown) {
        log.error('A verb run failed', { verb: verb.id });
        setError(thrown instanceof Error ? thrown.message : 'The run failed.');
      } finally {
        setStage('results');
      }
    })();
  }, [verb, preflight, values, makeContext]);

  return {
    verb,
    stage,
    preflight,
    progress,
    outcome,
    error,
    fields,
    values,
    setValue,
    isComposed,
    isRefreshing,
    submitFields,
    start,
    confirm,
    close,
  };
}
