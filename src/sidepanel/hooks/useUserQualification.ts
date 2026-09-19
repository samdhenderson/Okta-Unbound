import { useCallback, useMemo, useState } from 'react';
import type { FormattedRule, GroupMembership, OktaUser } from '../../shared/types';
import type { RuleInventoryState } from './useUserMemberships';
import { assessGroupForUser, assessRuleForUser } from '../../shared/membership/qualification';
import type { GroupUserVerdict, RuleUserVerdict } from '../../shared/membership/qualificationTypes';
import { groupContextOf } from '../../shared/membership/groupContext';
import { targetGroupIdsOf } from '../../shared/membership/ruleExpression';
import type { GroupSearchResult } from './useAddToGroup';
import { useGroupPicker, type UseGroupPickerReturn } from './useGroupPicker';

export interface UseUserQualificationOptions {
  user: OktaUser | null;
  memberships: GroupMembership[] | undefined;
  rules: RuleInventoryState;
  targetTabId: number | null;
  enabled: boolean;
}

export type UserQualificationCheck =
  | { readonly kind: 'none' }
  | { readonly kind: 'pending'; readonly reason: 'memberships' | 'inventory' }
  | { readonly kind: 'rule'; readonly rule: FormattedRule; readonly verdict: RuleUserVerdict }
  | {
      readonly kind: 'group';
      readonly group: GroupSearchResult;
      readonly verdict: GroupUserVerdict;
    };

export interface UseUserQualificationReturn {
  rulePicker: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    rules: readonly FormattedRule[];
  };
  groupPicker: UseGroupPickerReturn;
  check: UserQualificationCheck;
  openRulePicker: (() => void) | undefined;
  openGroupPicker: (() => void) | undefined;
  pickRule: (rule: FormattedRule) => void;
  clear: () => void;
}

type Picked =
  | { readonly userId: string; readonly target: { kind: 'rule'; rule: FormattedRule } }
  | { readonly userId: string; readonly target: { kind: 'group'; group: GroupSearchResult } };

export function useUserQualification({
  user,
  memberships,
  rules,
  targetTabId,
  enabled,
}: UseUserQualificationOptions): UseUserQualificationReturn {
  const [held, setHeld] = useState<Picked | null>(null);
  const [ruleOpen, setRuleOpen] = useState(false);

  const picked = held && user && held.userId === user.id ? held : null;

  const pickRule = useCallback(
    (rule: FormattedRule) => {
      setRuleOpen(false);
      if (user) setHeld({ userId: user.id, target: { kind: 'rule', rule } });
    },
    [user],
  );

  const onPickGroup = useCallback(
    (group: GroupSearchResult) => {
      if (user) setHeld({ userId: user.id, target: { kind: 'group', group } });
    },
    [user],
  );
  const groupPicker = useGroupPicker({ targetTabId, onPick: onPickGroup, enabled });

  const clear = useCallback(() => setHeld(null), []);

  const heldNames = useMemo(
    () => new Map((memberships ?? []).map((m) => [m.group.id, m.group.profile.name] as const)),
    [memberships],
  );

  const check = useMemo<UserQualificationCheck>(() => {
    if (!picked || !user) return { kind: 'none' };
    if (memberships === undefined) return { kind: 'pending', reason: 'memberships' };
    const subject = { user, groupContext: groupContextOf(memberships) };

    if (picked.target.kind === 'rule') {
      const { rule } = picked.target;
      const names = new Map(heldNames);
      for (const [id, name] of Object.entries(rule.allGroupNamesMap ?? {})) names.set(id, name);
      return {
        kind: 'rule',
        rule,
        verdict: assessRuleForUser(rule, subject, names, rule.missingGroupIds),
      };
    }

    const { group } = picked.target;
    if (rules.status === 'unresolved') return { kind: 'pending', reason: 'inventory' };
    const feedingRules =
      rules.status === 'available'
        ? rules.rules.filter((rule) => targetGroupIdsOf(rule).includes(group.id))
        : null;
    const names = new Map(heldNames);
    names.set(group.id, group.name);
    return {
      kind: 'group',
      group,
      verdict: assessGroupForUser({
        group: { id: group.id, type: group.type },
        feedingRules,
        subject,
        groupNames: names,
      }),
    };
  }, [picked, user, memberships, rules, heldNames]);

  const openRule = useCallback(() => setRuleOpen(true), []);
  const closeRule = useCallback(() => setRuleOpen(false), []);

  return {
    rulePicker: {
      isOpen: ruleOpen,
      open: openRule,
      close: closeRule,
      rules: rules.status === 'available' ? rules.rules : [],
    },
    groupPicker,
    check,
    openRulePicker: user && rules.status === 'available' ? openRule : undefined,
    openGroupPicker: user && targetTabId !== null ? groupPicker.open : undefined,
    pickRule,
    clear,
  };
}
