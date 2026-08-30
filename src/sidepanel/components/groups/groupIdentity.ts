import type { GroupSummary, GroupType } from '../../../shared/types';
import type {
  EntityIdentityDescriptor,
  IdentityFact,
  IdentityRow,
} from '../shared/identityDescriptor';
import type { BadgeVariant } from '../shared/Badge';
import { formatDateShort, getRelativeTime } from '../../../shared/utils/dateFormat';

const TYPE_BADGES: Record<GroupType, { text: string; variant: BadgeVariant }> = {
  OKTA_GROUP: { text: 'Okta group', variant: 'primary' },
  APP_GROUP: { text: 'App group', variant: 'warning' },
  BUILT_IN: { text: 'Built-in', variant: 'neutral' },
};

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

export function groupIdentity(group: GroupSummary): EntityIdentityDescriptor {
  const typeMark = TYPE_BADGES[group.type] ?? TYPE_BADGES.BUILT_IN;
  const isAlarming = typeMark.variant === 'danger';

  const identityRow: IdentityRow = isAlarming
    ? []
    : [{ kind: 'status', variant: typeMark.variant, text: typeMark.text }];
  identityRow.push({ kind: 'id', value: group.id, copyLabel: 'Copy group id' });

  const counts: IdentityRow = [metric('users', group.memberCount, 'member')];
  if (group.ruleCount > 0) {
    counts.push(metric('bolt', group.ruleCount, 'rule', 'Rules that assign members here'));
  }
  if (group.usedInRuleCount !== undefined && group.usedInRuleCount > 0) {
    counts.push(
      metric(
        'link',
        group.usedInRuleCount,
        'reference',
        'Rules whose condition mentions this group',
      ),
    );
  }

  const timestamps: IdentityRow = [];
  if (group.created) {
    timestamps.push({
      kind: 'text',
      icon: 'clock',
      text: `Created ${formatDateShort(group.created)}`,
    });
  }
  if (group.lastUpdated) {
    const relative = getRelativeTime(group.lastUpdated.toISOString());
    timestamps.push({
      kind: 'text',
      text: `Profile ${relative ?? formatDateShort(group.lastUpdated)}`,
    });
  }
  if (group.lastMembershipUpdated) {
    const relative = getRelativeTime(group.lastMembershipUpdated.toISOString());
    timestamps.push({
      kind: 'text',
      text: `Membership ${relative ?? formatDateShort(group.lastMembershipUpdated)}`,
    });
  }

  return {
    key: group.id,
    name: group.name,
    badge: isAlarming ? typeMark : undefined,
    rows: [identityRow, counts, timestamps],
    link: { entityType: 'group', entityId: group.id },
  };
}
