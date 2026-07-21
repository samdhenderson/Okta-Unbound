import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { z } from 'zod';
import EntityPicker from './EntityPicker';
import type { EntityExport } from '../../export/types';

const descriptors: EntityExport[] = [
  {
    id: 'users',
    displayName: 'Users',
    icon: 'user',
    description: 'All users in the org with identity and profile attributes.',
    context: { kind: 'whole-org' },
    endpoint: '/api/v1/users',
    defaultQuery: {},
    schema: z.unknown(),
    columnCatalog: [],
    filter: { kind: 'none' },
  },
  {
    id: 'group-memberships',
    displayName: 'Group Memberships',
    icon: 'users',
    description: 'Members of a specific group you choose.',
    context: {
      kind: 'search-to-select',
      label: 'Group',
      placeholder: 'Search groups…',
      endpoint: (id) => `/api/v1/groups/${id}/users`,
    },
    defaultQuery: {},
    schema: z.unknown(),
    columnCatalog: [],
    filter: { kind: 'none' },
  },
];

const meta = {
  title: 'Export/EntityPicker',
  component: EntityPicker,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    descriptors,
    onSelect: fn(),
  },
} satisfies Meta<typeof EntityPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { descriptors: [] },
};
