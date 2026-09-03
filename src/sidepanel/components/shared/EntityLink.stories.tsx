import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
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
          '**Known only by an id.** The mirror image: an id is in hand and no name is. Omit `name` and the reference renders as a stated absence ("Group name not loaded") beside the raw id in the identifier register — and still opens the entity when the id is navigable, because a valid id is a valid destination whether or not this view learned its name. That last part is what three hand-rolled local copies of this state could not do (I-017).\n\n' +
          "Its chrome follows the house non-answer convention `AppScopeIndicator` and `GroupSourceIndicator` state explicitly: **a chip is a proven answer, a non-answer is muted italic text and is never chipped**. What survives from the pill one of those copies wore is the glyph and the chevron, which say *what kind* and *this goes somewhere* — information rather than weight. A reference whose entity is *gone* is a different thing: that is a proven answer, and it keeps its warning chip (`RuleDetailView`'s `MissingGroupChip`).\n\n" +
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
    name: {
      description:
        'The visible name. Truncates rather than overflowing. **Omit it** when this view loaded only the id — never pass the id here.',
    },
    unresolvedLabel: {
      description:
        'The words shown in place of a missing name, in the id-only mode. Defaults to “<Type> name not loaded”.',
    },
    unresolvedReason: {
      description: 'Tooltip on that stated absence — why the name is missing here.',
    },
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
        'Accessible name for that copy control. Defaults to “Copy <type> id for <name> (<id>)”, since several can share a screen and the id is the one part guaranteed unique even when two entities share a name (I-009).',
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

export const DuplicateNamesStayDistinguishable: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <EntityLink type="group" id="00gFAKEGROUP0001" name="Engineering" copyId />
      <EntityLink type="group" id="00gFAKEGROUP0002" name="Engineering" copyId />
    </div>
  ),
};

export const KnownOnlyByAnId: Story = {
  args: { type: 'group', id: '00gFAKEGROUP0001', name: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Group name not loaded — open group 00gFAKEGROUP0001' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Copy group id 00gFAKEGROUP0001' }),
    ).toBeInTheDocument();
  },
};

export const ResolvedAndUnresolvedInOneList: Story = {
  render: () => (
    <ul className="flex w-72 flex-col gap-2">
      <li className="flex min-w-0">
        <EntityLink type="group" id="00gFAKEGROUP0001" name="Sales — West" copyId />
      </li>
      <li className="flex min-w-0">
        <EntityLink type="group" id="00gFAKEGROUP0002" />
      </li>
      <li className="flex min-w-0">
        <EntityLink type="group" id="00gFAKEGROUP0003" name="Sales — EMEA" copyId />
      </li>
      <li className="flex min-w-0">
        <EntityLink type="group" id="00gFAKEGROUP0004" />
      </li>
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Open group Sales — West' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Group name not loaded — open group 00gFAKEGROUP0002' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Group name not loaded — open group 00gFAKEGROUP0004' }),
    ).toBeInTheDocument();
  },
};

export const KnownOnlyByAnIdNotNavigable: Story = {
  render: () => (
    <NavigationProvider handlers={{}}>
      <EntityLink type="app" id="0oaFAKEAPP000001" />
    </NavigationProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('App name not loaded')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /open app/i })).not.toBeInTheDocument();
  },
};

export const UnresolvedWordingOverridden: Story = {
  args: {
    type: 'app',
    id: '0oaFAKEAPP000002',
    name: undefined,
    unresolvedLabel: 'Name not returned by Okta',
    unresolvedReason: 'Okta returned no name for this application, so only its id is known here.',
    copyIdLabel: 'Copy application id 0oaFAKEAPP000002',
  },
};

export const KnownOnlyByAnIdEveryType: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <EntityLink type="rule" id="0prFAKERULE00001" />
      <EntityLink type="group" id="00gFAKEGROUP0001" />
      <EntityLink type="user" id="00uFAKEUSER00001" />
      <EntityLink type="app" id="0oaFAKEAPP000001" />
      <EntityLink type="policy" id="00pFAKEPOLICY001" />
    </div>
  ),
};
