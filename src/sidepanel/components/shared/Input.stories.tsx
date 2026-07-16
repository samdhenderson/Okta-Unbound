import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Icon from '../overview/shared/Icon';
import Input from './Input';

const meta = {
  title: 'Shared/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Enter text…',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Sample text' },
};

export const WithLabel: Story = {
  args: { label: 'Username' },
};

export const WithHint: Story = {
  args: { label: 'Email address', hint: 'Use your company email' },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    value: 'invalid',
    error: 'Invalid email format',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked field',
    value: 'Cannot edit',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search groups',
    placeholder: 'Type to search…',
    icon: <Icon type="search" size="sm" />,
  },
};

export const EmailType: Story = {
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'name@company.com',
    hint: 'We will never share your email',
  },
};

export const PasswordType: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: '••••••••',
  },
};

export const SearchType: Story = {
  args: {
    type: 'search',
    label: 'Search',
    placeholder: 'Find users…',
    icon: <Icon type="search" size="sm" />,
  },
};

export const NotFullWidth: Story = {
  args: {
    label: 'City',
    placeholder: 'Type…',
    fullWidth: false,
  },
};
