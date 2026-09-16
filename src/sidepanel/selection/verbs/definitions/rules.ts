import type { OktaGroupRule } from '@/shared/types';
import { createLogger } from '@/shared/utils/logger';
import { pluralize, pluralNoun, type NounForms } from '@/shared/utils/plural';
import type { RuleImpactSummary } from '@/shared/membership/ruleImpact';
import type { SelectionBasket } from '../../selectionStore';
import type {
  BasketVerb,
  VerbContext,
  VerbCost,
  VerbOutcome,
  VerbPreflight,
  VerbStatus,
} from '../types';

const log = createLogger('BasketVerbs');

const RULE: NounForms = { one: 'rule', other: 'rules' };
const MEMBER: NounForms = { one: 'member', other: 'members' };
const TARGET_GROUP: NounForms = { one: 'target group', other: 'target groups' };
const IS: NounForms = { one: 'is', other: 'are' };

type TargetState = 'ACTIVE' | 'INACTIVE';

interface RuleRef {
  id: string;
  name: string;
}

interface RulesPayload {
  targets: RuleRef[];
}

function pickedRules(basket: SelectionBasket): RuleRef[] {
  return basket.picked.filter((ref) => ref.kind === 'rule').map(({ id, name }) => ({ id, name }));
}

function isRulesPayload(value: unknown): value is RulesPayload {
  return (
    typeof value === 'object' && value !== null && Array.isArray((value as RulesPayload).targets)
  );
}

function stateWord(state: TargetState): string {
  return state === 'ACTIVE' ? 'on' : 'off';
}

interface ReadRule {
  ref: RuleRef;
  raw: OktaGroupRule | null;
}

type Impact =
  | { kind: 'measured'; summary: RuleImpactSummary }
  | { kind: 'no-targets' }
  | { kind: 'unanswered'; reason: string };

function impactLine(name: string, impact: Impact): string {
  if (impact.kind === 'no-targets') {
    return `${name} — assigns nobody to a group, so it holds no membership up`;
  }
  if (impact.kind === 'unanswered') {
    return `${name} — what it holds up is unanswered: ${impact.reason}`;
  }
  const { totalHeldSolely, distinctMemberCount, targetGroups } = impact.summary;
  return (
    `${name} — ${totalHeldSolely.toLocaleString()} of ` +
    `${distinctMemberCount.toLocaleString()} ${pluralNoun(distinctMemberCount, MEMBER)} across ` +
    `${pluralize(targetGroups.length, TARGET_GROUP)} ` +
    `${pluralNoun(totalHeldSolely, IS)} held by this rule alone`
  );
}

function irreversibilityLine(state: TargetState): string {
  return state === 'ACTIVE'
    ? 'Turning a rule on cannot be undone from here: turning it off again does not recall the memberships it granted while it was on.'
    : 'Turning a rule off cannot be undone from here: turning it back on re-evaluates it against every user, which is a new run with its own cost and confirmation, not a restore.';
}

async function readRules(context: VerbContext, rules: RuleRef[]): Promise<ReadRule[] | null> {
  const outcome = await context.api.runOperation(
    'Reading rule definitions',
    rules,
    async (ref) => ({ ref, raw: await context.api.getRawGroupRule(ref.id) }),
    {
      message: (progress) => `Read ${progress.completed}/${progress.total} rule definitions`,
      plan: { endpoint: '/api/v1/groups/rules', method: 'GET' },
    },
  );

  if (outcome.cancelled) return null;

  return outcome.results.map((result) => ({
    ref: result.item,
    raw: result.status === 'fulfilled' ? (result.value?.raw ?? null) : null,
  }));
}

async function captureImpacts(
  context: VerbContext,
  writable: { ref: RuleRef; raw: OktaGroupRule }[],
): Promise<Map<string, Impact>> {
  const inputs = writable.map(({ ref, raw }) => ({
    id: ref.id,
    name: raw.name || ref.name,
    groupIds: raw.actions?.assignUserToGroups?.groupIds ?? [],
  }));

  const impacts = new Map<string, Impact>();
  for (const input of inputs) {
    if (input.groupIds.length === 0) impacts.set(input.id, { kind: 'no-targets' });
  }

  const toCapture = inputs.filter((input) => input.groupIds.length > 0);
  if (toCapture.length === 0) return impacts;

  const captured = await context.api.runOperation(
    'Rule impact preview',
    toCapture,
    async (input) => ({ id: input.id, summary: await context.api.captureRuleImpact(input) }),
    {
      concurrency: 1,
      message: (progress) => `Measured ${progress.completed}/${progress.total} rules`,
    },
  );

  for (const result of captured.results) {
    const input = result.item;
    if (result.status !== 'fulfilled' || !result.value) {
      log.warn('A rule impact capture did not complete', { ruleId: input.id });
      impacts.set(input.id, {
        kind: 'unanswered',
        reason: 'the impact capture did not complete',
      });
      continue;
    }
    if (result.value.summary.emptyRuleInventory) {
      log.warn('Rule inventory was empty; reporting the impact as unanswered', {
        ruleId: input.id,
      });
      impacts.set(input.id, {
        kind: 'unanswered',
        reason: "the org's rule inventory came back empty, so nothing could be compared",
      });
      continue;
    }
    impacts.set(input.id, { kind: 'measured', summary: result.value.summary });
  }

  return impacts;
}

async function measure(context: VerbContext, state: TargetState): Promise<VerbPreflight> {
  const rules = pickedRules(context.basket);
  const read = await readRules(context, rules);
  if (!read) {
    return {
      cost: { requests: 0, writes: 0 },
      items: 0,
      lines: [],
      refusal: {
        code: 'nothing-to-do',
        message: 'The rule read was cancelled, so nothing was measured.',
      },
    };
  }

  const unreadable = read.filter((entry) => !entry.raw);
  const already = read.filter((entry) => entry.raw?.status === state);
  const writable = read
    .filter((entry): entry is { ref: RuleRef; raw: OktaGroupRule } => !!entry.raw)
    .filter((entry) => entry.raw.status !== state);

  const impacts = await captureImpacts(context, writable);

  const lines: string[] = [
    ...writable.map((entry) =>
      impactLine(
        entry.raw.name || entry.ref.name,
        impacts.get(entry.ref.id) ?? {
          kind: 'unanswered',
          reason: 'the impact capture did not run',
        },
      ),
    ),
    ...unreadable.map(
      (entry) =>
        `${entry.ref.name} — could not be read, so its current state and what it holds up are both unanswered; it will be left alone`,
    ),
  ];

  if (already.length > 0) {
    lines.push(
      `${pluralize(already.length, RULE)} of the ${rules.length} selected ${pluralNoun(already.length, IS)} already ${stateWord(state)}, so nothing is written for ${pluralNoun(already.length, { one: 'it', other: 'them' })}.`,
    );
  }

  lines.push(irreversibilityLine(state));

  const targets: RuleRef[] = writable.map((entry) => ({
    id: entry.ref.id,
    name: entry.raw.name || entry.ref.name,
  }));

  if (targets.length === 0) {
    return {
      cost: { requests: 0, writes: 0 },
      items: 0,
      lines,
      refusal: {
        code: 'nothing-to-do',
        message:
          already.length === rules.length
            ? `Every selected rule is already ${stateWord(state)}.`
            : `No selected rule can be turned ${stateWord(state)}.`,
      },
    };
  }

  return {
    cost: { requests: targets.length, writes: targets.length },
    items: targets.length,
    lines,
    payload: { targets } satisfies RulesPayload,
  };
}

async function perform(
  context: VerbContext,
  preflight: VerbPreflight | undefined,
  state: TargetState,
  verbId: string,
): Promise<VerbOutcome> {
  const payload = preflight?.payload;
  if (!isRulesPayload(payload)) {
    throw new Error(`${verbId} was run without its preflight`);
  }

  const { targets } = payload;
  if (targets.length === 0) {
    return {
      status: 'nothing-to-do',
      summary: `No rule needed turning ${stateWord(state)}.`,
    };
  }

  const write =
    state === 'ACTIVE' ? context.api.activateGroupRule : context.api.deactivateGroupRule;

  const outcome = await context.api.runOperation(
    state === 'ACTIVE' ? 'Turning rules on' : 'Turning rules off',
    targets,
    async (target) => ({ target, result: await write(target.id) }),
    {
      message: (progress) =>
        `Turned ${progress.completed}/${progress.total} rules ${stateWord(state)}`,
    },
  );

  const rows: (string | null)[][] = [];
  let changed = 0;
  let failed = 0;
  for (const result of outcome.results) {
    const target = result.item;
    const ok = result.status === 'fulfilled' && result.value?.result.success === true;
    if (ok) changed += 1;
    else failed += 1;
    const error =
      result.status === 'fulfilled'
        ? (result.value?.result.error ?? null)
        : result.error instanceof Error
          ? result.error.message
          : 'The request did not complete';
    rows.push([target.id, target.name, ok ? 'success' : 'failed', ok ? null : error]);
  }

  const status: VerbStatus = failed === 0 ? 'done' : changed === 0 ? 'refused' : 'partly-done';

  return {
    status,
    summary:
      failed === 0
        ? `Turned ${pluralize(changed, RULE)} ${stateWord(state)}.`
        : `Turned ${pluralize(changed, RULE)} ${stateWord(state)}; ${pluralize(failed, RULE)} could not be changed and ${pluralNoun(failed, { one: 'stays', other: 'stay' })} as ${pluralNoun(failed, { one: 'it was', other: 'they were' })}.`,
    detail: {
      filenameStem: state === 'ACTIVE' ? 'rules-turned-on' : 'rules-turned-off',
      headers: ['Rule ID', 'Rule name', 'Outcome', 'Error'],
      rows,
    },
  };
}

function preflightCost(basket: SelectionBasket): VerbCost {
  return { requests: pickedRules(basket).length * 2, writes: 0 };
}

export const activateRulesVerb: BasketVerb = {
  id: 'activate-rules',
  label: 'Turn rules on',
  title: 'Turn these group rules on',
  path: 'write',
  needs: ['rule'],
  cost: preflightCost,

  preflight(context: VerbContext): Promise<VerbPreflight> {
    return measure(context, 'ACTIVE');
  },

  run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    return perform(context, preflight, 'ACTIVE', 'activate-rules');
  },
};

export const deactivateRulesVerb: BasketVerb = {
  id: 'deactivate-rules',
  label: 'Turn rules off',
  title: 'Turn these group rules off',
  path: 'write',
  needs: ['rule'],
  cost: preflightCost,

  preflight(context: VerbContext): Promise<VerbPreflight> {
    return measure(context, 'INACTIVE');
  },

  run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    return perform(context, preflight, 'INACTIVE', 'deactivate-rules');
  },
};

export default [activateRulesVerb, deactivateRulesVerb];
