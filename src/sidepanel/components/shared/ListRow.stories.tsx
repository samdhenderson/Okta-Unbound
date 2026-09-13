import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ListRow from './ListRow';

const meta = {
  title: 'Shared/ListRow',
  component: ListRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The chrome every list row shares: radius, resting border, hover border and ' +
          'transition are fixed with no prop to change them, and only `density`, `state`, ' +
          '`flash`, `body` and `as` are exposed. The interior belongs to the feature and ' +
          'follows the typography contract in `docs/design-system.md`.\n\n' +
          'Prefer `StretchedButton` over `as="button"` when the row contains its own ' +
          'controls — a button cannot legally contain a checkbox or another button.',
      },
    },
  },
  argTypes: {
    children: { description: "The row's content, owned by the feature." },
    density: {
      description:
        'Content density: `compact` resolves the row spacing role, `comfortable` the card role.',
    },
    state: { description: 'Resting appearance: `default`, `selected`, or `highlighted`.' },
    flash: { description: 'One-shot success confirmation via `animate-affirm-flash`.' },
    as: { description: 'Element to render: `div`, `li`, `a`, or `button`.' },
    onClick: { description: 'Activation handler; supplying it makes the row interactive.' },
    href: { description: '`href` for `as="a"`.' },
    target: { description: 'Link target; `_blank` also sets `rel="noopener noreferrer"`.' },
    ariaLabel: { description: 'Accessible name when the content does not supply one.' },
    describedBy: { description: '`id` of the element describing this row.' },
    dataAttributes: { description: 'Row-identity attributes (`data-group-id`, …).' },
    className: { description: 'Extra classes — layout only, never colour.' },
    testId: { description: 'Test id applied to the row element.' },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const RowBody = ({ title = 'Engineering', meta: metaLine = 'Okta group · 248 members' }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-0.5 truncate text-xs text-neutral-600">{metaLine}</div>
    </div>
    <span className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600">
      Active
    </span>
  </div>
);

export const Default: Story = {
  args: {
    children: <RowBody />,
  },
};

export const Densities: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-3">
      <ListRow density="compact">
        <RowBody title="compact — py-(--sp-row-y) px-(--sp-row-x)" meta="Dense scanning list" />
      </ListRow>
      <ListRow density="comfortable">
        <RowBody title="comfortable — p-(--sp-card)" meta="Rich card with badges and a meta line" />
      </ListRow>
    </div>
  ),
};

export const States: Story = {
  args: {
    children: null,
  },
  render: () => (
    <div className="space-y-3">
      <ListRow state="default">
        <RowBody title="default" meta="Resting" />
      </ListRow>
      <ListRow state="selected">
        <RowBody title="selected" meta="A user choice — persists" />
      </ListRow>
      <ListRow state="highlighted">
        <RowBody title="highlighted" meta="A deep-link target — transient" />
      </ListRow>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    children: null,
    onClick: fn(),
  },
  render: (args) => (
    <div className="space-y-3">
      <ListRow as="button" onClick={args.onClick} ariaLabel="Open Engineering">
        <RowBody title='as="button"' meta="Whole row activates — keyboard reachable" />
      </ListRow>
      <ListRow as="a" href="#list-row-demo" target="_blank">
        <RowBody title='as="a"' meta="Real navigation — rel is set automatically" />
      </ListRow>
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: 'Open Engineering' });

    await userEvent.click(row);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    row.focus();
    await expect(row).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Pressed: Story = {
  args: {
    children: <RowBody title="Pressed" meta="scale(.995) — subtle, for a wide target" />,
  },
  render: (args) => (
    <ListRow {...args} as="button" onClick={() => {}} ariaLabel="Open Engineering" />
  ),
  parameters: { pseudo: { active: true } },
};

export const InAList: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ul className="space-y-3">
      {['Engineering', 'Design', 'Support'].map((name) => (
        <ListRow key={name} as="li" density="compact">
          <RowBody title={name} meta="Okta group" />
        </ListRow>
      ))}
    </ul>
  ),
};

export const Expandable: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ListRow
      body={
        <div className="disclose" data-open="true">
          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-600">
              Body content sets its own padding and can carry its own background — the header above
              keeps the density padding.
            </p>
          </div>
        </div>
      }
    >
      <RowBody title="Expandable row" meta="Header keeps p-4; body sets its own" />
    </ListRow>
  ),
};

export const Flash: Story = {
  args: {
    flash: true,
    children: <RowBody title="Just added" meta="animate-affirm-flash" />,
  },
};
