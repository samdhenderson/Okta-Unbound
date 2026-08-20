import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileDisplayCategoriesTab from './ProfileDisplayCategoriesTab';
import { DEFAULT_PROFILE_DISPLAY_CONFIG } from '../../../shared/storage/profileDisplayStore';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';

const attribute = (
  name: string,
  kind: AttributeDescriptor['kind'],
  value: string,
): AttributeDescriptor => ({
  key: kind === 'system' ? name : `profile.${name}`,
  name,
  label: name,
  kind,
  value,
  raw: value,
  isEmpty: value === '',
});

const attributes: AttributeDescriptor[] = [
  attribute('id', 'system', '00uFAKE00000000000001'),
  attribute('status', 'system', 'ACTIVE'),
  attribute('login', 'base', 'user@example.com'),
  attribute('firstName', 'base', 'Ada'),
  attribute('lastName', 'base', 'Lovelace'),
  attribute('department', 'base', 'Platform Engineering'),
  attribute('costCenter', 'base', ''),
  attribute('managerId', 'base', ''),
  attribute('employeeType', 'custom', 'FULL_TIME'),
  attribute('badgeId', 'custom', ''),
];

const config: ProfileDisplayConfig = {
  ...DEFAULT_PROFILE_DISPLAY_CONFIG,
  categories: [
    { key: 'identity', name: 'Identity' },
    { key: 'organization', name: 'Organization' },
    { key: 'account-state', name: 'Account state' },
  ],
  attrOrder: attributes.map((item) => item.name),
  assign: {
    id: 'identity',
    status: 'account-state',
    login: 'identity',
    firstName: 'identity',
    lastName: 'identity',
    department: 'organization',
    costCenter: 'organization',
    managerId: 'organization',
    employeeType: '',
    badgeId: '',
  },
  hidden: {},
};

const Controlled: React.FC<{
  attributes: AttributeDescriptor[];
  config: ProfileDisplayConfig;
  onChange: (patch: Partial<ProfileDisplayConfig>) => void;
}> = ({ attributes: items, config: initial, onChange }) => {
  const [current, setCurrent] = useState(initial);
  return (
    <ProfileDisplayCategoriesTab
      attributes={items}
      config={current}
      onChange={(patch) => {
        setCurrent((previous) => ({ ...previous, ...patch }));
        onChange(patch);
      }}
    />
  );
};

const meta = {
  title: 'Users/ProfileDisplayCategoriesTab',
  component: ProfileDisplayCategoriesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Categories half of `ProfileDisplayModal`: how the profile is laid out, what extra ' +
          'marks it carries, and the admin’s own list of categories.\n\n' +
          'Every control is driven by the caller’s config and emits a ' +
          '`Partial<ProfileDisplayConfig>` patch — the tab holds exactly one piece of local state, ' +
          'the half-typed name of a category that does not exist yet. There is no Save, because ' +
          'each patch applies live to the profile pane behind the dialog.\n\n' +
          'The empty-attribute toggle states how many of **this** profile’s attributes are empty on ' +
          '**this** user, rather than describing the feature in the abstract.\n\n' +
          'The reorder arrows are disabled at the list’s ends, and **deleting a category returns ' +
          'its attributes to Uncategorized** — the caption under the list says so, because a ' +
          'category that took its attributes off the profile with it would be a destructive action ' +
          'wearing an editing action’s clothes. The delete handler emits an `assign` patch ' +
          'alongside the shortened list to make that true.\n\n' +
          '**Related internals:** [Shared](?path=/docs/internals-shared--docs)',
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
    config,
    onChange: fn(),
  },
  argTypes: {
    attributes: {
      description: 'Every attribute on the profile — the source of the per-category counts.',
    },
    config: { description: 'The configuration being edited.' },
    onChange: { description: 'Emits one patch per edit, applied live by the caller.' },
  },
} satisfies Meta<typeof ProfileDisplayCategoriesTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Move Identity up' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Move Identity down' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Move Account state down' })).toBeDisabled();

    await expect(canvas.getByRole('button', { name: 'Delete Account state' })).toBeInTheDocument();
    await expect(
      canvas.getByText('Deleting a category returns its attributes to Uncategorized.'),
    ).toBeInTheDocument();
  },
};

export const SingleCategory: Story = {
  args: {
    config: { ...config, categories: [{ key: 'identity', name: 'Identity' }] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Move Identity up' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Move Identity down' })).toBeDisabled();
  },
};

export const Empty: Story = {
  args: {
    config: { ...DEFAULT_PROFILE_DISPLAY_CONFIG, categories: [] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Add category' })).toBeDisabled();
  },
};

export const RenameInProgress: Story = {
  render: (args) => (
    <Controlled attributes={args.attributes} config={args.config} onChange={args.onChange} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Category 2 name' });

    await userEvent.clear(field);
    await userEvent.type(field, 'Employment');

    await expect(field).toHaveValue('Employment');
    await expect(canvas.getByRole('button', { name: 'Delete Employment' })).toBeInTheDocument();
  },
};

export const ManyCategories: Story = {
  args: {
    config: {
      ...config,
      categories: [
        { key: 'identity', name: 'Identity' },
        { key: 'organization', name: 'Organization' },
        { key: 'account-state', name: 'Account state' },
        { key: 'contact-locale', name: 'Contact & locale' },
        { key: 'employment', name: 'Employment' },
        { key: 'facilities', name: 'Facilities & badging' },
        { key: 'provisioning', name: 'Provisioning' },
      ],
    },
  },
};

export const Compact: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
};
