import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
          'One component for every "that rule / that group / that user / that app" reference, ' +
          'so a cross-reference looks and behaves the same wherever it appears. The chip opens ' +
          'the entity on its own tab; `copyId` adds a sibling control for the raw Okta id.\n\n' +
          'A chip is a proven answer. Omit `id` (a name with no id) or `name` (an id whose name ' +
          'never loaded) and the missing half renders as muted italic text stating the absence — ' +
          'never chipped, never a control that cannot work. An entity kind this build cannot ' +
          'reach degrades the same way, so a link is never dead.',
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
        'Accessible name for the copy control. Defaults to “Copy <type> id for <name> (<id>)”.',
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

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    handlers.rule.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open rule Sales territory assignment' }),
    );
    await expect(handlers.rule).toHaveBeenCalledWith(args.id);
  },
};

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
  render: (args) => (
    <NavigationProvider handlers={{}}>
      <EntityLink {...args} />
    </NavigationProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sales territory assignment')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /open rule/i })).not.toBeInTheDocument();
  },
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
