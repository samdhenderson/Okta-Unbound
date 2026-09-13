import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The Users tab's Add-to-Group modal: a debounced group type-ahead over the shared " +
          'Modal. Fully controlled — `useAddToGroup` owns the query, the results, the ' +
          'open/searching flags and the selection. Confirm stays disabled until a group is ' +
          'picked, and carries its own spinner while the add is in flight.',
      },
    },
  },
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
  argTypes: {
    isOpen: { description: 'Whether the modal is open.' },
    userFirstName: {
      description:
        'First name of the user being added; the title falls back to "User" when absent.',
    },
    groupSearchQuery: { description: 'Controlled group type-ahead query.' },
    onGroupSearchQueryChange: {
      description: 'Called with the new query string on each keystroke.',
    },
    groupSearchResults: { description: 'Current group search results shown in the dropdown.' },
    isSearchingGroups: {
      description: 'True while a debounced group search is in flight (shows the inline spinner).',
    },
    showGroupDropdown: { description: 'Whether the results dropdown should be shown.' },
    selectedGroup: { description: 'The chosen group, or null when none is selected yet.' },
    onSelectGroup: { description: 'Choose a group from the dropdown.' },
    onClearSelectedGroup: {
      description: 'Clear the chosen group (the selected-group clear affordance).',
    },
    isAddingToGroup: {
      description: 'True while the add request is in flight (drives the confirm button spinner).',
    },
    onClose: { description: 'Close the modal (Cancel, Escape, overlay click, or header close).' },
    onConfirm: { description: 'Confirm the add of the selected group.' },
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

export const Interactive: Story = {
  render: function InteractiveAddToGroup(args) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<GroupSearchResult | null>(null);
    const results = query
      ? groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))
      : [];

    return (
      <AddToGroupModal
        {...args}
        groupSearchQuery={query}
        onGroupSearchQueryChange={setQuery}
        groupSearchResults={results}
        showGroupDropdown={results.length > 0}
        selectedGroup={selected}
        onSelectGroup={(group) => {
          setSelected(group);
          setQuery('');
        }}
        onClearSelectedGroup={() => setSelected(null)}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const confirm = canvas.getByRole('button', { name: 'Add to Group' });
    await expect(confirm).toBeDisabled();

    await userEvent.type(canvas.getByRole('textbox'), 'Engineering');
    await userEvent.click(await canvas.findByText('Engineering'));

    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};
