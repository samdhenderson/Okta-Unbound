import type { IconType } from './Icon';
import type { EntityType } from '../../contexts/NavigationContext';
import type { NounForms } from '../../../shared/utils/plural';

export const typeIcon: Record<EntityType, IconType> = {
  rule: 'bolt',
  group: 'users',
  user: 'user',
  app: 'app',
  policy: 'shield',
};

export const typeNoun: Record<EntityType, string> = {
  rule: 'rule',
  group: 'group',
  user: 'user',
  app: 'app',
  policy: 'policy',
};

export const capitalisedNoun = (type: EntityType): string =>
  typeNoun[type].charAt(0).toUpperCase() + typeNoun[type].slice(1);

export const typeNounForms: Record<EntityType, NounForms> = {
  rule: { one: 'rule', other: 'rules' },
  group: { one: 'group', other: 'groups' },
  user: { one: 'user', other: 'users' },
  app: { one: 'app', other: 'apps' },
  policy: { one: 'policy', other: 'policies' },
};
