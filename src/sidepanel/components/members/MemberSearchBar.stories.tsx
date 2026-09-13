import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import MemberSearchBar from './MemberSearchBar';

const meta = {
  title: 'Members/MemberSearchBar',
  component: MemberSearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Search input for the member list: a thin controlled wrapper over the shared `Input`, with a leading search icon and a clear button that appears only when the query is non-empty. The parent (`MemberExplorer`) owns the value and debounces it before filtering.',
      },
    },
  },
  argTypes: {
    value: { description: 'Current query text (controlled).' },
    onChange: { description: 'Called with the new query on each change / clear.' },
    placeholder: { description: 'Optional placeholder override.' },
  },
  args: {
    value: '',
    onChange: fn(),
  },
} satisfies Meta<typeof MemberSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Search…' },
};

export const WithValue: Story = {
  args: { value: 'jane.doe' },
};

export const LongText: Story = {
  args: { value: 'a very long search query that a user might paste into the box by mistake' },
};

const SearchHarness = (): ReactElement => {
  const [value, setValue] = useState('');
  return <MemberSearchBar value={value} onChange={setValue} />;
};

export const TypingAndClearing: Story = {
  render: () => <SearchHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('searchbox');
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

    await userEvent.type(field, 'jane');
    await expect(field).toHaveValue('jane');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(field).toHaveValue('');
    await expect(canvas.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  },
};
