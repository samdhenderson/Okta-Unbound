import type { FormattedRule } from '../../../shared/types';
import type {
  EntityIdentityDescriptor,
  IdentityFact,
  IdentityRow,
} from '../shared/identityDescriptor';
import { getRelativeTime } from '../../../shared/utils/dateFormat';

const metric = (
  icon: Extract<IdentityFact, { kind: 'metric' }>['icon'],
  n: number,
  singular: string,
  title?: string,
): Extract<IdentityFact, { kind: 'metric' }> => ({
  kind: 'metric',
  icon,
  value: n.toLocaleString(),
  label: n === 1 ? singular : `${singular}s`,
  title,
});

export function ruleIdentity(rule: FormattedRule): EntityIdentityDescriptor {
  const isPaused = rule.status !== 'ACTIVE';

  const identityRow: IdentityRow = [];
  if (!isPaused) {
    identityRow.push({ kind: 'status', variant: 'success', text: 'Active' });
  }
  identityRow.push({ kind: 'id', value: rule.id, copyLabel: `Copy rule id ${rule.id}` });

  const counts: IdentityRow = [];
  if (rule.groupIds.length > 0) {
    counts.push(
      metric('users', rule.groupIds.length, 'target group', 'Groups this rule assigns users to'),
    );
  }
  if (rule.userAttributes.length > 0) {
    counts.push(
      metric(
        'clipboard',
        rule.userAttributes.length,
        'attribute',
        'User profile attributes this rule’s condition reads',
      ),
    );
  }
  if (rule.conflicts && rule.conflicts.length > 0) {
    counts.push(
      metric(
        'alert',
        rule.conflicts.length,
        'conflict',
        'Other rules whose conditions overlap this one',
      ),
    );
  }

  const timestamps: IdentityRow = [];
  const updated = getRelativeTime(rule.lastUpdated);
  if (updated) timestamps.push({ kind: 'text', icon: 'clock', text: `Updated ${updated}` });
  const created = getRelativeTime(rule.created);
  if (created) timestamps.push({ kind: 'text', text: `Created ${created}` });

  return {
    key: rule.id,
    name: rule.name,
    badge: isPaused ? { text: 'Paused', variant: 'warning' } : undefined,
    rows: [identityRow, counts, timestamps],
  };
}
