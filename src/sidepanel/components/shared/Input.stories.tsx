import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import Icon from '../shared/Icon';
import IconButton from './IconButton';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Shared/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Controlled single-line text field with optional label, hint, size scale, leading/trailing adornments and error state. `onChange` receives the string value, not the event; when `error` is set the field turns red and the message replaces the hint. For multi-line use `Textarea`; for choices use `Select`.\n\n' +
          'Three sizes (`sm` ≈ 30px, `md` ≈ 38px, `lg` ≈ 46px) and two in-field slots — `icon` and `trailing` — which reserve their padding automatically. A `trailing` node is inert by default; set `trailingInteractive` when it holds a control.',
      },
    },
  },
  argTypes: {
    value: { description: 'Controlled value.' },
    onChange: { description: 'Called with the new string value on each change.' },
    placeholder: { description: 'Placeholder text shown when empty.' },
    type: { description: 'Native input type. Defaults to `text`.' },
    disabled: { description: 'Disables the field.' },
    error: { description: 'Error message; when set, applies danger styling and hides `hint`.' },
    label: { description: 'Optional field label rendered above the input.' },
    ariaLabel: {
      description:
        'Accessible name for the control when no visible `label` is rendered (e.g. an inline field).',
    },
    hint: { description: 'Helper text below the input, shown only when there is no `error`.' },
    fullWidth: { description: 'Stretch to fill the container width. Defaults to `true`.' },
    size: {
      description:
        'Field height/type scale (`sm` ≈ 30px, `md` ≈ 38px, `lg` ≈ 46px). Defaults to `md`.',
    },
    icon: {
      description:
        'Optional leading icon rendered inside the field; left padding is reserved automatically.',
    },
    trailing: {
      description:
        'Optional node rendered inside the field at its trailing edge (clear button, spinner). Right padding is reserved automatically and scales with `size`.',
    },
    trailingInteractive: {
      description:
        'Set when `trailing` holds something the user clicks. By default the slot is `pointer-events-none` so a decorative adornment cannot swallow clicks aimed at the field.',
    },
    className: { description: 'Extra classes merged onto the outer container.' },
    autoFocus: { description: 'Focus the input on mount.' },
    onKeyDown: {
      description: 'Key handler on the input (e.g. Enter to submit, Escape to cancel).',
    },
  },
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

export const ErrorState: Story = {
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

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      <Input {...args} size="sm" ariaLabel="Small field" placeholder="sm — 30px" />
      <Input {...args} size="md" ariaLabel="Medium field" placeholder="md — 38px (default)" />
      <Input {...args} size="lg" ariaLabel="Large field" placeholder="lg — 46px" />
    </div>
  ),
  args: { icon: <Icon type="search" size="sm" /> },
};

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Search users',
    placeholder: 'Search by email, name, or login…',
    icon: <Icon type="search" size="sm" />,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Filter',
    placeholder: 'Filter rows…',
  },
};

export const WithTrailing: Story = {
  args: {
    label: 'Search groups',
    value: 'engineering',
    trailingInteractive: true,
    trailing: (
      <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
    ),
  },
};

export const WithIconAndTrailing: Story = {
  args: {
    size: 'lg',
    label: 'Search users',
    value: 'a-very-long-query-that-would-otherwise-run-under-the-clear-button@example.com',
    icon: <Icon type="search" size="sm" />,
    trailingInteractive: true,
    trailing: (
      <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
    ),
  },
};

export const SearchWithClear: Story = {
  args: {
    type: 'search',
    label: 'Search groups',
    value: 'engineering',
    icon: <Icon type="search" size="sm" />,
    trailingInteractive: true,
    trailing: (
      <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
    ),
  },
};

export const Searching: Story = {
  args: {
    size: 'lg',
    label: 'Search users',
    value: 'ada',
    icon: <Icon type="search" size="sm" />,
    trailing: <LoadingSpinner size="sm" />,
  },
};

const InputHarness = (): ReactElement => {
  const [value, setValue] = useState('');
  return (
    <Input
      ariaLabel="Search groups"
      value={value}
      onChange={setValue}
      placeholder="Type to search…"
      icon={<Icon type="search" size="sm" />}
      trailingInteractive={value !== ''}
      trailing={
        value ? (
          <IconButton label="Clear search" variant="ghost" size="sm" onClick={() => setValue('')}>
            <Icon type="close" size="sm" />
          </IconButton>
        ) : undefined
      }
    />
  );
};

export const Typing: Story = {
  render: () => <InputHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Search groups' });

    await userEvent.type(field, 'engineering');
    await expect(field).toHaveValue('engineering');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(field).toHaveValue('');
  },
};

export const ErrorStateLarge: Story = {
  args: {
    size: 'lg',
    label: 'Email address',
    value: 'invalid',
    error: 'Invalid email format',
    icon: <Icon type="search" size="sm" />,
  },
};

export const Combobox: Story = {
  render: () => (
    <div>
      <Input
        value="/api/v1/gr"
        onChange={fn()}
        ariaLabel="API path"
        combobox={{
          expanded: true,
          listboxId: 'story-listbox',
          activeOptionId: 'story-option-1',
        }}
      />
      <ul
        id="story-listbox"
        role="listbox"
        aria-label="Endpoint suggestions"
        className="mt-1 rounded-md border border-neutral-200 bg-white py-1 text-sm"
      >
        <li role="presentation" className="px-3 py-1 text-xs tracking-wide text-neutral-500">
          GROUPS
        </li>
        <li
          id="story-option-1"
          role="option"
          aria-selected="true"
          className="bg-neutral-100 px-3 py-1.5 font-mono text-neutral-900"
        >
          /api/v1/groups
        </li>
        <li
          id="story-option-2"
          role="option"
          aria-selected="false"
          className="px-3 py-1.5 font-mono text-neutral-900"
        >
          /api/v1/groups/&#123;groupId&#125;/users
        </li>
      </ul>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'API path' });

    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await expect(field).toHaveAttribute('aria-controls', 'story-listbox');
    await expect(field).toHaveAttribute('aria-activedescendant', 'story-option-1');
    await expect(canvas.getByRole('listbox', { name: 'Endpoint suggestions' })).toBeInTheDocument();
  },
};

export const ComboboxClosed: Story = {
  args: {
    value: '/api/v1/groups',
    ariaLabel: 'API path',
    combobox: { expanded: false, listboxId: 'closed-listbox' },
  },
};
