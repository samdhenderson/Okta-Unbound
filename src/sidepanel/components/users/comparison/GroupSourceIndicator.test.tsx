import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupSourceIndicator from './GroupSourceIndicator';
import GroupMembershipsList from '../GroupMembershipsList';
import type { GroupMembership, MembershipRule } from '../../../../shared/types';

const rule = (id: string, name: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression: 'user.userType == "Contractor"',
});

const membership = (over: Partial<GroupMembership> = {}): GroupMembership => ({
  group: { id: '00gFAKEgroup0001', type: 'OKTA_GROUP', profile: { name: 'VPN Access' } },
  membershipType: 'RULE_BASED',
  rules: [rule('0prFAKErule00001', 'Contractors → VPN Access')],
  attribution: 'exact',
  ...over,
});

const marker = (over?: Partial<GroupMembership>): HTMLElement | null => {
  const { container } = render(
    <GroupSourceIndicator membership={over === undefined ? undefined : membership(over)} />,
  );
  const el = container.firstElementChild;
  return el instanceof HTMLElement ? el : null;
};

const shown = (over: Partial<GroupMembership>): HTMLElement => {
  const el = marker(over);
  if (!el) throw new Error('nothing rendered');
  return el;
};

const wording = (el: HTMLElement): string => `${el.textContent ?? ''} ${el.title}`;

describe('GroupSourceIndicator — attribution captions', () => {
  it('names the rule outright for a proven (`exact`) attribution', () => {
    expect(shown({})).toHaveTextContent(/^Added by Rule: Contractors → VPN Access$/);
  });

  it('gives the same single rule its own caption for an `inferred` attribution', () => {
    const el = shown({ attribution: 'inferred' });

    expect(el).toHaveTextContent(/^Added by rule: Contractors → VPN Access$/);
    expect(wording(el)).toMatch(/Not every rule condition could be evaluated/i);
  });

  it('does not tell an `exact` reader that anything went unevaluated', () => {
    expect(wording(shown({}))).not.toMatch(/Not every rule condition could be evaluated/i);
    expect(wording(shown({}))).toMatch(/provably matches this user/i);
  });

  it('gives the rule its own caption for an `ambiguous` attribution', () => {
    const el = shown({ attribution: 'ambiguous' });

    expect(el).toHaveTextContent(/^Rule: Contractors → VPN Access$/);
    expect(wording(el)).toMatch(/candidate rather than the answer/i);
  });

  it('gives each attribution its own caption, so none reads as another', () => {
    const captions = (['exact', 'inferred', 'ambiguous'] as const).map(
      (attribution) => shown({ attribution }).textContent,
    );
    expect(new Set(captions).size).toBe(3);
  });

  it('renders a proven attribution as a chip and a deduced one as muted italic text', () => {
    expect(shown({}).className).toContain('bg-neutral-100');

    for (const attribution of ['inferred', 'ambiguous'] as const) {
      const { className } = shown({ attribution });
      expect(className).toContain('italic');
      expect(className).not.toContain('bg-neutral-100');
    }
  });

  it('styles no state as a problem — a rule-granted membership is not an error', () => {
    for (const attribution of ['exact', 'inferred', 'ambiguous'] as const) {
      expect(shown({ attribution }).className).not.toMatch(/danger|warning/);
    }
  });
});

describe('GroupSourceIndicator — a candidate set is never one confident rule', () => {
  const candidates = {
    attribution: 'ambiguous' as const,
    rules: [rule('0prFAKErule00002', 'Legacy A'), rule('0prFAKErule00003', 'Legacy B')],
  };

  it('lists every candidate rather than crediting the first one', () => {
    const el = shown(candidates);

    expect(el).toHaveTextContent('Legacy A');
    expect(el).toHaveTextContent('Legacy B');
    expect(el.textContent).not.toMatch(/^Added by Rule:/);
  });

  it('says how many candidates there are, and that they are unresolved', () => {
    expect(shown(candidates)).toHaveTextContent('(2 candidates, unresolved)');
  });

  it('explains in its description that nothing is credited', () => {
    expect(wording(shown(candidates))).toMatch(/candidate rather than the answer/i);
  });

  it('never presents an ambiguous row with the wording of a proven one', () => {
    const text = wording(shown(candidates));
    expect(text).not.toMatch(/provably/i);
    expect(text).not.toMatch(/^Added by/);
  });
});

describe('GroupSourceIndicator — several rules are never collapsed into one', () => {
  const two = [
    rule('0prFAKErule00001', 'Contractors → VPN'),
    rule('0prFAKErule00002', 'EMEA → VPN'),
  ];

  it('names both attributed rules and counts them', () => {
    expect(shown({ rules: two })).toHaveTextContent(
      /^Added by Rule: Contractors → VPN, EMEA → VPN \(2 rules\)$/,
    );
  });

  it('adds no count when exactly one rule is attributed', () => {
    expect(shown({}).textContent).not.toMatch(/\(\d+ rule/);
  });
});

describe('GroupSourceIndicator — the three ways of not having a rule', () => {
  it('renders nothing at all when there is no membership', () => {
    expect(marker(undefined)).toBeNull();
  });

  it('calls a DIRECT membership a manual add', () => {
    const el = shown({ membershipType: 'DIRECT', rules: [] });
    expect(el).toHaveTextContent(/^Added directly$/);
    expect(el.className).toContain('bg-neutral-100');
  });

  it('does not present an UNKNOWN membership as a manual add', () => {
    const el = shown({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' });

    expect(el).toHaveTextContent(/^Source not determined$/);
    expect(el.textContent).not.toMatch(/directly/i);
    expect(el.textContent).not.toMatch(/rule/i);
    expect(wording(el)).toMatch(/the answer is missing/i);
  });

  it('gives DIRECT, UNKNOWN and absent three different renderings', () => {
    const direct = shown({ membershipType: 'DIRECT', rules: [] }).textContent;
    const unknown = shown({
      membershipType: 'UNKNOWN',
      rules: [],
      attribution: 'ambiguous',
    }).textContent;

    expect(direct).not.toBe(unknown);
    expect(marker(undefined)).toBeNull();
  });

  it('discloses on hover that a deduced DIRECT was not fully evaluated', () => {
    const deduced = shown({ membershipType: 'DIRECT', rules: [], attribution: 'inferred' });
    const proven = shown({ membershipType: 'DIRECT', rules: [] });

    expect(deduced).toHaveTextContent(/^Added directly$/);
    expect(proven).toHaveTextContent(/^Added directly$/);

    expect(wording(deduced)).toMatch(/not every rule condition could be evaluated/i);
    expect(wording(proven)).not.toMatch(/not every rule condition could be evaluated/i);
  });

  it('names an APP_GROUP as application-managed rather than as a nameless rule', () => {
    expect(
      shown({
        group: { id: '00gFAKEgroup0002', type: 'APP_GROUP', profile: { name: 'Salesforce Users' } },
        rules: [],
      }),
    ).toHaveTextContent(/^Managed by app$/);
  });

  it('says so when a rule-based membership carries no rule to name', () => {
    const el = shown({ rules: [] });
    expect(el).toHaveTextContent(/^Rule-managed, rule not identified$/);
    expect(el.className).toContain('italic');
  });
});

describe('GroupSourceIndicator — untrusted names', () => {
  const longName =
    'All EMEA contractors with a manager in Finance, excluding interns and seasonal staff, provisioned from Workday';

  it('truncates a hostile-length rule name instead of overflowing the row', () => {
    const el = shown({ rules: [rule('0prFAKErule00009', longName)] });

    expect(el.className).toContain('truncate');
    expect(el.className).toContain('min-w-0');
    expect(el.title).toContain(longName);
  });

  it('renders a rule name as text, never as markup', () => {
    const el = shown({ rules: [rule('0prFAKErule00010', '<img src=x onerror="alert(1)">')] });

    expect(el.querySelector('img')).toBeNull();
    expect(el).toHaveTextContent('<img src=x onerror="alert(1)">');
  });
});

describe('GroupSourceIndicator — caption parity with GroupMembershipsList', () => {
  const captionOn = (attribution: GroupMembership['attribution']): string => {
    const { unmount } = render(
      <GroupMembershipsList memberships={[membership({ attribution })]} isLoading={false} />,
    );
    const caption = ['Added by Rule:', 'Added by rule:', 'Rule:'].find(
      (text) => screen.queryByText(text) !== null,
    );
    unmount();
    if (!caption) throw new Error(`no caption rendered for "${attribution}"`);
    return caption;
  };

  it.each(['exact', 'inferred', 'ambiguous'] as const)(
    'introduces a %s attribution with the same phrase the memberships list uses',
    (attribution) => {
      expect(shown({ attribution }).textContent).toContain(captionOn(attribution));
    },
  );
});
