import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import UserProfileAttributeList from './UserProfileAttributeList';
import type { AttributeDescriptor } from './profileAttributes';
import type { AttributeEditCell } from '../../hooks/useProfileEdit';

const attribute = (
  name: string,
  label: string,
  kind: AttributeDescriptor['kind'],
  value: string,
  mono = false,
): AttributeDescriptor => ({
  key: kind === 'system' ? name : `profile.${name}`,
  name,
  label,
  kind,
  value,
  raw: value,
  isEmpty: value === '',
  ...(mono ? { mono: true } : {}),
});

const attributes: AttributeDescriptor[] = [
  attribute('id', 'User ID', 'system', '00uFAKE00000000000001', true),
  attribute('login', 'Login', 'base', 'user@example.com'),
  attribute('firstName', 'First Name', 'base', 'Ada'),
  attribute('lastName', 'Last Name', 'base', 'Lovelace'),
  attribute('department', 'Department', 'base', 'Platform Engineering'),
  attribute('costCenter', 'Cost Center', 'base', ''),
  attribute('employeeType', 'Employee Type', 'custom', 'FULL_TIME'),
];

const longValues: AttributeDescriptor[] = [
  attribute(
    'streetAddress',
    'Street Address',
    'base',
    'Flat 12, Whitfield House, 145 Great Portland Street, Fitzrovia, London, W1W 6QQ, United Kingdom',
  ),
  attribute('login', 'Login', 'base', 'ada.lovelace.platform.engineering.contractor@example.com'),
  attribute(
    'externalIdentifier',
    'External Identifier',
    'custom',
    'urn:example:hr:worker:0000000000000000000000000000000000000042',
    true,
  ),
];

const editCells: Readonly<Record<string, AttributeEditCell>> = {
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
  employeeType: {
    name: 'employeeType',
    editability: {
      editable: true,
      control: 'select',
      required: false,
      options: [
        { value: 'FULL_TIME', label: 'Full time' },
        { value: 'CONTRACTOR', label: 'Contractor' },
      ],
    },
    dirty: false,
    onChange: fn(),
  },
  costCenter: {
    name: 'costCenter',
    editability: { editable: true, control: 'text', required: true },
    draft: '',
    dirty: true,
    invalid: 'Okta requires a value for this attribute.',
    onChange: fn(),
  },
};

const ruleReads: Record<string, string[]> = {
  department: ['Platform engineers'],
  employeeType: ['Full-time staff', 'Badge holders', 'Payroll sync'],
};

const meta = {
  title: 'Users/UserProfileAttributeList',
  component: UserProfileAttributeList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The label/value half of `UserProfilePane`: one category block, in whichever of the three layouts the admin chose — `rows`, `compact`, or `auto-fit` `grid` cards.\n\n' +
          'Nothing here truncates: every layout wraps and the value takes whatever height it needs, because the long values are the ones an admin most often opened the profile to read. Rendered as a `<dl>`, so each label is programmatically tied to its value, and an empty attribute renders `—` with a `No value` tooltip rather than a blank line.',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-white p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    attributes,
    layout: 'rows',
    showApiNames: false,
    showRuleChips: true,
    ruleReads,
  },
  argTypes: {
    attributes: {
      description: "One category block's attributes, already filtered and in display order.",
    },
    layout: {
      description: 'Which of the three presentations to render.',
      control: 'inline-radio',
      options: ['rows', 'compact', 'grid'],
    },
    showApiNames: {
      description: 'Show the Okta attribute name (`department`, in mono) instead of its label.',
    },
    showRuleChips: { description: 'Whether the "read by rules" chips render at all.' },
    ruleReads: {
      description: 'Attribute name → the rules that read it; an absent name gets no chip.',
    },
    cells: {
      description: 'Attribute name → its edit cell while editing; absent is the read-only path.',
    },
  },
} satisfies Meta<typeof UserProfileAttributeList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RowsLayout: Story = {
  args: { layout: 'rows' },
};

export const CompactLayout: Story = {
  args: { layout: 'compact' },
};

export const GridLayout: Story = {
  args: { layout: 'grid' },
};

export const EmptyValue: Story = {
  args: { attributes: [attributes[4], attributes[5]] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTitle('No value')).toBeInTheDocument();
  },
};

export const LongValues: Story = {
  args: { attributes: longValues, layout: 'rows' },
};

export const LongValuesInGrid: Story = {
  args: { attributes: longValues, layout: 'grid' },
};

export const HumanLabels: Story = {
  args: { showApiNames: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Department')).toBeInTheDocument();
  },
};

export const ApiNames: Story = {
  args: { showApiNames: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('department')).toBeInTheDocument();
  },
};

export const WithRuleChips: Story = {
  args: { showRuleChips: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 rule')).toBeInTheDocument();
    await expect(canvas.getByText('3 rules')).toBeInTheDocument();
  },
};

export const WithoutRuleChips: Story = {
  args: { showRuleChips: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('1 rule')).toBeNull();
  },
};

export const Compact: Story = {
  args: {
    attributes: [...attributes.filter((item) => item.name !== 'login'), ...longValues],
    layout: 'rows',
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

export const Editing: Story = {
  args: { cells: editCells },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: 'Department' })).toHaveValue(
      'Identity Platform',
    );
    await expect(canvas.getByRole('combobox', { name: 'Employee Type' })).toBeInTheDocument();

    await expect(canvas.getByText('Okta requires a value for this attribute.')).toBeInTheDocument();

    await expect(canvas.queryByRole('textbox', { name: 'User ID' })).not.toBeInTheDocument();
    await expect(canvas.getByText('00uFAKE00000000000001')).toBeInTheDocument();

    await expect(canvas.getByText('user@example.com')).toBeInTheDocument();
  },
};

export const EditingInGrid: Story = {
  args: { cells: editCells, layout: 'grid' },
};

export const EditingNarrow: Story = {
  args: { cells: editCells },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};

const LiveEditingHarness = (args: React.ComponentProps<typeof UserProfileAttributeList>) => {
  const [drafts, setDrafts] = React.useState<Record<string, string>>({
    department: 'Identity Platform',
    costCenter: '',
  });

  const cell = (
    name: string,
    editability: AttributeEditCell['editability'],
    original: string,
  ): AttributeEditCell => ({
    name,
    editability,
    draft: drafts[name],
    dirty: drafts[name] !== original,
    invalid:
      name === 'costCenter' && drafts.costCenter === ''
        ? 'Okta requires a value for this attribute.'
        : undefined,
    onChange: (next: string) => setDrafts((previous) => ({ ...previous, [name]: next })),
  });

  return (
    <UserProfileAttributeList
      {...args}
      cells={{
        department: cell(
          'department',
          { editable: true, control: 'text', required: false },
          'Platform Engineering',
        ),
        costCenter: cell('costCenter', { editable: true, control: 'text', required: true }, ''),
      }}
    />
  );
};

export const EditingLive: Story = {
  render: (args) => <LiveEditingHarness {...args} />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText('Okta requires a value for this attribute.')).toBeInTheDocument();

    const costCenter = canvas.getByRole('textbox', { name: 'Cost Center' });
    await userEvent.type(costCenter, 'CC-100');
    await expect(costCenter).toHaveValue('CC-100');
    await expect(canvas.queryByText('Okta requires a value for this attribute.')).toBeNull();
  },
};
