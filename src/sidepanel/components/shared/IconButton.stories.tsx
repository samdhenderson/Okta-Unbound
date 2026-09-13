import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import Icon from '../shared/Icon';
import IconButton from './IconButton';

const meta = {
  title: 'Shared/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon-only button primitive (close, remove, clear, expand). `label` is required and ' +
          'becomes the accessible name plus default tooltip. Three low-emphasis variants ' +
          '(`ghost`, `subtle`, `danger`), two sizes, and optional toggle (`active` → ' +
          '`aria-pressed`) or disclosure (`expanded` + `controls`) semantics.',
      },
    },
  },
  argTypes: {
    label: { description: 'Accessible name — required. Also the default tooltip.' },
    onClick: { description: 'Click handler.' },
    children: {
      description: 'The icon to render (an `<svg>` or `<Icon />`); it controls its own dimensions.',
    },
    variant: {
      description:
        'Low-emphasis treatment: `ghost` and `subtle` differ in hover intensity; `danger` hovers red.',
    },
    size: { description: '`sm` (p-1) or `md` (p-1.5) padding around the glyph.' },
    disabled: { description: 'Disables the button and dims it.' },
    type: { description: 'Native button type. Defaults to `button`.' },
    title: { description: 'Tooltip text; defaults to `label`.' },
    active: { description: 'For toggle buttons — reflected as `aria-pressed`.' },
    expanded: { description: 'For disclosure triggers — reflected as `aria-expanded`.' },
    controls: {
      description: '`id` of the region this button shows/hides — reflected as `aria-controls`.',
    },
    className: { description: 'Extra classes merged onto the button.' },
  },
  args: {
    label: 'Close',
    onClick: fn(),
    children: <Icon type="trash" />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'ghost' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Close' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const AccessibleName: Story = {
  args: { label: 'Remove member', variant: 'danger' },
  parameters: {
    a11y: {
      config: { rules: [{ id: 'button-name', enabled: true }] },
    },
  },
};

export const Subtle: Story = {
  args: { variant: 'subtle' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete' },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Close' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Active: Story = {
  args: { active: true, label: 'Settings active' },
};

export const Disclosure: Story = {
  render: (args) => (
    <div>
      <IconButton {...args} label="Collapse" expanded controls="disclosure-demo-panel">
        <Icon type="chevron-right" className="rotate-90" />
      </IconButton>
      <div id="disclosure-demo-panel" className="mt-2 text-sm text-neutral-700">
        The region the button controls.
      </div>
    </div>
  ),
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} size="sm" label="Small">
        <Icon type="trash" size="sm" />
      </IconButton>
      <IconButton {...args} size="md" label="Medium">
        <Icon type="trash" />
      </IconButton>
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} variant="ghost" label="Ghost">
        <Icon type="trash" />
      </IconButton>
      <IconButton {...args} variant="subtle" label="Subtle">
        <Icon type="trash" />
      </IconButton>
      <IconButton {...args} variant="danger" label="Delete">
        <Icon type="trash" />
      </IconButton>
    </div>
  ),
};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  parameters: { pseudo: { focusVisible: true } },
};

export const Pressed: Story = {
  parameters: { pseudo: { active: true } },
};
