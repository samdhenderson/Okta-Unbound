import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ComparisonAttributesToolbar from './ComparisonAttributesToolbar';
import type { ComparisonEditSide } from '../../../hooks/useComparisonProfileEdit';

const side = (
  key: 'context' | 'compared',
  userName: string,
  over: Partial<ComparisonEditSide> = {},
): ComparisonEditSide => ({
  key,
  userName,
  cells: {},
  isEditing: false,
  isSaving: false,
  hasChanges: false,
  hasInvalid: false,
  canEdit: true,
  begin: fn(),
  cancel: fn(),
  requestSave: fn(),
  ...over,
});

const CONTEXT = side('context', 'Ada Context');
const COMPARED = side('compared', 'Bo Compared');

const meta = {
  title: 'Users/Comparison/ComparisonAttributesToolbar',
  component: ComparisonAttributesToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Everything above the comparison's attribute list: the three filter pills, the search " +
          'field, the hidden-differences disclosure, and — one per user — the Edit / Cancel / ' +
          'Save controls.\n\n' +
          'Both edit affordances name their user, because two profiles are on screen and an ' +
          'unqualified "Edit" would write to whichever one the admin was not thinking about. A ' +
          'column whose host cannot publish a save (`canEdit: false`) shows nothing at all ' +
          'rather than a disabled control.',
      },
    },
  },
  args: {
    filter: 'differences',
    onFilterChange: fn(),
    differenceCount: 3,
    sharedCount: 8,
    totalCount: 11,
    query: '',
    onQueryChange: fn(),
    hiddenDifferences: 1,
    revealHidden: false,
    onToggleHidden: fn(),
  },
  argTypes: {
    filter: { description: 'The active filter pill.' },
    onFilterChange: { description: 'Called with the pill the reader chose.' },
    differenceCount: { description: 'How many listed rows differ — the Differences pill count.' },
    sharedCount: { description: 'How many listed rows agree — the Shared pill count.' },
    totalCount: { description: 'How many rows are listed in total — the All pill count.' },
    query: { description: 'The current search term.' },
    onQueryChange: { description: 'Called with the new search term.' },
    hiddenDifferences: {
      description:
        'How many differing attributes the display config hides. `0` renders no disclosure line at all.',
    },
    revealHidden: { description: 'Whether the hidden rows are currently revealed.' },
    onToggleHidden: { description: 'Toggles the reveal.' },
    contextEdit: {
      description: "The left column's editor. Absent renders no editing controls for it.",
    },
    comparedEdit: {
      description: "The right column's editor. Absent renders no editing controls for it.",
    },
  },
} satisfies Meta<typeof ComparisonAttributesToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BothEditable: Story = {
  args: { contextEdit: CONTEXT, comparedEdit: COMPARED },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Edit Ada Context' })).toBeInTheDocument(),
    );
    expect(canvas.getByRole('button', { name: 'Edit Bo Compared' })).toBeInTheDocument();
  },
};

export const ContextColumnReadOnly: Story = {
  args: { contextEdit: side('context', 'Ada Context', { canEdit: false }), comparedEdit: COMPARED },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Edit Bo Compared' })).toBeInTheDocument(),
    );
    expect(canvas.queryByRole('button', { name: 'Edit Ada Context' })).not.toBeInTheDocument();
  },
};

export const Editing: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', { isEditing: true, hasChanges: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = await canvas.findByRole('button', { name: 'Save changes to Bo Compared' });
    expect(save).toBeEnabled();
    await userEvent.click(save);
  },
};

export const EditingWithNoChanges: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', { isEditing: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = await canvas.findByRole('button', { name: 'Save changes to Bo Compared' });
    expect(save).toBeDisabled();
  },
};

export const InvalidDraft: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      hasChanges: true,
      hasInvalid: true,
    }),
  },
};

export const Saving: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      hasChanges: true,
      isSaving: true,
    }),
  },
};

export const ErrorState: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      hasChanges: true,
      message: {
        type: 'danger',
        text: 'Okta rejected the update: department is not a valid value.',
      },
    }),
  },
};

export const UnconfirmedOutcome: Story = {
  args: {
    contextEdit: CONTEXT,
    comparedEdit: side('compared', 'Bo Compared', {
      message: {
        type: 'warning',
        text: 'This panel could not confirm whether the change to Bo Compared was saved. Reload the comparison to check before editing again.',
      },
    }),
  },
};

export const NothingHidden: Story = {
  args: { hiddenDifferences: 0, contextEdit: CONTEXT, comparedEdit: COMPARED },
};

export const HiddenRevealed: Story = {
  args: { revealHidden: true, hiddenDifferences: 2 },
};

export const CompactPanel: Story = {
  args: {
    contextEdit: side('context', 'Ada Context', { isEditing: true, hasChanges: true }),
    comparedEdit: COMPARED,
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
