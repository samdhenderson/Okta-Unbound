import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileDisplayEditor from './ProfileDisplayEditor';
import { fixtureAttributes, fixtureConfig } from './profileDisplayStoryFixture';

const meta = {
  title: 'Users/ProfileDisplayEditor',
  component: ProfileDisplayEditor,
  tags: ['autodocs'],
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The Profile pane while an admin is arranging it: display options, every section with ' +
          'its attributes, the add-section form, and Reset / Cancel / Done. Nothing is written ' +
          'until Done — `Reset to default` acts on the draft too, so Cancel still undoes it.\n\n' +
          'Reordering works from the same handles with a pointer or the keyboard. A non-empty ' +
          '`filter` disables the grips: a drop into a partly-rendered list would compute its ' +
          'position against rows that are not all there.',
      },
    },
  },
  argTypes: {
    attributes: { description: 'Every attribute on this profile, empty ones included.' },
    config: { description: 'The reconciled configuration the draft starts from.' },
    onCommit: { description: 'Done — receives the whole edited configuration.' },
    onCancel: { description: 'Cancel — the draft is discarded and nothing is written.' },
    ruleReads: {
      description:
        'Attribute Okta name → the rules that read it. Absent means no rule was consulted, ' +
        'and then no row carries a mark.',
    },
    filter: { description: "The pane's live free-text filter; non-empty disables reordering." },
  },
  args: {
    attributes: fixtureAttributes,
    config: fixtureConfig,
    onCommit: fn(),
    onCancel: fn(),
    ruleReads: { department: ['Engineering auto-join'] },
  },
} satisfies Meta<typeof ProfileDisplayEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHiddenAttribute: Story = {
  args: { config: { ...fixtureConfig, hidden: { ...fixtureConfig.hidden, lastName: true } } },
};

export const RuleReadsNotLoaded: Story = {
  args: { ruleReads: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('rules')).toBeNull();
  },
};

export const Filtered: Story = { args: { filter: 'name' } };

export const Empty: Story = {
  args: { config: { ...fixtureConfig, categories: [], assign: {}, attrOrder: [] } },
};

export const AddingASection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('New section name'), 'Employment');
    await userEvent.click(canvas.getByRole('button', { name: 'Add section' }));
    await expect(canvas.getByRole('button', { name: 'Rename Employment' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(args.onCommit).toHaveBeenCalledTimes(1);
    const committed = (args.onCommit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(committed.categories.map((c: { name: string }) => c.name)).toContain('Employment');
  },
};

export const Cancelling: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onCommit).not.toHaveBeenCalled();
  },
};
