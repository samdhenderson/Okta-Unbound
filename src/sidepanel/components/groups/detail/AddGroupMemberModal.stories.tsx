import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AddGroupMemberModal from './AddGroupMemberModal';
import type { OktaUser } from '../../../../shared/types';

function makeUser(id: string, firstName: string, lastName: string): OktaUser {
  return {
    id,
    status: 'ACTIVE',
    profile: {
      login: `${firstName.toLowerCase()}@example.com`,
      email: `${firstName.toLowerCase()}@example.com`,
      firstName,
      lastName,
    },
  };
}

const users: OktaUser[] = [
  makeUser('00uFAKE1', 'Ada', 'Lovelace'),
  makeUser('00uFAKE2', 'Grace', 'Hopper'),
  makeUser('00uFAKE3', 'Katherine', 'Johnson'),
];

const meta = {
  title: 'Groups/AddGroupMemberModal',
  component: AddGroupMemberModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The Group Detail view's Add-member modal: a debounced user type-ahead over the shared Modal — the group-side mirror of the Users tab's AddToGroupModal.\n\n" +
          "Fully controlled: the parent (via useAddGroupMember) owns the query, the debounced results (with the group's current roster already excluded), the open/searching flags, and the selected user. Renders the type-ahead dropdown, an inline search spinner, the chosen-user chip, and a confirm button that stays disabled until a user is picked and shows its own spinner while the add is in flight.\n\n" +
          '**Related internals:** [Hooks](?path=/docs/internals-hooks--docs), [Scheduler & messaging](?path=/docs/internals-scheduler-messaging--docs)',
      },
    },
  },
  args: {
    isOpen: true,
    groupName: 'Engineering',
    addQuery: '',
    onAddQueryChange: fn(),
    addResults: [],
    isSearchingToAdd: false,
    addSearchError: null,
    selectedUser: null,
    onSelectUser: fn(),
    onClearSelectedUser: fn(),
    isAddingMember: false,
    onClose: fn(),
    onConfirm: fn(),
    addMemberError: null,
  },
  argTypes: {
    isOpen: { description: 'Whether the modal is open.' },
    groupName: {
      description:
        'Name of the group members are being added to; the title falls back to "Group" when absent.',
    },
    addQuery: { description: 'Controlled user type-ahead query.' },
    onAddQueryChange: {
      description: 'Called with the new query string on each keystroke.',
    },
    addResults: {
      description:
        'Current user search results shown in the dropdown, with existing members already excluded.',
    },
    isSearchingToAdd: {
      description: 'True while a debounced user search is in flight (shows the inline spinner).',
    },
    addSearchError: { description: 'Error message from the debounced search, if any.' },
    selectedUser: { description: 'The chosen user, or null when none is selected yet.' },
    onSelectUser: { description: 'Choose a user from the dropdown.' },
    onClearSelectedUser: {
      description: 'Clear the chosen user (the selected-user "Clear" button).',
    },
    isAddingMember: {
      description: 'True while the add request is in flight (drives the confirm button spinner).',
    },
    onClose: { description: 'Close the modal (Cancel, Escape, overlay click, or header close).' },
    onConfirm: { description: 'Confirm the add of the selected user.' },
    addMemberError: {
      description: 'Error from a failed add attempt (the mutation, not the search).',
    },
  },
} satisfies Meta<typeof AddGroupMemberModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithResults: Story = {
  args: {
    addQuery: 'a',
    addResults: users,
  },
};

export const Searching: Story = {
  args: {
    addQuery: 'ada',
    isSearchingToAdd: true,
  },
};

export const UserSelected: Story = {
  args: {
    selectedUser: users[0],
  },
};

export const Adding: Story = {
  args: {
    selectedUser: users[0],
    isAddingMember: true,
  },
};

export const SearchError: Story = {
  args: {
    addQuery: 'ada',
    addSearchError: 'Failed to search users. Please try again.',
  },
};

export const AddError: Story = {
  args: {
    selectedUser: users[0],
    addMemberError: 'Failed to add member.',
  },
};
