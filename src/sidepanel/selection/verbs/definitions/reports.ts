import type { OktaUser } from '@/shared/types';
import { createLogger } from '@/shared/utils/logger';
import type { BasketVerb, VerbContext, VerbDetail, VerbOutcome } from '../types';
import type { SelectionBasket, SelectionKind } from '../../selectionStore';

const log = createLogger('BasketVerbs');

const COMPARE_MIN = 2;

const COMPARE_MAX = 5;

interface Ref {
  id: string;
  name: string;
}

function refsOfKind(basket: SelectionBasket, kind: SelectionKind): Ref[] {
  return basket.picked.filter((ref) => ref.kind === kind).map(({ id, name }) => ({ id, name }));
}

function fullName(user: OktaUser): string | null {
  const name = `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim();
  return name.length > 0 ? name : null;
}

export const groupOverlapVerb: BasketVerb = {
  id: 'group-overlap',
  label: 'Members these groups share',
  title: 'Report which members these groups share',
  path: 'read',
  needs: ['group'],
  isAvailable: (basket) => refsOfKind(basket, 'group').length >= COMPARE_MIN,
  unavailableReason: `Needs at least ${COMPARE_MIN} groups — an overlap of one group is not a question.`,

  cost(basket) {
    const groups = refsOfKind(basket, 'group').length;
    if (groups < COMPARE_MIN || groups > COMPARE_MAX) return { requests: 0, writes: 0 };
    return { requests: groups, writes: 0 };
  },

  async run({ basket, api, report }: VerbContext): Promise<VerbOutcome> {
    const groups = refsOfKind(basket, 'group');
    if (groups.length < COMPARE_MIN || groups.length > COMPARE_MAX) {
      return {
        status: 'refused',
        summary: `Comparing members takes ${COMPARE_MIN} to ${COMPARE_MAX} groups, and ${groups.length} are selected. Nothing was read.`,
      };
    }

    const memberCache = new Map<string, OktaUser[]>();
    const result = await api.compareGroups(
      groups,
      (current, total) => report(`Loaded members for ${current} of ${total} groups`),
      memberCache,
    );

    if (result.totalUniqueUsers === 0) {
      return {
        status: 'nothing-to-do',
        summary: `The ${groups.length} selected groups hold no members between them, so there is nothing to compare.`,
      };
    }

    const seen = new Map<string, { user: OktaUser; groupNames: string[] }>();
    for (const group of groups) {
      for (const user of memberCache.get(group.id) ?? []) {
        const entry = seen.get(user.id);
        if (entry) entry.groupNames.push(group.name);
        else seen.set(user.id, { user, groupNames: [group.name] });
      }
    }

    const shared = [...seen.values()].filter((entry) => entry.groupNames.length > 1);
    const inEvery = result.intersection.length;

    const detail: VerbDetail = {
      filenameStem: 'group-overlap',
      headers: [
        'User ID',
        'Login',
        'Name',
        'Shared groups',
        'Shared group count',
        'In every selected group',
      ],
      rows: shared.map(({ user, groupNames }) => [
        user.id,
        user.profile.login || null,
        fullName(user),
        groupNames.join('; '),
        groupNames.length,
        groupNames.length === groups.length,
      ]),
    };

    return {
      status: 'done',
      summary: `Compared ${groups.length} groups holding ${result.totalUniqueUsers} distinct members: ${shared.length} are in more than one, and ${inEvery} are in every one.`,
      detail,
    };
  },
};

export const mfaEnrolmentVerb: BasketVerb = {
  id: 'mfa-enrolment',
  label: 'MFA enrolment in these groups',
  title: "Report MFA enrolment for these groups' members",
  path: 'read',
  needs: ['group'],

  cost(basket) {
    return { requests: refsOfKind(basket, 'group').length, writes: 0 };
  },

  async run({ basket, api, report }: VerbContext): Promise<VerbOutcome> {
    const groups = refsOfKind(basket, 'group');

    const rosters = await api.runOperation(
      'MFA enrolment roster',
      groups,
      async (group, _index, planId) => ({
        group,
        members: await api.getAllGroupMembers(group.id, { planId }),
      }),
      {
        message: (progress) => `Loaded ${progress.completed}/${progress.total} group rosters`,
        plan: { endpoint: '/api/v1/groups', method: 'GET' },
      },
    );

    const unreadGroups = groups.length - rosters.completed;
    if (unreadGroups > 0) {
      log.warn('Some group rosters did not load for the MFA report', {
        groups: groups.length,
        unread: unreadGroups,
      });
    }

    const members = new Map<string, { user: OktaUser; groupNames: string[] }>();
    for (const outcome of rosters.results) {
      if (outcome.status !== 'fulfilled' || !outcome.value) continue;
      for (const user of outcome.value.members) {
        const entry = members.get(user.id);
        if (entry) entry.groupNames.push(outcome.value.group.name);
        else members.set(user.id, { user, groupNames: [outcome.value.group.name] });
      }
    }

    if (members.size === 0) {
      return {
        status: unreadGroups > 0 ? 'partly-done' : 'nothing-to-do',
        summary:
          unreadGroups > 0
            ? `No members were read: ${unreadGroups} of ${groups.length} group rosters failed to load.`
            : `The ${groups.length} selected groups hold no members, so there are no factors to read.`,
      };
    }

    const userIds = [...members.keys()];
    report(`Reading factors for ${userIds.length} members: one request each.`);
    const factors = await api.scanGroupMfa(userIds, (current, total) =>
      report(`Read factors for ${current} of ${total} members`),
    );

    let enrolled = 0;
    let withoutFactor = 0;
    let unread = 0;
    const rows = [...members.values()].map(({ user, groupNames }) => {
      const result = factors.get(user.id);
      if (!result) unread += 1;
      else if (result.enrolled) enrolled += 1;
      else withoutFactor += 1;

      return [
        user.id,
        user.profile.login || null,
        fullName(user),
        groupNames.join('; '),
        result ? result.enrolled : null,
        result ? result.factorCount : null,
        result && result.factorLabels.length > 0 ? result.factorLabels.join('; ') : null,
      ];
    });

    const detail: VerbDetail = {
      filenameStem: 'mfa-enrolment',
      headers: [
        'User ID',
        'Login',
        'Name',
        'Groups',
        'MFA enrolled',
        'Active factor count',
        'Active factors',
      ],
      rows,
    };

    const read = userIds.length - unread;
    if (unread > 0 || unreadGroups > 0) {
      return {
        status: 'partly-done',
        summary: `Read factors for ${read} of ${userIds.length} members across ${rosters.completed} of ${groups.length} groups: ${enrolled} carry an active MFA factor and ${withoutFactor} carry none. The table lists ${rows.length} members; ${unread} carry no factor reading.`,
        detail,
      };
    }

    return {
      status: 'done',
      summary: `Read factors for ${read} members across ${groups.length} groups: ${enrolled} carry an active MFA factor and ${withoutFactor} carry none.`,
      detail,
    };
  },
};

interface RuleRows {
  ruleId: string;
  ruleName: string;
  targets: { groupId: string; groupName: string; memberCount: number; heldSolelyCount: number }[];
}

export const ruleImpactVerb: BasketVerb = {
  id: 'rule-impact',
  label: 'What these rules hold up',
  title: 'Report what these rules currently hold up',
  path: 'read',
  needs: ['rule'],

  cost(basket) {
    return { requests: refsOfKind(basket, 'rule').length * 2, writes: 0 };
  },

  async run({ basket, api, report }: VerbContext): Promise<VerbOutcome> {
    const rules = refsOfKind(basket, 'rule');

    const fetched = await api.runOperation(
      'Reading rule definitions',
      rules,
      async (rule) => ({ rule, raw: await api.getRawGroupRule(rule.id) }),
      {
        message: (progress) => `Read ${progress.completed}/${progress.total} rule definitions`,
        plan: { endpoint: '/api/v1/groups/rules', method: 'GET' },
      },
    );

    const inputs: { id: string; name: string; groupIds: string[] }[] = [];
    let unreadable = 0;
    let withoutTarget = 0;
    for (const outcome of fetched.results) {
      const raw = outcome.status === 'fulfilled' ? outcome.value?.raw : null;
      if (!raw || outcome.status !== 'fulfilled' || !outcome.value) {
        unreadable += 1;
        continue;
      }
      const groupIds = raw.actions?.assignUserToGroups?.groupIds ?? [];
      if (groupIds.length === 0) {
        withoutTarget += 1;
        continue;
      }
      inputs.push({
        id: outcome.value.rule.id,
        name: raw.name || outcome.value.rule.name,
        groupIds,
      });
    }
    if (unreadable > 0) {
      log.warn('Some rule definitions did not load for the impact report', {
        rules: rules.length,
        unreadable,
      });
    }

    if (inputs.length === 0) {
      return {
        status: unreadable > 0 ? 'partly-done' : 'nothing-to-do',
        summary:
          unreadable > 0
            ? `${unreadable} of the ${rules.length} selected rules could not be read, and the remaining ${withoutTarget} assign nobody to a group.`
            : `None of the ${rules.length} selected rules assign anyone to a group, so there is nothing to report.`,
      };
    }

    report(`Capturing impact for ${inputs.length} rules.`);
    const captured = await api.runOperation(
      'Rule impact report',
      inputs,
      async (input): Promise<RuleRows | null> => {
        const summary = await api.captureRuleImpact(input);
        if (summary.emptyRuleInventory) {
          log.warn('Rule inventory was empty; withholding the impact row', { ruleId: input.id });
          return null;
        }
        return {
          ruleId: summary.ruleId,
          ruleName: summary.ruleName,
          targets: summary.targetGroups.map((target) => ({
            groupId: target.groupId,
            groupName: target.groupName,
            memberCount: target.memberCount,
            heldSolelyCount: target.heldSolelyCount,
          })),
        };
      },
      {
        concurrency: 1,
        message: (progress) => `Captured ${progress.completed}/${progress.total} rules`,
      },
    );

    const answered: RuleRows[] = [];
    for (const outcome of captured.results) {
      if (outcome.status === 'fulfilled' && outcome.value) answered.push(outcome.value);
    }

    const rows = answered.flatMap((rule) =>
      rule.targets.map((target) => [
        rule.ruleId,
        rule.ruleName,
        target.groupId,
        target.groupName,
        target.memberCount,
        target.heldSolelyCount,
      ]),
    );

    const targets = answered.flatMap((rule) => rule.targets);
    const memberships = targets.reduce((total, target) => total + target.memberCount, 0);
    const heldSolely = targets.reduce((total, target) => total + target.heldSolelyCount, 0);

    const detail: VerbDetail = {
      filenameStem: 'rule-impact',
      headers: [
        'Rule ID',
        'Rule name',
        'Target group ID',
        'Target group name',
        'Members',
        'Held by this rule alone',
      ],
      rows,
    };

    const summary = `Read ${answered.length} rules across ${rows.length} target groups: of ${memberships} memberships, ${heldSolely} are held by their rule alone.`;
    const unanswered = rules.length - answered.length - withoutTarget;

    if (unanswered > 0) {
      return {
        status: 'partly-done',
        summary: `${summary} The table covers ${answered.length} of the ${rules.length} selected rules; ${unanswered} could not be answered.`,
        detail,
      };
    }

    return { status: 'done', summary, detail };
  },
};

export default [groupOverlapVerb, mfaEnrolmentVerb, ruleImpactVerb];
