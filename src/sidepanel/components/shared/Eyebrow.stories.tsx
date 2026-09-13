import type { Meta, StoryObj } from '@storybook/react-vite';
import Eyebrow from './Eyebrow';
import Badge from './Badge';
import Button from './Button';

const meta = {
  title: 'Shared/Eyebrow',
  component: Eyebrow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The small uppercase label that titles a section — the one place the recipe `text-xs font-semibold uppercase tracking-wide text-neutral-600` lives.\n\n' +
          'There is deliberately no colour, size or tracking prop: `className` is for layout and spacing only. An eyebrow is a label, never a control, and `as="h3"` is for when it is a real section heading that should join the document outline.',
      },
    },
  },
  argTypes: {
    children: { description: 'The label text; short, because an eyebrow titles a section.' },
    as: {
      description:
        'Element to render: `span` (default), `div` for a block box, or `h3` when the eyebrow is a real section heading.',
    },
    className: {
      description: 'Extra classes — layout and spacing only, never colour or type.',
    },
    title: { description: 'Native `title` tooltip, for a label whose full meaning does not fit.' },
    testId: { description: 'Optional test handle.' },
  },
  args: {
    children: 'Membership source',
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Elements: Story = {
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
  },
  render: () => (
    <div className="space-y-2">
      <Eyebrow as="span" className="block">
        span — decorative label
      </Eyebrow>
      <Eyebrow as="div">div — decorative block</Eyebrow>
      <Eyebrow as="h3">h3 — real section heading</Eyebrow>
    </div>
  ),
};

export const SectionHeader: Story = {
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
  },
  render: () => (
    <div className="w-96 rounded-md border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Eyebrow as="h3">Members</Eyebrow>
          <Badge variant="neutral">248</Badge>
        </div>
        <Button variant="secondary" size="sm">
          Load
        </Button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Everyone who resolves into this group, from every source.
      </p>
    </div>
  ),
};

export const InAFactList: Story = {
  render: () => (
    <dl className="w-72 space-y-3">
      {[
        ['Group type', 'Okta group'],
        ['Source', 'Rule — Engineering EMEA'],
        ['Last updated', '19 Aug 2026'],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>
            <Eyebrow>{label}</Eyebrow>
          </dt>
          <dd className="mt-0.5 text-sm text-neutral-900">{value}</dd>
        </div>
      ))}
    </dl>
  ),
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  render: () => (
    <div className="w-full space-y-3 p-4">
      <Eyebrow className="block">Membership source breakdown</Eyebrow>
      <p className="text-sm text-neutral-700">
        248 members: 190 assigned directly, 58 from two rules.
      </p>
    </div>
  ),
};

export const WithTooltip: Story = {
  args: {
    children: 'App push',
    title: 'Where this group’s members are provisioned downstream.',
  },
};
