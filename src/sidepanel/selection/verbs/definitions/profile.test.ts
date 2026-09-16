import { describe, it, expect, vi, beforeEach } from 'vitest';
import setUserProfileAttribute from './profile';
import { logBulkProfileUpdateAction, MAX_CAPTURED_COHORT } from '../../../../shared/undoManager';
import type { VerbContext, VerbPreflight } from '../types';
import type { SelectionBasket, SelectionRef } from '../../selectionStore';
import type { OktaUser } from '../../../../shared/types';
import type { OktaUserProfileSchema } from '../../../../shared/schemas/okta';
import { resetEntityCache } from '../../../cache/entityCache';

vi.mock('../../../../shared/undoManager', async () => {
  const actual = await vi.importActual<typeof import('../../../../shared/undoManager')>(
    '../../../../shared/undoManager',
  );
  return { ...actual, logBulkProfileUpdateAction: vi.fn(async () => ({ id: 'action_bulk' })) };
});

const mockedLog = vi.mocked(logBulkProfileUpdateAction);

const measure = setUserProfileAttribute.preflight;
const prepare = setUserProfileAttribute.prepareFields;
if (!measure || !prepare) throw new Error('the bulk profile verb must declare both');

const schema = {
  definitions: {
    base: {
      properties: {
        login: { title: 'Username', type: 'string', mutability: 'READ_WRITE' },
        firstName: { title: 'First name', type: 'string', mutability: 'READ_WRITE' },
        department: { title: 'Department', type: 'string', mutability: 'READ_WRITE' },
        employeeNumber: { title: 'Employee number', type: 'string', mutability: 'READ_ONLY' },
        costCenter: {
          title: 'Cost centre',
          type: 'string',
          mutability: 'READ_WRITE',
          master: { type: 'PROFILE_MASTER' },
        },
        division: {
          title: 'Division',
          type: 'string',
          mutability: 'READ_WRITE',
          enum: ['North', 'South'],
        },
        headcount: { title: 'Headcount', type: 'number', mutability: 'READ_WRITE' },
        contractor: { title: 'Contractor', type: 'boolean', mutability: 'READ_WRITE' },
      },
    },
  },
} as unknown as OktaUserProfileSchema;

function basketOf(count: number): SelectionBasket {
  const picked: SelectionRef[] = Array.from({ length: count }, (_, index) => ({
    kind: 'user' as const,
    id: `00uFAKE${index}`,
    name: `user${index}@example.com`,
    pickedAt: 1_700_000_000_000 + index,
  }));
  picked.push({ kind: 'group', id: '00gFAKE', name: 'Payments', pickedAt: 1_700_000_001_000 });
  return { picked };
}

const userWith = (id: string, profile: Record<string, unknown>): OktaUser =>
  ({ id, status: 'ACTIVE', profile }) as unknown as OktaUser;

type Api = VerbContext['api'];

interface Fakes {
  profiles?: Record<string, Record<string, unknown>>;
  unreadable?: string[];
  writes?: Record<string, 'saved' | 'failed' | 'unknown'>;
  schema?: OktaUserProfileSchema | null;
  apps?: Record<
    string,
    { apps: { id: string; label: string; isProfileSource: boolean }[]; complete: boolean }
  >;
}

function contextOf(
  basket: SelectionBasket,
  values: Record<string, string>,
  fakes: Fakes = {},
): VerbContext & { api: Api & { updateUserProfile: ReturnType<typeof vi.fn> } } {
  const api = {
    runOperation: vi.fn(async (_name: string, items: unknown[], task: never) => {
      const run = task as unknown as (item: unknown, index: number) => Promise<void>;
      for (const [index, item] of items.entries()) await run(item, index);
      return {
        results: [],
        total: items.length,
        completed: items.length,
        failed: 0,
        skipped: 0,
        stoppedByError: false,
        cancelled: false,
      };
    }),
    getUserProfileSchema: vi.fn(async () => (fakes.schema === undefined ? schema : fakes.schema)),
    getUserApps: vi.fn(
      async (userId: string) => fakes.apps?.[userId] ?? { apps: [], complete: true },
    ),
    getUserRaw: vi.fn(async (userId: string) =>
      fakes.unreadable?.includes(userId)
        ? null
        : userWith(userId, fakes.profiles?.[userId] ?? { department: 'Marketing' }),
    ),
    updateUserProfile: vi.fn(async (userId: string) => {
      const kind = fakes.writes?.[userId] ?? 'saved';
      if (kind === 'saved') return { kind, user: userWith(userId, {}) };
      return { kind, error: 'stated elsewhere' };
    }),
  } as unknown as Api & { updateUserProfile: ReturnType<typeof vi.fn> };

  return {
    basket,
    counts: { user: basket.picked.filter((ref) => ref.kind === 'user').length, group: 1 },
    addMany: vi.fn(),
    report: vi.fn(),
    api,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values,
  };
}

const measureThenRun = async (
  context: ReturnType<typeof contextOf>,
): Promise<{
  preflight: VerbPreflight;
  outcome: Awaited<ReturnType<typeof setUserProfileAttribute.run>>;
}> => {
  const preflight = await measure(context);
  const outcome = await setUserProfileAttribute.run(context, preflight);
  return { preflight, outcome };
};

beforeEach(() => {
  vi.clearAllMocks();
  resetEntityCache();
  mockedLog.mockImplementation(async () => ({ id: 'action_bulk' }) as never);
});

describe('cost', () => {
  it('prices reaching the confirm: the schema, plus a read and an app walk per user', () => {
    expect(setUserProfileAttribute.cost(basketOf(4))).toEqual({
      requests: 5,
      walks: 4,
      walkKind: 'app-assignment',
      writes: 0,
    });
  });

  it('counts only users — a ticked group is not this verb’s object', () => {
    expect(setUserProfileAttribute.cost(basketOf(1)).requests).toBe(2);
  });

  it('names what the walk walks, so it cannot read as a membership walk', () => {
    expect(setUserProfileAttribute.cost(basketOf(9)).walkKind).toBe('app-assignment');
  });
});

describe('prepareFields', () => {
  it('offers every attribute this client may write, whatever its type', async () => {
    const fields = await prepare(contextOf(basketOf(1), {}));
    const options = fields[0].options?.map((option) => option.value);

    expect(options).toEqual([
      'firstName',
      'department',
      'costCenter',
      'division',
      'headcount',
      'contractor',
    ]);
    expect(options).not.toContain('login');
    expect(options).not.toContain('employeeNumber');
  });

  it('offers a PROFILE_MASTER attribute for the user no profile source reaches', async () => {
    const offered = async (apps: Fakes['apps']) => {
      resetEntityCache();
      const fields = await prepare(contextOf(basketOf(1), {}, { apps }));
      return fields[0].options?.map((option) => option.value);
    };

    expect(await offered({})).toContain('costCenter');
    expect(
      await offered({
        '00uFAKE0': {
          apps: [{ id: '0oaFAKE', label: 'Workday', isProfileSource: true }],
          complete: true,
        },
      }),
    ).not.toContain('costCenter');
    expect(await offered({ '00uFAKE0': { apps: [], complete: false } })).not.toContain(
      'costCenter',
    );
  });

  it('asks the attribute alone until it is answered', async () => {
    const fields = await prepare(contextOf(basketOf(1), {}));
    expect(fields.map((field) => field.id)).toEqual(['attribute']);
    expect(fields[0].refreshesFields).toBe(true);
  });

  it('asks a free-text attribute for free text', async () => {
    const fields = await prepare(contextOf(basketOf(1), { attribute: 'department' }));
    expect(fields.map((field) => field.id)).toEqual(['attribute', 'value']);
    expect(fields[1].options).toBeUndefined();
    expect(fields[1].control).toBeUndefined();
    expect(fields[1].label).toBe('New Department');
  });

  it('asks an enumerated attribute for one of the org’s own values', async () => {
    const fields = await prepare(contextOf(basketOf(1), { attribute: 'division' }));
    expect(fields[1].options).toEqual([
      { value: 'North', label: 'North' },
      { value: 'South', label: 'South' },
    ]);
  });

  it('asks a numeric attribute for a number', async () => {
    const fields = await prepare(contextOf(basketOf(1), { attribute: 'headcount' }));
    expect(fields[1].control).toBe('number');
    expect(fields[1].options).toBeUndefined();
  });

  it('asks a boolean for one of two values rather than for a checkbox', async () => {
    const fields = await prepare(contextOf(basketOf(1), { attribute: 'contractor' }));
    expect(fields[1].options).toEqual([
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' },
    ]);
  });

  it('states the absence rather than offering an empty list when the schema cannot be read', async () => {
    await expect(prepare(contextOf(basketOf(1), {}, { schema: null }))).rejects.toThrow(
      /profile schema could not be read/,
    );
  });
});

describe('preflight', () => {
  it('charges no write for a user who already holds the value', async () => {
    const context = contextOf(
      basketOf(3),
      { attribute: 'department', value: 'Advertising' },
      {
        profiles: {
          '00uFAKE0': { department: 'Marketing' },
          '00uFAKE1': { department: 'Advertising' },
          '00uFAKE2': { department: 'Sales' },
        },
      },
    );

    const preflight = await measure(context);

    expect(preflight.items).toBe(2);
    expect(preflight.cost).toEqual({ requests: 2, writes: 2 });
    expect(preflight.lines).toContain('1 user already holds that value, and costs no write');
  });

  it('names what is being overwritten', async () => {
    const context = contextOf(
      basketOf(3),
      { attribute: 'department', value: 'Advertising' },
      {
        profiles: {
          '00uFAKE0': { department: 'Marketing' },
          '00uFAKE1': { department: 'Marketing' },
          '00uFAKE2': {},
        },
      },
    );

    const preflight = await measure(context);

    expect(preflight.lines).toContain('Overwrites Marketing (2), (empty) (1)');
  });

  it('refuses when every ticked user already holds the value', async () => {
    const context = contextOf(basketOf(2), { attribute: 'department', value: 'Marketing' });

    const preflight = await measure(context);

    expect(preflight.items).toBe(0);
    expect(preflight.refusal?.code).toBe('nothing-to-do');
  });

  it('states the users it could not read, and leaves them alone', async () => {
    const context = contextOf(
      basketOf(2),
      { attribute: 'department', value: 'Advertising' },
      {
        unreadable: ['00uFAKE1'],
      },
    );

    const preflight = await measure(context);

    expect(preflight.items).toBe(1);
    expect(preflight.lines).toContain('1 user could not be read, and will be left alone');
  });

  it('refuses whole past the cohort cap rather than writing un-undoably', async () => {
    const cohort = MAX_CAPTURED_COHORT + 1;
    const context = contextOf(basketOf(cohort), {
      attribute: 'department',
      value: 'Advertising',
    });

    const preflight = await measure(context);

    expect(preflight.refusal?.code).toBe('over-capture-cohort');
    expect(preflight.refusal?.message).toContain(String(MAX_CAPTURED_COHORT));
    expect(preflight.items).toBe(0);
    expect(preflight.payload).toBeUndefined();
  });

  it('runs the cohort cap exactly, not one short', async () => {
    const context = contextOf(basketOf(MAX_CAPTURED_COHORT), {
      attribute: 'department',
      value: 'Advertising',
    });

    const preflight = await measure(context);

    expect(preflight.refusal).toBeUndefined();
    expect(preflight.items).toBe(MAX_CAPTURED_COHORT);
  });

  it('refuses an attribute the org no longer offers', async () => {
    const context = contextOf(basketOf(2), { attribute: 'employeeNumber', value: 'X' });

    const preflight = await measure(context);

    expect(preflight.refusal?.code).toBe('nothing-to-do');
    expect(preflight.cost.writes).toBe(0);
  });
});

describe('run', () => {
  it('writes one sparse patch per user, and reports what it set', async () => {
    const context = contextOf(basketOf(2), { attribute: 'department', value: 'Advertising' });

    const { outcome } = await measureThenRun(context);

    expect(context.api.updateUserProfile).toHaveBeenCalledTimes(2);
    expect(context.api.updateUserProfile).toHaveBeenCalledWith('00uFAKE0', {
      department: 'Advertising',
    });
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe('Set Department on 2 users.');
  });

  it('reports an unconfirmed write in its own sentence, never as a success or a failure', async () => {
    const context = contextOf(
      basketOf(3),
      { attribute: 'department', value: 'Advertising' },
      {
        writes: { '00uFAKE0': 'saved', '00uFAKE1': 'unknown', '00uFAKE2': 'failed' },
      },
    );

    const { outcome } = await measureThenRun(context);

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toContain('Set Department on 1 user.');
    expect(outcome.summary).toContain('Okta rejected 1 user');
    expect(outcome.summary).toContain('could not be confirmed');
    expect(outcome.summary).not.toContain('Set Department on 2 users');
    expect(outcome.summary).not.toContain('Okta rejected 2 users');
  });

  it('keeps the unconfirmed user out of the undo capture, and names it separately', async () => {
    const context = contextOf(
      basketOf(2),
      { attribute: 'department', value: 'Advertising' },
      {
        writes: { '00uFAKE0': 'saved', '00uFAKE1': 'unknown' },
      },
    );

    await measureThenRun(context);

    expect(mockedLog).toHaveBeenCalledTimes(1);
    const [name, label, after, changes, options] = mockedLog.mock.calls[0];
    expect(name).toBe('department');
    expect(label).toBe('Department');
    expect(after).toBe('Advertising');
    expect(changes).toEqual([
      { userId: '00uFAKE0', beforeRaw: 'Marketing', beforeDisplay: 'Marketing' },
    ]);
    expect(options).toEqual({ unconfirmedUserIds: ['00uFAKE1'], status: 'partial' });
  });

  it('records nothing when Okta rejected every write', async () => {
    const context = contextOf(
      basketOf(1),
      { attribute: 'department', value: 'Advertising' },
      {
        writes: { '00uFAKE0': 'failed' },
      },
    );

    const { outcome } = await measureThenRun(context);

    expect(mockedLog).not.toHaveBeenCalled();
    expect(outcome.status).toBe('partly-done');
  });

  it('produces a detail row per user, each exactly as wide as the headers', async () => {
    const context = contextOf(
      basketOf(2),
      { attribute: 'department', value: 'Advertising' },
      {
        writes: { '00uFAKE0': 'saved', '00uFAKE1': 'unknown' },
      },
    );

    const { outcome } = await measureThenRun(context);
    const detail = outcome.detail;
    if (!detail) throw new Error('the run must produce its rows');

    expect(detail.rows).toHaveLength(2);
    for (const row of detail.rows) expect(row).toHaveLength(detail.headers.length);
    expect(detail.rows[0]).toEqual([
      'user0@example.com',
      '00uFAKE0',
      'set',
      'Marketing',
      'Advertising',
    ]);
    expect(detail.rows[1][2]).toBe('unconfirmed');
  });

  it('throws rather than guessing when it is run without its preflight', async () => {
    const context = contextOf(basketOf(1), { attribute: 'department', value: 'Advertising' });
    await expect(setUserProfileAttribute.run(context)).rejects.toThrow(/without its preflight/);
  });
});

describe('the answer is written as the schema’s own type', () => {
  it('sends a numeric attribute a number, not the typed string', async () => {
    const context = contextOf(basketOf(1), { attribute: 'headcount', value: '1200' });
    await measureThenRun(context);

    expect(context.api.updateUserProfile).toHaveBeenCalledWith('00uFAKE0', { headcount: 1200 });
  });

  it('sends a boolean attribute a boolean', async () => {
    const context = contextOf(basketOf(1), { attribute: 'contractor', value: 'true' });
    await measureThenRun(context);

    expect(context.api.updateUserProfile).toHaveBeenCalledWith('00uFAKE0', { contractor: true });
  });

  it('counts a user already holding the value as no write, comparing types not text', async () => {
    const context = contextOf(
      basketOf(1),
      { attribute: 'headcount', value: '1200' },
      { profiles: { '00uFAKE0': { headcount: 1200 } } },
    );
    const preflight = await measure(context);

    expect(preflight.refusal?.code).toBe('nothing-to-do');
    expect(preflight.cost.writes).toBe(0);
  });

  it('refuses a value the attribute cannot hold, and authorises no write', async () => {
    const context = contextOf(basketOf(3), { attribute: 'headcount', value: 'twelve' });
    const preflight = await measure(context);

    expect(preflight.refusal?.code).toBe('invalid-value');
    expect(preflight.cost.writes).toBe(0);
    expect(preflight.items).toBe(0);
  });

  it('refuses a value outside an enumerated attribute’s own set', async () => {
    const context = contextOf(basketOf(3), { attribute: 'division', value: 'East' });
    const preflight = await measure(context);

    expect(preflight.refusal?.code).toBe('invalid-value');
    expect(preflight.cost.writes).toBe(0);
  });
});

const realOrgSchema = {
  definitions: {
    base: {
      properties: {
        firstName: {
          title: 'First name',
          type: 'string',
          mutability: 'READ_WRITE',
          master: { type: 'PROFILE_MASTER' },
        },
        department: {
          title: 'Department',
          type: 'string',
          mutability: 'READ_WRITE',
          master: { type: 'PROFILE_MASTER' },
        },
      },
    },
  },
} as unknown as OktaUserProfileSchema;

const WORKDAY = {
  apps: [{ id: '0oaFAKEwd', label: 'Workday', isProfileSource: true }],
  complete: true,
};

describe('an org carrying Okta’s default mastering', () => {
  it('offers its attributes to a user no profile source reaches', async () => {
    const fields = await prepare(contextOf(basketOf(1), {}, { schema: realOrgSchema }));

    expect(fields[0]?.options?.map((option) => option.value)).toEqual(['firstName', 'department']);
  });

  it('still offers them when a profile source reaches only some of the cohort', async () => {
    const context = contextOf(
      basketOf(3),
      {},
      { schema: realOrgSchema, apps: { '00uFAKE1': WORKDAY } },
    );

    const fields = await prepare(context);
    const department = fields[0]?.options?.find((option) => option.value === 'department');

    expect(department).toBeDefined();
    expect(department?.summary).toContain('writable on 2 of 3');
  });

  it('leaves the mastered users alone, and says so, rather than writing and being rejected', async () => {
    const context = contextOf(
      basketOf(3),
      { attribute: 'department', value: 'Advertising' },
      { schema: realOrgSchema, apps: { '00uFAKE1': WORKDAY } },
    );

    const preflight = await measure(context);

    expect(preflight.items).toBe(2);
    expect(preflight.lines).toContain(
      '1 user is mastered by Workday for Department, and will be left alone',
    );
  });

  it('withholds an attribute mastered for every selected user, naming the system', async () => {
    const context = contextOf(
      basketOf(2),
      {},
      { schema: realOrgSchema, apps: { '00uFAKE0': WORKDAY, '00uFAKE1': WORKDAY } },
    );

    await expect(prepare(context)).rejects.toMatchObject({
      code: 'nothing-to-do',
      message: expect.stringContaining('Workday'),
    });
  });
});

describe('the cohort read', () => {
  it('is spent once across the attribute question, a re-ask, and the preflight', async () => {
    const context = contextOf(basketOf(3), {}, {});

    const at = (values: Record<string, string>) => ({ ...context, values });

    await prepare(at({}));
    await prepare(at({ attribute: 'department' }));
    await prepare(at({ attribute: 'division' }));
    await measure(at({ attribute: 'division', value: 'North' }));

    expect(context.api.getUserRaw).toHaveBeenCalledTimes(3);
    expect(context.api.getUserProfileSchema).toHaveBeenCalledTimes(1);
  });

  it('states each attribute’s spread across the ticked users', async () => {
    const context = contextOf(
      basketOf(3),
      {},
      {
        profiles: {
          '00uFAKE0': { department: 'Marketing' },
          '00uFAKE1': { department: 'Marketing' },
          '00uFAKE2': {},
        },
      },
    );

    const fields = await prepare(context);
    const department = fields[0]?.options?.find((option) => option.value === 'department');

    expect(department?.summary).toBe('1 value · 1 empty');
    expect(department?.distribution).toEqual([
      { value: 'Marketing', label: 'Marketing', count: 2, pct: (2 / 3) * 100 },
      { value: '__none__', label: '(none)', count: 1, pct: (1 / 3) * 100 },
    ]);
  });

  it('refuses a cohort past the capture cap before reading a single user', async () => {
    const context = contextOf(basketOf(MAX_CAPTURED_COHORT + 1), {});

    await expect(prepare(context)).rejects.toMatchObject({ code: 'over-capture-cohort' });
    expect(context.api.getUserRaw).not.toHaveBeenCalled();
    expect(context.api.getUserProfileSchema).not.toHaveBeenCalled();
  });
});
