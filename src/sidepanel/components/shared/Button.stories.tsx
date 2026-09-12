import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import Button from './Button';
import Icon from './Icon';

const meta = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The primary text button primitive — the default choice for any clickable CTA.\n\n' +
          'Five variants (`primary | secondary | danger | ghost | success`) and four sizes (`xs | sm | md | lg`), with an optional leading/trailing icon, loading spinner, trailing count badge, and full-width layout. Disabled and loading both block interaction. For icon-only affordances use `IconButton`; for filter toggles use `FilterPill`.',
      },
    },
  },
  argTypes: {
    children: { description: 'Button label content.' },
    variant: {
      description:
        'Visual treatment: `secondary` is the default; `danger`/`success` carry semantic colour; `ghost` is chromeless but still a box; `link` reads as running text, with no horizontal padding at all; `primary` is the page call to action.',
    },
    size: {
      description:
        'Size scale (`xs` ≈ 24px, `sm` ≈ 36px, `md` ≈ 40px, `lg` ≈ 56px). Defaults to `md`. `xs` is the recessed step — selection-register furniture, not a page verb.',
    },
    icon: {
      description: 'Optional icon glyph rendered alongside the label (hidden while `loading`).',
    },
    iconPosition: { description: 'Which side of the label the icon sits on. Defaults to `left`.' },
    disabled: { description: 'Disables the button.' },
    loading: {
      description: 'Shows a spinner and disables the button while an action is in flight.',
    },
    onClick: { description: 'Click handler.' },
    type: { description: 'Native button type. Defaults to `button` (does not submit forms).' },
    className: { description: 'Extra classes merged onto the button.' },
    fullWidth: { description: 'Stretch to fill the container width.' },
    badge: {
      description: 'Optional count/badge pill rendered at the trailing edge (e.g. unread count).',
    },
    title: { description: 'Native `title` tooltip.' },
  },
  args: {
    children: 'Add group',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary', icon: 'plus' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Remove members' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Link: Story = {
  args: { variant: 'link', size: 'xs', children: 'Select all (245)' },
};

export const LinkDisabled: Story = {
  args: { variant: 'link', size: 'xs', children: 'Select all (245)', disabled: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true },
};

export const WithBadge: Story = {
  args: { variant: 'primary', badge: '3' },
};

export const Hover: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { focusVisible: true } },
};

export const Pressed: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { active: true } },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  args: { variant: 'primary' },
};

export const Disclosure: Story = {
  render: (args) => (
    <div>
      <Button {...args} expanded controls="button-disclosure-region" icon="minus">
        Manage
      </Button>
      <div
        id="button-disclosure-region"
        className="mt-2 rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
      >
        The region this button shows and hides.
      </div>
    </div>
  ),
  args: { variant: 'ghost', size: 'sm' },
};

export const LabelWithElementChild: Story = {
  render: (args) => (
    <div className="w-48">
      <Button {...args} expanded controls="button-element-child-region">
        Rules that use this group
        <Icon type="chevron-right" size="sm" className="rotate-90" />
      </Button>
      <div id="button-element-child-region" className="sr-only">
        The region this button shows and hides.
      </div>
    </div>
  ),
  args: { variant: 'ghost', size: 'xs' },
};
