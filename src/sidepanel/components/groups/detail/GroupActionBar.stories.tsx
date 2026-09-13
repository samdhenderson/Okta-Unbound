import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import GroupActionBar from './GroupActionBar';
import type { GroupSummary } from '../../../../shared/types';

const group: GroupSummary = {
  id: '00gFAKE000000000001',
  name: 'Engineering',
  description: 'All engineering staff across every team.',
  type: 'OKTA_GROUP',
  memberCount: 128,
  hasRules: false,
  ruleCount: 0,
  usedInRuleCount: 0,
  created: new Date('2023-01-15'),
  lastUpdated: new Date('2026-06-01'),
};

const meta = {
  title: 'Groups/GroupActionBar',
  component: GroupActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every verb whose object is the whole group. `Add` is the `primary` and sits in ' +
          'the row beside `Compare`: one writes but is undone by a remove, the other only ' +
          'reads. `Export members` forwards to the Export tab rather than producing a file in ' +
          'place, so like every export descriptor in the app it starts behind **More**.\n\n' +
          'The tier holds two verbs, one of each shape `ActionBar` offers: **Remove ' +
          'deprovisioned** as a descriptor behind a confirm `Modal`, and **Create feeding ' +
          'rule** in the `expansion` slot, where it can carry the line of prose stating what ' +
          'a rule leaves behind. A verb that cannot honestly run is absent, never disabled ' +
          'forever — no wire, an `APP_GROUP`, or an unknown deprovisioned count all omit it.',
      },
    },
  },
  args: {
    group,
    targetTabId: 1,
    onExportGroup: fn(),
    onAddMember: fn(),
    onCompare: fn(),
    onRemoveDeprovisioned: fn(),
    deprovisionedCount: 3,
    onCreateFeedingRule: fn(),
    sticky: false,
  },
  argTypes: {
    group: { description: 'The group every verb in the strip acts on.' },
    targetTabId: { description: '`Add` and `Compare` both disable without a connected tab.' },
    onExportGroup: {
      description: "Opens the Export tab pre-scoped to this group's members. Omitted → no action.",
    },
    onAddMember: { description: 'Opens the Add-member modal.' },
    onCompare: { description: 'Opens the picker for the second group in a comparison.' },
    deprovisionedCount: {
      description: 'How many loaded members are `DEPROVISIONED`. `undefined` and `0` both omit it.',
    },
    onRemoveDeprovisioned: {
      description:
        'Runs the bulk removal once the confirm modal is accepted. Omitted \u2192 no action.',
    },
    isRemoving: {
      description: 'Holds the confirm button in its loading state while the run is in flight.',
    },
    removeError: {
      description: 'The last error the run reported, shown inside the confirm modal.',
    },
    onCreateFeedingRule: { description: 'Opens the create-feeding-rule confirm dialog.' },
    sticky: { description: 'Pin the strip below the header.' },
  },
} satisfies Meta<typeof GroupActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AddIsThePrimaryAndExportIsBehindMore: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');

    await expect(within(tier).getByRole('button', { name: /Export members/ })).toBeInTheDocument();
    await expect(within(tier).queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Add' })).toBeEnabled();

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
  },
};

export const ExportOmitted: Story = {
  args: { onExportGroup: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Export members/ })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Add' })).toBeEnabled();
  },
};

export const NoConnectedTab: Story = {
  args: { targetTabId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Add' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Compare' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /Export members/ })).toBeEnabled();
  },
};

export const RemoveDeprovisioned: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(canvas.getByRole('button', { name: /Remove 3 deprovisioned/ }));

    const dialog = body.getByRole('dialog', { name: 'Remove deprovisioned members' });
    await expect(dialog).toHaveTextContent(/3 deprovisioned members from Engineering/);
    await expect(args.onRemoveDeprovisioned).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Remove 3' }));
    await expect(args.onRemoveDeprovisioned).toHaveBeenCalledTimes(1);
  },
};

export const RemoveFailed: Story = {
  args: { removeError: '403 Forbidden: you lack permission to modify this group' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await userEvent.click(canvas.getByRole('button', { name: /Remove 3 deprovisioned/ }));

    await expect(body.getByRole('dialog')).toHaveTextContent(/403 Forbidden/);
  },
};

export const NoDeprovisionedMembers: Story = {
  args: { deprovisionedCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /deprovisioned/i })).not.toBeInTheDocument();
  },
};

export const RosterNotLoaded: Story = {
  args: { deprovisionedCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /deprovisioned/i })).not.toBeInTheDocument();
  },
};

export const AppGroupHasNoRemove: Story = {
  args: {
    group: { ...group, type: 'APP_GROUP', name: 'Salesforce Users' },
    deprovisionedCount: 12,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /deprovisioned/i })).not.toBeInTheDocument();
  },
};

export const TierOpen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    await expect(canvas.getByText('Memberships a rule grants outlive the rule')).toBeVisible();
    const create = canvas.getByRole('button', { name: 'Create feeding rule' });
    await expect(create).toBeVisible();

    await userEvent.click(create);
    await expect(args.onCreateFeedingRule).toHaveBeenCalledTimes(1);
  },
};

export const TierWithoutConnectedTab: Story = {
  args: { targetTabId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));

    const create = canvas.getByRole('button', { name: 'Create feeding rule' });
    await expect(create).toBeDisabled();
    await expect(create).toHaveAttribute('title', 'Connect an Okta tab to create a rule');
  },
};
