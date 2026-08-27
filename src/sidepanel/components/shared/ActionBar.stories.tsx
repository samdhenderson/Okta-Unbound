import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import ActionBar from './ActionBar';
import Button from './Button';
import DetailSection from './DetailSection';
import EntityIdentity from './EntityIdentity';
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
          "The rule this enforces: **a verb whose object is the whole page belongs here; a verb scoped to one section's data belongs in that section's `DetailSection.actions` slot.**\n\n" +
          'Before this existed, "Compare" sat in the group-memberships card header — structurally indistinguishable from "Add to group", which acts on that card alone — so the page\'s most important action read as a property of one section.\n\n' +
          '**Actions are data, not children.** The strip takes `ActionDescriptor[]` rather than `Button` children, because a strip that cannot see what it holds cannot decide what fits. With descriptors it measures each action once and re-splits the row as the panel is dragged: everything on a wide panel, icons dropped when it tightens, the tail behind **More** when it tightens further. `shared/actionBarFit` does the arithmetic and `shared/useActionOverflow` does the measuring; this component only renders their answer. The price is that a descriptor can carry no JSX — an arbitrary node cannot be measured from a cached width, nor re-rendered into the tier with different chrome. Arbitrary UI goes in `expansion`, which is the whole point of that slot.\n\n' +
          "**A card at rest, a band once docked.** The strip is the width of every other card on the rung — it spans the tab column and stops at its margins, so it lines up with the sections beneath it instead of reading as a different kind of object. Reaching its parking spot is not the same as looking parked, so over the last `--merge-range` (16px of travel) before it docks it grows *past* those margins to the panel edges, drops its radius and its top and side borders, covers the header's bottom seam and grows a shadow — header and strip end up one continuous pinned surface. Only the chrome moves: the merge animates a `::before` box, never the row, so every verb holds still and the overflow observer watches a band width that never churns. **More** sits at the trailing edge with a hairline immediately to its left, which is the boundary between the verbs and the way to reach the rest of them.\n\n" +
          '**The cramped ladder: icons first, then overflow.** When the row tightens, every bar action drops its glyph — globally, never per action, because a row with some icons and some without reads as broken. Only when the bare labels still do not fit does the tail move into the tier, last-declared first. A `pinned` action never leaves the bar, and a `primary` action is pinned by default.\n\n' +
          '**The tier is a region, not a menu.** What sits behind **More** is a second row inside the band: it stretches the strip downward through the shared `.disclose` grid instead of dropping a card into the flow beneath it, and it shares the strip\'s chrome and its merge. It holds two things, in order — the actions that did not fit, which the strip owns and the caller never sees, and then `expansion` verbatim, be that an account-state block, a form, or anything else. That second half is exactly why it is a disclosure region rather than a `role="menu"` popover: a menu may contain menu items and nothing else, which would forbid the arbitrary UI this slot exists for. Its children stay mounted while closed, held out of the tab order and the accessible tree with `inert`.\n\n' +
          '**Why it sticks:** the side panel has exactly one scroller, the `overflow-y-auto` app root, which `TabPanel` shares and which the Users tab does not shadow with a scroll box of its own. The strip is the third band of the sticky stack (ADR-0032), parking below the tab rail and the page header rather than at the top of the scroller.\n\n' +
          'The merge is driven by a CSS scroll-driven animation on a zero-size view-timeline sentinel rendered just before the strip, so it tracks *distance to the header* rather than raw scroll offset, with no per-frame JavaScript on the shared scroller. Anchoring it to scroll offset instead is visibly wrong: a strip that starts partway down a long rung finishes merging while it is still floating mid-page.\n\n' +
          'Related internals: `shared/actionBarFit`, `shared/useActionOverflow`, `shared/DetailSection`, `shared/PageHeader`, `shared/CollapsibleSection`.',
      },
    },
  },
  argTypes: {
    actions: {
      description:
        'The page\'s verbs as data, ordered by weight. Exactly one `variant="primary"`; the rest `secondary`. Order matters twice: it is the reading order, and the tail is what overflows first. `priority` defaults to `flex` (`pinned` for a `primary` action); `tier` keeps an action behind **More** from the start.',
    },
    ariaLabel: {
      description:
        'Accessible name for the group, e.g. `"Actions for Jane Doe"`. Required — a bare group of buttons announces nothing about what it acts on.',
    },
    sticky: {
      description:
        'Pin below the tab rail and the page header while the page scrolls under it, merging into the header as it docks. Defaults to `true`; pass `false` in an already-fixed region, which also opts out of the merge (the strip then simply keeps its resting card).',
    },
    expansion: {
      description:
        'Arbitrary caller UI for the tier, appended below anything that overflowed there. Inside the strip, not a sibling card — it shares the chrome and docks with it. A block that merely *follows* the strip on the page is a `DetailSection`, not this.',
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
