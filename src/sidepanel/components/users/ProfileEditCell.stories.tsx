import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import ProfileEditCell from './ProfileEditCell';
import type { AttributeDescriptor } from './profileAttributes';
import type { AttributeEditability } from './profileEditability';

const attribute = (
  name: string,
  label: string,
  value: string,
  kind: AttributeDescriptor['kind'] = 'base',
): AttributeDescriptor => ({
  key: kind === 'system' ? name : `profile.${name}`,
  name,
  label,
  kind,
  value,
  raw: value,
  isEmpty: value === '',
});

const editable = (
  control: 'text' | 'number' | 'select' | 'checkbox',
  extras: { options?: { value: string; label: string }[]; required?: boolean } = {},
): AttributeEditability => ({
  editable: true,
  control,
  required: extras.required ?? false,
  ...(extras.options ? { options: extras.options } : {}),
});

const locked = (
  reason: Extract<AttributeEditability, { editable: false }>['reason'],
  explanation: string,
  source?: string,
): AttributeEditability => ({
  editable: false,
  reason,
  explanation,
  ...(source ? { source } : {}),
});

const department = attribute('department', 'Department', 'Platform Engineering');
const login = attribute('login', 'Username', 'ada.example@example.com');

const streetAddress = attribute(
  'streetAddress',
  'Street Address',
  '4400 Northwest Cornelius Pass Road, Building 12, Suite 1400, Hillsboro, Oregon 97124',
);

const meta = {
  title: 'Users/ProfileEditCell',
  component: ProfileEditCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One attribute’s **value cell**, in whichever of three states applies: read-only, an ' +
          'editable control, or locked with the reason said out loud.\n\n' +
          '`onChange` is the mode switch. Absent, the cell renders the saved value read-only — ' +
          'which is every attribute outside edit mode. Present, an editable attribute gets the ' +
          'control its schema type calls for (`Input`, `Select`, `Checkbox`, or `Input type="number"`), ' +
          'and a locked one gets its value dimmed behind a padlock plus a sentence saying who owns ' +
          'it. **A lock is visible and explained, never a silently disabled field.**\n\n' +
          'The cell renders the value only, never the label: its two surfaces disagree about what a ' +
          'label is, so the control takes its accessible name from the attribute’s label through ' +
          '`ariaLabel`. Values wrap rather than truncate — a long login and a street address are ' +
          'exactly what an admin opened the profile to read.\n\n' +
          '**Related internals:** [Shared](?path=/docs/internals-shared--docs)',
      },
    },
  },
  decorators: [
    (Story: () => React.ReactElement) => (
      <div className="bg-canvas p-4">
        <div className="rounded-md border border-neutral-200 bg-white p-3">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    attribute: department,
    editability: editable('text'),
  },
  argTypes: {
    attribute: { description: 'The attribute whose value this cell renders.' },
    editability: {
      description: 'The verdict from `attributeEditability` — how to edit, or why not.',
    },
    draft: { description: 'The in-flight value; absent means this attribute is untouched.' },
    onChange: {
      description: 'Present only in edit mode. Absent renders the cell read-only.',
    },
    invalid: { description: 'Validation message for this attribute, from `validateDraft`.' },
    mono: { description: 'Render the value in a monospace font (ids and similar).' },
  },
} satisfies Meta<typeof ProfileEditCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Platform Engineering')).toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { attribute: attribute('costCenter', 'Cost Center', '') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTitle('No value')).toBeInTheDocument();
  },
};

export const Mono: Story = {
  args: { attribute: attribute('employeeNumber', 'Employee Number', 'E-0000042'), mono: true },
};

export const Editing: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Department' })).toHaveValue(
      'Platform Engineering',
    );
  },
};

export const Dirty: Story = {
  args: { onChange: fn(), draft: 'Security Engineering' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Department' })).toHaveValue(
      'Security Engineering',
    );
  },
};

export const ErrorState: Story = {
  args: {
    attribute: attribute('seats', 'Seats', '5'),
    editability: editable('number'),
    onChange: fn(),
    draft: '12abc',
    invalid: 'Enter a number.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Enter a number.')).toBeInTheDocument();
  },
};

export const NumberField: Story = {
  args: {
    attribute: attribute('seats', 'Seats', '5'),
    editability: editable('number'),
    onChange: fn(),
  },
};

export const SelectField: Story = {
  args: {
    attribute: attribute('region', 'Region', 'EMEA'),
    editability: editable('select', {
      options: [
        { value: 'EMEA', label: 'Europe, Middle East & Africa' },
        { value: 'AMER', label: 'Americas' },
      ],
    }),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Region' })).toHaveValue('EMEA');
  },
};

export const SelectWithRetiredValue: Story = {
  args: {
    attribute: attribute('region', 'Region', 'LATAM'),
    editability: editable('select', {
      options: [
        { value: 'EMEA', label: 'Europe, Middle East & Africa' },
        { value: 'AMER', label: 'Americas' },
      ],
    }),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Region' })).toHaveValue('LATAM');
  },
};

export const CheckboxField: Story = {
  args: {
    attribute: attribute('isContractor', 'Is Contractor', 'true'),
    editability: editable('checkbox'),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: 'Is Contractor' })).toBeChecked();
  },
};

export const LockedSystem: Story = {
  args: {
    attribute: attribute('lastLogin', 'Last Login', 'Aug 17, 2026', 'system'),
    editability: locked(
      'system',
      'This is an account field rather than a profile attribute, so it is not edited here.',
    ),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/not edited here/)).toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
  },
};

export const LockedNotInSchema: Story = {
  args: {
    attribute: attribute('legacyWorkerFlag', 'Legacy Worker Flag', 'Y', 'custom'),
    editability: locked(
      'not-in-schema',
      "The org's profile schema does not describe this attribute, so this panel will not write to it.",
    ),
    onChange: fn(),
  },
};

export const LockedReadOnly: Story = {
  args: {
    attribute: attribute('userType', 'User Type', 'EMPLOYEE'),
    editability: locked(
      'read-only',
      'Okta reports this attribute as read-only, so it is changed elsewhere.',
    ),
    onChange: fn(),
  },
};

export const LockedWriteOnly: Story = {
  args: {
    attribute: attribute('externalSecretRef', 'External Secret Ref', ''),
    editability: locked(
      'write-only',
      'Okta accepts a value for this attribute but never returns one, so there is nothing here to edit against.',
    ),
    onChange: fn(),
  },
};

export const LockedExternallyMastered: Story = {
  args: {
    editability: locked(
      'externally-mastered',
      'An external system masters this attribute (Active Directory), so it is changed there rather than here.',
      'Active Directory',
    ),
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Active Directory/)).toBeInTheDocument();
  },
};

export const LockedAccountMastered: Story = {
  args: {
    attribute: login,
    editability: locked(
      'account-mastered',
      'This account is mastered by Active Directory, so the sign-in name is changed there rather than here.',
      'Active Directory',
    ),
    onChange: fn(),
  },
};

export const LockedUnsupportedType: Story = {
  args: {
    attribute: attribute('aliases', 'Aliases', 'ada,ada.example', 'custom'),
    editability: locked('unsupported-type', 'This panel does not edit array attributes.'),
    onChange: fn(),
  },
};

export const LongValue: Story = {
  args: { attribute: streetAddress },
};

export const Compact: Story = {
  args: {
    attribute: streetAddress,
    editability: locked(
      'externally-mastered',
      'An external system masters this attribute (Active Directory), so it is changed there rather than here.',
      'Active Directory',
    ),
    onChange: fn(),
  },
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
