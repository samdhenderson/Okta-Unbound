import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ActionBar from './ActionBar';
import Button from './Button';
import DetailSection from './DetailSection';
import EntityIdentity from './EntityIdentity';
import Input from './Input';
import PageHeader from './PageHeader';

const meta = {
  title: 'Shared/ActionBar',
  component: ActionBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The page-level action strip of a detail view: the verbs whose object is the whole page, taken as `ActionDescriptor[]` data so the strip can measure them and re-split the row as the panel narrows — icons drop first, then the tail moves behind **More**.\n\n' +
          "A verb scoped to one section's data belongs in that section's `DetailSection.actions` slot, not here. The tier behind **More** is a disclosure region rather than a menu, so `expansion` may hold arbitrary UI.",
      },
    },
  },
  argTypes: {
    actions: {
      description: "The page's verbs as data, ordered by weight; the tail is what overflows first.",
    },
    ariaLabel: {
      description: 'Accessible name for the group, e.g. `"Actions for Jane Doe"`.',
    },
    subRow: {
      description:
        'Always-visible caller UI inside the band, under the verbs and above the tier — a list ' +
        "rung's search field. Never measured, so unlike a descriptor it may carry JSX.",
    },
    register: {
      description:
        'The selection register: a second measured row of selection-scoped verbs, whose leading control must be one whose worst outcome is another click. Selection furniture lives on the rung’s `ListCountRow`, not here.',
    },
    sticky: {
      description:
        'Pin below the page header while the page scrolls under it, merging into it as it docks. Defaults to `true`.',
    },
    expansion: {
      description:
        'Arbitrary caller UI for the tier, appended below anything that overflowed there.',
    },
    tierOpen: {
      description:
        'Whether the tier is open. Omit to let the strip own the state — the tier can become non-empty without the caller knowing, so a caller that never passed `expansion` should not have to own state for it.',
    },
    defaultTierOpen: { description: 'Initial open state when uncontrolled. Defaults to `false`.' },
    onTierOpenChange: {
      description: 'Called with the next open state whenever the disclosure is toggled.',
    },
    className: { description: 'Extra classes merged after the layout classes.' },
    testId: { description: 'Optional test handle.' },
  },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    sticky: false,
    actions: [
      { id: 'add-group', label: 'Add group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
      { id: 'export', label: 'Export', icon: 'download', onClick: fn() },
    ],
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const settle = async (): Promise<void> => {
  await document.fonts.ready;
  await new Promise(window.requestAnimationFrame);
  await new Promise(window.requestAnimationFrame);
};

const barButtonLabels = (canvasElement: HTMLElement): string[] => {
  const canvas = within(canvasElement);
  const more = canvas.queryByRole('button', { name: 'More' });
  const tierId = more?.getAttribute('aria-controls');
  const tier = tierId ? canvasElement.ownerDocument.getElementById(tierId) : null;
  return canvas
    .getAllByRole('button')
    .filter((button) => tier === null || !tier.contains(button))
    .map((button) => (button.textContent ?? '').trim());
};

const narrowFrame = (strip: ReactNode): ReactElement => (
  <div className="bg-canvas p-3" style={{ inlineSize: '360px' }}>
    {strip}
  </div>
);

export const Default: Story = {};

export const SingleAction: Story = {
  args: {
    ariaLabel: 'Actions for Sales — West',
    actions: [{ id: 'export-members', label: 'Export members', icon: 'download', onClick: fn() }],
  },
};

export const AtPanelWidth: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  render: (args) => narrowFrame(<ActionBar {...args} />),
};

export const StickyInAScroller: Story = {
  parameters: { motion: 'on' },
  args: {
    sticky: true,
    actions: [
      { id: 'add-group', label: 'Add group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
    ],
    expansion: (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
    ),
  },
  render: (args) => (
    <div
      data-header-scope
      className="h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas"
    >
      <PageHeader
        sticky
        title="Jane Doe"
        badge={{ text: 'Active', variant: 'success' }}
        identityKey="00uFAKE1a2b3c4d5e6"
        identity={
          <EntityIdentity
            rows={[
              [{ kind: 'text', text: 'jane.doe@example.com' }],
              [{ kind: 'id', value: '00uFAKE1a2b3c4d5e6', copyLabel: 'Copy user id' }],
              [{ kind: 'metric', icon: 'users', value: '14', label: 'groups' }],
            ]}
          />
        }
      />
      <div className="space-y-6 px-6 py-6">
        <ActionBar {...args} />
        {['Membership source', 'Rules', 'Grants access to', 'App push', 'Metadata'].map((title) => (
          <DetailSection key={title} title={title}>
            <p className="text-sm text-neutral-600">
              Body content, tall enough that the strip above has something to hold against.
            </p>
          </DetailSection>
        ))}
      </div>
    </div>
  ),
};

export const DockedInsideAnAnimatedRung: Story = {
  parameters: { motion: 'on' },
  args: {
    sticky: true,
    actions: [
      {
        id: 'export-members',
        label: 'Export members',
        icon: 'download',
        variant: 'primary',
        onClick: fn(),
      },
      { id: 'add-member', label: 'Add', icon: 'plus', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
    ],
  },
  render: (args) => (
    <div
      data-header-scope
      className="h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas"
    >
      <PageHeader
        sticky
        title="Engineering - All"
        badge={{ text: 'Okta Group', variant: 'primary' }}
        identityKey="00gFAKE1a2b3c4d5e6"
        identity={
          <EntityIdentity
            rows={[
              [{ kind: 'id', value: '00gFAKE1a2b3c4d5e6', copyLabel: 'Copy group id' }],
              [{ kind: 'metric', icon: 'users', value: '128', label: 'members' }],
            ]}
          />
        }
      />
      <div className="animate-push-in">
        <div className="space-y-6 px-6 py-6">
          <ActionBar {...args} />
          {['Membership source', 'Rules', 'Grants access to', 'App push', 'Metadata'].map(
            (title) => (
              <DetailSection key={title} title={title}>
                <p className="text-sm text-neutral-600">
                  Body content, tall enough that the strip above has something to hold against.
                </p>
              </DetailSection>
            ),
          )}
        </div>
      </div>
    </div>
  ),
};

export const WithExpansion: Story = {
  parameters: { motion: 'on' },
  args: {
    actions: [
      { id: 'add-group', label: 'Add group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
    ],
    expansion: (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Suspend user' })).toBeVisible();
  },
};

export const WithSubRow: Story = {
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [
      {
        id: 'export-list',
        label: 'Export list',
        icon: 'download',
        variant: 'primary',
        onClick: fn(),
      },
      { id: 'cross-search', label: 'Cross-search', icon: 'search', onClick: fn() },
      { id: 'cleanup', label: 'Cleanup', icon: 'sparkles', onClick: fn(), priority: 'tier' },
    ],
    subRow: (
      <div className="flex gap-2">
        <Input
          size="sm"
          type="search"
          value=""
          onChange={fn()}
          ariaLabel="Filter groups"
          placeholder="Search by name, description…"
        />
        <Button variant="secondary" size="sm" icon="settings" onClick={fn()}>
          Filters
        </Button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const band = canvasElement.querySelector('.dock-band') as HTMLElement;
    await expect(band).toContainElement(canvas.getByRole('searchbox', { name: 'Filter groups' }));

    const more = canvas.getByRole('button', { name: 'More' });
    await userEvent.click(more);
    await expect(canvas.getByRole('button', { name: 'Cleanup' })).toBeVisible();
  },
};

export const Overflows: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [
      { id: 'add-group', label: 'Add to group', icon: 'plus', onClick: fn() },
      { id: 'compare', label: 'Compare users', icon: 'users', onClick: fn() },
      { id: 'export', label: 'Export members', icon: 'download', onClick: fn() },
      { id: 'refresh', label: 'Refresh access', icon: 'refresh', onClick: fn() },
      { id: 'deactivate', label: 'Deactivate user', icon: 'pause', onClick: fn() },
      { id: 'clear-sessions', label: 'Clear sessions', icon: 'key', onClick: fn() },
    ],
  },
  render: (args) => narrowFrame(<ActionBar {...args} />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await settle();

    const more = await canvas.findByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(barButtonLabels(canvasElement)).not.toContain('Clear sessions'));

    const overflowed = canvas.getByRole('button', { name: 'Clear sessions' });
    overflowed.focus();
    await expect(overflowed).not.toHaveFocus();

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    const reachable = canvas.getByRole('button', { name: 'Clear sessions' });
    reachable.focus();
    await expect(reachable).toHaveFocus();
  },
};

export const IconsDropBeforeOverflow: Story = {
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [
      { id: 'add-group', label: 'Add group', icon: 'plus', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
      { id: 'export', label: 'Export', icon: 'download', onClick: fn() },
      { id: 'refresh', label: 'Refresh', icon: 'refresh', onClick: fn() },
    ],
  },
  render: (args) => (
    <div className="w-[370px] bg-canvas p-3">
      <ActionBar {...args} />
    </div>
  ),
};

export const PinnedNeverOverflows: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [
      { id: 'add-group', label: 'Add to group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare users', icon: 'users', onClick: fn() },
      { id: 'export', label: 'Export members', icon: 'download', onClick: fn() },
      { id: 'refresh', label: 'Refresh access', icon: 'refresh', onClick: fn() },
      { id: 'deactivate', label: 'Deactivate user', icon: 'pause', onClick: fn() },
    ],
  },
  render: (args) => narrowFrame(<ActionBar {...args} />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await settle();

    const more = await canvas.findByRole('button', { name: 'More' });
    await waitFor(() => expect(barButtonLabels(canvasElement)).not.toContain('Deactivate user'));
    await expect(barButtonLabels(canvasElement)).toContain('Add to group');
    await expect(more).toHaveAttribute('aria-expanded', 'false');
  },
};

export const TierHoldsOverflowAndCustomContent: Story = {
  parameters: { viewport: { value: 'sidepanelCompact' } },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [
      { id: 'add-group', label: 'Add to group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare users', icon: 'users', onClick: fn() },
      { id: 'export', label: 'Export members', icon: 'download', onClick: fn() },
      { id: 'refresh', label: 'Refresh access', icon: 'refresh', onClick: fn() },
      {
        id: 'clear-sessions',
        label: 'Clear sessions',
        icon: 'key',
        priority: 'tier',
        onClick: fn(),
      },
    ],
    expansion: (
      <div className="space-y-2">
        <p className="text-xs text-neutral-600">
          Password last changed 12 Mar 2026 · jane.doe@example.com
        </p>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
    ),
  },
  render: (args) => narrowFrame(<ActionBar {...args} />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', { name: 'More' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(barButtonLabels(canvasElement)).not.toContain('Clear sessions');

    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    const tierId = more.getAttribute('aria-controls') ?? '';
    const tier = within(canvasElement.ownerDocument.getElementById(tierId) as HTMLElement);
    await expect(tier.getByRole('button', { name: 'Clear sessions' })).toBeVisible();
    await expect(tier.getByRole('button', { name: 'Reset password' })).toBeVisible();
  },
};
export const AlignsWithTheRung: Story = {
  args: {
    actions: [
      { id: 'add-group', label: 'Add group', icon: 'plus', variant: 'primary', onClick: fn() },
      { id: 'compare', label: 'Compare', icon: 'users', onClick: fn() },
    ],
    expansion: (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
      </div>
    ),
  },
  render: (args) => (
    <div className="w-[480px] space-y-6 bg-canvas p-6">
      <ActionBar {...args} />
      <DetailSection title="Membership source">
        <p className="text-sm text-neutral-600">
          A section fills the column edge to edge, and so does the strip above it. They are the same
          kind of box until the strip docks and grows past the column into the panel.
        </p>
      </DetailSection>
    </div>
  ),
};

export const WithSelectionRegister: Story = {
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [
      {
        id: 'export-list',
        label: 'Export list',
        icon: 'download',
        variant: 'primary',
        onClick: fn(),
      },
      { id: 'cross-search', label: 'Cross-search', icon: 'search', onClick: fn() },
    ],
    register: {
      ariaLabel: 'Actions for the selected groups',
      actions: [
        {
          id: 'compare',
          label: 'Compare',
          icon: 'chart',
          onClick: fn(),
          title: 'Compare the 3 selected groups',
          priority: 'pinned',
        },
        {
          id: 'export-selection',
          label: 'Export',
          icon: 'download',
          onClick: fn(),
          title: 'Export the 3 selected groups',
        },
        {
          id: 'merge',
          label: 'Merge',
          icon: 'link',
          onClick: fn(),
          title: 'Copy the 3 selected groups’ members into one survivor',
          priority: 'tier',
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Actions for the selected groups' });
    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Compare');

    await expect(
      within(register).queryByRole('button', { name: 'Export list' }),
    ).not.toBeInTheDocument();

    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', { name })).not.toBeInTheDocument();
    }

    for (const button of within(register).getAllByRole('button')) {
      await expect(button.textContent ?? '').not.toMatch(/\d/);
    }
    await expect(
      within(register).getByRole('button', { name: 'Compare' }),
    ).toHaveAccessibleDescription('Compare the 3 selected groups');

    await expect(canvas.getAllByRole('button', { name: 'More' })).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await expect(canvas.getByRole('button', { name: 'Merge' })).toBeVisible();
  },
};

export const TheRegisterHoldsItsRowWhenEmpty: Story = {
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [
      {
        id: 'export-list',
        label: 'Export list',
        icon: 'download',
        variant: 'primary',
        onClick: fn(),
      },
    ],
    register: { ariaLabel: 'Actions for the selected groups', actions: [] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', { name: 'Actions for the selected groups' });

    await expect(register).toBeInTheDocument();
    await expect(within(register).queryAllByRole('button')).toHaveLength(0);

    await expect(canvas.getByRole('button', { name: 'Export list' })).toBeVisible();
  },
};

export const TheTierHoldsItsSpaceWhenEmpty: Story = {
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [
      {
        id: 'export-list',
        label: 'Export list',
        icon: 'download',
        variant: 'primary',
        onClick: fn(),
      },
    ],
    testId: 'empty-tier-bar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();

    const band = canvas.getByTestId('empty-tier-bar');
    const tier = band.querySelector('.disclose');
    await expect(tier).not.toBeNull();
    await expect(tier).toHaveAttribute('data-open', 'false');
    await expect(tier).toHaveAttribute('inert');
  },
};
