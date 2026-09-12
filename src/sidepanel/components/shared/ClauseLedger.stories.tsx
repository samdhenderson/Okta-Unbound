import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ClauseLedger from './ClauseLedger';
import { NavigationProvider } from '../../contexts/NavigationContext';
import type { OktaUser } from '../../../shared/types';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';

const user: OktaUser = {
  id: '00uFAKELEDGER1',
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Intern',
    projectCode: null,
  },
};

const groups: RuleGroupContext = [
  { id: '00gFAKELEDGER1', name: 'Engineering' },
  { id: '00gFAKELEDGER2', name: 'SecOps-Contractors' },
];

function nested(levels: number): string {
  const leaf = 'user.department == "Engineering"';
  if (levels === 0) return leaf;
  return `${leaf} ${levels % 2 === 0 ? '&&' : '||'} (${nested(levels - 1)})`;
}

function flatOr(count: number): string {
  return Array.from({ length: count }, (_, i) => `user.department == "Team ${i}"`).join(' || ');
}

const meta = {
  title: 'Shared/ClauseLedger',
  component: ClauseLedger,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Explains a rule condition against one user as a **tree** — the `&&`/`||` structure a tenant actually wrote, rather than a flattened row-per-clause list. It replaced `groups/detail/ClauseChecklist`, which no longer exists; `users/MembershipRuleEvidence` is its production adopter.\n\n' +
          'A `not-evaluated` clause is never dressed up as a failure, and a connective whose outcome is already decided by some children states so in one sentence — "one alternative passes, so the OR passes" — sourced entirely from structured fields, never by re-reading rendered text.\n\n' +
          'A "Raw expression" toggle switches to the tenant\'s own EL text, whose footer states `true`/`false` or, for an unevaluable condition, the reason instead of a value it never rounds "cannot tell" down to `false`.\n\n' +
          '**Related internals:** [Shared](?path=/docs/internals-shared--docs)',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: fn() }}>
        <Story />
      </NavigationProvider>
    ),
  ],
  argTypes: {
    expression: { description: "The rule's condition expression (untrusted Okta rule text)." },
    user: { description: 'The user the condition is explained against.' },
    groupContext: {
      description:
        'The user\'s **complete** group list. Omit rather than passing a subset — a partial list is read as a confident "not a member" for every group it leaves out.',
    },
    maxClauses: { description: "Cap on tree leaves; defaults to the explainer's own default." },
    resolveGroupName: { description: 'Names group ids the `groupContext` cannot. Never fetches.' },
    defaultShowRaw: {
      description: 'Initial state of the raw/tree toggle. Defaults to the tree view.',
    },
  },
  args: { expression: 'user.department == "Engineering"', user },
} satisfies Meta<typeof ClauseLedger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MatchWithKleeneNote: Story = {
  args: {
    expression: 'user.department == "Engineering" || isMemberOfGroupNameRegex("(?=.*Ops).*")',
    groupContext: groups,
  },
};

export const NoMatchNonMemberPolarity: Story = {
  args: {
    expression: '!isMemberOfAnyGroup("00gFAKELEDGER2")',
    groupContext: groups,
  },
};

export const Unevaluable: Story = {
  args: { expression: 'user.department ==' },
};

export const TruncatedDeepNesting: Story = {
  args: { expression: nested(10), maxClauses: 256 },
};

export const TruncatedClauseCap: Story = {
  args: { expression: flatOr(70) },
};

export const RawViewOpen: Story = {
  args: { defaultShowRaw: true },
};

export const NoGroupContext: Story = {
  args: { expression: 'isMemberOfAnyGroup("00gFAKELEDGER1")' },
};

export const CompactPanel: Story = {
  args: {
    expression:
      'user.department == "Engineering" && (isMemberOfAnyGroup("00gFAKELEDGER1") || user.title != "Intern")',
    groupContext: groups,
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
