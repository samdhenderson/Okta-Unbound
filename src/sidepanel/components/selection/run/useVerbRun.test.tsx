import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useVerbRun } from './useVerbRun';
import { RUN_WRITE_CAP, type BasketVerb, type VerbContext } from '../../../selection/verbs/types';

const makeContext = (
  report: (message: string) => void,
  values: Record<string, string>,
  memo: Map<string, unknown>,
) =>
  ({
    basket: { picked: [] },
    counts: {},
    addMany: vi.fn(),
    report,
    api: {} as VerbContext['api'],
    oktaOrigin: null,
    values,
    memo,
  }) satisfies VerbContext;

function verbOf(overrides: Partial<BasketVerb> & Pick<BasketVerb, 'id'>): BasketVerb {
  return {
    label: overrides.id,
    title: `Do ${overrides.id}`,
    path: 'read',
    needs: ['user'],
    cost: () => ({ requests: 1, writes: 0 }),
    run: vi.fn(async () => ({ status: 'done' as const, summary: 'Done.' })),
    ...overrides,
  };
}

describe('a verb with no preflight', () => {
  it('goes straight to the confirm — its own cost is the whole story', () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verbOf({ id: 'simple' })));
    expect(result.current.stage).toBe('confirm');
    expect(result.current.preflight).toBeNull();
  });

  it('runs on confirm and reports what came back', async () => {
    const run = vi.fn<BasketVerb['run']>(async () => ({
      status: 'done',
      summary: 'Ticked 12 users.',
    }));
    const { result } = renderHook(() => useVerbRun({ makeContext }));

    act(() => result.current.start(verbOf({ id: 'simple', run })));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.stage).toBe('results'));
    expect(result.current.outcome?.summary).toBe('Ticked 12 users.');
  });
});

describe('a verb with a preflight', () => {
  it('measures before it offers anything to confirm', async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const verb = verbOf({
      id: 'measured',
      path: 'write',
      preflight: async () => {
        await gate;
        return { cost: { requests: 3, writes: 3 }, items: 3, lines: ['Payments — 3'] };
      },
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));

    expect(result.current.stage).toBe('measuring');
    expect(result.current.preflight).toBeNull();

    await act(async () => {
      release?.();
      await gate;
    });
    await waitFor(() => expect(result.current.stage).toBe('confirm'));
    expect(result.current.preflight?.items).toBe(3);
  });

  it('hands the measurement to the run, so nothing is measured twice', async () => {
    const run = vi.fn<BasketVerb['run']>(async () => ({ status: 'done', summary: 'Done.' }));
    const measured = {
      cost: { requests: 1, writes: 1 },
      items: 1,
      lines: [],
      payload: { seen: 1 },
    };
    const verb = verbOf({ id: 'measured', path: 'write', preflight: async () => measured, run });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('confirm'));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.stage).toBe('results'));

    expect(run.mock.calls[0]?.[1]).toBe(measured);
  });

  it('refuses whole past the write cap rather than truncating to fit', async () => {
    const verb = verbOf({
      id: 'huge',
      path: 'write',
      preflight: async () => ({
        cost: { requests: RUN_WRITE_CAP + 1, writes: RUN_WRITE_CAP + 1 },
        items: RUN_WRITE_CAP + 1,
        lines: [],
      }),
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('confirm'));

    expect(result.current.preflight?.refusal?.code).toBe('over-write-cap');
    expect(result.current.preflight?.cost.writes).toBe(RUN_WRITE_CAP + 1);
  });

  it('states a failed preflight rather than swallowing it', async () => {
    const verb = verbOf({
      id: 'broken',
      path: 'write',
      preflight: async () => {
        throw new Error('the org said no');
      },
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));

    await waitFor(() => expect(result.current.stage).toBe('results'));
    expect(result.current.error).toBe('the org said no');
    expect(result.current.outcome).toBeNull();
  });
});

describe('a verb that asks the reader something', () => {
  const withFields = () =>
    verbOf({
      id: 'asked',
      prepareFields: async () => [
        {
          id: 'attribute',
          label: 'Attribute',
          options: [
            { value: 'department', label: 'Department' },
            { value: 'title', label: 'Title' },
          ],
        },
        { id: 'value', label: 'New value' },
      ],
    });

  it('withholds the confirm until every required field is answered', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(withFields()));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    expect(result.current.isComposed).toBe(false);
    act(() => result.current.setValue('attribute', 'department'));
    expect(result.current.isComposed).toBe(false);
    act(() => result.current.setValue('value', 'Payments'));
    expect(result.current.isComposed).toBe(true);
  });

  it('treats blank space as unanswered', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(withFields()));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    act(() => result.current.setValue('attribute', 'department'));
    act(() => result.current.setValue('value', '   '));
    expect(result.current.isComposed).toBe(false);
  });

  it('answers a one-option field rather than asking it', async () => {
    const verb = verbOf({
      id: 'only-one',
      prepareFields: async () => [
        {
          id: 'attribute',
          label: 'Attribute',
          options: [{ value: 'department', label: 'Department' }],
        },
      ],
    });
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    expect(result.current.values['attribute']).toBe('department');
    expect(result.current.isComposed).toBe(true);
  });

  it('hands the answers to the run', async () => {
    const run = vi.fn<BasketVerb['run']>(async () => ({ status: 'done', summary: 'Done.' }));
    const verb = verbOf({
      id: 'asked',
      run,
      prepareFields: async () => [{ id: 'value', label: 'New value' }],
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('compose'));
    act(() => result.current.setValue('value', 'Payments'));
    act(() => result.current.submitFields());
    await waitFor(() => expect(result.current.stage).toBe('confirm'));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.stage).toBe('results'));

    expect(run.mock.calls[0]?.[0]?.values).toEqual({ value: 'Payments' });
  });
});

describe('close', () => {
  it('leaves nothing from the last run behind', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verbOf({ id: 'simple' })));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.stage).toBe('results'));

    act(() => result.current.close());
    expect(result.current.stage).toBe('idle');
    expect(result.current.verb).toBeNull();
    expect(result.current.outcome).toBeNull();
    expect(result.current.values).toEqual({});
  });
});

describe('a field whose answer decides the next question', () => {
  const dependent = verbOf({
    id: 'dependent',
    prepareFields: async (context) => {
      const attribute = {
        id: 'attribute',
        label: 'Attribute',
        refreshesFields: true,
        options: [
          { value: 'department', label: 'Department' },
          { value: 'division', label: 'Division' },
        ],
      };
      if (context.values.attribute === 'division') {
        return [
          attribute,
          { id: 'value', label: 'New Division', options: [{ value: 'North', label: 'North' }] },
        ];
      }
      if (context.values.attribute === 'department') {
        return [attribute, { id: 'value', label: 'New Department' }];
      }
      return [attribute];
    },
  });

  it('asks again once the driving field is answered', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(dependent));
    await waitFor(() => expect(result.current.stage).toBe('compose'));
    expect(result.current.fields.map((field) => field.id)).toEqual(['attribute']);

    await act(async () => result.current.setValue('attribute', 'division'));

    await waitFor(() =>
      expect(result.current.fields.map((field) => field.id)).toEqual(['attribute', 'value']),
    );
    expect(result.current.fields[1].options).toEqual([{ value: 'North', label: 'North' }]);
    expect(result.current.values.value).toBe('North');
  });

  it('withholds Continue until the rebuilt form is the real one', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(dependent));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    act(() => {
      result.current.setValue('attribute', 'department');
    });
    expect(result.current.isComposed).toBe(false);

    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
    expect(result.current.fields).toHaveLength(2);
    expect(result.current.isComposed).toBe(false);

    await act(async () => result.current.setValue('value', 'Payments'));
    expect(result.current.isComposed).toBe(true);
  });

  it('drops a dependent answer when the question it answered changes', async () => {
    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(dependent));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    await act(async () => result.current.setValue('attribute', 'department'));
    await waitFor(() => expect(result.current.fields).toHaveLength(2));
    await act(async () => result.current.setValue('value', 'Payments'));

    await act(async () => result.current.setValue('attribute', 'division'));
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));

    expect(result.current.values.value).not.toBe('Payments');
    expect(result.current.values.attribute).toBe('division');
  });
});

describe('the run’s scratch space', () => {
  it('is one map across compose, measure and run, so a cohort is read once', async () => {
    const seen: Map<string, unknown>[] = [];
    const verb = verbOf({
      id: 'memoised',
      path: 'write',
      prepareFields: async (context) => {
        seen.push(context.memo);
        context.memo.set('cohort', [{ id: '00uFAKE1' }]);
        return [{ id: 'value', label: 'New value' }];
      },
      preflight: async (context) => {
        seen.push(context.memo);
        return { cost: { requests: 0, writes: 1 }, items: 1, lines: [] };
      },
      run: vi.fn(async (context) => {
        seen.push(context.memo);
        return { status: 'done' as const, summary: 'Done.' };
      }),
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('compose'));
    act(() => result.current.setValue('value', 'Payments'));
    act(() => result.current.submitFields());
    await waitFor(() => expect(result.current.stage).toBe('confirm'));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.stage).toBe('results'));

    expect(seen).toHaveLength(3);
    expect(seen[1]).toBe(seen[0]);
    expect(seen[2]).toBe(seen[0]);
    expect(seen[2]?.get('cohort')).toEqual([{ id: '00uFAKE1' }]);
  });

  it('is a fresh map for the next run, so nothing is measured against the last one', async () => {
    const seen: Map<string, unknown>[] = [];
    const sizeOnEntry: number[] = [];
    const verb = verbOf({
      id: 'memoised',
      prepareFields: async (context) => {
        seen.push(context.memo);
        sizeOnEntry.push(context.memo.size);
        context.memo.set('cohort', ['stale']);
        return [{ id: 'value', label: 'New value' }];
      },
    });

    const { result } = renderHook(() => useVerbRun({ makeContext }));
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('compose'));
    act(() => result.current.close());
    act(() => result.current.start(verb));
    await waitFor(() => expect(result.current.stage).toBe('compose'));

    expect(seen[1]).not.toBe(seen[0]);
    expect(sizeOnEntry).toEqual([0, 0]);
  });
});
