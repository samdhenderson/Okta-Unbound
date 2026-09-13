# Dead-code detection

`tsconfig`'s `noUnusedLocals` and eslint's `no-unused-vars` are both **file-local** —
neither can ever flag an unused _export_. Nothing in CI could see a module that no
production code imports. [knip](https://knip.dev) closes that gap; `madge` covers
import cycles.

```
npm run knip              # unused files, exports, and dependencies
npm run knip:production   # reachability from the manifest entry points only
npm run knip:circular     # import cycles (madge)
npm run lint:control-chars   # no raw control bytes (see below)
npm run lint:cited-paths     # every cited src/ path still exists (see below)
```

## Why `lint:cited-paths` sits with the dead-code tools

Docs and `.claude/` skills/agents cite `src/…` paths as evidence — "see
`shared/utils/oktaUrl.ts`" — so a reader, human or agent, can go check. Deleting or
renaming the file doesn't delete the citation, and a doc naming a file that no longer
exists is worse than a missing doc: it sends the next reader looking for something
that was deliberately removed.

`scripts/check-cited-paths.mjs` fails CI on any backticked or markdown-linked
`src/…` citation, in a tracked `.md` file under `docs/` or `.claude/` (plus root
`CLAUDE.md`/`AGENTS.md`), that doesn't resolve on disk. Glob citations (`*.ts`),
directory citations (no `.ext`), and paths inside fenced code blocks are not
checked — they aren't pointers to one real file. A citation to a deleted or
renamed file should say so in the prose (or drop the path if it no longer earns its
place) rather than keep naming a location that no longer exists.

## Why `lint:control-chars` sits with the dead-code tools

A raw control byte in a source file — a literal NUL used as a separator in a key,
say — makes the file **binary** as far as `grep(1)` is concerned, and grep skips
binary files _silently_: no warning, no non-zero exit, just no matches. Every
grep-based scan then has a blind spot on that file, which is this doc's failure mode
one layer down — a tool reporting "nothing here" when it never looked.

Write the escape sequence instead; it compiles to the same runtime string and keeps
the file text. `scripts/check-control-chars.mjs` fails CI on any tracked text file
carrying a raw control byte other than tab, newline, or carriage return.

## Two configs, two different questions

**`knip.json` → `npm run knip`.** "Is this referenced by anything at all?" Tests and
stories count as consumers, because they are legitimate entry points. Catches modules
nothing imports, unused exports, and unused dependencies.

**`knip.production.json` → `npm run knip:production`.** "Is this reachable from the
three manifest entry points?" — `src/background/index.ts`, `src/content/index.ts`,
`src/sidepanel/main.tsx`, plus the export descriptors. Tests and stories are excluded
from the project entirely.

The second config exists because the first one **structurally cannot** find the most
expensive class of dead code in this repo: a module with no production callers that
stays "referenced" purely because its own test file imports it. Such a module is
invisible to `npm run knip` and sits at the top of `npm run knip:production`.

Dependency and duplicate-export checks are switched off in the production config;
they are the default config's job and would otherwise report every test-only
devDependency as unused.

## How to act on the output

`npm run knip` findings are **actionable**. An unused file or export is dead until
someone shows otherwise.

`npm run knip:production` findings need **judgment**, which is why it is advisory and
never a CI gate. Three legitimate reasons an export appears there:

1. **A testing seam** — an internal helper exported so a unit test can reach it
   (`normalizeRuleName`, `checkRuleOverlap`, `clusterSimilarRules`). Real, but
   consider whether the test should go through the public surface instead.
2. **A public API with no current caller** — a shared primitive or type kept for
   symmetry. Check the barrel; an unexported sibling is usually the bug.
3. **Genuinely dead** — nothing reaches it, and the only thing keeping it alive is its
   own test. Delete both. Deleting a test whose subject is deleted is not test
   tampering: no failure is being silenced, and the no-tampering rule does not apply
   (see [testing.md](./testing.md)).

### Accepted findings — do not "clean these up"

- **`tryEvaluateRuleExpressionDetailed`** (`shared/ruleEvaluator.ts`) has no
  production caller and is expected to keep appearing in `knip:production`. It is
  category 2 above: a four-line wrapper that is the reason-carrying twin of
  `tryEvaluateRuleExpression`, kept deliberately so the next caller does not
  hand-roll `parseRuleExpression` + `evaluateParsedRule`. Removing it reopens a
  decision that was made deliberately — don't do it as cleanup.

### Known false positives

- **Export descriptors** (`src/sidepanel/export/descriptors/*.ts`) are loaded at build
  time via `import.meta.glob` in `src/sidepanel/export/registry.ts`. Static analysis
  cannot see that, so they are declared as explicit entry points in both configs.
  Their **named** exports genuinely have no production consumer — the registry uses
  the default export — so they surface as "duplicate exports". That is expected.
- **`tailwindcss`** is consumed through the `@tailwindcss/vite` plugin and a CSS
  `@import`, not a JS import. Listed in `ignoreDependencies`.
- **`.storybook/`** is excluded. It is not in `tsconfig.json`'s `include`, so knip
  falls back to a non-JSX parser and fails on `preview.tsx`. (That same gap means
  `npm run type-check` does not cover `.storybook/` either — tracked separately.)

## CI

`npm run knip` and `npm run knip:production` run in the `verify` job with
`continue-on-error: true`; `npm run knip:circular` is already a hard gate (there are
no cycles, and there should not be a first one).

**`npm run knip` becomes a hard gate once the backlog below reaches zero** — drop its
`continue-on-error` at that point. `knip:production` stays advisory permanently.

## The standing backlog

Both configs report **zero unused files**. What remains is unused exports and unused
exported types — that is the backlog `npm run knip` becomes a hard gate against.

Two standing configuration notes, so a run's output is not re-investigated each time:

- `esbuild` reports as an unused devDependency; vite provides it transitively.
- `package.json`'s `"main": "index.js"` points at a file that does not exist (this is
  an extension, not a library) — knip reports it as a configuration hint.
