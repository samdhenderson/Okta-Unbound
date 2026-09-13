import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import InsightCard from './InsightCard';
import Badge from './Badge';

const meta = {
  title: 'Shared/InsightCard',
  component: InsightCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The anatomy every card on an insights surface shares: a name, the badges saying why it ranks where it does, a headline that reads without a click, and one disclosure holding the detail. Severity is carried by order and badges — never by giving a flagged card a different shape — and the badges render collapsed as well as expanded.\n\n' +
          'The disclosure is a real `<button>` scoped to the header, carrying `aria-expanded`/`aria-controls`, and its accessible name includes `subject` so a grid of cards does not name every control identically.',
      },
    },
  },
  argTypes: {
    title: {
      description: "Render prop for the card's name, given the `titleId` the disclosure points at.",
    },
    subject: {
      description: "Plain-text subject folded into the disclosure's accessible name.",
    },
    revealName: {
      description: 'What the disclosure reveals, as a noun phrase.',
    },
    badges: {
      description: 'Why this card ranks where it does; omit when nothing is flagged.',
    },
    headline: {
      description: 'The always-visible summary under the badges.',
    },
    children: { description: 'The disclosed body.' },
    defaultExpanded: {
      description: 'Starts the card expanded.',
    },
  },
  args: {
    title: (titleId: string) => (
      <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
        Enrollment
      </span>
    ),
    subject: 'MFA enrollment',
    revealName: 'bucket breakdown',
    badges: (
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <Badge variant="warning">2 unprotected</Badge>
        </li>
        <li>
          <Badge variant="neutral">7 on a single factor</Badge>
        </li>
      </ul>
    ),
    headline: <p className="text-xs text-neutral-600">40 of 40 members scanned · 3 buckets</p>,
    children: (
      <ul className="space-y-1 text-xs text-neutral-700">
        <li>No factors enrolled — 2 (5%)</li>
        <li>One factor — 7 (18%)</li>
        <li>Two or more factors — 31 (78%)</li>
      </ul>
    ),
  },
} satisfies Meta<typeof InsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  args: { defaultExpanded: true },
};

export const NoBadges: Story = {
  args: {
    title: (titleId: string) => (
      <span id={titleId} className="truncate text-sm font-semibold text-neutral-900">
        Factor types
      </span>
    ),
    subject: 'factor types',
    revealName: 'factor list',
    badges: undefined,
    headline: <p className="text-xs text-neutral-600">4 types in use</p>,
  },
};

export const KeyboardOperable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Show the bucket breakdown for MFA enrollment',
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(
      canvas.getByRole('button', { name: 'Hide the bucket breakdown for MFA enrollment' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

export const InAGrid: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-3 bg-canvas p-3 sm:grid-cols-2">
      <InsightCard {...args} />
      <InsightCard {...args} {...NoBadges.args} />
    </div>
  ),
};
