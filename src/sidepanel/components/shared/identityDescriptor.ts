import type { IconType } from '../shared/Icon';
import type { OktaAdminTarget } from '../../../shared/utils/oktaUrl';
import type { BadgeVariant } from './Badge';

export type IdentityFact =
  | { kind: 'metric'; icon: IconType; value: string; label: string; title?: string }
  | { kind: 'text'; icon?: IconType; text: string; title?: string }
  | { kind: 'id'; value: string; copyLabel: string }
  | { kind: 'status'; variant: BadgeVariant; text: string };

export type IdentityRow = IdentityFact[];

export interface EntityIdentityDescriptor {
  key: string;
  name: string;
  badge?: { text: string; variant?: BadgeVariant };
  rows: IdentityRow[];
  link?: OktaAdminTarget;
}
