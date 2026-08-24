import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import GroupMembersSection from './GroupMembersSection';
import type { OktaUser } from '../../../../shared/types';

const makeUser = (id: string, firstName: string, lastName: string): OktaUser => ({
  id,
  status: 'ACTIVE',
  profile: {
    login: `${firstName.toLowerCase()}@example.com`,
    email: `${firstName.toLowerCase()}@example.com`,
    firstName,
    lastName,
  },
});

const members: OktaUser[] = [
  makeUser('00uFAKE1', 'Ada', 'Lovelace'),
  makeUser('00uFAKE2', 'Grace', 'Hopper'),
  makeUser('00uFAKE3', 'Katherine', 'Johnson'),
];

const meta = {
  title: 'Groups/GroupMembersSection',
  component: GroupMembersSection,
  tags: ['autodocs'],
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          "The Group Detail view's roster: displays members and, per row, a confirm-gated remove.\n\n" +
          'It piggybacks on the same gated read `GroupMembershipSourceSection` already offers — the roster ' +
          'here is the exact list the member-source analysis fetches, so this section costs nothing beyond ' +
          'that one opt-in paginated read. Before that analysis has run it shows a gated prompt, never an ' +
          'empty list: an empty list would read as "this group has no members," a different fact.\n\n' +
          "Adding a member lives in the action bar's Add-member modal, not here — see `AddGroupMemberModal`.\n\n" +
          '`APP_GROUP` and `BUILT_IN` groups reject membership writes at the Okta API, so the per-row remove ' +
          'control is hidden entirely and replaced with a one-line explanation — see `AppGroupReadOnly` ' +
          'and `BuiltInReadOnly` below.',
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

export const Default: Story = {};

export const Loading: Story = { args: { status: 'loading' } };

export const ErrorState: Story = {
  args: { status: 'error', error: 'Members could not be read.' },
};

export const Empty: Story = { args: { memberCount: 0 } };

export const Loaded: Story = { args: { status: 'done', members } };

export const RemoveConfirm: Story = {
  args: { status: 'done', members, removeTarget: members[0] },
};

export const AppGroupReadOnly: Story = {
  args: { groupType: 'APP_GROUP', status: 'done', members },
};

export const BuiltInReadOnly: Story = {
  args: { groupType: 'BUILT_IN', status: 'done', members },
};
