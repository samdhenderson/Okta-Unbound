# Design system

The "Odyssey" design system. Tokens are defined once in
[`src/sidepanel/tailwind.css`](../src/sidepanel/tailwind.css) `@theme` block and
consumed as Tailwind utilities (`bg-primary`, `text-neutral-700`) or CSS vars
(`var(--color-success-text)`).

## Hard rule: no raw hex

**Never write a hex color outside `tailwind.css`.** Every color maps to a token.
The lint/review gate greps for `#[0-9a-fA-F]{3,6}` in `src/sidepanel/components/**`
— the only allowed match is inside `tailwind.css`. If you need a color that
doesn't exist, add a token; don't inline a literal.

## Color tokens

Semantic (each has base + variants where defined):

| Token     | Base      | Variants                                                       |
| --------- | --------- | -------------------------------------------------------------- |
| `primary` | `#546be7` | `-text`, `-dark`, `-light`, `-highlight`                       |
| `danger`  | `#e72500` | `-text`, `-light`                                              |
| `success` | `#16884a` | `-text`, `-light`                                              |
| `warning` | `#a16c03` | `-text`, `-light`                                              |
| `info`    | `#546be7` | `-light`                                                       |
| `accent`  | `#9333ea` | `-dark` — distinguishes the "user page" context (`ContextBar`) |

Neutral scale: `neutral-50, 100, 200, 300, 400, 500, 600, 700, 900`
(note: no `800`). Use for text (`neutral-900` headings, `neutral-700` body,
`neutral-400` **disabled controls and decoration only** — see Contrast below),
borders (`neutral-200`), and surfaces (`neutral-50`).

## Contrast, and the muted register

Measured 2026-09-17 against the surfaces these strings actually render on — the
diff row (`bg-white`, hover `bg-neutral-50/70`), `ListRow`'s default (`bg-white`)
and selected (`bg-primary-light`) states, and the canvas (`bg-canvas`, the same
value as `neutral-50`):

| Text token    | on `white` | on `neutral-50` / `canvas` | on `primary-light` |
| ------------- | ---------- | -------------------------- | ------------------ |
| `neutral-400` | 2.22:1     | 2.02:1                     | 2.01:1             |
| `neutral-600` | 5.10:1     | 4.64:1                     | 4.62:1             |

**`neutral-600` is the floor for a non-answer.** A string that tells a reader the
app does _not_ know something — `Source unknown`, `Source not compared`, a
deduction that must not be read as proven — is the text a reader most needs to
notice, so it clears 4.5:1 on every surface above. `AppScopeIndicator` and
`GroupSourceIndicator` set the register: `italic text-neutral-600`, un-chipped,
beside a `neutral-100` chip for the proven answer. Muted means "not a chip", never
"hard to read".

`neutral-400` is not a text colour on any of those surfaces. It remains correct on
`disabled:` variants (WCAG 1.4.3 exempts disabled controls) and on `aria-hidden`
decoration.

**Open, and deliberately not settled here:** whether the wider `neutral-500`
(secondary) / `neutral-400` (tertiary) two-step hierarchy — 168 and 58 uses
respectively across the panel — keeps its two tones, and at what size and weight
each is allowed. `neutral-500` is 3.02:1 on `neutral-50`, so the question is real,
but re-tuning a hierarchy is a visual-design decision for the design-polish pass,
not a find-and-replace. Only the two non-answer sites above have been measured
against their rendered background.

## The story a11y gate does not check contrast

`.storybook/preview.tsx` sets `a11y.test: 'error'`, and a story with an axe
violation does fail the browser suite. It fails on **structural** rules only.

Proven by probe on 2026-09-17: a temporary story rendering
`text-neutral-400` on `bg-white` was run through `npm run test:storybook`, with a
play function calling `axe.run(canvasElement, { runOnly: ['color-contrast'] })`
directly. Axe reported `passes: 1` — not a violation, and not `incomplete`. The
same story logged `getComputedStyle`: `color: rgb(0, 0, 0)`,
`background-color: rgba(0, 0, 0, 0)`, `font-size: 16px`, and
`--color-neutral-400` resolving to the empty string, with three stylesheets and 79
rules in the document (Storybook's own chrome). **The vitest browser runner
applies no Tailwind**, so every story renders as unstyled black-on-default-white
and axe measures 21:1 on text whose real ratio is 2.22:1. A control story in the
same run (`<button type="button" />`) did fail on `button-name`, which is what
confirms the gate itself is live.

So: **contrast is established by measurement, never inferred from a green story
run.** Compute the ratio against the surface token the component actually renders
on, the way the table above was built. This also voids any story assertion about
layout, spacing or colour — the classes are not applied in that environment.

## Surfaces

The canvas/card model, card elevation and `.lift`, the docking band's resting shape,
and `ListRow`'s chrome and interior contract live in [surfaces.md](./surfaces.md).

Two colour/type rules that live here rather than there:

- Field labels (label-above-value) are `text-xs font-medium text-neutral-600`; uppercase
  section eyebrows go through the shared `Eyebrow` primitive — see Typography below.
- **Status vocabulary is `danger`, not `error`.** The status union is
  `'success' | 'warning' | 'danger' | 'info'`.

## Chart / dataviz palettes

Sequential ramps for data visualization (e.g. `AttributeFacet`) are the one place
a multi-stop palette is legitimate. They live as named exported constants in
[`src/sidepanel/theme/chartPalette.ts`](../src/sidepanel/theme/chartPalette.ts)
(outside `components/**`, so the hex gate does not apply) — never inline hex in a
component. Stops reference Odyssey tokens via CSS vars where an equivalent exists;
the genuinely chart-only tints (`INDIGO_RAMP`) are documented in that module.

## Typography

- `--font-primary` / `--font-heading`: Inter (UI + headings)
- `--font-mono`: Roboto Mono (IDs, tokens, code)

Type scale via Tailwind: `text-xs` (chips/meta), `text-sm` (body), `text-base`
(emphasis), `text-lg` (modal/section titles). Weights: `font-medium` (secondary),
`font-semibold` (primary/headings).

**There is exactly one eyebrow recipe: `text-xs font-semibold uppercase tracking-wide
text-neutral-600`**, and it lives in the shared `Eyebrow` component
(`components/shared/Eyebrow.tsx`) — never hand-roll it. `Eyebrow` has no colour,
size or tracking prop by design; a section that wants a different treatment is the
drift it exists to stop.

## Spacing

**Consume a role, never a raw step.** Six semantic roles resolve against the
panel's measured width, so the same class gets tighter at 360px and roomier at 720px
without a prop, a setting, or a second code path:

| Token                       | Role                        | Consume as            |
| --------------------------- | --------------------------- | --------------------- |
| `--sp-gutter`               | Panel horizontal padding    | `px-(--sp-gutter)`    |
| `--sp-rung`                 | Gap between stacked cards   | `space-y-(--sp-rung)` |
| `--sp-card`                 | Inside a `DetailSection`    | `p-(--sp-card)`       |
| `--sp-row-y` / `--sp-row-x` | `ListRow` padding           | `py-(--sp-row-y)`     |
| `--sp-inline`               | Between chips, pills, icons | `gap-(--sp-inline)`   |
| `--sp-field`                | Between form controls       | `gap-(--sp-field)`    |

`--sp-gutter` covers both axes — a tab root is `px-(--sp-gutter) py-(--sp-gutter)`.
There is no separate vertical role; `gutter` and `card` resolve to the same value at
every density, so a fourth would render identically and only invite disagreement.

Three density scopes — `compact` below 400px, `default` 400–559, `comfortable` at 560+.
**Density is derived from panel width, never chosen**, and it changes space only: type
never scales. `--sp-rung` is the one role that does not widen at `comfortable`: it holds
at 16px across `default` and `comfortable`, because a 24px gap between stacked cards read
as drift rather than as breathing room. `[data-density='…']` pins a scope for a story or a test and wins over the
width query.

A raw `p-4` on a card is a defect the same way a raw duration literal is. Radius is
still `rounded-md`. Component sizing goes through the size props, not ad-hoc padding:
`sm|md|lg` for most primitives, with `Icon` (`xs`…`xl`) and `LoadingSpinner`
(`sm`…`2xl`) carrying extra steps and sharing size names with each other — see
`docs/components.md`.

## Token violations

No known token violations. Every color in `components/**` maps to an Odyssey token;
the `ActivityBar` and `AttributeFacet` (palette in `theme/chartPalette.ts`) are
token-based, and `ContextBar` carries no raw hex.

## Motion

Durations and easings live in their own `@theme static` block in the same
`tailwind.css` file, under the identical hard rule: never write a raw `ms` or
`cubic-bezier()` outside it. Full token table, the nine animation primitives, the
reduced-motion contract, and the skeleton-vs-spinner rule are in
[motion.md](./motion.md); the scroll-driven and sticky-stack choreography is in
[motion-recipes.md](./motion-recipes.md). This section is just the pointer.

One cross-cutting gotcha worth flagging here rather than only in the motion doc:
`Modal.tsx`'s `EXIT_MS`, `useCountUp`'s `COUNT_UP_MS` and `PageHeader.tsx`'s
`SWAP_MS` are hand-kept mirrors of `--dur-quick`, `--dur-tell` and `--dur-move`
respectively, not runtime reads of the CSS custom property —
`getComputedStyle().getPropertyValue('--dur-*')` returns `''` in jsdom, so the
duration cannot be sourced from CSS at the point these components need it in every
environment this code runs in. If any of those tokens in `tailwind.css` moves, its
hand-kept mirror must move with it; there is no lint gate for this today.
