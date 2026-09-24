import{j as e}from"./iframe-mmN7AxbW.js";import{u as a,M as s,c as o}from"./blocks-6hb-cuWT.js";import"./preload-helper-PPVm8Dsz.js";const i=`# 0008 — A strip may host a verb scoped to a filter, over a basket that is not the basket

Status: Accepted — 2026-09-15

## Context

\`docs/action-bars.md\` asks one question before any other about a new verb:

> **Is its object the whole page?** No — it belongs to a section, a selection or a
> filter, not this row.

That rule is right, and it is why the group detail strip holds _Add_, _Compare_ and
_Export members_ rather than a drawer of everything an admin might do to a group.

The job that broke it is ordinary. An admin opens a group, narrows the Members
roster to the forty-seven people whose \`department\` drifted, and wants to set that
attribute on exactly those forty-seven. The capability already existed —
\`setUserProfileAttribute\`, a basket verb with a schema-driven attribute list, a
per-user mastering gate, observed-value spreads and a measured preflight — but the
only way to reach it was: _Select all_ → the Selection tab → the Actions pane.

That route has a defect worse than its length. _Select all_ **replaces** the basket's
user partition, so an admin who had been assembling a cohort across several screens
loses it as a side effect of pressing a button about this group's roster.

## Decision

**Three things, and the third is the one that matters.**

**1. A filter-scoped verb may sit in the tier — never the row.** A named carve-out to
placement rule 1, with four conditions, all required: the filter is owned by a pane
_of this rung_; the label carries the **measured** surviving count; the descriptor is
**absent** unless that pane is the one on screen; and \`expansion\` carries one sentence
naming the scope, because a descriptor carries no JSX and "members" alone reads as all
of them.

The third condition is doing more work than it looks like. A strip is visible across
all five panes, so a descriptor reading _Set attribute on 47 members_ while the reader
is on Overview quotes a filter with no visible referent — a claim the reader cannot
check, which is what \`docs/claims.md\` forbids.

**2. A verb may be run from outside the Selection tab, over an ad-hoc basket.**
\`SelectionBasket\` is \`{ picked: SelectionRef[] }\` — a plain value, not a store handle.
So \`userCohortBasket(users)\` builds one, \`useVerbRun\` drives it, and the verb cannot
tell the difference because there is none to tell. The real store is never written.

**3. The verb itself does not change.** Not one line of \`profile.ts\` moved. The cap,
the mastering gate, the preflight and the refusals are all still the verb's, which is
the only reason two surfaces can offer the same write without drifting apart.

## Alternatives rejected

Each of these is reasonable for about a minute, and none of them leaves a trace in the
resulting code explaining why it was not taken.

- **Put it in the Members section instead**, beside _Copy members_ — what placement
  rule 1 says. Defensible, and it was offered. Rejected by the person who has to use
  it: the strip is where this rung's verbs live, and a write hidden in a section's
  control line is a write nobody finds. The rule bends; the four conditions above are
  the price.
- **Tick the filtered set into the real basket on the reader's behalf, then run.** The
  smallest diff by far — it is what _Select all_ already does. It also destroys a
  cohort the reader assembled elsewhere, as an unannounced side effect of a button
  that said nothing about selection.
- **Truncate the cohort to \`MAX_CAPTURED_COHORT\`.** A run the reader did not ask for,
  over a subset they did not choose, is worse than a refusal.
- **Pre-empt the over-capture refusal in the strip** by hiding the verb past 100.
  Collapses three different facts — roster not loaded, nothing matched, too many
  matched — into one indistinguishable absence, and drops the remedy sentence the
  refusal carries. The strip _states_ the bound beside the control and lets the run
  surface enforce it.
- **Publish the filtered cohort upward from an effect.** A derived value lifted in an
  effect is a frame stale by construction, so the strip would quote a count for a
  filter the reader had already changed. The cohort is derived during render, in a
  hook the owner instantiates.
- **Give the strip its own \`useOktaApi\`.** A second instance is a second
  \`wrapOperation\` island; the ActivityBar's single cancel control could then target
  the wrong operation.

## Consequences

- \`useMemberCohort\` now owns search, facets and sort. \`MemberExplorer\` renders a
  cohort rather than deriving one, and takes an optional \`cohort\` prop — absent, it
  instantiates its own and is fully uncontrolled.
- A cohort over 100 is refused whole, in the verb's own words. This is a real ceiling
  on a 250-member group and the reader must narrow further; it is the price of an undo
  this app can actually honour.
- The carve-out is deliberately narrow. Two surfaces now offer this write and both go
  through one verb; a third that grew its own bulk-write implementation beside
  \`profile.ts\` would be the thing this record exists to prevent.
`;function r(t){return e.jsxs(e.Fragment,{children:[`
`,e.jsx(s,{title:"Documentation/ADRs/0008 A Verb Scoped To A Filter"}),`
`,e.jsx(o,{children:i})]})}function c(t={}){const{wrapper:n}={...a(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r()}export{c as default};
