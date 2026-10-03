import{j as e}from"./iframe-Pee757m_.js";import{u as s,M as o,c as a}from"./blocks-CbycfW6w.js";import"./preload-helper-PPVm8Dsz.js";const r=`# 0012 — The concierge greeting is the one decorative motion

Status: Accepted — 2026-10-02. Amended the same day: the welcome screen is
removed, so the greeting plays on the first open, and the ⌘K command replays
the whole welcome.

## Context

\`docs/motion.md\` has held one rule above the others: **motion explains
causality, never decorates.** Expressive motion is allowed only in the response
layer, "precisely because the user's own input caused it"; anything that
animates without the user having done something "does not get to borrow its
permission."

The Home overhaul (concierge, Ask, Pinned) comes from a design handoff whose
centrepiece is a greeting nobody asked for: a breathing orb with expanding halo
rings, then a time-of-day line and a page-aware sentence typed out a character
at a time, then three cards cascading in. Measured against the rule, all of it
is decoration. The handoff wants it on every open.

Most of the rest of the handoff passes the rule untouched. A sentence's words
rising as you switch verbs, a slot popping as you fill it, a pin flying to where
it landed — each answers something the reader just did. The greeting is the one
piece that cannot be argued into the response layer.

Three options were on the table:

**Refuse it.** Keep the rule absolute; the greeting's text and cards rise in
with \`animate-rise-in\` like everything else. Cheapest, and loses the one moment
the handoff exists to create: the first open of a freshly installed extension,
when the reader has no habit yet and the panel has to introduce itself.

**Allow it on every open, skippable.** What the handoff asked for. It turns a
first impression into a toll: by the tenth open the reader is pressing Escape
to get to work, and a rule that admits a loop on every open has stopped being a
rule.

**Allow it once.** The typed show plays the first time Home is active, and
never again unless the reader asks for it.

## Decision

**The concierge's first-run greeting is the single place decorative motion is
allowed.** Its licence is narrow:

- **Once.** It plays the first time Home is active. A persisted flag records
  that it has played. Every later open
  shows the same line and cards at once, arriving with the ordinary primitives.
- **Skippable.** Escape, or a tap on the greeting, finishes it immediately.
- **Silent to assistive tech.** The typed text reaches a screen reader as the
  whole string, once (see \`useTypewriter\`).
- **Off under reduced motion.** The greeting is instant; the orb is still.
- **Replayable only on request.** The ⌘K command "Replay the welcome" plays it
  again, and offers the guide invitation again with it. Nothing else resets
  the flag.

There is no separate welcome screen. The greeting is the welcome: its
invitation to the user guide stays on Home until the reader answers it, under
a flag of its own (\`docs/guide.md\`), because declining the guide and having
seen the show are different acts.

The licence does not extend to anything else. \`--dur-presence\` and the orb's
loops exist for this greeting; reusing them anywhere else needs its own record.

Everything else Home adds is held to the existing rule and filed with the
other primitives in \`docs/motion.md\`: word-rise, assemble, pop, draw, unfurl,
caret, scan, and the fly.

## Consequences

**The rule gains a named exception rather than a softer wording.** \`docs/motion.md\`
keeps "motion explains causality, never decorates" verbatim and points here for
the one place it does not hold. A second decorative piece is a second record,
which is the friction intended.

**JavaScript now drives two kinds of motion in the side panel.** Before this,
\`useCountUp\` held the only frame clock. The greeting adds a character clock
(\`useTypewriter\`) and the fly adds a Web Animations API flight (\`useFly\`). Both
read their timing from the token scale through \`sidepanel/theme/motion\`, so
neither writes a duration or a curve down, and both have an instant path that
lands on the final state.

**The cost we accept.** A reader who installs the extension, glances at the
greeting while doing something else, and misses it has missed it for good unless
they find the ⌘K command. That is deliberate: a greeting that plays again
whenever it might have been missed is a greeting on every open by another name.
`;function i(n){return e.jsxs(e.Fragment,{children:[`
`,e.jsx(o,{title:"Documentation/ADRs/0012 The Concierge Greeting Is The One Decorative Motion"}),`
`,e.jsx(a,{children:r})]})}function c(n={}){const{wrapper:t}={...s(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i()}export{c as default};
