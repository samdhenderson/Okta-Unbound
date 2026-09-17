import { pluralize, type NounForms } from '../../../shared/utils/plural';
import type { VerbCost, WalkKind } from './types';

const REQUEST: NounForms = { one: 'request', other: 'requests' };
const ENTITY: NounForms = { one: 'entity', other: 'entities' };

const WALK_NOUNS: Record<WalkKind, NounForms> = {
  membership: { one: 'membership walk', other: 'membership walks' },
  'app-assignment': { one: 'app-assignment walk', other: 'app-assignment walks' },
  'group-rule': { one: 'group-rule walk', other: 'group-rule walks' },
};

function joinClauses(parts: readonly string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function costSentence(cost: VerbCost): string {
  const parts: string[] = [];
  if (cost.requests > 0) parts.push(pluralize(cost.requests, REQUEST));
  for (const walk of cost.walks ?? []) {
    if (walk.count > 0) parts.push(pluralize(walk.count, WALK_NOUNS[walk.kind]));
  }

  const spend = parts.length === 0 ? 'Takes no requests.' : `Takes ${joinClauses(parts)}.`;

  if (cost.writes === 0) return spend;
  return `${spend} Changes ${pluralize(cost.writes, ENTITY)} in Okta.`;
}
