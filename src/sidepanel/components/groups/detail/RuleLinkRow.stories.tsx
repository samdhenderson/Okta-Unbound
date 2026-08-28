import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import RuleLinkRow from './RuleLinkRow';
import { Badge } from '../../shared';

const meta = {
  title: 'Groups/RuleLinkRow',
  component: RuleLinkRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A rule name, an optional secondary detail line, and an optional trailing node ' +
          '(a status pill, a member count) — with or without a click that opens the rule ' +
          'in the Rules tab. Without `onSelect` the row is non-interactive markup, so a ' +
          'caller with nowhere to navigate never ships a button that goes nowhere.',
      },
    },
  },
  argTypes: {
    name: { description: "Rule name — the row's visible label and accessible name." },
    trailing: { description: 'Optional right-aligned node (a status pill, a member count).' },
    detail: {
      description: 'Optional secondary line under the name (e.g. a condition expression).',
    },
    onSelect: {
      description: 'Deep-links this rule in the Rules tab. Omit to render a non-interactive row.',
    },
  },
  args: {
    name: 'All Engineers',
    onSelect: fn(),
  },
} satisfies Meta<typeof RuleLinkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Open rule All Engineers in the Rules tab' }),
    ).toBeInTheDocument();
  },
};

export const Static: Story = {
  args: { onSelect: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(canvas.getByText('All Engineers')).toBeInTheDocument();
  },
};

export const WithDetail: Story = {
  args: { detail: 'user.department == "Engineering"' },
};

export const WithTrailing: Story = {
  args: { trailing: <Badge variant="success">ACTIVE</Badge> },
};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};
