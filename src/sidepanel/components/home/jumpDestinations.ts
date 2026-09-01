import type { JumpKind } from '../../hooks/useJumpResolver';
import type { EntityType } from '../../contexts/NavigationContext';
import { TAB_DEFS, type TabType } from '../../tabs';
import type { IconType } from '../shared/Icon';

const KIND_TO_ENTITY_TYPE: Record<JumpKind, EntityType> = {
  group: 'group',
  user: 'user',
  app: 'app',
  rule: 'rule',
  policy: 'policy',
};

export const DESTINATION_TAB: Readonly<Record<JumpKind, TabType>> = {
  group: 'groups',
  user: 'users',
  app: 'apps',
  rule: 'rules',
  policy: 'policies',
};

export const KIND_ICON: Readonly<Record<JumpKind, IconType>> = {
  group: 'users',
  user: 'user',
  app: 'app',
  rule: 'bolt',
  policy: 'shield',
};

export function destinationLabel(kind: JumpKind): string {
  const tab = DESTINATION_TAB[kind];
  return TAB_DEFS.find((def) => def.id === tab)?.label ?? tab;
}

export function navigationTarget(kind: JumpKind): EntityType {
  return KIND_TO_ENTITY_TYPE[kind];
}
