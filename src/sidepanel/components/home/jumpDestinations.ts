import type { JumpKind, JumpResult } from '../../hooks/useJumpResolver';
import type { OktaAdminTarget } from '../../../shared/utils/oktaUrl';
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

export function oktaAdminTargetFor(result: JumpResult): OktaAdminTarget | null {
  switch (result.kind) {
    case 'group':
      return { type: 'group', id: result.id };
    case 'user':
      return { type: 'user', id: result.id };
    case 'app':
      return { type: 'app', id: result.id, name: result.appName };
    case 'rule':
    case 'policy':
      return null;
  }
}
