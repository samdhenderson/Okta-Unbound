import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ListCountLine from './ListCountLine';
import Button from './Button';

const meta = {
  title: 'Shared/ListCountLine',
  component: ListCountLine,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The line above a selectable list that says how much of it is on screen and how much is ticked — and the reason the controls below carry no counts of their own. A number stated twice is a number that can disagree with itself.\n\n' +
          'Two absences are deliberate and are not the same absence. **No `of`** means the list is a page and no honest total exists, so the line says `Showing 20` and stops — a page size rendered as a total is the confidently-wrong number `docs/claims.md` forbids. **No selection** omits the clause entirely rather than rendering `0 selected`, because an empty basket is an absence, not a figure the reader asked for.',
      },
    },
  },
  argTypes: {
    shown: {
      description: 'Rows on screen now — after filtering, and after paging where it pages.',
    },
    of: {
      description:
        'The population `shown` was drawn from. Omit when no honest total exists, such as a server-side search holding one page.',
    },
    selected: { description: 'Ticked rows of this list’s kind. `0` renders no clause at all.' },
    className: { description: 'Extra classes — layout and spacing only, never type or colour.' },
    testId: { description: 'Optional test handle.' },
  },
  args: {
    shown: 47,
    of: 250,
    selected: 0,
    testId: 'list-count-line',
  },
} satisfies Meta<typeof ListCountLine>;

export default meta;
type Story = StoryObj<typeof meta>;

const lineText = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('list-count-line').textContent;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250');
  },
};

export const WithSelection: Story = {
  args: { selected: 12 },
  play: async ({ canvasElement }) => {
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250 · 12 selected');
  },
};

export const NoHonestTotal: Story = {
  args: { shown: 20, of: undefined, selected: 3 },
  play: async ({ canvasElement }) => {
    await expect(lineText(canvasElement)).toBe('Showing 20 · 3 selected');
  },
};

export const ZeroSelectedIsAbsent: Story = {
  args: { selected: 0 },
  play: async ({ canvasElement }) => {
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250');
  },
};

export const AboveAList: Story = {
  args: { shown: 3, of: 128, selected: 2 },
  render: (args) => (
    <div className="w-96">
      <div className="flex items-center justify-end gap-2 rounded-t-md border border-neutral-200 bg-white px-3 py-2">
        <Button variant="link" size="xs">
          Deselect all
        </Button>
        <Button variant="link" size="xs">
          Select all
        </Button>
        <Button variant="secondary" size="xs">
          Compare
        </Button>
      </div>
      <div className="border-x border-neutral-200 px-3 py-2">
        <ListCountLine {...args} />
      </div>
      <ul className="divide-y divide-neutral-200 rounded-b-md border border-neutral-200">
        {['Engineering EMEA', 'Payments Team', 'Contractors — 2026'].map((name) => (
          <li key={name} className="px-3 py-2 text-sm text-neutral-900">
            {name}
          </li>
        ))}
      </ul>
    </div>
  ),
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: { shown: 1284, of: 12840, selected: 1284 },
  render: (args) => (
    <div className="w-full p-4">
      <ListCountLine {...args} />
    </div>
  ),
};
