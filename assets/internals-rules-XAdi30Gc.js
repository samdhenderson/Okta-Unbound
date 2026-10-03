import{j as n}from"./iframe-Pee757m_.js";import{u as r,M as a,c as o}from"./blocks-CbycfW6w.js";import"./preload-helper-PPVm8Dsz.js";const i=`# Rules engine



---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / findExclusionDifferRuleGroups

# Function: findExclusionDifferRuleGroups()

> **findExclusionDifferRuleGroups**(\`rules\`): \`ExclusionDifferRuleGroup\`[]

Defined in: [src/shared/rules/consolidation.ts:174](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L174)

Group rules by match expression alone, and keep each group whose rules do not
all share one mergeIdentityKey — same condition, different exclusions.

The sibling of findMergeableRuleGroups. A group that holds a mergeable
pair **and** a third rule with other exclusions appears in both answers: the
pair can still be merged, and the reader should still see that the third rule
is not part of it.

## Parameters

### rules

\`OktaGroupRule\`[]

All group rules to scan, with \`conditions.people\` intact.

## Returns

\`ExclusionDifferRuleGroup\`[]

One ExclusionDifferRuleGroup per such expression.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / findMergeableRuleGroups

# Function: findMergeableRuleGroups()

> **findMergeableRuleGroups**(\`rules\`): \`MergeableRuleGroup\`[]

Defined in: [src/shared/rules/consolidation.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L117)

Group rules by mergeIdentityKey, keeping only groups of 2+ — these
match exactly the same people, so they merge into one rule carrying the union
of their target groups with no change to who is matched. Rules with an empty
expression are ignored.

## Parameters

### rules

\`OktaGroupRule\`[]

All group rules to scan, with \`conditions.people\` intact.

## Returns

\`MergeableRuleGroup\`[]

One MergeableRuleGroup per multi-rule cluster.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / haveIdenticalConditions

# Function: haveIdenticalConditions()

> **haveIdenticalConditions**(\`rules\`): \`boolean\`

Defined in: [src/shared/rules/consolidation.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L92)

Whether every rule shares one mergeIdentityKey — the gate a merge
re-checks on freshly read raw rules before it writes anything.

Requiring 2+ rules is findMergeableRuleGroups's job, not this gate's.

## Parameters

### rules

\`OktaGroupRule\`[]

The rules to be merged.

## Returns

\`boolean\`

\`true\` when there is at least one rule and all share one non-empty key.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / mergeIdentityKey

# Function: mergeIdentityKey()

> **mergeIdentityKey**(\`rule\`): \`string\` \\| \`null\`

Defined in: [src/shared/rules/consolidation.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L64)

The identity a rule must share with another for the two to be merged: its
parsed match expression plus its excluded users, excluded groups and included
groups. Two rules are merge-safe only when every one of these is identical —
the expression alone decides nothing, because an exclusion list changes who a
rule matches.

The expression is compared as a **parse tree**, not as text: whitespace falls
out of the tree, and string literals and attribute names keep their case, since
Okta compares both case-sensitively. An expression the parser rejects is
compared as its exact trimmed text. Either way the comparison errs towards
"different": two rules this key separates may still match the same people, but
two rules it joins always do.

## Parameters

### rule

\`OktaGroupRule\`

A raw rule, or one rebuilt with its \`conditions.people\` intact.

## Returns

\`string\` \\| \`null\`

The key, or \`null\` for a rule with no expression (never merge-safe).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / CreateRulePayload

# Interface: CreateRulePayload

Defined in: [src/shared/rules/consolidation.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L24)

The \`POST /api/v1/groups/rules\` body — the create-a-rule write's payload.

## Properties

### type

> **type**: \`string\`

Defined in: [src/shared/rules/consolidation.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L25)

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/consolidation.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L26)

***

### conditions

> **conditions**: \`RuleConditions\` \\| \`undefined\`

Defined in: [src/shared/rules/consolidation.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L27)

***

### actions

> **actions**: \`object\`

Defined in: [src/shared/rules/consolidation.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L28)

#### assignUserToGroups

> **assignUserToGroups**: \`object\`

##### assignUserToGroups.groupIds

> **groupIds**: \`string\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / ExclusionDifferRuleGroup

# Interface: ExclusionDifferRuleGroup

Defined in: [src/shared/rules/consolidation.ts:155](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L155)

A set of rules that share a match expression but not their exclusions — the
near miss a merge must refuse. Merging them would copy one rule's exclusions
onto the others' groups and change who is matched.

## Properties

### expression

> **expression**: \`string\`

Defined in: [src/shared/rules/consolidation.ts:157](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L157)

The shared match expression, verbatim from the set's first rule — for display only.

***

### rules

> **rules**: \`OktaGroupRule\`[]

Defined in: [src/shared/rules/consolidation.ts:159](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L159)

Every rule carrying that expression (2+), in input order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/consolidation / MergeableRuleGroup

# Interface: MergeableRuleGroup

Defined in: [src/shared/rules/consolidation.ts:99](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L99)

A set of rules that share identical conditions.

## Properties

### expression

> **expression**: \`string\`

Defined in: [src/shared/rules/consolidation.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L101)

The shared match expression, verbatim from the set's first rule — for display only.

***

### rules

> **rules**: \`OktaGroupRule\`[]

Defined in: [src/shared/rules/consolidation.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L103)

The rules sharing it (2+).

***

### unionGroupIds

> **unionGroupIds**: \`string\`[]

Defined in: [src/shared/rules/consolidation.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/consolidation.ts#L105)

Union of every member rule's target groups.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/currentGroupRelations / countCurrentGroupRuleRelations

# Function: countCurrentGroupRuleRelations()

> **countCurrentGroupRuleRelations**(\`rules\`, \`currentGroupId?\`): \`number\`

Defined in: [src/shared/rules/currentGroupRelations.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/currentGroupRelations.ts#L58)

How many distinct rules relate to the current group at all — the number the rules
strip's *This group* verb carries. The **union**, not the sum: a rule listed under
both headings is still one rule.

## Parameters

### rules

\`FormattedRule\`[]

Every rule currently loaded, unfiltered.

### currentGroupId?

\`string\`

The detected group id, if any.

## Returns

\`number\`

The count of distinct related rules; \`0\` when no group is detected.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/currentGroupRelations / splitCurrentGroupRuleRelations

# Function: splitCurrentGroupRuleRelations()

> **splitCurrentGroupRuleRelations**(\`rules\`, \`currentGroupId?\`): \`object\`

Defined in: [src/shared/rules/currentGroupRelations.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/currentGroupRelations.ts#L33)

Split the loaded rules into the two ways they can touch the current group. A rule
that both feeds the group and reads it in its condition appears in **both** lists
— they are opposite edges of the same graph, not a partition.

## Parameters

### rules

\`FormattedRule\`[]

Every rule currently loaded, unfiltered by search or chip.

### currentGroupId?

\`string\`

The detected group id, if any. Absent yields two empty lists.

## Returns

\`object\`

The rules that assign into the group, and those that reference it by id.

### assigning

> **assigning**: \`FormattedRule\`[]

### referencing

> **referencing**: \`FormattedRule\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / defaultKeptRule

# Function: defaultKeptRule()

> **defaultKeptRule**(\`rules\`): \`KeptDefault\` \\| \`null\`

Defined in: [src/shared/rules/duplicateSets.ts:164](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L164)

The rule a merge keeps unless the reader picks another: the \`ACTIVE\` one,
then the oldest. A Broken rule is never kept — Okta accepts only a delete for
it, so it cannot take the merged groups.

## Parameters

### rules

readonly \`FormattedRule\`[]

A set's members.

## Returns

\`KeptDefault\` \\| \`null\`

The default and its reason, or \`null\` when every member is Broken.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / findDuplicateSets

# Function: findDuplicateSets()

> **findDuplicateSets**(\`rules\`): \`DuplicateSet\`[]

Defined in: [src/shared/rules/duplicateSets.ts:121](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L121)

The Duplicates rung's sets: every mergeable set, then every
same-condition-different-exclusions set.

## Parameters

### rules

readonly \`FormattedRule\`[]

The loaded rules list.

## Returns

\`DuplicateSet\`[]

The sets, mergeable first. Empty when there are none.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / formattedAsRaw

# Function: formattedAsRaw()

> **formattedAsRaw**(\`rule\`): \`OktaGroupRule\`

Defined in: [src/shared/rules/duplicateSets.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L90)

Rebuild the raw shape the detectors read from a list row. Carries what the
row has — expression, exclusions, targets — and nothing it lacks.

## Parameters

### rule

\`FormattedRule\`

A list row.

## Returns

\`OktaGroupRule\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / mergeReadiness

# Function: mergeReadiness()

> **mergeReadiness**(\`set\`, \`keptId\`, \`nextName\`, \`allRules\`): \`MergeReadiness\`

Defined in: [src/shared/rules/duplicateSets.ts:197](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L197)

Whether a merge of \`set\` into \`keptId\`, under \`nextName\`, may be offered — and
what the kept rule would gain.

## Parameters

### set

\`DuplicateSet\`

A mergeable set.

### keptId

\`string\`

The rule chosen to keep.

### nextName

\`string\` \\| \`undefined\`

The kept rule's new name, trimmed; omitted when not renamed.

### allRules

readonly \`FormattedRule\`[]

Every loaded rule, for the name-collision check.

## Returns

\`MergeReadiness\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / DuplicateSet

# Interface: DuplicateSet

Defined in: [src/shared/rules/duplicateSets.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L31)

One set of rules on the Duplicates rung.

## Properties

### key

> **key**: \`string\`

Defined in: [src/shared/rules/duplicateSets.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L33)

Stable key: the kind and the member ids. Survives a reload that keeps the set.

***

### kind

> **kind**: \`DuplicateSetKind\`

Defined in: [src/shared/rules/duplicateSets.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L34)

***

### expression

> **expression**: \`string\`

Defined in: [src/shared/rules/duplicateSets.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L36)

The shared match expression, verbatim from the first rule — for display only.

***

### rules

> **rules**: \`FormattedRule\`[]

Defined in: [src/shared/rules/duplicateSets.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L38)

The member rules (2+), in list order.

***

### unionGroupIds

> **unionGroupIds**: \`string\`[]

Defined in: [src/shared/rules/duplicateSets.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L40)

Every member's target groups, de-duplicated, in first-seen order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / KeptDefault

# Interface: KeptDefault

Defined in: [src/shared/rules/duplicateSets.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L58)

The default kept rule of a set, and the reason.

## Properties

### ruleId

> **ruleId**: \`string\`

Defined in: [src/shared/rules/duplicateSets.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L59)

***

### reason

> **reason**: \`KeptReason\`

Defined in: [src/shared/rules/duplicateSets.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L60)

***

### rivals

> **rivals**: \`number\`

Defined in: [src/shared/rules/duplicateSets.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L62)

How many other rules the reason was decided against — "older" for one, "oldest" for more.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / MergeReadiness

# Interface: MergeReadiness

Defined in: [src/shared/rules/duplicateSets.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L75)

What a merge of one set would do, before anything is read.

## Properties

### gains

> **gains**: \`string\`[]

Defined in: [src/shared/rules/duplicateSets.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L77)

Target group ids the kept rule does not hold yet, in union order.

***

### block

> **block**: \`MergeBlock\` \\| \`null\`

Defined in: [src/shared/rules/duplicateSets.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L79)

Why it cannot run, or \`null\` when Review merge may be offered.

***

### takenNames

> **takenNames**: \`string\`[]

Defined in: [src/shared/rules/duplicateSets.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L81)

The names a rename must not collide with: every loaded rule but the kept one.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / DuplicateSetKind

# Type Alias: DuplicateSetKind

> **DuplicateSetKind** = \`"mergeable"\` \\| \`"exclusions-differ"\`

Defined in: [src/shared/rules/duplicateSets.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L28)

What a set is.

- \`mergeable\` — the same condition and the same exclusions: one rule can carry
  every target group without changing who is matched.
- \`exclusions-differ\` — the same condition, different exclusions. Shown so the
  reader sees the near miss; never offered a merge.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / KeptReason

# Type Alias: KeptReason

> **KeptReason** = \`"only-active"\` \\| \`"active-oldest"\` \\| \`"oldest"\` \\| \`"only-keepable"\` \\| \`"first-listed"\`

Defined in: [src/shared/rules/duplicateSets.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L54)

Why the default kept rule is the one it is. A code; the rung phrases it.

- \`only-active\`   — the one \`ACTIVE\` rule among those that can be kept.
- \`active-oldest\` — \`ACTIVE\`, and created before every other active rule.
- \`oldest\`        — none is active; created before the others.
- \`only-keepable\` — every other member is Broken, and Okta accepts only a
  delete for a Broken rule.
- \`first-listed\`  — nothing above separates them (same status, same created
  instant), so the first in the list.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/duplicateSets / MergeBlock

# Type Alias: MergeBlock

> **MergeBlock** = \`"no-keepable"\` \\| \`"over-limit"\` \\| \`RenameBlock\`

Defined in: [src/shared/rules/duplicateSets.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/duplicateSets.ts#L72)

Why a merge as set up cannot run. A code; the card phrases it.

- \`no-keepable\` — every member is Broken, so none can hold the merged groups.
- \`over-limit\`  — the union exceeds MAX\\_RULE\\_TARGETS.
- a RenameBlock — the new name is blank, too long, or taken.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / explainRuleExpression

# Function: explainRuleExpression()

> **explainRuleExpression**(\`expression\`, \`user\`, \`options?\`): \`RuleExplanation\`

Defined in: [src/shared/rules/explainExpression.ts:1367](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L1367)

Explain a group-rule condition against a user, clause by clause.

Pure and offline: no API calls, no code execution, no logging. The expression
is parsed once through \`ruleEvaluator\`'s memo and every clause is judged by the
same allow-list the rest of the app evaluates with, so an explanation can never
contradict the membership answer shown beside it.

A clause is \`fail\` **only** when it resolved to boolean \`false\`; everything the
evaluator could not resolve is \`not-evaluated\` with a
RuleUnevaluableReason. Clauses are not short-circuited — each is
reported on its own merits — while
RuleExplanationSummary.result carries the authoritative three-valued
verdict for the expression as a whole.

## Parameters

### expression

\`string\`

The rule's condition expression (untrusted Okta data).

### user

\`OktaUser\`

The user to explain the condition against.

### options?

\`ExplainRuleOptions\`

See ExplainRuleOptions.

## Returns

\`RuleExplanation\`

The clause RuleExplanation.tree plus a
  RuleExplanationSummary. Both \`expressionText\` and \`resolvedValue\` are
  untrusted/PII: render them escaped, never log them, and run them through
  \`csvUtils.escapeCSV\` before export.

## Example

\`\`\`ts
const { tree, summary } = explainRuleExpression(
  'user.department == "Engineering" && user.title != "Intern"',
  user,
);
// tree    → { node: 'connective', kind: 'and', verdict: 'fail', children: [
//              { node: 'leaf', expressionText: 'user.department == "Engineering"',
//                resolvedValue: 'Engineering', status: 'pass', reads: […] }, … ] }
// summary → { evaluatedClauses: 2, failedClauses: 1, … }
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / userAttributeNamesRead

# Function: userAttributeNamesRead()

> **userAttributeNamesRead**(\`expression\`): \`ReadonlySet\`\\<\`string\`\\> \\| \`undefined\`

Defined in: [src/shared/rules/explainExpression.ts:1059](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L1059)

Every \`user.*\` attribute name an expression reads, derived from its AST.

Exact and load-bearing, which is why it walks the parsed tree rather than
reusing the regex scans behind \`ruleUtils.extractUserAttributes\` or
\`RuleEffect.touchedAttributes\` — those are display aids allowed to miss.

A computed key that is not a string literal (\`user[x]\`) names no attribute this
module can enumerate, so it reports \`undefined\` rather than an incomplete set.

## Parameters

### expression

\`string\`

The rule condition. **Untrusted** tenant text.

## Returns

\`ReadonlySet\`\\<\`string\`\\> \\| \`undefined\`

The names read, or \`undefined\` when the expression could not be parsed
  or contains a read whose name is not statically knowable.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / AttributeRead

# Interface: AttributeRead

Defined in: [src/shared/rules/explainExpression.ts:111](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L111)

One profile attribute a clause read, with what it held for this user. Collected
off the AST, so the path is exactly what the rule dereferenced — a quoted
\`"user.department"\` naming a group is not a read.

## Properties

### path

> \`readonly\` **path**: \`string\`

Defined in: [src/shared/rules/explainExpression.ts:118](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L118)

The display path, normalised: \`user.department\` for the dotted form,
\`user["cost center"]\` (always double-quoted) for a string-literal computed
key. Deduplicated on this, so \`user['x']\` and \`user["x"]\` are one read.
**Untrusted:** an attribute name is tenant-authored — render escaped.

***

### value

> \`readonly\` **value**: \`ExprValue\`

Defined in: [src/shared/rules/explainExpression.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L124)

What the attribute held. \`null\` when this user's profile does not carry it —
absence is how Okta reports "no value" (ADR-0004), and the evidence line
renders it \`not set\`. **PII:** render escaped, never log, escape for CSV.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseGroupReference

# Interface: ClauseGroupReference

Defined in: [src/shared/rules/explainExpression.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L91)

One group an \`isMemberOf*\` clause asks about, and whether the user is in it.
Read off the AST rather than re-parsed from \`expressionText\`, so a name
containing a bracket or a comma cannot be mis-recovered.

## Properties

### match

> \`readonly\` **match**: \`ClauseGroupMatch\`

Defined in: [src/shared/rules/explainExpression.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L93)

Which field of the user's groups this argument is matched against.

***

### value

> \`readonly\` **value**: \`string\`

Defined in: [src/shared/rules/explainExpression.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L95)

The rule's literal — a group id, a full name, or a prefix/substring. **Untrusted.**

***

### satisfied

> \`readonly\` **satisfied**: \`boolean\`

Defined in: [src/shared/rules/explainExpression.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L97)

Whether any of the user's groups satisfies this argument.

***

### matchedGroupName?

> \`readonly\` \`optional\` **matchedGroupName?**: \`string\`

Defined in: [src/shared/rules/explainExpression.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L103)

The name of the user's group that satisfied it, when one did. Absent for an
unsatisfied reference — there is no group to name — and for a clause
explained without a group list. **Untrusted.**


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ConnectiveNode

# Interface: ConnectiveNode

Defined in: [src/shared/rules/explainExpression.ts:276](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L276)

An interior node of RuleExplanation.tree: an \`&&\` or \`||\` group.

Adjacent connectives of the same kind flatten into one n-ary node, so
\`a && b && c\` is a single AND over three children rather than a chain.

## Properties

### node

> \`readonly\` **node**: \`"connective"\`

Defined in: [src/shared/rules/explainExpression.ts:278](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L278)

Discriminant of ClauseTreeNode.

***

### kind

> \`readonly\` **kind**: \`ClauseConnectiveKind\`

Defined in: [src/shared/rules/explainExpression.ts:280](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L280)

Which connective joins the children.

***

### children

> \`readonly\` **children**: readonly \`ClauseTreeNode\`[]

Defined in: [src/shared/rules/explainExpression.ts:282](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L282)

The operands, in source order. Never empty.

***

### verdict

> \`readonly\` **verdict**: \`ClauseStatus\`

Defined in: [src/shared/rules/explainExpression.ts:294](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L294)

This group's own outcome, from the same two gates every other verdict here
passes: \`ruleEvaluator\`'s grammar allow-list over the whole sub-expression,
then its eager three-valued walk.

Taken from the evaluator rather than derived from children, so it
cannot disagree with RuleExplanationSummary.result — the grammar gate
rejects a whole sub-expression for one unsupported fragment, and a child that
resolved to a non-boolean is \`not-evaluated\` here while the evaluator still
reads its truthiness.

***

### decidedByChildIndices

> \`readonly\` **decidedByChildIndices**: readonly \`number\`[]

Defined in: [src/shared/rules/explainExpression.ts:302](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L302)

Which children carry a \`pass\`/\`fail\` verdict — indices into children:
the passing children of a passing OR, the failing children of a failing AND.
Empty for a failing OR and a passing AND (every child carries those), for a
\`not-evaluated\` verdict, and for a pass/fail verdict the evaluator reached
without any child resolving to a boolean — never assume it is non-empty.

***

### undecidedChildCount

> \`readonly\` **undecidedChildCount**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:304](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L304)

How many children are themselves \`not-evaluated\`.

***

### depth

> \`readonly\` **depth**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:306](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L306)

Nesting depth, \`0\` at the root. Bounded by MAX\\_TREE\\_DEPTH.

***

### truncation?

> \`readonly\` \`optional\` **truncation?**: \`ClauseTruncation\`

Defined in: [src/shared/rules/explainExpression.ts:312](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L312)

Present exactly when something under this node was dropped — see
ClauseTruncation. Set on the nearest surviving ancestor, and always
accompanied by RuleExplanationSummary.truncated.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ExplainRuleOptions

# Interface: ExplainRuleOptions

Defined in: [src/shared/rules/explainExpression.ts:379](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L379)

Options for explainRuleExpression.

## Properties

### maxClauses?

> \`readonly\` \`optional\` **maxClauses?**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:381](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L381)

Cap on clause rows. Defaults to DEFAULT\\_MAX\\_CLAUSES; values below 1 are ignored.

***

### groups?

> \`readonly\` \`optional\` **groups?**: \`RuleGroupContext\`

Defined in: [src/shared/rules/explainExpression.ts:392](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L392)

The user's **complete** group list, which turns every \`isMemberOf*\` clause
from \`not-evaluated\` / \`group-membership-fn\` into a real \`pass\` or \`fail\`.
Omit it rather than passing a partial list: a subset would report groups the
user *is* in as clauses they failed.

\`isMemberOfGroupNameRegex\` is answered from the same list, via the
linear-time matcher (ADR-0002). It stays unevaluated only when that engine
declines the pattern (\`regex-unsupported-syntax\`, \`regex-too-complex\`).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / LeafClauseNode

# Interface: LeafClauseNode

Defined in: [src/shared/rules/explainExpression.ts:204](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L204)

A leaf of RuleExplanation.tree: one indivisible clause of a rule
condition, explained against one user. A disjunction is a
ConnectiveNode, so the parts of an \`||\` are reached by descending into
\`children\`.

## Properties

### node

> \`readonly\` **node**: \`"leaf"\`

Defined in: [src/shared/rules/explainExpression.ts:206](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L206)

Discriminant of ClauseTreeNode.

***

### expressionText

> \`readonly\` **expressionText**: \`string\`

Defined in: [src/shared/rules/explainExpression.ts:211](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L211)

The clause, reconstructed from the AST — equivalent to, not byte-identical
with, the tenant's text. **Untrusted:** render escaped, never log.

***

### resolvedValue

> \`readonly\` **resolvedValue**: \`ExprValue\` \\| \`undefined\`

Defined in: [src/shared/rules/explainExpression.ts:218](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L218)

The value that drove the outcome: the clause's left-most non-literal operand,
resolved against the user's profile. \`undefined\` when no operand resolved;
\`null\` when the attribute resolved to Okta's null — the two are distinct.
**PII:** render escaped, never log, escape for CSV.

***

### status

> \`readonly\` **status**: \`ClauseStatus\`

Defined in: [src/shared/rules/explainExpression.ts:220](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L220)

Whether the clause passed, failed, or could not be resolved.

***

### reasonCode?

> \`readonly\` \`optional\` **reasonCode?**: \`RuleUnevaluableReason\`

Defined in: [src/shared/rules/explainExpression.ts:222](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L222)

Present exactly when \`status\` is \`not-evaluated\`: why the evaluator gave up.

***

### groupReferences?

> \`readonly\` \`optional\` **groupReferences?**: readonly \`ClauseGroupReference\`[]

Defined in: [src/shared/rules/explainExpression.ts:231](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L231)

Present only for an \`isMemberOf*\` clause explained **with** a group list: the
groups it asks about, and whether the user is in each. Absent without a list,
since \`satisfied\` would then read as a definite \`false\`.

Read groupRequirement before acting on these: under \`non-member\` it is
the **satisfied** entries that explain a failure.

***

### groupRequirement?

> \`readonly\` \`optional\` **groupRequirement?**: \`ClauseGroupRequirement\`

Defined in: [src/shared/rules/explainExpression.ts:237](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L237)

Which way round the clause asks — present exactly when
groupReferences is. Carried on the clause because every argument of
one call shares it.

***

### reads

> \`readonly\` **reads**: readonly \`AttributeRead\`[]

Defined in: [src/shared/rules/explainExpression.ts:243](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L243)

Every \`user.*\` attribute read anywhere under this leaf, in source order and
deduplicated by AttributeRead.path. A read that could not be resolved
for a reason other than absence is omitted rather than recorded as absent.

***

### predicate?

> \`readonly\` \`optional\` **predicate?**: \`LeafPredicate\`

Defined in: [src/shared/rules/explainExpression.ts:251](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L251)

What this clause asks, structurally — present only for the shapes
LeafPredicate recognises. Absent means "describe this clause by its
text", never "this clause is simple"; a group-membership clause never carries
one, and is described from groupRequirement and
groupReferences.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / RuleExplanation

# Interface: RuleExplanation

Defined in: [src/shared/rules/explainExpression.ts:365](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L365)

A rule condition explained against one user: the clause tree plus its summary.

## Properties

### tree

> \`readonly\` **tree**: \`ClauseTreeNode\`

Defined in: [src/shared/rules/explainExpression.ts:373](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L373)

The explanation itself — connective groups nested as written, one
LeafClauseNode per indivisible clause. The root of a rule with no
top-level connective is a leaf; so is \`!(a && b)\`, whose parts would invert if
reported separately. An expression that never parsed roots at a leaf with
empty text carrying the reason code — there is always a root to render.

***

### summary

> \`readonly\` **summary**: \`RuleExplanationSummary\`

Defined in: [src/shared/rules/explainExpression.ts:375](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L375)

Per-rule counts and the authoritative whole-expression verdict.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / RuleExplanationSummary

# Interface: RuleExplanationSummary

Defined in: [src/shared/rules/explainExpression.ts:332](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L332)

Per-rule counts the UI renders above the ledger, over the condition's
**top-level requirements**: the conjuncts of the root, with a disjunction
counted as one requirement whatever its width. Counting an \`||\` group's
alternatives individually would state that every one of them has to hold.

## Properties

### totalClauses

> \`readonly\` **totalClauses**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:334](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L334)

Top-level requirements counted. \`0\` when the expression never parsed.

***

### evaluatedClauses

> \`readonly\` **evaluatedClauses**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:336](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L336)

Rows with a real verdict (\`pass\` + \`fail\`) — the "3 of 4 clauses evaluated".

***

### passedClauses

> \`readonly\` **passedClauses**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:338](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L338)

Rows that resolved to \`true\`.

***

### failedClauses

> \`readonly\` **failedClauses**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:340](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L340)

Rows that resolved to \`false\`.

***

### notEvaluatedClauses

> \`readonly\` **notEvaluatedClauses**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:342](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L342)

Rows the evaluator could not resolve. Never counted as failures.

***

### needsGroupContext

> \`readonly\` **needsGroupContext**: \`number\`

Defined in: [src/shared/rules/explainExpression.ts:349](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L349)

Rows blocked specifically on \`isMemberOf*\` for want of a group list. Always
\`0\` once ExplainRuleOptions.groups is supplied. Does **not** count a
clause the safe regex engine declined (\`regex-unsupported-syntax\`,
\`regex-too-complex\`), which no group list would fix.

***

### result

> \`readonly\` **result**: \`RuleMatchResult\`

Defined in: [src/shared/rules/explainExpression.ts:355](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L355)

The whole-expression verdict, from the same engine every other consumer uses.
Three-valued, and not derivable by counting the rows above — an \`||\` can match
with most of its clauses failing.

***

### truncated

> \`readonly\` **truncated**: \`boolean\`

Defined in: [src/shared/rules/explainExpression.ts:361](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L361)

Whether anything was dropped: clause rows past the \`maxClauses\` cap, or a
sub-expression collapsed by MAX\\_TREE\\_DEPTH. result is always
computed over the whole expression.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / SubjectDescription

# Interface: SubjectDescription

Defined in: [src/shared/rules/explainExpression.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L137)

The attribute a clause is *about*, plus the functions wrapped around it.

## Properties

### path

> \`readonly\` **path**: \`string\`

Defined in: [src/shared/rules/explainExpression.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L144)

The attribute's display path, in the same normalised form as
AttributeRead.path (\`user.department\`, \`user["cost center"]\`), so a
description and the evidence line under it name the attribute identically.
**Untrusted:** render escaped.

***

### transforms

> \`readonly\` **transforms**: readonly \`SubjectTransform\`[]

Defined in: [src/shared/rules/explainExpression.ts:150](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L150)

The transforms wrapped around path, **innermost first**:
\`String.toLowerCase(String.removeSpaces(user.x))\` is
\`['removeSpaces', 'toLowerCase']\`. Empty for a bare attribute read.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseConnectiveKind

# Type Alias: ClauseConnectiveKind

> **ClauseConnectiveKind** = \`"and"\` \\| \`"or"\`

Defined in: [src/shared/rules/explainExpression.ts:255](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L255)

Whether a ConnectiveNode joins its children with \`&&\` or with \`||\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseGroupMatch

# Type Alias: ClauseGroupMatch

> **ClauseGroupMatch** = \`"id"\` \\| \`"name"\` \\| \`"nameStartsWith"\` \\| \`"nameContains"\` \\| \`"nameRegex"\`

Defined in: [src/shared/rules/explainExpression.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L74)

How an \`isMemberOf*\` argument identifies the group it asks about. \`nameRegex\` is
the tenant-authored pattern of \`isMemberOfGroupNameRegex\`, evaluated by
\`shared/rules/safeRegex\` (ADR-0002) with full-match semantics.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseGroupRequirement

# Type Alias: ClauseGroupRequirement

> **ClauseGroupRequirement** = \`"member"\` \\| \`"non-member"\`

Defined in: [src/shared/rules/explainExpression.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L84)

Which way round an \`isMemberOf*\` clause asks its question: \`member\` is the bare
call, \`non-member\` the negated form (\`!isMemberOfAnyGroup(…)\`).

It inverts which references are the problem — a failing \`member\` clause is
blamed on the groups the user is missing, a failing \`non-member\` clause on the
one they have.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseStatus

# Type Alias: ClauseStatus

> **ClauseStatus** = \`"pass"\` \\| \`"fail"\` \\| \`"not-evaluated"\`

Defined in: [src/shared/rules/explainExpression.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L67)

Outcome of a single clause. \`fail\` means "resolved to false", nothing else.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseTreeNode

# Type Alias: ClauseTreeNode

> **ClauseTreeNode** = \`ConnectiveNode\` \\| \`LeafClauseNode\`

Defined in: [src/shared/rules/explainExpression.ts:316](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L316)

One node of RuleExplanation.tree: a connective group, or a clause.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ClauseTruncation

# Type Alias: ClauseTruncation

> **ClauseTruncation** = \`"depth"\` \\| \`"clause-cap"\`

Defined in: [src/shared/rules/explainExpression.ts:268](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L268)

**Which** bound dropped something under a ConnectiveNode.

- \`depth\` — a child group nested past MAX\\_TREE\\_DEPTH was folded into a
  single leaf, which keeps the sub-expression's text and verdict; only the
  structure below it is gone.
- \`clause-cap\` — sibling clauses past the \`maxClauses\` budget were dropped
  outright and are not on screen at all.

A node that suffered both reports \`clause-cap\`, the larger loss.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / ComparisonOperator

# Type Alias: ComparisonOperator

> **ComparisonOperator** = \`"eq"\` \\| \`"ne"\` \\| \`"lt"\` \\| \`"lte"\` \\| \`"gt"\` \\| \`"gte"\`

Defined in: [src/shared/rules/explainExpression.ts:154](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L154)

The comparison a \`compare\` predicate makes, normalised to subject-on-left.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / LeafPredicate

# Type Alias: LeafPredicate

> **LeafPredicate** = \\{ \`form\`: \`"compare"\`; \`subject\`: \`SubjectDescription\`; \`operator\`: \`ComparisonOperator\`; \`operand\`: \`RuleExprValue\`; \\} \\| \\{ \`form\`: \`"compare-subjects"\`; \`left\`: \`SubjectDescription\`; \`operator\`: \`ComparisonOperator\`; \`right\`: \`SubjectDescription\`; \\} \\| \\{ \`form\`: \`"contains"\` \\| \`"starts-with"\` \\| \`"ends-with"\`; \`subject\`: \`SubjectDescription\`; \`operand\`: \`string\`; \`negated\`: \`boolean\`; \\} \\| \\{ \`form\`: \`"array-contains"\`; \`subject\`: \`SubjectDescription\`; \`operand\`: \`RuleExprValue\`; \`negated\`: \`boolean\`; \\} \\| \\{ \`form\`: \`"empty"\`; \`subject\`: \`SubjectDescription\`; \`negated\`: \`boolean\`; \\} \\| \\{ \`form\`: \`"boolean-attribute"\`; \`subject\`: \`SubjectDescription\`; \`negated\`: \`boolean\`; \\}

Defined in: [src/shared/rules/explainExpression.ts:166](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L166)

What a leaf clause *says*, as data — the structured half of
LeafClauseNode.expressionText.

Recognised syntactically off the same AST nodes the clause was evaluated from,
with no evaluation involved: it states what the rule asks, never what the answer
was. Where recognition is uncertain the field is absent rather than approximate,
and a caller with no predicate prints the clause text instead. Data, never
prose — the wording lives in the UI.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / SubjectTransform

# Type Alias: SubjectTransform

> **SubjectTransform** = \`"toLowerCase"\` \\| \`"toUpperCase"\` \\| \`"removeSpaces"\` \\| \`"len"\` \\| \`"size"\` \\| \`"toCsvString"\`

Defined in: [src/shared/rules/explainExpression.ts:133](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L133)

A value-transforming Okta EL function this module can describe in words — a
closed set, listed only where there is an unambiguous English reading
(\`String.toLowerCase\` → "lowercased"). A clause using \`String.substring\` or
\`String.stringSwitch\` carries no LeafPredicate at all.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / DEFAULT\\_MAX\\_CLAUSES

# Variable: DEFAULT\\_MAX\\_CLAUSES

> \`const\` **DEFAULT\\_MAX\\_CLAUSES**: \`64\` = \`64\`

Defined in: [src/shared/rules/explainExpression.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L64)

Default cap on the number of clause rows returned. Conditions are untrusted
input capped at 4096 characters, which leaves room for hundreds of \`&&\`-joined
clauses, so the walk is bounded.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/explainExpression / MAX\\_TREE\\_DEPTH

# Variable: MAX\\_TREE\\_DEPTH

> \`const\` **MAX\\_TREE\\_DEPTH**: \`8\` = \`8\`

Defined in: [src/shared/rules/explainExpression.ts:324](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/explainExpression.ts#L324)

How deeply RuleExplanation.tree nests connectives before it stops. Past
this depth the whole sub-expression becomes one leaf whose status is that
sub-expression evaluated whole — structure is lost, never a verdict — and the
nearest surviving ancestor carries \`truncation\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupAttributeIndex / indexRulesByAttribute

# Function: indexRulesByAttribute()

> **indexRulesByAttribute**(\`rules\`): \`Map\`\\<\`string\`, \`AttributeRuleRef\`[]\\>

Defined in: [src/shared/rules/groupAttributeIndex.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L39)

Build a reverse index from attribute name to the rules that reference it. A rule
contributes at most one entry per attribute, deduped again here so a
caller-supplied list with repeats cannot double-count.

## Parameters

### rules

readonly \`AttributeReferencingRule\`[]

Rules carrying their referenced \`userAttributes\`, if any.

## Returns

\`Map\`\\<\`string\`, \`AttributeRuleRef\`[]\\>

A map from attribute name to the distinct rules that reference it,
in first-seen order. Attributes no rule references are absent from the map.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupAttributeIndex / AttributeReferencingRule

# Interface: AttributeReferencingRule

Defined in: [src/shared/rules/groupAttributeIndex.ts:16](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L16)

The fields this module needs off a rule: identity plus the attributes it references.

## Properties

### id

> **id**: \`string\`

Defined in: [src/shared/rules/groupAttributeIndex.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L17)

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/groupAttributeIndex.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L18)

***

### status

> **status**: \`string\`

Defined in: [src/shared/rules/groupAttributeIndex.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L19)

***

### userAttributes?

> \`optional\` **userAttributes?**: \`string\`[]

Defined in: [src/shared/rules/groupAttributeIndex.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L21)

The \`user.<attr>\` references the rule's condition mentions, if any.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupAttributeIndex / AttributeRuleRef

# Interface: AttributeRuleRef

Defined in: [src/shared/rules/groupAttributeIndex.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L25)

A rule reduced to what an attribute card needs to link back to it.

## Properties

### ruleId

> **ruleId**: \`string\`

Defined in: [src/shared/rules/groupAttributeIndex.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L26)

***

### ruleName

> **ruleName**: \`string\`

Defined in: [src/shared/rules/groupAttributeIndex.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupAttributeIndex.ts#L27)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / annotateGroupsWithRuleCounts

# Function: annotateGroupsWithRuleCounts()

> **annotateGroupsWithRuleCounts**(\`groups\`, \`rules\`): \`GroupSummary\`[]

Defined in: [src/shared/rules/groupRuleIndex.ts:161](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L161)

Fill in each group's rule-attribution fields from a loaded rule list.

\`hasRules\`/\`ruleCount\` reflect only the **assigned-by** (feeding) rules, so the
orphan signal stays accurate; \`usedInRuleCount\` reflects the **used-in** ones.
Never mutates the inputs. A group with no relation gets \`0\`s, which is an
accurate "no rule feeds this" only once the rules are loaded — the loader tracks
that separately.

## Parameters

### groups

readonly \`GroupSummary\`[]

The group summaries to annotate.

### rules

readonly \`RuleAttribution\`[]

The loaded rules (target \`groupIds\` + \`conditionExpression\`).

## Returns

\`GroupSummary\`[]

The annotated group summaries.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / countReferencedGroups

# Function: countReferencedGroups()

> **countReferencedGroups**(\`rules\`): \`Map\`\\<\`string\`, \`number\`\\>

Defined in: [src/shared/rules/groupRuleIndex.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L136)

Tally, per group id, how many of the given rules *reference* it in their
condition expression (the "used in" axis — see the module header).

## Parameters

### rules

readonly \`RuleAttribution\`[]

Rules carrying a \`conditionExpression\`.

## Returns

\`Map\`\\<\`string\`, \`number\`\\>

A map from group id to the number of rules that reference it. Group
ids no rule references are absent from the map.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / countRulesByGroup

# Function: countRulesByGroup()

> **countRulesByGroup**(\`rules\`): \`Map\`\\<\`string\`, \`number\`\\>

Defined in: [src/shared/rules/groupRuleIndex.ts:114](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L114)

Tally, per group id, how many of the given rules target (feed) it.

## Parameters

### rules

readonly \`RuleTarget\`[]

Rules carrying their target \`groupIds\` (e.g. \`FormattedRule\`s).

## Returns

\`Map\`\\<\`string\`, \`number\`\\>

A map from group id to the number of rules that feed it. Group ids
that no rule targets are absent from the map.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / extractReferencedGroupIds

# Function: extractReferencedGroupIds()

> **extractReferencedGroupIds**(\`expression?\`): \`string\`[]

Defined in: [src/shared/rules/groupRuleIndex.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L82)

Extract the group ids a condition expression references via its id-taking
membership functions. Scans argument lists quote-aware, so quoted
parentheses/commas cannot confuse it and unrelated literals are ignored.

## Parameters

### expression?

\`string\` \\| \`null\`

A rule's raw condition expression (may be empty/undefined).

## Returns

\`string\`[]

The distinct referenced group ids, in first-seen order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / RuleAttribution

# Interface: RuleAttribution

Defined in: [src/shared/rules/groupRuleIndex.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L32)

A rule reduced to both attribution axes: its targets and its condition text.

## Extends

- \`RuleTarget\`

## Properties

### groupIds

> **groupIds**: \`string\`[]

Defined in: [src/shared/rules/groupRuleIndex.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L28)

Group ids this rule assigns users to (its target/feeding set).

#### Inherited from

\`RuleTarget\`.\`groupIds\`

***

### conditionExpression?

> \`optional\` **conditionExpression?**: \`string\` \\| \`null\`

Defined in: [src/shared/rules/groupRuleIndex.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L37)

The rule's condition expression, if any. Group ids referenced by the
id-taking membership functions in it are parsed out as "used in" relations.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/groupRuleIndex / RuleTarget

# Interface: RuleTarget

Defined in: [src/shared/rules/groupRuleIndex.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L26)

The one field this module needs off a rule: the groups it assigns users to.

## Extended by

- \`RuleAttribution\`

## Properties

### groupIds

> **groupIds**: \`string\`[]

Defined in: [src/shared/rules/groupRuleIndex.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/groupRuleIndex.ts#L28)

Group ids this rule assigns users to (its target/feeding set).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/moveDestinations / moveDestinations

# Function: moveDestinations()

> **moveDestinations**(\`rules\`, \`sourceRuleId\`, \`groupId\`): \`MoveDestinations\`

Defined in: [src/shared/rules/moveDestinations.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/moveDestinations.ts#L62)

The loaded rules a target group can be moved to.

## Parameters

### rules

readonly \`FormattedRule\`[]

Every rule the tab has loaded.

### sourceRuleId

\`string\`

The rule the group is moving off. Never offered, and not
  counted as excluded: it is where the move starts.

### groupId

\`string\`

The group being moved.

## Returns

\`MoveDestinations\`

## Example

\`\`\`ts
const { candidates, excluded } = moveDestinations(rules, rule.id, group.id);
// excluded['has-group'] rules already add to the group
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/moveDestinations / MoveDestinations

# Interface: MoveDestinations

Defined in: [src/shared/rules/moveDestinations.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/moveDestinations.ts#L28)

The rules a group can move to, and a count per reason for the rest.

## Properties

### candidates

> **candidates**: \`FormattedRule\`[]

Defined in: [src/shared/rules/moveDestinations.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/moveDestinations.ts#L30)

The rules offered, in the order the tab loaded them.

***

### excluded

> **excluded**: \`Record\`\\<\`MoveExclusion\`, \`number\`\\>

Defined in: [src/shared/rules/moveDestinations.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/moveDestinations.ts#L32)

How many loaded rules were left out, per reason. A reason with none is \`0\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/moveDestinations / MoveExclusion

# Type Alias: MoveExclusion

> **MoveExclusion** = \`"has-group"\` \\| \`"broken"\` \\| \`"full"\`

Defined in: [src/shared/rules/moveDestinations.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/moveDestinations.ts#L25)

Why a loaded rule is not offered as a destination.

- \`has-group\` — it already adds to the group, so the move would add nothing.
- \`broken\`    — Okta reports it \`INVALID\` and accepts no edit to its targets.
- \`full\`      — it already holds MAX\\_RULE\\_TARGETS target groups.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / isSameMerge

# Function: isSameMerge()

> **isSameMerge**(\`confirmed\`, \`fresh\`): \`boolean\`

Defined in: [src/shared/rules/ruleMerge.ts:170](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L170)

Whether a fresh plan is the one the reader confirmed: the same kept rule
with the same groups and name, the same union, and the same rules to retire.
Anything else means Okta changed under the confirm, and the run refuses
rather than write a merge nobody reviewed.

## Parameters

### confirmed

\`RuleMergePlan\`

The plan the confirm showed.

### fresh

\`RuleMergePlan\`

The plan from the run's own re-read.

## Returns

\`boolean\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / planRuleMerge

# Function: planRuleMerge()

> **planRuleMerge**(\`input\`): \`RuleMergePlanResult\`

Defined in: [src/shared/rules/ruleMerge.ts:119](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L119)

Plan a merge from a fresh read of every rule in the set.

## Parameters

### input

\`PlanRuleMergeInput\`

See PlanRuleMergeInput.

## Returns

\`RuleMergePlanResult\`

The plan, or the refusal that stops it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / retireRequests

# Function: retireRequests()

> **retireRequests**(\`status\`): \`number\`

Defined in: [src/shared/rules/ruleMerge.ts:109](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L109)

Requests to retire one rule: Okta deletes only an inactive rule, so an active one is paused first.

## Parameters

### status

\`GroupRuleStatus\`

## Returns

\`number\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / KeptRuleState

# Interface: KeptRuleState

Defined in: [src/shared/rules/ruleMerge.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L38)

The kept rule as it was read.

## Properties

### id

> **id**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L39)

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L40)

***

### status

> **status**: \`GroupRuleStatus\`

Defined in: [src/shared/rules/ruleMerge.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L41)

***

### groupIds

> **groupIds**: \`string\`[]

Defined in: [src/shared/rules/ruleMerge.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L42)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / PlanRuleMergeInput

# Interface: PlanRuleMergeInput

Defined in: [src/shared/rules/ruleMerge.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L83)

Input to planRuleMerge.

## Properties

### raws

> **raws**: readonly \`OktaGroupRule\`[]

Defined in: [src/shared/rules/ruleMerge.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L85)

Every rule in the set, as just read from Okta.

***

### keptRuleId

> **keptRuleId**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L87)

The rule to keep.

***

### nextName?

> \`optional\` **nextName?**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L89)

The kept rule's new name, or omitted to leave it.

***

### takenNames?

> \`optional\` **takenNames?**: readonly \`string\`[]

Defined in: [src/shared/rules/ruleMerge.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L91)

Names of every other loaded rule, for the \`name-taken\` check.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / RetireTarget

# Interface: RetireTarget

Defined in: [src/shared/rules/ruleMerge.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L29)

A rule the merge retires: deactivated if it is active, then deleted.

## Properties

### id

> **id**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L30)

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/ruleMerge.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L31)

***

### status

> **status**: \`GroupRuleStatus\`

Defined in: [src/shared/rules/ruleMerge.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L32)

***

### snapshot

> **snapshot**: \`RetiredRuleSnapshot\`

Defined in: [src/shared/rules/ruleMerge.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L34)

What the rule was, for the history record.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / RuleMergePlan

# Interface: RuleMergePlan

Defined in: [src/shared/rules/ruleMerge.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L46)

A merge that may run, from one fresh read of every rule in the set.

## Properties

### kept

> **kept**: \`KeptRuleState\`

Defined in: [src/shared/rules/ruleMerge.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L47)

***

### edit

> **edit**: \`RunnableTargetEdit\` \\| \`null\`

Defined in: [src/shared/rules/ruleMerge.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L53)

The kept rule's edit, or \`null\` when it already holds every target group
and keeps its name — a retry after a partial merge, or a set whose other
rules feed nothing new.

***

### retire

> **retire**: \`RetireTarget\`[]

Defined in: [src/shared/rules/ruleMerge.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L55)

The rules to retire, in set order.

***

### union

> **union**: \`string\`[]

Defined in: [src/shared/rules/ruleMerge.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L57)

The kept rule's target groups afterwards.

***

### added

> **added**: \`string\`[]

Defined in: [src/shared/rules/ruleMerge.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L59)

The target groups the kept rule gains, in union order.

***

### cost

> **cost**: \`object\`

Defined in: [src/shared/rules/ruleMerge.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L65)

What the run spends: one re-read per rule (the run reads the set again
before it writes), the kept rule's writes, and a deactivate and a delete per
active retired rule (a delete alone otherwise). \`writes\` counts rules changed.

#### requests

> **requests**: \`number\`

#### writes

> **writes**: \`number\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / MergeRefusal

# Type Alias: MergeRefusal

> **MergeRefusal** = \\{ \`kind\`: \`"not-identical"\`; \\} \\| \\{ \`kind\`: \`"missing-kept"\`; \\} \\| \\{ \`kind\`: \`"blocked"\`; \`reason\`: \`Exclude\`\\<\`BlockReason\`, \`"unchanged"\`\\>; \\}

Defined in: [src/shared/rules/ruleMerge.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L77)

Why a merge cannot run, read from the fresh rules.

- \`not-identical\` — the rules no longer share one condition and one set of
  exclusions, so merging them would change who is matched.
- \`missing-kept\`  — the kept rule is not among the rules read.
- \`blocked\`       — the kept rule's edit is blocked (\`planTargetEdit\`): it is
  Broken, the union is over the limit, or the new name is not allowed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleMerge / RuleMergePlanResult

# Type Alias: RuleMergePlanResult

> **RuleMergePlanResult** = \\{ \`refusal\`: \`MergeRefusal\`; \\} \\| \\{ \`refusal\`: \`null\`; \`plan\`: \`RuleMergePlan\`; \\}

Defined in: [src/shared/rules/ruleMerge.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleMerge.ts#L95)

The result of planRuleMerge.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargetFacts / additionConsequence

# Function: additionConsequence()

> **additionConsequence**(\`groupName\`): \`string\`

Defined in: [src/shared/rules/ruleTargetFacts.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargetFacts.ts#L88)

The consequence line for a group being **added** to a rule's targets. One
variant: adding a target is not one of the pending facts.

## Parameters

### groupName

\`string\`

The group's display name.

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargetFacts / removalConsequence

# Function: removalConsequence()

> **removalConsequence**(\`groupName\`, \`facts?\`): \`string\`

Defined in: [src/shared/rules/ruleTargetFacts.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargetFacts.ts#L73)

The consequence line for a group being **removed** from a rule's targets.

## Parameters

### groupName

\`string\`

The group's display name.

### facts?

\`RuleTargetFacts\` = \`RULE_TARGET_FACTS\`

The facts to branch on; defaults to RULE\\_TARGET\\_FACTS.

## Returns

\`string\`

Variant (a) when removal keeps members, variant (b) when it does not.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargetFacts / retireConsequence

# Function: retireConsequence()

> **retireConsequence**(\`retiredName\`, \`keptName\`, \`facts?\`): \`string\`

Defined in: [src/shared/rules/ruleTargetFacts.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargetFacts.ts#L100)

The members sentence for a merge that retires one rule into a kept one.

## Parameters

### retiredName

\`string\`

The retired rule's name (or a joined list of names).

### keptName

\`string\`

The kept rule's name.

### facts?

\`RuleTargetFacts\` = \`RULE_TARGET_FACTS\`

The facts to branch on; defaults to RULE\\_TARGET\\_FACTS.

## Returns

\`string\`

The keep-members variant or the remove-members variant.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargetFacts / RuleTargetFacts

# Type Alias: RuleTargetFacts

> **RuleTargetFacts** = \`{ readonly [K in keyof typeof RULE_TARGET_FACTS]: boolean }\`

Defined in: [src/shared/rules/ruleTargetFacts.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargetFacts.ts#L64)

The type of RULE\\_TARGET\\_FACTS, for a story or test that varies one.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargetFacts / RULE\\_TARGET\\_FACTS

# Variable: RULE\\_TARGET\\_FACTS

> \`const\` **RULE\\_TARGET\\_FACTS**: \`object\`

Defined in: [src/shared/rules/ruleTargetFacts.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargetFacts.ts#L23)

The facts the rule-target flows rest on. \`readonly\` and \`as const\` so a flow
can narrow on a value, and so no caller can flip one at runtime.

## Type Declaration

### removalKeepsMembers

> \`readonly\` **removalKeepsMembers**: \`false\` = \`false\`

Removing group G from a rule's targets leaves the people the rule already
added to G in G. **\`false\`:** Okta takes them out when the rule is
reactivated.

Documented by Okta: "If a group is removed from the THEN Assign to list,
User memberships will be removed by the Group Rule once activated."
(support.okta.com, "Okta group rule limitations and restrictions", read
2026-10-01). Still worth confirming live (step 0, question 1). Picks
consequence copy (b) "are removed" over (a) "stay".

### deleteKeepsMembers

> \`readonly\` **deleteKeepsMembers**: \`true\` = \`true\`

Deleting a rule with \`removeUsers\` omitted keeps the people it added in
their groups.

Pending step 0 verification, question 5. Picks the retire copy.

### namesAreUnique

> \`readonly\` **namesAreUnique**: \`true\` = \`true\`

Okta refuses a second rule with an existing rule's name, so a rename can
collide.

Pending step 0 verification, question 2. Gates the \`name-taken\` check in
\`planTargetEdit\`: when \`false\`, a duplicate name is not a block.

### putRequiresFullBody

> \`readonly\` **putRequiresFullBody**: \`true\` = \`true\`

\`PUT /api/v1/groups/rules/{id}\` replaces the rule, so its body must carry
the whole rule (name, type, conditions, actions), not only the changed
groups.

Pending step 0 verification, question 1. \`planTargetEdit\` builds the full
body from the freshly re-read rule either way; a full body is accepted under
both answers, so this flag documents the choice rather than gating it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / diffGroupIds

# Function: diffGroupIds()

> **diffGroupIds**(\`current\`, \`next\`): \`object\`

Defined in: [src/shared/rules/ruleTargets.ts:138](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L138)

The difference between two target lists: what \`next\` adds to and removes from
\`current\`, each in its own list's order.

## Parameters

### current

readonly \`string\`[]

The groups the rule has.

### next

readonly \`string\`[]

The groups it would have.

## Returns

\`object\`

### added

> **added**: \`string\`[]

### removed

> **removed**: \`string\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / planTargetEdit

# Function: planTargetEdit()

> **planTargetEdit**(\`input\`): \`TargetEditPlan\`

Defined in: [src/shared/rules/ruleTargets.ts:208](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L208)

Plan an edit of a rule's target groups, and optionally its name.

Checks run in a fixed order and the first that applies wins: \`broken\`, then the
name checks, then \`zero\`, \`over-limit\`, and finally \`unchanged\`. A rule that
is not \`ACTIVE\` gets only the save step — pausing an inactive rule is a write
that changes nothing, and resuming one would turn on a rule the admin left off.

## Parameters

### input

\`PlanTargetEditInput\`

See PlanTargetEditInput.

## Returns

\`TargetEditPlan\`

A TargetEditPlan.

## Example

\`\`\`ts
const plan = planTargetEdit({ raw, nextGroupIds: ['00gFAKE1', '00gFAKE2'] });
if (plan.blocked) showReason(plan.blocked);
else confirm(plan.cost.requests); // 4 for an active rule: re-read + 3 writes
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / renameBlock

# Function: renameBlock()

> **renameBlock**(\`name\`, \`currentName\`, \`takenNames?\`, \`facts?\`): \`RenameBlock\` \\| \`null\`

Defined in: [src/shared/rules/ruleTargets.ts:173](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L173)

The block a rename hits, if any — the same check planTargetEdit runs,
exported so a rename field can say what is wrong while it is typed, before any
read.

## Parameters

### name

\`string\`

The proposed name, already trimmed.

### currentName

\`string\`

The rule's name now.

### takenNames?

readonly \`string\`[]

Names of the **other** loaded rules. Omitted, a collision is not checked.

### facts?

\`RuleTargetFacts\` = \`RULE_TARGET_FACTS\`

The facts to branch on; defaults to \`RULE_TARGET_FACTS\`.

## Returns

\`RenameBlock\` \\| \`null\`

\`null\` when the name may be used (including when it is unchanged).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / ruleGroupIds

# Function: ruleGroupIds()

> **ruleGroupIds**(\`rule\`): \`string\`[]

Defined in: [src/shared/rules/ruleTargets.ts:155](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L155)

The rule's current target group ids, or an empty list when it has none.

## Parameters

### rule

\`OktaGroupRule\`

A raw rule.

## Returns

\`string\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / sameGroupSet

# Function: sameGroupSet()

> **sameGroupSet**(\`a\`, \`b\`): \`boolean\`

Defined in: [src/shared/rules/ruleTargets.ts:123](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L123)

Whether two id lists hold the same ids, ignoring order and repeats. Okta treats
a rule's targets as a set, so a reorder is not a change.

## Parameters

### a

readonly \`string\`[]

One id list.

### b

readonly \`string\`[]

The other.

## Returns

\`boolean\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / BlockedTargetEdit

# Interface: BlockedTargetEdit

Defined in: [src/shared/rules/ruleTargets.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L83)

An edit that cannot run, and why.

## Properties

### blocked

> **blocked**: \`BlockReason\`

Defined in: [src/shared/rules/ruleTargets.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L84)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / PlanTargetEditInput

# Interface: PlanTargetEditInput

Defined in: [src/shared/rules/ruleTargets.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L66)

Input to planTargetEdit.

## Properties

### raw

> **raw**: \`OktaGroupRule\`

Defined in: [src/shared/rules/ruleTargets.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L68)

The rule as just re-read from Okta.

***

### nextGroupIds

> **nextGroupIds**: readonly \`string\`[]

Defined in: [src/shared/rules/ruleTargets.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L70)

The target group ids the rule should hold afterwards. Duplicates are dropped.

***

### nextName?

> \`optional\` **nextName?**: \`string\`

Defined in: [src/shared/rules/ruleTargets.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L72)

A new name, for a rename. Omitted (or equal to the current name) leaves it alone.

***

### takenNames?

> \`optional\` **takenNames?**: readonly \`string\`[]

Defined in: [src/shared/rules/ruleTargets.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L77)

Names of the **other** loaded rules, for the \`name-taken\` check. Omitted, a
rename is not checked for a collision.

***

### facts?

> \`optional\` **facts?**: \`RuleTargetFacts\`

Defined in: [src/shared/rules/ruleTargets.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L79)

The facts to branch on; defaults to \`RULE_TARGET_FACTS\`. For tests.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / RunnableTargetEdit

# Interface: RunnableTargetEdit

Defined in: [src/shared/rules/ruleTargets.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L88)

An edit that can run: its writes, in order, the body to save, and the cost.

## Properties

### blocked

> **blocked**: \`null\`

Defined in: [src/shared/rules/ruleTargets.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L89)

***

### steps

> **steps**: readonly \`TargetEditStep\`[]

Defined in: [src/shared/rules/ruleTargets.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L91)

\`['pause', 'save', 'resume']\` for an active rule, \`['save']\` otherwise.

***

### body

> **body**: \`UpdateRulePayload\`

Defined in: [src/shared/rules/ruleTargets.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L93)

The full \`PUT\` body.

***

### cost

> **cost**: \`TargetEditCost\`

Defined in: [src/shared/rules/ruleTargets.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L95)

See TargetEditCost.

***

### groupIds

> **groupIds**: readonly \`string\`[]

Defined in: [src/shared/rules/ruleTargets.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L97)

The groups afterwards, de-duplicated, in the order given.

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/ruleTargets.ts:99](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L99)

The name afterwards (trimmed); the current name when not renamed.

***

### renamed

> **renamed**: \`boolean\`

Defined in: [src/shared/rules/ruleTargets.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L101)

Whether RunnableTargetEdit.name differs from the current name.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / TargetEditCost

# Interface: TargetEditCost

Defined in: [src/shared/rules/ruleTargets.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L58)

What an edit costs, counted from its plan — the executor's re-read included.

## Properties

### requests

> **requests**: \`number\`

Defined in: [src/shared/rules/ruleTargets.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L60)

Every request the run makes: one re-read plus one per step.

***

### writes

> **writes**: \`number\`

Defined in: [src/shared/rules/ruleTargets.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L62)

The requests that change the rule in Okta: one per step.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / UpdateRulePayload

# Interface: UpdateRulePayload

Defined in: [src/shared/rules/ruleTargets.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L50)

The \`PUT /api/v1/groups/rules/{id}\` body: the whole rule, groups (and name) replaced.

## Properties

### type

> **type**: \`string\`

Defined in: [src/shared/rules/ruleTargets.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L51)

***

### name

> **name**: \`string\`

Defined in: [src/shared/rules/ruleTargets.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L52)

***

### conditions

> **conditions**: \`RuleConditions\` \\| \`undefined\`

Defined in: [src/shared/rules/ruleTargets.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L53)

***

### actions

> **actions**: \`object\`

Defined in: [src/shared/rules/ruleTargets.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L54)

#### assignUserToGroups

> **assignUserToGroups**: \`object\`

##### assignUserToGroups.groupIds

> **groupIds**: \`string\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / BlockReason

# Type Alias: BlockReason

> **BlockReason** = \`"over-limit"\` \\| \`"broken"\` \\| \`"zero"\` \\| \`"unchanged"\` \\| \`"name-empty"\` \\| \`"name-too-long"\` \\| \`"name-taken"\`

Defined in: [src/shared/rules/ruleTargets.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L43)

Why an edit cannot run. A code, never a sentence: the editor and the merge
confirm each phrase it, and neither branches on the phrasing.

- \`broken\`        — the rule is \`INVALID\`; Okta accepts only a delete.
- \`name-empty\`    — the new name is blank once trimmed.
- \`name-too-long\` — the new name is over MAX\\_RULE\\_NAME\\_LENGTH.
- \`name-taken\`    — another loaded rule already has the name (case-insensitive),
  checked only while \`RULE_TARGET_FACTS.namesAreUnique\` holds.
- \`zero\`          — the edit leaves no target groups.
- \`over-limit\`    — the edit leaves more than MAX\\_RULE\\_TARGETS.
- \`unchanged\`     — the groups (as a set) and the name match what Okta has.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / RenameBlock

# Type Alias: RenameBlock

> **RenameBlock** = \`Extract\`\\<\`BlockReason\`, \`"name-empty"\` \\| \`"name-too-long"\` \\| \`"name-taken"\`\\>

Defined in: [src/shared/rules/ruleTargets.ts:160](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L160)

The BlockReasons a rename alone can hit.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / TargetEditPlan

# Type Alias: TargetEditPlan

> **TargetEditPlan** = \`BlockedTargetEdit\` \\| \`RunnableTargetEdit\`

Defined in: [src/shared/rules/ruleTargets.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L105)

The result of planTargetEdit: blocked with a reason, or runnable.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / TargetEditStep

# Type Alias: TargetEditStep

> **TargetEditStep** = \`"pause"\` \\| \`"save"\` \\| \`"resume"\`

Defined in: [src/shared/rules/ruleTargets.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L47)

One write of an edit, in run order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / MAX\\_RULE\\_NAME\\_LENGTH

# Variable: MAX\\_RULE\\_NAME\\_LENGTH

> \`const\` **MAX\\_RULE\\_NAME\\_LENGTH**: \`50\` = \`50\`

Defined in: [src/shared/rules/ruleTargets.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L25)

Okta caps a group rule's name at 50 characters — the one declaration of that
limit (D-090), shared by the rename check here and the create-a-rule draft.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/ruleTargets / MAX\\_RULE\\_TARGETS

# Variable: MAX\\_RULE\\_TARGETS

> \`const\` **MAX\\_RULE\\_TARGETS**: \`100\` = \`100\`

Defined in: [src/shared/rules/ruleTargets.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/ruleTargets.ts#L28)

Okta caps a group rule at 100 target groups.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / compileSafeRegex

# Function: compileSafeRegex()

> **compileSafeRegex**(\`pattern\`, \`limits?\`): \`SafeRegexCompileResult\`

Defined in: [src/shared/rules/safeRegex.ts:559](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L559)

Parse and compile a tenant pattern into a reusable NFA program. Compile once,
match many — compilation is the expensive half.

## Parameters

### pattern

\`string\`

The tenant-authored pattern, unanchored (full-match semantics
  are applied by the matcher, not by rewriting the pattern).

### limits?

\`Partial\`\\<\`SafeRegexLimits\`\\>

Optional overrides for SAFE\\_REGEX\\_LIMITS. Callers
  normally omit this; tightening the caps is supported so a caller with a
  smaller budget can enforce it.

## Returns

\`SafeRegexCompileResult\`

A CompiledSafeRegex, or a SafeRegexDeclined naming the
  guard that stopped it. Never throws.

## Example

\`\`\`ts
const program = compileSafeRegex('SecOps-.*');
if (program.kind === 'compiled') matchCompiled(program, 'SecOps-Alpha');
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / matchCompiled

# Function: matchCompiled()

> **matchCompiled**(\`program\`, \`input\`, \`limits?\`): \`SafeRegexResult\`

Defined in: [src/shared/rules/safeRegex.ts:594](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L594)

Run a compiled program against one input, with Java \`matches()\` semantics. No
state is visited twice per position, so the work is bounded by \`states x input\`
however the pattern nests its quantifiers — \`(a+)+\` costs the same as \`a+\`.

## Parameters

### program

\`CompiledSafeRegex\`

A program from compileSafeRegex.

### input

\`string\`

The string to match in full (a group name).

### limits?

\`Partial\`\\<\`SafeRegexLimits\`\\>

Optional overrides for SAFE\\_REGEX\\_LIMITS.

## Returns

\`SafeRegexResult\`

\`{ kind: 'match', matched }\` when the engine has an answer, or a
  decline. Never throws.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / matchSafeRegex

# Function: matchSafeRegex()

> **matchSafeRegex**(\`pattern\`, \`input\`, \`limits?\`): \`SafeRegexResult\`

Defined in: [src/shared/rules/safeRegex.ts:702](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L702)

Match a tenant pattern against one input, compiling it on the way — one-shot
use only. Matching many names against one pattern should compile once instead.

## Parameters

### pattern

\`string\`

The tenant-authored pattern.

### input

\`string\`

The string to match in full (a group name).

### limits?

\`Partial\`\\<\`SafeRegexLimits\`\\>

Optional overrides for SAFE\\_REGEX\\_LIMITS.

## Returns

\`SafeRegexResult\`

A matched/not-matched answer, or a structured decline. Never throws.

## Example

\`\`\`ts
matchSafeRegex('SecOps-.*', 'SecOps-Alpha');   // { kind: 'match', matched: true }
matchSafeRegex('SecOps-.*', 'X-SecOps-Alpha'); // { kind: 'match', matched: false }
matchSafeRegex('(a)\\\\1', 'aa');                // { kind: 'declined', reason: 'unsupported-syntax' }
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / CompiledSafeRegex

# Interface: CompiledSafeRegex

Defined in: [src/shared/rules/safeRegex.ts:149](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L149)

A compiled pattern, reusable across many inputs. Opaque to callers.

## Properties

### kind

> \`readonly\` **kind**: \`"compiled"\`

Defined in: [src/shared/rules/safeRegex.ts:150](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L150)

***

### pattern

> \`readonly\` **pattern**: \`string\`

Defined in: [src/shared/rules/safeRegex.ts:152](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L152)

The pattern this program was compiled from, for cache keying.

***

### stateCount

> \`readonly\` **stateCount**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:154](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L154)

How many NFA states it occupies — the figure MAX\\_NFA\\_STATES bounds.

***

### states

> \`readonly\` **states**: readonly \`NfaState\`[]

Defined in: [src/shared/rules/safeRegex.ts:156](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L156)

**\`Internal\`**

The NFA itself.

***

### start

> \`readonly\` **start**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:158](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L158)

**\`Internal\`**

Index of the entry state.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexDeclined

# Interface: SafeRegexDeclined

Defined in: [src/shared/rules/safeRegex.ts:134](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L134)

A decline: the engine has no opinion, and says which guard stopped it.

## Properties

### kind

> \`readonly\` **kind**: \`"declined"\`

Defined in: [src/shared/rules/safeRegex.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L135)

***

### reason

> \`readonly\` **reason**: \`SafeRegexDeclineReason\`

Defined in: [src/shared/rules/safeRegex.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L136)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexLimits

# Interface: SafeRegexLimits

Defined in: [src/shared/rules/safeRegex.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L79)

The four ceilings, as one overridable bundle.

## Properties

### maxPatternLength

> \`readonly\` **maxPatternLength**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L81)

#### See

MAX\\_PATTERN\\_LENGTH

***

### maxNfaStates

> \`readonly\` **maxNfaStates**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L83)

#### See

MAX\\_NFA\\_STATES

***

### maxInputLength

> \`readonly\` **maxInputLength**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L85)

#### See

MAX\\_INPUT\\_LENGTH

***

### maxSimulationSteps

> \`readonly\` **maxSimulationSteps**: \`number\`

Defined in: [src/shared/rules/safeRegex.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L87)

#### See

MAX\\_SIMULATION\\_STEPS


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexMatch

# Interface: SafeRegexMatch

Defined in: [src/shared/rules/safeRegex.ts:140](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L140)

An answer: the pattern ran, and either did or did not match the whole input.

## Properties

### kind

> \`readonly\` **kind**: \`"match"\`

Defined in: [src/shared/rules/safeRegex.ts:141](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L141)

***

### matched

> \`readonly\` **matched**: \`boolean\`

Defined in: [src/shared/rules/safeRegex.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L142)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexCompileResult

# Type Alias: SafeRegexCompileResult

> **SafeRegexCompileResult** = \`CompiledSafeRegex\` \\| \`SafeRegexDeclined\`

Defined in: [src/shared/rules/safeRegex.ts:162](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L162)

Either a reusable program or the decline that stopped compilation.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexDeclineReason

# Type Alias: SafeRegexDeclineReason

> **SafeRegexDeclineReason** = \`"pattern-too-long"\` \\| \`"input-too-long"\` \\| \`"unsupported-syntax"\` \\| \`"parse-error"\` \\| \`"too-many-states"\` \\| \`"step-budget-exceeded"\` \\| \`"internal-error"\`

Defined in: [src/shared/rules/safeRegex.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L117)

Why the engine refused to answer. Codes, not messages — the copy lives in the UI.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SafeRegexResult

# Type Alias: SafeRegexResult

> **SafeRegexResult** = \`SafeRegexMatch\` \\| \`SafeRegexDeclined\`

Defined in: [src/shared/rules/safeRegex.ts:146](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L146)

The three-valued outcome of a match attempt: matched, did not match, or declined.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / MAX\\_INPUT\\_LENGTH

# Variable: MAX\\_INPUT\\_LENGTH

> \`const\` **MAX\\_INPUT\\_LENGTH**: \`512\` = \`512\`

Defined in: [src/shared/rules/safeRegex.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L64)

Longest input (group name) this engine will match against, in code units.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / MAX\\_NFA\\_STATES

# Variable: MAX\\_NFA\\_STATES

> \`const\` **MAX\\_NFA\\_STATES**: \`512\` = \`512\`

Defined in: [src/shared/rules/safeRegex.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L70)

Ceiling on compiled NFA states — an independent backstop, since
MAX\\_PATTERN\\_LENGTH already implies well under this figure.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / MAX\\_PATTERN\\_LENGTH

# Variable: MAX\\_PATTERN\\_LENGTH

> \`const\` **MAX\\_PATTERN\\_LENGTH**: \`256\` = \`256\`

Defined in: [src/shared/rules/safeRegex.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L61)

Longest tenant pattern this engine will parse, in code units.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / MAX\\_SIMULATION\\_STEPS

# Variable: MAX\\_SIMULATION\\_STEPS

> \`const\` **MAX\\_SIMULATION\\_STEPS**: \`250000\` = \`250_000\`

Defined in: [src/shared/rules/safeRegex.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L76)

Ceiling on simulation work units (roughly one state visit each), which makes the
linear-time guarantee enforced rather than merely argued.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/safeRegex / SAFE\\_REGEX\\_LIMITS

# Variable: SAFE\\_REGEX\\_LIMITS

> \`const\` **SAFE\\_REGEX\\_LIMITS**: \`SafeRegexLimits\`

Defined in: [src/shared/rules/safeRegex.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/safeRegex.ts#L91)

The default limits, built from the exported constants.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / clusterSimilarRules

# Function: clusterSimilarRules()

> **clusterSimilarRules**(\`rules\`): \`SimilarRuleCluster\`[]

Defined in: [src/shared/rules/similarity.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L142)

Cluster rules into connected components of similarity (union-find over all
pairs). Clusters are ordered multi-rule first, then by size descending, then by
a representative normalized name; within a cluster rules are ordered by
expression then name so identical rules are adjacent. O(n²) in the rule count,
which is fine for the tens-to-low-hundreds of rules a tenant has.

## Parameters

### rules

\`FormattedRule\`[]

The rules to cluster (order-independent).

## Returns

\`SimilarRuleCluster\`[]

The similarity clusters in display order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / normalizeRuleExpression

# Function: normalizeRuleExpression()

> **normalizeRuleExpression**(\`expression\`): \`string\`

Defined in: [src/shared/rules/similarity.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L52)

Normalize a match expression for equality: lower-case and collapse whitespace.

## Parameters

### expression

\`string\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / normalizeRuleName

# Function: normalizeRuleName()

> **normalizeRuleName**(\`name\`): \`string\`

Defined in: [src/shared/rules/similarity.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L42)

Normalize a rule name for comparison: drop the "(consolidated)" suffix, lower-case,
reduce punctuation to spaces, and collapse whitespace.

## Parameters

### name

\`string\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / rulesAreSimilar

# Function: rulesAreSimilar()

> **rulesAreSimilar**(\`a\`, \`b\`): \`boolean\`

Defined in: [src/shared/rules/similarity.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L108)

Decide whether two rules are similar enough to sit together. True when they
share an (identical or high-overlap) expression, the same attribute shape, or
an (identical or high-overlap) name.

## Parameters

### a

\`FormattedRule\`

### b

\`FormattedRule\`

## Returns

\`boolean\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / sortRules

# Function: sortRules()

> **sortRules**(\`rules\`, \`mode\`): \`FormattedRule\`[]

Defined in: [src/shared/rules/similarity.ts:220](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L220)

Order rules for display according to a RuleSortMode.

- \`default\` — preserve the incoming (load) order.
- \`name\` — alphabetical by name (case-insensitive), id as a stable tiebreak.
- \`similarity\` — group similar rules adjacently (see clusterSimilarRules).

Always returns a new array; never mutates the input.

## Parameters

### rules

\`FormattedRule\`[]

The rules to order.

### mode

\`RuleSortMode\`

The sort mode.

## Returns

\`FormattedRule\`[]

A new, ordered array.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / SimilarRuleCluster

# Interface: SimilarRuleCluster

Defined in: [src/shared/rules/similarity.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L125)

A cluster of mutually/transitively similar rules, in a stable inner order.

## Properties

### rules

> **rules**: \`FormattedRule\`[]

Defined in: [src/shared/rules/similarity.ts:127](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L127)

The rules in this cluster (1+). Singletons are clusters of size 1.

***

### hasSiblings

> **hasSiblings**: \`boolean\`

Defined in: [src/shared/rules/similarity.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L129)

True when the cluster has 2+ rules (i.e. something to compare).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / RuleSortMode

# Type Alias: RuleSortMode

> **RuleSortMode** = \`"default"\` \\| \`"name"\` \\| \`"similarity"\`

Defined in: [src/shared/rules/similarity.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L20)

How the Rules tab orders its list.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / EXPRESSION\\_SIMILARITY\\_THRESHOLD

# Variable: EXPRESSION\\_SIMILARITY\\_THRESHOLD

> \`const\` **EXPRESSION\\_SIMILARITY\\_THRESHOLD**: \`0.6\` = \`0.6\`

Defined in: [src/shared/rules/similarity.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L30)

Token-overlap (Jaccard) at or above which two expressions count as similar.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / NAME\\_SIMILARITY\\_THRESHOLD

# Variable: NAME\\_SIMILARITY\\_THRESHOLD

> \`const\` **NAME\\_SIMILARITY\\_THRESHOLD**: \`0.5\` = \`0.5\`

Defined in: [src/shared/rules/similarity.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L33)

Token-overlap (Jaccard) at or above which two names count as similar.
0.5 pairs names sharing two of three tokens (e.g. "…Access West"/"…Access East").


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/similarity / RULE\\_SORT\\_LABELS

# Variable: RULE\\_SORT\\_LABELS

> \`const\` **RULE\\_SORT\\_LABELS**: \`Record\`\\<\`RuleSortMode\`, \`string\`\\>

Defined in: [src/shared/rules/similarity.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/similarity.ts#L23)

Human-readable labels for each sort mode (for a picker).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/snapshotRules / formatSnapshotRules

# Function: formatSnapshotRules()

> **formatSnapshotRules**(\`rows\`, \`groupIndex?\`, \`currentGroupId?\`): \`OrgRulesPayload\`

Defined in: [src/shared/rules/snapshotRules.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L129)

Join raw Okta rules into the OrgRulesPayload.

## Parameters

### rows

readonly \`OktaGroupRule\`[]

Validated raw rules in Okta's shape — the snapshot's \`rules\`
  collection (zod-parsed by the background walk on write) or a panel walk's
  validated pages.

### groupIndex?

\`CachedGroupIndex\`

The snapshot's group index. Present, every rule carries
  \`groupNames\`, \`allGroupNamesMap\` and (when the group walk finished)
  \`missingGroupIds\`; an empty index is legitimate and labels ids as
  themselves. Absent, rules are formatted bare — for callers that read only
  ids and expressions, such as membership analysis.

### currentGroupId?

\`string\`

Marks \`affectsCurrentGroup\`. Omit for an org-wide
  payload: baking one group's flag into a shared payload is wrong for every
  other group.

## Returns

\`OrgRulesPayload\`

Formatted rules, the raw rows, stats, and conflicts.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/snapshotRules / CachedGroupIndex

# Interface: CachedGroupIndex

Defined in: [src/shared/rules/snapshotRules.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L18)

What the snapshot can say about the org's groups in one read.

## Properties

### nameById

> **nameById**: \`Map\`\\<\`string\`, \`string\`\\>

Defined in: [src/shared/rules/snapshotRules.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L20)

Group id → display name, for every group the snapshot holds.

***

### idsHeld

> **idsHeld**: \`Set\`\\<\`string\`\\>

Defined in: [src/shared/rules/snapshotRules.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L27)

Every group id the snapshot holds — including the ones with no usable name,
which CachedGroupIndex.nameById necessarily drops. A membership
question asked of this set must not turn on whether a row happened to carry
a \`profile.name\`.

***

### complete

> **complete**: \`boolean\`

Defined in: [src/shared/rules/snapshotRules.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L34)

Whether the group walk finished. \`false\` for an interrupted walk, a
never-walked org, and a missing origin alike, so a reader that gates on it
degrades to saying nothing rather than to a claim built on a partial
inventory.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/snapshotRules / OrgRulesPayload

# Interface: OrgRulesPayload

Defined in: [src/shared/rules/snapshotRules.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L38)

The org-wide rules payload, in the shape every rules surface consumes.

## Extended by

- \`OrgRulesRead\`

## Properties

### rules

> **rules**: \`FormattedRule\`[]

Defined in: [src/shared/rules/snapshotRules.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L40)

Rules shaped for display.

***

### rawRules

> **rawRules**: \`OktaGroupRule\`[]

Defined in: [src/shared/rules/snapshotRules.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L42)

The same rules exactly as Okta returned them.

***

### stats

> **stats**: \`RuleStats\`

Defined in: [src/shared/rules/snapshotRules.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L44)

Aggregate counts across OrgRulesPayload.rawRules.

***

### conflicts

> **conflicts**: \`RuleConflict\`[]

Defined in: [src/shared/rules/snapshotRules.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L46)

Attribute/target conflicts between active rules.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/unevaluableReasonText / unevaluableReasonText

# Function: unevaluableReasonText()

> **unevaluableReasonText**(\`reason\`): \`string\`

Defined in: [src/shared/rules/unevaluableReasonText.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/unevaluableReasonText.ts#L48)

The sentence for one reason code. RuleUnevaluableReason can grow in
\`ruleEvaluator\`, so a missing entry degrades to a vague-but-true sentence rather
than rendering \`undefined\` at an admin.

## Parameters

### reason

\`RuleUnevaluableReason\` \\| \`undefined\`

The reason code, or \`undefined\` when none was reported.

## Returns

\`string\`

A complete sentence, always.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / shared/rules/unevaluableReasonText / UNEVALUABLE\\_REASON\\_TEXT

# Variable: UNEVALUABLE\\_REASON\\_TEXT

> \`const\` **UNEVALUABLE\\_REASON\\_TEXT**: \`Record\`\\<\`RuleUnevaluableReason\`, \`string\`\\>

Defined in: [src/shared/rules/unevaluableReasonText.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/unevaluableReasonText.ts#L20)

Reason code → the sentence shown to an admin.`;function t(e){return n.jsxs(n.Fragment,{children:[`
`,n.jsx(a,{title:"Internals/Rules engine"}),`
`,n.jsx(o,{children:i})]})}function h(e={}){const{wrapper:s}={...r(),...e.components};return s?n.jsx(s,{...e,children:n.jsx(t,{...e})}):t()}export{h as default};
