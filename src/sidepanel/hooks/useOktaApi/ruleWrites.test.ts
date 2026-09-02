import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRuleWriteOperations } from './ruleWrites';
import type { CoreApi } from './core';
import type { CreateRulePayload } from '../../../shared/rules/consolidation';
import { makeFakeCore } from '@/test/factories/coreApi';

const rulesCache = vi.hoisted(() => ({ clear: vi.fn() }));

vi.mock('../../../shared/rulesCache', () => ({
  RulesCache: rulesCache,
}));

beforeEach(() => {
  vi.clearAllMocks();
  rulesCache.clear.mockResolvedValue(undefined);
});

const makeCore = (overrides: Partial<CoreApi> = {}): CoreApi =>
  makeFakeCore({
    makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: {} }),
    ...overrides,
  });

function validRule(overrides: Record<string, unknown> = {}) {
  return {
    id: '0prFAKERULE',
    name: 'Contractors',
    status: 'INACTIVE',
    type: 'group_rule',
    conditions: {
      expression: { value: 'user.department=="Eng"', type: 'urn:okta:expression:1.0' },
    },
    actions: { assignUserToGroups: { groupIds: ['00gFAKEGROUP'] } },
    ...overrides,
  };
}

function createPayload(): CreateRulePayload {
  return {
    type: 'group_rule',
    name: 'Contractors (consolidated)',
    conditions: {
      expression: { value: 'user.department=="Eng"', type: 'urn:okta:expression:1.0' },
    },
    actions: { assignUserToGroups: { groupIds: ['00gFAKEGROUP'] } },
  };
}

describe('getRawGroupRule', () => {
  it('requests the rule by id and returns the validated rule on success', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: validRule() }),
    });
    const { getRawGroupRule } = createRuleWriteOperations(core);

    const rule = await getRawGroupRule('0prFAKERULE');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/groups/rules/0prFAKERULE', {
      reason: 'Fetch raw group rule for consolidation',
    });
    expect(rule).toMatchObject({ id: '0prFAKERULE', name: 'Contractors', status: 'INACTIVE' });
  });

  it('returns null when the request is unsuccessful', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'nope' }),
    });
    const { getRawGroupRule } = createRuleWriteOperations(core);

    expect(await getRawGroupRule('0prFAKERULE')).toBeNull();
  });

  it('returns null when the response has no data', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    });
    const { getRawGroupRule } = createRuleWriteOperations(core);

    expect(await getRawGroupRule('0prFAKERULE')).toBeNull();
  });

  it('returns null when the payload fails zod validation', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: { id: 'x', name: 'y' } }),
    });
    const { getRawGroupRule } = createRuleWriteOperations(core);

    expect(await getRawGroupRule('0prFAKERULE')).toBeNull();
  });
});

describe('createGroupRule', () => {
  it('POSTs the payload and returns the created rule on success', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: validRule() }),
    });
    const { createGroupRule } = createRuleWriteOperations(core);
    const payload = createPayload();

    const result = await createGroupRule(payload);

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/groups/rules', {
      method: 'POST',
      body: payload,
      reason: 'Create consolidated group rule',
    });
    expect(result.success).toBe(true);
    expect(result.rule).toMatchObject({ id: '0prFAKERULE', name: 'Contractors' });
  });

  it('returns the transport error when creation fails', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'duplicate name' }),
    });
    const { createGroupRule } = createRuleWriteOperations(core);

    const result = await createGroupRule(createPayload());

    expect(result).toEqual({ success: false, error: 'duplicate name' });
  });

  it('falls back to a default error message when none is provided', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false }),
    });
    const { createGroupRule } = createRuleWriteOperations(core);

    const result = await createGroupRule(createPayload());

    expect(result).toEqual({ success: false, error: 'Failed to create rule' });
  });

  it('returns a shape error when the created-rule response fails validation', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true, data: { id: 'x' } }),
    });
    const { createGroupRule } = createRuleWriteOperations(core);

    const result = await createGroupRule(createPayload());

    expect(result).toEqual({
      success: false,
      error: 'Created rule response was not in the expected shape',
    });
  });
});

describe('deleteGroupRule', () => {
  it('DELETEs the rule and passes through success/error', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true }),
    });
    const { deleteGroupRule } = createRuleWriteOperations(core);

    const result = await deleteGroupRule('0prFAKERULE');

    expect(core.makeApiRequest).toHaveBeenCalledWith('/api/v1/groups/rules/0prFAKERULE', {
      method: 'DELETE',
      reason: 'Delete group rule',
    });
    expect(result).toEqual({ success: true, error: undefined });
  });

  it('surfaces the error on failure', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'rule is ACTIVE' }),
    });
    const { deleteGroupRule } = createRuleWriteOperations(core);

    expect(await deleteGroupRule('0prFAKERULE')).toEqual({
      success: false,
      error: 'rule is ACTIVE',
    });
  });
});

describe('activateGroupRule', () => {
  it('POSTs to the activate lifecycle endpoint and passes through the result', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true }),
    });
    const { activateGroupRule } = createRuleWriteOperations(core);

    const result = await activateGroupRule('0prFAKERULE');

    expect(core.makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/groups/rules/0prFAKERULE/lifecycle/activate',
      { method: 'POST', reason: 'Activate group rule' },
    );
    expect(result).toEqual({ success: true, error: undefined });
  });

  it('surfaces the error on failure', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'boom' }),
    });
    const { activateGroupRule } = createRuleWriteOperations(core);

    expect(await activateGroupRule('0prFAKERULE')).toEqual({ success: false, error: 'boom' });
  });
});

describe('deactivateGroupRule', () => {
  it('POSTs to the deactivate lifecycle endpoint and passes through the result', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: true }),
    });
    const { deactivateGroupRule } = createRuleWriteOperations(core);

    const result = await deactivateGroupRule('0prFAKERULE');

    expect(core.makeApiRequest).toHaveBeenCalledWith(
      '/api/v1/groups/rules/0prFAKERULE/lifecycle/deactivate',
      { method: 'POST', reason: 'Deactivate group rule' },
    );
    expect(result).toEqual({ success: true, error: undefined });
  });

  it('surfaces the error on failure', async () => {
    const core = makeCore({
      makeApiRequest: vi.fn().mockResolvedValue({ success: false, error: 'boom' }),
    });
    const { deactivateGroupRule } = createRuleWriteOperations(core);

    expect(await deactivateGroupRule('0prFAKERULE')).toEqual({ success: false, error: 'boom' });
  });
});

describe('rule-write cache invalidation', () => {
  const coreReturning = (response: unknown) =>
    makeCore({ makeApiRequest: vi.fn().mockResolvedValue(response) });

  it('drops the org-wide snapshot when a rule is created', async () => {
    const ops = createRuleWriteOperations(coreReturning({ success: true, data: validRule() }));

    await ops.createGroupRule(createPayload());

    expect(rulesCache.clear).toHaveBeenCalledTimes(1);
  });

  it('leaves the snapshot alone when the create is rejected', async () => {
    const ops = createRuleWriteOperations(
      coreReturning({ success: false, error: 'Rule name already in use' }),
    );

    await ops.createGroupRule(createPayload());

    expect(rulesCache.clear).not.toHaveBeenCalled();
  });

  it('drops the snapshot for a created rule whose response failed validation', async () => {
    const ops = createRuleWriteOperations(
      coreReturning({ success: true, data: { id: 'x', name: 'y' } }),
    );

    const result = await ops.createGroupRule(createPayload());

    expect(result.success).toBe(false);
    expect(rulesCache.clear).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['deleteGroupRule', (o: ReturnType<typeof createRuleWriteOperations>) => o.deleteGroupRule],
    ['activateGroupRule', (o: ReturnType<typeof createRuleWriteOperations>) => o.activateGroupRule],
    [
      'deactivateGroupRule',
      (o: ReturnType<typeof createRuleWriteOperations>) => o.deactivateGroupRule,
    ],
  ] as const)('drops the org-wide snapshot when %s succeeds', async (_name, pick) => {
    const ops = createRuleWriteOperations(coreReturning({ success: true }));

    await pick(ops)('0prFAKERULE');

    expect(rulesCache.clear).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['deleteGroupRule', (o: ReturnType<typeof createRuleWriteOperations>) => o.deleteGroupRule],
    ['activateGroupRule', (o: ReturnType<typeof createRuleWriteOperations>) => o.activateGroupRule],
    [
      'deactivateGroupRule',
      (o: ReturnType<typeof createRuleWriteOperations>) => o.deactivateGroupRule,
    ],
  ] as const)('leaves the snapshot alone when %s fails', async (_name, pick) => {
    const ops = createRuleWriteOperations(coreReturning({ success: false, error: 'boom' }));

    await pick(ops)('0prFAKERULE');

    expect(rulesCache.clear).not.toHaveBeenCalled();
  });

  it('never invalidates on a read', async () => {
    const ops = createRuleWriteOperations(coreReturning({ success: true, data: validRule() }));

    await ops.getRawGroupRule('0prFAKERULE');

    expect(rulesCache.clear).not.toHaveBeenCalled();
  });

  it('still reports a successful write when invalidation itself fails', async () => {
    rulesCache.clear.mockRejectedValue(new Error('storage unavailable'));
    const ops = createRuleWriteOperations(coreReturning({ success: true }));

    await expect(ops.activateGroupRule('0prFAKERULE')).resolves.toEqual({ success: true });
  });
});
