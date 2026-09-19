# The list rung's controls

Every list rung carries the same two lines of furniture around its rows: a **filter row**
(the search field and the funnel that discloses the filter panel) above the list, and a
**count row** (the numbers, and the two controls that move the selection) directly on top
of the rows. Neither holds verbs — those are the strip's, in
[action-bars.md](./action-bars.md). This doc is the contract for both.

## The filter row

The shape is fixed, and three rungs share it: a search `Input size="lg"` with a leading
glyph, then a `FilterToggle`, rendered as the node the strip takes as its `subRow` so the
band and the list dock as one surface. The filter panel is a **sibling below the band** —
never `ActionBar`'s tier, which would let the panel outlive the control that closes it.

The tab shell owns the panel's open state and every axis it sets, so one set of values
drives both the panel and the filtered list; the panel itself is fully controlled and
states no counts of its own. `AppsToolbar` + `AppsFilterPanel`, `RulesSearchRow` +
`RulesFilterPanel`, and `GroupsTab`'s search row + `GroupFilterPanel` are the three. Groups
is the one rung that also renders its search row **outside** a band: in live-search mode
there is no selection and so no strip to dock into, and the toggle is dropped with the
panel it would disclose, because live results are not what the cached filters filter.

### `FilterToggle`

A raw `<button>` by decision, under [components.md](./components.md)'s §3 exception: the
primary-light active wash maps onto no `Button` variant, and `Button` emits
`aria-expanded`/`aria-controls` but no `aria-pressed`.

**It is icon-only.** The funnel already says "filters", so the word beside it said it
twice, and at 360px it spent width the `flex-1` search field needs. `label` therefore sets
the **accessible name only** and is never rendered: it defaults to `Filters`, and above
zero the count joins it there (`Filters, 2 applied`) rather than reaching a screen reader
as a bare digit. The badge itself is `aria-hidden`, renders only above zero, and sits in a
`StableWidth` slot so applying a filter cannot narrow the field beside it.

**State reaches a reader who cannot read the wash.** `controls` picks the semantics: pass
the disclosed region's `id` for `aria-expanded` + `aria-controls`; omit it and the control
reports `aria-pressed`. The `title` names the action the press performs — `Show filters`
closed, `Hide filters` open — so a hover states the state in words. Pass `title` only to
replace both. The wash is on for `open || activeCount > 0`, which is what keeps a
collapsed panel with filters still applied legible as a state now that no word is present.

`size` matches the `Input` beside it (`lg` beside an `Input size="lg"`) and the padding map
is square, so the pair reads as a field and a square button of one height.

### The badge counts axes, never pills

`Status: Inactive` is one filter, not three buttons. Each panel exports one counting helper
beside itself — `countDisclosedAppAxes`, `countActiveRuleFilters` — and the toggle renders
what it returns. **A non-default sort counts as an axis:** a reader who left
`Created, newest first` on has a list whose order they cannot otherwise explain with the
panel shut. Apps and Rules count it. Groups' badge counts its five filter axes and not the
sort its own panel owns, so it understates what the closed panel is hiding; Apps and Rules
are the shape to copy.

## The count row

`ListCountRow` is the row: `ListCountLine`'s prose, and the two controls that move the
selection, on one line. `ListCountLine` stays the primitive that **writes the numbers** —
`ListCountRow` wraps it, and is what a **selectable** list uses. It takes `ListCountLine`'s
props (`shown`, `of`, `selected`, `testId`) plus an optional `selection`, and a `className`
for the row's layout and spacing only, never its type or colour.

Omit `selection` and the row is the count line alone. Pass it and the row grows
`Select all` and `Deselect all` as trailing `link` controls: `selectableCount` (what
`Select all` would take), `onSelectAll`, `onDeselectAll`, and the two `title` strings.
**The titles belong to the caller** — each rung names its own noun and its own boundary
("every group matching the current filters", "every policy in this org"), so the component
never composes a sentence whose grammar it would have to guess.

Three properties are the contract, and each is a rule
[action-bars.md](./action-bars.md) states about a selection:

- **No label carries a count.** The line already says how much is on screen and how much
  is ticked, once. The boundary a control is standing on travels in its `title`, which on
  an element with text content is the accessible _description_, not the name.
- **`Deselect all` is declared first**, and renders only once something is ticked. The
  leading position of a set that varies must hold a control whose worst outcome is another
  click. Because the cluster is trailing, its arrival grows the cluster leftward, so
  `Select all` does not move under the pointer that just ticked a row.
- **`Select all` is disabled at its boundary, never omitted** — at `selectableCount === 0`
  and at `selected === selectableCount`. Passing `selection` at all costs the row its full
  height immediately, so nothing grows on the first tick.

The layout is `flex-wrap-reverse` with `ml-auto` on the cluster, measured in Chrome rather
than guessed: the controls sit beside the count when the row is wide enough and wrap to a
line **above** it when it is not, because cross-start is the bottom edge under
`wrap-reverse`. No breakpoint and no container query is involved — the panel root is the
viewport.

Callers gate on having rows at all: an empty list is described by its empty state, not by
`Showing 0 of 0` with a dead `Select all` beside it. `GroupsListPanel`, `AppsListPanel` and
`PoliciesListPanel` are the three adopters.

## Why the furniture is not on the strip

`Select all` and `Deselect all` used to be the leading descriptors of `ActionBar`'s
selection `register`. They are furniture — they say how to start and stop ticking, rather
than doing anything to what was ticked — so they now stand beside the figures they change,
and the register holds selection **verbs** only. A rung with a selection but no selection
verb (Applications, Auth Policies) passes no register at all, because a reserved row
holding space for nothing is padding, not protection. The register's remaining rules,
including what a rung owes when it declares its first selection verb, are in
[action-bars.md](./action-bars.md).
