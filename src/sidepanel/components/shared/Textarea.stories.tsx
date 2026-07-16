import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Textarea from './Textarea';

const meta = {
  title: 'Shared/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Enter text here...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Notes',
    hint: 'Add any relevant notes here',
    placeholder: 'Type your notes...',
  },
};

export const WithError: Story = {
  args: {
    value: 'Some invalid input',
    label: 'Notes',
    error: 'This field contains invalid characters',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Notes',
    value: 'This field is disabled',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Description',
    rows: 8,
    placeholder: 'Enter a longer description...',
  },
};

export const ConstrainedWidth: Story = {
  args: {
    label: 'Comment',
    fullWidth: false,
    placeholder: 'Type a comment...',
  },
};
