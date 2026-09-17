import {
  MAX_CAPTURED_COHORT,
  logBulkProfileUpdateAction,
  type BulkProfileChange,
} from '../../../../shared/undoManager';
import { createLogger } from '../../../../shared/utils/logger';
import {
  analyzeCohortRuleImpact,
  type CohortRuleImpact,
} from '../../../../shared/membership/cohortRuleImpact';
import type { RuleInventoryState } from '../../../../shared/membership/blastRadiusTypes';
import type { FormattedRule } from '../../../../shared/types';
import { pluralize, pluralNoun, type NounForms } from '../../../../shared/utils/plural';
import type { OktaUser } from '../../../../shared/types';
import type { OktaUserProfileSchema } from '../../../../shared/schemas/okta';
import { allProfileAttributes, toDisplay } from '../../../components/users/profileAttributes';
import {
  attributeEditability,
  profileMastering,
  type EditControl,
  type EditOption,
  type ProfileMastering,
} from '../../../components/users/profileEditability';
import {
  computeDimensionBreakdown,
  NONE_VALUE,
  type BreakdownRow,
} from '../../../components/members/memberAnalytics';
import { getOrFetch } from '../../../cache/entityCache';
import { cacheKeys } from '../../../cache/keys';
import { coerceDraftValue } from '../../../components/users/profileDraft';
import type { SelectionBasket } from '../../selectionStore';
import {
  VerbRefusal,
  type BasketVerb,
  type VerbContext,
  type VerbCost,
  type VerbField,
  type VerbOutcome,
  type VerbPreflight,
} from '../types';

const log = createLogger('BulkProfileVerb');

const USER: NounForms = { one: 'user', other: 'users' };

const ATTRIBUTE_FIELD = 'attribute';
const VALUE_FIELD = 'value';

const OVERWRITE_SAMPLE = 3;

const SPREAD_ROWS = 6;

const pickedUsers = (basket: SelectionBasket) => basket.picked.filter((ref) => ref.kind === 'user');

interface ProfileTarget {
  userId: string;
  userName: string;
  beforeDisplay: string;
  beforeRaw: unknown;
}

interface BulkProfilePayload {
  attributeName: string;
  attributeLabel: string;
  newRaw: unknown;
  newDisplay: string;
  targets: ProfileTarget[];
  unchanged: number;
  unreadable: number;
}

function isBulkProfilePayload(value: unknown): value is BulkProfilePayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as BulkProfilePayload;
  return typeof payload.attributeName === 'string' && Array.isArray(payload.targets);
}

const NEVER_BULK_SET = 'login';

interface OfferableAttribute {
  name: string;
  label: string;
  control: EditControl;
  options?: readonly EditOption[];
  writable: readonly string[];
  ownedBy?: string;
}

interface AttributeOffer {
  offerable: OfferableAttribute[];
  withheld: number;
  owners: readonly string[];
}

const BOOLEAN_OPTIONS: readonly EditOption[] = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
];

function offerableAttributes(
  schema: OktaUserProfileSchema,
  cohort: CohortRead,
  order: readonly string[],
): AttributeOffer {
  const offerable: OfferableAttribute[] = [];
  const owners = new Set<string>();
  let withheld = 0;

  const sample = order.map((id) => cohort.users.get(id)).find((user) => user !== undefined);
  if (!sample) return { offerable, withheld, owners: [] };

  for (const descriptor of allProfileAttributes(sample, schema)) {
    if (descriptor.name === NEVER_BULK_SET) continue;

    const writable: string[] = [];
    let control: EditControl | undefined;
    let options: readonly EditOption[] | undefined;
    const blockedBy = new Set<string>();

    for (const userId of order) {
      const user = cohort.users.get(userId);
      if (!user) continue;
      const verdict = attributeEditability(descriptor, user, cohort.mastering.get(userId));
      if (verdict.editable) {
        writable.push(userId);
        control ??= verdict.control;
        options ??= verdict.options;
        continue;
      }
      if (verdict.reason === 'externally-mastered' && verdict.source) blockedBy.add(verdict.source);
    }

    if (writable.length === 0 || control === undefined) {
      if (blockedBy.size > 0 || writable.length === 0) {
        if (blockedBy.size > 0) {
          withheld += 1;
          for (const owner of blockedBy) owners.add(owner);
        }
      }
      continue;
    }

    const owner = [...blockedBy][0];
    offerable.push({
      name: descriptor.name,
      label: descriptor.label,
      control,
      writable,
      ...(options === undefined ? {} : { options }),
      ...(owner === undefined ? {} : { ownedBy: owner }),
    });
  }

  return { offerable, withheld, owners: [...owners] };
}

function withheldHelp(offer: AttributeOffer): string {
  const lead = 'Each attribute shows what these users hold for it now.';
  if (offer.withheld === 0) return lead;

  const owned = offer.owners.length > 0 ? ` (${offer.owners.join(', ')})` : '';
  const noun = pluralNoun(offer.withheld, 'attribute');
  const isAre = offer.withheld === 1 ? 'is' : 'are';
  const itThem = offer.withheld === 1 ? 'it' : 'them';
  return `${lead} ${offer.withheld.toLocaleString()} more ${noun} ${isAre} not listed: a profile source outside Okta${owned} owns ${itThem} for every selected user, so ${itThem} ${isAre} changed there.`;
}

function nothingOfferedMessage(offer: AttributeOffer): string {
  if (offer.withheld === 0) {
    return 'This org defines no profile attribute that Okta reports as writable, so there is nothing this verb could set.';
  }
  const names = offer.owners.join(', ');
  const owned = names === '' ? 'a profile source outside Okta' : names;
  return `Every profile attribute this org defines is mastered outside Okta (${owned}) for every selected user, so it is changed there rather than here.`;
}

const COHORT_KEY = 'bulk-profile:cohort';

const SCHEMA_KEY = 'bulk-profile:schema';

const RULES_KEY = 'bulk-profile:rules';

async function readRuleInventory(context: VerbContext): Promise<RuleInventoryState> {
  const parked = context.memo.get(RULES_KEY);
  if (parked) return parked as RuleInventoryState;

  const rules = await context.api.ensureGroupRulesLoaded();
  const state: RuleInventoryState =
    rules === null ? { status: 'unavailable' } : { status: 'available', rules };
  context.memo.set(RULES_KEY, state);
  return state;
}

async function readSchema(context: VerbContext): Promise<OktaUserProfileSchema | null> {
  const parked = context.memo.get(SCHEMA_KEY);
  if (parked) return parked as OktaUserProfileSchema;

  const schema = await context.api.getUserProfileSchema();
  if (schema) context.memo.set(SCHEMA_KEY, schema);
  return schema;
}

interface CohortRead {
  users: Map<string, OktaUser>;
  mastering: Map<string, ProfileMastering>;
  unreadable: string[];
}

function isCohortRead(value: unknown): value is CohortRead {
  return value instanceof Object && 'users' in value && (value as CohortRead).users instanceof Map;
}

async function readCohort(
  context: VerbContext,
  users: readonly { id: string }[],
): Promise<CohortRead> {
  const parked = context.memo.get(COHORT_KEY);
  if (isCohortRead(parked)) return parked;

  const read: CohortRead = { users: new Map(), unreadable: [], mastering: new Map() };
  const outcome = await context.api.runOperation(
    'Read current profile values',
    [...users],
    async (user) => {
      const [live, apps] = await Promise.all([
        context.api.getUserRaw(user.id),
        getOrFetch(cacheKeys.userApps(user.id), () => context.api.getUserApps(user.id)),
      ]);
      read.mastering.set(user.id, profileMastering(apps.apps, apps.complete));
      if (!live) {
        read.unreadable.push(user.id);
        return;
      }
      read.users.set(user.id, live);
    },
    {
      message: (progress) => `Reading current values (${progress.completed}/${progress.total})`,
      plan: { endpoint: '/api/v1/users', method: 'GET' },
    },
  );

  if (outcome.cancelled) {
    throw new VerbRefusal(
      'nothing-to-do',
      'The read was cancelled, so nothing was measured and nothing has been changed.',
    );
  }

  context.memo.set(COHORT_KEY, read);
  return read;
}

function spreadSummary(rows: readonly BreakdownRow[]): string {
  const empty = rows.find((row) => row.value === NONE_VALUE)?.count ?? 0;
  const values = rows.filter((row) => row.value !== NONE_VALUE).length;
  if (values === 0) return `no value on any of these ${pluralNoun(2, 'user')}`;
  const named = `${values.toLocaleString()} ${pluralNoun(values, 'value')}`;
  return empty === 0 ? named : `${named} · ${empty.toLocaleString()} empty`;
}

function attributeField(
  offer: AttributeOffer,
  members: readonly OktaUser[],
  help: string,
): VerbField {
  return {
    id: ATTRIBUTE_FIELD,
    label: 'Attribute',
    optionLayout: 'list',
    options: offer.offerable.map((attribute) => {
      const all = computeDimensionBreakdown([...members], attribute.name);
      const partial =
        attribute.writable.length < members.length
          ? ` · writable on ${attribute.writable.length.toLocaleString()} of ${members.length.toLocaleString()}`
          : '';
      return {
        value: attribute.name,
        label: attribute.label,
        summary: `${spreadSummary(all)}${partial}`,
        distribution: computeDimensionBreakdown([...members], attribute.name, SPREAD_ROWS),
      };
    }),
    refreshesFields: true,
    help,
  };
}

function valueField(attribute: OfferableAttribute, members: readonly OktaUser[]): VerbField {
  const shared = {
    id: VALUE_FIELD,
    label: `New ${attribute.label}`,
    help: 'Every ticked user gets this exact value. Clearing an attribute is not offered here: a blank field would be indistinguishable from an unfinished one.',
    distribution: computeDimensionBreakdown([...members], attribute.name, SPREAD_ROWS),
  };

  switch (attribute.control) {
    case 'select':
      return { ...shared, options: attribute.options ?? [] };
    case 'checkbox':
      return { ...shared, options: BOOLEAN_OPTIONS };
    case 'number':
      return { ...shared, control: 'number', placeholder: 'A number' };
    case 'text':
      return { ...shared, placeholder: 'The value every ticked user will hold' };
  }
}

function answerDisplay(attribute: OfferableAttribute, answer: string): string {
  const options = attribute.control === 'checkbox' ? BOOLEAN_OPTIONS : attribute.options;
  return options?.find((option) => option.value === answer)?.label ?? answer;
}

function overCaptureMessage(count: number): string {
  return `This would change ${count.toLocaleString()} users, past the ${MAX_CAPTURED_COHORT.toLocaleString()} whose previous values one run can record. Nothing has been changed. Past that, the run could not be undone, and an undo this app cannot honour is not one it will offer. Narrow the selection and run it again.`;
}

function refuse(
  code: 'nothing-to-do' | 'over-capture-cohort' | 'invalid-value',
  message: string,
  lines: readonly string[] = [],
): VerbPreflight {
  return { cost: { requests: 0, writes: 0 }, items: 0, lines, refusal: { code, message } };
}

function targetGroupLabel(
  rules: RuleInventoryState,
  targetGroupIds: readonly string[],
): string | undefined {
  if (targetGroupIds.length === 0 || rules.status !== 'available') return undefined;
  const byId = new Map<string, string>();
  for (const rule of rules.rules as readonly FormattedRule[]) {
    const names = rule.groupNames ?? [];
    (rule.groupIds ?? []).forEach((id, index) => {
      const name = names[index] ?? rule.allGroupNamesMap?.[id];
      if (name) byId.set(id, name);
    });
  }
  return targetGroupIds.map((id) => byId.get(id) ?? id).join(', ');
}

function ruleImpactLines(impact: CohortRuleImpact, rules: RuleInventoryState): string[] {
  if (impact.status === 'not-computed') {
    return impact.reason === 'rules-unavailable'
      ? [
          "The org's group rules could not be read, so whether this changes anyone's group membership was not checked",
        ]
      : [];
  }

  const lines: string[] = [];
  for (const flip of impact.flips) {
    const into = targetGroupLabel(rules, flip.targetGroupIds);
    if (flip.transition === 'starts-matching') {
      lines.push(
        into === undefined
          ? `${pluralize(flip.userCount, USER)} would start matching ${flip.ruleName}`
          : `${pluralize(flip.userCount, USER)} would start matching ${flip.ruleName}, which adds them to ${into}`,
      );
    } else {
      lines.push(
        into === undefined
          ? `${pluralize(flip.userCount, USER)} would stop matching ${flip.ruleName}, so Okta drops the membership it was keeping`
          : `${pluralize(flip.userCount, USER)} would stop matching ${flip.ruleName}, so Okta drops them from ${into}`,
      );
    }
  }

  if (impact.undetermined.length > 0) {
    const names = impact.undetermined.map((entry) => entry.ruleName).join(', ');
    const count = impact.undetermined.length;
    lines.push(
      `${count === 1 ? 'One rule reads' : `${count} rules read`} this attribute and could not be checked here (${names}): answering ${count === 1 ? 'it' : 'them'} needs each user's full group list, which this run does not read`,
    );
  }

  return lines;
}

function overwriteLine(targets: readonly ProfileTarget[]): string {
  const counts = new Map<string, number>();
  for (const target of targets) {
    counts.set(target.beforeDisplay, (counts.get(target.beforeDisplay) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const named = ranked
    .slice(0, OVERWRITE_SAMPLE)
    .map(([value, count]) => `${value === '' ? '(empty)' : value} (${count})`);

  const rest = ranked.slice(OVERWRITE_SAMPLE);
  if (rest.length === 0) return `Overwrites ${named.join(', ')}`;

  const restUsers = rest.reduce((sum, [, count]) => sum + count, 0);
  return `Overwrites ${named.join(', ')}, and ${rest.length} other ${pluralNoun(rest.length, 'value')} held by ${pluralize(restUsers, USER)}`;
}

export const setUserProfileAttribute: BasketVerb = {
  id: 'bulk-update-user-profile',
  label: 'Set a profile attribute',
  title: 'Set one profile attribute on these users',
  path: 'write',
  needs: ['user'],

  cost(basket: SelectionBasket): VerbCost {
    return {
      requests: pickedUsers(basket).length + 1,
      walks: [
        { count: pickedUsers(basket).length, kind: 'app-assignment' },
        { count: 1, kind: 'group-rule' },
      ],
      writes: 0,
    };
  },

  async prepareFields(context: VerbContext): Promise<readonly VerbField[]> {
    const users = pickedUsers(context.basket);

    if (users.length > MAX_CAPTURED_COHORT) {
      throw new VerbRefusal('over-capture-cohort', overCaptureMessage(users.length));
    }

    const schema = await readSchema(context);
    if (!schema) {
      throw new VerbRefusal(
        'nothing-to-do',
        "The org's profile schema could not be read, so there is no list of attributes to choose from.",
      );
    }

    const cohort = await readCohort(context, users);
    if (cohort.users.size === 0) {
      throw new VerbRefusal(
        'nothing-to-do',
        `Okta returned none of the ${pluralize(users.length, USER)} selected, so there is nothing to read a value from and nothing to set.`,
      );
    }

    const order = users.map((user) => user.id);
    const offer = offerableAttributes(schema, cohort, order);
    if (offer.offerable.length === 0) {
      throw new VerbRefusal('nothing-to-do', nothingOfferedMessage(offer));
    }

    const members = [...cohort.users.values()];

    const picked = offer.offerable.find(
      (option) => option.name === context.values[ATTRIBUTE_FIELD],
    );
    const attribute = attributeField(offer, members, withheldHelp(offer));
    return picked ? [attribute, valueField(picked, members)] : [attribute];
  },

  async preflight(context: VerbContext): Promise<VerbPreflight> {
    const attributeName = context.values[ATTRIBUTE_FIELD] ?? '';
    const answer = context.values[VALUE_FIELD] ?? '';
    const users = pickedUsers(context.basket);

    const [schema, cohort, ruleInventory] = await Promise.all([
      readSchema(context),
      readCohort(context, users),
      readRuleInventory(context),
    ]);
    const offered = schema
      ? offerableAttributes(
          schema,
          cohort,
          users.map((user) => user.id),
        ).offerable.find((option) => option.name === attributeName)
      : undefined;
    if (!offered) {
      return refuse(
        'nothing-to-do',
        `The org's profile schema no longer offers ${attributeName} as an attribute this app may write, so nothing was measured and nothing will be changed.`,
      );
    }

    const coerced = coerceDraftValue(answer, offered.control);
    if (!coerced.ok) {
      return refuse(
        'invalid-value',
        `${coerced.error} Nothing has been measured and nothing will be changed.`,
      );
    }
    const newRaw = coerced.value;
    const newDisplay = answerDisplay(offered, answer);

    const allowed = offered.control === 'checkbox' ? BOOLEAN_OPTIONS : offered.options;
    if (allowed !== undefined && !allowed.some((option) => option.value === answer)) {
      return refuse(
        'invalid-value',
        `${offered.label} accepts only the values the org defines for it, and that is not one of them. Nothing has been measured and nothing will be changed.`,
      );
    }

    const ordered: ProfileTarget[] = [];
    let unchanged = 0;

    const writable = new Set(offered.writable);
    const owned = users.filter(
      (user) => cohort.users.has(user.id) && !writable.has(user.id),
    ).length;

    for (const user of users) {
      const live = cohort.users.get(user.id);
      if (!live || !writable.has(user.id)) continue;
      const beforeRaw = live.profile?.[attributeName];
      if (beforeRaw === newRaw) {
        unchanged += 1;
        continue;
      }
      ordered.push({
        userId: user.id,
        userName: user.name,
        beforeDisplay: toDisplay(beforeRaw),
        beforeRaw,
      });
    }
    const unreadable = cohort.unreadable;

    const lines: string[] = [];
    if (ordered.length > 0) {
      lines.push(
        `${ordered.length.toLocaleString()} of ${users.length.toLocaleString()} ${pluralNoun(users.length, USER)} will have ${offered.label} set to ${newDisplay}`,
      );
      lines.push(overwriteLine(ordered));
    }
    if (unchanged > 0) {
      lines.push(
        `${pluralize(unchanged, USER)} already ${unchanged === 1 ? 'holds' : 'hold'} that value, and ${unchanged === 1 ? 'costs' : 'cost'} no write`,
      );
    }
    if (owned > 0) {
      const by = offered.ownedBy === undefined ? 'a profile source outside Okta' : offered.ownedBy;
      lines.push(
        `${pluralize(owned, USER)} ${owned === 1 ? 'is' : 'are'} mastered by ${by} for ${offered.label}, and will be left alone`,
      );
    }
    if (unreadable.length > 0) {
      lines.push(`${pluralize(unreadable.length, USER)} could not be read, and will be left alone`);
    }

    lines.push(
      ...ruleImpactLines(
        analyzeCohortRuleImpact({
          attributeName,
          newValue: newRaw,
          targets: ordered
            .map((target) => cohort.users.get(target.userId))
            .filter((user): user is OktaUser => user !== undefined),
          rules: ruleInventory,
        }),
        ruleInventory,
      ),
    );

    if (ordered.length === 0) {
      return refuse(
        'nothing-to-do',
        unchanged > 0 && unchanged + owned + unreadable.length === users.length && owned === 0
          ? `Every selected user already holds that value for ${offered.label}, so there is nothing to write.`
          : `No selected user would change, so there is nothing to write.`,
        lines,
      );
    }

    if (ordered.length > MAX_CAPTURED_COHORT) {
      return refuse('over-capture-cohort', overCaptureMessage(ordered.length), lines);
    }

    return {
      cost: { requests: ordered.length, writes: ordered.length },
      items: ordered.length,
      lines,
      payload: {
        attributeName,
        attributeLabel: offered.label,
        newRaw,
        newDisplay,
        targets: ordered,
        unchanged,
        unreadable: unreadable.length,
      } satisfies BulkProfilePayload,
    };
  },

  async run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    const payload = preflight?.payload;
    if (!isBulkProfilePayload(payload)) {
      throw new Error('bulk-update-user-profile was run without its preflight');
    }

    const { attributeName, attributeLabel, newRaw, newDisplay, targets } = payload;
    if (targets.length === 0) {
      return { status: 'nothing-to-do', summary: 'No ticked user would change.' };
    }

    const results = new Map<string, 'set' | 'rejected' | 'unconfirmed'>();
    const saved: BulkProfileChange[] = [];
    const unconfirmed: string[] = [];
    let done = 0;

    await context.api.runOperation(
      'Set profile attribute',
      [...targets],
      async (target) => {
        const result = await context.api.updateUserProfile(target.userId, {
          [attributeName]: newRaw,
        });
        done += 1;
        context.report(`Setting ${attributeLabel} (${done}/${targets.length})`);

        if (result.kind === 'saved') {
          results.set(target.userId, 'set');
          saved.push({
            userId: target.userId,
            beforeRaw: target.beforeRaw,
            beforeDisplay: target.beforeDisplay,
          });
          return;
        }
        if (result.kind === 'unknown') {
          results.set(target.userId, 'unconfirmed');
          unconfirmed.push(target.userId);
          return;
        }
        results.set(target.userId, 'rejected');
      },
      {
        message: (progress) =>
          `Setting ${attributeLabel} (${progress.completed}/${progress.total})`,
        plan: { endpoint: '/api/v1/users', method: 'POST' },
      },
    );

    const rejected = targets.length - saved.length - unconfirmed.length;

    if (saved.length + unconfirmed.length > 0) {
      try {
        await logBulkProfileUpdateAction(attributeName, attributeLabel, newDisplay, saved, {
          unconfirmedUserIds: unconfirmed,
          status: unconfirmed.length > 0 ? 'partial' : 'completed',
        });
      } catch {
        log.error('Could not record the undo entry for a bulk profile run', {
          saved: saved.length,
          unconfirmed: unconfirmed.length,
        });
      }
    }

    const sentences = [`Set ${attributeLabel} on ${pluralize(saved.length, USER)}.`];
    if (rejected > 0) {
      sentences.push(
        `Okta rejected ${pluralize(rejected, USER)}, who still hold their previous value.`,
      );
    }
    if (unconfirmed.length > 0) {
      sentences.push(
        `${pluralize(unconfirmed.length, USER)} could not be confirmed and may or may not have been set — reload them to check. Those are not covered by the undo entry.`,
      );
    }

    return {
      status: rejected === 0 && unconfirmed.length === 0 ? 'done' : 'partly-done',
      summary: sentences.join(' '),
      detail: {
        filenameStem: 'profile-attribute-set',
        headers: ['User', 'User ID', 'Outcome', 'Previous value', 'New value'],
        rows: targets.map((target) => [
          target.userName,
          target.userId,
          results.get(target.userId) ?? 'not attempted',
          target.beforeDisplay,
          newDisplay,
        ]),
      },
    };
  },
};

export default setUserProfileAttribute;
