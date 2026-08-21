import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import EntityLink from './EntityLink';
import { NavigationProvider } from '../../contexts/NavigationContext';

const handlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const meta = {
  title: 'Shared/EntityLink',
  component: EntityLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One component for every "that rule / that group / that user / that app" reference, so a cross-reference looks and behaves the same wherever it appears.\n\n' +
          'The type glyph and trailing chevron are the point: `RuleCard` currently renders its target groups as pills identical to the neighbouring *attribute* pills, which do nothing when clicked. The chevron says "this goes somewhere" — and appears only when that is true.\n\n' +
          '**Not every name can be linked.** A rule condition\'s `isMemberOfGroupName("sales")` carries a name and no id, and one name can match an Okta group *and* a Workday group. `PushGroupMapping.targetGroupName` names a group inside the downstream app, which is not an Okta entity at all. Omit `id` for those and the name renders as plain text with a tooltip saying why, rather than as a control that cannot work.\n\n' +
          'The same fallback covers an entity kind the current build cannot reach, so a link is never dead.\n\n' +
          '**`copyId` adds the third affordance.** Set it and the chip gains a *sibling* ghost copy control for the raw Okta id, so one import gives a call site the resolved name badge, copy-id, and open-in-detail together. It is a sibling rather than a child because the chip is a `<button>`. It appears only when an `id` is present — nothing to copy, no control — but it is independent of navigability: an id this build cannot open is still an id worth copying.\n\n' +
          'Related internals: `sidepanel/contexts/NavigationContext`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={handlers}>
        <Story />
      </NavigationProvider>
    ),
  ],
  argTypes: {
    type: {
      description: 'Which kind of entity this is — picks the glyph and the destination tab.',
    },
    id: {
      description:
        "The entity's Okta id. **Omit when the reference carries only a name**; the chip then renders as plain text.",
    },
    name: { description: 'The visible name. Truncates rather than overflowing.' },
    unlinkableReason: {
      description:
        'Why this reference cannot be opened, shown as the tooltip on the plain-text fallback. Defaults to a generic "no id available" sentence.',
    },
    copyId: {
      description:
        'Show a ghost copy-to-clipboard control for the raw `id` beside the chip. Ignored when no `id` is given.',
    },
    copyIdLabel: {
      description:
        'Accessible name for that copy control. Defaults to “Copy <type> id for <name>”, since several can share a screen.',
    },
    className: { description: 'Extra classes merged after the chip classes.' },
    testId: { description: 'Optional test handle.' },
  },
  args: {
    type: 'rule',
    id: '0prFAKERULE00001',
    name: 'Sales territory assignment',
  },
} satisfies Meta<typeof EntityLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EveryType: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <EntityLink type="rule" id="0prFAKERULE00001" name="Sales territory assignment" />
      <EntityLink type="group" id="00gFAKEGROUP0001" name="Sales — West" />
      <EntityLink type="user" id="00uFAKEUSER00001" name="Jane Doe" />
      <EntityLink type="app" id="0oaFAKEAPP000001" name="Salesforce" />
      <EntityLink type="policy" id="00pFAKEPOLICY001" name="Contractor MFA" />
    </div>
  ),
};

export const NotLinkable: Story = {
  args: {
    type: 'group',
    id: undefined,
    name: 'sales',
    unlinkableReason:
      'This rule matches the group by name, and a name can match groups from more than one source, so there is no single group to open.',
  },
};

export const LinkableVersusNot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <EntityLink type="group" id="00gFAKEGROUP0001" name="Sales — West" />
      <EntityLink
        type="group"
        name="sales"
        unlinkableReason="Matched by name only — no group id is available."
      />
    </div>
  ),
};

export const Truncates: Story = {
  render: () => (
    <div className="w-48 border border-neutral-200 p-2">
      <EntityLink
        type="rule"
        id="0prFAKERULE00002"
        name="Contractor onboarding — Workday sourced, EMEA region only"
      />
    </div>
  ),
};

export const NoNavigationAvailable: Story = {
  decorators: [(Story) => <Story />],
};

export const WithCopyId: Story = {
  args: {
    type: 'group',
    id: '00gFAKEGROUP0001',
    name: 'Sales — West',
    copyId: true,
  },
};

export const CopyIdEveryType: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <EntityLink type="rule" id="0prFAKERULE00001" name="Sales territory assignment" copyId />
      <EntityLink type="group" id="00gFAKEGROUP0001" name="Sales — West" copyId />
      <EntityLink
        type="user"
        id="00uFAKEUSER00001"
        name="Jane Doe"
        copyId
        copyIdLabel="Copy Jane Doe's user id"
      />
    </div>
  ),
};

export const CopyIdWithoutAnId: Story = {
  args: {
    type: 'group',
    id: undefined,
    name: 'sales',
    copyId: true,
    unlinkableReason: 'Matched by name only — no group id is available.',
  },
};

export const CopyIdWhenNotNavigable: Story = {
  render: () => (
    <NavigationProvider handlers={{}}>
      <EntityLink type="policy" id="00pFAKEPOLICY001" name="Contractor MFA" copyId />
    </NavigationProvider>
  ),
};
