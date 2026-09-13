import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import PaletteRow from './PaletteRow';

const meta = {
  title: 'Sidepanel/Palette/PaletteRow',
  component: PaletteRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "One row in the ⌘K palette's result list — a section to jump to, or an entity to " +
          'open. Given an `href` the row renders as an `<a>`, otherwise as a `<button>`: ' +
          'never both, because a link nested inside the row button is a `nested-interactive` ' +
          'violation and a button wrapping a link is a control that does nothing.\n\n' +
          'The roving anchor lives in the list, not the row: exactly one row carries ' +
          '`tabIndex={0}` and every other carries `-1`, so the whole result list is one tab ' +
          'stop. The row takes the value it is told and a ref the list focuses.',
      },
    },
  },
  argTypes: {
    trailing: {
      control: false,
      description:
        'Right-edge mark naming where the row goes (`Groups ›`), or carrying its "Open in Okta" link.',
    },
    isCurrent: {
      description:
        'Whether this is the section the reader is already on; marks the row `aria-current="page"`.',
    },
    tabIndex: {
      description: 'The roving anchor: `0` on exactly one row in the list, `-1` on every other.',
    },
  },
  args: {
    icon: 'users',
    label: 'Groups',
    tabIndex: 0,
    onClick: fn(),
  },
} satisfies Meta<typeof PaletteRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Activating: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Groups' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Current: Story = {
  args: { label: 'Home', icon: 'home', isCurrent: true },
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('button');
    await expect(row).toHaveAttribute('aria-current', 'page');
  },
};

export const WithSecondary: Story = {
  args: { label: 'Engineering', secondary: 'Everyone in the engineering org' },
};

export const WithTrailingMark: Story = {
  args: {
    label: 'Engineering',
    secondary: 'Everyone in the engineering org',
    trailing: 'Groups ›',
    ariaLabel: 'Engineering — open in Groups',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Engineering — open in Groups' }),
    ).toBeInTheDocument();
  },
};

export const NotTheAnchor: Story = {
  args: { label: 'Rules', icon: 'bolt', tabIndex: -1 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveAttribute('tabindex', '-1');
  },
};

export const AsLink: Story = {
  args: {
    label: 'Engineering',
    secondary: 'All engineers',
    href: 'https://example.okta.com/admin/group/00gFAKE0000000000001',
    trailing: 'Okta ↗',
    ariaLabel: 'Engineering — open in Okta',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Engineering — open in Okta' });

    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Truncated: Story = {
  args: {
    label: 'Contractors — EMEA — Finance and Procurement (managed by IAM)',
    secondary: 'Sourced from the HR feed; membership is rule-driven and cannot be edited by hand',
    trailing: 'Groups ›',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};
