import type { OktaIdKind } from '../../../shared/utils/oktaId';
import type { EntityType } from '../../contexts/NavigationContext';
import { TAB_DEFS, type TabType } from '../../tabs';
import type { IconType } from '../shared/Icon';

const KIND_TO_ENTITY_TYPE: Record<OktaIdKind, EntityType> = {
  group: 'group',
  user: 'user',
  app: 'app',
  rule: 'rule',
};

export const DESTINATION_TAB: Readonly<Record<OktaIdKind, TabType>> = {
  group: 'groups',
  user: 'users',
  app: 'apps',
  rule: 'rules',
};

export const KIND_ICON: Readonly<Record<OktaIdKind, IconType>> = {
  group: 'users',
  user: 'user',
  app: 'app',
  rule: 'bolt',
};

export function destinationLabel(kind: OktaIdKind): string {
  const tab = DESTINATION_TAB[kind];
  return TAB_DEFS.find((def) => def.id === tab)?.label ?? tab;
}

export function navigationTarget(kind: OktaIdKind): EntityType {
  return KIND_TO_ENTITY_TYPE[kind];
}
