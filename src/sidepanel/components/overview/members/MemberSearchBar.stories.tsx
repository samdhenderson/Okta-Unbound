import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import MemberSearchBar from './MemberSearchBar';

const meta = {
  title: 'Overview/Members/MemberSearchBar',
  component: MemberSearchBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
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
