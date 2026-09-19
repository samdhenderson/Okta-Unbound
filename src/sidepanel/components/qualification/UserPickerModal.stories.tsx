import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import UserPickerModal from './UserPickerModal';
import type { OktaUser } from '../../../shared/types';
import type { UseUserPickerReturn } from '../../hooks/useUserPicker';

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

const results = [makeUser('00uFAKE1', 'Ada', 'Lovelace'), makeUser('00uFAKE2', 'Grace', 'Hopper')];

const picker = (over: Partial<UseUserPickerReturn> = {}): UseUserPickerReturn => ({
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
  title: 'Qualification/UserPickerModal',
  component: UserPickerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pick one user by type-ahead and hand them back. Selecting a row is the whole action — no confirm, no selected chip. The row is never evaluated: the caller loads the whole user afterwards.',
      },
    },
  },
  args: {
    title: 'Evaluate user',
    hint: 'Reads the user and their groups — two requests, writes nothing.',
  },
} satisfies Meta<typeof UserPickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { picker: picker() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', { name: 'Evaluate user' })).toBeInTheDocument();
  },
};

export const Searching: Story = {
  args: { picker: picker({ query: 'ada', isSearching: true }) },
};

export const WithResults: Story = {
  args: { picker: picker({ query: 'a', results }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('Grace Hopper')).toBeInTheDocument();
  },
};

export const SearchFailed: Story = {
  args: { picker: picker({ query: 'ada', searchError: 'User search failed.' }) },
};
