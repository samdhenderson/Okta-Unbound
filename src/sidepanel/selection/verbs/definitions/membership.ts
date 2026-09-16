import { pluralize, type NounForms } from '@/shared/utils/plural';
import { userDisplayName } from '@/shared/utils/userDisplay';
import { readEmbeddedGroupRules } from '@/shared/membership/memberRuleAttribution';
import type { OktaUser } from '@/shared/types';
import type { CellValue } from '../../../export/types';
import type { SelectionBasket, SelectionKind, SelectionRef } from '../../selectionStore';
import type { BasketVerb, VerbContext, VerbCost, VerbOutcome, VerbPreflight } from '../types';

const MEMBERSHIP: NounForms = { one: 'membership', other: 'memberships' };
const PERSON: NounForms = { one: 'person', other: 'people' };
const USER: NounForms = { one: 'user', other: 'users' };

function pickedOfKind(basket: SelectionBasket, kind: SelectionKind): SelectionRef[] {
  return basket.picked.filter((ref) => ref.kind === kind);
}

const NOT_UNDOABLE_LINE =
  'This cannot be undone here: putting every membership back is a new run with its own cost and confirmation, not a restore.';

interface ResolvedUser {
  id: string;
  user: OktaUser;
}

interface AddPayload {
  users: ResolvedUser[];
  groups: { id: string; name: string }[];
}

function isAddPayload(value: unknown): value is AddPayload {
  const payload = value as AddPayload | null;
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray(payload.users) &&
    Array.isArray(payload.groups)
  );
}

export const addUsersToGroups: BasketVerb = {
  id: 'add-users-to-groups',
  label: 'Add to groups',
  title: 'Add these users to these groups',
  path: 'write',
  needs: ['user', 'group'],

  cost(basket: SelectionBasket): VerbCost {
    return { requests: pickedOfKind(basket, 'user').length, writes: 0 };
  },

  async preflight(context: VerbContext): Promise<VerbPreflight> {
    const ticked = pickedOfKind(context.basket, 'user');
    const groups = pickedOfKind(context.basket, 'group').map((ref) => ({
      id: ref.id,
      name: ref.name,
    }));

    const details = await context.api.batchGetUserDetails(
      ticked.map((ref) => ref.id),
      (current, total) => context.report(`Reading users (${current}/${total})`),
    );

    const users: ResolvedUser[] = [];
    for (const ref of ticked) {
      const user = details.get(ref.id);
      if (user) users.push({ id: ref.id, user });
    }

    const writes = users.length * groups.length;
    const unresolved = ticked.length - users.length;

    const lines: string[] = [];
    if (writes > 0) {
      lines.push(
        `${pluralize(users.length, USER)} × ${pluralize(groups.length, 'group')} — ${pluralize(writes, MEMBERSHIP)} to write`,
      );
    }
    if (unresolved > 0) {
      lines.push(
        `${pluralize(unresolved, 'ticked user')} no longer ${unresolved === 1 ? 'resolves' : 'resolve'} to an Okta account, and ${unresolved === 1 ? 'is' : 'are'} left out of this run`,
      );
    }
    if (writes > 0) lines.push(NOT_UNDOABLE_LINE);

    return {
      cost: { requests: writes, writes },
      items: writes,
      lines,
      refusal:
        writes === 0
          ? {
              code: 'nothing-to-do',
              message: 'No ticked user resolves to an Okta account, so there is nothing to add.',
            }
          : undefined,
      payload: { users, groups } satisfies AddPayload,
    };
  },

  async run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    const payload = preflight?.payload;
    if (!isAddPayload(payload)) {
      throw new Error('add-users-to-groups was run without its preflight');
    }

    const pairs = payload.groups.flatMap((group) =>
      payload.users.map((entry) => ({ group, entry })),
    );
    if (pairs.length === 0) {
      return { status: 'nothing-to-do', summary: 'There was no membership to add.' };
    }

    const rows: CellValue[][] = [];
    let added = 0;

    await context.api.runOperation(
      'Add users to groups',
      pairs,
      async ({ group, entry }) => {
        const result = await context.api.addUserToGroup(group.id, group.name, entry.user);
        if (result.success) added += 1;
        rows.push([
          group.name,
          group.id,
          userDisplayName(entry.user),
          entry.id,
          result.success ? 'added' : 'failed',
          result.error ?? '',
        ]);
      },
      {
        message: (progress) => `Adding memberships (${progress.completed}/${progress.total})`,
        plan: { endpoint: '/api/v1/groups', method: 'PUT' },
      },
    );

    const failed = pairs.length - added;

    return {
      status: failed === 0 ? 'done' : added === 0 ? 'refused' : 'partly-done',
      summary:
        failed === 0
          ? `Added ${pluralize(added, MEMBERSHIP)} across ${pluralize(payload.groups.length, 'group')}.`
          : `Added ${pluralize(added, MEMBERSHIP)}; ${pluralize(failed, MEMBERSHIP)} failed and were left unchanged.`,
      detail: {
        filenameStem: 'memberships-added',
        headers: ['Group', 'Group ID', 'User', 'User ID', 'Outcome', 'Error'],
        rows,
      },
    };
  },
};

type RemovalSource =
  | { kind: 'rule-fed'; rules: { id: string; name: string }[] }
  | { kind: 'manual' }
  | { kind: 'not-stated' };

interface Removal {
  groupId: string;
  groupName: string;
  user: OktaUser;
  source: RemovalSource;
}

interface RemovePayload {
  removals: Removal[];
}

function isRemovePayload(value: unknown): value is RemovePayload {
  const payload = value as RemovePayload | null;
  return typeof payload === 'object' && payload !== null && Array.isArray(payload.removals);
}

interface RuleExclusion {
  id: string;
  name: string;
  count: number;
}

function exclusionsByRule(removals: readonly Removal[]): RuleExclusion[] {
  const byRule = new Map<string, RuleExclusion>();
  for (const removal of removals) {
    if (removal.source.kind !== 'rule-fed') continue;
    for (const rule of removal.source.rules) {
      const existing = byRule.get(rule.id);
      if (existing) existing.count += 1;
      else byRule.set(rule.id, { id: rule.id, name: rule.name, count: 1 });
    }
  }
  return [...byRule.values()].sort((a, b) => b.count - a.count);
}

function groupLine(name: string, group: readonly Removal[]): string {
  const count = (kind: RemovalSource['kind']) =>
    group.filter((removal) => removal.source.kind === kind).length;

  const parts: string[] = [];
  const ruleFed = count('rule-fed');
  const manual = count('manual');
  const notStated = count('not-stated');
  if (ruleFed > 0) parts.push(`${ruleFed.toLocaleString()} fed by a rule`);
  if (manual > 0) parts.push(`${manual.toLocaleString()} added manually`);
  if (notStated > 0) parts.push(`${notStated.toLocaleString()} with no source stated by Okta`);

  return `${name} — ${pluralize(group.length, MEMBERSHIP)} to remove: ${parts.join(', ')}`;
}

export const removeUsersFromGroups: BasketVerb = {
  id: 'remove-users-from-groups',
  label: 'Remove from groups',
  title: 'Remove these users from these groups',
  path: 'write',
  needs: ['user', 'group'],

  cost(basket: SelectionBasket): VerbCost {
    return { requests: 0, walks: pickedOfKind(basket, 'group').length, writes: 0 };
  },

  async preflight(context: VerbContext): Promise<VerbPreflight> {
    const groups = pickedOfKind(context.basket, 'group');
    const tickedUserIds = new Set(pickedOfKind(context.basket, 'user').map((ref) => ref.id));
    const byGroup = new Map<string, Removal[]>();

    const outcome = await context.api.runOperation(
      'Check group memberships',
      groups,
      async (group, _index, planId) => {
        const members = await context.api.getAllGroupMembers(group.id, { planId });
        const removals: Removal[] = [];
        for (const member of members) {
          if (!tickedUserIds.has(member.id)) continue;
          const attribution = readEmbeddedGroupRules(member);
          const source: RemovalSource =
            attribution.state === 'rules'
              ? { kind: 'rule-fed', rules: attribution.rules }
              : attribution.state === 'no-rules'
                ? { kind: 'manual' }
                : { kind: 'not-stated' };
          removals.push({ groupId: group.id, groupName: group.name, user: member, source });
        }
        byGroup.set(group.id, removals);
      },
      {
        message: (progress) => `Checking memberships (${progress.completed}/${progress.total})`,
        plan: { endpoint: '/api/v1/groups', method: 'GET' },
      },
    );

    if (outcome.cancelled) {
      return {
        cost: { requests: 0, writes: 0 },
        items: 0,
        lines: [],
        refusal: {
          code: 'nothing-to-do',
          message: 'The membership check was cancelled, so nothing was measured.',
        },
      };
    }

    const ordered = groups.map((group) => ({ group, removals: byGroup.get(group.id) ?? [] }));
    const removals = ordered.flatMap((entry) => entry.removals);

    if (removals.length === 0) {
      return {
        cost: { requests: 0, writes: 0 },
        items: 0,
        lines: [],
        refusal: {
          code: 'nothing-to-do',
          message: 'None of the ticked users is a member of any ticked group.',
        },
        payload: { removals } satisfies RemovePayload,
      };
    }

    const lines: string[] = [];
    for (const entry of ordered) {
      if (entry.removals.length > 0) lines.push(groupLine(entry.group.name, entry.removals));
    }

    const exclusions = exclusionsByRule(removals);
    for (const rule of exclusions) {
      lines.push(
        `Rule “${rule.name}” — this run adds ${pluralize(rule.count, PERSON)} to its exclusion list`,
      );
    }

    if (exclusions.length > 0) {
      lines.push(
        'An exclusion list cannot be cleared from here — this app can create, delete, activate and deactivate a rule, and nothing else. A rule-fed removal is reversible only in the Okta admin console.',
      );
    }

    const notStated = removals.filter((removal) => removal.source.kind === 'not-stated').length;
    if (notStated > 0) {
      lines.push(
        `Okta stated no source for ${pluralize(notStated, MEMBERSHIP)}, so this run cannot name the exclusion lists those removals would touch.`,
      );
    }

    lines.push(NOT_UNDOABLE_LINE);

    return {
      cost: { requests: removals.length, writes: removals.length },
      items: removals.length,
      lines,
      payload: { removals } satisfies RemovePayload,
    };
  },

  async run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    const payload = preflight?.payload;
    if (!isRemovePayload(payload)) {
      throw new Error('remove-users-from-groups was run without its preflight');
    }

    const { removals } = payload;
    if (removals.length === 0) {
      return { status: 'nothing-to-do', summary: 'There was no membership to remove.' };
    }

    const rows: CellValue[][] = [];
    let removed = 0;

    await context.api.runOperation(
      'Remove users from groups',
      removals,
      async (removal, _index, planId) => {
        const result = await context.api.removeUserFromGroup(
          removal.groupId,
          removal.groupName,
          removal.user,
          false,
          planId,
        );
        if (result.success) removed += 1;
        rows.push([
          removal.groupName,
          removal.groupId,
          userDisplayName(removal.user),
          removal.user.id,
          removal.source.kind,
          removal.source.kind === 'rule-fed'
            ? removal.source.rules.map((rule) => rule.name).join('; ')
            : '',
          result.success ? 'removed' : 'failed',
          result.success ? '' : (result.error ?? ''),
        ]);
      },
      {
        message: (progress) => `Removing memberships (${progress.completed}/${progress.total})`,
        plan: { endpoint: '/api/v1/groups', method: 'DELETE' },
      },
    );

    const failed = removals.length - removed;
    const ruleFed = removals.filter((removal) => removal.source.kind === 'rule-fed').length;
    const excluded =
      ruleFed === 0
        ? ''
        : ` ${pluralize(ruleFed, MEMBERSHIP)} ${ruleFed === 1 ? 'was' : 'were'} fed by a rule, so those users are now on a rule's exclusion list.`;

    return {
      status: failed === 0 ? 'done' : removed === 0 ? 'refused' : 'partly-done',
      summary:
        failed === 0
          ? `Removed ${pluralize(removed, MEMBERSHIP)}.${excluded}`
          : `Removed ${pluralize(removed, MEMBERSHIP)}; ${pluralize(failed, MEMBERSHIP)} failed and were left in place.${excluded}`,
      detail: {
        filenameStem: 'memberships-removed',
        headers: [
          'Group',
          'Group ID',
          'User',
          'User ID',
          'Source',
          'Feeding rules',
          'Outcome',
          'Error',
        ],
        rows,
      },
    };
  },
};

export default [addUsersToGroups, removeUsersFromGroups];
