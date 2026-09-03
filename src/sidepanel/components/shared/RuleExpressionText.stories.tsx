import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RuleExpressionText from './RuleExpressionText';
import { NavigationProvider } from '../../contexts/NavigationContext';

const names: Record<string, string> = {
  '00gFAKEGROUP0001': 'Engineering — Platform',
  '00gFAKEGROUP0002': 'Contractors — EMEA',
};

const resolveGroupName = (groupId: string): string | undefined => names[groupId];

const meta = {
  title: 'Shared/RuleExpressionText',
  component: RuleExpressionText,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Rule-condition text with its group-id literals resolved to named badges, so `isMemberOfAnyGroup("00gFAKEGROUP0001")` reads as the group rather than as an opaque id.\n\n' +
          'It resolves **nothing it was not already given**: the only names available are the ones the host already holds, through the same `resolveGroupName` shape `ClauseGroupList` takes. There is no fetch here, and an id with no known name renders exactly as it did before — quoted, in mono, inside the expression.\n\n' +
          'A literal becomes a badge only when it resolves to a name. The tokeniser never guesses which quoted literal is a group id; it offers each one to the resolver and badges what comes back named, which is why `user.department == "Engineering"` still prints as itself.\n\n' +
          'The **type treatment is fixed** — mono, `text-xs`, wrapping. Every host used to restate that recipe through `className`, which is a recipe free to drift; the only axis a host picks is `tone`, and `className` takes layout and spacing only.\n\n' +
          'Expression text and group names are untrusted tenant data. The text is **split**, never parsed into markup — every piece is React text and every badge takes its id and name as props.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={{ group: fn() }}>
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

export const ResolvedGroupId: Story = {};

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
