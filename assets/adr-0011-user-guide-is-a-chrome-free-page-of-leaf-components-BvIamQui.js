import{j as e}from"./iframe-mmN7AxbW.js";import{u as o,M as s,c as r}from"./blocks-6hb-cuWT.js";import"./preload-helper-PPVm8Dsz.js";const i=`# 0011: The user guide is a chrome-free page of leaf components

Status: Accepted, 2026-09-21

## Context

The extension needed a place to show a new reader what each tab is for, opened
once on install and again when an update has something new to read. The
question was what a chapter's picture is made of.

## The fork

**Full-flow demo tabs against the demo org.** Mount the real tabs inside the
guide page with the demo fixtures behind them, so a chapter can walk a flow end
to end: search, open, act, undo. To do that the tabs need a runtime seam where
the API facade is swapped for a demo implementation, a \`chrome.*\` fake shipped
in the package for the storage and messaging the tabs assume, and a namespaced
IndexedDB so the guide's demo writes never touch the panel's real cache. About
25 files, most of them in the panel rather than the guide, and every one a
place where the demo path and the live path could drift apart.

**Real leaf components with static fixtures.** Compose the presentational
components the tabs are built from, fed by the same \`sidepanel/demo/\` fixtures
the reel uses. A frame may hold local state so it can be poked, but it never
fetches and never writes. Nothing in the panel changes.

## Decision

The leaf route. A chapter is a page of real leaf components fed static
fixtures, and the guide is **chrome-free**: nothing under \`src/guide/\` names
\`chrome.\`, and nothing it imports reaches the facade, the scheduler, the caches,
or a \`chrome.storage\`-backed store. The one chrome-bound fact, the guide's URL,
sits in \`src/shared/guide.ts\`, which the guide never imports.

Chrome-free is not a tidiness preference. The same code is meant to ship later
as a public static site, and a page that reaches the extension runtime cannot
be deployed that way without a second build of the guide. Keeping the rule from
day one costs nothing; retrofitting it would mean re-auditing every chapter.

The rule is stated in \`docs/guide.md\`, which is where a reader looks it up.

## Consequences

- **A chapter cannot show a data flow end to end.** It shows the states a flow
  passes through, one frame each, and the legend carries the reader between
  them. A verb's real effect on Okta is described, not demonstrated.
- **The frame rule is a test, not a convention.** \`src/guide/frameRule.test.ts\`
  walks the guide's import graph and fails on the first forbidden module; the
  ESLint \`chrome\` ban covers the guide's own files. Storybook cannot stand in
  for either, because its alias swaps the facade for a spy.
- **When no pure component exists for a scene**, the chapter ships a
  placeholder and a \`TODO(frame)\`, and the fix is to extract a presentational
  child in the panel, never to add a mock or a seam to the guide.
`;function a(t){return e.jsxs(e.Fragment,{children:[`
`,e.jsx(s,{title:"Documentation/ADRs/0011 User Guide Is A Chrome Free Page Of Leaf Components"}),`
`,e.jsx(r,{children:i})]})}function m(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a()}export{m as default};
