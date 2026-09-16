import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ActionsPane from './ActionsPane';
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

const REMOVE_INACTIVE: BasketVerb = {
  id: 'remove-inactive',
  label: 'Remove inactive members',
  title: 'Remove deactivated, suspended and locked-out members from these groups',
  path: 'write',
  needs: ['group'],
  cost: (basket) => ({
    requests: 0,
    walks: basket.picked.filter((ref) => ref.kind === 'group').length,
    writes: 0,
  }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
};

const GROUPS = basketOf(['group', 'group']);
const USERS_ONLY = basketOf(['user']);

const meta = {
  title: 'Selection/panes/ActionsPane',
  component: ActionsPane,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders `write` verbs from the registry. Three states, and the pane says which one it ' +
          'is in: no verbs wired at all, verbs that do not apply to what is ticked (naming the ' +
          'partitions they wait on), or the runnable list. Reporting the first two with one ' +
          'sentence would lose the reason for the absence (`docs/claims.md`).',
      },
    },
  },
  args: { onRun: fn() },
} satisfies Meta<typeof ActionsPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoVerbsWired: Story = {
  args: { verbs: [], basket: GROUPS, counts: countsOf(GROUPS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No actions yet')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const NothingApplies: Story = {
  args: { verbs: [REMOVE_INACTIVE], basket: USERS_ONLY, counts: countsOf(USERS_ONLY) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing here applies yet')).toBeInTheDocument();
    await expect(canvas.getByText(/Tick some groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Runnable: Story = {
  args: { verbs: [REMOVE_INACTIVE], basket: GROUPS, counts: countsOf(GROUPS) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(REMOVE_INACTIVE.title)).toBeInTheDocument();
    await expect(canvas.getByText('Takes 2 membership walks.')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: REMOVE_INACTIVE.title }));
    await expect(args.onRun).toHaveBeenCalledWith(REMOVE_INACTIVE);
  },
};
