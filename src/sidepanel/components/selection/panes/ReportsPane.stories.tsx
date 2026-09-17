import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ReportsPane from './ReportsPane';
import type { BasketVerb } from '../../../selection/verbs/types';
import type {
  SelectionBasket,
  SelectionKind,
  SelectionRef,
} from '../../../selection/selectionStore';

const basketOf = (kinds: SelectionKind[]): SelectionBasket => ({
  picked: kinds.map<SelectionRef>((kind, index) => ({
    kind,
    id: `${kind}-${index}`,
    name: `${kind} ${index}`,
    pickedAt: 1_700_000_000_000 + index,
  })),
});

const countsOf = (basket: SelectionBasket): Partial<Record<SelectionKind, number>> => {
  const counts: Partial<Record<SelectionKind, number>> = {};
  for (const ref of basket.picked) counts[ref.kind] = (counts[ref.kind] ?? 0) + 1;
  return counts;
};

const OVERLAP: BasketVerb = {
  id: 'group-overlap',
  label: 'Report shared members',
  title: 'Report which members these groups share',
  path: 'read',
  needs: ['group'],
  isAvailable: (basket) => basket.picked.filter((ref) => ref.kind === 'group').length >= 2,
  unavailableReason: 'Needs at least two groups — an overlap of one group is not a question.',
  cost: (basket) => ({
    requests: 0,
    walks: [
      {
        count: basket.picked.filter((ref) => ref.kind === 'group').length,
        kind: 'membership' as const,
      },
    ],
    writes: 0,
  }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
};

const TWO_GROUPS = basketOf(['group', 'group']);
const ONE_GROUP = basketOf(['group']);

const meta = {
  title: 'Selection/panes/ReportsPane',
  component: ReportsPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders `read` verbs from the registry. A report answers in a CSV rather than a table ' +
          'on screen: a 400px pane cannot hold a wide table honestly, and a truncated preview is a ' +
          'claim about a set the reader cannot see.',
      },
    },
  },
  args: { onRun: fn() },
} satisfies Meta<typeof ReportsPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoVerbsWired: Story = {
  args: { verbs: [], basket: TWO_GROUPS, counts: countsOf(TWO_GROUPS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No reports yet')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const ExtraConditionWithholdsIt: Story = {
  args: { verbs: [OVERLAP], basket: ONE_GROUP, counts: countsOf(ONE_GROUP) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing here applies yet')).toBeInTheDocument();
    await expect(canvas.getByText(/Needs at least two groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Runnable: Story = {
  args: { verbs: [OVERLAP], basket: TWO_GROUPS, counts: countsOf(TWO_GROUPS) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(OVERLAP.title)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: OVERLAP.title }));
    await expect(args.onRun).toHaveBeenCalledWith(OVERLAP);
  },
};
