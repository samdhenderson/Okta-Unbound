import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ComparisonDiffTab from './ComparisonDiffTab';
import GroupSourceIndicator from './GroupSourceIndicator';
import AppScopeIndicator from './AppScopeIndicator';
import Button from '../../shared/Button';
import type { ParityRow } from './comparisonAnalytics';
import type { GroupMembership, MembershipRule } from '../../../../shared/types';

const rule = (id: string, name: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression: 'user.userType == "Contractor"',
  groupIds: ['00gFAKEgroup0001'],
  userAttributes: ['userType'],
});

const membership = (
  id: string,
  name: string,
  over: Partial<GroupMembership> = {},
): GroupMembership => ({
  group: { id, type: 'OKTA_GROUP', profile: { name } },
  membershipType: 'RULE_BASED',
  rules: [rule('0prFAKErule00001', 'Contractors → VPN Access')],
  attribution: 'exact',
  ...over,
});

const groupRow = (
  id: string,
  name: string,
  inContext: boolean,
  inCompared: boolean,
  over: Partial<GroupMembership> = {},
): ParityRow => ({
  id,
  label: name,
  inContext,
  inCompared,
  membership: membership(id, name, over),
});

const GROUP_ROWS: ParityRow[] = [
  groupRow('00gFAKEgroup0001', 'us.employees.union', false, true),
  groupRow('00gFAKEgroup0002', 'okta.admins', false, true, {
    group: { id: '00gFAKEgroup0002', type: 'APP_GROUP', profile: { name: 'okta.admins' } },
    membershipType: 'DIRECT',
    rules: [],
  }),
  groupRow('00gFAKEgroup0003', 'emea.contractors', true, false, {
    membershipType: 'DIRECT',
    rules: [],
  }),
  groupRow('00gFAKEgroup0004', 'build.engineers', true, true),
  groupRow('00gFAKEgroup0005', 'all.employees', true, true),
];

const APP_ROWS: ParityRow[] = [
  { id: 'app1', label: 'Salesforce', inContext: false, inCompared: true },
  { id: 'app2', label: 'Figma', inContext: true, inCompared: false },
  { id: 'app3', label: 'Slack', inContext: true, inCompared: true },
];

const meta = {
  title: 'Users/Comparison/ComparisonDiffTab',
  component: ComparisonDiffTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One list where **every row states the comparison**: the context user on the left, the compared user on the right, and an equality marker between them. Every cell names its user in every state, and an Add button says `Add <recipient>` — the recipient being whichever side the button sits on.\n\n' +
          'The middle cell borrows the button silhouette but is inert: `role="img"` with a label, and `=`/`≠` are different glyphs so the state never depends on colour. A side that lacks the item and cannot be given it renders a stated non-answer rather than a button that would fail.',
      },
    },
  },
  args: {
    contextName: 'Sam',
    comparedName: 'Jordan',
    noun: 'group',
    emptyText: 'Neither user is in any groups.',
    rows: GROUP_ROWS,
  },
} satisfies Meta<typeof ComparisonDiffTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Groups: Story = {
  args: {
    renderContextAction: (row, recipientName) =>
      row.membership?.group.type === 'APP_GROUP' ? null : (
        <Button size="sm" variant="primary" icon="plus" fullWidth onClick={fn()}>
          Add {recipientName}
        </Button>
      ),
    renderComparedAction: (_row, recipientName) => (
      <Button size="sm" variant="primary" icon="plus" fullWidth onClick={fn()}>
        Add {recipientName}
      </Button>
    ),
    renderMeta: (row) =>
      row.inContext && row.inCompared ? null : <GroupSourceIndicator membership={row.membership} />,
  },
};

export const CopyInFlight: Story = {
  args: {
    renderContextAction: (row, recipientName) =>
      row.membership?.group.type === 'APP_GROUP' ? null : (
        <Button
          size="sm"
          variant="primary"
          icon="plus"
          fullWidth
          loading={row.id === '00gFAKEgroup0001'}
          disabled
          onClick={fn()}
        >
          Add {recipientName}
        </Button>
      ),
    renderComparedAction: (_row, recipientName) => (
      <Button size="sm" variant="primary" icon="plus" fullWidth disabled onClick={fn()}>
        Add {recipientName}
      </Button>
    ),
  },
};

export const ReadOnly: Story = {};

export const Apps: Story = {
  args: {
    noun: 'app',
    emptyText: 'Neither user is assigned any apps.',
    rows: APP_ROWS,
    renderMeta: (row) =>
      row.inContext && row.inCompared ? (
        <AppScopeIndicator state="notCompared" />
      ) : (
        <AppScopeIndicator state={row.inCompared ? 'USER' : 'GROUP'} />
      ),
  },
};

export const AllRowShapes: Story = {
  args: {
    renderContextAction: (row, recipientName) =>
      row.membership?.group.type === 'APP_GROUP' ? null : (
        <Button size="sm" variant="primary" icon="plus" fullWidth onClick={fn()}>
          Add {recipientName}
        </Button>
      ),
    renderComparedAction: (_row, recipientName) => (
      <Button size="sm" variant="primary" icon="plus" fullWidth onClick={fn()}>
        Add {recipientName}
      </Button>
    ),
    renderMeta: (row) =>
      row.inContext && row.inCompared ? null : <GroupSourceIndicator membership={row.membership} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('all.employees')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /^All/ }));
    await waitFor(() => expect(canvas.getByText('all.employees')).toBeInTheDocument());
    await expect(canvas.getByText('us.employees.union')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { rows: [] },
};

export const LongList: Story = {
  args: {
    rows: [
      ...GROUP_ROWS,
      ...Array.from({ length: 24 }, (_, i) =>
        groupRow(`00gFAKEbulk${i}`, `bulk.group.${String(i).padStart(2, '0')}`, true, true),
      ),
    ],
    renderContextAction: (_row, recipientName) => (
      <Button size="sm" variant="primary" icon="plus" fullWidth onClick={fn()}>
        Add {recipientName}
      </Button>
    ),
  },
};
