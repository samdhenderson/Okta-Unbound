import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import RuleExpressionText from './RuleExpressionText';
import { NavigationProvider } from '../../contexts/NavigationContext';

const names: Record<string, string> = {
  '00gFAKEGROUP0001': 'Engineering — Platform',
  '00gFAKEGROUP0002': 'Contractors — EMEA',
};

const resolveGroupName = (groupId: string): string | undefined => names[groupId];

const navigateToGroup = fn();

const meta = {
  title: 'Shared/RuleExpressionText',
  component: RuleExpressionText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Rule-condition text with its group-id literals resolved to named badges, so ' +
          '`isMemberOfAnyGroup("00gFAKEGROUP0001")` reads as the group rather than an opaque ' +
          'id. It fetches nothing: a literal becomes a badge only when the host’s ' +
          '`resolveGroupName` returns a name for it, so a non-group literal prints as source.\n\n' +
          'The type treatment is fixed — the only axis a host picks is `tone`, and `className` ' +
          'takes layout and spacing only. Expression text is untrusted tenant data and is split ' +
          'into React text, never parsed into markup.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: navigateToGroup }}>
        <Story />
      </NavigationProvider>
    ),
  ],
  argTypes: {
    text: {
      description: "The condition text to render — a clause's reconstructed expression text.",
    },
    resolveGroupName: {
      description:
        'Names the group ids inside the text. Omitted, or returning `undefined`, the literal keeps its raw quoted form.',
    },
    tone: {
      description:
        'Reading role. `default` for the condition the surface is about; `subdued` for one printed under another it qualifies.',
    },
    className: {
      description:
        'Layout and spacing only — `min-w-0`, `flex-1`, a margin. Type and colour are not overridable.',
    },
  },
  args: {
    text: 'isMemberOfAnyGroup("00gFAKEGROUP0001")',
    resolveGroupName,
  },
} satisfies Meta<typeof RuleExpressionText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResolvedGroupId: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open group Engineering — Platform' }),
    );
    await expect(navigateToGroup).toHaveBeenCalledWith('00gFAKEGROUP0001');
  },
};

export const NoResolver: Story = {
  args: { resolveGroupName: undefined },
};

export const UnresolvedGroupId: Story = {
  args: { text: 'isMemberOfGroup("00gFAKEGROUP0009")' },
};

export const PartiallyResolved: Story = {
  args: {
    text: 'isMemberOfAnyGroup("00gFAKEGROUP0001", "00gFAKEGROUP0009", "00gFAKEGROUP0002")',
  },
};

export const NonGroupLiteralsUntouched: Story = {
  args: { text: 'user.department == "Engineering" && user.title != "Intern"' },
};

export const Unlinkable: Story = {
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{}}>
        <Story />
      </NavigationProvider>
    ),
  ],
};

export const LongExpression: Story = {
  args: {
    text: 'isMemberOfAnyGroup("00gFAKEGROUP0001") && !isMemberOfAnyGroup("00gFAKEGROUP0002") && String.stringContains(user.department, "Engineering-Platform-Infrastructure")',
  },
};

export const TonesInContext: Story = {
  render: (args) => (
    <div className="max-w-md space-y-2">
      <RuleExpressionText {...args} text='isMemberOfAnyGroup("00gFAKEGROUP0001")' />
      <div className="border-l-2 border-neutral-200 pl-3">
        <p className="text-xs font-medium text-neutral-600">Any one of these satisfies it:</p>
        <RuleExpressionText
          {...args}
          tone="subdued"
          text='isMemberOfAnyGroup("00gFAKEGROUP0002")'
        />
      </div>
    </div>
  ),
};
