import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { MemberMfaResult, OktaUser } from '../../../shared/types';
import MemberExplorer from './MemberExplorer';
import { mockUsers } from '../../../test/mocks/fixtures';
import { selectionStore } from '../../selection/selectionStore';

const mfaResults = new Map<string, MemberMfaResult>(
  mockUsers.map((user, i) => [
    user.id,
    {
      userId: user.id,
      factors: [],
      enrolled: i % 4 !== 0,
      factorCount: i % 4 === 0 ? 0 : (i % 4) + 1,
      factorLabels: i % 4 === 0 ? [] : ['Okta Verify (Fastpass)'].concat(i % 4 >= 2 ? ['SMS'] : []),
    },
  ]),
);

const meta = {
  title: 'Members/MemberExplorer',
  component: MemberExplorer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Orchestrator for in-group member search, faceting, MFA, and listing. One control band carries search, the filter-drawer trigger, the active filters as chips, and how much of the roster survived them; every other control lives in `MemberFilterDrawer`.\n\n' +
          "It owns the client-side state (debounced search, sort, the paged window), but MFA scan results belong to the caller, so the scan lifecycle is driven by props. Row checkboxes write to the panel-wide selection basket, and *Select all* replaces the basket's user partition with the **filtered** cohort — ids resolve against the full roster, and a batch the cap refuses adds nothing and says so.",
      },
    },
  },
  beforeEach: () => {
    selectionStore.clearAll();
    return () => selectionStore.clearAll();
  },
  argTypes: {
    members: { description: "The group's full member set (the explorer filters/sorts locally)." },
    isReloading: {
      description:
        'True while the member set is being re-fetched behind the explorer; the list swaps to skeleton rows.',
    },
    mfaResults: { description: 'Per-member MFA scan results, or null before a scan has run.' },
    scanStatus: { description: 'Current MFA scan lifecycle status.' },
    onRunScan: { description: 'Start the MFA scan.' },
    onRequestConfirm: { description: 'Request the confirmation gate (used for large groups).' },
    onCancelConfirm: { description: 'Dismiss the confirmation gate.' },
    oktaOrigin: {
      description: 'Okta org origin for member Admin Console links (null when unknown).',
    },
  },
  args: {
    members: mockUsers,
    isReloading: false,
    mfaResults: null,
    scanStatus: 'idle',
    onRunScan: fn(),
    onRequestConfirm: fn(),
    onCancelConfirm: fn(),
    oktaOrigin: null,
  },
} satisfies Meta<typeof MemberExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConfirmingScan: Story = {
  args: { scanStatus: 'confirming' },
};

export const Scanning: Story = {
  args: { scanStatus: 'scanning' },
};

export const ScanComplete: Story = {
  args: { mfaResults, scanStatus: 'complete' },
};

export const Empty: Story = {
  args: { members: [] },
};

const spreadMembers: OktaUser[] = Array.from({ length: 30 }, (_, i) => ({
  id: `spread${i + 1}`,
  status: 'ACTIVE',
  profile: {
    login: `spread${i + 1}@example.com`,
    email: `spread${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    department: ['Engineering', 'Support', 'Finance'][i % 3],
    title: i % 2 === 0 ? 'Manager' : 'Individual Contributor',
  },
}));

export const PickAValueThroughTheDrawer: Story = {
  args: { members: spreadMembers },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Filters' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Department: choose a value to filter by' }),
    );

    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await userEvent.click(within(dialog).getByText('Support'));

    await expect(canvas.getByText('Department: Support')).toBeVisible();
    await expect(canvas.getByText('10 of 30')).toBeVisible();
  },
};

export const ChipRemovesTheFilterWithoutTheDrawer: Story = {
  args: { members: spreadMembers },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Filters' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Department: choose a value to filter by' }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await userEvent.click(within(dialog).getByText('Support'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Filters, 1 applied' }));

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Department: Support filter' }),
    );
    await expect(canvas.queryByText('Department: Support')).toBeNull();
    await expect(canvas.getByText('30 of 30')).toBeVisible();
  },
};

export const ClosedDrawerIsInert: Story = {
  args: { members: spreadMembers },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole('button', { name: 'Filters' });
    const region = canvasElement.ownerDocument.getElementById(
      trigger.getAttribute('aria-controls') as string,
    );
    await expect(region).toHaveAttribute('inert');

    await userEvent.click(trigger);
    await expect(region).not.toHaveAttribute('inert');
  },
};

export const SelectAllTakesTheFilteredSet: Story = {
  args: { members: spreadMembers },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox'), 'spread7@');
    await expect(await canvas.findByText('1 of 30')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Select all' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select First7 Last7' })).toBeChecked();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(await canvas.findByText('30 of 30')).toBeVisible();
    await expect(canvas.getByRole('checkbox', { name: 'Select First7 Last7' })).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Select First1 Last1' })).not.toBeChecked();
  },
};

export const DeselectAllAppearsWithTheSelection: Story = {
  args: { members: spreadMembers },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).toBeNull();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select First1 Last1' }));
    const deselect = await canvas.findByRole('button', { name: 'Deselect all' });
    await expect(deselect).toHaveAttribute(
      'title',
      'Clear every selected user, including any picked on another screen',
    );

    await userEvent.click(deselect);
    await expect(canvas.getByRole('checkbox', { name: 'Select First1 Last1' })).not.toBeChecked();
    await expect(canvas.queryByRole('button', { name: 'Deselect all' })).toBeNull();
  },
};
