import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import CreateFeedingRuleModal from './CreateFeedingRuleModal';

const meta = {
  title: 'Groups/CreateFeedingRuleModal',
  component: CreateFeedingRuleModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The confirm step for the Group Detail rung's *Create feeding rule* verb, which sits behind **More** because a rule grants memberships as it matches and deleting it later leaves every one of them in place.\n\n" +
          'Fully controlled — the draft, its checks and the write live in `useCreateFeedingRule`. Three things are always said before the confirm: the consequence, the mitigation (Okta creates the rule inactive), and the one thing that is not predicted — how many people the rule would add, withheld with its reason rather than invented.',
      },
    },
  },
  args: {
    isOpen: true,
    groupName: 'Engineering',
    name: '',
    onNameChange: fn(),
    nameError: null,
    expression: '',
    onExpressionChange: fn(),
    expressionNotice: null,
    canSubmit: false,
    isCreating: false,
    error: null,
    createdRuleName: null,
    createdRuleId: null,
    onClose: fn(),
    onConfirm: fn(),
    onNavigateToRule: fn(),
  },
  argTypes: {
    isOpen: { description: 'Whether the dialog is open.' },
    groupName: { description: 'The group the drafted rule assigns users into.' },
    name: { description: 'Controlled rule-name draft.' },
    onNameChange: { description: 'Called with the new rule name on each keystroke.' },
    nameError: { description: 'Why the drafted name is unacceptable (length), or null.' },
    expression: { description: 'Controlled match-expression draft.' },
    onExpressionChange: { description: 'Called with the new expression on each keystroke.' },
    expressionNotice: {
      description: 'Non-blocking notice about an expression this panel could not parse, or null.',
    },
    canSubmit: { description: 'Whether the confirm button may fire.' },
    isCreating: { description: 'True while the create request is in flight.' },
    error: { description: 'Message from a failed create, or null.' },
    createdRuleName: {
      description: 'The created rule’s name once the write landed — switches to the success step.',
    },
    createdRuleId: { description: 'The created rule’s id once the write landed, or null.' },
    onClose: { description: 'Close the dialog (Cancel, Done, Escape, overlay, header close).' },
    onConfirm: { description: 'Run the create.' },
    onNavigateToRule: {
      description: 'Deep-links the created rule in the Rules tab; omitted renders no jump control.',
    },
  },
} satisfies Meta<typeof CreateFeedingRuleModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('button', { name: 'Create rule' })).toBeDisabled();
    await expect(body.getByText(/does not take those memberships back/)).toBeVisible();
  },
};

export const Ready: Story = {
  args: {
    name: 'Engineering intake',
    expression: 'user.department == "Engineering"',
    canSubmit: true,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('button', { name: 'Create rule' })).toBeEnabled();
    await expect(body.getByText(/not predicted here/)).toBeVisible();
  },
};

export const UnparsedExpression: Story = {
  args: {
    name: 'Contractor intake',
    expression: 'user.employeeType ?? ',
    expressionNotice:
      'The condition could not be parsed here. Okta is the authority on its own expression language — this panel reads a subset of it, so the rule may still be valid.',
    canSubmit: true,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('button', { name: 'Create rule' })).toBeEnabled();
  },
};

export const NameTooLong: Story = {
  args: {
    name: 'Engineering intake for everyone in the whole organisation',
    expression: 'user.department == "Engineering"',
    nameError: 'Okta allows 50 characters; this is 57.',
  },
};

export const Creating: Story = {
  args: {
    name: 'Engineering intake',
    expression: 'user.department == "Engineering"',
    isCreating: true,
  },
};

export const ErrorState: Story = {
  args: {
    name: 'Engineering intake',
    expression: 'user.department == "Engineering"',
    canSubmit: true,
    error: 'A rule with this name already exists.',
  },
};

const DraftHarness = (): ReactElement => {
  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  return (
    <CreateFeedingRuleModal
      isOpen
      groupName="Engineering"
      name={name}
      onNameChange={setName}
      nameError={name.length > 50 ? `Okta allows 50 characters; this is ${name.length}.` : null}
      expression={expression}
      onExpressionChange={setExpression}
      expressionNotice={null}
      canSubmit={name.trim() !== '' && expression.trim() !== '' && name.length <= 50}
      isCreating={false}
      error={null}
      createdRuleName={null}
      createdRuleId={null}
      onClose={fn()}
      onConfirm={fn()}
      onNavigateToRule={fn()}
    />
  );
};

export const Drafting: Story = {
  render: () => <DraftHarness />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const confirm = body.getByRole('button', { name: 'Create rule' });
    await expect(confirm).toBeDisabled();

    await userEvent.type(body.getByPlaceholderText('Engineering intake'), 'Engineering intake');
    await expect(confirm).toBeDisabled();

    await userEvent.type(
      body.getByPlaceholderText('user.department == "Engineering"'),
      'user.department == "Eng"',
    );
    await expect(confirm).toBeEnabled();
  },
};

export const Created: Story = {
  args: {
    createdRuleName: 'Engineering intake',
    createdRuleId: '0prFAKE000000000001',
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByText(/Nobody has been added/)).toBeVisible();
    await expect(body.getByRole('button', { name: /Open in Rules tab/ })).toBeVisible();
  },
};

export const CreatedWithoutNavigation: Story = {
  args: {
    createdRuleName: 'Engineering intake',
    createdRuleId: '0prFAKE000000000001',
    onNavigateToRule: undefined,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.queryByRole('button', { name: /Open in Rules tab/ })).toBeNull();
    await expect(body.getByRole('button', { name: 'Done' })).toBeVisible();
  },
};
