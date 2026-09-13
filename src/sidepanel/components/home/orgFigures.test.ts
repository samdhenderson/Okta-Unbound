import { describe, it, expect } from 'vitest';
import {
  buildBox,
  buildFigure,
  buildSubCount,
  figureStatus,
  oldestWalkAt,
  subCountStatus,
  type FigureSource,
  type SubCountInput,
} from './orgFigures';

const WALK_AT = 1_800_000_000_000;

const source = (over: Partial<FigureSource> = {}): FigureSource => ({
  isReading: false,
  complete: true,
  lastFullWalkAt: WALK_AT,
  count: 42,
  error: null,
  ...over,
});

describe('figureStatus', () => {
  it('is ok only when a walk actually finished', () => {
    expect(figureStatus(source())).toBe('ok');
  });

  it('is reading while the first read is in flight', () => {
    expect(figureStatus(source({ isReading: true, count: 0 }))).toBe('reading');
  });

  it('is partial when rows exist but the walk did not finish', () => {
    expect(figureStatus(source({ complete: false }))).toBe('partial');
  });

  it('is unavailable when nothing has ever been read', () => {
    expect(figureStatus(source({ complete: false, lastFullWalkAt: null, count: 0 }))).toBe(
      'unavailable',
    );
  });

  it('does not trust `complete` on its own', () => {
    expect(figureStatus(source({ lastFullWalkAt: null, count: 0 }))).toBe('unavailable');
  });

  it('reports a genuinely empty org as ok, so a real zero is still an answer', () => {
    expect(figureStatus(source({ count: 0 }))).toBe('ok');
  });
});

describe('buildFigure', () => {
  it('renders the count when the walk finished', () => {
    expect(buildFigure('groups', 'Groups', 'users', source())).toMatchObject({
      status: 'ok',
      value: 42,
      note: undefined,
    });
  });

  it('shows a real zero for an empty org', () => {
    expect(buildFigure('groups', 'Groups', 'users', source({ count: 0 }))).toMatchObject({
      status: 'ok',
      value: 0,
    });
  });

  it('withholds the number entirely while reading', () => {
    expect(buildFigure('groups', 'Groups', 'users', source({ isReading: true })).value).toBeNull();
  });

  it('withholds the number entirely when nothing was read', () => {
    const figure = buildFigure(
      'groups',
      'Groups',
      'users',
      source({ complete: false, lastFullWalkAt: null, count: 0 }),
    );
    expect(figure.value).toBeNull();
    expect(figure.note).toBe('Groups have not been read yet.');
  });

  it('marks a partial count as a floor rather than a total', () => {
    const figure = buildFigure('groups', 'Groups', 'users', source({ complete: false }));
    expect(figure).toMatchObject({ status: 'partial', value: 42 });
    expect(figure.note).toMatch(/At least/);
  });

  it('says a read failed without claiming why', () => {
    const figure = buildFigure(
      'rules',
      'Rules',
      'bolt',
      source({ complete: false, lastFullWalkAt: null, count: 0, error: 'Failed to load' }),
    );
    expect(figure.note).toBe('The last read of rules did not finish.');
    expect(figure.note).not.toMatch(/403|permission|admin/i);
  });

  it('names the permission problem when the failure status says so (D-068)', () => {
    const figure = buildFigure(
      'rules',
      'Rules',
      'bolt',
      source({
        complete: false,
        lastFullWalkAt: null,
        count: 0,
        error: 'Forbidden',
        status: 403,
      }),
    );
    expect(figure.note).toBe('You are not allowed to read rules.');
  });

  it('does not claim a permission problem for a non-403/401 status', () => {
    const figure = buildFigure(
      'rules',
      'Rules',
      'bolt',
      source({
        complete: false,
        lastFullWalkAt: null,
        count: 0,
        error: 'Too Many Requests',
        status: 429,
      }),
    );
    expect(figure.note).toBe('The last read of rules did not finish.');
  });

  it('counts a subset when one is passed, keeping the source collection’s status', () => {
    const figure = buildFigure('paused', 'Rules paused', 'pause', source({ count: 40 }), 3);
    expect(figure).toMatchObject({ status: 'ok', value: 3 });
  });
});

const named = (over: Partial<FigureSource> = {}, noun = 'groups') => ({
  source: source(over),
  noun,
});

describe('subCountStatus', () => {
  it('inherits the counted collection when nothing gates it', () => {
    expect(subCountStatus(source(), [])).toBe('ok');
    expect(subCountStatus(source({ complete: false }), [])).toBe('partial');
  });

  it('lets a partial COUNTED collection through as a floor', () => {
    expect(subCountStatus(source({ complete: false }), [source()])).toBe('partial');
  });

  it('suppresses the count when a GATE walk did not finish', () => {
    expect(subCountStatus(source(), [source({ complete: false })])).toBe('unavailable');
    expect(
      subCountStatus(source(), [source({ complete: false, lastFullWalkAt: null, count: 0 })]),
    ).toBe('unavailable');
  });

  it('reads as reading while either side is still loading', () => {
    expect(subCountStatus(source({ isReading: true }), [source()])).toBe('reading');
    expect(subCountStatus(source(), [source({ isReading: true })])).toBe('reading');
  });

  it('treats a FLOOR like the counted collection, not like a gate', () => {
    expect(subCountStatus(source(), [source()], [source({ complete: false })])).toBe('partial');
    expect(subCountStatus(source(), [source()], [source()])).toBe('ok');
  });

  it('still suppresses when a floor was never read at all', () => {
    expect(
      subCountStatus(source(), [], [source({ complete: false, lastFullWalkAt: null, count: 0 })]),
    ).toBe('unavailable');
  });

  it('reads as reading while a floor is still loading', () => {
    expect(subCountStatus(source(), [], [source({ isReading: true })])).toBe('reading');
  });
});

describe('buildSubCount', () => {
  const request = { tab: 'groups', view: 'empty' } as const;
  const base = {
    key: 'groups-empty',
    label: 'Groups with no members',
    icon: 'users',
    counted: named({ count: 214 }),
    count: 31,
    request,
  } satisfies SubCountInput;

  it('carries its number, its destination and what it is out of', () => {
    expect(buildSubCount(base)).toMatchObject({
      status: 'ok',
      value: 31,
      request,
      note: 'of 214 groups',
    });
  });

  it('agrees with its denominator when there is exactly one of them', () => {
    const one = buildSubCount({
      ...base,
      counted: named({ count: 1 }, 'applications'),
      count: 1,
    });
    expect(one.note).toBe('of 1 application');
  });

  it('keeps the plural at zero, and localises a four-figure denominator', () => {
    expect(buildSubCount({ ...base, counted: named({ count: 0 }, 'applications') }).note).toBe(
      'of 0 applications',
    );
    const many = buildSubCount({ ...base, counted: named({ count: 1204 }) }).note;
    expect(many).toMatch(/^of 1\D?204 groups$/);
  });

  it('takes a stated singular over the derived one, for a noun derivation would mangle', () => {
    const irregular = buildSubCount({
      ...base,
      counted: { ...named({ count: 1 }, 'authentication policies'), singular: 'auth policy' },
      count: 1,
    });
    expect(irregular.note).toBe('of 1 auth policy');
  });

  it('leaves the three count-free sentences plural, whatever the count', () => {
    const single = { count: 1 } as const;
    expect(buildSubCount({ ...base, counted: named({ ...single, complete: false }) }).note).toBe(
      'At least — the last read of groups did not finish.',
    );
    expect(
      buildSubCount({
        ...base,
        gates: [named({ ...single, complete: false }, 'group rules')],
      }).note,
    ).toBe('Needs group rules, which have not been read.');
    expect(
      buildSubCount({
        ...base,
        counted: named({ count: 0, complete: false, lastFullWalkAt: null }),
      }).note,
    ).toBe('Groups have not been read yet.');
  });

  it('marks a floor when the counted walk did not finish', () => {
    const floor = buildSubCount({ ...base, counted: named({ count: 214, complete: false }) });
    expect(floor).toMatchObject({ status: 'partial', value: 31 });
    expect(floor.note).toBe('At least — the last read of groups did not finish.');
  });

  it('withholds the number rather than shipping a wrong one, and names the gap', () => {
    const suppressed = buildSubCount({
      ...base,
      key: 'groups-unruled',
      label: 'Groups no rule fills',
      gates: [named({ complete: false }, 'group rules')],
      count: 214,
      request: { tab: 'groups', view: 'no-rules' },
    });
    expect(suppressed.value).toBeNull();
    expect(suppressed.note).toBe('Needs group rules, which have not been read.');
  });

  it('never publishes 0 as a stand-in for unknown, whatever the subtraction produced', () => {
    for (const count of [0, 31]) {
      const suppressed = buildSubCount({
        ...base,
        gates: [named({ complete: false, lastFullWalkAt: null, count: 0 }, 'group rules')],
        count,
      });
      expect(suppressed.status).toBe('unavailable');
      expect(suppressed.value).toBeNull();
      expect(suppressed.value).not.toBe(0);
      expect(suppressed.note).toBe('Needs group rules, which have not been read.');
    }
  });

  it('names its own collection when that is what is missing', () => {
    const suppressed = buildSubCount({
      ...base,
      counted: named({ complete: false, lastFullWalkAt: null, count: 0 }),
    });
    expect(suppressed.value).toBeNull();
    expect(suppressed.note).toBe('Groups have not been read yet.');
  });

  it('shows no note while reading — the skeleton is the message', () => {
    const reading = buildSubCount({ ...base, counted: named({ isReading: true }) });
    expect(reading).toMatchObject({ status: 'reading', value: null, note: undefined });
  });

  it('names the collection that actually fell short, which may be a floor', () => {
    const floor = buildSubCount({
      ...base,
      floors: [named({ complete: false }, 'app group assignments')],
    });
    expect(floor).toMatchObject({ status: 'partial', value: 31 });
    expect(floor.note).toBe('At least — the last read of app group assignments did not finish.');
  });
});

describe('buildBox', () => {
  it('pairs a total with its tab, its noun and its findings', () => {
    const box = buildBox(buildFigure('groups', 'Groups', 'users', source()), 'groups', 'groups', [
      buildSubCount({
        key: 'groups-empty',
        label: 'Groups with no members',
        icon: 'users',
        counted: named(),
        count: 31,
        request: { tab: 'groups', view: 'empty' },
      }),
    ]);
    expect(box).toMatchObject({ key: 'groups', tab: 'groups', noun: 'groups', value: 42 });
    expect(box.subCounts.map((s) => s.value)).toEqual([31]);
  });
});

describe('oldestWalkAt', () => {
  it('quotes the oldest walk, not the newest', () => {
    expect(oldestWalkAt([source(), source({ lastFullWalkAt: WALK_AT - 5000 }), source()])).toBe(
      WALK_AT - 5000,
    );
  });

  it('has no age at all when any collection has never been walked', () => {
    expect(oldestWalkAt([source(), source({ lastFullWalkAt: null })])).toBeNull();
  });
});
