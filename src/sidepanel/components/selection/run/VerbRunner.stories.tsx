import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import VerbRunner from './VerbRunner';
import type { VerbRun } from './useVerbRun';
import { RUN_WRITE_CAP, type BasketVerb } from '../../../selection/verbs/types';
import type { SelectionBasket } from '../../../selection/selectionStore';

const BASKET: SelectionBasket = {
  picked: [
    { kind: 'group', id: '00gFAKE0001', name: 'Payments Team', pickedAt: 1_700_000_000_000 },
    { kind: 'group', id: '00gFAKE0002', name: 'Contractors', pickedAt: 1_700_000_000_001 },
  ],
};

const CLEANUP: BasketVerb = {
  id: 'remove-inactive-members',
  label: 'Remove inactive members',
  title: 'Remove deactivated, suspended and locked-out members from these groups',
  path: 'write',
  needs: ['group'],
  cost: () => ({ requests: 0, walks: [{ count: 2, kind: 'membership' as const }], writes: 0 }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
};

const REPORT: BasketVerb = {
  id: 'group-overlap',
  label: 'Members these groups share',
  title: 'Report which members these groups share',
  path: 'read',
  needs: ['group'],
  cost: () => ({ requests: 2, writes: 0 }),
  run: async () => ({ status: 'done', summary: 'Done.' }),
};

const runAt = (overrides: Partial<VerbRun>): VerbRun => ({
  verb: CLEANUP,
  stage: 'confirm',
  preflight: null,
  progress: '',
  outcome: null,
  error: null,
  fields: [],
  values: {},
  setValue: fn(),
  isComposed: true,
  isRefreshing: false,
  submitFields: fn(),
  start: fn(),
  confirm: fn(),
  close: fn(),
  ...overrides,
});

const meta = {
  title: 'Selection/run/VerbRunner',
  component: VerbRunner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Measure → confirm → run → report, in a shared `Modal`. For a `write` verb the confirm ' +
          'body is the preflight’s own measured lines above the exact cost of the run those lines ' +
          'authorise — a confirm never quotes a projection.\n\n' +
          'Past the write cap the run refuses **whole**: it never truncates to fit, because a ' +
          'truncated run would leave Okta holding a change nobody chose while every count on ' +
          'screen still read as complete. The control that would proceed is omitted, not disabled.',
      },
    },
  },
  args: { basket: BASKET, run: runAt({}) },
} satisfies Meta<typeof VerbRunner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { run: runAt({ stage: 'idle', verb: null }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const Measuring: Story = {
  args: { run: runAt({ stage: 'measuring', progress: 'Counting inactive members (1/2)' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: 'Measuring first' }));
    await expect(dialog.getByText('Counting inactive members (1/2)')).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: CLEANUP.label })).not.toBeInTheDocument();
  },
};

export const ConfirmAWrite: Story = {
  args: {
    run: runAt({
      preflight: {
        cost: { requests: 14, walks: [{ count: 2, kind: 'membership' as const }], writes: 12 },
        items: 12,
        lines: [
          'Payments Team — 9 of 340 members are deactivated, suspended or locked out',
          'Contractors — 3 of 28 members are deactivated, suspended or locked out',
        ],
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));

    await expect(dialog.getByText(/Payments Team — 9 of 340/)).toBeInTheDocument();
    await expect(
      dialog.getByText('Takes 14 requests and 2 membership walks. Changes 12 entities in Okta.'),
    ).toBeInTheDocument();
    await expect(dialog.getByText(/cannot be undone from here/)).toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: CLEANUP.label })).toBeInTheDocument();
  },
};

export const ConfirmARead: Story = {
  args: { run: runAt({ verb: REPORT }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: REPORT.title }));
    await expect(dialog.getByText('Takes 2 requests.')).toBeInTheDocument();
    await expect(dialog.queryByText(/cannot be undone/)).not.toBeInTheDocument();
  },
};

export const RefusedPastTheCap: Story = {
  args: {
    run: runAt({
      preflight: {
        cost: { requests: 1200, writes: 1200 },
        items: 1200,
        lines: [],
        refusal: {
          code: 'over-write-cap',
          message: `This would change 1,200 entities, past the ${RUN_WRITE_CAP.toLocaleString()} one run may change. Nothing has been changed. Narrow the selection and run it again.`,
        },
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));
    await expect(dialog.getByText(/past the 1,000 one run may change/)).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: CLEANUP.label })).not.toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  },
};

export const NothingToDo: Story = {
  args: {
    run: runAt({
      preflight: { cost: { requests: 0, writes: 0 }, items: 0, lines: [] },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));
    await expect(dialog.getByText(/Running it would change nothing/)).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: CLEANUP.label })).not.toBeInTheDocument();
  },
};

export const Running: Story = {
  args: { run: runAt({ stage: 'running', progress: 'Cleaning Payments Team (1/2)' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: 'Running' }));
    await expect(dialog.getByText(/does not stop the run/)).toBeInTheDocument();
    await expect(dialog.getByText('Cleaning Payments Team (1/2)')).toBeInTheDocument();
  },
};

export const Results: Story = {
  args: {
    run: runAt({
      stage: 'results',
      outcome: {
        status: 'done',
        summary: 'Removed 12 members from 2 groups.',
        detail: {
          filenameStem: 'inactive-members-removed',
          headers: ['Group', 'Outcome'],
          rows: [
            ['Payments Team', 'success'],
            ['Contractors', 'success'],
          ],
        },
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: 'What happened' }));
    await expect(dialog.getByText('Removed 12 members from 2 groups.')).toBeInTheDocument();
    await expect(dialog.getByText('2 rows are available as a CSV.')).toBeInTheDocument();
    await expect(dialog.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
  },
};

export const Failed: Story = {
  args: { run: runAt({ stage: 'results', error: 'The org refused the request.' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: 'The run stopped' }));
    await expect(dialog.getByText('The org refused the request.')).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: 'Download CSV' })).not.toBeInTheDocument();
  },
};

export const ComposeWithheldUntilAnswered: Story = {
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: false,
      fields: [
        {
          id: 'attribute',
          label: 'Attribute',
          options: [
            { value: 'department', label: 'Department' },
            { value: 'title', label: 'Title' },
          ],
        },
        { id: 'value', label: 'New value', help: 'Written to every ticked user.' },
      ],
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));

    await expect(dialog.getByRole('combobox', { name: 'Attribute' })).toBeInTheDocument();
    await expect(dialog.getByRole('textbox', { name: 'New value' })).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();

    await userEvent.selectOptions(dialog.getByRole('combobox', { name: 'Attribute' }), 'title');
    await expect(args.run.setValue).toHaveBeenCalledWith('attribute', 'title');
  },
};

export const ComposeRebuildingTheValueQuestion: Story = {
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: false,
      isRefreshing: true,
      fields: [
        {
          id: 'attribute',
          label: 'Attribute',
          refreshesFields: true,
          options: [
            { value: 'department', label: 'Department' },
            { value: 'headcount', label: 'Headcount' },
          ],
        },
        { id: 'value', label: 'New Headcount', control: 'number', placeholder: 'A number' },
      ],
      values: { attribute: 'headcount' },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));

    await expect(dialog.getByRole('spinbutton', { name: 'New Headcount' })).toBeInTheDocument();
    await expect(dialog.getByText('Reading what that attribute accepts…')).toBeInTheDocument();
    await expect(dialog.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  },
};

export const ComposeWithSpread: Story = {
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: true,
      fields: [
        {
          id: 'attribute',
          label: 'Attribute',
          refreshesFields: true,
          optionLayout: 'list',
          help: 'Only attributes this org lets the app write are listed.',
          options: [
            {
              value: 'department',
              label: 'Department',
              summary: '3 values · 1 empty',
              distribution: [
                { value: 'Marketing', label: 'Marketing', count: 7, pct: 58.3 },
                { value: 'Sales', label: 'Sales', count: 4, pct: 33.3 },
                { value: '__none__', label: '(none)', count: 1, pct: 8.3 },
              ],
            },
            {
              value: 'costCenter',
              label: 'Cost centre',
              summary: '1 value · 10 empty',
              distribution: [
                { value: 'CC-100', label: 'CC-100', count: 2, pct: 16.7 },
                { value: '__none__', label: '(none)', count: 10, pct: 83.3 },
              ],
            },
          ],
        },
        {
          id: 'value',
          label: 'New Department',
          placeholder: 'The value every ticked user will hold',
          distribution: [
            { value: 'Marketing', label: 'Marketing', count: 7, pct: 58.3 },
            { value: 'Sales', label: 'Sales', count: 4, pct: 33.3 },
            { value: '__none__', label: '(none)', count: 1, pct: 8.3 },
          ],
        },
      ],
      values: { attribute: 'department', value: 'Advertising' },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', { name: CLEANUP.title }));

    const chosen = dialog.getByRole('radio', { name: /Department/ });
    await expect(chosen).toBeChecked();
    await expect(dialog.getByRole('radio', { name: /Cost centre/ })).not.toBeChecked();

    await expect(dialog.getByText('3 values · 1 empty')).toBeInTheDocument();
    await expect(dialog.getAllByText('Marketing').length).toBeGreaterThan(0);

    for (const row of dialog.getAllByText('(none)')) {
      await expect(row.closest('button')).toBeDisabled();
    }

    await expect(dialog.getByRole('textbox', { name: 'New Department' })).toHaveValue(
      'Advertising',
    );
    await expect(dialog.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  },
};
