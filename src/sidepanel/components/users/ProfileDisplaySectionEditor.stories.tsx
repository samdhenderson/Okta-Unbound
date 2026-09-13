import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileDisplaySectionEditor from './ProfileDisplaySectionEditor';
import ProfileDisplayAttributeEditRow from './ProfileDisplayAttributeEditRow';
import { fixtureAttribute } from './profileDisplayStoryFixture';

const rowHandlers = {
  isHidden: false,
  isLifted: false,
  ruleNames: [] as string[],
  onToggleHidden: fn(),
  onGripPointerDown: fn(),
  onLift: fn(),
  onStep: fn(),
  onDrop: fn(),
  onCancelLift: fn(),
};

const rows = [
  <ProfileDisplayAttributeEditRow
    key="firstName"
    attribute={fixtureAttribute('firstName', 'base', 'Ada', 'First name')}
    {...rowHandlers}
  />,
  <ProfileDisplayAttributeEditRow
    key="lastName"
    attribute={fixtureAttribute('lastName', 'base', 'Lovelace', 'Last name')}
    {...rowHandlers}
  />,
];

const meta = {
  title: 'Users/ProfileDisplaySectionEditor',
  component: ProfileDisplaySectionEditor,
  tags: ['autodocs'],
  parameters: {
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'A section grip, its name, its field count, its delete control, and the rows filed under it.\n\n' +
          '**The name is a button until it is clicked.** A column of text fields reads as a form to be filled in; a name that becomes a field only when you aim at it reads as a label you can correct. Enter and blur commit, Escape reverts.\n\n' +
          '**Deleting confirms inline and states the consequence** — "Its 2 attributes return to Uncategorized" — because an admin should not have to guess whether a delete takes attributes off the profile with it. It does not. Uncategorized itself renders fixed: no grip, no delete, and the editor pins it last.',
      },
    },
  },
  argTypes: {
    sectionKey: { description: "The section's stable key; `''` is Uncategorized." },
    name: { description: "The section's current name in the draft." },
    fieldCount: { description: "How many of the profile's attributes are filed under it." },
    isFixed: { description: 'True for Uncategorized: no grip, no delete.' },
    isLifted: { description: 'True while this section is the one lifted.' },
    isReorderDisabled: { description: 'Turns the grip off while a filter narrows the list.' },
    onRename: { description: 'Commit a new name for this section.' },
    onDelete: { description: 'Delete it, returning its attributes to Uncategorized.' },
    children: { description: 'The section rows, and any drop indicator between them.' },
  },
  args: {
    sectionKey: 'identity',
    name: 'Identity',
    fieldCount: 2,
    onRename: fn(),
    onDelete: fn(),
    onGripPointerDown: fn(),
    onLift: fn(),
    onStep: fn(),
    onDrop: fn(),
    onCancelLift: fn(),
    children: rows,
  },
} satisfies Meta<typeof ProfileDisplaySectionEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Uncategorized: Story = {
  args: { sectionKey: '', name: 'Uncategorized', isFixed: true },
};

export const Empty: Story = { args: { name: 'Contact & locale', fieldCount: 0, children: [] } };

export const Lifted: Story = { args: { isLifted: true } };

export const Disabled: Story = { args: { isReorderDisabled: true } };

export const RenamingASection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Rename Identity' }));

    const field = canvas.getByRole('textbox', { name: 'Rename Identity' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Who they are{Enter}');

    await expect(args.onRename).toHaveBeenCalledWith('Who they are');
  },
};

export const CancellingARename: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Rename Identity' }));

    const field = canvas.getByRole('textbox', { name: 'Rename Identity' });
    await userEvent.type(field, ' team{Escape}');

    await expect(args.onRename).not.toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: 'Rename Identity' })).toBeVisible();
  },
};

export const ConfirmingADelete: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete Identity' }));

    await expect(canvas.getByText(/return to Uncategorized/)).toBeVisible();
    await expect(args.onDelete).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: /^Delete$/ }));
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};
