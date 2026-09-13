import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import SelectionChips from './SelectionChips';
import type { OktaUser } from '../../../shared/types';
import { mockUsers } from '../../../test/mocks/fixtures';

const asUser = (item: unknown) => item as OktaUser;

const meta = {
  title: 'Shared/SelectionChips',
  component: SelectionChips,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Renders a set of selected items as removable chips — the display half of a multi-select.\n\n' +
          'Generic over the item type `T`; `getKey`/`getLabel` project each item. Shows `emptyMessage` when empty, and a “Clear all” link only when more than one item is selected.',
      },
    },
  },
  argTypes: {
    items: { description: 'Selected items to render as chips.' },
    getKey: { description: 'Stable React key for an item.' },
    getLabel: { description: 'Visible chip label for an item.' },
    onRemove: { description: 'Called to remove a single item (its × button).' },
    onClearAll: {
      description: 'Optional “Clear all” handler; the link shows only when >1 item is selected.',
    },
    emptyMessage: { description: 'Placeholder text shown when there are no items.' },
    className: { description: 'Extra classes merged onto the outer container.' },
  },
  args: {
    items: [],
    getKey: (item: unknown) => asUser(item).id,
    getLabel: (item: unknown) => {
      const user = asUser(item);
      return `${user.profile.firstName} ${user.profile.lastName}`;
    },
    onRemove: fn(),
  },
} satisfies Meta<typeof SelectionChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const EmptyWithMessage: Story = {
  args: {
    emptyMessage: 'No users assigned',
  },
};

export const SingleItem: Story = {
  args: {
    items: [mockUsers[0]],
  },
};

export const MultipleItems: Story = {
  args: {
    items: mockUsers.slice(0, 3),
  },
};

export const WithClearAll: Story = {
  args: {
    items: mockUsers.slice(0, 5),
    onClearAll: fn(),
  },
};

export const SingleNoHiddenClearAll: Story = {
  args: {
    items: [mockUsers[0]],
    onClearAll: fn(),
  },
};

export const ManyItems: Story = {
  args: {
    items: mockUsers.slice(0, 10),
    onClearAll: fn(),
  },
};

export const Removing: Story = {
  args: { items: mockUsers.slice(0, 3), onClearAll: fn() },
  render: (args) => {
    const Harness = () => {
      const [items, setItems] = useState<unknown[]>(args.items);
      return (
        <SelectionChips
          {...args}
          items={items}
          onRemove={(item) => setItems((prev) => prev.filter((candidate) => candidate !== item))}
          onClearAll={() => setItems([])}
        />
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = asUser(mockUsers[0]);
    const label = `${first.profile.firstName} ${first.profile.lastName}`;
    await userEvent.click(canvas.getByRole('button', { name: `Remove ${label}` }));
    await expect(canvas.queryByText(label)).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await expect(canvas.getByText('No items selected')).toBeInTheDocument();
  },
};
