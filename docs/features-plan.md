# Features plan (living)

Start here to scope or pick up **new feature** work (as opposed to maintainability
work, whose 2026-07 overhaul is complete — see `CLAUDE.md`). This is
a living catalog: add ideas, check items off, record why something was parked so it
isn't re-litigated.

The single fact that reshapes everything: **the write surface is narrow and the session
is single-tenant**. Today the app can `suspend`/`unsuspend` users,
`resetPassword(sendEmail=true)`, add/remove group members, run bulk group ops,
`activate`/`deactivate` rules, **create / delete group rules** (Feature A4 — zod-validated,
via the safe create → activate → retire sequence), and a **single-user
profile write** (`POST /api/v1/users/{id}`, sparse patch, gated on schema mutability and
mastering, predicted, audited and undoable). It still has **no** bulk profile write, no
user `activate`/`reactivate`, no in-place rule edit, no app-push writes, and no policy
ops. Every API call targets one browser tab's Okta session — two
tenants at once is impossible. See [architecture.md](./architecture.md).

**Ground rules for every feature below** (the code must satisfy these):

- All Okta traffic goes through the `ApiScheduler` path — never a direct
  side-panel→content call. Bulk jobs loop through it (5 concurrent, cooldown at 10%
  quota). ([architecture.md](./architecture.md))
- Odyssey tokens only (no raw hex); shared components only (no hand-rolled
  `button`/`input`/`select`/`textarea`); `Modal` for every overlay (role/trap/Esc).
  ([design-system.md](./design-system.md), [components.md](./components.md),
  [ux-guidelines.md](./ux-guidelines.md))
- Validate every new Okta response with zod at the boundary (no new `any`).
- No raw `console.*`; never log tokens/bodies/PII ([development.md](./development.md)).
- **Every mutation audits, and every destructive mutation confirms.** Capture prior
  state so undo can _restore_, not just log. Components < ~300 lines; logic in hooks.
- Document exports with TypeDoc.

Status legend: `[ ]` todo · `[~]` partially done · `[x]` done.

---

## Reuse map (build on these, don't reinvent)

| Need                                    | Reuse                                                              | Path                                                         |
| --------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| Bulk loop + per-item error capture      | `executeBulkOperation`, `removeDeprovisioned`                      | `hooks/useOktaApi/groupBulkOps.ts`, `groupCleanup.ts`        |
| Progress UI (count / % / ETA / cancel)  | `ProgressContext` + `ActivityBar`                                  | `contexts/ProgressContext.tsx`, `components/ActivityBar.tsx` |
| Multi-select state (survives filtering) | `useGroupSelection`, `Checkbox`                                    | `hooks/useGroupSelection.ts`                                 |
| List entry (paste/search → chips)       | `Textarea`, `Input`, `SelectionChips`, `ComparisonSearchPhase`     | `components/shared/`, `users/comparison/`                    |
| Confirm / destructive gate              | shared `Modal`                                                     | `components/shared/Modal.tsx`                                |
| Audit + undo                            | `logAction`, `logBulkRemoveAction`, `AuditLogViewer`               | `shared/undoManager.ts`, `components/AuditLogViewer.tsx`     |
| Prior-state capture + restore           | `logProfileUpdateAction`, `useUndoAction` (drift-checked rewrite)  | `shared/undoManager.ts`, `hooks/useUndoAction.ts`            |
| Rule read + write                       | `getGroupRulesForGroup`; `ruleWrites` (create/delete/(de)activate) | `groupDiscovery.ts`, `hooks/useOktaApi/ruleWrites.ts`        |
| Population diff (who gains/loses)       | `classifyGroupImpact`, `summarizeRuleImpact`                       | `shared/membership/ruleImpact.ts`                            |

> `removeDeprovisioned` is reached from the group-detail rung — `GroupActionBar`'s
> **More** tier, behind a count-only confirm, wired by
> `groups/detail/useRemoveDeprovisioned.ts` — and it is the model for this pattern:
> one aggregate undo entry rather than one per user, an `AuditLogEntry`, an
> `APP_GROUP` guard, and every DELETE paced through `runOperation`.

The two primitives worth building **once** and reusing across C/D:

- **`BulkTargetList`** — paste/CSV or search → resolve via `searchUsers`/`getUserById`
  → removable chips, unresolved entries flagged. Add **saved named lists** (persist in
  `idb`) so an admin can reuse "Q3 offboarding cohort" across sessions.
- **`PreflightSummary`** — "N will change · M skipped · why", shown before any write.
  Nothing mutates until the admin has seen it. This is the biggest trust win.

---

## Catalog (ranked by impact ÷ effort)

| Feature                                | Effort | Impact   | Verdict                          |
| -------------------------------------- | ------ | -------- | -------------------------------- |
| A. Orphan/Clutter + Rule Consolidation | M      | High     | `[~]` Partly withdrawn (A2, A4)  |
| B. Rule Impact Preview                 | L–M    | High     | `[x]` **Shipped**                |
| C. Bulk Attribute Editor               | M      | High     | `[ ]` Single-user editor shipped |
| D. Bulk Lifecycle Console              | M      | Med–High | Fast follow                      |
| E. Group Push deploy                   | H      | Med      | Parked                           |
| F. OEL Sandbox (full)                  | H      | Med      | Parked (interpreter now exists)  |
| G. Policy Migrator                     | XL     | Med      | Rejected (single-tenant block)   |
| H. Clause-level rule explainer         | S–M    | High     | `[x]` **Shipped**                |

---

## Shipped (A + B + H)

**A. Orphan / Clutter Remediation + Rule Consolidation — flagship** `[~]`
All four sub-features landed. Two have since been **withdrawn** — A1 and A3 were
deleted in the 2026-09-12 Groups-tab cull — and the two that remain, A2 and A4, are
still shipped. The _why_ for those two is captured in the code's doc comments.

- **A1 — Cleanup triage** — **withdrawn 2026-09-12.** The **Cleanup** panel and its
  `analyzeClutter` scoring were deleted with the rest of the Groups tab's inline
  panels: a 0–100 review score fused from four unrelated signals was a number no
  admin could act on, and the rung it lived in was being reduced to browsing and
  export. Nothing replaced it; the classifier is gone, not parked.
- **A2 — Membership-source insight** (`useGroupSource` +
  `shared/membership/groupSource.ts`): per-group "why does this exist / who feeds it" —
  feeding rules, app-push targets, and a gated manual-vs-rule split. Read-only, and it
  lives in the Group Detail view pushed from the groups list.
- **A3 — Group merge** — **withdrawn 2026-09-12.** The merge wizard, its hook and its
  planner were deleted: it was the only verb on the groups rung that changed entity
  state with no symmetric undo, and the partial-failure hole `D-100` recorded made
  "reversible" a claim the code could not keep. Consolidating memberships is not an
  operation this extension offers.
- **A4 — Rule consolidation** (`RuleConsolidationModal` + `useRuleConsolidation` +
  `useOktaApi/ruleWrites.ts` + `shared/rules/consolidation.ts`): new zod-validated
  create/delete rule writes to add a target group or merge identical-condition rules, via
  the safe create → activate → retire sequence with `CONSOLIDATE_RULE` undo capture.

**B. Rule Impact Preview** `[x]` — _"who loses access if I deactivate this rule?"_
Answered before the admin commits, read-only, no EL interpreter. Pure population-diff
engine `shared/membership/ruleImpact.ts` (one rules listing + one member fetch per target
group, all on the scheduler path — no per-member fan-out). Each `RuleCard` gains a
**Preview Impact** action, and rule deactivation is now **gated** behind an impact-aware
confirmation (`RuleImpactModal`) that leads with the loss headline. Loss is inferred from
rule targets + exclusions and labeled as such inline.

**H. Clause-level rule explainer** `[x]` — _"why isn't this person in that group?"_
`shared/rules/explainExpression.ts::explainRuleExpression` walks the same AST
`ruleEvaluator` evaluates and returns a **tree** (`ConnectiveNode`/`LeafClauseNode`),
not a flat clause list — an `&&`/`||` group is a node with its own Kleene verdict and
`decidedByChildIndices`, not a leaf carrying "alternatives". The shared `ClauseLedger`
family (`docs/components.md`) renders it; `MembershipRuleEvidence` and the comparison
surfaces are the adopters. `rules/RuleDetailView.tsx` is **not** one — it still renders
its condition as flat text, which is the open half of this item. Group-membership functions, including
`isMemberOfGroupNameRegex`, resolve once a caller supplies the user's complete group
list (ADR-0001, ADR-0002); a clause the evaluator still cannot resolve renders
`not-evaluated` with a reason code, never a fail.

---

## C. `[ ]` Bulk Attribute Editor — safeguarded profile write (single-user editor shipped)

Mass-edit one profile field (department rename, title change) across many users, without
fighting externally-mastered (AD/HR) profiles.

The schema facts were banked first:
`getUserProfileSchema` → `cacheKeys.userSchema`, with `oktaUserSchemaPropertySchema`
capturing `mutability`, `required`, `type`, `enum`/`oneOf` and the `master` block — the
mastering signal this feature's differentiator turns on.

**The single-user inline editor has since landed**, which is most of this item's
machinery. What exists today:

- The write itself — `updateUserProfile` (`POST /api/v1/users/{id}`, sparse patch,
  zod-validated response) plus `getUserRaw`, in `useOktaApi/profileOperations.ts`. Its
  result is **three-state**: `saved` / `failed` / `unknown`, where `unknown` means the
  write may have applied and must never be shown as a failure.
- The per-attribute gate — `components/users/profileEditability.ts`: schema
  `mutability`, per-attribute `master.type`, account-level
  `credentials.provider.type`, and a value-type gate, each lock naming its reason.
- The prediction — `shared/membership/blastRadius.ts`, a pure zero-API engine
  answering "what does this edit do to their group access?": `added`, `removed`, or
  `not-predicted` carrying a `WithheldReason`. It asserts or withholds, never hedges
  ([claims.md](./claims.md)).
- The capture and the restore — `logProfileUpdateAction` with PII caps, and
  `useUndoAction`, the repo's **first undo executor**: re-read, refuse on drift, write
  the prior values, record a linked entry of its own.
- One hook, both surfaces — `useProfileEdit` drives the Profile pane and each column
  of the two-user Compare view.

**The gate is per-attribute, never a curated allow-list.** `login` is editable when
Okta masters the account; the mastering signal locks exactly the accounts where a write
would be overwritten or is not ours to make, which is a narrower and more accurate lock
than a blanket deny.

**The cohort source exists.** The Group Detail Members tab is the
shared member explorer with search, source pills and attribute/MFA filters, and the
Insights tab reports the attribute spread over _every_ browseable attribute with
outlier values marked. That gives the bulk editor a better cohort than paste-and-resolve
ever would: **the filtered set on screen**, entered from Insights → attribute spread →
pick an outlier value → "Normalize N users". Paste/search cohort resolution stays a
fallback for users who are not in one group, not the primary entry point.

What remains for the bulk build:

- **Cohort resolution** — the Members tab's active filter as the primary source;
  paste/search → resolved chips (reusing `BulkTargetList`) as the fallback.
- **Preflight over many users** — one `PreflightSummary` running the existing
  per-attribute gate across the cohort (N updatable / M skipped-locked + reasons,
  capturing old values), then a confirm modal restating the counts.
- **The run** — bulk loop + `ProgressContext` on the scheduler path, with live progress.
- **Results** — updated / skipped / failed summary plus **CSV export** (every cell
  through `csvUtils.escapeCSV`) and the audit entry.
- _Enhancement:_ value **templating** (find-replace / derive-from-existing) with a
  per-user before→after table.
- Done when: an admin can change one field across a resolved cohort, locked profiles are
  auto-skipped with reasons, the change is previewed/confirmed/audited/undoable, green.

**Two hard blockers, both of which must be closed inside the bulk commit:**

1. **Sparse-patch merge behaviour is unverified.** `POST /api/v1/users/{id}` has not
   been checked against a real org, and it is marked `U` in the `okta-api` index.
   Confirm it _before_ fanning the write out across a cohort; the fallback (send the
   full profile, strip everything not `READ_WRITE`) is one function body in
   `profileOperations.ts`. **This one needs a live org — it cannot be closed from the
   repo.**
2. **The undo history cap breaks naive bulk logging.** `undoManager.ts` sets
   `MAX_UNDO_SIZE = 50`, so one entry per user means an 80-user run evicts its own
   early entries and most of the run stops being revertable. Bulk needs **one
   run-scoped entry** holding per-user before-values, which means a new `ActionType` —
   and the forcing function is deliberate: `NOT_UNDOABLE` is an exhaustive `Record`,
   not a `switch` with a `default:`, so adding the member **is a compile error until
   someone writes down what undoing it means**. The existing caps (25 attributes ×
   1024 chars) are per _entry_, so a run-scoped entry needs its own cohort cap —
   over-cap users recorded but marked unrestorable, never silently truncated.

**The bulk write needs its own plan, agreed before any code.** The single-user write
covers one user, from a field the admin is looking at. This is the first **many**-user
write, driven by a client-side filter the admin cannot audit row by row. That plan has
to answer: what the confirm shows (exact `from → to` per user, capped and paginated);
cancellation semantics mid-run; what lands in the undo log; and the hard refusal —
**never write an attribute a feeding rule reads without naming the rule and the
membership change it would cause.**

---

## Export and org-surface gaps

Three items that outlived the reporting push. Each is small, independent, and
blocked on a decision rather than on code.

- **Administrators export.** Every other entity has a clean paginated list
  endpoint; admin role assignments do not. The two routes are per-user role
  assignments (linear in user count — a real cost worth stating before it runs)
  and the newer IAM `assignees` API, whose response envelope has not been
  confirmed against a live tenant. Blocked on that confirmation, not on the
  descriptor: shipping a guessed envelope would put a wrong report in front of an
  admin, which is worse than not shipping one. Done when: `/api/v1/iam/assignees`
  is verified against a tenant, a zod schema pins the envelope, and the descriptor
  states its call cost up front like every other.
- **SAML IdP certificate expiry.** The IdP reader already returns the signing
  certificate's validity window, so "days until this IdP's certificate expires"
  falls out of a call the Export tab already makes. Worth surfacing because an
  expired IdP certificate takes an entire federation down with no warning. Assert
  or withhold applies: render the date and the days remaining from the response,
  never an inferred "probably fine". Done when: the IdP descriptor carries an
  expiry column and the value is absent — not zero, not a guess — when the
  response omits it.
- **`X-Okta-User-Agent-Extended` on content fetches.** Okta's convention for
  naming the client making a call, which shows up in the System Log and in
  support conversations. One header at the single fetch choke point
  (`content/apiRequest.ts`), so an admin reading their own log can tell this
  extension's traffic from the console's. Done when: the header is set once at
  that choke point, a test pins it, and `docs/security.md` records that it is the
  only request header the extension adds beyond XSRF.

---

## Known tech debt / follow-ups

Carried forward from the A/B build (surfaced while working, none blocking):

- **A4 hardening (highest risk).** The rule create/delete path is the sharpest code in
  the repo and hasn't been exercised against a live tenant. Add a `useRuleConsolidation`
  hook test (mock the write ops) pinning the create → activate → retire sequencing and
  the abort-before-delete guarantee; consider a post-create verification read.
- ~~**A4 audit attribution.**~~ Resolved (`D-013b`): the current admin is resolved
  through `useOktaApi`'s `getCurrentUser()` facade. An unresolvable actor records
  `performedBy: null` with `actorResolution: 'unavailable'` rather than a fabricated
  placeholder.
- **`RulesCache` stores `rawRules: []`.** Anything needing exclusion lists (the impact
  engine) must re-fetch raw rules. Populating `rawRules` once would let impact capture
  skip its rules fetch entirely.
- **`useGroupsLoader` mount-rehydrate races `loadAllGroups`** (characterized in its
  docstring) — relevant if A2 starts triggering loads.
- **Finish the eyebrow migration.** `Eyebrow` is the single uppercase section label,
  but nine files still hand-roll `uppercase tracking-*` — enumerate them with
  `grep -rl "uppercase tracking" src/sidepanel/components`. Mechanical and exempt from
  the plan-and-approval gate, but do it as its own PR: it is what stops the recipe drift
  returning, and each swap is a visual diff worth seeing on its own.
- **Dead-code pass over `src/shared/tabState/`.** `TabStateManager` writes
  `chrome.storage.local` directly, so the background's `saveTabState` / `loadTabState` /
  `clearTabState` message actions (`src/background/index.ts:244`–`300`) have no sender
  anywhere in the codebase — three validated message actions maintained for nobody.
  `RulesTab` is the module's only consumer while its `TabName` union spans every tab.
  While there: the lone `chrome.storage.sync.set` at `src/background/index.ts:326` has no
  reader either. Run `npm run knip` and remove what it confirms; removing a
  message action is a security-surface reduction, so review it as one.

---

## Detail-page layout contract adoption — pending migration

Users and Groups adopt the contract first. Both have:

- [x] **Groups** — the group detail view pushed from the list, with the header owning
      identity.
- [x] **Users** — the detail rung is now `UserActionBar` above three tabbed panes of one
      card (`UserDetailPanel`), the header describes the user (`userIdentity`), and
      `UserProfileCard` / `userProfileSections.ts` are deleted rather than restyled.

Four detail-page surfaces still need the `DetailSection` / `ActionBar` /
`EntityLink` / `Badge` contract (see [components.md](./components.md)):

- [ ] **Rules** (`src/sidepanel/components/RuleCard.tsx`) — hand-rolls an `<a>` with
      an inline `<svg>` instead of `OpenInOktaLink`; "THEN ADD TO GROUPS" chips are
      inert text that should be `EntityLink`s; uses `px-2.5 py-1` padding, which
      `docs/design-system.md` does not sanction; eyebrow uses `tracking-wider` where
      the contract settles on `tracking-wide`.
- [ ] **Apps** (`src/sidepanel/components/apps/AppListItem.tsx`) — expanded body is
      a bespoke 2-column grid of grey field tiles rather than `DetailSection`.
- [ ] **Policies** (`src/sidepanel/components/policies/PolicyCard.tsx`) — eyebrow
      uses `tracking-wider` where the contract settles on `tracking-wide`; bespoke body
      rather than `DetailSection`.
- [ ] **History** (`src/sidepanel/components/AuditLogViewer.tsx`) — **accessibility
      bug, highest priority**: row is a bare `<div onClick>` with no `role`, `tabIndex`,
      or `aria-expanded`, cannot be reached or operated by keyboard.

---

## Parked / rejected (rationale recorded so we don't re-litigate)

- **D. Bulk Lifecycle Console** _(fast follow)_ — paste users → suspend/unsuspend/
  reactivate + trigger reset/activation emails. Extends existing lifecycle ops; the
  "comms engine" is just Okta's built-in `sendEmail` flag. Only new bits:
  `lifecycle/activate` + `reactivate`. Reuses `BulkTargetList` + preflight from C.
- **E. Group Push deploy** — the extension only **reads** push mappings, and not
  even through a call of its own: `useGroupsLoader`'s `mappingsByGroup` derives
  them from the org snapshot's app-assignment records, at no request cost.
  Writing app group-push config is deep provisioning. High effort, parked.
- **F. OEL Sandbox (full)** — only the _full_ sandbox (arbitrary expression authoring
  against arbitrary users) is parked. The interpreter it needed exists:
  `shared/ruleEvaluator.ts` parses with `jsep` and evaluates against an explicit
  allow-list, returning `match` / `no-match` / `unevaluable`. **Feature H is the
  affordable slice** of it, and Feature B covers impact-before-toggling.
- **G. Policy Migrator** — **rejected.** The single-tab session model cannot address two
  tenants at once, and policy ops are entirely absent. Would require a different
  transport plus persisted cross-tenant credentials, violating the never-persist-tokens
  principle ([architecture.md](./architecture.md)). This rejection covers _cross-tenant
  migration_ only; a future single-tenant, read-only Authentication Policies section
  (viewing policies/rules in the current org) is out of its scope.
