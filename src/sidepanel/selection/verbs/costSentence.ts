import { pluralize, type NounForms } from '../../../shared/utils/plural';
import type { VerbCost } from './types';

const REQUEST: NounForms = { one: 'request', other: 'requests' };
const ENTITY: NounForms = { one: 'entity', other: 'entities' };

const WALK_NOUNS: Record<NonNullable<VerbCost['walkKind']>, NounForms> = {
  membership: { one: 'membership walk', other: 'membership walks' },
  'app-assignment': { one: 'app-assignment walk', other: 'app-assignment walks' },
};

export function costSentence(cost: VerbCost): string {
  const parts: string[] = [];
  if (cost.requests > 0) parts.push(pluralize(cost.requests, REQUEST));
  if ((cost.walks ?? 0) > 0) {
    parts.push(pluralize(cost.walks ?? 0, WALK_NOUNS[cost.walkKind ?? 'membership']));
  }

  const spend =
    parts.length === 0
      ? 'Takes no requests.'
      : `Takes ${parts.length === 1 ? parts[0] : `${parts[0]} and ${parts[1]}`}.`;

  if (cost.writes === 0) return spend;
  return `${spend} Changes ${pluralize(cost.writes, ENTITY)} in Okta.`;
}
