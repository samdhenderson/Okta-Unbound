import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ProfileDisplayAttributeEditRow from './ProfileDisplayAttributeEditRow';
import { fixtureAttribute } from './profileDisplayStoryFixture';

const meta = {
  title: 'Users/ProfileDisplayAttributeEditRow',
  component: ProfileDisplayAttributeEditRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Grip, label, Okta name, a truncated value preview, and the eye that hides the attribute from the pane.\n\n' +
          'A hidden attribute keeps its row here, struck through and still showing its value, so it can be restored. An attribute with no value on this user says so in italics rather than rendering a blank line.',
      },
    },
  },
  argTypes: {
    attribute: { description: 'The attribute this row describes.' },
    isHidden: { description: 'Whether the attribute is hidden from the profile pane.' },
    isLifted: { description: 'True while this row is the one lifted.' },
    ruleNames: { description: 'Rules that read this attribute; empty means no mark.' },
    isReorderDisabled: { description: 'Turns the grip off while a filter narrows the list.' },
    gripDescribedBy: { description: '`id` of the grip keyboard-contract description.' },
    onToggleHidden: { description: "Flip the attribute's visibility." },
    onGripPointerDown: { description: 'Start a pointer drag from the grip.' },
    onLift: { description: 'Lift this row with the keyboard.' },
    onStep: { description: 'Move the lifted row one step.' },
    onDrop: { description: 'Drop the lifted row.' },
    onCancelLift: { description: 'Abandon the lift.' },
  },
  args: {
    attribute: fixtureAttribute('department', 'custom', 'Engineering', 'Department'),
    isHidden: false,
    isLifted: false,
    ruleNames: [],
    onToggleHidden: fn(),
    onGripPointerDown: fn(),
    onLift: fn(),
    onStep: fn(),
    onDrop: fn(),
    onCancelLift: fn(),
  },
} satisfies Meta<typeof ProfileDisplayAttributeEditRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hidden: Story = { args: { isHidden: true } };

export const ReadByRule: Story = { args: { ruleNames: ['Engineering auto-join'] } };

export const EmptyValue: Story = {
  args: { attribute: fixtureAttribute('department', 'custom', '', 'Department') },
};

export const Lifted: Story = { args: { isLifted: true } };
