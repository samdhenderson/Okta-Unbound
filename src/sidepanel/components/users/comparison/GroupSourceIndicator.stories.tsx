import type { Meta, StoryObj } from '@storybook/react-vite';
import GroupSourceIndicator from './GroupSourceIndicator';
import type { GroupMembership, MembershipRule } from '../../../../shared/types';

const rule = (id: string, name: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression: 'user.userType == "Contractor"',
  groupIds: ['00gFAKEgroup0001'],
  userAttributes: ['userType'],
});

const membership = (over: Partial<GroupMembership> = {}): GroupMembership => ({
  group: { id: '00gFAKEgroup0001', type: 'OKTA_GROUP', profile: { name: 'VPN Access' } },
  membershipType: 'RULE_BASED',
  rules: [rule('0prFAKErule00001', 'Contractors → VPN Access')],
  attribution: 'exact',
  ...over,
});

const meta = {
  title: 'Users/Comparison/GroupSourceIndicator',
  component: GroupSourceIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The per-row detail on a group diff row: how the membership was granted, and how far ' +
          'that may be trusted. A chip is an answer the classifier proved (`Added by Rule: …`, ' +
          '`Added directly`, `Managed by app`); muted italic text is anything a reader must not ' +
          'act on as proven — a deduction, or a classification that never happened.\n\n' +
          'It never credits one rule when the attribution is `ambiguous` (the list is a candidate ' +
          'set), never collapses several attributed rules into one, and never renders an ' +
          '`UNKNOWN` or absent membership as a manual add.',
      },
    },
  },
  args: { membership: membership() },
  argTypes: {
    membership: {
      description:
        'The membership behind the row, carried whole on `DiffItem.membership`. Omitted (app rows, hand-built fixtures) renders nothing at all — never a manual add.',
    },
  },
} satisfies Meta<typeof GroupSourceIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExactSingleRule: Story = { args: { membership: membership() } };

export const ExactMultipleRules: Story = {
  args: {
    membership: membership({
      rules: [
        rule('0prFAKErule00001', 'Contractors → VPN'),
        rule('0prFAKErule00002', 'EMEA → VPN'),
      ],
    }),
  },
};

export const Inferred: Story = {
  args: { membership: membership({ attribution: 'inferred' }) },
};

export const AmbiguousCandidates: Story = {
  args: {
    membership: membership({
      attribution: 'ambiguous',
      rules: [rule('0prFAKErule00002', 'Legacy A'), rule('0prFAKErule00003', 'Legacy B')],
    }),
  },
};

export const Direct: Story = {
  args: { membership: membership({ membershipType: 'DIRECT', rules: [] }) },
};

export const Unknown: Story = {
  args: {
    membership: membership({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' }),
  },
};

export const AppManaged: Story = {
  args: {
    membership: membership({
      group: {
        id: '00gFAKEgroup0002',
        type: 'APP_GROUP',
        profile: { name: 'Salesforce Users' },
      },
      rules: [],
    }),
  },
};

export const NoMembership: Story = { args: { membership: undefined } };

export const LongRuleName: Story = {
  render: (args) => (
    <div className="flex w-64 min-w-0 items-center gap-2 border border-neutral-200 p-2">
      <span className="truncate text-sm text-neutral-800">VPN Access</span>
      <GroupSourceIndicator {...args} />
    </div>
  ),
  args: {
    membership: membership({
      rules: [
        rule(
          '0prFAKErule00009',
          'All EMEA contractors with a manager in Finance, excluding interns and seasonal staff, provisioned from Workday',
        ),
      ],
    }),
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <GroupSourceIndicator membership={membership()} />
      <GroupSourceIndicator membership={membership({ attribution: 'inferred' })} />
      <GroupSourceIndicator
        membership={membership({
          attribution: 'ambiguous',
          rules: [rule('0prFAKErule00002', 'Legacy A'), rule('0prFAKErule00003', 'Legacy B')],
        })}
      />
      <GroupSourceIndicator membership={membership({ membershipType: 'DIRECT', rules: [] })} />
      <GroupSourceIndicator
        membership={membership({ membershipType: 'UNKNOWN', rules: [], attribution: 'ambiguous' })}
      />
      <GroupSourceIndicator membership={undefined} />
    </div>
  ),
};
