# 0010 — A subject on a subjectless rung

Status: Accepted — 2026-09-18

## Context

The panel already explains a rule's condition clause by clause against a user
(`shared/rules/explainExpression.ts` → `ClauseLedger`), but only where the
**user is the subject** — the user rung, the comparison surface — and only for
rules already attributed to a membership they hold. The rule rung and the group
rung are documented as fetching nothing about people: `RulesTab` pushes
`RuleDetailView` straight from a row, and `docs/page-shell.md` describes both
as rungs that browse an entity, not a person.

The question those rungs cannot answer is the one an admin most often brings to
them: _would this user qualify?_ — for this rule, or for this group through the
rules that feed it. Answering it needs a **subject**: a user chosen ad hoc, who
is not the entity being browsed and whom the rung has no reason to have loaded.

That forces three decisions that a future reader would otherwise re-open.

**What a subject is made of.** The only validated whole `OktaUser` in the
codebase comes from `getUserRaw` (strict zod, `.passthrough()` profile). The
search rows a picker hands back are unparsed, and `docs/claims.md` names a
trimmed profile reaching the evaluator as _the_ bug: an attribute the row does
not carry evaluates as absent, and "absent" is a real answer that would then be
wrong. A group-membership clause needs the user's **complete** group list, which
`RuleGroupContext` requires as a whole or not at all. So a subject is always two
requests — the user, then the paginated group walk — and never fewer.

**Whose the subject is.** A subject loaded for one rule shown for one frame
against the next is a wrong answer with a right-looking headline. The user rung
avoids the problem because the subject _is_ the rung; here it is not.

**What the verdict is.** `RuleMatchResult` is three-valued and answers only the
condition. Whether the rule is active, whether it excludes the user by name or
by group, and whether the user already holds each target are facts the
expression cannot carry — and a headline that folds them in loses them, while a
headline that ignores them says _qualifies_ about a rule that places nobody.

## Decision

**A rule or group rung may hold one fetched subject, loaded whole, owned by the
rung identity that asked for it, and answered with a verdict distinct from the
condition's.**

1. **A subject is `getUserRaw` plus the complete group walk, as one declared
   two-leg plan** (`loadQualificationSubject`, `coreApi.withPlan`). Sequential,
   not parallel: a missing user makes the walk pointless, and one plan is one
   row in the activity bar. The picker's row is never evaluated — it only
   supplies an id.

2. **The subject belongs to a `scopeKey`** — the rule id, the group id — and is
   **retracted during render** when the key changes (`useQualificationSubject`,
   the `useBlastRadius` shape). Not cleared in an effect, which would paint the
   previous rung's answer for a frame; and a run whose token has been
   superseded never commits.

3. **On the user rung the subject is the rung's own user, at zero cost.** The
   same engine (`assessRuleForUser`, `assessGroupForUser`) runs over the
   memberships and inventory the rung already holds; no second load path exists.

4. **The verdict is its own typed union.** `RuleUserHeadline` — `grants`,
   `inactive-would-match`, `does-not-match`, `excluded`, `undetermined` — with
   precedence excluded → undetermined → does-not-match → (active ? grants :
   inactive-would-match), because an exclusion is stated on the rule and outranks
   anything deduced from a profile. `GroupUserVerdict` puts provenance first:
   an app-managed roster and an existing membership are answers whatever the
   rules say. The condition verdict rides beside the headline as evidence and
   is never rewritten to agree with it; `unevaluable` is never rounded to
   `does-not-match`.

5. **The verb is read-only, so it sits in the row; it fetches, so it is never
   `primary`; and with no tab it is omitted, never disabled.** Its `title` names
   the cost. Its answer is a `DetailSection` under the strip with its own Clear.

## Consequences

- The rule rung gains _Evaluate user_, the group rung _Check membership_, the
  user rung _Check rule_ and _Check membership_ — four entry points, one engine,
  one subject path, two report components.
- `RuleDetailView` is no longer subjectless: its raw-expression well's footer
  states the condition's verdict once a subject is in scope. The rung still
  fetches nothing until asked.
- `docs/action-bars.md`, `docs/page-shell.md` and `docs/claims.md` state the
  resulting rules directly; `docs/scheduler.md` cites
  `loadQualificationSubject` as the reference two-leg plan.

## Alternatives considered

**Evaluate the picker's search row.** Zero extra requests, and wrong: an
unparsed row with a partial profile, evaluated against a rule that reads an
attribute the row omits, yields a confident `no-match`.

**Ask Okta per membership** — walk the target groups and check membership.
Answers "is this user in the group", which the complete list already answers,
and says nothing about _why not_.

**A fourth view-stack rung** for the subject. A subject is not navigation: the
admin is still looking at the rule, and pushing a rung would move the header
and the strip away from the thing being asked about.

**Fold status and exclusion into `RuleMatchResult`.** Rejected because the
evaluator's contract is the expression alone, and every existing adopter of the
ledger reads it that way. A wider union in the evaluator would make "matches"
mean two things.
