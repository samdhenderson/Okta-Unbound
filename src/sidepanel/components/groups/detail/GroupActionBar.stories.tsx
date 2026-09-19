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
          'place, so like every export descriptor in the app it starts behind **More**. ' +
          '`Check membership` is read-only too — it fetches one user whole and assesses every ' +
          'feeding rule against them — so it sits in the row, never `primary`, names its cost ' +
          'in its tooltip, and is omitted without a tab (ADR-0010).\n\n' +
          'The tier holds two verbs, one of each shape `ActionBar` offers: **Remove ' +
          'deprovisioned** as a descriptor behind a confirm `Modal`, and **Create feeding ' +
          'rule** in the `expansion` slot, where it can carry the line of prose stating what ' +
          'a rule leaves behind. A verb that cannot honestly run is absent, never disabled ' +
          'forever — no wire, an `APP_GROUP`, or an unknown deprovisioned count all omit it.\n\n' +
          '**Set attribute on N members** is the rung\u2019s one *filter-scoped* verb and the ' +
          'documented tier carve-out to the rule that a verb whose object is not the whole ' +
          'page belongs to a section. It names the count the Members pane measured, it is ' +
          'absent unless that pane is the one on screen, and `expansion` carries the sentence ' +
          'saying whose profiles it would write \u2014 because a descriptor carries no JSX and ' +
          '\u201cmembers\u201d alone would read as all of them.',
      },
    },
  },
  args: {
    group,
    targetTabId: 1,
    onExportGroup: fn(),
    onAddMember: fn(),
    onCompare: fn(),
    onWhyNotMember: fn(),
    onRemoveDeprovisioned: fn(),
    deprovisionedCount: 3,
    filteredMemberCount: 47,
    onSetProfileAttribute: fn(),
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
    onWhyNotMember: {
      description: 'Opens the user picker for a qualification check. Omitted with no tab.',
    },
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
    filteredMemberCount: {
      description:
        'Members surviving the Members pane\u2019s search and filters. `undefined` \u2014 another ' +
        'pane on screen, or the roster unread \u2014 and `0` both omit the action.',
    },
    onSetProfileAttribute: {
      description: 'Opens the run surface for the bulk profile write. Omitted \u2192 no action.',
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
  args: { targetTabId: null, onWhyNotMember: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Add' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Compare' })).toBeDisabled();
    await expect(
      canvas.queryByRole('button', { name: 'Check membership' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Export members/ })).toBeEnabled();
  },
};

export const WhyNotAMemberInTheRow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const check = canvas.getByRole('button', { name: 'Check membership' });
    await expect(check).toHaveAttribute('title', expect.stringMatching(/two requests/));
    await userEvent.click(check);
    await expect(args.onWhyNotMember).toHaveBeenCalledTimes(1);
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

export const FilteredCohortVerb: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const more = canvas.getByRole('button', { name: 'More' });
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');

    const verb = within(tier).getByRole('button', { name: 'Set attribute on 47 members' });
    await expect(verb).toBeInTheDocument();

    await expect(within(tier).getByText(/not on the\s+selected users/)).toBeInTheDocument();
    await expect(within(tier).getByText(/recorded for up to\s+100/)).toBeInTheDocument();

    await userEvent.click(more);
    await userEvent.click(verb);
    await expect(args.onSetProfileAttribute).toHaveBeenCalledTimes(1);
  },
};

export const NoFilteredCohort: Story = {
  args: { filteredMemberCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const more = canvas.getByRole('button', { name: 'More' });
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');

    await expect(
      within(tier).queryByRole('button', { name: /Set attribute/ }),
    ).not.toBeInTheDocument();
    await expect(within(tier).queryByText(/not on the\s+selected users/)).not.toBeInTheDocument();

    await expect(
      within(tier).getByRole('button', { name: /Remove 3 deprovisioned/ }),
    ).toBeVisible();
  },
};

export const FilteredCohortOfOne: Story = {
  args: { filteredMemberCount: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Set attribute on 1 member' }),
    ).toBeInTheDocument();
  },
};

export const FilteredCohortEmpty: Story = {
  args: { filteredMemberCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Set attribute/ })).not.toBeInTheDocument();
  },
};
