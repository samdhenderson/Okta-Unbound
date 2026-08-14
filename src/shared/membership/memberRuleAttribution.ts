import { z } from 'zod';
import { oktaUserListItemSchema } from '../schemas/okta';

export const GROUP_RULES_EXPAND = 'group-rules';

export const memberWithGroupRulesSchema = oktaUserListItemSchema.extend({
  _embedded: z.unknown().optional(),
});

export type MemberWithGroupRules = z.infer<typeof memberWithGroupRulesSchema>;

export interface EmbeddedGroupRule {
  id: string;
  name: string;
}

const embeddedGroupRuleSchema = z.object({ id: z.string(), name: z.string() }).passthrough();

export type MemberRuleAttribution =
  { state: 'rules'; rules: EmbeddedGroupRule[] } | { state: 'no-rules' } | { state: 'unknown' };

const UNKNOWN: MemberRuleAttribution = { state: 'unknown' };

export function readEmbeddedGroupRules(member: unknown): MemberRuleAttribution {
  if (typeof member !== 'object' || member === null) return UNKNOWN;

  const embedded = (member as Record<string, unknown>)._embedded;
  if (typeof embedded !== 'object' || embedded === null) return UNKNOWN;

  if (!(GROUP_RULES_EXPAND in embedded)) return UNKNOWN;

  const raw = (embedded as Record<string, unknown>)[GROUP_RULES_EXPAND];
  if (!Array.isArray(raw)) return UNKNOWN;
  if (raw.length === 0) return { state: 'no-rules' };

  const rules: EmbeddedGroupRule[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    const parsed = embeddedGroupRuleSchema.safeParse(entry);
    if (!parsed.success || seen.has(parsed.data.id)) continue;
    seen.add(parsed.data.id);
    rules.push({ id: parsed.data.id, name: parsed.data.name });
  }

  if (rules.length === 0) return UNKNOWN;

  return { state: 'rules', rules };
}
