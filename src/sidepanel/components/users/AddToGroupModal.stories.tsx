import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AddToGroupModal from './AddToGroupModal';
import type { GroupSearchResult } from '../../hooks/useAddToGroup';

const groups: GroupSearchResult[] = [
  { id: 'g1', name: 'Engineering', description: 'Eng team', type: 'OKTA_GROUP' },
  { id: 'g2', name: 'Design', description: 'Product design', type: 'OKTA_GROUP' },
  { id: 'g3', name: 'Salesforce', description: 'App-assigned', type: 'APP_GROUP' },
];

const meta = {
  title: 'Users/AddToGroupModal',
  component: AddToGroupModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    isOpen: true,
    userFirstName: 'Ada',
    groupSearchQuery: '',
    onGroupSearchQueryChange: fn(),
    groupSearchResults: [],
    isSearchingGroups: false,
    showGroupDropdown: false,
    selectedGroup: null,
    onSelectGroup: fn(),
    onClearSelectedGroup: fn(),
    isAddingToGroup: false,
    onClose: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof AddToGroupModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithResults: Story = {
  args: {
    groupSearchQuery: 'e',
    groupSearchResults: groups,
    showGroupDropdown: true,
  },
};

export const Searching: Story = {
  args: {
    groupSearchQuery: 'eng',
    isSearchingGroups: true,
  },
};

export const GroupSelected: Story = {
  args: {
    selectedGroup: groups[0],
  },
};

export const Adding: Story = {
  args: {
    selectedGroup: groups[0],
    isAddingToGroup: true,
  },
};
