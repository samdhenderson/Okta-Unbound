import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import VerbList from './VerbList';
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

const verb = (
  overrides: Partial<BasketVerb> & Pick<BasketVerb, 'id' | 'title' | 'needs'>,
): BasketVerb => ({
  label: overrides.id,
  path: 'write',
  cost: () => ({ requests: 1, writes: 1 }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
  ...overrides,
});

const NEEDS_RULES = verb({
  id: 'turn-off',
  label: 'Turn these rules off',
  title: 'Turn these rules off, so they stop assigning members',
  needs: ['rule'],
});

const NEEDS_TWO = verb({
  id: 'overlap',
  label: 'Members these groups share',
  title: 'Report which members these groups share',
  path: 'read',
  needs: ['group'],
  isAvailable: (basket) => basket.picked.filter((ref) => ref.kind === 'group').length >= 2,
  unavailableReason: 'Needs at least two groups — an overlap of one group is not a question.',
  cost: () => ({ requests: 1, writes: 0 }),
});

const COMBO = verb({
  id: 'add-users',
  label: 'Add to these groups',
  title: 'Add these users to these groups',
  needs: ['user', 'group'],
  cost: (basket) => {
    const users = basket.picked.filter((ref) => ref.kind === 'user').length;
    const groups = basket.picked.filter((ref) => ref.kind === 'group').length;
    return { requests: users * groups, writes: users * groups };
  },
});

const meta = {
  title: 'Selection/panes/VerbList',
  component: VerbList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One row per verb, naming what it acts on and what it costs. The panes’ own stories ' +
          'cover the two headline absences; this covers what only a list can show — several verbs ' +
          'held back for **different** reasons at once, and a combination verb appearing the ' +
          'moment its second partition fills.',
      },
    },
  },
  args: {
    onRun: fn(),
    emptyIcon: 'bolt',
    emptyTitle: 'No actions yet',
    emptyDescription: 'None are wired yet.',
  },
} satisfies Meta<typeof VerbList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BothReasonsAtOnce: Story = {
  args: (() => {
    const basket = basketOf(['group']);
    return { verbs: [NEEDS_RULES, NEEDS_TWO], basket, counts: countsOf(basket) };
  })(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Tick some rules and these appear\./)).toBeInTheDocument();
    await expect(canvas.getByText(/Needs at least two groups/)).toBeInTheDocument();
  },
};

export const ComboWaitsForItsSecondPartition: Story = {
  args: (() => {
    const basket = basketOf(['user']);
    return { verbs: [COMBO], basket, counts: countsOf(basket) };
  })(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Tick some groups and these appear\./)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const ComboAppearsAndPricesItself: Story = {
  args: (() => {
    const basket = basketOf(['user', 'user', 'user', 'group', 'group']);
    return { verbs: [COMBO], basket, counts: countsOf(basket) };
  })(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Add these users to these groups')).toBeInTheDocument();
    await expect(
      canvas.getByText('Takes 6 requests. Changes 6 entities in Okta.'),
    ).toBeInTheDocument();
  },
};
