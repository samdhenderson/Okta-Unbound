import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupMembersSection from './GroupMembersSection';
import type { MembershipRule, OktaUser } from '../../../../shared/types';
import {
  summarizeMemberSources,
  type GroupIdentity,
} from '../../../../shared/membership/groupSource';
import { buildMemberSourceIndex } from '../../../../shared/membership/memberSourceIndex';

const makeUser = (
  id: string,
  firstName: string,
  lastName: string,
  department?: string,
): OktaUser => ({
  id,
  status: 'ACTIVE',
  profile: {
    login: `${firstName.toLowerCase()}@example.com`,
    email: `${firstName.toLowerCase()}@example.com`,
    firstName,
    lastName,
    ...(department ? { department } : {}),
  },
});

const members: OktaUser[] = [
  makeUser('00uFAKE1', 'Ada', 'Lovelace'),
  makeUser('00uFAKE2', 'Grace', 'Hopper'),
  makeUser('00uFAKE3', 'Katherine', 'Johnson'),
];

const identity: GroupIdentity = { id: '00gFAKE1', name: 'Engineering', type: 'OKTA_GROUP' };

const rules: MembershipRule[] = [
  {
    id: '0prFAKE1',
    name: 'Engineering department',
    status: 'ACTIVE',
    conditionExpression: 'user.department == "Engineering"',
    actions: { assignUserToGroups: { groupIds: ['00gFAKE1'] } },
  },
  {
    id: '0prFAKE2',
    name: 'Platform department',
    status: 'ACTIVE',
    conditionExpression: 'user.department == "Platform"',
    actions: { assignUserToGroups: { groupIds: ['00gFAKE1'] } },
  },
];

const mixedMembers: OktaUser[] = [
  makeUser('00uFAKE1', 'Ada', 'Lovelace', 'Engineering'),
  makeUser('00uFAKE2', 'Grace', 'Hopper', 'Engineering'),
  makeUser('00uFAKE3', 'Katherine', 'Johnson', 'Engineering'),
  makeUser('00uFAKE4', 'Annie', 'Easley', 'Platform'),
  makeUser('00uFAKE5', 'Mary', 'Jackson', 'Support'),
  makeUser('00uFAKE6', 'Dorothy', 'Vaughan'),
];

const mixedBreakdown = summarizeMemberSources(identity, mixedMembers, rules);
const mixedIndex = buildMemberSourceIndex(identity, mixedMembers, rules);

const meta = {
  title: 'Groups/GroupMembersSection',
  component: GroupMembersSection,
  tags: ['autodocs'],
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "The Group Detail view's roster: who is in the group, why, and — per row — a " +
          'confirm-gated remove. Before the shared member analysis has run it shows a gated ' +
          'prompt, never an empty list: an empty list would read as "this group has no ' +
          'members," a different fact.\n\n' +
          'The roster itself is `MemberExplorer`. What stays here is the part the explorer must ' +
          'not learn: the `SourceStatus` gate, the read-only reason for an `APP_GROUP`/`BUILT_IN` ' +
          'group, and the remove confirmation. Pass `breakdown` **and** `memberSourceIndex` to ' +
          'get the membership-source meter whose segments double as filters.',
      },
    },
  },
  argTypes: {
    groupType: { description: 'Determines whether the per-row remove control renders at all.' },
    memberCount: { description: "The group's member count, used for the pre-load cost estimate." },
    members: { description: 'The roster, once the shared member analysis has populated it.' },
    status: {
      description: "Status of the shared member-source analysis ('idle'/'loading'/'done'/'error').",
    },
  },
  args: {
    groupType: 'OKTA_GROUP',
    memberCount: 3,
    members: null,
    status: 'idle',
    error: null,
    onAnalyze: fn(),
    canAnalyze: true,
    breakdown: null,
    memberSourceIndex: null,
    mfaResults: null,
    scanStatus: 'idle',
    onRunScan: fn(),
    onRequestConfirm: fn(),
    onCancelConfirm: fn(),
    removeTarget: null,
    onRequestRemove: fn(),
    onCancelRemove: fn(),
    onConfirmRemove: fn(),
    removeStatus: 'idle',
    removeError: null,
  },
} satisfies Meta<typeof GroupMembersSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Load members' }));
    await expect(args.onAnalyze).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = { args: { status: 'loading' } };

export const ErrorState: Story = {
  args: { status: 'error', error: 'Members could not be read.' },
};

export const Empty: Story = { args: { memberCount: 0 } };

export const Loaded: Story = { args: { status: 'done', members } };

export const RemoveConfirm: Story = {
  args: { status: 'done', members, removeTarget: members[0] },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByRole('dialog')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancelRemove).toHaveBeenCalledTimes(1);
  },
};

export const AppGroupReadOnly: Story = {
  args: { groupType: 'APP_GROUP', status: 'done', members },
};

export const BuiltInReadOnly: Story = {
  args: { groupType: 'BUILT_IN', status: 'done', members },
};

export const WithSourceMeter: Story = {
  args: {
    status: 'done',
    members: mixedMembers,
    memberCount: mixedMembers.length,
    breakdown: mixedBreakdown,
    memberSourceIndex: mixedIndex,
  },
};
