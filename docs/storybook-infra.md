# Storybook infrastructure

The rig around the stories: viewport presets, the motion default, framing for
fixed components, the browser test suite, screenshots on demand, and the static
docs-site build. Writing a story is the other half —
[component-explorer.md](./component-explorer.md).

## Side-panel viewport presets

`preview.tsx` registers three side-panel width presets under the toolbar's
**Viewport** control: `sidepanelCompact` (360px), `sidepanelDefault` (480px) and
`sidepanelWide` (720px). The extension lives in a Chrome side panel the user
drags freely, so a layout that only holds at one width is a defect — switch a
story between the presets to check. No preset is the default, so stories fill the
canvas as before.

Nothing in the panel branches on a width breakpoint — the `ActivityBar`'s collapse
is offered at every width — so the presets are for looking, not for reaching a second
code path.

The presets resize the explorer preview only. The headless test runner renders at
its own window size, so exercise width-dependent logic through the presentational
prop — e.g. `ActivityBarView`'s `collapsed` — for automated coverage.

## Motion is off by default in stories

`preview.tsx`'s `withMotion` decorator stamps `data-motion="off"` on every story
root, which `tailwind.css` matches with the same declaration block as
`@media (prefers-reduced-motion: reduce)`. Two reasons: every story is a render
test in headless Chromium (and the suite already carries `retry: 2` for a Vite
dep-optimizer race, so a second timing-shaped flake source is unwelcome), and
`npm run shoot` would otherwise catch entrance animations mid-flight and produce a
different contact sheet each run. A useful side effect is that the reduced-motion
path gets exercised by every story test on every CI run.

A story whose _subject_ is the animation opts back in:

```tsx
export const ExitTransition: Story = {
  parameters: { motion: 'on' },
  // …no `play` function — see below
};
```

Keep `play` functions off motion-enabled stories: an interaction assertion racing a
220ms transition is exactly the flake the default is there to prevent. If a
motion-enabled story does need one, drive it with `findBy*`/`waitFor`, never
`getBy*`.

Token rules for the animations themselves live in [motion.md](./motion.md).

## Fixed / bottom-anchored components

A `position: fixed` component (the `ActivityBar`/`ActivityBarView`, which pin to
`bottom-0`) otherwise renders at the bottom of an empty page in the canvas and
escapes the autodocs preview block entirely. Wrap those stories in the shared
`inSidePanelFrame` decorator (`.storybook/decorators.tsx`): a `transform` on the
wrapper establishes a containing block, so the fixed bar anchors to a bounded,
panel-sized frame and renders in view, in context. Reach for it whenever a new
component is `position: fixed`.

## Stories as browser tests (`@storybook/addon-vitest`)

`vitest.config.ts` has two projects: `unit` (jsdom) and `storybook`
(headless-browser, where every story becomes a render test and a story's `play`
function becomes an interaction test). Scripts:

```
npm run test:run         # jsdom unit project only (fast, browser-free)
npm run test:storybook   # the browser story suite
```

CI runs both (the `storybook` job installs Chromium). Locally, set
`VITEST_BROWSER_EXECUTABLE` to a Chromium path to skip the download. A story that
genuinely can't run headless (e.g. a deliberately-throwing one) is opted out with
the `!test` tag — `tags: ['autodocs', '!test']` — and stays in the explorer.
a11y is enforced (`preview.tsx` `a11y.test: 'error'`): a story with an axe
violation fails the suite.

## Screenshots on demand (`npm run shoot`)

`.storybook/scripts/shoot-stories.mjs` renders stories headlessly and writes PNGs
to `shots/` (gitignored). It exists so a **reviewer or coding agent can see the UI**
without booting the extension — a design-system or UX review reads pixels instead
of inferring them from Tailwind classes.

```
npm run shoot -- Shared/Button           # all 10 variants → ONE contact sheet
npm run shoot -- shared-button--loading  # a single story, by id
npm run shoot -- Rules --list            # matching ids only, no browser launch
npm run shoot -- Modal --split           # one PNG per story instead of a sheet
```

Filters are case-insensitive substrings of `Title/StoryName` (an exact story id
also matches); at least one is required. Flags: `--max=12` (cap, reported when it
truncates), `--width=480` / `--height=900` (canvas, defaults to the
`sidepanelDefault` preset), `--cell=320` (on-sheet cell width), `--out=shots`.

Three properties matter, and each is a deliberate choice:

- **Context economy.** Multiple matches compose into one labelled sheet, and every
  capture is cropped to its rendered content. Ten Button variants cost ~630 image
  tokens as a sheet versus ~5.7k as ten full-panel PNGs — blank pixels bill the
  same as drawn ones.
- **Play functions run.** The canvas executes them, so the Template-B mocked
  states (`Loading`, `Empty`, `ErrorState`) capture in their real state rather
  than falling back to the default mock.
- **System Chrome.** It launches with `channel: 'chrome'`, so Playwright's managed
  browser download isn't needed (the same constraint behind
  `VITEST_BROWSER_EXECUTABLE` in `vitest.config.ts`).

It reuses a dev server on `:6006` when one is up, otherwise starts a throwaway one
on a free port and stops it on exit — so a single command works from nothing, and
keeping `npm run storybook` running just skips the boot (a few seconds with Vite's
cache warm, up to a minute cold).

Two known limits: a story whose content is entirely `position: fixed` (a modal
overlay) can't be measured for cropping and falls back to the full canvas, which
is the right framing anyway; and the `sidepanelCompact`/`Wide` viewport presets
are explorer-only toolbar state, so reach for `--width=360` to preview the narrow
collapse.

## One docs site: Components + Internals + Documentation

The static build is the whole documentation site, three sidebar sections:

- **Components** — stories + autodocs (component TSDoc).
- **Internals** — the auto-generated API reference for non-component code. TypeDoc
  emits Markdown (`typedoc-plugin-markdown`), `bundle-internals.mjs` groups it per
  subsystem, and `gen-doc-pages.mjs` writes MDX wrappers that render it via the
  `Markdown` doc block. Refresh with `npm run docs`.
- **Documentation** — the `docs/*.md` specs, rendered the same way.

Both scripts write to `.storybook/generated/` (gitignored); `build-storybook` runs
them first. Hook-coupled components carry a **"Related internals"** cross-link block
(`parameters.docs.description.component`) to the API pages they use — add one when
you build a new hook-coupled component.

## Deploying: one push, two sites

This file is the rig, and the rig now deploys two sites. The component explorer
is the published root; the user guide is `/guide/`, built from the same commit
by `npm run build-guide` (`vite.guide.config.ts`) and copied under
`storybook-static/` before the push. They go together because they are one
artifact: a guide showing a component the explorer no longer documents would be
a lie a reader has no way to detect. The guide's own rules, and the one way the
hosted copy differs from the extension page, are in
[guide.md](./guide.md#the-hosted-guide); the deploy also runs
`src/guide/frameRule.test.ts` as its gate, because that rule pays off exactly
when the page is served from a host with no extension runtime.

The single `.nojekyll` at the published root covers `/guide/` too.

`.github/workflows/deploy-pages.yml` builds both here and pushes them to the
public mirror's `gh-pages` branch, where they are served. It publishes across
repositories for two reasons: this repo is private, and public Pages from a
private repo needs a paid plan; and the mirror cannot build the site itself,
because its source is comment-free and TypeDoc there would emit an empty
Internals section. The comments only exist here, so the build only happens here.
Setup is a `PUBLIC_REPO_TOKEN` secret on this repo and Pages pointed at
`gh-pages` on the mirror; the workflow header states both.

Pages serves with a ten-minute cache. Assets are content-hashed and safe, but
`index.html` (the explorer's, `iframe.html`, and now the guide's) can be briefly
stale after a deploy and reference a chunk the force-push has already replaced,
which reads as a blank page and is fixed by a hard reload. Known property, not a
new one.
