import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import DetailSection from './DetailSection';
import Badge from './Badge';
import Button from './Button';
import FilterPill from './FilterPill';
import Input from './Input';
import EntityLink from './EntityLink';
import { NavigationProvider } from '../../contexts/NavigationContext';

const meta = {
  title: 'Shared/DetailSection',
  component: DetailSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'White card wrapper for one section of a detail view. Elevation comes from the 1px border alone, per the Odyssey surface model — no drop shadow on cards.\n\n' +
          'Originally scoped to the Group Detail view; promoted to the shared barrel when the detail pages adopted one layout language, because four other surfaces were hand-rolling near-copies with a drifting eyebrow (`tracking-wider` elsewhere against `tracking-wide` here).\n\n' +
          '**`title` is optional.** A tab already names its pane, so a section titled "Members" inside a tab labelled "Members" is the tab-level echo of ADR-0032\'s *the header describes the entity; the body must not repeat it*. A tab whose whole body is one section renders it untitled; a tab holding several titles each.\n\n' +
          "**`band` is a slot, not call-site markup.** Filter chrome has to reach the card's edges to read as chrome rather than as content, and a call site cannot do that from inside a padded body without a negative margin. The card holds the padding boundary; the band sits outside it. `overflow-hidden` is applied only when a band is present, so a section without one keeps the box model it always had.\n\n" +
          '**What belongs in `actions`:** a verb scoped to *this section\'s data* — a gate button that loads it, a control that mutates it, a count of it. A verb whose object is the whole page belongs in `ActionBar`. The split is not cosmetic: a page-level slot has no view of whether this section is loaded, so putting "Add member" there would let a reader mutate a list still behind its gate.\n\n' +
          "**`collapsible` is a capability of this card, not a second card.** It lives here rather than in `CollapsibleSection` because that component's *entire header* is one `<button>`, so it can carry a title and a count and nothing else. A section that folds **and** owns a gate button cannot be built there without nesting a button inside a button. Here the trigger is scoped to the heading and `description`/`actions` stay beside it, outside the control. Every disclosure prop is additive — a call site that passes none renders exactly the markup it always did.\n\n" +
          '**A folded section still answers something.** `summary` is the headline fact, shown while the section is closed. A stack of sections that all start closed is otherwise a column of bare headers, and a reader has to open each one to find out whether it was worth opening. It yields once the section opens — at that point it is a second copy of a number the reader can already see, one line above it.',
      },
    },
  },
  argTypes: {
    title: {
      description:
        'Section heading, rendered as an uppercase eyebrow `<h2>`. Optional — omit when the surrounding tab already names this content.',
    },
    band: {
      description:
        "Optional full-bleed band above the body, for a section's filter chrome. Supply contents only; padding, background and separator are the component's.",
    },
    description: { description: 'Optional one-line explanation under the heading.' },
    actions: {
      description:
        'Optional right-aligned header node (a count badge, a gated action button). Section-scoped verbs only.',
    },
    headingId: {
      description:
        'Id for the heading element, so a body region can point at it with `aria-labelledby`.',
    },
    collapsible: {
      description:
        "Fold the body behind the heading. Requires `title` — the heading text is the trigger's accessible name. The body stays mounted while collapsed (`inert`), so it keeps its own state.",
    },
    defaultOpen: {
      description: 'Whether a `collapsible` section starts expanded. Defaults to `true`.',
    },
    itemCount: { description: 'Optional count rendered as a badge beside the title.' },
    summary: {
      description:
        "The section's headline fact, shown in the header while the section is closed and hidden once it opens, where the body states it better. Ignored on a non-collapsible section.",
    },
    children: { description: 'Section body.' },
  },
  args: {
    title: 'App push',
    children: <p className="text-sm text-neutral-600">No push mappings for this group.</p>,
  },
} satisfies Meta<typeof DetailSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    title: 'Membership source',
    description: 'Splits the current members into rule-managed and manual.',
  },
};

export const WithCountBadge: Story = {
  args: {
    title: 'Group memberships',
    actions: <Badge variant="neutral">7</Badge>,
  },
};

export const WithGatedAction: Story = {
  args: {
    title: 'Membership source',
    description: 'Splits the current members into rule-managed and manual.',
    actions: (
      <Button variant="secondary" size="sm" icon="chart" onClick={fn()}>
        Analyze
      </Button>
    ),
    children: (
      <p className="text-sm text-neutral-500">
        Not analyzed yet. Reads all 412 members once, then classifies each against the rules that
        assign into this group.
      </p>
    ),
  },
};

export const Stacked: Story = {
  render: () => (
    <NavigationProvider handlers={{ rule: fn(), app: fn() }}>
      <div className="space-y-3 bg-canvas p-3">
        <DetailSection title="Rules" description="What feeds this group, and what points at it.">
          <div className="flex flex-wrap gap-2">
            <EntityLink type="rule" id="0prFAKERULE00001" name="Sales territory assignment" />
            <EntityLink type="rule" id="0prFAKERULE00002" name="Contractor onboarding" />
          </div>
        </DetailSection>
        <DetailSection title="Grants access to" actions={<Badge variant="neutral">3</Badge>}>
          <div className="flex flex-wrap gap-2">
            <EntityLink type="app" id="0oaFAKEAPP000001" name="Salesforce" />
            <EntityLink type="app" id="0oaFAKEAPP000002" name="Gong" />
            <EntityLink type="app" id="0oaFAKEAPP000003" name="Tableau" />
          </div>
        </DetailSection>
        <DetailSection title="Metadata">
          <p className="font-mono text-xs text-neutral-500">00gFAKEGROUP0001</p>
        </DetailSection>
      </div>
    </NavigationProvider>
  ),
};

export const Untitled: Story = {
  args: {
    title: undefined,
    children: (
      <p className="text-sm text-neutral-600">
        The pane&apos;s content starts at the top of the card, with nothing repeating the tab&apos;s
        label.
      </p>
    ),
  },
};

export const WithBand: Story = {
  args: {
    title: undefined,
    band: (
      <div className="space-y-3">
        <p className="text-xs text-neutral-600">62 by rule · 38 direct</p>
        <Input
          size="sm"
          type="search"
          value=""
          onChange={fn()}
          ariaLabel="Filter members"
          placeholder="Filter members…"
        />
        <div className="flex flex-wrap gap-1.5">
          <FilterPill active onClick={fn()}>
            All 100
          </FilterPill>
          <FilterPill active={false} onClick={fn()}>
            By rule 62
          </FilterPill>
          <FilterPill active={false} onClick={fn()}>
            Direct 38
          </FilterPill>
        </div>
      </div>
    ),
    children: (
      <ul className="space-y-1.5 text-sm text-neutral-700">
        <li>Ada Lovelace</li>
        <li>Alan Turing</li>
        <li>Grace Hopper</li>
      </ul>
    ),
  },
};

export const TitledWithBand: Story = {
  args: {
    title: 'Members',
    actions: <Badge variant="neutral">100</Badge>,
    band: <p className="text-xs text-neutral-600">62 by rule · 38 direct</p>,
    children: <p className="text-sm text-neutral-600">Roster goes here.</p>,
  },
};

export const NarrowWithBand: Story = {
  args: WithBand.args,
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const Collapsible: Story = {
  args: {
    title: 'About this group',
    collapsible: true,
    children: <p className="font-mono text-xs text-neutral-500">00gFAKEGROUP0001</p>,
  },
};

export const CollapsibleClosed: Story = {
  args: {
    ...Collapsible.args,
    defaultOpen: false,
  },
};

export const CollapsibleWithActions: Story = {
  args: {
    title: 'Attribute spread',
    description: "How each profile attribute is populated across this group's members.",
    collapsible: true,
    defaultOpen: false,
    itemCount: 11,
    actions: (
      <Button variant="secondary" size="sm" icon="chart" onClick={fn()}>
        Analyze
      </Button>
    ),
    children: <p className="text-sm text-neutral-600">The attribute cards go here.</p>,
  },
};

export const CollapsibleWithSummary: Story = {
  args: {
    title: 'MFA coverage',
    description: "Opt-in scan of each member's enrolled MFA factors. Never runs automatically.",
    collapsible: true,
    defaultOpen: false,
    itemCount: 2,
    summary: (
      <p className="text-sm text-neutral-600">2 of 40 members have no MFA factor enrolled.</p>
    ),
    children: <p className="text-sm text-neutral-600">The coverage cards go here.</p>,
  },
};

export const ClosedStack: Story = {
  render: () => (
    <div className="space-y-3 bg-canvas p-3">
      <DetailSection
        title="Attribute spread"
        collapsible
        defaultOpen={false}
        itemCount={11}
        summary={<p className="text-sm text-neutral-600">11 attributes · 3 flagged</p>}
      >
        <p className="text-sm text-neutral-600">Attribute cards.</p>
      </DetailSection>
      <DetailSection
        title="MFA coverage"
        collapsible
        defaultOpen={false}
        itemCount={2}
        summary={
          <p className="text-sm text-neutral-600">2 of 40 members have no MFA factor enrolled.</p>
        }
      >
        <p className="text-sm text-neutral-600">Coverage cards.</p>
      </DetailSection>
      <DetailSection title="About this group" collapsible defaultOpen={false}>
        <p className="font-mono text-xs text-neutral-500">00gFAKEGROUP0001</p>
      </DetailSection>
    </div>
  ),
};

export const SummaryYieldsWhenOpened: Story = {
  args: {
    ...CollapsibleWithSummary.args,
    summary: <p className="text-sm text-neutral-600">Summary: 2 of 40 have no MFA factor.</p>,
    children: <p className="text-sm text-neutral-600">Body: 2 of 40 have no MFA factor.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Summary: 2 of 40 have no MFA factor.')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: /MFA COVERAGE/i }));

    expect(canvas.queryByText('Summary: 2 of 40 have no MFA factor.')).toBeNull();
    expect(canvas.getByText('Body: 2 of 40 have no MFA factor.')).toBeInTheDocument();
  },
};
