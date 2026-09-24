# The user guide

The guide is a second extension page, `src/guide/index.html`, listed as a Vite
input in `vite.config.ts` and never declared in the manifest. It is reached
through `chrome.runtime.getURL` from three places, all of them outside the guide
itself:

- the background service worker on a fresh install (`#/welcome`) and on an
  update that crosses a `major.minor` boundary (`#/roadmap`, decided by
  `src/background/guideOnUpdate.ts`; a patch release opens nothing);
- the command palette's "Open the user guide" row;
- the last row on Home (`src/sidepanel/components/home/GuideLinkRow.tsx`) and
  the first-run welcome card.

The one chrome-bound fact about the guide, its URL, lives in
`src/shared/guide.ts`. The guide never imports that module. The rationale for
this shape is `docs/adr/0011-user-guide-is-a-chrome-free-page-of-leaf-components.md`.

## Chrome-free

Nothing under `src/guide/` names `chrome.`, and nothing it imports reaches the
extension runtime. The reason is a later deploy: the same page is meant to ship
as a public static site, and a page that touches `chrome.*` cannot.

Two enforcements, because each sees something the other cannot:

1. **The ESLint override** for `src/guide/**` in `eslint.config.js` makes the
   `chrome` global an error. It sees only the guide's own files.
2. **`src/guide/frameRule.test.ts`** walks every runtime import from
   `src/guide` (skipping `import type`, `.css` and `.json`) and fails on the
   first module that is the API facade, the scheduler, the entity cache, the
   snapshot store, a `shared/storage/` store, `shared/guide.ts`, or any module
   outside the guide whose code names `chrome.`. The failure prints the import
   chain that led there.

Storybook proves nothing here: its alias swaps the facade for a spy, so a
component that fetches renders fine in a story and fetches for real inside the
installed page. Trust the test only.

## The frame rule

A scene shows the real product: a **leaf component** from
`src/sidepanel/components/**` fed **static fixtures**, never the facade, never
a hook that fetches. A frame may hold local state so a reader can open a row or
a modal; a handler that would write goes to a `noop`.

When the component you want is forbidden, use its presentational child (the
row, the card, the section) or hand the same data to shared primitives. Do not
add a mock, a seam, a context provider, or a `chrome.` reference to get past
the gate. If nothing pure exists for a scene, ship the `Stage` with a short
placeholder paragraph and a `TODO(frame): <what you needed>` comment above it.

Fixtures come from `src/sidepanel/demo/` so the guide and the reel show the
same org. Every id is obviously fake (`00gFAKE...`), every email is
`@example.com`.

Check it with `npx vitest run src/guide/frameRule.test.ts`.

## The registries

- `src/guide/chapters.ts` is the table of contents: the `ChapterId` union,
  reading order, each chapter's title, one-line question, and the show's
  `headline` and `subline`. The URL hash is a chapter id (`#/rules`); an
  unknown hash opens `welcome`.

  **The contents are flat.** One chapter per tab, and no chapter under a
  chapter. A tab with a second job worth explaining gets another scene on its
  own page, not an indented row: Users carries the qualification and profile
  scenes (`chapters/parts/userProfile.tsx`), Groups carries the health ones
  (`chapters/parts/groupHealth.tsx`). A parts module exports `Scene`s and
  nothing else; the chapter renders them as siblings of its own, so each still
  gets a band and a row in the dock.

- `src/guide/status.ts` is how settled each chapter's subject is. Every
  chapter's chip and the roadmap chapter both read it, so they cannot
  disagree. The two bookend chapters (`welcome`, `roadmap`) are about the
  guide, not a feature, and carry no standing.
- `src/guide/chapters/index.ts` maps id to a lazily loaded component. It is
  keyed by `ChapterId`, so a chapter with no component is a type error.

`src/guide/chapters.test.ts` pins the registry: unique ids, a title of four
words or fewer in Title Case, the hash parser, and a `note` on everything not
shipped.

### Adding a chapter

1. Add the entry to `CHAPTERS` in `src/guide/chapters.ts` (and the id to
   `ChapterId`), in reading order.
2. Add its standing to `CHAPTER_STANDING` in `src/guide/status.ts`.
3. Write `src/guide/chapters/<id>.tsx`, a default-exported `React.FC`:
   `ChapterPage` at the root with its `show`, then two to four `Scene`s and
   nothing between them. Copy `src/guide/chapters/welcome.tsx` for the show and
   `src/guide/chapters/users.tsx` for the scenes. Headline, title, question,
   chip, feedback link and the continue band come from the registries; you do
   not write them.
4. Add one line to `src/guide/chapters/index.ts`.
5. Write `src/guide/chapters/<id>.stories.tsx` under `Guide/Chapters/<id>`,
   using `withGuideShell('<id>')` and `CHAPTER_PARAMETERS` from
   `src/guide/chapters/chapterStory.tsx`: a `Default`, plus one story with a
   `play` per poke-able interaction. Axe-clean, like every story.

Then run the frame rule test, the story file, and `copy.test.ts`.

## Shows

Every chapter opens as a show: one screen with the headline on the left and
the panel on a lit stage on the right, stepping through three to five poses
("beats") once the stage is half in view. The reader scenes follow below and
arrive as they are scrolled to. The kit is `src/guide/show/`:

- `Show` is the band. It reads the headline and chip from the registries and
  takes only `beats` (caption and `hold`, a multiple of `--dur-tell`) and a
  render function from beat index to the stage's contents.
- `useShowPlayer` starts the sequence from an `IntersectionObserver` on the
  stage and steps beats on a timer. Every no-motion path (`motion.ts`'s gate,
  the OS preference, no observer) lands on the last beat at once, so the
  still is also the fallback and a story under `data-motion="off"` is
  deterministic. A show plays once per mount; scrolling never replays it.
- `motion.ts` is the one gate and the one clock for the guide. Durations are
  read from computed style (`readDurToken`), never mirrored as numbers.
- `Assemble` lands pieces one at a time; `useTyped` types a string into a
  real input; `.guide-wipe` reveals a value a component would snap.
- The lit stage is `inert`: a show is watched, the reader scenes are the
  poke-able frames. A beat may open a modal without stealing focus.
- `useRevealOnView` (shell) holds a reader scene's entrances until it is
  reached, under the same gate.
- A show with no `stageLabel` has no frame at all, and takes two screens
  rather than one: the title alone, then the pieces alone, each a snap point,
  each fitted by `FitBox` (`align="start"`, so both hold the same left edge
  however far a short window scales the pieces down). The welcome overture is
  that shape. The pieces are a screen below the fold on first paint, so their
  cascade is held on `data-show-state="waiting"` until `useShowPlayer` sees
  them; `awaitShow` brings the band into view before it waits.
- The overture takes a third screen, by passing `opening` to `Show`: a greeting
  the reader lands on, then the title card, then the contents. The title is
  worth watching and a reader who lands on it has already spent it, so the
  greeting goes first and the card plays when it is scrolled to.

### The title card

`show/KeysTitle.tsx` draws the overture's title: the mark as 18 keys, arriving
as a track that descends the right of the logo's place and is taken up one key
at a time by the right spoke as the circle rolls, then leaving as a railroad the
circle sheds from its bottom spoke. `show/keysGeometry.ts` is the arithmetic,
transcribed from the design handoff in `designDocs/Animation Title`, which is
the piece's source of truth; its README states the three invariants
(18 keys always, track pitch equal to the circle's arc pitch, no rotation at
join or detach) and `keysGeometry.test.ts` pins all three.

Four things about it are guide decisions rather than the handoff's:

- **It is the one clock driven piece here.** A roll has to be sampled
  continuously, so it runs a frame loop where everything else is a CSS entrance
  on a token delay. The loop exists only while the card is in view.
- **Its clock's unit is `--dur-tell`**, read through `readDurToken`, and its
  scenes are whole multiples of one. Arrive is seven, which is what
  `--guide-overture` already budgets for the overture's assembly.
- **Its easings are not the `--ease-*` tokens.** Five curves come with the
  handoff, paired so the roll reads as one object, and they are named in
  `keysGeometry.ts` for the token role each stands in for. This is the same
  licence `useCountUp` takes.
- **It is a wide screen treatment**, shown from `64rem`. Its composition is a
  logo with the sentence beside it in a landscape frame, which a phone cannot
  hold at a legible size; narrow, the heading is plain display type, which is
  what the overture showed before the card existed.

Every no-motion path lands on the settled logo with the sentence beside it, and
so does the first paint, so the still is the finished picture.

### The shell

Wide (from `lg`), the contents are a white sidebar the full height of the
window, flush to the left edge and closed by one rule on its right: the shape
the Okta admin console's own nav has, so the guide reads as part of the same
product. It is `lg:w-72`, wide enough that the longest chapter title fits on
one line: narrower and the rows overflow sideways and the list grows a
horizontal scrollbar. The title block heads it, the chapter rows scroll
inside it, and the source link sits at its foot.

Narrow, the same nav is a frosted strip along the bottom edge. Twelve
chapters do not fit a phone, so the strip scrolls horizontally, with the
scrollbar suppressed and a mask fading the glyphs at each end to say there is
more; the current chapter is scrolled into it on mount. The names go with the
scroll, since a tooltip standing above its row cannot survive a scroll
container's clip, so narrow the strip is glyphs plus each row's `aria-label`.

### Sections, headings and frames

Everything a chapter says is under a heading a reader can jump to. There are
two kinds of section and no third:

- **`Scene`** is a feature: heading, `intro`, the panel, the numbered `legend`,
  and an `outro` for what is left to say once the reader has the frame. Prose
  that leads into a feature is that scene's `intro`; prose that follows from it
  is its `outro`. A bare paragraph between two scenes gets no heading, no row
  in the contents and a screen of its own to be stranded on, so there are none.
- **`Band`** is the same contract minus the panel, for a section with nothing
  to show (how to open the panel, what is in the guide, an invitation to file
  an issue). Both register with `sceneRegistry`, so both are listed under the
  current chapter in the dock.

A section **title is a name, not a sentence**: Title Case, a few words, a noun
phrase. "Search", "Member Sources", "Columns and Run". Never a question: the
chapter registry's `question` field is where the question goes.

**A frame is the exception, not the default.** `Stage` draws its box only when
given a `label` (a `Scene` passes `stageLabel`), and a border with a title
strip around a piece of the panel is chrome the panel does not have: it reads
as a screenshot where the page means "this is the thing". Two cases earn it:

1. the show's lit stage, which is the product held up to be looked at; and
2. a scene whose frame does work a bare column cannot: a `Modal` opened inside
   needs a containing block to be centred in (`contain: layout`), and the
   command palette is an overlay that needs something to overlay.

Everywhere else the fixture stands bare on the page at the panel's own width,
with the marker gutter kept so the numbered dots still land beside it.

### One feature per screen

Wide (from `lg`), a chapter is a stack of screens: the show is one, each
scene is one, the continue footer is one, each sized to the viewport less the
gap between them. Narrow, the bands flow, because a scene stacks its frame
above its legend.

The page snaps `y mandatory` at every width, so it never comes to rest
between two features and never waits until it is close enough before it
moves. What makes that work is what the snap points are. `ChapterPage` groups
the body into **bands**, and a band is the whole feature: a component child
(`Scene`, or a chapter's own wrapper around one) closes a band, and the plain
markup before it is the prose that introduces it. So the stops are the show,
each band, and the continue footer, each one screen, with nothing between two
of them to be stranded in. Snap on every block instead and a reader lands on
a lone connective sentence with the feature it introduces off screen, which
is what the first cut of this did. A chapter that is prose all the way down
(the roadmap) is one band, taller than the screen, scrolled through a line at
a time by the rule the spec gives for a snap area larger than the snapport.

`scroll-snap-stop: always`, which keeps a flick carrying past a feature, is
wide only: narrow the bands flow and forcing a stop at each would make the
page crawl.

A frame never has to be scrolled through either. It keeps its own honest
height (a palette overlay really is 1120px tall) and `FitBox` scales it down
to the room its band has (`useFitToView` writes `--guide-fit`), so a reader
reaches the rest of the product without moving inside the frame. The scale is a transform, so the frame's measured height never
moves and the fit cannot feed back on itself; below half size the frame
overflows instead, because smaller than that it cannot be read.

Beats are real leaf components under the frame rule, fed the same fixtures
as the reader scenes; a beat changes which props are live. A component with
an uncontrolled disclosure is opened by remounting it with `defaultExpanded`.
Values that belong together count together (`useCountUp`): a percentage
never reaches 100 beside an ETA that still has seconds left.

Stories: plays query through `readerCanvas` (the show's still renders the
same fixtures as the scenes), and a motion-on story awaits `awaitShow` before
it looks. The headless runner loads no motion scale, so shows there render
their still at once.

### Storyboards

| Chapter   | Beats                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| welcome   | no frame, three screens: a greeting the reader lands on · the title card, which plays when it is scrolled to (`show/KeysTitle.tsx`) · then the contents alone, the dock's own rows drawn at 1.4x, landing one at a time · scroll off that screen and every row travels to the rail as one formation, glyph pivoting on glyph, while the row it left leaves the page on the same frame (`Dock.formFromRail`); the dock's chrome arrives once they land |
| home      | empty `JumpBar` · "eng" types into it · three `JumpResultRow`s cascade · `OrgSnapshotCard` counts up · a report row's findings pour in (a report the reader scene does not use)                                                                                                                                                                                                                                                                       |
| users     | "Ama" types into `UserSearchBar` · hits cascade in `UserSearchResults` · four `GroupMembershipRow`s land · the ambiguous VPN row opens, both candidate rules visible                                                                                                                                                                                                                                                                                  |
| groups    | three group rows · the Engineering row expands its preview · `GroupOverviewPane` rises · `MemberSourceMeter` wipes in and the sum line counts                                                                                                                                                                                                                                                                                                         |
| apps      | inventory rows land · a `GroupAppRow` expands its push mapping · four `UserAppRow`s land with their source chips                                                                                                                                                                                                                                                                                                                                      |
| rules     | three `RuleCard`s · the person pill flips Tomas to Amara and both `ClauseLedger`s re-evaluate · `RuleImpactModal` opens · its rows cascade                                                                                                                                                                                                                                                                                                            |
| policies  | policy card closed · it opens and `PolicyRulesList` cascades · `EmptyState` "Okta said no" rises                                                                                                                                                                                                                                                                                                                                                      |
| export    | `EntityPicker` · the filter types into `ExportFilterBox` and the match count counts up · two columns tick on in `ColumnPicker` · `ExportPreviewTable` rises                                                                                                                                                                                                                                                                                           |
| history   | three rows · the profile row expands · `AuditLogUndoModal` opens · `ActivityBarView` progresses 35% to 100%, every figure counted together                                                                                                                                                                                                                                                                                                            |
| selection | "Nothing ticked" · four users and a group tick in, `SelectionPane` rows cascade, the summary counts per kind · `VerbList` rises · `VerbRunner` confirm with its preflight lines cascading                                                                                                                                                                                                                                                             |
| palette   | closed panel with the rail · `TabJumpPalette` opens · `entityMode` searching · results cascade with their section meta                                                                                                                                                                                                                                                                                                                                |
| roadmap   | type only: headline · status pills count in · entries cascade                                                                                                                                                                                                                                                                                                                                                                                         |

## Status vocabulary

`ChapterStatus` is `shipped`, `capped`, `in-progress`, `unresolved`. It mirrors
the tab map in `docs/product.md`; when that table moves, `status.ts` moves with
it. The chip and the roadmap branch on the status value, never on
`STATUS_LABEL`, which is copy and can be rewritten freely (`docs/claims.md`).

## Copy voice

Warm but brief, second person, say what the reader does and what they see.
Name things the way the panel names them. No marketing words.

**No em dashes and no en dashes**, anywhere under `src/guide/` or
`src/sidepanel/components/welcome/`, comments and fixture text included.
`src/guide/copy.test.ts` scans every `.ts`, `.tsx`, `.css` and `.md` file
there for U+2013 and U+2014 and names the file and line of each hit. Use a
comma, a colon, a full stop, or parentheses.

Certainty is mentioned only in passing. If a frame shows an absent value or a
deduced badge, one clause ("the panel says so rather than picking one") is the
most it gets; the guide does not lecture about `docs/claims.md`.

## The first-run welcome

The side panel's welcome (`src/sidepanel/components/welcome/WelcomeView.tsx`)
stands in for the whole shell until it is dismissed. Its gate is
`src/sidepanel/hooks/useWelcomeGate.ts` over
`src/shared/storage/welcomeStore.ts`, one boolean under one
`chrome.storage.local` key.

- **Explicit dismiss only.** The flag is written by the welcome's own buttons
  (dismiss, or open the guide). Closing the panel or connecting to an org does
  not count as having read it.
- **Three-valued.** The gate is `unknown` until the storage read lands and the
  shell renders nothing in that window, so neither the welcome nor the rail
  flashes on a guess.
- **Palette reset.** The "Show the welcome screen again" command clears the
  flag and shows the welcome now.

## Links

The guide links to one destination, GitHub. Every address comes from
`package.json` (`homepage`, `bugs.url`) through `src/shared/githubLinks.ts`, so
the guide has no address of its own to go stale. `src/guide/links.ts` adds the
per-chapter new-issue link (title prefilled with the chapter) and the
`EXTERNAL_LINK_PROPS` every outbound anchor spreads (`target="_blank"`,
`rel="noopener noreferrer"`). `src/guide/links.test.ts` pins all three.
