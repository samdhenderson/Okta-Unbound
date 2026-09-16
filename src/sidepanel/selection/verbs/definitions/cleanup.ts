import type { BulkOperation, BulkOperationResult } from '../../../../shared/types';
import type { SelectionBasket } from '../../selectionStore';
import type { BasketVerb, VerbContext, VerbCost, VerbOutcome, VerbPreflight } from '../types';
import { pluralize, pluralNoun, type NounForms } from '../../../../shared/utils/plural';

const INACTIVE_STATUSES = ['DEPROVISIONED', 'SUSPENDED', 'LOCKED_OUT'] as const;

const GROUP: NounForms = { one: 'group', other: 'groups' };
const MEMBER: NounForms = { one: 'member', other: 'members' };

interface GroupFinding {
  id: string;
  name: string;
  inactive: number;
  total: number;
}

interface CleanupPayload {
  findings: GroupFinding[];
}

const pickedGroups = (basket: SelectionBasket) =>
  basket.picked.filter((ref) => ref.kind === 'group');

function isCleanupPayload(value: unknown): value is CleanupPayload {
  return (
    typeof value === 'object' && value !== null && Array.isArray((value as CleanupPayload).findings)
  );
}

export const removeInactiveMembers: BasketVerb = {
  id: 'remove-inactive-members',
  label: 'Remove inactive members',
  title: 'Remove deactivated, suspended and locked-out members from these groups',
  path: 'write',
  needs: ['group'],

  cost(basket: SelectionBasket): VerbCost {
    return { requests: 0, walks: pickedGroups(basket).length, writes: 0 };
  },

  async preflight(context: VerbContext): Promise<VerbPreflight> {
    const groups = pickedGroups(context.basket);
    const findings: GroupFinding[] = [];

    const outcome = await context.api.runOperation(
      'Count inactive members',
      groups,
      async (group, _index, planId) => {
        const members = await context.api.getAllGroupMembers(group.id, { planId });
        const inactive = members.filter((member) =>
          (INACTIVE_STATUSES as readonly string[]).includes(member.status),
        ).length;
        findings.push({ id: group.id, name: group.name, inactive, total: members.length });
      },
      {
        message: (progress) =>
          `Counting inactive members (${progress.completed}/${progress.total})`,
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
          message: 'The count was cancelled, so nothing was measured.',
        },
      };
    }

    const byId = new Map(findings.map((finding) => [finding.id, finding]));
    const ordered = groups.map((group) => byId.get(group.id)).filter((f): f is GroupFinding => !!f);

    const removals = ordered.reduce((sum, finding) => sum + finding.inactive, 0);

    const lines = ordered
      .filter((finding) => finding.inactive > 0)
      .map(
        (finding) =>
          `${finding.name} — ${finding.inactive.toLocaleString()} of ${finding.total.toLocaleString()} ${pluralNoun(finding.total, MEMBER)} are deactivated, suspended or locked out`,
      );

    return {
      cost: { requests: ordered.length + removals, walks: ordered.length, writes: removals },
      items: removals,
      lines,
      payload: { findings: ordered } satisfies CleanupPayload,
    };
  },

  async run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome> {
    const payload = preflight?.payload;
    if (!isCleanupPayload(payload)) {
      throw new Error('remove-inactive-members was run without its preflight');
    }

    const targets = payload.findings.filter((finding) => finding.inactive > 0);
    if (targets.length === 0) {
      return { status: 'nothing-to-do', summary: 'No group held a member to remove.' };
    }

    const operation: BulkOperation = {
      id: 'selection-remove-inactive',
      type: 'cleanup_inactive',
      targetGroups: targets.map((finding) => finding.id),
      status: 'pending',
      progress: 0,
      results: [],
    };

    const results = await context.api.executeBulkOperation(operation, (current, total, name) => {
      context.report(`Cleaning ${name} (${current}/${total})`);
    });

    const removed = results
      .filter((result) => result.status === 'success')
      .reduce((sum, result) => sum + result.itemsProcessed, 0);
    const failed = results.filter((result) => result.status === 'failed');

    return {
      status: failed.length === 0 ? 'done' : 'partly-done',
      summary:
        failed.length === 0
          ? `Removed ${pluralize(removed, MEMBER)} from ${pluralize(targets.length, GROUP)}.`
          : `Removed ${pluralize(removed, MEMBER)}; ${pluralize(failed.length, GROUP)} failed and kept every member.`,
      detail: {
        filenameStem: 'inactive-members-removed',
        headers: ['Group', 'Group ID', 'Outcome', 'Members removed', 'Error'],
        rows: results.map((result: BulkOperationResult) => [
          result.groupName,
          result.groupId,
          result.status,
          result.itemsProcessed,
          result.errors?.join('; ') ?? '',
        ]),
      },
    };
  },
};

export default removeInactiveMembers;
