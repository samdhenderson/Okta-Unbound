import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RulesFilterPanel, { type RulesFilterType } from './RulesFilterPanel';
import type { RuleSortMode } from '../../../shared/rules/similarity';

const sampleRules = [
  { name: 'Engineering — all ICs', status: 'ACTIVE' as const, conflicted: false },
  { name: 'Engineering Managers', status: 'ACTIVE' as const, conflicted: true },
  { name: 'Contractors — EMEA', status: 'INACTIVE' as const, conflicted: false },
  { name: 'Sales — AMER', status: 'INACTIVE' as const, conflicted: true },
];

const applyFilter = (filter: RulesFilterType) =>
  sampleRules.filter((rule) => {
    if (filter === 'active') return rule.status === 'ACTIVE';
    if (filter === 'paused') return rule.status === 'INACTIVE';
    if (filter === 'conflicts') return rule.conflicted;
    return true;
  });

const meta = {
  title: 'Rules/RulesFilterPanel',
  component: RulesFilterPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The Rules rung's filter chips and sort selector, disclosed below the action strip " +
          'by its `FilterToggle`. Presentational: every chip and the sort reports upward, and ' +
          'the rung owns the filtering.\n\n' +
          'The Conflicts chip is disabled rather than omitted at zero, and keeps its `(0)` — ' +
          '"how many rules conflict" is a finding about the loaded set, and zero is the good ' +
          'answer, worth stating rather than leaving the reader to wonder whether the check ran.',
      },
    },
  },
  argTypes: {
    activeFilter: { description: 'The active filter chip.' },
    onFilterChange: { description: 'Called with the newly chosen filter.' },
    conflictsCount: { description: 'Conflict count shown on, and gating, the Conflicts chip.' },
    showCurrentGroup: { description: 'Whether to offer the "Current Group" chip.' },
    sortMode: { description: 'Active list sort mode.' },
    onSortChange: { description: 'Called with the newly chosen sort mode.' },
  },
  args: {
    activeFilter: 'all',
    onFilterChange: fn(),
    conflictsCount: 0,
    showCurrentGroup: false,
    sortMode: 'default',
    onSortChange: fn(),
  },
} satisfies Meta<typeof RulesFilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithConflicts: Story = {
  args: { conflictsCount: 3, activeFilter: 'conflicts' },
};

export const WithCurrentGroup: Story = {
  args: { showCurrentGroup: true, activeFilter: 'current-group' },
};

export const SortedBySimilarity: Story = {
  args: { sortMode: 'similarity' satisfies RuleSortMode },
};

export const Interactive: Story = {
  render: (args) => {
    const Harness = () => {
      const [activeFilter, setActiveFilter] = useState<RulesFilterType>('all');
      const [sortMode, setSortMode] = useState<RuleSortMode>('default');

      const visible = applyFilter(activeFilter);
      const ordered =
        sortMode === 'name' ? [...visible].sort((a, b) => a.name.localeCompare(b.name)) : visible;

      return (
        <div className="space-y-(--sp-field)">
          <RulesFilterPanel
            {...args}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            conflictsCount={sampleRules.filter((rule) => rule.conflicted).length}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />
          <ul aria-label="Rules" className="space-y-1 text-sm text-neutral-700">
            {ordered.map((rule) => (
              <li key={rule.name}>{rule.name}</li>
            ))}
          </ul>
        </div>
      );
    };
    return <Harness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Rules' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);

    await userEvent.click(canvas.getByRole('button', { name: 'Active Only' }));
    await expect(canvas.getByRole('button', { name: 'Active Only' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', { name: 'Conflicts (2)' }));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    await expect(within(list).getByText('Sales — AMER')).toBeInTheDocument();

    await userEvent.selectOptions(canvas.getByLabelText('Sort rules'), 'name');
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent(
      'Engineering Managers',
    );
  },
};
