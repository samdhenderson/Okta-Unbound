import type { Meta, StoryObj } from '@storybook/react-vite';
import UserIdentity from './UserIdentity';
import { mockUsers } from '../../../test/mocks/handlers';
import type { OktaUser } from '../../../shared/types';

const baseUser = mockUsers[10];

const activeUser: OktaUser = {
  ...baseUser,
  status: 'ACTIVE',
  profile: {
    ...baseUser.profile,
    title: 'Staff Engineer',
    department: 'Platform',
    genderPronouns: 'she/her',
  },
};

const minimalUser: OktaUser = {
  id: 'user-minimal',
  status: 'STAGED',
  profile: {
    login: 'newhire@example.com',
    email: 'newhire@example.com',
    firstName: 'New',
    lastName: 'Hire',
  },
};

const suspendedUser: OktaUser = mockUsers.find((u) => u.status === 'SUSPENDED') ?? baseUser;

const meta = {
  title: 'Users/UserIdentity',
  component: UserIdentity,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { user: activeUser },
} satisfies Meta<typeof UserIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MinimalProfile: Story = {
  args: { user: minimalUser },
};

export const Suspended: Story = {
  args: { user: suspendedUser },
};

export const WithoutId: Story = {
  args: { showId: false },
};

export const WithOktaLink: Story = {
  args: { oktaOrigin: 'https://example.okta.com' },
};
