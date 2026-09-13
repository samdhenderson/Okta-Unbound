import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import JsonNode from './JsonNode';

const userResponse = {
  id: '00uFAKE0000000000001',
  status: 'ACTIVE',
  created: '2026-01-15T09:00:00.000Z',
  activated: null,
  profile: {
    login: 'user@example.com',
    email: 'user@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Platform Engineering',
    mobilePhone: null,
  },
  credentials: {
    provider: { type: 'OKTA', name: 'OKTA' },
    recovery_question: { question: 'Favourite compiler?' },
  },
  _links: {
    groups: { href: 'https://example.okta.com/api/v1/users/00uFAKE0000000000001/groups' },
  },
};

const meta = {
  title: 'Shared/JsonNode',
  component: JsonNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One row of a JSON tree: a primitive leaf coloured by type, or an expandable object/array node whose children are more `JsonNode`s. The toggle is a real `<button>` carrying `aria-expanded`, and a collapsed node states how many keys or items it is holding rather than hiding the count.\n\n' +
          'Open/collapsed state is uncontrolled and starts open for the first two levels, collapsed deeper — Okta responses nest a few levels (`_embedded.users[].profile`), and opening all of them at once is unreadable.',
      },
    },
  },
  argTypes: {
    keyLabel: {
      description: 'Object key or array index this node sits under; omitted for the root.',
    },
    value: {
      description: 'The value to render — a primitive leaf, or an object/array to recurse into.',
    },
    depth: { description: 'Nesting depth, driving indentation and the default open state.' },
  },
  args: { value: userResponse, depth: 0 },
} satisfies Meta<typeof JsonNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primitives: Story = {
  args: {
    value: {
      aString: 'ACTIVE',
      aNumber: 42,
      aBoolean: true,
      aNull: null,
    },
  },
};

export const ArrayNode: Story = {
  args: {
    keyLabel: 'factors',
    value: ['Okta Verify', 'SMS', 'WebAuthn'],
    depth: 0,
  },
};

export const PrimitiveLeaf: Story = {
  args: { keyLabel: 'status', value: 'ACTIVE', depth: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('"ACTIVE"')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const DeepNodeStartsCollapsed: Story = {
  args: { keyLabel: 'provider', value: { type: 'OKTA', name: 'OKTA' }, depth: 3 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText(/2 keys/)).toBeInTheDocument();
  },
};

export const TogglingANode: Story = {
  args: { keyLabel: 'profile', value: userResponse.profile, depth: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /profile/ });

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('login:')).toBeNull();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('login:')).toBeInTheDocument();

    await userEvent.click(toggle);
    await expect(canvas.queryByText('login:')).toBeNull();
    await expect(canvas.getByText(/6 keys/)).toBeInTheDocument();
  },
};
