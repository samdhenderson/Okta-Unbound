import { describe, it, expect, vi } from 'vitest';
import rulesVerbs, { activateRulesVerb, deactivateRulesVerb } from './rules';
import type { VerbContext } from '../types';
import type { OktaGroupRule } from '../../../../shared/types';
import type { RuleImpactSummary } from '../../../../shared/membership/ruleImpact';
import type { SelectionBasket, SelectionRef } from '../../selectionStore';

const measureOn = activateRulesVerb.preflight;
const measureOff = deactivateRulesVerb.preflight;
if (!measureOn || !measureOff) throw new Error('both rule verbs must declare a preflight');

function basketOf(names: string[]): SelectionBasket {
  const picked: SelectionRef[] = names.map((name, index) => ({
    kind: 'rule',
    id: `0pr${index}`,
    name,
    pickedAt: 1_700_000_000_000 + index,
  }));
  picked.push({ kind: 'group', id: '00gFAKE', name: 'Payments', pickedAt: 1_700_000_000_900 });
  return { picked };
}

function rawRule(
  id: string,
  name: string,
  status: 'ACTIVE' | 'INACTIVE' | 'INVALID',
  groupIds: string[] = ['00gTARGET'],
): OktaGroupRule {
  return {
    id,
    name,
    status,
    actions: { assignUserToGroups: { groupIds } },
  } as unknown as OktaGroupRule;
}

function summaryOf(
  ruleId: string,
  held: number,
  distinct: number,
  targets: number,
  emptyRuleInventory = false,
): RuleImpactSummary {
  return {
    ruleId,
    ruleName: ruleId,
    targetGroups: Array.from({ length: targets }, (_unused, index) => ({
      groupId: `00g${index}`,
      groupName: `Group ${index}`,
      memberCount: distinct,
      heldSolelyCount: held,
      heldSolelyByRule: [],
    })),
    distinctMemberCount: distinct,
    totalHeldSolely: held,
    emptyRuleInventory,
  };
}

interface Fakes {
  rules: Record<string, OktaGroupRule | null>;
  impacts?: Record<string, RuleImpactSummary>;
  writes?: Record<string, { success: boolean; error?: string }>;
}

function contextOf(basket: SelectionBasket, fakes: Fakes): VerbContext {
  const lifecycle = vi.fn(async (ruleId: string) => fakes.writes?.[ruleId] ?? { success: true });

  const api = {
    runOperation: vi.fn(async (_name: string, items: unknown[], task: never) => {
      const run = task as unknown as (
        item: unknown,
        index: number,
        planId?: string,
      ) => Promise<unknown>;
      const results = [];
      for (const [index, item] of items.entries()) {
        try {
          results.push({
            item,
            index,
            status: 'fulfilled' as const,
            value: await run(item, index, 'plan-1'),
          });
        } catch (error) {
          results.push({ item, index, status: 'rejected' as const, error });
        }
      }
      return {
        results,
        total: items.length,
        completed: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
        skipped: 0,
        stoppedByError: false,
        cancelled: false,
      };
    }),
    getRawGroupRule: vi.fn(async (ruleId: string) => fakes.rules[ruleId] ?? null),
    captureRuleImpact: vi.fn(async (input: { id: string }) => {
      const summary = fakes.impacts?.[input.id];
      if (!summary) throw new Error('capture failed');
      return summary;
    }),
    activateGroupRule: lifecycle,
    deactivateGroupRule: lifecycle,
  } as unknown as VerbContext['api'];

  return {
    basket,
    counts: { rule: basket.picked.filter((ref) => ref.kind === 'rule').length, group: 1 },
    addMany: vi.fn(),
    report: vi.fn(),
    api,
    memo: new Map<string, unknown>(),
    oktaOrigin: 'https://example.okta.com',
    values: {},
  };
}

describe('registration', () => {
  it('ships both lifecycle verbs as writes over rules', () => {
    expect(rulesVerbs.map((verb) => verb.id)).toEqual(['activate-rules', 'deactivate-rules']);
    for (const verb of rulesVerbs) {
      expect(verb.path).toBe('write');
      expect(verb.needs).toEqual(['rule']);
      expect(verb.title.length).toBeGreaterThan(verb.label.length);
    }
  });
});

describe('cost', () => {
  it('prices the preflight: one rule read plus one inventory listing per ticked rule', () => {
    expect(deactivateRulesVerb.cost(basketOf(['A', 'B', 'C']))).toEqual({
      requests: 6,
      writes: 0,
    });
  });

  it('counts only rules — a ticked group is not these verbs’ object', () => {
    expect(activateRulesVerb.cost(basketOf(['A'])).requests).toBe(2);
  });
});

describe('preflight', () => {
  it('confirms with the measured impact of each rule, not with a count of rules', async () => {
    const context = contextOf(basketOf(['Contractor Sync', 'Vendor Sync']), {
      rules: {
        '0pr0': rawRule('0pr0', 'Contractor Sync', 'ACTIVE', ['00gA', '00gB']),
        '0pr1': rawRule('0pr1', 'Vendor Sync', 'ACTIVE', ['00gC']),
      },
      impacts: {
        '0pr0': summaryOf('0pr0', 12, 340, 2),
        '0pr1': summaryOf('0pr1', 1, 9, 1),
      },
    });

    const preflight = await measureOff(context);

    expect(preflight.lines[0]).toBe(
      'Contractor Sync — 12 of 340 members across 2 target groups are held by this rule alone',
    );
    expect(preflight.lines[1]).toBe(
      'Vendor Sync — 1 of 9 members across 1 target group is held by this rule alone',
    );
    expect(preflight.items).toBe(2);
    expect(preflight.cost).toEqual({ requests: 2, writes: 2 });
  });

  it('writes nothing for a rule already in the target state, and says how many were', async () => {
    const context = contextOf(basketOf(['Already Off', 'Still On']), {
      rules: {
        '0pr0': rawRule('0pr0', 'Already Off', 'INACTIVE'),
        '0pr1': rawRule('0pr1', 'Still On', 'ACTIVE'),
      },
      impacts: { '0pr1': summaryOf('0pr1', 3, 20, 1) },
    });

    const preflight = await measureOff(context);

    expect(preflight.items).toBe(1);
    expect(preflight.cost.writes).toBe(1);
    expect(preflight.lines).toContain(
      '1 rule of the 2 selected is already off, so nothing is written for it.',
    );
    expect(context.api.captureRuleImpact).toHaveBeenCalledTimes(1);
  });

  it('reports an empty rule inventory as unanswered rather than as nobody', async () => {
    const context = contextOf(basketOf(['Lonely Rule']), {
      rules: { '0pr0': rawRule('0pr0', 'Lonely Rule', 'ACTIVE') },
      impacts: { '0pr0': summaryOf('0pr0', 0, 40, 1, true) },
    });

    const preflight = await measureOff(context);

    expect(preflight.lines[0]).toBe(
      "Lonely Rule — what it holds up is unanswered: the org's rule inventory came back empty, so nothing could be compared",
    );
    expect(preflight.lines[0]).not.toMatch(/\b0 of\b/);
    expect(preflight.items).toBe(1);
  });

  it('reports a failed capture as unanswered, and a rule that assigns nobody as holding nothing up', async () => {
    const context = contextOf(basketOf(['Broken Capture', 'No Targets']), {
      rules: {
        '0pr0': rawRule('0pr0', 'Broken Capture', 'ACTIVE'),
        '0pr1': rawRule('0pr1', 'No Targets', 'ACTIVE', []),
      },
    });

    const preflight = await measureOff(context);

    expect(preflight.lines[0]).toBe(
      'Broken Capture — what it holds up is unanswered: the impact capture did not complete',
    );
    expect(preflight.lines[1]).toBe(
      'No Targets — assigns nobody to a group, so it holds no membership up',
    );
  });

  it('leaves a rule it could not read alone, and says why', async () => {
    const context = contextOf(basketOf(['Unreadable', 'Readable']), {
      rules: { '0pr0': null, '0pr1': rawRule('0pr1', 'Readable', 'INACTIVE') },
      impacts: { '0pr1': summaryOf('0pr1', 2, 5, 1) },
    });

    const preflight = await measureOn(context);

    expect(preflight.items).toBe(1);
    expect(preflight.lines).toContain(
      'Unreadable — could not be read, so its current state and what it holds up are both unanswered; it will be left alone',
    );
  });

  it('states that turning rules off cannot be undone from here', async () => {
    const context = contextOf(basketOf(['Contractor Sync']), {
      rules: { '0pr0': rawRule('0pr0', 'Contractor Sync', 'ACTIVE') },
      impacts: { '0pr0': summaryOf('0pr0', 4, 10, 1) },
    });

    const preflight = await measureOff(context);

    expect(preflight.lines.at(-1)).toBe(
      'Turning a rule off cannot be undone from here: turning it back on re-evaluates it against every user, which is a new run with its own cost and confirmation, not a restore.',
    );
  });

  it('states the other direction’s own irreversibility, not a mirror of it', async () => {
    const context = contextOf(basketOf(['Contractor Sync']), {
      rules: { '0pr0': rawRule('0pr0', 'Contractor Sync', 'INACTIVE') },
      impacts: { '0pr0': summaryOf('0pr0', 4, 10, 1) },
    });

    const preflight = await measureOn(context);

    expect(preflight.lines.at(-1)).toBe(
      'Turning a rule on cannot be undone from here: turning it off again does not recall the memberships it granted while it was on.',
    );
  });

  it('refuses when every selected rule is already in the target state', async () => {
    const context = contextOf(basketOf(['Off One', 'Off Two']), {
      rules: {
        '0pr0': rawRule('0pr0', 'Off One', 'INACTIVE'),
        '0pr1': rawRule('0pr1', 'Off Two', 'INACTIVE'),
      },
    });

    const preflight = await measureOff(context);

    expect(preflight.items).toBe(0);
    expect(preflight.cost.writes).toBe(0);
    expect(preflight.refusal).toEqual({
      code: 'nothing-to-do',
      message: 'Every selected rule is already off.',
    });
  });
});

describe('run', () => {
  it('refuses to run without the preflight it declares', async () => {
    const context = contextOf(basketOf(['A']), { rules: {} });
    await expect(deactivateRulesVerb.run(context)).rejects.toThrow(/without its preflight/);
  });

  it('writes only the rules the preflight named, and reports what changed', async () => {
    const context = contextOf(basketOf(['A', 'B']), { rules: {} });

    const outcome = await deactivateRulesVerb.run(context, {
      cost: { requests: 2, writes: 2 },
      items: 2,
      lines: [],
      payload: {
        targets: [
          { id: '0pr0', name: 'A' },
          { id: '0pr1', name: 'B' },
        ],
      },
    });

    expect(context.api.deactivateGroupRule).toHaveBeenCalledTimes(2);
    expect(outcome.status).toBe('done');
    expect(outcome.summary).toBe('Turned 2 rules off.');
    expect(outcome.detail?.rows).toHaveLength(2);
    for (const row of outcome.detail?.rows ?? []) {
      expect(row).toHaveLength(outcome.detail?.headers.length ?? 0);
    }
  });

  it('reports a rejected lifecycle write as partly done, and names it in the detail', async () => {
    const context = contextOf(basketOf(['A', 'B']), {
      rules: {},
      writes: { '0pr1': { success: false, error: '403 Forbidden' } },
    });

    const outcome = await activateRulesVerb.run(context, {
      cost: { requests: 2, writes: 2 },
      items: 2,
      lines: [],
      payload: {
        targets: [
          { id: '0pr0', name: 'A' },
          { id: '0pr1', name: 'B' },
        ],
      },
    });

    expect(outcome.status).toBe('partly-done');
    expect(outcome.summary).toBe(
      'Turned 1 rule on; 1 rule could not be changed and stays as it was.',
    );
    expect(outcome.detail?.rows[1]).toEqual(['0pr1', 'B', 'failed', '403 Forbidden']);
  });
});
