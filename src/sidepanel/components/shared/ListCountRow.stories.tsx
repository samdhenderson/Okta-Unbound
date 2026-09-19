import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ListCountRow from './ListCountRow';

const selection = {
  boundary: 'available' as const,
  onSelectAll: fn(),
  onDeselectAll: fn(),
  selectAllTitle: 'Select every group matching the current filters',
  deselectAllTitle: 'Clear every selected group, including any picked on another screen',
};

const meta = {
  title: 'Shared/ListCountRow',
  component: ListCountRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The control line above a selectable list: `ListCountLine` writes the numbers, and ' +
          '*Select all* / *Deselect all* stand beside them. The controls live here rather than ' +
          "in `ActionBar`'s selection register so that each one sits next to the figure it acts " +
          'on, and the verb strip is left for verbs.\n\n' +
          'The labels carry **no counts** — the line states each number once, and a number ' +
          'printed twice is a number that can disagree with itself. The boundary a control is ' +
          'standing on travels in its `title`, which on an element with text content is the ' +
          'accessible *description*, not the name.\n\n' +
          '*Deselect all* is declared first, so it takes position one the moment it exists: ' +
          'where the set of controls varies with the selection size, the leading position must ' +
          'hold a control whose worst outcome is another click. Because the cluster is trailing, ' +
          'its arrival grows the cluster leftward and *Select all* does not move. *Select all* ' +
          'is disabled at its boundary rather than omitted — it is furniture, not a verb.\n\n' +
          'Which boundary it stands on is **stated** by the rung, as a three-valued ' +
          '`boundary`, and never inferred here from the two counts. `selected` is the whole ' +
          'basket partition for that kind — including rows ticked under another filter, on ' +
          'another screen — while what *Select all* would take is scoped to the current ' +
          'search. Those two numbers count different populations, so their equality is not ' +
          'evidence of set equality; the `SameSizeDifferentRows` story is the regression net ' +
          'for that.\n\n' +
          'Layout is `flex-wrap-reverse`: the cluster sits beside the count when the row is wide ' +
          'enough and wraps to a line **above** it when it is not, measured from the content ' +
          'rather than guessed from a breakpoint. The three viewport stories pin that.',
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
    selection: {
      description:
        'The selection controls, their caller-written titles, and the `boundary` *Select all* ' +
        'stands on. Omit for a count line with nothing ticked against it.',
    },
    className: {
      description: 'Extra classes for the row — layout and spacing only, never type or colour.',
    },
    testId: { description: 'Optional test handle, forwarded to the count line.' },
  },
  args: {
    shown: 42,
    of: 1070,
    selected: 0,
    selection,
    testId: 'list-count-row-line',
  },
} satisfies Meta<typeof ListCountRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('button')
    .map((b) => b.textContent);

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent(
      'Showing 42 of 1,070',
    );
    await expect(labels(canvasElement)).toEqual(['Select all']);

    const selectAll = canvas.getByRole('button', { name: 'Select all' });
    await expect(selectAll).toBeEnabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'Select every group matching the current filters',
    );
    await expect(selectAll).toHaveAccessibleName('Select all');

    await userEvent.click(selectAll);
    await expect(args.selection?.onSelectAll).toHaveBeenCalledTimes(1);
  },
};

export const SomeSelected: Story = {
  args: { selected: 3 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent(
      'Showing 42 of 1,070 · 3 selected',
    );
    await expect(labels(canvasElement)).toEqual(['Deselect all', 'Select all']);

    const deselectAll = canvas.getByRole('button', { name: 'Deselect all' });
    await expect(deselectAll).toHaveAccessibleDescription(
      'Clear every selected group, including any picked on another screen',
    );
    await expect(canvas.getByRole('button', { name: 'Select all' })).toBeEnabled();

    await userEvent.click(deselectAll);
    await expect(args.selection?.onDeselectAll).toHaveBeenCalledTimes(1);
  },
};

export const AllSelected: Story = {
  args: {
    selected: 42,
    selection: {
      ...selection,
      boundary: 'all-taken',
      selectAllTitle: 'All 42 groups matching the current filters are already selected',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(labels(canvasElement)).toEqual(['Deselect all', 'Select all']);

    const selectAll = canvas.getByRole('button', { name: 'Select all' });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'All 42 groups matching the current filters are already selected',
    );
    await expect(canvas.getByRole('button', { name: 'Deselect all' })).toBeEnabled();
  },
};

export const NoneSelectable: Story = {
  args: {
    shown: 0,
    of: 1070,
    selected: 0,
    selection: {
      ...selection,
      boundary: 'none-selectable',
      selectAllTitle: 'No groups match the current filters',
    },
  },
  play: async ({ canvasElement }) => {
    const selectAll = within(canvasElement).getByRole('button', { name: 'Select all' });

    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('No groups match the current filters');
  },
};

export const SameSizeDifferentRows: Story = {
  args: { shown: 3, of: 1070, selected: 3 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent(
      'Showing 3 of 1,070 · 3 selected',
    );

    const selectAll = canvas.getByRole('button', { name: 'Select all' });
    await expect(selectAll).toBeEnabled();
    await expect(selectAll).toHaveAccessibleDescription(
      'Select every group matching the current filters',
    );

    await userEvent.click(selectAll);
    await expect(args.selection?.onSelectAll).toHaveBeenCalledTimes(1);
  },
};

export const WithoutSelection: Story = {
  args: { selection: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent(
      'Showing 42 of 1,070',
    );
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: { shown: 1284000, of: 12840000, selected: 1284000 },
  render: (args) => <ListCountRow {...args} />,
};

export const DefaultWidth: Story = {
  parameters: { viewport: { value: 'sidepanelDefault' } },
  args: { selected: 3 },
  render: (args) => <ListCountRow {...args} />,
};

export const Wide: Story = {
  parameters: { viewport: { value: 'sidepanelWide' } },
  args: { selected: 3 },
  render: (args) => <ListCountRow {...args} />,
};

export const AboveAList: Story = {
  args: { shown: 3, of: 1070, selected: 2, selection },
  render: (args) => (
    <div>
      <ListCountRow {...args} className="mb-2" />
      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        {['Engineering EMEA', 'Payments Team', 'Contractors — 2026'].map((name) => (
          <li key={name} className="px-3 py-2 text-sm text-neutral-900">
            {name}
          </li>
        ))}
      </ul>
    </div>
  ),
};
