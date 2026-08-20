import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import UserProfilePane from './UserProfilePane';
import type { ProfileEditControls } from './UserProfilePaneHeader';
import type { AttributeDescriptor } from './profileAttributes';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeEditCell } from '../../hooks/useProfileEdit';

const attr = (
  name: string,
  label: string,
  value: string,
  over: Partial<AttributeDescriptor> = {},
): AttributeDescriptor => ({
  key: `profile.${name}`,
  name,
  label,
  kind: 'base',
  value,
  raw: value,
  isEmpty: value === '',
  ...over,
});

const system = (
  name: string,
  label: string,
  value: string,
  over: Partial<AttributeDescriptor> = {},
): AttributeDescriptor => attr(name, label, value, { key: name, kind: 'system', ...over });

const ATTRIBUTES: AttributeDescriptor[] = [
  system('id', 'User ID', '00uFAKE0001', { mono: true }),
  system('status', 'Status', 'ACTIVE'),
  system('created', 'Created', '12 Mar 2021'),
  system('lastLogin', 'Last Login', '4 Aug 2026'),
  attr('login', 'Login', 'samantha.henderson-oconnell@corporate.example.com'),
  attr('email', 'Email', 'user@example.com'),
  attr('firstName', 'First Name', 'Samantha'),
  attr('lastName', 'Last Name', 'Henderson-O’Connell'),
  attr('displayName', 'Display Name', ''),
  attr('secondEmail', 'Second Email', ''),
  attr('department', 'Department', 'Engineering'),
  attr('title', 'Title', 'Staff Platform Engineer'),
  attr('manager', 'Manager', 'manager@example.com'),
  attr('division', 'Division', 'Product Engineering'),
  attr(
    'streetAddress',
    'Street Address',
    '1200 Northwest Continental Boulevard, Building 4, Suite 1750',
  ),
  attr('city', 'City', 'Vancouver'),
  attr('state', 'State', 'Washington'),
  attr('zipCode', 'Zip Code', '98660'),
  attr('countryCode', 'Country Code', 'US'),
  attr('costCenter', 'Cost Center', 'CC-4471', { kind: 'custom' }),
  attr('employeeType', 'Employee Type', 'Full-time', { kind: 'custom' }),
];

const CONFIG: ProfileDisplayConfig = {
  layout: 'rows',
  showApiNames: false,
  showRuleChips: true,
  showEmpty: false,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
    { key: 'account-state', name: 'Account state' },
    { key: 'contact-locale', name: 'Contact & locale' },
  ],
  assign: {
    id: 'identity',
    login: 'identity',
    email: 'identity',
    firstName: 'identity',
    lastName: 'identity',
    displayName: 'identity',
    department: 'organization',
    title: 'organization',
    manager: 'organization',
    division: 'organization',
    status: 'account-state',
    created: 'account-state',
    lastLogin: 'account-state',
    secondEmail: 'contact-locale',
    streetAddress: 'contact-locale',
    city: 'contact-locale',
    state: 'contact-locale',
    zipCode: 'contact-locale',
    countryCode: 'contact-locale',
  },
  attrOrder: [
    'id',
    'login',
    'email',
    'firstName',
    'lastName',
    'displayName',
    'department',
    'title',
    'manager',
    'division',
    'status',
    'created',
    'lastLogin',
    'secondEmail',
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'countryCode',
    'costCenter',
    'employeeType',
  ],
  hidden: { state: true },
};

const EDIT_CONTROLS: ProfileEditControls = {
  canEdit: true,
  isEditing: false,
  changeCount: 0,
  hasInvalid: false,
  onBeginEdit: fn(),
  onCancelEdit: fn(),
  onSave: fn(),
};

const EDIT_CELLS: Readonly<Record<string, AttributeEditCell>> = {
  id: {
    name: 'id',
    editability: {
      editable: false,
      reason: 'system',
      explanation: 'This is a system field, not a profile attribute, so it cannot be edited here.',
    },
    dirty: false,
  },
  department: {
    name: 'department',
    editability: { editable: true, control: 'text', required: false },
    draft: 'Identity Platform',
    dirty: true,
    onChange: fn(),
  },
  title: {
    name: 'title',
    editability: { editable: true, control: 'text', required: false },
    dirty: false,
    onChange: fn(),
  },
};

const RULE_READS: Record<string, string[]> = {
  department: ['Engineering → VPN Access', 'Engineering → Wiki'],
  title: ['Staff+ → On-call Rotation'],
};

const meta = {
  title: 'Users/UserProfilePane',
  component: UserProfilePane,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Replaces `UserProfileCard`, which was a data dump: two-column white-on-white tiles that **truncated** ' +
          'the addresses and logins an admin came to read, hid every empty attribute so "does this org even ' +
          'define X?" could not be answered, and hard-coded its own labels and section names.\n\n' +
          "This pane's argument is different. **Attributes are the evidence group rules read to grant access**, " +
          'so a `{n} rules` chip sits beside any value a currently *granting* rule consults — and the header ' +
          'counts those separately from the plain attribute total. A rule that reads `department` but grants ' +
          'this user nothing is deliberately not counted; see `profileRuleReads`.\n\n' +
          "Everything else is the admin's: the categories, their order, the attributes inside them, the layout, " +
          'and whether API names, rule chips and empty attributes show at all. Attributes filed under no ' +
          'category — or under one that was deleted — collect in a final **Uncategorized** block that can never ' +
          'silently vanish.\n\n' +
          '`attributes`, `config` and `ruleReads` are props, not hooks: the pane renders and never fetches, and ' +
          'it owns no dialog — the gear calls `onConfigure` and `Save` only *arms* the confirmation, both of ' +
          'which are mounted by `UserDetailPanel`.\n\n' +
          '**Editing** arrives the same way. `edit` carries the pane-level verbs and `cells` carries one entry ' +
          'per attribute that has a control; an attribute with no cell renders exactly as it does in read ' +
          'mode, which is what keeps the no-truncation contract a property of the file rather than of a ' +
          'branch. The Edit button is **absent** rather than disabled when nothing on the profile can be ' +
          'edited.\n\n' +
          '**Related internals:** [Components](?path=/docs/internals-components--docs)',
      },
    },
  },
  argTypes: {
    attributes: { description: 'Every attribute of the profile, empty ones included.' },
    config: { description: "The admin's reconciled display configuration." },
    ruleReads: { description: 'Attribute name → the granting rules that read it.' },
    edit: { description: 'The pane-level edit verbs; absent means the pane is read-only.' },
    cells: { description: 'Attribute name → its edit cell. Empty outside edit mode.' },
  },
  args: {
    attributes: ATTRIBUTES,
    config: CONFIG,
    ruleReads: RULE_READS,
    onConfigure: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-canvas p-4">
        <div className="rounded-md border border-neutral-200 bg-white">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof UserProfilePane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2 rules')).toBeInTheDocument();
    await expect(canvas.getByText('1 rule')).toBeInTheDocument();
    await expect(canvas.getByText('Product Engineering')).toBeInTheDocument();

    await expect(canvas.getByRole('region', { name: 'Uncategorized' })).toBeInTheDocument();
    await expect(canvas.getByText('CC-4471')).toBeInTheDocument();

    await expect(canvas.queryByText('Washington')).not.toBeInTheDocument();

    await expect(canvas.queryByText('Second Email')).not.toBeInTheDocument();
  },
};

export const CompactLayout: Story = {
  args: { config: { ...CONFIG, layout: 'compact' } },
};

export const GridLayout: Story = {
  args: { config: { ...CONFIG, layout: 'grid' } },
};

export const ApiNames: Story = {
  args: { config: { ...CONFIG, showApiNames: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('streetAddress')).toBeInTheDocument();
    await expect(canvas.queryByText('Street Address')).not.toBeInTheDocument();
  },
};

export const ShowingEmptyAttributes: Story = {
  args: { config: { ...CONFIG, showEmpty: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Second Email')).toBeInTheDocument();
    await expect(canvas.getAllByTitle('No value').length).toBeGreaterThan(0);
  },
};

export const WithoutRuleChips: Story = {
  args: { config: { ...CONFIG, showRuleChips: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();
    await expect(canvas.queryByText('2 rules')).not.toBeInTheDocument();
  },
};

export const UsedByRulesOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Used by rules' }));

    await waitFor(() => expect(canvas.queryByText('CC-4471')).not.toBeInTheDocument());
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();
    await expect(canvas.getByText('Staff Platform Engineer')).toBeInTheDocument();
  },
};

export const FilteredToNothing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Filter attributes' }), 'zzzzz');

    const clear = await canvas.findByRole('button', { name: 'Clear filter' });
    await expect(canvas.getByText('No attributes match')).toBeInTheDocument();

    await userEvent.click(clear);
    await waitFor(() => expect(canvas.getByText('Engineering')).toBeInTheDocument());
  },
};

export const NothingConfiguredToShow: Story = {
  args: {
    config: { ...CONFIG, hidden: Object.fromEntries(ATTRIBUTES.map((a) => [a.name, true])) },
  },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Narrow: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('samantha.henderson-oconnell@corporate.example.com'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('1200 Northwest Continental Boulevard, Building 4, Suite 1750'),
    ).toBeInTheDocument();
  },
};

export const Editable: Story = {
  args: { edit: EDIT_CONTROLS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeEnabled();
    await expect(canvas.queryByRole('textbox', { name: 'Department' })).not.toBeInTheDocument();
  },
};

export const NothingEditable: Story = {
  args: { edit: { ...EDIT_CONTROLS, canEdit: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Configure attribute display' }),
    ).toBeInTheDocument();
  },
};

export const Editing: Story = {
  args: {
    edit: { ...EDIT_CONTROLS, isEditing: true, changeCount: 1 },
    cells: EDIT_CELLS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: 'Department' })).toHaveValue(
      'Identity Platform',
    );
    await expect(canvas.getByText('1 change')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled();

    await expect(
      canvas.getByText('1200 Northwest Continental Boulevard, Building 4, Suite 1750'),
    ).toBeInTheDocument();
  },
};

export const EditingNarrow: Story = {
  args: {
    edit: { ...EDIT_CONTROLS, isEditing: true, changeCount: 1 },
    cells: EDIT_CELLS,
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
