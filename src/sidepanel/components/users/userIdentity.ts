import type { OktaUser } from '../../../shared/types';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import { formatDateShort, getRelativeTime } from '../../../shared/utils/dateFormat';
import { userStatusVariant } from '../shared/status';
import type {
  EntityIdentityDescriptor,
  IdentityFact,
  IdentityRow,
} from '../shared/identityDescriptor';

export interface UserIdentityOptions {
  groupCount?: number;
  appCount?: number;
}

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

export function userIdentity(
  user: OktaUser,
  options: UserIdentityOptions = {},
): EntityIdentityDescriptor {
  const { groupCount, appCount } = options;

  const statusVariant = userStatusVariant(user.status);
  const isAlarming = statusVariant === 'danger';

  const identityRow: IdentityRow = isAlarming
    ? []
    : [{ kind: 'status', variant: statusVariant, text: user.status }];
  identityRow.push({ kind: 'id', value: user.id, copyLabel: 'Copy user id' });

  const counts: IdentityRow = [];
  if (groupCount !== undefined) {
    counts.push(metric('users', groupCount, 'group'));
  }
  if (appCount !== undefined) {
    counts.push(metric('app', appCount, 'app', 'Applications assigned to this user'));
  }
  const managingRules = user.managedBy?.rules?.length ?? 0;
  if (managingRules > 0) {
    counts.push(metric('bolt', managingRules, 'rule', 'Rules that grant this user membership'));
  }

  const timestamps: IdentityRow = [];
  if (user.lastLogin !== undefined) {
    const relative = getRelativeTime(user.lastLogin);
    timestamps.push({
      kind: 'text',
      icon: 'clock',
      text: `Last login ${relative ?? (user.lastLogin ? formatDateShort(user.lastLogin) : 'never')}`,
    });
  }
  if (user.created) {
    timestamps.push({ kind: 'text', text: `Created ${formatDateShort(user.created)}` });
  }

  return {
    key: user.id,
    name: userDisplayName(user),
    badge: isAlarming ? { text: user.status, variant: statusVariant } : undefined,
    rows: [identityRow, counts, timestamps],
    link: { entityType: 'user', entityId: user.id },
  };
}
