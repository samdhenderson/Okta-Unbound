import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupPickerModal from './GroupPickerModal';
import type { GroupSearchResult } from '../../hooks/useAddToGroup';
import type { UseGroupPickerReturn } from '../../hooks/useGroupPicker';

const results: GroupSearchResult[] = [
  { id: '00gFAKE1', name: 'Engineering', description: '', type: 'OKTA_GROUP' },
  { id: '00gFAKE2', name: 'Engineering Leads', description: '', type: 'OKTA_GROUP' },
];

const picker = (over: Partial<UseGroupPickerReturn> = {}): UseGroupPickerReturn => ({
  isOpen: true,
  open: fn(),
  close: fn(),
  query: '',
  setQuery: fn(),
  results: [],
  isSearching: false,
  searchError: null,
  pick: fn(),
  ...over,
});

const meta = {
  title: 'Qualification/GroupPickerModal',
  component: GroupPickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pick one group by type-ahead and hand it back. Nothing is filtered out: a group the user already holds is a real answer to "why isn\'t this user a member?".',
      },
    },
  },
  args: {
    title: 'Check membership',
    hint: 'Pick a group; every rule feeding it is assessed against this user.',
  },
} satisfies Meta<typeof GroupPickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { picker: picker() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', { name: 'Check membership' })).toBeInTheDocument();
  },
};

export const WithResults: Story = {
  args: { picker: picker({ query: 'eng', results }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('Engineering Leads')).toBeInTheDocument();
  },
};

export const SearchFailed: Story = {
  args: { picker: picker({ query: 'eng', searchError: 'Group search failed.' }) },
};
