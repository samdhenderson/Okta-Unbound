import{j as n}from"./iframe-Pee757m_.js";import{u as o,M as a,c as r}from"./blocks-CbycfW6w.js";import"./preload-helper-PPVm8Dsz.js";const i=`# Hooks



---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / clock

# Function: clock()

> **clock**(\`totalSeconds\`): \`string\`

Defined in: [src/sidepanel/hooks/activityEta.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L53)

Format seconds as \`m:ss\`.

## Parameters

### totalSeconds

\`number\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / cooldownClock

# Function: cooldownClock()

> **cooldownClock**(\`ms\`): \`string\`

Defined in: [src/sidepanel/hooks/activityEta.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L60)

Format milliseconds as a coarse \`Xm Ys\` / \`Xs\` cooldown label.

## Parameters

### ms

\`number\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / estimateEta

# Function: estimateEta()

> **estimateEta**(\`input\`): \`EtaEstimate\`

Defined in: [src/sidepanel/hooks/activityEta.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L117)

Estimate the time remaining in an operation as a range.

## Parameters

### input

\`EtaInput\`

## Returns

\`EtaEstimate\`

An EtaEstimate; the \`unknown\` form whenever throughput cannot
be measured.

## Example

\`\`\`ts
estimateEta({ done: 10, total: 20, elapsedMs: 20_000, longestGateMs: 0 });
// => { kind: 'point', lowerMs: 20_000, label: '~0:20 left' }
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / longestArmedGateMs

# Function: longestArmedGateMs()

> **longestArmedGateMs**(\`gatedUntil\`, \`globalCooldownMs\`, \`now\`): \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L80)

The widest gate the scheduler currently has armed, as a duration from \`now\`.

\`max\`, never \`sum\`: gates elapse concurrently, so work resumes when the last
one lifts.

## Parameters

### gatedUntil

readonly (\`number\` \\| \`null\`)[]

Each bucket's gate deadline in epoch milliseconds, \`null\`
when that bucket is not gated.

### globalCooldownMs

\`number\`

Milliseconds left on the scheduler-wide cooldown.

### now

\`number\`

Current time in epoch milliseconds.

## Returns

\`number\`

A non-negative duration in milliseconds; \`0\` when nothing is gated.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / EtaInput

# Interface: EtaInput

Defined in: [src/sidepanel/hooks/activityEta.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L92)

Inputs to estimateEta. All times in milliseconds.

## Properties

### done

> **done**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L94)

Items settled so far in the running operation.

***

### total

> **total**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L96)

Items the operation declared in total.

***

### elapsedMs

> **elapsedMs**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L98)

Wall-clock elapsed since the operation started.

***

### longestGateMs

> **longestGateMs**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L104)

The longest gate the scheduler currently has armed, as a duration from now;
zero when nothing is gated. A duration rather than a deadline keeps
estimateEta pure.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / EtaPoint

# Interface: EtaPoint

Defined in: [src/sidepanel/hooks/activityEta.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L27)

Throughput is known and no gate is armed, so the bounds coincide.

## Properties

### kind

> **kind**: \`"point"\`

Defined in: [src/sidepanel/hooks/activityEta.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L28)

***

### lowerMs

> **lowerMs**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L30)

Best-case milliseconds remaining.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/activityEta.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L32)

Display label, e.g. \`~1:20 left\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / EtaRange

# Interface: EtaRange

Defined in: [src/sidepanel/hooks/activityEta.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L36)

Throughput is known and an armed gate widens the upper bound.

## Properties

### kind

> **kind**: \`"range"\`

Defined in: [src/sidepanel/hooks/activityEta.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L37)

***

### lowerMs

> **lowerMs**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L39)

Best case: the remaining work meets no gate.

***

### upperMs

> **upperMs**: \`number\`

Defined in: [src/sidepanel/hooks/activityEta.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L41)

Worst case the scheduler can already see: best case plus the longest armed gate.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/activityEta.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L43)

Display label, e.g. \`1:20–2:50 left\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / EtaUnknown

# Interface: EtaUnknown

Defined in: [src/sidepanel/hooks/activityEta.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L20)

The estimate has no throughput sample yet and declines to guess.

## Properties

### kind

> **kind**: \`"unknown"\`

Defined in: [src/sidepanel/hooks/activityEta.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L21)

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/activityEta.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L23)

Words, never a number, so it cannot read as a fast finish.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / EtaEstimate

# Type Alias: EtaEstimate

> **EtaEstimate** = \`EtaUnknown\` \\| \`EtaPoint\` \\| \`EtaRange\`

Defined in: [src/sidepanel/hooks/activityEta.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L50)

What the bar knows about the time left, in a form that can never render an
unknown as an optimistic number.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityEta / MIN\\_SAMPLES

# Variable: MIN\\_SAMPLES

> \`const\` **MIN\\_SAMPLES**: \`3\` = \`3\`

Defined in: [src/sidepanel/hooks/activityEta.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityEta.ts#L17)

Settled items required before throughput is extrapolated at all. Below this the
sample is one or two round-trips, whose variance swamps the signal.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityStatus / STATUS\\_COLOR

# Variable: STATUS\\_COLOR

> \`const\` **STATUS\\_COLOR**: \`Record\`\\<\`SchedulerStatus\`, \`string\`\\>

Defined in: [src/sidepanel/hooks/activityStatus.ts:15](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityStatus.ts#L15)

The status dot's colour, as a design-token custom-property expression. A CSS variable
rather than a class because the dot is one element whose colour is fully data-driven.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/activityStatus / STATUS\\_LABEL

# Variable: STATUS\\_LABEL

> \`const\` **STATUS\\_LABEL**: \`Record\`\\<\`SchedulerStatus\`, \`string\`\\>

Defined in: [src/sidepanel/hooks/activityStatus.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/activityStatus.ts#L24)

The word the bar shows for each scheduler status.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / fetchGroupRulesRequest

# Function: fetchGroupRulesRequest()

> **fetchGroupRulesRequest**(\`makeApiRequest\`, \`currentGroupId?\`, \`options?\`): \`Promise\`\\<\`FetchGroupRulesResult\`\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:126](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L126)

Fetch every group rule through the scheduler, resolve referenced group names,
detect conflicts, and return display-formatted rules plus aggregate stats.

## Parameters

### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\>

\`useOktaApi().makeApiRequest\`, routing via the background scheduler.

### currentGroupId?

\`string\`

When provided, flags rules that target this group
  (\`affectsCurrentGroup\`); the caller supplies the panel's current group, which
  mirrors the page-URL group the content script used to derive.

### options?

\`resolveGroupNames\` (default \`true\`) controls step 2. Set it to
  \`false\` for callers that only need raw rule ids/expressions (e.g. membership
  analysis, which never reads a resolved name): it skips the snapshot read and
  leaves \`groupNames\`/\`allGroupNamesMap\` falling back to ids. \`origin\` is the
  connected org, required for step 2 to resolve anything at all.

#### resolveGroupNames?

\`boolean\`

#### origin?

\`string\` \\| \`null\`

## Returns

\`Promise\`\\<\`FetchGroupRulesResult\`\\>

\`{ success: true, rules, stats, conflicts }\`; a failed rules page is
  returned verbatim, and a thrown error becomes \`{ success: false, error }\`.

## Remarks

Every page is validated with \`oktaGroupRuleSchema\` through
  \`parseOktaList\`. Validation is lenient: a malformed row is dropped rather
  than failing the load, so \`rules\`, \`rawRules\` and \`stats\` describe only the
  rows Okta returned in a shape this extension understands.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / loadCachedGroupIndex

# Function: loadCachedGroupIndex()

> **loadCachedGroupIndex**(\`origin\`): \`Promise\`\\<\`CachedGroupIndex\`\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L89)

The group snapshot read as both a naming source and an inventory.

loadCachedGroupNames answers "what is this id called?" and needs only
named rows. Deciding an id has *no* group behind it is a negative read, and it
needs what that map cannot supply: every id held, named or not, and whether the
walk that produced them finished.

## Parameters

### origin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org's origin. A missing one yields an empty,
incomplete index rather than another org's rows.

## Returns

\`Promise\`\\<\`CachedGroupIndex\`\\>

See CachedGroupIndex.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / loadCachedGroupNames

# Function: loadCachedGroupNames()

> **loadCachedGroupNames**(\`origin\`): \`Promise\`\\<\`Map\`\\<\`string\`, \`string\`\\>\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L71)

Build an id→name map for the org's groups from the org snapshot.

Reuses names the background already walked instead of issuing a
\`GET /api/v1/groups/{id}\` per referenced group — one local read, no API
traffic. The Rules tab, the blast-radius report and the user comparison all
label group ids from here.

## Parameters

### origin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org's origin, which the snapshot is scoped by.
A missing origin returns an empty map rather than another org's names; callers
then fall back to showing the raw group id.

## Returns

\`Promise\`\\<\`Map\`\\<\`string\`, \`string\`\\>\\>

Group id → display name for every group the snapshot holds.

## Remarks

orgSnapshotStore.getCollection logs and swallows its own
failures, so there is nothing to catch here: an unreadable store yields no
names, the same degrade as an org with none.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / loadOrgRules

# Function: loadOrgRules()

> **loadOrgRules**(\`makeApiRequest\`, \`origin\`, \`options?\`): \`Promise\`\\<\`OrgRulesRead\`\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:291](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L291)

The org's group rules, from the one source the panel reads them through.

Read order: the org snapshot when snapshotRulesCurrent says it can
answer (no request); otherwise one paginated walk. Either way the joined
payload is held under \`cacheKeys.orgRules(origin)\`, so concurrent callers —
the two reads a group open issues — share one flight, and the quadratic
conflict pass runs once per change rather than once per caller.

A held payload is dropped and re-read when it no longer matches the source
that should answer: the snapshot moved on, it became usable after a walk was
held, or a rule write landed after the read started.

## Parameters

### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\>

Scheduler-routed transport for the fallback walk.

### origin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org. Absent, nothing is shared: the walk runs
  uncached, since an origin-less entry could be read back under another org.

### options?

\`force\` skips a held payload and re-reads its source.

#### force?

\`boolean\`

## Returns

\`Promise\`\\<\`OrgRulesRead\`\\>

The org-wide payload, formatted without a current group, with its
  source and when it was obtained.

## Throws

When the walk fails. Never resolves to an empty payload for a read
  that did not happen — "no rules" must not stand in for "could not read the
  rules".


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / noteRuleWrite

# Function: noteRuleWrite()

> **noteRuleWrite**(\`target?\`): \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:363](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L363)

Record that a rule write may have landed in Okta, so no read can be served
from before it.

Every held org-rules payload is dropped (any org — the write's org is not
always known here, and a re-read is cheap), and this session refuses any
snapshot walk that started before now. When the org is known, the
snapshot's \`rules\` collection is also marked incomplete, which outlives a
panel restart, and a sync is requested through the existing \`syncSnapshot\`
path without waiting on it. An incomplete collection is walked in full by the
next sync while every other collection keeps its cheap mode, so the request
costs one rules listing rather than an org-wide walk.

## Parameters

### target?

The org and the tab the write went through, when known.

#### origin

\`string\` \\| \`null\`

#### tabId

\`number\` \\| \`null\`

## Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / resetRuleWriteState

# Function: resetRuleWriteState()

> **resetRuleWriteState**(): \`void\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:412](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L412)

Reset the module's write bookkeeping. Test isolation only.

## Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / resolveRulesOrigin

# Function: resolveRulesOrigin()

> **resolveRulesOrigin**(\`origin\`, \`tabId\`): \`Promise\`\\<\`string\` \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:396](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L396)

The org a rules read or write is about: the caller's origin when it has one,
otherwise the origin of the tab its requests are routed through. Several
\`useOktaApi\` callers pass no origin, and the tab is where every one of their
requests lands, so it names the same org.

## Parameters

### origin

\`string\` \\| \`null\` \\| \`undefined\`

The caller's connected org, when it knows it.

### tabId

\`number\` \\| \`null\`

The tab the caller's requests go through.

## Returns

\`Promise\`\\<\`string\` \\| \`null\`\\>

The org origin, or \`null\` when neither names an Okta org.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / snapshotRulesCurrent

# Function: snapshotRulesCurrent()

> **snapshotRulesCurrent**(\`meta\`): \`boolean\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:240](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L240)

Whether the snapshot's \`rules\` collection can answer for the org right now.

Two gates. The walk must be \`complete\` — a partial walk is a prefix of the
org, and a rule missing from it makes its target groups look untargeted
(D-038). And no rule write this session may postdate the walk's start:
\`lastFullWalkAt\` is stamped with the walk's start, so a walk that began
before a write is not evidence of it.

## Parameters

### meta

\`Pick\`\\<\`SyncMeta\`, \`"complete"\` \\| \`"lastFullWalkAt"\`\\>

The \`rules\` collection's sync meta for the org.

## Returns

\`boolean\`

\`true\` when the stored rows are the org's rules as of now.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / FetchGroupRulesResult

# Interface: FetchGroupRulesResult

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L42)

Result of fetchGroupRulesRequest, mirroring the old content-script response.

## Properties

### success

> **success**: \`boolean\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L43)

***

### rules?

> \`optional\` **rules?**: \`FormattedRule\`[]

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L44)

***

### rawRules?

> \`optional\` **rawRules?**: \`OktaGroupRule\`[]

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L49)

The same rules exactly as Okta returned them, carried in the org-rules
payload so raw-rule consumers never re-paginate data already in memory.

***

### stats?

> \`optional\` **stats?**: \`RuleStats\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L50)

***

### conflicts?

> \`optional\` **conflicts?**: \`RuleConflict\`[]

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L51)

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L52)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/fetchGroupRulesRequest / OrgRulesRead

# Interface: OrgRulesRead

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:204](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L204)

What loadOrgRules answers: the payload plus where and when it came from.

## Extends

- \`OrgRulesPayload\`

## Properties

### rules

> **rules**: \`FormattedRule\`[]

Defined in: [src/shared/rules/snapshotRules.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L40)

Rules shaped for display.

#### Inherited from

\`OrgRulesPayload\`.\`rules\`

***

### rawRules

> **rawRules**: \`OktaGroupRule\`[]

Defined in: [src/shared/rules/snapshotRules.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L42)

The same rules exactly as Okta returned them.

#### Inherited from

\`OrgRulesPayload\`.\`rawRules\`

***

### stats

> **stats**: \`RuleStats\`

Defined in: [src/shared/rules/snapshotRules.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L44)

Aggregate counts across OrgRulesPayload.rawRules.

#### Inherited from

\`OrgRulesPayload\`.\`stats\`

***

### conflicts

> **conflicts**: \`RuleConflict\`[]

Defined in: [src/shared/rules/snapshotRules.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/shared/rules/snapshotRules.ts#L46)

Attribute/target conflicts between active rules.

#### Inherited from

\`OrgRulesPayload\`.\`conflicts\`

***

### source

> **source**: \`"snapshot"\` \\| \`"walk"\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:206](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L206)

\`snapshot\` when the org snapshot answered; \`walk\` for the panel's own listing.

***

### obtainedAt

> **obtainedAt**: \`number\`

Defined in: [src/sidepanel/hooks/fetchGroupRulesRequest.ts:211](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/fetchGroupRulesRequest.ts#L211)

Epoch millis the rules were obtained from Okta: the start of the snapshot's
last full walk, or when the panel's walk finished.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/getUserGroupsRequest / getUserGroupsRequest

# Function: getUserGroupsRequest()

> **getUserGroupsRequest**(\`makeApiRequest\`, \`userId\`, \`options?\`): \`Promise\`\\<\`GetUserGroupsResult\`\\>

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L58)

Fetch every group a user belongs to through the scheduler, following \`Link\`
pagination 200 at a time.

## Parameters

### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\>

### userId

\`string\`

### options?

\`GetUserGroupsOptions\` = \`{}\`

## Returns

\`Promise\`\\<\`GetUserGroupsResult\`\\>

\`{ success: true, data, count }\` on success; a failed page's error
  response verbatim; a thrown error as \`{ success: false, error }\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/getUserGroupsRequest / GetUserGroupsOptions

# Interface: GetUserGroupsOptions

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L41)

Options for getUserGroupsRequest.

## Properties

### planId?

> \`optional\` **planId?**: \`string\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L43)

Attributes every page's request to a declared plan.

***

### onPage?

> \`optional\` **onPage?**: (\`pagesFetched\`, \`hasMore\`) => \`void\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L48)

Called after each page lands with how many have been fetched and whether
Okta says more follow — the hook a plan uses to refine its walk estimate.

#### Parameters

##### pagesFetched

\`number\`

##### hasMore

\`boolean\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/getUserGroupsRequest / GetUserGroupsResult

# Interface: GetUserGroupsResult

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L33)

Result of getUserGroupsRequest.

## Properties

### success

> **success**: \`boolean\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L34)

***

### data?

> \`optional\` **data?**: \`UserGroupMembership\`[]

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L35)

***

### count?

> \`optional\` **count?**: \`number\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L36)

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L37)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/getUserGroupsRequest / UserGroupMembership

# Interface: UserGroupMembership

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L24)

One membership record.

## Properties

### group

> **group**: \`OktaGroup\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L25)

***

### membershipType

> **membershipType**: \`"UNKNOWN"\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L27)

Source is unknown from this endpoint; callers re-derive it (see \`analyzeMemberships\`).

***

### addedDate

> **addedDate**: \`undefined\`

Defined in: [src/sidepanel/hooks/getUserGroupsRequest.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/getUserGroupsRequest.ts#L29)

Okta does not expose membership timestamps (OKTA_API_LIMITATIONS.md §1).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleInventory / obtainRuleInventory

# Function: obtainRuleInventory()

> **obtainRuleInventory**(\`makeApiRequest\`, \`origin\`): \`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/ruleInventory.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleInventory.ts#L24)

Obtain the org rule inventory.

\`null\` only when the read genuinely failed — never an empty list standing in
for rules that could not be read.

## Parameters

### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\>

The scheduler-routed request function.

### origin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org origin.

## Returns

\`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / executeRuleMerge

# Function: executeRuleMerge()

> **executeRuleMerge**(\`api\`, \`request\`, \`confirmed\`, \`onStep?\`): \`Promise\`\\<\`RuleMergeResult\`\\>

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:279](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L279)

Re-read, check, write and record one merge.

## Parameters

### api

\`RuleMergeApi\`

The Okta client slice (see RuleMergeApi).

### request

\`RuleMergeRequest\`

What the reader asked to merge.

### confirmed

\`RuleMergePlan\`

The plan the confirm showed; the run refuses if Okta no longer matches it.

### onStep?

(\`step\`, \`status\`) => \`void\`

Called as each step starts (\`active\`) and settles.

## Returns

\`Promise\`\\<\`RuleMergeResult\`\\>

A RuleMergeResult. Never throws for an Okta outcome.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / mergeSteps

# Function: mergeSteps()

> **mergeSteps**(\`plan\`): \`MergeStep\`[]

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:169](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L169)

The plan's writes, in run order.

## Parameters

### plan

\`RuleMergePlan\`

## Returns

\`MergeStep\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / readMergeSet

# Function: readMergeSet()

> **readMergeSet**(\`api\`, \`ruleIds\`): \`Promise\`\\<\\{ \`raws\`: \`OktaGroupRule\`[]; \\} \\| \\{ \`unread\`: \`number\`; \\}\\>

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:197](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L197)

Read every rule in the set through the tracked runner.

## Parameters

### api

\`Pick\`\\<\`RuleMergeApi\`, \`"getRawGroupRule"\` \\| \`"runOperation"\`\\>

### ruleIds

readonly \`string\`[]

## Returns

\`Promise\`\\<\\{ \`raws\`: \`OktaGroupRule\`[]; \\} \\| \\{ \`unread\`: \`number\`; \\}\\>

The rules in request order, or how many could not be read.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / stepKey

# Function: stepKey()

> **stepKey**(\`step\`): \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:164](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L164)

A stable key per step, for the step list.

## Parameters

### step

\`MergeStep\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / stepLabel

# Function: stepLabel()

> **stepLabel**(\`step\`, \`plan\`): \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:151](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L151)

The step label, for the running stage. Identifiers and counts only.

## Parameters

### step

\`MergeStep\`

### plan

\`RuleMergePlan\`

## Returns

\`string\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / MergeStepReport

# Interface: MergeStepReport

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L85)

One step's outcome.

## Properties

### step

> **step**: \`MergeStep\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L86)

***

### status

> **status**: \`MergeStepStatus\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L87)

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L89)

Okta's reason, for \`rejected\`; the unconfirmed-write sentence, for \`unknown\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / RetireReport

# Interface: RetireReport

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L103)

One retired rule's outcome.

## Properties

### rule

> **rule**: \`RetireTarget\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L104)

***

### outcome

> **outcome**: \`RetireOutcome\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L105)

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:106](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L106)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / RuleMergeRequest

# Interface: RuleMergeRequest

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L65)

What the reader asked to merge.

## Extended by

- \`MergeSetRequest\`

## Properties

### ruleIds

> **ruleIds**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L67)

Every rule in the set, the kept one included.

***

### keptRuleId

> **keptRuleId**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L69)

The rule to keep.

***

### nextName?

> \`optional\` **nextName?**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L71)

The kept rule's new name, or omitted to leave it.

***

### takenNames?

> \`optional\` **takenNames?**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L73)

Names of every other loaded rule, for the \`name-taken\` check.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / KeptOutcome

# Type Alias: KeptOutcome

> **KeptOutcome** = \`"saved"\` \\| \`"untouched"\` \\| \`"rejected"\` \\| \`"unknown"\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L117)

What happened to the kept rule's groups.

- \`saved\`     — Okta confirmed the save.
- \`untouched\` — the plan had no edit: the kept rule already held every group.
- \`rejected\`  — the save, or the pause before it, was refused; nothing changed.
- \`unknown\`   — the save, or the pause before it, was not confirmed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / KeptStatusOutcome

# Type Alias: KeptStatusOutcome

> **KeptStatusOutcome** = \`"as-before"\` \\| \`"paused"\` \\| \`"unknown"\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L124)

Whether the kept rule ends as active or inactive as it was found.
\`paused\` — paused and the resume was refused or never sent; \`unknown\` — the
pause or the resume was not confirmed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / MergeStep

# Type Alias: MergeStep

> **MergeStep** = \\{ \`kind\`: \`"kept"\`; \`step\`: \`TargetEditStep\`; \\} \\| \\{ \`kind\`: \`"retire"\`; \`ruleId\`: \`string\`; \`step\`: \`"deactivate"\` \\| \`"delete"\`; \\}

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L77)

One write of a merge, in run order.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / MergeStepStatus

# Type Alias: MergeStepStatus

> **MergeStepStatus** = \`"done"\` \\| \`"rejected"\` \\| \`"unknown"\` \\| \`"not-run"\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L82)

How one step ended; \`not-run\` means it was never sent.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / RetireOutcome

# Type Alias: RetireOutcome

> **RetireOutcome** = \`"retired"\` \\| \`"refused"\` \\| \`"unknown"\` \\| \`"not-run"\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L100)

What happened to one rule the merge set out to retire.

- \`retired\`  — Okta confirmed the delete.
- \`refused\`  — Okta rejected the deactivate or the delete; the rule is still there.
- \`unknown\`  — a deactivate or delete was not confirmed; it may have applied.
- \`not-run\`  — the kept rule's save did not land, so no retire was attempted.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / RuleMergeApi

# Type Alias: RuleMergeApi

> **RuleMergeApi** = \`Pick\`\\<\`ReturnType\`\\<*typeof* \`useOktaApi\`\\>, \`"getRawGroupRule"\` \\| \`"updateGroupRule"\` \\| \`"activateGroupRule"\` \\| \`"deactivateGroupRule"\` \\| \`"deleteGroupRule"\` \\| \`"runOperation"\` \\| \`"getCurrentUser"\`\\>

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L53)

The slice of the Okta client a merge needs.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/ruleMergeRun / RuleMergeResult

# Type Alias: RuleMergeResult

> **RuleMergeResult** = \\{ \`kind\`: \`"unreadable"\`; \`unread\`: \`number\`; \`total\`: \`number\`; \\} \\| \\{ \`kind\`: \`"changed-since"\`; \\} \\| \\{ \`kind\`: \`"refused"\`; \`refusal\`: \`MergeRefusal\`; \\} \\| \\{ \`kind\`: \`"ran"\`; \`plan\`: \`RuleMergePlan\`; \`steps\`: \`MergeStepReport\`[]; \`kept\`: \`KeptOutcome\`; \`keptError?\`: \`string\`; \`keptStatus\`: \`KeptStatusOutcome\`; \`retired\`: \`RetireReport\`[]; \`before\`: \`RuleTargetsState\`; \`after\`: \`RuleTargetsState\`; \`entry\`: \`UndoAction\` \\| \`null\`; \`actor\`: \`Actor\`; \\}

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:127](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L127)

The result of executeRuleMerge.

## Union Members

### Type Literal

\\{ \`kind\`: \`"unreadable"\`; \`unread\`: \`number\`; \`total\`: \`number\`; \\}

Some rules could not be re-read, so nothing was written.

***

### Type Literal

\\{ \`kind\`: \`"changed-since"\`; \\}

Okta's rules no longer match the confirmed plan; nothing was written.

***

### Type Literal

\\{ \`kind\`: \`"refused"\`; \`refusal\`: \`MergeRefusal\`; \\}

The fresh read makes the merge impossible; nothing was written.

***

### Type Literal

\\{ \`kind\`: \`"ran"\`; \`plan\`: \`RuleMergePlan\`; \`steps\`: \`MergeStepReport\`[]; \`kept\`: \`KeptOutcome\`; \`keptError?\`: \`string\`; \`keptStatus\`: \`KeptStatusOutcome\`; \`retired\`: \`RetireReport\`[]; \`before\`: \`RuleTargetsState\`; \`after\`: \`RuleTargetsState\`; \`entry\`: \`UndoAction\` \\| \`null\`; \`actor\`: \`Actor\`; \\}

The writes ran.

#### kind

> **kind**: \`"ran"\`

#### plan

> **plan**: \`RuleMergePlan\`

#### steps

> **steps**: \`MergeStepReport\`[]

#### kept

> **kept**: \`KeptOutcome\`

#### keptError?

> \`optional\` **keptError?**: \`string\`

#### keptStatus

> **keptStatus**: \`KeptStatusOutcome\`

#### retired

> **retired**: \`RetireReport\`[]

#### before

> **before**: \`RuleTargetsState\`

#### after

> **after**: \`RuleTargetsState\`

#### entry

> **entry**: \`UndoAction\` \\| \`null\`

The history entry, or \`null\` when nothing was written.

#### actor

> **actor**: \`Actor\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/searchUsersRequest / searchUsersRequest

# Function: searchUsersRequest()

> **searchUsersRequest**(\`makeApiRequest\`, \`rawQuery\`): \`Promise\`\\<\`SearchUsersResult\`\\>

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L95)

Search Okta users through the scheduler, preferring up to three strategies in order: a
flexible \`q=\` match, then a \`search=\` SCIM expression over the name, login and email
fields, then — only when the query looks like an email and nothing matched — an exact
\`profile.email\` filter. The first strategy with results wins. The first two are
requested concurrently, so a \`q=\` miss costs one round-trip window, not two.

## Parameters

### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\>

### rawQuery

\`string\`

## Returns

\`Promise\`\\<\`SearchUsersResult\`\\>

\`{ success: true, data, count }\`, or \`{ success: false, error }\` if a request
  throws.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/searchUsersRequest / SearchUsersResult

# Interface: SearchUsersResult

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L27)

Result of searchUsersRequest, mirroring the old content-script response.

## Properties

### success

> **success**: \`boolean\`

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L28)

***

### data?

> \`optional\` **data?**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L29)

***

### truncated

> **truncated**: \`boolean\`

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L38)

Whether Okta has more matches than \`data\` holds — read from the winning
response's \`Link\` header, never inferred from \`data.length\`. A page of exactly
PAGE\\_SIZE rows is the shape of both "twenty matches" and "the first
twenty of five hundred"; only the header tells them apart.

\`false\` on a failed search: there is no result to be a truncation of.

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/searchUsersRequest.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/searchUsersRequest.ts#L39)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActivityBar / useActivityBar

# Function: useActivityBar()

> **useActivityBar**(): \`UseActivityBar\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L129)

Merge scheduler + progress state into the ActivityView and expose the
unified cancel.

## Returns

\`UseActivityBar\`

The merged ActivityView and a \`cancel\` that both trips the
operation cancellation token and clears the background queue.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActivityBar / ActivityView

# Interface: ActivityView

Defined in: [src/sidepanel/hooks/useActivityBar.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L21)

Display-ready, already-merged activity state consumed by \`ActivityBarView\`.

## Properties

### statusLabel

> **statusLabel**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L23)

Human label for the current status (operation-aware).

***

### statusColorVar

> **statusColorVar**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L25)

CSS custom-property expression for the status dot colour (a design token).

***

### busy

> **busy**: \`boolean\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L27)

Whether to animate the status dot (anything other than fully idle).

***

### operationActive

> **operationActive**: \`boolean\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L29)

Whether a named operation is currently running.

***

### operationName?

> \`optional\` **operationName?**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L31)

Name of the running operation, if any.

***

### message?

> \`optional\` **message?**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L33)

Current step message, if any.

***

### current

> **current**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L35)

Items processed so far in the current operation.

***

### total

> **total**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L37)

Total items in the current operation.

***

### percentage

> **percentage**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L39)

Progress percentage (0–100).

***

### elapsedLabel?

> \`optional\` **elapsedLabel?**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L41)

Elapsed wall-clock label, e.g. \`0:12\`.

***

### eta

> **eta**: \`EtaEstimate\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L47)

Time remaining as a range, or \`null\` when no operation is running. Never a
bare point estimate — a point ignores armed scheduler gates. See
estimateEta.

***

### apiCalls?

> \`optional\` **apiCalls?**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L49)

API calls made during the current operation.

***

### opCompleted

> **opCompleted**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L51)

Items settled successfully in the current batch operation.

***

### opActive

> **opActive**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L53)

Items currently in flight in the current batch operation.

***

### opFailed

> **opFailed**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L55)

Items settled with an error in the current batch operation.

***

### queueLength

> **queueLength**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L57)

Queued (not yet dispatched) requests.

***

### activeRequests

> **activeRequests**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L59)

In-flight requests.

***

### rateLimit

> **rateLimit**: \\{ \`remaining\`: \`number\`; \`limit\`: \`number\`; \`low\`: \`boolean\`; \\} \\| \`null\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L61)

Rate-limit headroom, or \`null\` when unknown. \`low\` marks ≤20% remaining.

***

### cooldownLabel?

> \`optional\` **cooldownLabel?**: \`string\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L63)

Cooldown countdown label, e.g. \`12s\`, when the scheduler is cooling down.

***

### processed

> **processed**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L65)

Total requests processed (success + failed) by the scheduler.

***

### failed

> **failed**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L67)

Failed requests.

***

### isCancelling

> **isCancelling**: \`boolean\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L69)

True while a cancel is unwinding.

***

### canCancel

> **canCancel**: \`boolean\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L71)

Whether there is anything to cancel (active operation or non-empty queue).

***

### buckets

> **buckets**: \`BucketState\`[]

Defined in: [src/sidepanel/hooks/useActivityBar.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L76)

Every rate-limit bucket the scheduler is tracking, most-pressured first.
Empty until Okta has answered at least once.

***

### lowThresholdPercent

> **lowThresholdPercent**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L78)

The org-learned percentage at which the scheduler starts backing off.

***

### operations

> **operations**: \`PlanSummary\`[]

Defined in: [src/sidepanel/hooks/useActivityBar.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L85)

Every operation that has declared a request budget and not yet finished,
oldest first. The scheduler's own ledger, not the panel's progress state, so
concurrent operations show as several rows where the progress bar describes
only one.

***

### now

> **now**: \`number\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L90)

Shared clock tick in epoch milliseconds, so every countdown in the bar moves
together instead of each row owning a timer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActivityBar / UseActivityBar

# Interface: UseActivityBar

Defined in: [src/sidepanel/hooks/useActivityBar.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L94)

Value returned by useActivityBar.

## Properties

### view

> **view**: \`ActivityView\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L96)

Merged, display-ready state for the bar.

***

### cancel

> **cancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L98)

Stop the current operation and drain the scheduler queue.

#### Returns

\`void\`

***

### cancelOperation

> **cancelOperation**: (\`planId\`) => \`void\`

Defined in: [src/sidepanel/hooks/useActivityBar.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActivityBar.ts#L103)

Stop one declared operation, leaving the rest of the queue alone. Requests it
already dispatched are left to settle — they have spent their budget.

#### Parameters

##### planId

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActorNotice / useActorNotice

# Function: useActorNotice()

> **useActorNotice**(): \`UseActorNoticeReturn\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L61)

Track whether the current operation's actor could be resolved, exposing the
admin-facing notice for the unresolved case.

## Returns

\`UseActorNoticeReturn\`

## Example

\`\`\`ts
const { actorNotice, noteActor, dismissActorNotice } = useActorNotice();
const actor = await getCurrentUser();
noteActor(actor); // never awaited on, never blocks the write below
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActorNotice / UseActorNoticeReturn

# Interface: UseActorNoticeReturn

Defined in: [src/sidepanel/hooks/useActorNotice.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L37)

Return shape of useActorNotice.

## Properties

### actorNotice

> **actorNotice**: \`AlertMessageData\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L39)

The notice to render, or \`null\` when the actor is known (or nothing has run yet).

***

### noteActor

> **noteActor**: (\`actor\`) => \`void\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L45)

Record what the actor lookup answered for the operation about to run.
An \`unavailable\` actor raises the notice; a \`resolved\` one clears any
notice left over from an earlier run.

#### Parameters

##### actor

\`Actor\`

#### Returns

\`void\`

***

### dismissActorNotice

> **dismissActorNotice**: () => \`void\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L47)

Dismiss the notice (wired to \`AlertMessage\`'s × button).

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActorNotice / ACTOR\\_UNAVAILABLE\\_NOTICE

# Variable: ACTOR\\_UNAVAILABLE\\_NOTICE

> \`const\` **ACTOR\\_UNAVAILABLE\\_NOTICE**: \`AlertMessageData\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L31)

The actor-unavailable notice as AlertMessageData. \`warning\`, not \`danger\`: the
operation still went through.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useActorNotice / ACTOR\\_UNAVAILABLE\\_TEXT

# Variable: ACTOR\\_UNAVAILABLE\\_TEXT

> \`const\` **ACTOR\\_UNAVAILABLE\\_TEXT**: \`"Couldn't confirm your signed-in identity. This action will be recorded without an actor."\` = \`"Couldn't confirm your signed-in identity. This action will be recorded without an actor."\`

Defined in: [src/sidepanel/hooks/useActorNotice.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useActorNotice.ts#L24)

The exact copy shown when the acting admin could not be resolved. Shared by
every audited flow so all three say the same thing (\`D-013c\`).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAddGroupMember / useAddGroupMember

# Function: useAddGroupMember()

> **useAddGroupMember**(\`options\`): \`UseAddGroupMemberReturn\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L84)

Hook backing the Group Detail view's Add-member modal.

## Parameters

### options

\`UseAddGroupMemberOptions\`

See UseAddGroupMemberOptions.

## Returns

\`UseAddGroupMemberReturn\`

The modal's open state, the debounced user type-ahead state and
  selection controls, \`isAddingMember\`, and \`openModal\` / \`closeModal\` /
  \`confirmAddMember\` / \`addMemberDirect\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAddGroupMember / UseAddGroupMemberOptions

# Interface: UseAddGroupMemberOptions

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L26)

Options for useAddGroupMember.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L28)

Tab whose scheduler runs the user search + membership add.

***

### group

> **group**: \`GroupSummary\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L30)

The fixed group members are added to.

***

### members

> **members**: \`OktaUser\`[] \\| \`null\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L36)

The group's current roster, used to exclude existing members from search
results. \`null\` before the roster has loaded — search still runs, just
without an exclusion set yet.

***

### onResult

> **onResult**: (\`result\`) => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L38)

Reports an add failure as a \`danger\` result message.

#### Parameters

##### result

###### text

\`string\`

###### type

\`"danger"\`

#### Returns

\`void\`

***

### onAdded

> **onAdded**: (\`user\`) => \`void\` \\| \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L40)

Called with the added user after a successful add, so the caller can fold them into its roster.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\` \\| \`Promise\`\\<\`void\`\\>

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L46)

Whether the owning view is the visible one. The debounced search is
suspended rather than re-running a standing query while hidden. Defaults
to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAddGroupMember / UseAddGroupMemberReturn

# Interface: UseAddGroupMemberReturn

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L50)

Return shape of useAddGroupMember.

## Properties

### isOpen

> **isOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L51)

***

### addQuery

> **addQuery**: \`string\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L52)

***

### setAddQuery

> **setAddQuery**: (\`query\`) => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L53)

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

***

### addResults

> **addResults**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L55)

Debounced search results with the group's current members already excluded.

***

### isSearchingToAdd

> **isSearchingToAdd**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L56)

***

### addSearchError

> **addSearchError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L57)

***

### selectedUser

> **selectedUser**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L59)

The chosen user, or \`null\` when none is selected yet.

***

### selectUser

> **selectUser**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L61)

Choose a user from the dropdown: selects it, clears the query.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### clearSelectedUser

> **clearSelectedUser**: () => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L63)

Clear the chosen user and query (the selected-user "Clear" button).

#### Returns

\`void\`

***

### isAddingMember

> **isAddingMember**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L64)

***

### openModal

> **openModal**: () => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L65)

#### Returns

\`void\`

***

### closeModal

> **closeModal**: () => \`void\`

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L66)

#### Returns

\`void\`

***

### confirmAddMember

> **confirmAddMember**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L68)

Add the currently selected user; no-ops with no selection.

#### Returns

\`Promise\`\\<\`void\`\\>

***

### addMemberDirect

> **addMemberDirect**: (\`user\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useAddGroupMember.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddGroupMember.ts#L73)

Runs the same add mutation as \`confirmAddMember\` for an explicit user, with
no modal or selection state involved — see the module doc.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAddToGroup / useAddToGroup

# Function: useAddToGroup()

> **useAddToGroup**(\`__namedParameters\`): \`UseAddToGroupReturn\`

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L63)

Hook backing the Users tab's Add-to-Group modal.

## Parameters

### \\_\\_namedParameters

\`UseAddToGroupOptions\`

## Returns

\`UseAddToGroupReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAddToGroup / GroupSearchResult

# Interface: GroupSearchResult

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L18)

Shape returned by \`searchGroups\` in \`groupDiscovery.ts\` for the Add-to-Group flow.

## Properties

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L19)

***

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L20)

***

### description

> **description**: \`string\`

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L21)

***

### type

> **type**: \`string\`

Defined in: [src/sidepanel/hooks/useAddToGroup.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAddToGroup.ts#L22)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useApiExplorer / useApiExplorer

# Function: useApiExplorer()

> **useApiExplorer**(\`__namedParameters\`): \`UseApiExplorerResult\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L59)

Drives the API Explorer's request/response cycle. GET-only: the path is sent
exactly as typed, through the same same-origin-path + method-allow-list guards
every other Okta call already goes through.

## Parameters

### \\_\\_namedParameters

\`UseApiExplorerOptions\`

## Returns

\`UseApiExplorerResult\`

## Example

\`\`\`tsx
const explorer = useApiExplorer({ targetTabId, oktaOrigin });
<Input value={explorer.path} onChange={explorer.setPath} />
<Button onClick={explorer.send} loading={explorer.isLoading}>Send</Button>
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useApiExplorer / ApiExplorerResult

# Interface: ApiExplorerResult

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L17)

One fetched response, derived into the three views \`JsonViewer\` switches between.

## Properties

### raw

> **raw**: \`unknown\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L18)

***

### redacted

> **redacted**: \`unknown\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L19)

***

### redactedCount

> **redactedCount**: \`number\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L20)

***

### shape

> **shape**: \`string\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L21)

***

### status?

> \`optional\` **status?**: \`number\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L22)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useApiExplorer / UseApiExplorerOptions

# Interface: UseApiExplorerOptions

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L26)

Options for useApiExplorer.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L28)

Content-script tab connected to Okta, or \`null\` when disconnected.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L30)

Live org origin, used to redact it out of embedded response URLs.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useApiExplorer / UseApiExplorerResult

# Interface: UseApiExplorerResult

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L34)

Return shape of useApiExplorer.

## Properties

### path

> **path**: \`string\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L35)

***

### setPath

> **setPath**: (\`path\`) => \`void\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L36)

#### Parameters

##### path

\`string\`

#### Returns

\`void\`

***

### send

> **send**: () => \`void\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L38)

Fire the GET request for the current \`path\`. No-ops when disconnected or empty.

#### Returns

\`void\`

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L39)

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L40)

***

### clearError

> **clearError**: () => \`void\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L42)

Dismiss the current error banner without sending a new request.

#### Returns

\`void\`

***

### result

> **result**: \`ApiExplorerResult\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useApiExplorer.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useApiExplorer.ts#L44)

The most recent response's three derived views, or \`null\` before the first send.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAppsData / useAppsData

# Function: useAppsData()

> **useAppsData**(\`__namedParameters\`): \`UseAppsDataReturn\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L68)

Manage the Applications tab's data: the inventory, the loading flag, the last-fetch
timestamp, and the \`loadApps\` pipeline.

## Parameters

### \\_\\_namedParameters

\`UseAppsDataOptions\`

## Returns

\`UseAppsDataReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAppsData / UseAppsDataOptions

# Interface: UseAppsDataOptions

Defined in: [src/sidepanel/hooks/useAppsData.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L25)

Options for useAppsData.

## Properties

### onError

> **onError**: (\`message\`) => \`void\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L30)

Surface a fatal load failure (\`''\` clears it). MUST be stable
(\`useCallback\`) — it is a dependency of the memoized \`loadApps\`.

#### Parameters

##### message

\`string\`

#### Returns

\`void\`

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L32)

Connected Okta tab id; the auto-load is skipped while it is null.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L37)

Connected org origin — what the snapshot is scoped by. Two Chrome tabs on
the same org read one inventory; a different org gets its own.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L44)

Whether the Applications tab is the visible one. The tab stays mounted while
hidden and the auto-load re-arms on every new \`targetTabId\`, so this gate keeps a
tab nobody is looking at from re-paging the inventory. Deferred, not dropped.
Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAppsData / UseAppsDataReturn

# Interface: UseAppsDataReturn

Defined in: [src/sidepanel/hooks/useAppsData.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L48)

Return shape of useAppsData.

## Properties

### apps

> **apps**: \`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`label\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`status\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`signOnMode\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`created\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>\\>; \`lastUpdated\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`_embedded\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`features\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodArray\`\\<\`ZodString\`, \`"many"\`\\>\\>\\>; \`orn\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]

Defined in: [src/sidepanel/hooks/useAppsData.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L50)

Every app in the org, as far as the snapshot has them.

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L52)

Whether a load is in flight.

***

### lastFetchTime

> **lastFetchTime**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L54)

ISO timestamp of the last completed full walk, or \`null\`.

***

### complete

> **complete**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAppsData.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L59)

Whether the last walk finished. \`false\` means the list is a genuine prefix of the
org, not the whole of it.

***

### loadApps

> **loadApps**: (\`force?\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useAppsData.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAppsData.ts#L61)

Load the inventory; \`force\` walks in full (the header's Refresh).

#### Parameters

##### force?

\`boolean\`

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskAttributes / useAskAttributes

# Function: useAskAttributes()

> **useAskAttributes**(\`api\`, \`oktaOrigin\`, \`enabled\`): \`AskAttributes\`

Defined in: [src/sidepanel/hooks/useAskAttributes.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskAttributes.ts#L34)

Read the org's attributes while \`enabled\`.

## Parameters

### api

\`AskApi\`

Ask's scheduler-routed client slice.

### oktaOrigin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org; a different org is a different list.

### enabled

\`boolean\`

Whether a predicate slot is open on an active Home with a tab.

## Returns

\`AskAttributes\`

The list, and a way to read it again.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskAttributes / AskAttributes

# Interface: AskAttributes

Defined in: [src/sidepanel/hooks/useAskAttributes.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskAttributes.ts#L19)

What useAskAttributes returns.

## Properties

### list

> **list**: \`AttributeList\`

Defined in: [src/sidepanel/hooks/useAskAttributes.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskAttributes.ts#L21)

The list, as the picker can know it.

***

### retry

> **retry**: () => \`void\`

Defined in: [src/sidepanel/hooks/useAskAttributes.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskAttributes.ts#L23)

Read the schema again — the way out of a failed read.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskScope / useAskScope

# Function: useAskScope()

> **useAskScope**(\`options\`): \`ScopedChoices\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L64)

Resolve the open slot's scope into choices.

## Parameters

### options

\`UseAskScopeOptions\`

See UseAskScopeOptions.

## Returns

\`ScopedChoices\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskScope / HeldValue

# Interface: HeldValue

Defined in: [src/sidepanel/hooks/useAskScope.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L30)

One attribute a user holds a searchable value for.

## Properties

### key

> **key**: \`string\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L32)

The attribute's key.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L34)

The schema's label for it.

***

### value

> **value**: \`string\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L36)

The user's value, exactly as their profile holds it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskScope / UseAskScopeOptions

# Interface: UseAskScopeOptions

Defined in: [src/sidepanel/hooks/useAskScope.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L46)

Options for useAskScope.

## Properties

### api

> **api**: \`AskApi\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L48)

Ask's scheduler-routed client slice.

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L50)

The connected org.

***

### scope

> **scope**: \`PickerScope\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L52)

The scope in force for the open slot, or \`null\`.

***

### attributes

> **attributes**: \`AttributeList\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L54)

The org's searchable attributes, which a held value must be one of.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useAskScope.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L56)

Whether the scoped slot is open on an active Home with a tab.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskScope / ScopedChoices

# Type Alias: ScopedChoices

> **ScopedChoices** = \\{ \`kind\`: \`"none"\`; \\} \\| \\{ \`kind\`: \`"granting-groups"\`; \`app\`: \`EntityRef\`; \`groups\`: \`ScopedList\`\\<\`EntityRef\`\\>; \`retry\`: () => \`void\`; \\} \\| \\{ \`kind\`: \`"held-values"\`; \`user\`: \`EntityRef\`; \`values\`: \`ScopedList\`\\<\`HeldValue\`\\>; \`retry\`: () => \`void\`; \\}

Defined in: [src/sidepanel/hooks/useAskScope.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L40)

What a scoped picker offers.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useAskScope / ScopedList

# Type Alias: ScopedList\\<T\\>

> **ScopedList**\\<\`T\`\\> = \\{ \`status\`: \`"loading"\`; \\} \\| \\{ \`status\`: \`"failed"\`; \\} \\| \\{ \`status\`: \`"ready"\`; \`items\`: \`T\`[]; \\}

Defined in: [src/sidepanel/hooks/useAskScope.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useAskScope.ts#L26)

A list being read: not yet, could not be, or here.

## Type Parameters

### T

\`T\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useBlastRadius / useBlastRadius

# Function: useBlastRadius()

> **useBlastRadius**(\`__namedParameters\`): \`UseBlastRadiusReturn\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:175](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L175)

Hold a blast-radius report for one user's proposed profile edit.

## Parameters

### \\_\\_namedParameters

\`UseBlastRadiusOptions\`

## Returns

\`UseBlastRadiusReturn\`

## Example

\`\`\`tsx
const { report, analyze, reset, isAnalyzing } = useBlastRadius({
  user,
  memberships,
  rules: ruleInventory,
});

// The draft moved, so the last answer is no longer about it.
useEffect(() => reset(), [draft, reset]);

<Button onClick={() => analyze(draft)} loading={isAnalyzing}>Check impact</Button>
<BlastRadiusReportView report={report} />
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useBlastRadius / UseBlastRadiusOptions

# Interface: UseBlastRadiusOptions

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L80)

What useBlastRadius needs to answer a question about an edit.

## Properties

### user

> **user**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L85)

The user as Okta currently holds them, before the edit. \`null\` makes
\`analyze\` a no-op that leaves the report at \`not-computed\`.

***

### memberships

> **memberships**: readonly \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L97)

The user's **COMPLETE** membership list. It becomes the context every
\`isMemberOf*\` clause is answered from, and that answer is two-valued over
the list given — a partial list turns every omitted group into a confident
\`false\`.

\`undefined\` when the list has not been read — before the first load, or
after one that failed. It yields a \`not-computed\` report, exactly as
\`rules: 'unresolved'\` does below: an unread list is not an empty one, and
the difference between them is every \`isMemberOf*\` answer in the report.

***

### rules

> **rules**: \`RuleInventoryState\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L103)

The org's rule inventory, three-state. \`unresolved\` yields a \`not-computed\`
report (nothing may be concluded *and* nothing may be reported);
\`unavailable\` yields an \`unavailable\` one, which is itself a finding.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L108)

The connected org's origin, which the snapshot's group names are scoped by.
Absent, every group label falls back to its id.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useBlastRadius / UseBlastRadiusReturn

# Interface: UseBlastRadiusReturn

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:112](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L112)

The report, and the two controls that decide when it exists.

## Properties

### report

> **report**: \`BlastRadiusReport\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L117)

The current report. \`status: 'not-computed'\` until \`analyze()\` has produced
one, and again after every \`reset()\`.

***

### analyze

> **analyze**: (\`draft\`) => \`void\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L124)

Run the engine against a proposed patch (attribute name → raw value, merged
over \`user.profile\`; a key present with \`undefined\` means "clear it").
Fire-and-forget; a later call supersedes any run still in flight. The draft
is PII — never log it.

#### Parameters

##### draft

\`Readonly\`\\<\`Record\`\\<\`string\`, \`unknown\`\\>\\>

#### Returns

\`void\`

***

### reset

> **reset**: () => \`void\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L129)

Retract the report back to \`not-computed\`. Call it whenever the draft
changes — a stale report is indistinguishable from a fresh one on screen.

#### Returns

\`void\`

***

### isAnalyzing

> **isAnalyzing**: \`boolean\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:131](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L131)

Whether a run is in flight — true only across the group-name cache read.

***

### resolveGroupName

> **resolveGroupName**: (\`groupId\`) => \`string\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L137)

Names a group id from the snapshot this report was computed with, so a rule
row can print \`isMemberOfGroup("00g…")\` as the group. \`undefined\` for an id
the snapshot does not hold, and for every id before a report exists.

#### Parameters

##### groupId

\`string\`

#### Returns

\`string\` \\| \`undefined\`

***

### drafted

> **drafted**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L142)

The post-draft user this report is about, or \`null\` before one is computed.
Retracted with the report and scoped to the same subject check.

***

### groupContext

> **groupContext**: \`RuleGroupContext\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useBlastRadius.ts:154](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useBlastRadius.ts#L154)

The complete group list the report's \`isMemberOf*\` answers came from, or
\`undefined\` when no report about the current subject exists.

**Not \`[]\`.** Membership is answered two-valued over the list it is given, so
an empty list is the claim *this user is in no groups* — the opposite of "we
have not looked", not a weaker version of it. The two have to be different
values or the difference cannot be enforced, only remembered
(\`docs/claims.md\`). Pass it straight through: every consumer down to
\`ClauseLedger\` already treats an absent context as "not evaluated".


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCachedMemberSource / useCachedMemberSource

# Function: useCachedMemberSource()

> **useCachedMemberSource**(\`groupId\`): \`MemberSourceBreakdown\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCachedMemberSource.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCachedMemberSource.ts#L23)

Subscribe to the session-cached member-source breakdown for one group.

## Parameters

### groupId

\`string\`

The Okta group id to watch.

## Returns

\`MemberSourceBreakdown\` \\| \`null\`

The cached breakdown, or \`null\` when none has been computed this
  session (or it has passed its TTL). Never fetches.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCommandPalette / useCommandPalette

# Function: useCommandPalette()

> **useCommandPalette**(): \`CommandPaletteControls\`

Defined in: [src/sidepanel/hooks/useCommandPalette.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCommandPalette.ts#L33)

Register the app-wide ⌘K / Ctrl+K shortcut and track whether the jump-to palette is
open. Call this exactly once, from the app shell. The chord toggles.

## Returns

\`CommandPaletteControls\`

## Example

\`\`\`tsx
const palette = useCommandPalette();
return <TabJumpPalette isOpen={palette.isOpen} onClose={palette.close} … />;
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCommandPalette / CommandPaletteControls

# Interface: CommandPaletteControls

Defined in: [src/sidepanel/hooks/useCommandPalette.ts:14](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCommandPalette.ts#L14)

Open/close state for the ⌘K palette, plus the imperative controls the shell needs.

## Properties

### isOpen

> **isOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCommandPalette.ts:16](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCommandPalette.ts#L16)

Whether the palette is currently requested open.

***

### open

> **open**: () => \`void\`

Defined in: [src/sidepanel/hooks/useCommandPalette.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCommandPalette.ts#L18)

Open the palette (e.g. from a toolbar affordance).

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useCommandPalette.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCommandPalette.ts#L20)

Close the palette — passed to the palette's \`onClose\`.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonApps / useComparisonApps

# Function: useComparisonApps()

> **useComparisonApps**(\`__namedParameters\`): \`UseComparisonAppsReturn\`

Defined in: [src/sidepanel/hooks/useComparisonApps.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonApps.ts#L62)

Owns the app-assignment half of the comparison: both users' apps are refetched
together every time \`comparedUser\` changes (they are not cached or keyed by the
context user), guarded by a \`cancelled\` flag so a stale run cannot write state.

\`getUserApps\` never rejects — it resolves with whatever pages it collected plus
a \`complete\` flag — so there is no \`.catch\` here. A short walk surfaces as
UseComparisonAppsReturn.appsIncomplete rather than as an empty list that
would read as "0 apps". The HTTP status is logged at the boundary.

## Parameters

### \\_\\_namedParameters

\`UseComparisonAppsOptions\`

## Returns

\`UseComparisonAppsReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / useComparisonProfileEdit

# Function: useComparisonProfileEdit()

> **useComparisonProfileEdit**(\`__namedParameters\`): \`UseComparisonProfileEditReturn\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:408](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L408)

Editing state for both columns of the two-user comparison.

## Parameters

### \\_\\_namedParameters

\`UseComparisonProfileEditOptions\`

## Returns

\`UseComparisonProfileEditReturn\`

## Remarks

Only one confirmation is reachable at a time — arming one puts a
modal over the controls that would arm the other — but the context column wins
if both are ever armed, so the surface can never be asked to show two.

## Example

\`\`\`tsx
const attributeEdit = useComparisonProfileEdit({ …, enabled: isActive && comparedUser !== null });
<ComparisonAttributesTab contextEdit={attributeEdit.context} comparedEdit={attributeEdit.compared} … />
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / ComparisonEditMessage

# Interface: ComparisonEditMessage

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L42)

A message about a save that is no longer in flight. \`danger\` is "Okta
rejected this and nothing changed"; \`warning\` is "this may have applied and
we cannot tell".

## Properties

### type

> \`readonly\` **type**: \`"warning"\` \\| \`"danger"\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L44)

Severity, in the shared status vocabulary.

***

### text

> \`readonly\` **text**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L46)

A complete sentence, safe to render as-is. **May name the user — PII.**


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / ComparisonEditSide

# Interface: ComparisonEditSide

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L53)

One column's editing surface: everything the toolbar's controls and the rows'
cells need, and nothing about the other column.

## Properties

### key

> \`readonly\` **key**: \`ComparisonEditSideKey\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L55)

Which column this is.

***

### userName

> \`readonly\` **userName**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L57)

The user's display name, for the affordance that names whose profile is being edited. **PII.**

***

### cells

> \`readonly\` **cells**: \`Readonly\`\\<\`Record\`\\<\`string\`, \`AttributeEditCell\`\\>\\>

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L62)

Attribute name → its cell. **Empty unless this column is editing**, so a row
may index it unconditionally and read \`undefined\` as "render me read-only".

***

### isEditing

> \`readonly\` **isEditing**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L64)

Whether this column is in edit mode.

***

### isSaving

> \`readonly\` **isSaving**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L66)

Whether a confirmed write for this column is in flight.

***

### hasChanges

> \`readonly\` **hasChanges**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L68)

Whether anything on this column would actually be written.

***

### hasInvalid

> \`readonly\` **hasInvalid**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L70)

Whether any drafted value on this column fails validation; blocks save.

***

### canEdit

> \`readonly\` **canEdit**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L76)

Whether this column may be edited here at all — a user is loaded, the
surface is visible, and (context side only) the host can publish the
result. \`false\` renders no affordance rather than a disabled one.

***

### message?

> \`readonly\` \`optional\` **message?**: \`ComparisonEditMessage\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L78)

The outcome of the last save, when it is this surface's job to say it.

***

### begin

> \`readonly\` **begin**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L80)

Enter edit mode on this column with a clean draft.

#### Returns

\`void\`

***

### cancel

> \`readonly\` **cancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L82)

Leave edit mode on this column, discarding its draft.

#### Returns

\`void\`

***

### requestSave

> \`readonly\` **requestSave**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L84)

Arm this column's confirmation.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / ComparisonPendingSave

# Interface: ComparisonPendingSave

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L92)

The single confirmation the comparison may be showing, tagged with the column
it belongs to. One nullable object, so the changes being confirmed and whose
they are cannot drift apart.

## Properties

### side

> \`readonly\` **side**: \`ComparisonEditSideKey\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L94)

Which column armed it.

***

### userName

> \`readonly\` **userName**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L96)

Whose profile is being written. **PII.**

***

### changes

> \`readonly\` **changes**: readonly \`DraftChange\`[]

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L98)

The changes awaiting confirmation, in display order.

***

### isSaving

> \`readonly\` **isSaving**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L100)

True while the confirmed write is in flight.

***

### report

> \`readonly\` **report**: \`BlastRadiusReport\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L102)

The blast-radius report for this column's draft; \`not-computed\` until asked.

***

### isAnalyzing

> \`readonly\` **isAnalyzing**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L104)

True while this column's analysis runs.

***

### resolveGroupName

> \`readonly\` **resolveGroupName**: (\`groupId\`) => \`string\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:109](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L109)

Names the group ids inside a predicted rule's condition, from the same
snapshot read the analysis used. No fetch, no second source.

#### Parameters

##### groupId

\`string\`

#### Returns

\`string\` \\| \`undefined\`

***

### drafted?

> \`readonly\` \`optional\` **drafted?**: \`OktaUser\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:115](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L115)

The **post-draft** user and this user's complete group list, from the same
commit as report, so each rule row can break its condition down clause
by clause against the draft the verdicts describe.

***

### groupContext?

> \`readonly\` \`optional\` **groupContext?**: \`RuleGroupContext\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:121](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L121)

See drafted. Absent until a report exists, and never \`[]\` in that
state: an empty list asserts this user is in no groups, which is a different
claim from not having looked (\`docs/claims.md\`).

***

### error?

> \`readonly\` \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:123](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L123)

A message from a previous attempt that failed, kept on the re-armed confirmation.

***

### analyze

> \`readonly\` **analyze**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L125)

Run the analysis against this column's draft. Costs no API calls.

#### Returns

\`void\`

***

### cancel

> \`readonly\` **cancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:127](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L127)

Dismiss without writing. The draft and edit mode survive.

#### Returns

\`void\`

***

### confirm

> \`readonly\` **confirm**: () => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L129)

Perform the write.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / UseComparisonProfileEditOptions

# Interface: UseComparisonProfileEditOptions

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:133](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L133)

Options for useComparisonProfileEdit.

## Properties

### contextUser

> \`readonly\` **contextUser**: \`OktaUser\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L135)

The anchor user — the LEFT column.

***

### contextName

> \`readonly\` **contextName**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L137)

The anchor user's display name.

***

### contextAttributes

> \`readonly\` **contextAttributes**: readonly \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L139)

The anchor user's attribute inventory, exactly as the tab renders it.

***

### contextMastering

> \`readonly\` **contextMastering**: \`ProfileMastering\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:146](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L146)

Which profile sources are attached to the anchor user, for the editability
gate; discarded when \`useComparisonApps\`' walk came back incomplete. Without
it every \`PROFILE_MASTER\` attribute stays locked
(module:sidepanel/components/users/profileEditability).

***

### contextMemberships

> \`readonly\` **contextMemberships**: readonly \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:152](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L152)

The anchor user's complete membership list, for the blast-radius engine, or
\`undefined\` when it has not been read. The engine reports \`not-computed\`
rather than judging an edit against a list nobody fetched.

***

### onContextUserUpdated?

> \`readonly\` \`optional\` **onContextUserUpdated?**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:157](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L157)

Lifts a saved context user to whoever owns it. **Absent means the left
column is read-only** — see the module header.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### comparedUser

> \`readonly\` **comparedUser**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:159](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L159)

The compared user — the RIGHT column. \`null\` in the search phase.

***

### comparedName

> \`readonly\` **comparedName**: \`string\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:161](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L161)

The compared user's display name; \`''\` when none is picked.

***

### comparedAttributes

> \`readonly\` **comparedAttributes**: readonly \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:163](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L163)

The compared user's attribute inventory.

***

### comparedMastering

> \`readonly\` **comparedMastering**: \`ProfileMastering\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:165](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L165)

The same, for the compared user. See UseComparisonProfileEditOptions.contextMastering.

***

### comparedMemberships

> \`readonly\` **comparedMemberships**: readonly \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:168](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L168)

The compared user's membership list, or \`undefined\` when it has not been read.

***

### onComparedUserUpdated

> \`readonly\` **onComparedUserUpdated**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:170](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L170)

Lifts a saved compared user — \`setComparedUser\` in \`useUserComparison\`.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### rules

> \`readonly\` **rules**: \`RuleInventoryState\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:172](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L172)

The org rule inventory, three-state, shared by both columns' predictions.

***

### oktaOrigin?

> \`readonly\` \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:174](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L174)

Connected org origin, so the blast-radius report can label group ids.

***

### targetTabId

> \`readonly\` **targetTabId**: \`number\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:176](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L176)

Tab whose scheduler runs the writes.

***

### enabled

> \`readonly\` **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:181](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L181)

Whether the comparison is on screen AND a second user is picked. \`false\`
blocks entering edit mode and blocks every write.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / UseComparisonProfileEditReturn

# Interface: UseComparisonProfileEditReturn

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:185](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L185)

What useComparisonProfileEdit returns.

## Properties

### context

> \`readonly\` **context**: \`ComparisonEditSide\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:187](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L187)

The left column's editor.

***

### compared

> \`readonly\` **compared**: \`ComparisonEditSide\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:189](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L189)

The right column's editor.

***

### pendingSave

> \`readonly\` **pendingSave**: \`ComparisonPendingSave\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:191](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L191)

The one confirmation on screen, or \`null\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useComparisonProfileEdit / ComparisonEditSideKey

# Type Alias: ComparisonEditSideKey

> **ComparisonEditSideKey** = \`"context"\` \\| \`"compared"\`

Defined in: [src/sidepanel/hooks/useComparisonProfileEdit.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useComparisonProfileEdit.ts#L35)

Which column of the comparison an editor belongs to.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useConcierge / useConcierge

# Function: useConcierge()

> **useConcierge**(\`options\`): \`Concierge\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L73)

Compose the concierge for the current page.

## Parameters

### options

\`UseConciergeOptions\`

See UseConciergeOptions.

## Returns

\`Concierge\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useConcierge / Concierge

# Interface: Concierge

Defined in: [src/sidepanel/hooks/useConcierge.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L41)

What useConcierge returns.

## Properties

### greeting

> **greeting**: \`string\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L43)

The time-of-day greeting.

***

### line

> **line**: \`string\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L45)

Where the reader is, and the question.

***

### settled

> **settled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L47)

Whether Concierge.line is final for this page.

***

### cards

> **cards**: \`ConciergeCardView\`[]

Defined in: [src/sidepanel/hooks/useConcierge.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L49)

The cards, in order; none without a page a question can take.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useConcierge / ConciergeCardView

# Interface: ConciergeCardView

Defined in: [src/sidepanel/hooks/useConcierge.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L29)

One card, as the concierge shows it.

## Properties

### key

> **key**: \`string\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L31)

Stable across renders.

***

### card

> **card**: \`ConciergeCard\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L33)

What choosing it does.

***

### text

> **text**: \`string\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L35)

The question, or the pin, in words.

***

### how

> **how**: \`string\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L37)

What it will spend, or what is left to choose.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useConcierge / UseConciergeOptions

# Interface: UseConciergeOptions

Defined in: [src/sidepanel/hooks/useConcierge.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L53)

Options for useConcierge.

## Properties

### api

> **api**: \`EntityFactsApi\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L55)

The scheduler-routed transport.

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L57)

The connected org.

***

### page

> **page**: \`EntityRef\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L59)

The entity the live tab is on, when a question can take it.

***

### connected

> **connected**: \`boolean\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L61)

Whether an Okta tab is connected.

***

### isActive

> **isActive**: \`boolean\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L63)

Whether Home is on screen.

***

### isPinned

> **isPinned**: (\`kind\`, \`id\`) => \`boolean\`

Defined in: [src/sidepanel/hooks/useConcierge.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useConcierge.ts#L65)

Whether an entity is already pinned.

#### Parameters

##### kind

\`WorkingSetKind\`

##### id

\`string\`

#### Returns

\`boolean\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCopyToClipboard / useCopyToClipboard

# Function: useCopyToClipboard()

> **useCopyToClipboard**(): \`UseCopyToClipboardResult\`

Defined in: [src/sidepanel/hooks/useCopyToClipboard.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCopyToClipboard.ts#L33)

Copy text to the clipboard with a self-resetting confirmation flag.

## Returns

\`UseCopyToClipboardResult\`

## Example

\`\`\`tsx
const { copied, copy } = useCopyToClipboard();
<IconButton label={copied ? 'Copied!' : 'Copy ID'} onClick={() => copy(group.id)} />
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCopyToClipboard / UseCopyToClipboardResult

# Interface: UseCopyToClipboardResult

Defined in: [src/sidepanel/hooks/useCopyToClipboard.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCopyToClipboard.ts#L17)

Return shape of useCopyToClipboard.

## Properties

### copied

> **copied**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCopyToClipboard.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCopyToClipboard.ts#L19)

True for ~1.5 s after a successful copy; drives "Copied!" affordances.

***

### copy

> **copy**: (\`text\`) => \`void\`

Defined in: [src/sidepanel/hooks/useCopyToClipboard.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCopyToClipboard.ts#L21)

Write \`text\` to the clipboard; failures are swallowed and leave \`copied\` false.

#### Parameters

##### text

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCountUp / useCountUp

# Function: useCountUp()

> **useCountUp**(\`target\`, \`options?\`): \`UseCountUpResult\`

Defined in: [src/sidepanel/hooks/useCountUp.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L74)

Count a metric up to \`target\` over \`--dur-tell\` on an ease-out curve, and flag
the brief window right after it lands.

\`value\` is always an integer and always lands exactly on \`target\`. Render it with
\`tabular-nums\` — proportional digits change width as they count.

## Parameters

### target

\`number\`

The value to count towards. Intermediate frames are rounded; the
final frame is the exact \`target\`.

### options?

\`UseCountUpOptions\` = \`{}\`

See UseCountUpOptions.

## Returns

\`UseCountUpResult\`

See UseCountUpResult.

## Example

\`\`\`tsx
const { value, justResolved } = useCountUp(members.length);
return (
  <p className={\`tabular-nums transition-colors duration-(--dur-tell) \${justResolved ? 'text-success-text' : ''}\`}>
    {value.toLocaleString()}
  </p>
);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCountUp / UseCountUpOptions

# Interface: UseCountUpOptions

Defined in: [src/sidepanel/hooks/useCountUp.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L30)

Options for useCountUp.

## Properties

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCountUp.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L36)

Set \`false\` to bypass the animation entirely and mirror \`target\` exactly — for
a metric that is not a resolved number yet (a placeholder em dash, a status
string), or a surface that should never animate. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCountUp / UseCountUpResult

# Interface: UseCountUpResult

Defined in: [src/sidepanel/hooks/useCountUp.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L40)

What useCountUp returns each render.

## Properties

### value

> **value**: \`number\`

Defined in: [src/sidepanel/hooks/useCountUp.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L42)

The value to display this frame.

***

### justResolved

> **justResolved**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCountUp.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCountUp.ts#L49)

True for \`--dur-tell\` immediately after \`target\` changes to a new value, never
on the initial mount. A card renders it as a brief \`text-success-text\` tint.
Mirrors \`enabled\` rather than whether the digits animated, so opting out of
the count opts out of the tint.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCreateFeedingRule / useCreateFeedingRule

# Function: useCreateFeedingRule()

> **useCreateFeedingRule**(\`__namedParameters\`): \`UseCreateFeedingRuleReturn\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L110)

Drive the Group Detail rung's *Create feeding rule* verb: the draft, its
checks, the confirmed \`POST\`, and the created rule.

## Parameters

### \\_\\_namedParameters

\`UseCreateFeedingRuleOptions\`

## Returns

\`UseCreateFeedingRuleReturn\`

## Example

\`\`\`tsx
const createRule = useCreateFeedingRule({ targetTabId, group });
<GroupActionBar onCreateFeedingRule={createRule.open} … />
<CreateFeedingRuleModal {...createRule} groupName={group.name} />
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCreateFeedingRule / UseCreateFeedingRuleOptions

# Interface: UseCreateFeedingRuleOptions

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L41)

Options for useCreateFeedingRule.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L43)

Tab whose scheduler runs the create. The verb is disabled without one.

***

### group

> **group**: \`GroupSummary\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L45)

The group the new rule assigns users into — the rule's one target.

***

### onCreated?

> \`optional\` **onCreated?**: () => \`void\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L52)

Called once the create has landed, so the caller can reload the open pane.
**Read at call time, not at confirm time**, so a caller can withdraw it: a
hidden rung passes \`undefined\` and the resolved create issues no follow-up
read.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useCreateFeedingRule / UseCreateFeedingRuleReturn

# Interface: UseCreateFeedingRuleReturn

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L56)

Return shape of useCreateFeedingRule.

## Properties

### isOpen

> **isOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L58)

Whether the confirm modal is open.

***

### open

> **open**: (\`draftExpression?\`) => \`void\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L63)

Open the modal on a fresh draft, its expression prefilled when one is given.
The name is never prefilled: it is the reader's to choose.

#### Parameters

##### draftExpression?

\`string\`

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L65)

Close the modal and discard the draft (Cancel, Escape, overlay, header close).

#### Returns

\`void\`

***

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L67)

Controlled rule-name draft.

***

### setName

> **setName**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L69)

Called with the new rule name on each keystroke.

#### Parameters

##### value

\`string\`

#### Returns

\`void\`

***

### nameError

> **nameError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L74)

Why the drafted name is not acceptable, or \`null\`. Only ever length;
emptiness disables the confirm silently.

***

### expression

> **expression**: \`string\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L76)

Controlled match-expression draft.

***

### setExpression

> **setExpression**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L78)

Called with the new expression on each keystroke.

#### Parameters

##### value

\`string\`

#### Returns

\`void\`

***

### expressionNotice

> **expressionNotice**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L84)

A non-blocking notice about the drafted expression: this panel parses a
documented subset of Okta EL, so "we could not read that" is reported and
never enforced. \`null\` when it parsed, or while the field is empty.

***

### canSubmit

> **canSubmit**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L86)

Whether the confirm button may fire (a name, an expression, a tab, nothing in flight).

***

### isCreating

> **isCreating**: \`boolean\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L88)

True while the create request is in flight.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L90)

Message from a failed create, or \`null\`.

***

### createdRuleName

> **createdRuleName**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L92)

The created rule's name once the write landed, or \`null\`. Drives the success step.

***

### createdRuleId

> **createdRuleId**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L94)

The created rule's id once the write landed, or \`null\` — the deep link's argument.

***

### confirm

> **confirm**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useCreateFeedingRule.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useCreateFeedingRule.ts#L96)

Run the create (the modal's confirm button).

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useDebouncedUserSearch / useDebouncedUserSearch

# Function: useDebouncedUserSearch()

> **useDebouncedUserSearch**(\`options\`): \`UseDebouncedUserSearchReturn\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L79)

Debounced, tab-scoped Okta user search. Wrap this rather than duplicating the
debounce effect; the wrappers own how errors surface.

## Parameters

### options

\`UseDebouncedUserSearchOptions\`

See UseDebouncedUserSearchOptions.

## Returns

\`UseDebouncedUserSearchReturn\`

\`searchQuery\` / \`setSearchQuery\` (drives the debounced search),
  \`searchResults\` / \`setSearchResults\`, \`isSearching\`, and \`resultsTruncated\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useDebouncedUserSearch / UseDebouncedUserSearchOptions

# Interface: UseDebouncedUserSearchOptions

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L22)

Options for useDebouncedUserSearch.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L24)

Tab whose content script performs the search; searches error out when undefined.

***

### onError

> **onError**: (\`message\`) => \`void\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L30)

Receives \`null\` on search start/success and the message on failure. Must be
stable (a \`useState\` setter or \`useCallback\`) so the debounce effect keeps a
fixed identity.

#### Parameters

##### message

\`string\` \\| \`null\`

#### Returns

\`void\`

***

### onSearchStart?

> \`optional\` **onSearchStart?**: () => \`void\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L35)

Optional: fired at the start of each committed search (after the error channel
is cleared, before the request). Must be stable (\`useCallback\`).

#### Returns

\`void\`

***

### debounceMs

> **debounceMs**: \`number\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L37)

Debounce delay before searching.

***

### minQueryLength

> **minQueryLength**: \`number\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L39)

Minimum query length before searching.

***

### log

> **log**: \`Logger\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L41)

The wrapping hook's scoped logger.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L48)

When \`false\`, the debounce never commits a search. The Users tab stays mounted
(hidden) once visited, and the effect re-fires whenever \`targetTabId\`
changes — which would otherwise re-run the query still sitting in the box from
a tab the user cannot see. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useDebouncedUserSearch / UseDebouncedUserSearchReturn

# Interface: UseDebouncedUserSearchReturn

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L52)

Return shape of useDebouncedUserSearch.

## Properties

### searchQuery

> **searchQuery**: \`string\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L53)

***

### setSearchQuery

> **setSearchQuery**: (\`query\`) => \`void\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L54)

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

***

### searchResults

> **searchResults**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L55)

***

### setSearchResults

> **setSearchResults**: (\`users\`) => \`void\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L61)

Replace the results from outside a search. Clears
UseDebouncedUserSearchReturn.resultsTruncated, because a truncation
flag describes the rows it arrived with and nothing else.

#### Parameters

##### users

\`OktaUser\`[]

#### Returns

\`void\`

***

### isSearching

> **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L62)

***

### resultsTruncated

> **resultsTruncated**: \`boolean\`

Defined in: [src/sidepanel/hooks/useDebouncedUserSearch.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedUserSearch.ts#L68)

Whether Okta held matches back from \`searchResults\` — its own answer, from the
\`Link\` header, not a guess from the row count. Every path that is not a
successful search sets this \`false\`, so it can never outlive its rows.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useDebouncedValue / useDebouncedValue

# Function: useDebouncedValue()

> **useDebouncedValue**\\<\`T\`\\>(\`value\`, \`delayMs\`): \`T\`

Defined in: [src/sidepanel/hooks/useDebouncedValue.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDebouncedValue.ts#L21)

Debounce a changing value.

## Type Parameters

### T

\`T\`

## Parameters

### value

\`T\`

The rapidly changing source value (e.g. a search input).

### delayMs

\`number\`

How long the value must be stable before it is emitted.

## Returns

\`T\`

The debounced value: the initial value immediately, then the latest
  value once \`delayMs\` has elapsed without further changes.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useDetectedUser / useDetectedUser

# Function: useDetectedUser()

> **useDetectedUser**(\`options\`): \`UseDetectedUserReturn\`

Defined in: [src/sidepanel/hooks/useDetectedUser.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useDetectedUser.ts#L51)

Hook exposing an on-demand loader for one user by id.

## Parameters

### options

\`UseDetectedUserOptions\`

See UseDetectedUserOptions.

## Returns

\`UseDetectedUserReturn\`

\`loadUserById\`, invoked to fulfil a \`selectedUserId\` request.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityFacts / useEntityFacts

# Function: useEntityFacts()

> **useEntityFacts**(\`api\`, \`oktaOrigin\`, \`pin\`, \`enabled\`): \`EntityFactsRead\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L45)

Read one entity's facts while \`enabled\`.

## Parameters

### api

\`EntityFactsApi\`

The scheduler-routed transport.

### oktaOrigin

\`string\` \\| \`null\` \\| \`undefined\`

The connected org; the cached answer is that org's.

### pin

\`Pick\`\\<\`WorkingSetRef\`, \`"id"\` \\| \`"kind"\`\\> \\| \`null\`

The entity, or \`null\` when there is none to read.

### enabled

\`boolean\`

Whether Home is on screen with a connected Okta tab.

## Returns

\`EntityFactsRead\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityFacts / EntityFactsRead

# Interface: EntityFactsRead

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L24)

What useEntityFacts returns.

## Properties

### lookup

> **lookup**: \`EntityLookup\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L26)

The settled read, or \`null\` before one has arrived.

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L28)

A read is in flight with nothing yet to show.

***

### failed

> **failed**: \`boolean\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L30)

The last read failed. Any facts still shown are from the read before it.

***

### readAt

> **readAt**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L32)

When Okta answered the read on show, in epoch millis; \`null\` with nothing shown.

***

### refresh

> **refresh**: () => \`void\`

Defined in: [src/sidepanel/hooks/useEntityFacts.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityFacts.ts#L34)

Read the entity again, bypassing the cache.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityHandoff / useEntityHandoff

# Function: useEntityHandoff()

> **useEntityHandoff**(\`__namedParameters\`): \`UseEntityHandoffReturn\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L100)

Resolve whether to offer the live Okta tab's entity, and what accepting means.

## Parameters

### \\_\\_namedParameters

\`UseEntityHandoffOptions\`

## Returns

\`UseEntityHandoffReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityHandoff / HandoffOffer

# Interface: HandoffOffer

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L19)

The entity the live Okta tab is on, when the panel could open it.

## Properties

### kind

> **kind**: \`JumpKind\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L21)

Which kind, for the glyph and the destination label.

***

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L23)

The Okta id the offer would open.

***

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L25)

Display name, as the live page reported it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityHandoff / UseEntityHandoffOptions

# Interface: UseEntityHandoffOptions

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L75)

Options for useEntityHandoff.

## Properties

### page

> **page**: \`OktaPageContext\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L77)

The panel's one page-context engine result.

***

### canNavigateTo

> **canNavigateTo**: (\`kind\`) => \`boolean\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L82)

Whether the panel can currently open that kind at all — \`EntityLink\`'s
\`canNavigateTo\` in prop form.

#### Parameters

##### kind

\`JumpKind\`

#### Returns

\`boolean\`

***

### navigateTo

> **navigateTo**: (\`kind\`, \`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L84)

Open the entity on its own tab. Fired only from an explicit press.

#### Parameters

##### kind

\`JumpKind\`

##### id

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntityHandoff / UseEntityHandoffReturn

# Interface: UseEntityHandoffReturn

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L88)

Return shape of useEntityHandoff.

## Properties

### offer

> **offer**: \`HandoffOffer\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L90)

The offer to render, or \`null\` when there is nothing to hand over.

***

### accept

> **accept**: () => \`void\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L92)

Take the offer: open the entity here.

#### Returns

\`void\`

***

### dismiss

> **dismiss**: () => \`void\`

Defined in: [src/sidepanel/hooks/useEntityHandoff.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntityHandoff.ts#L94)

Decline it, for this entity only.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySearchSources / useEntitySearchSources

# Function: useEntitySearchSources()

> **useEntitySearchSources**(\`__namedParameters\`): \`EntitySearchSources\`

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L135)

Build the searchers and fetchers for one entity-resolving surface.

## Parameters

### \\_\\_namedParameters

\`UseEntitySearchSourcesOptions\`

## Returns

\`EntitySearchSources\`

## Example

\`\`\`ts
// Module scope — an inline literal here would defeat the memo.
const HOME_JUMP_KINDS = ['group', 'user'] as const;

const { searchers, fetchers } = useEntitySearchSources({ api, index, kinds: HOME_JUMP_KINDS });
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySearchSources / EntitySearchApi

# Interface: EntitySearchApi

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L36)

The slice of module:sidepanel/hooks/useOktaApi this hook reads. Declared
structurally so a test can pass eight functions instead of the whole client.

## Properties

### searchGroups

> **searchGroups**: (\`query\`) => \`Promise\`\\<\`object\`[]\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L38)

Type-ahead group search (\`q=\`).

#### Parameters

##### query

\`string\`

#### Returns

\`Promise\`\\<\`object\`[]\\>

***

### searchUsers

> **searchUsers**: (\`query\`) => \`Promise\`\\<\`object\`[]\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L42)

Type-ahead user search (\`q=\`).

#### Parameters

##### query

\`string\`

#### Returns

\`Promise\`\\<\`object\`[]\\>

***

### searchApps

> **searchApps**: (\`query\`) => \`Promise\`\\<\`object\`[]\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L56)

Type-ahead app search (\`q=\`), used only when the snapshot cannot answer. \`name\` is
the app *type* key, not the label — the Admin Console route is
\`/admin/app/{name}/instance/{id}\`.

#### Parameters

##### query

\`string\`

#### Returns

\`Promise\`\\<\`object\`[]\\>

***

### listPolicies

> **listPolicies**: (\`type?\`) => \`Promise\`\\<\`PolicyListResult\`\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L62)

Whole-list policy walk; \`/api/v1/policies\` has no name search of its own.
Three-valued: an org with no policies and a role that may not read them are
different answers, even though this source acts on both the same way.

#### Parameters

##### type?

\`"ACCESS_POLICY"\` \\| \`"OKTA_SIGN_ON"\` \\| \`"MFA_ENROLL"\` \\| \`"PASSWORD"\`

#### Returns

\`Promise\`\\<\`PolicyListResult\`\\>

***

### getGroupById

> **getGroupById**: (\`id\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description?\`: \`string\`; \\} \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L64)

By-id group lookup, for a snapshot miss.

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description?\`: \`string\`; \\} \\| \`null\`\\>

***

### getUserById

> **getUserById**: (\`id\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`firstName?\`: \`string\`; \`lastName?\`: \`string\`; \`login\`: \`string\`; \`email?\`: \`string\`; \\} \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L66)

By-id user lookup; users are never in the snapshot, so this always runs.

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`firstName?\`: \`string\`; \`lastName?\`: \`string\`; \`login\`: \`string\`; \`email?\`: \`string\`; \\} \\| \`null\`\\>

***

### getAppById

> **getAppById**: (\`id\`) => \`Promise\`\\<\\{ \`kind\`: \`"found"\`; \`app\`: \\{ \`id\`: \`string\`; \`label?\`: \`string\`; \`name?\`: \`string\`; \\}; \\} \\| \\{ \`kind\`: \`"missing"\`; \\} \\| \\{ \`kind\`: \`"session-expired"\`; \\} \\| \\{ \`kind\`: \`"failed"\`; \`status\`: \`number\`; \\}\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L74)

By-id app lookup, whose four-way result separates "no such app" from "no answer".

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\\{ \`kind\`: \`"found"\`; \`app\`: \\{ \`id\`: \`string\`; \`label?\`: \`string\`; \`name?\`: \`string\`; \\}; \\} \\| \\{ \`kind\`: \`"missing"\`; \\} \\| \\{ \`kind\`: \`"session-expired"\`; \\} \\| \\{ \`kind\`: \`"failed"\`; \`status\`: \`number\`; \\}\\>

***

### getRawGroupRule

> **getRawGroupRule**: (\`id\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`name?\`: \`string\`; \`status\`: \`GroupRuleStatus\`; \\} \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L87)

By-id rule lookup. \`status\` is required and typed to the union: the one supplier
parses the response with \`oktaGroupRuleSchema\`, so the row's label can be decided
by an exhaustive switch with no "unknown status" arm (D-085).

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`name?\`: \`string\`; \`status\`: \`GroupRuleStatus\`; \\} \\| \`null\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySearchSources / EntitySearchSources

# Interface: EntitySearchSources

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:106](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L106)

What useEntitySearchSources returns.

## Properties

### searchers

> **searchers**: \`Partial\`\\<\`Record\`\\<\`JumpKind\`, (\`query\`) => \`Promise\`\\<\`JumpResult\`[]\\>\\>\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L108)

Name searchers, keyed by kind. Ready to hand to \`useJumpResolver\`.

***

### fetchers

> **fetchers**: \`Partial\`\\<\`Record\`\\<\`OktaIdKind\`, (\`id\`) => \`Promise\`\\<\`JumpResult\` \\| \`null\`\\>\\>\\>

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L110)

By-id fetchers, keyed by kind, for a snapshot miss.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySearchSources / UseEntitySearchSourcesOptions

# Interface: UseEntitySearchSourcesOptions

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L93)

Options for useEntitySearchSources.

## Properties

### api

> **api**: \`EntitySearchApi\`

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L95)

The Okta client slice. See EntitySearchApi.

***

### index

> **index**: \`OrgEntityIndex\`

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L97)

The local org snapshot index — the zero-request half of every answer.

***

### kinds

> **kinds**: readonly \`JumpKind\`[]

Defined in: [src/sidepanel/hooks/useEntitySearchSources.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySearchSources.ts#L102)

Which kinds this surface searches. **Must be a module-level constant**, or
the \`searchers\` memo is defeated — see the module header.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySelection / useEntitySelection

# Function: useEntitySelection()

> **useEntitySelection**\\<\`T\`\\>(\`entities\`): \`EntitySelection\`\\<\`T\`\\>

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L35)

Owns entity selection. \`selectedEntities\` derives from the full \`entities\` list,
never a filtered view, so hidden picks stay selected across filtering and
live/cached mode switches. Do not re-scope this to a filtered list.

## Type Parameters

### T

\`T\` *extends* \`object\`

## Parameters

### entities

\`T\`[]

The full entity list selected ids are resolved against.

## Returns

\`EntitySelection\`\\<\`T\`\\>

\`selectedIds\`, the resolved \`selectedEntities\`, and the
\`toggleSelect\` / \`replaceSelection\` / \`deselectAll\` mutators.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useEntitySelection / EntitySelection

# Interface: EntitySelection\\<T\\>

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:13](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L13)

Selection state and mutators returned by useEntitySelection.

## Type Parameters

### T

\`T\` *extends* \`object\`

## Properties

### selectedIds

> **selectedIds**: \`Set\`\\<\`string\`\\>

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:15](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L15)

The selected ids (source of truth).

***

### selectedEntities

> **selectedEntities**: \`T\`[]

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L17)

The selected entities, resolved against the full list passed in.

***

### toggleSelect

> **toggleSelect**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L19)

Toggle a single id in/out of the selection.

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### replaceSelection

> **replaceSelection**: (\`ids\`) => \`void\`

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L21)

Replace the whole selection (Select All against filtered ids, or load a saved set).

#### Parameters

##### ids

\`string\`[]

#### Returns

\`void\`

***

### deselectAll

> **deselectAll**: () => \`void\`

Defined in: [src/sidepanel/hooks/useEntitySelection.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useEntitySelection.ts#L23)

Clear the selection.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportPresets / useExportPresets

# Function: useExportPresets()

> **useExportPresets**(\`entityId\`, \`validColumnIds\`): \`UseExportPresets\`

Defined in: [src/sidepanel/hooks/useExportPresets.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L42)

Manage saved presets and last-used selection for one export entity.

## Parameters

### entityId

\`string\`

The active EntityExport.id.

### validColumnIds

\`string\`[]

Column ids present in the descriptor's current catalog.

## Returns

\`UseExportPresets\`

Preset list + save/remove/last-used operations (see UseExportPresets).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportPresets / UseExportPresets

# Interface: UseExportPresets

Defined in: [src/sidepanel/hooks/useExportPresets.ts:16](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L16)

What useExportPresets returns.

## Properties

### presets

> **presets**: \`ExportPreset\`[]

Defined in: [src/sidepanel/hooks/useExportPresets.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L18)

Saved presets for the active entity, newest first.

***

### save

> **save**: (\`name\`, \`enabledColumnIds\`, \`filterText?\`) => \`Promise\`\\<\`ExportPreset\` \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useExportPresets.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L20)

Save a new named preset from the current selection. Returns it, or \`null\`.

#### Parameters

##### name

\`string\`

##### enabledColumnIds

\`string\`[]

##### filterText?

\`string\`

#### Returns

\`Promise\`\\<\`ExportPreset\` \\| \`null\`\\>

***

### remove

> **remove**: (\`id\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportPresets.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L26)

Delete a preset by id and refresh the list.

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\`void\`\\>

***

### loadLastUsed

> **loadLastUsed**: () => \`Promise\`\\<\\{ \`enabledColumnIds\`: \`string\`[]; \\} \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useExportPresets.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L28)

Read + reconcile the last-used column selection for this entity, or \`null\`.

#### Returns

\`Promise\`\\<\\{ \`enabledColumnIds\`: \`string\`[]; \\} \\| \`null\`\\>

***

### saveLastUsed

> **saveLastUsed**: (\`enabledColumnIds\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportPresets.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L30)

Persist the current column selection as this entity's last-used.

#### Parameters

##### enabledColumnIds

\`string\`[]

#### Returns

\`Promise\`\\<\`void\`\\>

***

### reconcile

> **reconcile**: (\`ids\`) => \`string\`[]

Defined in: [src/sidepanel/hooks/useExportPresets.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportPresets.ts#L32)

Reconcile arbitrary column ids against the current catalog.

#### Parameters

##### ids

\`string\`[]

#### Returns

\`string\`[]


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / useExportTab

# Function: useExportTab()

> **useExportTab**(\`options\`): \`UseExportTab\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:252](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L252)

Drive the Export tab: the \`pick | configure\` state machine plus all export
configuration and the shared preview rows.

## Parameters

### options

\`UseExportTabOptions\`

Injected api, registry, deps, origin, connection + error sink.

## Returns

\`UseExportTab\`

State and actions for the Export tab's presentational components.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / ExportMatchCount

# Interface: ExportMatchCount

Defined in: [src/sidepanel/hooks/useExportTab.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L38)

First-page probe result used to drive the filter box match-count.

## Properties

### count

> **count**: \`number\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L40)

Rows on the first page (0 reveals a filter typo).

***

### hasMore

> **hasMore**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L42)

Whether more pages exist beyond the first (true total is larger).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / ExportTabApi

# Interface: ExportTabApi

Defined in: [src/sidepanel/hooks/useExportTab.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L68)

The subset of the \`useOktaApi\` facade the Export tab consumes. Declared
structurally so the full facade object is assignable without re-deriving its
~40 operation signatures.

## Properties

### fetchExportRows

> **fetchExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`, \`onPage?\`) => \`Promise\`\\<\`FetchResult\`\\<\`Row\`\\>\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L70)

Fetch every row for a resolved endpoint, paginating on the \`Link\` header.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

##### resolvedEndpoint

\`string\`

##### onPage?

(\`rowsSoFar\`) => \`void\`

#### Returns

\`Promise\`\\<\`FetchResult\`\\<\`Row\`\\>\\>

***

### fetchSelectionExportRows

> **fetchSelectionExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`basket\`, \`onProgress?\`) => \`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L79)

Read a \`from-selection\` export: one scheduler-routed request per ticked
entity, folded into rows plus the ticks that could not be read.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

##### basket

\`SelectionBasket\`

##### onProgress?

(\`rowsSoFar\`) => \`void\`

#### Returns

\`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\>

***

### countExportRows

> **countExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`) => \`Promise\`\\<\`ExportMatchCount\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L85)

Probe the first page for the live match-count.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

##### resolvedEndpoint

\`string\`

#### Returns

\`Promise\`\\<\`ExportMatchCount\`\\>

***

### runExport

> **runExport**: \\<\`Row\`\\>(\`args\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L90)

Project the fetched rows to CSV and download them.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### args

###### descriptor

\`EntityExport\`\\<\`Row\`\\>

###### rows

\`Row\`[]

###### enabledColumnIds

\`string\`[]

###### contextLabel?

\`string\`

###### resolution?

\`CountResolution\`

###### selection?

\\{ \`requested\`: \`number\`; \`missing\`: \`number\`; \\}

###### selection.requested

\`number\`

###### selection.missing

\`number\`

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / UseExportTab

# Interface: UseExportTab

Defined in: [src/sidepanel/hooks/useExportTab.ts:132](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L132)

Everything useExportTab returns for the presentational components.

## Properties

### phase

> **phase**: \`ExportPhase\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:134](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L134)

Current phase of the export flow.

***

### descriptors

> **descriptors**: \`EntityExport\`\\<\`unknown\`\\>[]

Defined in: [src/sidepanel/hooks/useExportTab.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L136)

Ordered descriptors for the entity hub.

***

### descriptor

> **descriptor**: \`EntityExport\`\\<\`unknown\`\\> \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:138](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L138)

The active descriptor, or \`null\` in the \`pick\` phase.

***

### selectEntity

> **selectEntity**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:140](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L140)

Enter the \`configure\` phase for the given descriptor id.

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### backToPick

> **backToPick**: () => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L142)

Return to the entity hub, discarding the in-progress configuration.

#### Returns

\`void\`

***

### enabledColumnIds

> **enabledColumnIds**: \`Set\`\\<\`string\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L145)

Enabled column ids.

***

### enabledColumns

> **enabledColumns**: \`ExportColumn\`\\<\`unknown\`\\>[]

Defined in: [src/sidepanel/hooks/useExportTab.ts:147](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L147)

Enabled columns, in catalog order (headers + projection order).

***

### enabledCount

> **enabledCount**: \`number\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:149](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L149)

Number of enabled columns.

***

### toggleColumn

> **toggleColumn**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:151](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L151)

Toggle one column on/off.

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### contextId

> **contextId**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:154](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L154)

Chosen context entity id (search-to-select), or \`null\`.

***

### contextLabel

> **contextLabel**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:156](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L156)

Chosen context entity label, folded into the filename.

***

### setContext

> **setContext**: (\`option\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:158](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L158)

Set (or clear) the search-to-select context entity.

#### Parameters

##### option

\`EntityContextOption\` \\| \`null\`

#### Returns

\`void\`

***

### contextSearch

> **contextSearch**: (\`query\`) => \`Promise\`\\<\`EntityContextOption\`[]\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:160](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L160)

Search for context entities for the active descriptor.

#### Parameters

##### query

\`string\`

#### Returns

\`Promise\`\\<\`EntityContextOption\`[]\\>

***

### filterText

> **filterText**: \`string\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:163](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L163)

Raw filter expression from the filter box.

***

### setFilterText

> **setFilterText**: (\`text\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:165](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L165)

Update the raw filter expression (invalidates any loaded preview).

#### Parameters

##### text

\`string\`

#### Returns

\`void\`

***

### matchCount

> **matchCount**: \`ExportMatchCount\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:167](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L167)

Debounced first-page match-count, or \`null\` while unknown.

***

### matchCountLoading

> **matchCountLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:169](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L169)

Whether a match-count probe is in flight.

***

### presets

> **presets**: \`ExportPreset\`[]

Defined in: [src/sidepanel/hooks/useExportTab.ts:172](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L172)

Saved presets for the active entity, newest first.

***

### activePresetId

> **activePresetId**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:174](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L174)

Id of the currently applied preset, or \`null\`.

***

### applyPreset

> **applyPreset**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:176](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L176)

Apply a saved preset's column selection + filter.

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### savePreset

> **savePreset**: (\`name\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:178](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L178)

Save the current selection under a name.

#### Parameters

##### name

\`string\`

#### Returns

\`Promise\`\\<\`void\`\\>

***

### deletePreset

> **deletePreset**: (\`id\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:180](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L180)

Delete a saved preset by id.

#### Parameters

##### id

\`string\`

#### Returns

\`Promise\`\\<\`void\`\\>

***

### previewRows

> **previewRows**: \`unknown\`[] \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:183](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L183)

Fetched preview rows (shared by Preview + Download), or \`null\`.

***

### fetched

> **fetched**: \`number\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:185](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L185)

Total raw rows the server returned (before validation).

***

### dropped

> **dropped**: \`number\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:187](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L187)

Rows skipped for failing schema validation.

***

### capped

> **capped**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:189](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L189)

Whether the descriptor's row cap was hit.

***

### loadPreview

> **loadPreview**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:191](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L191)

Fetch rows and populate the preview.

#### Returns

\`Promise\`\\<\`void\`\\>

***

### download

> **download**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:193](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L193)

Download the CSV, reusing preview rows when present.

#### Returns

\`Promise\`\\<\`void\`\\>

***

### isBusy

> **isBusy**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:195](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L195)

Whether a fetch/export is in flight (disables the action buttons).

***

### canExport

> **canExport**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:198](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L198)

Whether Preview/Download are allowed.

***

### hasConnectedTab

> **hasConnectedTab**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:200](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L200)

Whether an Okta tab is connected.

***

### selectionCount

> **selectionCount**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:208](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L208)

How many entities are ticked for a \`from-selection\` descriptor — the exact
number of rows-worth of entities this export will read, known before a
single request. \`null\` for every other scoping mode: an export that is not
selection-scoped has no tick count, and absent is not zero.

***

### selectionLabel

> **selectionLabel**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:210](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L210)

The plural noun for those ticked entities (\`'users'\`), or \`null\`.

***

### selectionShortfall

> **selectionShortfall**: \\{ \`requested\`: \`number\`; \`missing\`: \`number\`; \\} \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:222](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L222)

The shortfall of the last \`from-selection\` read: how many ticks were issued
and how many of them could not be read. \`null\` until a read has happened,
and \`null\` when every tick resolved.

It does **not** block the download. The rows that were read are true rows
the reader ticked, so withholding them would answer a question nobody asked;
instead the shortfall is stated here and stamped into the filename
(\`…-5-ticked-2-missing-….csv\`), so the reader knows what the file is before
they open it.

***

### snapshotStatus

> **snapshotStatus**: \`OrgFigureStatus\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:231](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L231)

For a snapshot-sourced descriptor, whether its answer may be published —
\`null\` for every endpoint descriptor.

\`'reading'\` means wait, \`'unavailable'\` means there is no export, and
\`'partial'\` means the rows ship with the shortfall stated on each one.

***

### snapshotNote

> **snapshotNote**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:237](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L237)

The sentence explaining UseExportTab.snapshotStatus — what the
number is out of, or which read is missing. \`null\` when there is nothing to
say.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / UseExportTabOptions

# Interface: UseExportTabOptions

Defined in: [src/sidepanel/hooks/useExportTab.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L101)

Arguments for useExportTab.

## Properties

### api

> **api**: \`ExportTabApi\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L103)

The export operations from \`useOktaApi\` (scheduler-routed reads + download).

***

### registry

> **registry**: \`Record\`\\<\`string\`, \`EntityExport\`\\>

Defined in: [src/sidepanel/hooks/useExportTab.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L105)

The descriptor registry built from module:sidepanel/export/registry.buildRegistry.

***

### deps

> **deps**: \`ExportApiDeps\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:107](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L107)

Live search functions, used to resolve a search-to-select descriptor's context search.

***

### snapshot?

> \`optional\` **snapshot?**: \`OrgSnapshotView\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:113](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L113)

The mounted org snapshot, for snapshot-sourced descriptors. Read-only: with no
snapshot mounted those descriptors report as unavailable rather than fetching to
repair it. Memoize it; the join re-runs on a new identity.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:115](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L115)

Okta org origin used to build per-row deep links in the preview.

***

### hasConnectedTab

> **hasConnectedTab**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L117)

Whether an Okta tab is connected; export/preview are disabled when false.

***

### onError

> **onError**: (\`message\`) => \`void\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:119](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L119)

Report a user-facing error (or \`null\` to clear). Owned by the tab shell.

#### Parameters

##### message

\`string\` \\| \`null\`

#### Returns

\`void\`

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L125)

Whether the Export tab is the visible one. The tab stays mounted while hidden, and
the match-count probe re-fires on a new \`api\` identity; gating it keeps a hidden
tab from probing Okta. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useExportTab / ExportPhase

# Type Alias: ExportPhase

> **ExportPhase** = \`"pick"\` \\| \`"configure"\`

Defined in: [src/sidepanel/hooks/useExportTab.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useExportTab.ts#L129)

The \`pick\` (entity hub) or \`configure\` (build the export) phase.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useFirstRun / useFirstRun

# Function: useFirstRun()

> **useFirstRun**(): \`FirstRun\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L59)

Read both flags once on mount and expose the verbs that change them. Each
verb moves local state in the same tick it starts its write; a failed write
is logged by its store and the local state stands.

## Returns

\`FirstRun\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useFirstRun / FirstRun

# Interface: FirstRun

Defined in: [src/sidepanel/hooks/useFirstRun.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L39)

What useFirstRun returns.

## Properties

### greeting

> **greeting**: \`GreetingState\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L41)

The typed greeting's state.

***

### invite

> **invite**: \`InviteState\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L43)

The guide invitation's state.

***

### markPlayed

> **markPlayed**: () => \`void\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L45)

The show finished or was skipped: never play it again unasked.

#### Returns

\`void\`

***

### dismissInvite

> **dismissInvite**: () => \`void\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L47)

The reader declined the invitation.

#### Returns

\`void\`

***

### openGuide

> **openGuide**: () => \`void\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L49)

Open the guide's welcome chapter in a new tab, answering the invitation.

#### Returns

\`void\`

***

### replay

> **replay**: () => \`void\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L51)

Play the greeting and offer the invitation again — the ⌘K command.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useFirstRun / GreetingState

# Type Alias: GreetingState

> **GreetingState** = \`"unknown"\` \\| \`"play"\` \\| \`"played"\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L33)

Whether the typed greeting is still to play.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useFirstRun / InviteState

# Type Alias: InviteState

> **InviteState** = \`"unknown"\` \\| \`"open"\` \\| \`"answered"\`

Defined in: [src/sidepanel/hooks/useFirstRun.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFirstRun.ts#L36)

Whether the guide invitation is still on offer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useFly / useFly

# Function: useFly()

> **useFly**(): (\`from\`, \`to\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useFly.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useFly.ts#L72)

Bind a flight function to the reader's motion preference.

## Returns

\`fly(from, to)\`, which resolves when the ghost has landed — or at once
when the flight is skipped. Either way the caller reveals the destination
after it resolves.

(\`from\`, \`to\`) => \`Promise\`\\<\`void\`\\>

## Example

\`\`\`tsx
const fly = useFly();
await fly(pinButton, railToken);
setLanded(true); // the token's own \`animate-pop\` takes it from here
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupAccessGrants / useGroupAccessGrants

# Function: useGroupAccessGrants()

> **useGroupAccessGrants**(\`groupId\`, \`targetTabId?\`, \`enabled?\`): \`UseGroupAccessGrantsReturn\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:156](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L156)

Resolve what membership in a group grants: the apps it is assigned to, plus
any admin roles it carries.

## Parameters

### groupId

\`string\`

Group to look up.

### targetTabId?

\`number\`

Connected Okta tab id (the load no-ops when absent).

### enabled?

\`boolean\` = \`true\`

Whether the hosting tab is the visible one. The Group Detail
  view stays mounted while another top-level tab is selected, and a new
  \`targetTabId\` re-arms the load — so while this is \`false\` the load is
  **deferred, not dropped**, and runs once the view is on screen again.
  Defaults to \`true\`.

## Returns

\`UseGroupAccessGrantsReturn\`

The apps and roles axes, each with its own status — see
  UseGroupAccessGrantsReturn.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupAccessGrants / AppGrant

# Interface: AppGrant

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L35)

One app this group is assigned to, reduced to what the view shows.

Validated leniently against oktaAppListItemSchema — only \`id\` is
required — so an app row missing every optional field still renders (with an
id-derived fallback label) instead of vanishing.

## Properties

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L37)

Okta app id, used for the EntityLink deep link into the Apps tab.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L39)

Display label.

***

### name?

> \`optional\` **name?**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L46)

The app's Okta \`name\` — the app *type* key (\`oidc_client\`, \`salesforce\`),
not the display label. The Admin Console's app route is
\`/admin/app/{name}/instance/{id}\`, so the id alone cannot open the app.
Absent means the org reported no name and the link is withheld.

***

### status?

> \`optional\` **status?**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L51)

Okta lifecycle status (\`ACTIVE\`, \`INACTIVE\`, …), when the row reported one.
Absent is genuinely unknown — render nothing, not an "Unknown" badge.

***

### signOnMode?

> \`optional\` **signOnMode?**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L53)

Sign-on mode, when the row reported one. Same optionality contract as status.

***

### lastUpdated?

> \`optional\` **lastUpdated?**: \`Date\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L55)

When Okta last updated the app, when the row reported a parseable date.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupAccessGrants / RoleGrant

# Interface: RoleGrant

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L65)

One admin role granted to every member of this group.

Carries no resource scope: \`GET /api/v1/groups/{id}/roles\` reports the role
type but not which apps or groups it applies to. Render this as "a role is
granted", never as a fully-resolved permission.

## Properties

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L67)

Okta role assignment id. Not a navigable entity — roles have no detail view.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L69)

Role type label (e.g. "Application Administrator").


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupAccessGrants / UseGroupAccessGrantsReturn

# Interface: UseGroupAccessGrantsReturn

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L96)

Return shape of useGroupAccessGrants.

## Properties

### apps

> **apps**: \`AppGrant\`[]

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L98)

Apps this group is assigned to.

***

### appsStatus

> **appsStatus**: \`SourceStatus\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L100)

Status of the app-assignment read.

***

### appsError

> **appsError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L102)

Error message when the app-assignment read failed.

***

### roles

> **roles**: \`RoleGrant\`[]

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L104)

Admin roles granted to every member of this group.

***

### rolesStatus

> **rolesStatus**: \`RolesReadStatus\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:106](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L106)

Whether the admin-roles read could be completed. See RolesReadStatus.

***

### reload

> **reload**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:113](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L113)

Re-run both reads for the group currently held, ignoring the once-per-input
latch that governs the automatic load. The only re-run this hook exposes;
nothing re-runs on its own. Both axes return to their loading status
immediately.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupAccessGrants / RolesReadStatus

# Type Alias: RolesReadStatus

> **RolesReadStatus** = \`"loading"\` \\| \`"available"\` \\| \`"unavailable"\`

Defined in: [src/sidepanel/hooks/useGroupAccessGrants.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupAccessGrants.ts#L81)

Whether the admin-roles read could be completed.

- \`'loading'\` — the request is in flight.
- \`'available'\` — the read succeeded; \`roles\` is the confirmed (possibly
  empty) list.
- \`'unavailable'\` — the read failed (most commonly a \`403\`). \`roles\` is \`[]\`,
  which is **not** the same claim as \`'available'\` with an empty list.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupComparison / useGroupComparison

# Function: useGroupComparison()

> **useGroupComparison**(\`__namedParameters\`): \`UseGroupComparisonReturn\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L75)

Owns the Group Detail rung's group-comparison flow: the picker, its
type-ahead, and the chosen operand.

## Parameters

### \\_\\_namedParameters

\`UseGroupComparisonOptions\`

## Returns

\`UseGroupComparisonReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupComparison / UseGroupComparisonOptions

# Interface: UseGroupComparisonOptions

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L21)

Options for useGroupComparison.

## Properties

### group

> **group**: \`GroupSummary\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L23)

The group on screen — the first operand, and never a search hit.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L25)

Tab whose scheduler runs the group search and the comparison's member reads.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L27)

\`false\` while the Groups tab is hidden; suspends the type-ahead.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupComparison / UseGroupComparisonReturn

# Interface: UseGroupComparisonReturn

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L31)

Return shape of useGroupComparison.

## Properties

### isPicking

> **isPicking**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L33)

Whether the second-operand picker is open.

***

### openPicker

> **openPicker**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L35)

Open the picker on a clean slate.

#### Returns

\`void\`

***

### closePicker

> **closePicker**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L37)

Dismiss the picker without comparing.

#### Returns

\`void\`

***

### query

> **query**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L40)

Controlled type-ahead query.

***

### setQuery

> **setQuery**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L42)

Called with the new query on each keystroke.

#### Parameters

##### value

\`string\`

#### Returns

\`void\`

***

### results

> **results**: \`GroupSummary\`[]

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L44)

Hits, with the group being viewed already removed.

***

### isSearching

> **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L46)

True while a debounced search is in flight.

***

### searchError

> **searchError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L48)

Message from a failed search, or \`null\`.

***

### selected

> **selected**: \`GroupSummary\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L51)

The chosen second operand, before confirming.

***

### select

> **select**: (\`hit\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L53)

Choose a hit from the dropdown.

#### Parameters

##### hit

\`GroupSummary\`

#### Returns

\`void\`

***

### clearSelected

> **clearSelected**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L55)

Clear the chosen group and the query.

#### Returns

\`void\`

***

### confirm

> **confirm**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L57)

Confirm the pick: closes the picker and opens the comparison.

#### Returns

\`void\`

***

### comparedWith

> **comparedWith**: \`GroupSummary\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L60)

The group being compared against, or \`null\` when no comparison is open.

***

### closeComparison

> **closeComparison**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L62)

Close the comparison.

#### Returns

\`void\`

***

### memberCache

> **memberCache**: \`Map\`\\<\`string\`, \`OktaUser\`[]\\>

Defined in: [src/sidepanel/hooks/useGroupComparison.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupComparison.ts#L68)

Member cache for the comparison. \`compareGroups\` fills it as it reads and
\`GroupComparisonModal\` reads it back for the pairwise matrix. Mutated in
place; its identity never changes, so nothing re-renders off it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupContext / useGroupContext

# Function: useGroupContext()

> **useGroupContext**(\`page\`): \`UseGroupContextReturn\`

Defined in: [src/sidepanel/hooks/useGroupContext.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupContext.ts#L44)

Narrows a live page context to its group, if it is on a group page.

Takes the engine's result rather than starting one: two engines could disagree
about which tab was active. A failed probe yields \`pageType: 'unknown'\`, which
reports as \`groupInfo: null\` with \`connectionStatus: 'error'\`.

## Parameters

### page

\`OktaPageContext\`

The panel's single useOktaPageContext result.

## Returns

\`UseGroupContextReturn\`

The group plus the shared tab-context state; see \`UseGroupContextReturn\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupCopy / useGroupCopy

# Function: useGroupCopy()

> **useGroupCopy**(\`__namedParameters\`): \`UseGroupCopyReturn\`

Defined in: [src/sidepanel/hooks/useGroupCopy.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupCopy.ts#L63)

Owns copying a group onto either comparison user, with per-direction optimistic
re-bucketing.

\`addingGroupId\` is a GLOBAL single-flight lock (one add at a time across the whole
list, not per-row) — callers must gate every Add button on
\`disabled={addingGroupId !== null}\`, not just the row being added.

## Parameters

### \\_\\_namedParameters

\`UseGroupCopyOptions\`

## Returns

\`UseGroupCopyReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupFilters / useGroupFilters

# Function: useGroupFilters()

> **useGroupFilters**(\`__namedParameters\`): \`object\`

Defined in: [src/sidepanel/hooks/useGroupFilters.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupFilters.ts#L42)

Owns the six-axis filter/sort state and derives \`filteredGroups\`.

CHARACTERIZED: the live-mode branch returns \`liveSearchResults\` BY REFERENCE
(uncopied) — only the cached path copies before sorting. \`activeFilterCount\`
counts the 4 scalar filters + any push-app selection but NOT \`searchQuery\`, while
\`clearFilters\` DOES clear \`searchQuery\`. This inconsistency is intentional; do not
harmonize it.

## Parameters

### \\_\\_namedParameters

\`UseGroupFiltersOptions\`

## Returns

\`object\`

The filter/sort state and setters, plus derived \`filteredGroups\`,
\`activeFilterCount\`, \`availablePushApps\`, \`clearFilters\`, and \`toggleSort\`.

### searchQuery

> **searchQuery**: \`string\`

### setSearchQuery

> **setSearchQuery**: \`Dispatch\`\\<\`SetStateAction\`\\<\`string\`\\>\\>

### typeFilter

> **typeFilter**: \`string\`

### setTypeFilter

> **setTypeFilter**: \`Dispatch\`\\<\`SetStateAction\`\\<\`string\`\\>\\>

### sizeFilter

> **sizeFilter**: \`string\`

### setSizeFilter

> **setSizeFilter**: \`Dispatch\`\\<\`SetStateAction\`\\<\`string\`\\>\\>

### pushFilter

> **pushFilter**: \`PushFilter\`

### setPushFilter

> **setPushFilter**: \`Dispatch\`\\<\`SetStateAction\`\\<\`PushFilter\`\\>\\>

### pushAppFilter

> **pushAppFilter**: \`Set\`\\<\`string\`\\>

### setPushAppFilter

> **setPushAppFilter**: \`Dispatch\`\\<\`SetStateAction\`\\<\`Set\`\\<\`string\`\\>\\>\\>

### ruleFilter

> **ruleFilter**: \`RuleFilter\`

### setRuleFilter

> **setRuleFilter**: \`Dispatch\`\\<\`SetStateAction\`\\<\`RuleFilter\`\\>\\>

### sortBy

> **sortBy**: \`SortField\`

### sortDesc

> **sortDesc**: \`boolean\`

### filteredGroups

> **filteredGroups**: \`GroupSummary\`[]

### activeFilterCount

> **activeFilterCount**: \`number\`

### availablePushApps

> **availablePushApps**: \`object\`[]

### clearFilters

> **clearFilters**: () => \`void\`

#### Returns

\`void\`

### toggleSort

> **toggleSort**: (\`field\`) => \`void\`

#### Parameters

##### field

\`SortField\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupLiveSearch / useGroupLiveSearch

# Function: useGroupLiveSearch()

> **useGroupLiveSearch**(\`__namedParameters\`): \`object\`

Defined in: [src/sidepanel/hooks/useGroupLiveSearch.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupLiveSearch.ts#L52)

Owns the live (per-keystroke) group search: the query, its results, the spinner
flag, and the 300ms debounce.

\`handleLiveSearch\` is memoized on \`[targetTabId, setError]\` (both stable — the
error setter is the shell's raw useState setter), so the search effect keyed on
its identity only re-fires when \`targetTabId\` changes. Do NOT widen these deps or
pass an inline \`onError\` — an unstable handler makes the effect re-fire the
search on every render.

One \`GET /api/v1/groups?q=…&limit=20&expand=stats\` per settle, routed through the
scheduler at \`interactive\` priority so a typed search jumps the soft cooldown.

CHARACTERIZED: no stale-response guard — the last-resolving request wins.

## Parameters

### \\_\\_namedParameters

\`UseGroupLiveSearchOptions\`

## Returns

\`object\`

\`liveSearchQuery\` + \`setLiveSearchQuery\` (drives the debounce),
\`liveSearchResults\`, the \`isLiveSearching\` flag, and \`resetLiveSearch\`.

### liveSearchQuery

> **liveSearchQuery**: \`string\`

### setLiveSearchQuery

> **setLiveSearchQuery**: \`Dispatch\`\\<\`SetStateAction\`\\<\`string\`\\>\\>

### liveSearchResults

> **liveSearchResults**: \`GroupSummary\`[]

### isLiveSearching

> **isLiveSearching**: \`boolean\`

### resetLiveSearch

> **resetLiveSearch**: () => \`void\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupMembersCache / useGroupMembersCache

# Function: useGroupMembersCache()

> **useGroupMembersCache**(\`api\`): \`object\`

Defined in: [src/sidepanel/hooks/useGroupMembersCache.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupMembersCache.ts#L31)

Owns the shared \`groupMembersCache\` that export and compare build up.

\`apiRef\` is assigned during render, not in an effect: \`useOktaApi\` returns
fresh method identities every render, so a ref updated in an effect would lag
by one commit and the first fetch after a \`targetTabId\` change would call a
stale closure. Do not move it into a \`useEffect\`.

## Parameters

### api

#### isLoading

\`boolean\`

#### isCancelled

\`boolean\`

#### cancelOperation

() => \`void\`

#### makeApiRequest

(\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\> = \`coreApi.makeApiRequest\`

#### runOperation

\\<\`T\`, \`R\`\\>(\`name\`, \`items\`, \`task\`, \`options?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`T\`, \`R\`\\>\\> = \`coreApi.runOperation\`

#### getCurrentUser

() => \`Promise\`\\<\`Actor\`\\> = \`coreApi.getCurrentUser\`

#### getAllGroupMembers

(\`groupId\`, \`options\`) => \`Promise\`\\<\`OktaUser\`[]\\> = \`groupMemberOps.getAllGroupMembers\`

#### getMembershipRuleProof

(\`groupId\`, \`userId\`) => \`Promise\`\\<\`MemberRuleAttribution\`\\> = \`groupMemberOps.getMembershipRuleProof\`

#### removeUserFromGroup

(\`groupId\`, \`groupName\`, \`user\`, \`skipUndoLog\`, \`planId?\`) => \`Promise\`\\<\`RequestResult\`\\> = \`groupMemberOps.removeUserFromGroup\`

#### removeUserFromGroups

(\`userId\`, \`groupIds\`, \`onProgress?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`string\`, \`void\`\\>\\> = \`groupMemberOps.removeUserFromGroups\`

#### addUserToGroup

(\`groupId\`, \`groupName\`, \`user\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`groupMemberOps.addUserToGroup\`

#### removeDeprovisioned

(...\`args\`) => \`Promise\`\\<\`void\`\\>

#### getAllGroups

(\`onProgress?\`) => \`Promise\`\\<\`OktaGroup\`[]\\> = \`groupDiscoveryOps.getAllGroups\`

#### getGroupMemberCount

(\`groupId\`) => \`Promise\`\\<\`number\`\\> = \`groupDiscoveryOps.getGroupMemberCount\`

#### ensureGroupRulesLoaded

() => \`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\> = \`groupDiscoveryOps.ensureGroupRulesLoaded\`

#### getGroupRulesForGroup

(\`groupId\`) => \`Promise\`\\<\`FormattedRule\`[]\\> = \`groupDiscoveryOps.getGroupRulesForGroup\`

#### executeBulkOperation

(\`operation\`, \`onProgress?\`) => \`Promise\`\\<\`BulkGroupResult\`[]\\> = \`groupBulkOps.executeBulkOperation\`

#### searchGroups

(\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`groupDiscoveryOps.searchGroups\`

#### getGroupById

(\`groupId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description\`: \`string\`; \`type\`: \`string\`; \\} \\| \`null\`\\> = \`groupDiscoveryOps.getGroupById\`

#### getUserLastLogin

(\`userId\`) => \`Promise\`\\<\`Date\` \\| \`null\`\\> = \`userOps.getUserLastLogin\`

#### getUserApps

(\`userId\`) => \`Promise\`\\<\`UserAppsResult\`\\> = \`userOps.getUserApps\`

#### batchGetUserDetails

(\`userIds\`, \`onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`OktaUser\`\\>\\> = \`userOps.batchGetUserDetails\`

#### scanGroupMfa

(\`userIds\`, \`_onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`MemberMfaResult\`\\>\\> = \`userOps.scanGroupMfa\`

#### getUserGroupMemberships

(\`userId\`) => \`Promise\`\\<\`number\`\\> = \`userOps.getUserGroupMemberships\`

#### searchUsers

(\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`userOps.searchUsers\`

#### getUserById

(\`userId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`email\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`login\`: \`string\`; \`status\`: \`string\`; \\} \\| \`null\`\\> = \`userOps.getUserById\`

#### getUserProfileSchema

() => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`definitions\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`base\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \`custom\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \`properties\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`profile\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\> \\| \`null\`\\> = \`profileOps.getUserProfileSchema\`

#### getUserRaw

(\`userId\`, \`options\`) => \`Promise\`\\<\`OktaUser\` \\| \`null\`\\> = \`profileOps.getUserRaw\`

#### loadQualificationSubject

(\`userId\`) => \`Promise\`\\<\`QualificationSubjectResult\`\\> = \`qualificationSubjectOps.loadQualificationSubject\`

#### updateUserProfile

(\`userId\`, \`patch\`) => \`Promise\`\\<\`UpdateProfileResult\`\\> = \`profileOps.updateUserProfile\`

#### searchApps

(\`query\`) => \`Promise\`\\<\`AppSummary\`[]\\> = \`appOps.searchApps\`

#### suspendUser

(\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.suspendUser\`

#### unsuspendUser

(\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.unsuspendUser\`

#### resetPassword

(\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.resetPassword\`

#### setUserPassword

(\`userId\`, \`password\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.setUserPassword\`

#### expirePassword

(\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePassword\`

#### expirePasswordWithTempPassword

(\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePasswordWithTempPassword\`

#### getAppById

(\`appId\`) => \`Promise\`\\<\`AppLookup\`\\> = \`appOps.getAppById\`

#### getAppAssignmentCounts

(\`appId\`) => \`Promise\`\\<\`AppAssignmentCounts\` \\| \`null\`\\> = \`appOps.getAppAssignmentCounts\`

#### getAppGroupAssignments

(\`appId\`, \`planId?\`) => \`Promise\`\\<\`string\`[] \\| \`null\`\\> = \`appOps.getAppGroupAssignments\`

#### fetchAppAssertion

(\`appId\`, \`oktaOrigin?\`) => \`Promise\`\\<\`SamlTraceResult\`\\> = \`samlOps.fetchAppAssertion\`

#### listPolicies

(\`type\`) => \`Promise\`\\<\`PolicyListResult\`\\> = \`policyOps.listPolicies\`

#### getPolicyRules

(\`policyId\`) => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`conditions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`actions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\> = \`policyOps.getPolicyRules\`

#### getAppAccessPolicyId

(\`appId\`) => \`Promise\`\\<\`string\` \\| \`null\`\\> = \`policyOps.getAppAccessPolicyId\`

#### fetchExportRows

\\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`, \`onPage?\`) => \`Promise\`\\<\`FetchAllResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchAllRows\`

#### fetchSelectionExportRows

\\<\`Row\`\\>(\`descriptor\`, \`basket\`, \`onProgress?\`) => \`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchSelectionRows\`

#### countExportRows

\\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`) => \`Promise\`\\<\`CountResult\`\\> = \`exportEngineOps.countRows\`

#### runExport

\\<\`Row\`\\>(\`args\`) => \`Promise\`\\<\`void\`\\> = \`exportEngineOps.runExport\`

#### compareGroups

(\`groups\`, \`onProgress?\`, \`memberCache?\`) => \`Promise\`\\<\`GroupComparisonResult\`\\> = \`groupAnalysisOps.compareGroups\`

#### searchUserAcrossGroups

(\`query\`, \`groupMembersCache\`, \`groupNames\`) => \`object\`[] = \`groupAnalysisOps.searchUserAcrossGroups\`

#### captureRuleImpact

(\`rule\`, \`opts?\`) => \`Promise\`\\<\`RuleImpactSummary\`\\> = \`ruleImpactOps.captureRuleImpact\`

#### getRawGroupRule

(\`ruleId\`) => \`Promise\`\\<\`OktaGroupRule\` \\| \`null\`\\> = \`ruleWriteOps.getRawGroupRule\`

#### createGroupRule

(\`payload\`) => \`Promise\`\\<\`CreateRuleResult\`\\> = \`ruleWriteOps.createGroupRule\`

#### updateGroupRule

(\`ruleId\`, \`body\`) => \`Promise\`\\<\`RuleUpdateResult\`\\> = \`ruleWriteOps.updateGroupRule\`

#### deleteGroupRule

(\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deleteGroupRule\`

#### activateGroupRule

(\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.activateGroupRule\`

#### deactivateGroupRule

(\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deactivateGroupRule\`

## Returns

\`object\`

### groupMembersCache

> **groupMembersCache**: \`Map\`\\<\`string\`, \`OktaUser\`[]\\>

### fetchMembers

> **fetchMembers**: (\`groupId\`) => \`Promise\`\\<\`OktaUser\`[]\\>

#### Parameters

##### groupId

\`string\`

#### Returns

\`Promise\`\\<\`OktaUser\`[]\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupNameResolver / useGroupNameResolver

# Function: useGroupNameResolver()

> **useGroupNameResolver**(\`options\`): \`GroupNameResolution\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L95)

A resolver for the group ids one surface is about to render.

## Parameters

### options

\`UseGroupNameResolverOptions\`

See UseGroupNameResolverOptions.

## Returns

\`GroupNameResolution\`

The resolver and the request function; see GroupNameResolution.

## Example

\`\`\`tsx
const { resolveGroupName, request } = useGroupNameResolver({ targetTabId, oktaOrigin });
useEffect(() => request(extractReferencedGroupIds(rule.conditionExpression)), [rule]);
return <RuleExpressionText text={expression} resolveGroupName={resolveGroupName} />;
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupNameResolver / GroupNameResolution

# Interface: GroupNameResolution

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L44)

What useGroupNameResolver hands a rendering surface.

## Properties

### resolveGroupName

> **resolveGroupName**: \`GroupNameResolver\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L50)

Names one group id, or \`undefined\` when nothing known names it yet. Stable
across renders while the underlying names are unchanged: \`RuleExpressionText\`
memoises its tokenisation on this function's identity (\`I-037\`).

***

### request

> **request**: (\`groupIds\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L56)

Ask for the ids a surface is about to print, so the ones nothing names yet
can be fetched. Safe to call on every render with the same ids: already
known, already cached, and already in-flight ids are all no-ops.

#### Parameters

##### groupIds

readonly \`string\`[]

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupNameResolver / UseGroupNameResolverOptions

# Interface: UseGroupNameResolverOptions

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L60)

Options for useGroupNameResolver.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L66)

The tab whose content script issues the fallback fetch. \`null\`/\`undefined\`
before one is attached, which disables rung 3 — the two lower rungs still
answer, so a warm snapshot names groups with no tab at all.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L68)

The connected org's origin — what the snapshot's group rows are scoped by.

***

### known?

> \`optional\` **known?**: \`ReadonlyMap\`\\<\`string\`, \`string\`\\>

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L74)

Names the caller already holds, id → name. Preferred over every other rung:
these are live rows rather than walked ones. Rebuild it with \`useMemo\` — a
fresh object each render re-seeds the resolver each render.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupNameResolver.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupNameResolver.ts#L79)

Whether this surface is on screen. A hidden tab stays mounted, and must not
read the snapshot or issue a fetch.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupPicker / useGroupPicker

# Function: useGroupPicker()

> **useGroupPicker**(\`__namedParameters\`): \`UseGroupPickerReturn\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L46)

Hook behind \`GroupPickerModal\`.

## Parameters

### \\_\\_namedParameters

\`UseGroupPickerOptions\`

## Returns

\`UseGroupPickerReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupPicker / UseGroupPickerOptions

# Interface: UseGroupPickerOptions

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L20)

Options for useGroupPicker.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L22)

Tab whose scheduler runs the search; \`null\` when none.

***

### onPick

> **onPick**: (\`group\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L24)

Called with the picked group; the modal closes and its query clears.

#### Parameters

##### group

\`GroupSearchResult\`

#### Returns

\`void\`

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L26)

Whether the owning view is the visible one. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupPicker / UseGroupPickerReturn

# Interface: UseGroupPickerReturn

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L30)

Return shape of useGroupPicker.

## Properties

### isOpen

> **isOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L31)

***

### open

> **open**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L32)

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L33)

#### Returns

\`void\`

***

### query

> **query**: \`string\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L34)

***

### setQuery

> **setQuery**: (\`query\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L35)

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

***

### results

> **results**: \`GroupSearchResult\`[]

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L36)

***

### isSearching

> **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L37)

***

### searchError

> **searchError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L38)

***

### pick

> **pick**: (\`group\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupPicker.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupPicker.ts#L40)

Pick a group: closes the modal, clears the query, fires \`onPick\`.

#### Parameters

##### group

\`GroupSearchResult\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupRuleReferences / useGroupRuleReferences

# Function: useGroupRuleReferences()

> **useGroupRuleReferences**(\`groupId\`, \`targetTabId?\`, \`enabled?\`): \`UseGroupRuleReferencesReturn\`

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L66)

Resolve the rules that consult a group in their condition expression.

Only id-taking membership functions count — \`isMemberOfGroup(...)\` and
\`isMemberOfAnyGroup(...)\`. Name-based variants
(\`isMemberOfGroupName\`, \`…NameStartsWith\`, …) are deliberately **not** matched,
because a name can resolve to groups from other sources; UI copy must not claim
the list is exhaustive.

## Parameters

### groupId

\`string\`

Group to look up.

### targetTabId?

\`number\`

Connected Okta tab id (the load no-ops when absent).

### enabled?

\`boolean\` = \`true\`

Whether the hosting tab is the visible one. The Group Detail
  view stays mounted while another top-level tab is selected, and a new
  \`targetTabId\` re-arms the load — so while this is \`false\` the load is
  **deferred, not dropped**, and runs once the view is on screen again.
  Defaults to \`true\`.

## Returns

\`UseGroupRuleReferencesReturn\`

The referencing rules plus the load status/error.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupRuleReferences / UseGroupRuleReferencesReturn

# Interface: UseGroupRuleReferencesReturn

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L33)

Return shape of useGroupRuleReferences.

## Properties

### rules

> **rules**: \`FormattedRule\`[]

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L35)

Rules whose condition expression references the group by id.

***

### status

> **status**: \`SourceStatus\`

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L37)

Async status of the org-wide rules load backing the list.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L39)

Error message when the rules listing could not be loaded.

***

### reload

> **reload**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L45)

Re-run the reference resolution for the group currently held, ignoring the
once-per-input latch that governs the automatic load. The only re-run this
hook exposes; a warm \`RulesCache\` serves it without a request.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupRuleReferences / ReferencingRule

# Type Alias: ReferencingRule

> **ReferencingRule** = \`FormattedRule\`

Defined in: [src/sidepanel/hooks/useGroupRuleReferences.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupRuleReferences.ts#L30)

A rule that names the group in its condition. The full display model, not a
narrowing of it — as with
module:sidepanel/hooks/useGroupSource.FeedingRule.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSelection / useGroupSelection

# Function: useGroupSelection()

> **useGroupSelection**(\`groups\`): \`object\`

Defined in: [src/sidepanel/hooks/useGroupSelection.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSelection.ts#L36)

Owns group selection. \`selectedGroups\` derives from the full \`groups\` list, never
the filtered view, so hidden picks stay selected across filtering and live/cached
mode switches. Do not re-scope this to \`filteredGroups\`.

## Parameters

### groups

\`GroupSummary\`[]

The full group list selected ids are resolved against.

## Returns

\`object\`

\`selectedGroupIds\`, the resolved \`selectedGroups\`, and the
\`toggleSelect\` / \`replaceSelection\` / \`deselectAll\` mutators.

### selectedGroupIds

> **selectedGroupIds**: \`Set\`\\<\`string\`\\> = \`selectedIds\`

### selectedGroups

> **selectedGroups**: \`GroupSummary\`[] = \`selectedEntities\`

### toggleSelect

> **toggleSelect**: (\`id\`) => \`void\`

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

### replaceSelection

> **replaceSelection**: (\`ids\`) => \`AddOutcome\`

#### Parameters

##### ids

\`string\`[]

#### Returns

\`AddOutcome\`

### deselectAll

> **deselectAll**: () => \`void\`

#### Returns

\`void\`

## Remarks

\`replaceSelection\` returns the basket's outcome rather than \`void\`. A
Select-all that would cross the basket's cap adds **nothing** instead of
truncating, and the caller is the only thing that can report that on screen.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSource / useGroupSource

# Function: useGroupSource()

> **useGroupSource**(\`targetTabId?\`): \`UseGroupSourceReturn\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:162](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L162)

Manage the group-source insight lifecycle for a single group.

## Parameters

### targetTabId?

\`number\`

Connected Okta tab id (operations no-op when absent).

## Returns

\`UseGroupSourceReturn\`

State plus \`open\`/\`refreshRules\`/\`analyzeMembers\`/\`close\` controls.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSource / UseGroupSourceReturn

# Interface: UseGroupSourceReturn

Defined in: [src/sidepanel/hooks/useGroupSource.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L95)

Return shape of useGroupSource.

## Properties

### group

> **group**: \`GroupSummary\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L97)

The group under examination, or null when closed.

***

### feedingRules

> **feedingRules**: \`FormattedRule\`[]

Defined in: [src/sidepanel/hooks/useGroupSource.ts:99](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L99)

Rules that assign users to the group.

***

### rulesStatus

> **rulesStatus**: \`SourceStatus\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L101)

Status of the feeding-rules load.

***

### breakdown

> **breakdown**: \`MemberSourceBreakdown\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L103)

Manual-vs-rule member breakdown once analyzed.

***

### memberStatus

> **memberStatus**: \`SourceStatus\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L105)

Status of the (gated) member analysis.

***

### memberSourceIndex

> **memberSourceIndex**: \`MemberSourceIndex\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:114](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L114)

Per-member source facts for the analyzed roster, or \`null\` before the analysis
has run. Computed from the same members and rules as
UseGroupSourceReturn.breakdown and sharing its verdict, so the meter
and a list filtered through this index cannot disagree. Held in state rather
than in \`memberSourceCache\`, which serves row meters that have no use for a
per-user map.

***

### provisionalRoster

> **provisionalRoster**: \`ProvisionalRoster\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:120](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L120)

Rows to paint while \`memberStatus\` is \`'loading'\` — see
ProvisionalRoster. \`null\` when there is nothing yet, and always once
the analysis settles.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:122](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L122)

Error message for whichever step failed.

***

### open

> **open**: (\`group\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L124)

Open the insight for a group and load its feeding rules.

#### Parameters

##### group

\`GroupSummary\`

#### Returns

\`void\`

***

### refreshRules

> **refreshRules**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L139)

Reload only the feeding rules for the group already open, leaving the
member-source analysis as it stands.

UseGroupSourceReturn.open is not a refresh — it resets \`breakdown\`,
\`memberSourceIndex\` and \`memberStatus\` — so using it to pick up a rule the
admin just created would discard a member walk they already paid for. A rules
write changes the rules, not the roster.

One cache-backed \`getGroupRulesForGroup\`; it sees the new rule because the
write itself dropped the org-wide \`RulesCache\` snapshot. A no-op while the hook
holds no group, and late responses are dropped by the same \`runIdRef\` check
every other load here uses.

#### Returns

\`void\`

***

### analyzeMembers

> **analyzeMembers**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L145)

Run the gated member-source analysis for the open group. Both reads are
cache-backed, so a repeat analysis of a group analyzed earlier this session
costs no scheduler requests.

#### Returns

\`void\`

***

### resummarize

> **resummarize**: (\`members\`) => \`void\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:151](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L151)

Recompute the split from a roster that just changed, without touching Okta.
\`breakdown\` is React state, so invalidating the cache after a membership write
is not enough on its own. A no-op before any analysis has run.

#### Parameters

##### members

\`OktaUser\`[]

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:153](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L153)

Close and reset.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSource / FeedingRule

# Type Alias: FeedingRule

> **FeedingRule** = \`FormattedRule\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L81)

A rule whose \`assignUserToGroups\` targets the open group.

The full \`FormattedRule\` display model, not a narrowing of it: it is what
\`getGroupRulesForGroup\` already returns and what \`RuleCard\` renders, so the
group rung can show the rule itself rather than a name and a status.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSource / ProvisionalRoster

# Type Alias: ProvisionalRoster

> **ProvisionalRoster** = \\{ \`kind\`: \`"streaming"\`; \`members\`: \`OktaUser\`[]; \\} \\| \\{ \`kind\`: \`"stale"\`; \`members\`: \`OktaUser\`[]; \`readAt\`: \`number\`; \\}

Defined in: [src/sidepanel/hooks/useGroupSource.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L90)

Rows the Members tab may paint while the analysis is still \`'loading'\`. Never
the current roster: a \`streaming\` set is a prefix of it, and a \`stale\` set is
the roster as it stood at \`readAt\`, shown while one walk refreshes it. Nothing
that states a fact about the whole group (a count, the source split, a verb's
scope) may read either.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupSource / SourceStatus

# Type Alias: SourceStatus

> **SourceStatus** = \`"idle"\` \\| \`"loading"\` \\| \`"done"\` \\| \`"error"\`

Defined in: [src/sidepanel/hooks/useGroupSource.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupSource.ts#L72)

Async status of a load step.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupUserCheck / useGroupUserCheck

# Function: useGroupUserCheck()

> **useGroupUserCheck**(\`__namedParameters\`): \`UseGroupUserCheckReturn\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L51)

Hook behind the group rung's "Check membership" verb and its section.

## Parameters

### \\_\\_namedParameters

\`UseGroupUserCheckOptions\`

## Returns

\`UseGroupUserCheckReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupUserCheck / UseGroupUserCheckOptions

# Interface: UseGroupUserCheckOptions

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L23)

Options for useGroupUserCheck.

## Properties

### group

> **group**: \`GroupSummary\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L24)

***

### feedingRules

> **feedingRules**: readonly \`FormattedRule\`[]

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L25)

***

### rulesStatus

> **rulesStatus**: \`SourceStatus\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L26)

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L28)

\`null\` when no Okta tab is available; the verb is then not offered.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L30)

Whether the owning tab is visible; gates the picker's search.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupUserCheck / UseGroupUserCheckReturn

# Interface: UseGroupUserCheckReturn

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L41)

Return shape of useGroupUserCheck.

## Properties

### picker

> **picker**: \`UseUserPickerReturn\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L42)

***

### subject

> **subject**: \`QualificationSubjectState\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L43)

***

### check

> **check**: \`GroupUserCheck\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L44)

***

### openPicker

> **openPicker**: (() => \`void\`) \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L46)

Open the picker. \`undefined\` with no tab — the verb is omitted, never disabled.

***

### clear

> **clear**: () => \`void\`

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L47)

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupUserCheck / GroupUserCheck

# Type Alias: GroupUserCheck

> **GroupUserCheck** = \\{ \`kind\`: \`"none"\`; \\} \\| \\{ \`kind\`: \`"pending"\`; \\} \\| \\{ \`kind\`: \`"verdict"\`; \`verdict\`: \`GroupUserVerdict\`; \\}

Defined in: [src/sidepanel/hooks/useGroupUserCheck.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupUserCheck.ts#L34)

The answer, or why there is none yet.

## Union Members

### Type Literal

\\{ \`kind\`: \`"none"\`; \\}

***

### Type Literal

\\{ \`kind\`: \`"pending"\`; \\}

Subject loaded, feeding rules still loading. Never a verdict.

***

### Type Literal

\\{ \`kind\`: \`"verdict"\`; \`verdict\`: \`GroupUserVerdict\`; \\}


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupsLoader / useGroupsLoader

# Function: useGroupsLoader()

> **useGroupsLoader**(\`__namedParameters\`): \`UseGroupsLoaderResult\`

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L78)

Read the org's groups from the snapshot, rule-annotated and ready for the list.

## Parameters

### \\_\\_namedParameters

\`UseGroupsLoaderOptions\`

## Returns

\`UseGroupsLoaderResult\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useGroupsLoader / UseGroupsLoaderResult

# Interface: UseGroupsLoaderResult

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L50)

What useGroupsLoader returns.

## Properties

### groups

> **groups**: \`GroupSummary\`[]

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L52)

The org's groups, rule-annotated, as far as the snapshot has them.

***

### loading

> **loading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L54)

\`true\` while a sync is in flight.

***

### complete

> **complete**: \`boolean\`

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L59)

Whether the snapshot's last group walk finished. \`false\` means the list is a
genuine prefix of the org, not the whole of it.

***

### lastFullWalkAt

> **lastFullWalkAt**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L61)

Epoch millis the groups were last fully walked, or \`null\`.

***

### loadAllGroups

> **loadAllGroups**: (\`force?\`, \`options?\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useGroupsLoader.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useGroupsLoader.ts#L72)

Ask the background to bring this org up to date.

#### Parameters

##### force?

\`boolean\`

Skip the cheap delta/drift modes and walk the org in full;
what a user-pressed **Refresh** means. Leave it off for "get me the groups"
so the freshness ladder picks the cheapest honest mode.

##### options?

###### silent?

\`boolean\`

For a sync the user did not ask for (the tab's
activation top-up): a failure is logged, not bannered, and an existing banner
is left alone. A success repaints exactly as a loud load does.

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHoleCandidates / useHoleCandidates

# Function: useHoleCandidates()

> **useHoleCandidates**(\`options\`): \`UseHoleCandidatesResult\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L103)

Candidates for one hole, cheapest source first.

## Parameters

### options

\`UseHoleCandidatesOptions\`

See UseHoleCandidatesOptions.

## Returns

\`UseHoleCandidatesResult\`

The candidates and whether a search is running.

## Example

\`\`\`tsx
const { candidates } = useHoleCandidates({
  kind: hole?.kind ?? null, query: hole?.query ?? '',
  tabEntity, targetTabId, oktaOrigin, enabled: isActive,
});
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHoleCandidates / TabEntity

# Interface: TabEntity

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L52)

The entity the connected Okta tab is showing, when it is showing one.

## Properties

### kind

> \`readonly\` **kind**: \`HoleKind\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L54)

What it is.

***

### id

> \`readonly\` **id**: \`string\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L56)

Its Okta id.

***

### label

> \`readonly\` **label**: \`string\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L58)

What to call it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHoleCandidates / UseHoleCandidatesOptions

# Interface: UseHoleCandidatesOptions

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L62)

Options for useHoleCandidates.

## Properties

### kind

> \`readonly\` **kind**: \`HoleKind\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L64)

What the hole wants, or \`null\` when the caret is not in one.

***

### query

> \`readonly\` **query**: \`string\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L66)

What has been typed into the hole so far.

***

### tabEntity?

> \`readonly\` \`optional\` **tabEntity?**: \`TabEntity\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L68)

The live tab's entity, passed down rather than re-detected here.

***

### targetTabId

> \`readonly\` **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L70)

Connected Okta tab, or \`null\`. No tab, no search.

***

### oktaOrigin?

> \`readonly\` \`optional\` **oktaOrigin?**: \`string\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L72)

Org origin, for the API facade.

***

### enabled

> \`readonly\` **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L74)

Whether the Explorer is the visible tab. A hidden tab searches nothing.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHoleCandidates / UseHoleCandidatesResult

# Interface: UseHoleCandidatesResult

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L78)

What useHoleCandidates returns.

## Properties

### candidates

> \`readonly\` **candidates**: readonly \`HoleCandidate\`[]

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L80)

Everything found, from every source, for the current hole.

***

### isSearching

> \`readonly\` **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHoleCandidates.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHoleCandidates.ts#L82)

Whether a request is in flight.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomeAsk / useHomeAsk

# Function: useHomeAsk()

> **useHomeAsk**(\`options\`): \`UseHomeAsk\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L124)

Drive the Ask card.

## Parameters

### options

\`UseHomeAskOptions\`

See UseHomeAskOptions.

## Returns

\`UseHomeAsk\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomeAsk / UseHomeAsk

# Interface: UseHomeAsk

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L52)

What useHomeAsk returns.

## Properties

### state

> **state**: \`AskState\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L54)

The sentence and run.

***

### verbs

> **verbs**: readonly \`VerbId\`[]

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L56)

The verbs the strip offers — only those with an engine.

***

### ready

> **ready**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L58)

Whether the current sentence can run.

***

### cost

> **cost**: \`string\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L60)

What running the sentence will spend, in words (ADR-0007).

***

### chips

> **chips**: \`AskPrefill\`[]

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L62)

Follow-ups to a settled answer.

***

### history

> **history**: \`AskHistoryEntry\`[]

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L64)

Questions asked recently in this org, newest first.

***

### suggestions

> **suggestions**: \`Suggestion\`[]

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L66)

What the open slot's picker offers before the reader types.

***

### pickVerb

> **pickVerb**: (\`verb\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L67)

#### Parameters

##### verb

\`VerbId\`

#### Returns

\`void\`

***

### fill

> **fill**: (\`slot\`, \`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L68)

#### Parameters

##### slot

\`SlotId\`

##### value

\`SlotValue\`

#### Returns

\`void\`

***

### clear

> **clear**: (\`slot\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L69)

#### Parameters

##### slot

\`SlotId\`

#### Returns

\`void\`

***

### focusSlot

> **focusSlot**: (\`slot\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L70)

#### Parameters

##### slot

\`SlotId\` \\| \`null\`

#### Returns

\`void\`

***

### run

> **run**: () => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L71)

#### Returns

\`void\`

***

### ask

> **ask**: (\`prefill\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L73)

Land a question (a chip, a card, a history row), running it when it is complete.

#### Parameters

##### prefill

\`AskPrefill\`

#### Returns

\`void\`

***

### attributes

> **attributes**: \`AttributeList\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L75)

The org's attributes, read once a predicate slot opens.

***

### retryAttributes

> **retryAttributes**: () => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L77)

Read the attributes again after a failed read.

#### Returns

\`void\`

***

### scoped

> **scoped**: \`ScopedChoices\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L79)

What the open slot's picker offers when a card narrowed it; \`none\` otherwise.

***

### unscope

> **unscope**: () => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L81)

Drop the narrowing, so the open slot offers everything.

#### Returns

\`void\`

***

### tap

> **tap**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L83)

Tap a value inside the shown answer, or untap it with \`null\`; the chips follow it.

#### Parameters

##### value

\`SlotValue\` \\| \`null\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomeAsk / UseHomeAskOptions

# Interface: UseHomeAskOptions

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L38)

Inputs to useHomeAsk.

## Properties

### isActive

> **isActive**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L40)

Whether Home is on screen. Gates the page sync and the history read.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L42)

Tab holding the Okta session; \`null\` when none is connected.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L44)

Org origin: scopes the history and the schema cache.

***

### page

> **page**: \`EntityRef\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L46)

The entity the live Okta tab is on, if a verb can take it.

***

### remembered

> **remembered**: \`Pick\`\\<\`SuggestionSources\`, \`"pinned"\` \\| \`"recent"\`\\>

Defined in: [src/sidepanel/hooks/useHomeAsk.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomeAsk.ts#L48)

Pinned and recent entities, for the picker's suggestions.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomePinned / useHomePinned

# Function: useHomePinned()

> **useHomePinned**(\`options\`): \`HomePinned\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L71)

Drive the Pinned card.

## Parameters

### options

\`UseHomePinnedOptions\`

See UseHomePinnedOptions.

## Returns

\`HomePinned\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomePinned / HomePinned

# Interface: HomePinned

Defined in: [src/sidepanel/hooks/useHomePinned.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L27)

What useHomePinned returns.

## Properties

### total

> **total**: \`number\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L29)

How many pins there are, whatever the filter shows.

***

### kinds

> **kinds**: \`WorkingSetKind\`[]

Defined in: [src/sidepanel/hooks/useHomePinned.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L31)

The kinds present among the pins, in first-pinned order.

***

### filter

> **filter**: \`PinFilter\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L33)

The filter in force; \`all\` when the chosen kind has no pins left.

***

### setFilter

> **setFilter**: (\`filter\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L35)

Choose a filter.

#### Parameters

##### filter

\`PinFilter\`

#### Returns

\`void\`

***

### shown

> **shown**: \`WorkingSetRef\`[]

Defined in: [src/sidepanel/hooks/useHomePinned.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L37)

The pins the filter shows, in pinned order.

***

### selected

> **selected**: \`WorkingSetRef\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L39)

The selected pin, or \`null\` with none shown.

***

### select

> **select**: (\`pin\`) => \`void\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L41)

Select a pin.

#### Parameters

##### pin

\`WorkingSetRef\`

#### Returns

\`void\`

***

### detail

> **detail**: \`EntityFactsRead\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L43)

The selected pin's facts.

***

### readable

> **readable**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L45)

Whether a pin can be read now — Home on screen with a connected Okta tab.

***

### asks

> **asks**: \`AskPrefill\`[]

Defined in: [src/sidepanel/hooks/useHomePinned.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L47)

The questions the selected pin can start.

***

### unpin

> **unpin**: \`UnpinUndo\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L49)

Unpin, with Undo.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomePinned / UseHomePinnedOptions

# Interface: UseHomePinnedOptions

Defined in: [src/sidepanel/hooks/useHomePinned.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L53)

Options for useHomePinned.

## Properties

### api

> **api**: \`EntityFactsApi\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L55)

The scheduler-routed transport.

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L57)

The connected org.

***

### workingSet

> **workingSet**: \`UnpinTarget\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L59)

The org's working set.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L61)

Whether Home is on screen with a connected Okta tab.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useHomePinned / PinFilter

# Type Alias: PinFilter

> **PinFilter** = \`WorkingSetKind\` \\| \`"all"\`

Defined in: [src/sidepanel/hooks/useHomePinned.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useHomePinned.ts#L24)

A kind filter: one kind, or every pin.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useIntentPrefetch / useIntentPrefetch

# Function: useIntentPrefetch()

> **useIntentPrefetch**(\`onIntent\`): \`IntentHandlers\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L43)

Read intent off a control and call \`onIntent\` once it has dwelt for
INTENT\\_DWELL\\_MS.

## Parameters

### onIntent

(() => \`void\`) \\| \`undefined\`

Called once per dwell. \`undefined\` disarms the hook: the
  handlers it returns are then no-ops, so a caller can gate intent without
  unmounting anything.

## Returns

\`IntentHandlers\`

Handlers to spread onto the control; stable across renders.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useIntentPrefetch / IntentHandlers

# Interface: IntentHandlers

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L27)

Event handlers to spread onto the control whose intent is being read.

## Properties

### onPointerEnter

> **onPointerEnter**: () => \`void\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L28)

#### Returns

\`void\`

***

### onPointerLeave

> **onPointerLeave**: () => \`void\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L29)

#### Returns

\`void\`

***

### onFocus

> **onFocus**: () => \`void\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L30)

#### Returns

\`void\`

***

### onBlur

> **onBlur**: () => \`void\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L31)

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useIntentPrefetch / INTENT\\_DWELL\\_MS

# Variable: INTENT\\_DWELL\\_MS

> \`const\` **INTENT\\_DWELL\\_MS**: \`150\` = \`150\`

Defined in: [src/sidepanel/hooks/useIntentPrefetch.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useIntentPrefetch.ts#L24)

How long a pointer or focus has to rest on a control before it counts as
intent. Long enough that a pointer sweeping across a list fires nothing; short
enough that a pointer stopping on a row puts the request under way before the
click. A JS timer, not a motion duration, so it is not a \`--dur-*\` token.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / useJumpResolver

# Function: useJumpResolver()

> **useJumpResolver**(\`options\`): \`UseJumpResolverResult\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L145)

Drive the Home tab's jump bar.

## Parameters

### options

\`UseJumpResolverOptions\`

See UseJumpResolverOptions.

## Returns

\`UseJumpResolverResult\`

See UseJumpResolverResult.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JumpResolution

# Interface: JumpResolution

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L79)

How an id resolution was paid for, so the footnote can say so honestly.

## Properties

### cost

> **cost**: \`0\` \\| \`1\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L81)

Requests actually issued: \`0\` from the local snapshot, \`1\` from Okta.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JumpResult

# Interface: JumpResult

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L60)

One row in the jump bar's result list.

## Properties

### kind

> **kind**: \`JumpKind\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L62)

Which kind of entity, deciding the glyph and the destination tab.

***

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L64)

The Okta id, and the row's React key.

***

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L66)

Primary line.

***

### secondary?

> \`optional\` **secondary?**: \`string\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L68)

Secondary line — a status, a description, a login.

***

### appName?

> \`optional\` **appName?**: \`string\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L75)

An app row's Okta \`name\` — the app type key, not the display name.
Present only on \`kind: 'app'\` rows, and only when the source reported one. The
Admin Console route is \`/admin/app/{appName}/instance/{id}\`, so when this is
absent that link is withheld.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / UseJumpResolverOptions

# Interface: UseJumpResolverOptions

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:111](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L111)

Options for useJumpResolver.

## Properties

### index

> **index**: \`OrgEntityIndex\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:117](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L117)

Local org snapshot index — the zero-request half of resolution.

Like \`fetchers\`, read only from \`submit\`, so it needs no memoization.

***

### searchers

> **searchers**: \`Partial\`\\<\`Record\`\\<\`JumpKind\`, (\`query\`) => \`Promise\`\\<\`JumpResult\`[]\\>\\>\\>

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L124)

Search one kind by name. Omit a kind to exclude it from the fan-out.

Must be referentially stable (\`useMemo\`): the debounced search effect depends
on it, so a fresh object literal per render re-issues the search per render.

***

### fetchers

> **fetchers**: \`Partial\`\\<\`Record\`\\<\`OktaIdKind\`, (\`id\`) => \`Promise\`\\<\`JumpResult\` \\| \`null\`\\>\\>\\>

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:131](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L131)

Fetch one entity by id from Okta, for a local miss.

Needs no stability guarantee — it is only ever reached from \`submit\`, an
event handler, so its identity churning between renders costs nothing.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L136)

Whether the tab hosting this bar is on screen. A hidden tab issues no search;
typing is still recorded, so returning to the tab keeps the query.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / UseJumpResolverResult

# Interface: UseJumpResolverResult

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L85)

What useJumpResolver exposes.

## Properties

### query

> **query**: \`string\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L87)

The raw input value.

***

### setQuery

> **setQuery**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L89)

Controlled setter for the input.

#### Parameters

##### value

\`string\`

#### Returns

\`void\`

***

### mode

> **mode**: \`JumpMode\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L91)

Current state of the bar.

***

### results

> **results**: \`JumpResult\`[]

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L93)

Rows to render; empty unless \`mode === 'results'\`.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L95)

Failure message, or \`null\`.

***

### isIdQuery

> **isIdQuery**: \`boolean\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L101)

Whether the current input is a well-formed id. The UI uses this to explain
that Enter will resolve it, and to suppress the "no results" state for an
id that has not been submitted yet.

***

### resolution

> **resolution**: \`JumpResolution\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L103)

How the last id resolution was paid for, or \`null\` if none has run.

***

### submit

> **submit**: () => \`void\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L105)

Resolve an id, or run the name search immediately. Bound to Enter.

#### Returns

\`void\`

***

### clear

> **clear**: () => \`void\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:107](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L107)

Reset to the resting state.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JumpKind

# Type Alias: JumpKind

> **JumpKind** = \`OktaIdKind\` \\| \`"policy"\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L54)

A kind this surface can search for by name. Wider than OktaIdKind
because searchable is not identifiable: a policy id cannot be classified (its
prefixes collide with other objects), but a policy name is searchable. The search
half is keyed on this union, the id-resolution half on \`OktaIdKind\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JumpMode

# Type Alias: JumpMode

> **JumpMode** = \`"idle"\` \\| \`"searching"\` \\| \`"resolving"\` \\| \`"results"\` \\| \`"error"\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L57)

What the jump bar is currently doing.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JUMP\\_SEARCH\\_DEBOUNCE\\_MS

# Variable: JUMP\\_SEARCH\\_DEBOUNCE\\_MS

> \`const\` **JUMP\\_SEARCH\\_DEBOUNCE\\_MS**: \`600\` = \`600\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L46)

How long typing must pause before a search is issued: 600ms, the same window the
Users tab uses. This bar fans out over several endpoints per settle and replaces
the whole result list, so a window short enough to fit between two keystrokes
re-resolves the list under the reader mid-word. Enter bypasses it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useJumpResolver / JUMP\\_SEARCH\\_MIN\\_CHARS

# Variable: JUMP\\_SEARCH\\_MIN\\_CHARS

> \`const\` **JUMP\\_SEARCH\\_MIN\\_CHARS**: \`3\` = \`3\`

Defined in: [src/sidepanel/hooks/useJumpResolver.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useJumpResolver.ts#L38)

Shortest query that may reach Okta. Three, not the Users tab's two: this bar
fans out over several endpoints at once, so a two-character query is more
expensive here and matches too much of the org to be an answer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberFilters / useMemberFilters

# Function: useMemberFilters()

> **useMemberFilters**(\`options?\`): \`MemberFiltersApi\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L101)

Owns the member explorer's facet-filter set. Omit \`options\` entirely for the
plain uncontrolled explorer.

## Parameters

### options?

\`UseMemberFiltersOptions\` = \`{}\`

## Returns

\`MemberFiltersApi\`

## Example

\`\`\`tsx
const memberFilters = useMemberFilters();
const shown = filterMembers(members, query, memberFilters.filters, mfaResults);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberFilters / MemberFiltersApi

# Interface: MemberFiltersApi

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L51)

The filter set plus every mutation the explorer's controls perform on it.

## Properties

### filters

> **filters**: \`MemberFilter\`[]

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L53)

The active facet filters, in the order they were applied.

***

### activeCount

> **activeCount**: \`number\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L55)

How many filters are applied — the count the Filters control badges.

***

### valuesFor

> **valuesFor**: (\`dimension\`) => \`Set\`\\<\`string\`\\>

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L60)

Canonical values active for one dimension, for reflecting pressed states.
Memoised per call site by MemberFiltersApi.filters' identity.

#### Parameters

##### dimension

\`string\` \\| \`null\`

#### Returns

\`Set\`\\<\`string\`\\>

***

### sourceKeys

> **sourceKeys**: \`Set\`\\<\`string\`\\>

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L62)

The active membership-source bucket keys.

***

### key

> **key**: \`string\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L68)

A stable string identifying the current filter set — order-sensitive and
cheap to compare. The explorer folds it into the key that resets its paging
window during render.

***

### toggle

> **toggle**: (\`dimension\`, \`value\`, \`label\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L70)

Add a value to the set, or remove it if it is already there.

#### Parameters

##### dimension

\`string\`

##### value

\`string\`

##### label

\`string\`

#### Returns

\`void\`

***

### toggleRow

> **toggleRow**: (\`dimension\`, \`row\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L72)

Toggle a breakdown row, labelling the chip \`<Dimension>: <value>\`.

#### Parameters

##### dimension

\`string\`

##### row

\`BreakdownRow\`

#### Returns

\`void\`

***

### toggleStatus

> **toggleStatus**: (\`row\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L74)

Toggle a status value (\`Status: <value>\`).

#### Parameters

##### row

\`BreakdownRow\`

#### Returns

\`void\`

***

### clearStatus

> **clearStatus**: () => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L76)

Drop every status filter — the status row's "All" pill.

#### Returns

\`void\`

***

### toggleMfaValue

> **toggleMfaValue**: (\`value\`, \`label\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L78)

Toggle a count-based MFA value (\`none\`, \`multiple\`), with its own label.

#### Parameters

##### value

\`string\`

##### label

\`string\`

#### Returns

\`void\`

***

### setFactorMode

> **setFactorMode**: (\`label\`, \`mode\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L80)

Set one factor label's has/missing/off mode, replacing the other two.

#### Parameters

##### label

\`string\`

##### mode

\`FactorMode\`

#### Returns

\`void\`

***

### toggleSource

> **toggleSource**: (\`key\`, \`label\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L82)

Toggle one membership-source bucket (\`Source: <label>\`).

#### Parameters

##### key

\`string\`

##### label

\`string\`

#### Returns

\`void\`

***

### clearSource

> **clearSource**: () => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L84)

Drop every membership-source filter — the source row's "All" pill.

#### Returns

\`void\`

***

### remove

> **remove**: (\`filter\`) => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L86)

Remove one filter, by identity — what a chip's remove control calls.

#### Parameters

##### filter

\`MemberFilter\`

#### Returns

\`void\`

***

### clearAll

> **clearAll**: () => \`void\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L88)

Drop every filter in every dimension.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberFilters / UseMemberFiltersOptions

# Interface: UseMemberFiltersOptions

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L36)

Options for useMemberFilters.

## Properties

### pendingFilter?

> \`optional\` **pendingFilter?**: \`MemberFilter\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L47)

A filter another surface is asking to have applied, or \`null\`/absent when
nobody is asking.

**It is a request, not a value.** The hook applies it once, when the object
reference changes, and then forgets it: the reader may remove the chip it
produced, and the same object arriving again must not put it back. Applying
is idempotent — a filter already in the set is left alone, never toggled
off — because a jump means "show me this", never "flip this".


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberFilters / FactorMode

# Type Alias: FactorMode

> **FactorMode** = \`"off"\` \\| \`"has"\` \\| \`"missing"\`

Defined in: [src/sidepanel/hooks/useMemberFilters.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberFilters.ts#L33)

Per-factor filter intent: unset, require-present, or require-absent. The hook
turns a mode into the \`has:\`/\`missing:\` values the analytics layer evaluates.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberMfaScan / mfaScanNeedsConfirm

# Function: mfaScanNeedsConfirm()

> **mfaScanNeedsConfirm**(\`memberCount\`): \`boolean\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L35)

Whether a roster is large enough that scanning should go through the confirmation gate
rather than starting immediately. Exported as the predicate, not the constant, so the
boundary condition is not re-derived differently at each call site.

## Parameters

### memberCount

\`number\`

## Returns

\`boolean\`

\`true\` when the caller should move to the \`'confirming'\` gate.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberMfaScan / useMemberMfaScan

# Function: useMemberMfaScan()

> **useMemberMfaScan**(\`__namedParameters\`): \`UseMemberMfaScanResult\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L68)

Owns one group's MFA-enrollment scan: lifecycle status, results, and restoring a
previously cached scan for \`groupId\` on mount. Never auto-runs — \`runScan\` is always
an explicit caller action.

## Parameters

### \\_\\_namedParameters

\`UseMemberMfaScanOptions\`

## Returns

\`UseMemberMfaScanResult\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberMfaScan / UseMemberMfaScanOptions

# Interface: UseMemberMfaScanOptions

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L40)

Options for useMemberMfaScan.

## Properties

### groupId

> **groupId**: \`string\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L42)

Okta group id the scan is scoped to; also the cache key's scope.

***

### members

> **members**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L44)

The group's current member set — \`runScan\` scans exactly these ids.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L46)

Browser tab hosting the Okta session the scan's requests are routed to.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberMfaScan / UseMemberMfaScanResult

# Interface: UseMemberMfaScanResult

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L50)

Return shape of useMemberMfaScan.

## Properties

### mfaResults

> **mfaResults**: \`Map\`\\<\`string\`, \`MemberMfaResult\`\\> \\| \`null\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L52)

Per-member MFA scan results, or \`null\` before a scan has run/restored.

***

### scanStatus

> **scanStatus**: \`MfaScanStatus\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L54)

Current scan lifecycle status.

***

### runScan

> **runScan**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L56)

Run the scan now (one \`GET .../factors\` per member in \`members\`).

#### Returns

\`Promise\`\\<\`void\`\\>

***

### requestConfirm

> **requestConfirm**: () => \`void\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L58)

Move to the \`'confirming'\` gate (used for large groups before scanning).

#### Returns

\`void\`

***

### cancelConfirm

> **cancelConfirm**: () => \`void\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L60)

Dismiss the confirmation gate, returning to \`'idle'\`.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useMemberMfaScan / MFA\\_AUTO\\_THRESHOLD

# Variable: MFA\\_AUTO\\_THRESHOLD

> \`const\` **MFA\\_AUTO\\_THRESHOLD**: \`500\` = \`500\`

Defined in: [src/sidepanel/hooks/useMemberMfaScan.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useMemberMfaScan.ts#L26)

Above this member count, starting a scan requires explicit confirmation: the scan is
one request per member, so a press on a large roster is a request storm the reader
should have agreed to. It lives beside the state machine it gates so the two surfaces
rendering the gate cannot disagree about the threshold.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaApi / useOktaApi

# Function: useOktaApi()

> **useOktaApi**(\`__namedParameters\`): \`object\`

Defined in: [src/sidepanel/hooks/useOktaApi.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaApi.ts#L67)

Aggregate hook returning every Okta operation the side panel can invoke.

Each returned function ultimately posts a message to the background
\`ApiScheduler\`, which rate-limits and forwards it to the content script that
performs the actual authenticated \`fetch\` — the side panel never calls Okta
directly. Long-running operations (\`removeDeprovisioned\`) are
wrapped so they toggle \`isLoading\` and can be aborted via \`cancelOperation\`.

## Parameters

### \\_\\_namedParameters

\`UseOktaApiOptions\`

## Returns

A memoized object of run state (\`isLoading\`, \`isCancelled\`,
  \`cancelOperation\`) plus the core, group, user, export, push-group and
  group-analysis operations.

### isLoading

> **isLoading**: \`boolean\`

### isCancelled

> **isCancelled**: \`boolean\`

### cancelOperation

> **cancelOperation**: () => \`void\`

#### Returns

\`void\`

### makeApiRequest

> **makeApiRequest**: (\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\> = \`coreApi.makeApiRequest\`

#### Parameters

##### endpoint

\`string\`

##### options

\`MakeApiRequestOptions\`

#### Returns

\`Promise\`\\<\`RequestResult\`\\>

### runOperation

> **runOperation**: \\<\`T\`, \`R\`\\>(\`name\`, \`items\`, \`task\`, \`options?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`T\`, \`R\`\\>\\> = \`coreApi.runOperation\`

#### Type Parameters

##### T

\`T\`

##### R

\`R\`

#### Parameters

##### name

\`string\`

##### items

\`T\`[]

##### task

(\`item\`, \`index\`, \`planId?\`) => \`Promise\`\\<\`R\`\\>

##### options?

\`RunOperationOptions\`\\<\`T\`\\>

#### Returns

\`Promise\`\\<\`BatchOutcome\`\\<\`T\`, \`R\`\\>\\>

### getCurrentUser

> **getCurrentUser**: () => \`Promise\`\\<\`Actor\`\\> = \`coreApi.getCurrentUser\`

#### Returns

\`Promise\`\\<\`Actor\`\\>

### getAllGroupMembers

> **getAllGroupMembers**: (\`groupId\`, \`options\`) => \`Promise\`\\<\`OktaUser\`[]\\> = \`groupMemberOps.getAllGroupMembers\`

Fetch every member of a group, following \`Link\` pagination (200 per page).

#### Parameters

##### groupId

\`string\`

Group whose members to load.

##### options?

###### memberCount?

\`number\`

###### planId?

\`string\`

###### onPage?

(\`membersSoFar\`) => \`void\`

#### Returns

\`Promise\`\\<\`OktaUser\`[]\\>

All members across all pages. Each row carries Okta's own rule
attribution under \`_embedded['group-rules']\` — see
module:shared/membership/memberRuleAttribution.

#### Remarks

Emits per-page \`onResult\` progress. Throws on the first failed page.

Requests \`expand=group-rules\`, the private parameter the Okta admin console
uses for its own "assigned by rule" column. It rides on the listing this
method already issues, so attribution costs **no extra requests** — pinned by
\`useGroupSource.requestCount.test.ts\`.

\`options.onPage\` receives every member read so far, as a new array, after each
page — a prefix of the roster for a list to paint, never the roster. It costs
no request; the walk is the same walk.

### getMembershipRuleProof

> **getMembershipRuleProof**: (\`groupId\`, \`userId\`) => \`Promise\`\\<\`MemberRuleAttribution\`\\> = \`groupMemberOps.getMembershipRuleProof\`

Ask Okta which rules manage **one** user's membership of **one** group.

\`GET /api/v1/groups/{groupId}/users/{userId}/group-rules\` is the documented
per-membership counterpart to the \`expand=group-rules\` embed
getAllGroupMembers rides on, and the user-detail page's only route to
an authoritative answer — \`GET /api/v1/users/{id}/groups\` carries no embed.

**One call per membership, so never run it for a whole list.** A 40-group
user would be 40 requests; callers gate it behind an explicit per-row action.

#### Parameters

##### groupId

\`string\`

The group whose membership is in question.

##### userId

\`string\`

The member.

#### Returns

\`Promise\`\\<\`MemberRuleAttribution\`\\>

The three-state MemberRuleAttribution, read through the same
interpreter as the embed so \`no-rules\` (Okta asserting a manual add) can
never collapse into \`unknown\`. A failed request is \`unknown\` — the absence of
an answer, never an answer.

#### Remarks

Never throws: the caller is a UI affordance and the honest failure
mode is "Okta did not answer".

### removeUserFromGroup

> **removeUserFromGroup**: (\`groupId\`, \`groupName\`, \`user\`, \`skipUndoLog\`, \`planId?\`) => \`Promise\`\\<\`RequestResult\`\\> = \`groupMemberOps.removeUserFromGroup\`

Remove a single user from a group (DELETE membership).

#### Parameters

##### groupId

\`string\`

Target group id.

##### groupName

\`string\`

Human-readable name, used in the undo-log description.

##### user

\`OktaUser\`

The member to remove.

##### skipUndoLog?

\`boolean\` = \`false\`

When \`true\`, suppresses the per-user undo entry; bulk
callers set this and log one aggregate undo action at the end.

##### planId?

\`string\`

#### Returns

\`Promise\`\\<\`RequestResult\`\\>

The raw \`RequestResult\`; inspect \`success\`/\`status\` for outcome.

### removeUserFromGroups

> **removeUserFromGroups**: (\`userId\`, \`groupIds\`, \`onProgress?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`string\`, \`void\`\\>\\> = \`groupMemberOps.removeUserFromGroups\`

Remove one user from several groups as a single tracked, cancellable
operation (CoreApi.runOperation → activity bar + Cancel).

#### Parameters

##### userId

\`string\`

The user to remove.

##### groupIds

\`string\`[]

Groups to remove the user from, processed in order.

##### onProgress?

(\`completed\`, \`total\`) => \`void\`

Optional \`(completed, total)\` callback fired after each
successful removal.

#### Returns

\`Promise\`\\<\`BatchOutcome\`\\<\`string\`, \`void\`\\>\\>

The full BatchOutcome (never throws for control flow —
inspect \`results\` / \`cancelled\`); callers that need the legacy
throw-on-first-rejection contract re-raise from \`results\`.

#### Remarks

Semantics pinned by GroupsTab characterization tests — do not
"fix" here:
- DELETEs run sequentially (\`concurrency: 1\`) in the given group order.
- The first *rejected* request halts the remaining groups (\`stopOnError\`).
- A \`success: false\` response (no throw) still counts as processed and the
  run carries on.
- No per-group undo entry is logged.

### addUserToGroup

> **addUserToGroup**: (\`groupId\`, \`groupName\`, \`user\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`groupMemberOps.addUserToGroup\`

Add a user to a group (PUT membership) and log an undo action on success.

#### Parameters

##### groupId

\`string\`

Target group id.

##### groupName

\`string\`

Human-readable name for undo/result messages.

##### user

The user to add (id + profile fields).

###### id

\`string\`

###### profile

\\{ \`login\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`email\`: \`string\`; \\}

###### profile.login

\`string\`

###### profile.firstName

\`string\`

###### profile.lastName

\`string\`

###### profile.email

\`string\`

#### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\` distilled from the underlying request.

### removeDeprovisioned

> **removeDeprovisioned**: (...\`args\`) => \`Promise\`\\<\`void\`\\>

#### Parameters

##### args

...\\[\`string\`\\]

#### Returns

\`Promise\`\\<\`void\`\\>

### getAllGroups

> **getAllGroups**: (\`onProgress?\`) => \`Promise\`\\<\`OktaGroup\`[]\\> = \`groupDiscoveryOps.getAllGroups\`

List every group, following \`Link\` pagination (200 per page, \`expand=stats\`).

#### Parameters

##### onProgress?

(\`loaded\`, \`total\`) => \`void\`

Called after each page with the running loaded count.

#### Returns

\`Promise\`\\<\`OktaGroup\`[]\\>

All groups across all pages.

#### Remarks

Throws on the first failed page.

### getGroupMemberCount

> **getGroupMemberCount**: (\`groupId\`) => \`Promise\`\\<\`number\`\\> = \`groupDiscoveryOps.getGroupMemberCount\`

Approximate a group's member count from the first page of members.

#### Parameters

##### groupId

\`string\`

Group to size.

#### Returns

\`Promise\`\\<\`number\`\\>

The first-page member count (max 200), or \`0\` on failure.

#### Remarks

Intentionally does NOT walk pagination — for groups larger than one
page this returns the page size (200), i.e. a floor, not the exact total.

### ensureGroupRulesLoaded

> **ensureGroupRulesLoaded**: () => \`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\> = \`groupDiscoveryOps.ensureGroupRulesLoaded\`

The org's display rules, read through the panel's one org-rules source.

Exists for callers that attribute rules across many groups: without it, a
cold start leaves every row's \`hasRules\`/\`ruleCount\` reading \`0\` —
indistinguishable from "no rule feeds this group".

#### Returns

\`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\>

The org-wide display rules, or \`null\` when they could not be read
(logged, never thrown) so callers can carry on without rule attribution
rather than failing the whole load. \`null\` is never \`[]\`: an org with no
rules is a real answer, a failed read is not.

#### Remarks

Costs nothing when the snapshot can answer and at most one
paginated rules listing for the whole org otherwise — never one request per
group.

### getGroupRulesForGroup

> **getGroupRulesForGroup**: (\`groupId\`) => \`Promise\`\\<\`FormattedRule\`[]\\> = \`groupDiscoveryOps.getGroupRulesForGroup\`

Resolve the group rules that assign users to a given group.

#### Parameters

##### groupId

\`string\`

Group whose inbound assignment rules to find.

#### Returns

\`Promise\`\\<\`FormattedRule\`[]\\>

Matching rules in the FormattedRule display shape, or \`[]\`
on failure/none.

#### Remarks

Filters the org-wide payload from loadOrgRules, so two
concurrent lookups — a group open issues two — share one read, and a cold
org costs one rules walk between them. The payload is the *formatted* shape:
\`userAttributes\` is synthesised during formatting, and
\`membershipAnalysis.inferBestMatchRule\` degrades to a positional guess
without it.

### executeBulkOperation

> **executeBulkOperation**: (\`operation\`, \`onProgress?\`) => \`Promise\`\\<\`BulkGroupResult\`[]\\> = \`groupBulkOps.executeBulkOperation\`

Apply one BulkOperation across each of its target groups.

#### Parameters

##### operation

\`BulkOperation\`

The operation type + target group ids (+ optional config).

##### onProgress?

(\`current\`, \`total\`, \`currentGroupName\`) => \`void\`

Called per group with \`(index, total, currentGroupName)\`.

#### Returns

\`Promise\`\\<\`BulkGroupResult\`[]\\>

One \`BulkGroupResult\` per target group, in input order.

#### Remarks

Groups are processed sequentially; within a group,
\`cleanup_inactive\` removals run through CoreApi.runOperation, so they
are rate-limited, activity-bar visible, and cancellable. Supported \`type\`s:
\`cleanup_inactive\` (remove
\`DEPROVISIONED\`/\`SUSPENDED\`/\`LOCKED_OUT\` members), \`export_all\` (attach the
member list to the result), and \`remove_user\` (drop one user by
\`config.userId\`); unknown types yield a \`failed\` result. A thrown error for
one group is captured as that group's failed result and does not abort the rest.

### searchGroups

> **searchGroups**: (\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`groupDiscoveryOps.searchGroups\`

Search groups by name via Okta's \`q\` query (capped at 20 results).

#### Parameters

##### query

\`string\`

Search text; queries shorter than 2 chars short-circuit to \`[]\`.

#### Returns

\`Promise\`\\<\`object\`[]\\>

Lightweight \`{ id, name, description, type }\` records; \`[]\` on error.

### getGroupById

> **getGroupById**: (\`groupId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description\`: \`string\`; \`type\`: \`string\`; \\} \\| \`null\`\\> = \`groupDiscoveryOps.getGroupById\`

Fetch one group by id.

#### Parameters

##### groupId

\`string\`

Group id to look up.

#### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description\`: \`string\`; \`type\`: \`string\`; \\} \\| \`null\`\\>

A lightweight \`{ id, name, description, type }\` record, or \`null\` if
not found / on error.

### getUserLastLogin

> **getUserLastLogin**: (\`userId\`) => \`Promise\`\\<\`Date\` \\| \`null\`\\> = \`userOps.getUserLastLogin\`

Read a user's last-login timestamp.

#### Parameters

##### userId

\`string\`

User to inspect.

#### Returns

\`Promise\`\\<\`Date\` \\| \`null\`\\>

The \`lastLogin\` as a \`Date\`, or \`null\` if never logged in / on error.

### getUserApps

> **getUserApps**: (\`userId\`) => \`Promise\`\\<\`UserAppsResult\`\\> = \`userOps.getUserApps\`

List all apps assigned to a user (id + display label + assignment scope).

#### Parameters

##### userId

\`string\`

User whose apps to list.

#### Returns

\`Promise\`\\<\`UserAppsResult\`\\>

A UserAppsResult. A failed or part-way-failed walk resolves
with \`complete: false\` and whatever was collected — it never rejects, and
never reports a failure as an empty list. Each entry carries an optional
AppAssignmentScope; Okta reports one scope per app-user and prefers
\`'USER'\` when both paths exist, so \`'USER'\` must never be rendered as
"direct only".

#### Remarks

Reflects effective assignments (direct + via group) from the apps
filter endpoint, following \`Link\` pagination (200 per page).

\`expand=user/{userId}\` embeds the app-user object on each row at no extra
request (\`appLinks\` does not support \`expand\`). A missing or malformed embed
leaves \`scope\` undefined and never drops the app. Pages 2+ are re-issued from
Okta's \`rel="next"\` cursor, which carries the embed only if Okta echoes
\`expand\` back; if it stops, the consequence is \`scope: undefined\` past page 1
and no lost apps, so the cursor URL is not rewritten.

### batchGetUserDetails

> **batchGetUserDetails**: (\`userIds\`, \`onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`OktaUser\`\\>\\> = \`userOps.batchGetUserDetails\`

Fetch full details for many users, keyed by id.

#### Parameters

##### userIds

\`string\`[]

Users to load.

##### onProgress?

(\`current\`, \`total\`) => \`void\`

Called with \`(processed, total)\` every third settled user
and at completion.

#### Returns

\`Promise\`\\<\`Map\`\\<\`string\`, \`OktaUser\`\\>\\>

Map of userId → OktaUser; ids that fail to load **or fail
validation** are omitted, so every value in the map is a parsed user rather
than whatever Okta happened to return.

#### Remarks

Runs through CoreApi.runOperation at \`low\` priority so it
never starves interactive work. A cancel returns the partial map; a per-user
failure is logged and its id omitted, never thrown.

Each response is parsed with \`oktaUserSchema\` — the same treatment
\`profileOperations.getUserRaw\` gives this endpoint — because a value read
here can reach a write (the bulk membership verb preflights through it). A
row that fails is dropped and logged by id, issue path and issue code only;
the body is never logged.

### scanGroupMfa

> **scanGroupMfa**: (\`userIds\`, \`_onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`MemberMfaResult\`\\>\\> = \`userOps.scanGroupMfa\`

Scan MFA factor enrollment for a list of users.

#### Parameters

##### userIds

\`string\`[]

Users to scan.

##### \\_onProgress?

(\`current\`, \`total\`) => \`void\`

#### Returns

\`Promise\`\\<\`Map\`\\<\`string\`, \`MemberMfaResult\`\\>\\>

Map of userId → MemberMfaResult (summarized via summarizeFactors).

#### Remarks

Costs one API call per user (\`GET /api/v1/users/{id}/factors\`), run
through CoreApi.runOperation at \`low\` priority. Responses are
validated with oktaFactorSchema: a malformed row is dropped and a
non-array response degrades to zero factors, same as a fetch failure.

### getUserGroupMemberships

> **getUserGroupMemberships**: (\`userId\`) => \`Promise\`\\<\`number\`\\> = \`userOps.getUserGroupMemberships\`

Count a user's group memberships.

#### Parameters

##### userId

\`string\`

User to inspect.

#### Returns

\`Promise\`\\<\`number\`\\>

Exact membership count, read from the \`x-total-count\` header of a
\`limit=1\` request (avoids paging the full list); \`0\` on error.

### searchUsers

> **searchUsers**: (\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`userOps.searchUsers\`

Search users by name, email, or login via Okta's \`q\` query (capped at 20).

#### Parameters

##### query

\`string\`

Search text; queries shorter than 2 chars short-circuit to \`[]\`.

#### Returns

\`Promise\`\\<\`object\`[]\\>

Flattened \`{ id, email, firstName, lastName, login, status }\` records; \`[]\` on error.

### getUserById

> **getUserById**: (\`userId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`email\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`login\`: \`string\`; \`status\`: \`string\`; \\} \\| \`null\`\\> = \`userOps.getUserById\`

Fetch one user by id.

#### Parameters

##### userId

\`string\`

User id to look up.

#### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`email\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`login\`: \`string\`; \`status\`: \`string\`; \\} \\| \`null\`\\>

A flattened \`{ id, email, firstName, lastName, login, status }\`
record, or \`null\` if not found / on error.

### getUserProfileSchema

> **getUserProfileSchema**: () => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`definitions\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`base\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \`custom\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \`properties\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`profile\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\> \\| \`null\`\\> = \`profileOps.getUserProfileSchema\`

Read the org's user-profile schema — the definition of every base and
org-defined (custom) profile attribute.

#### Returns

\`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`definitions\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`base\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \`custom\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \`properties\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`profile\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\> \\| \`null\`\\>

The validated OktaUserProfileSchema, or \`null\` when the
request fails, returns no data, or returns a payload that does not validate.
Never throws.

#### Remarks

One org-wide \`GET /api/v1/meta/schemas/user/default\`, the only way
to learn about an attribute that is **unset** on the user being viewed — such
an attribute is absent from that user's \`profile\` object. Cache under
\`cacheKeys.userSchema(oktaOrigin)\` (org-wide, \`TTL_LONG\`).

\`null\` is a first-class answer: the caller falls back to
\`BASE_PROFILE_ATTRIBUTES\`, so a schema failure costs custom-attribute
discovery, never the view. Validation is lenient — a malformed property is
dropped and the rest kept. Nothing about the response body is logged.

### getUserRaw

> **getUserRaw**: (\`userId\`, \`options\`) => \`Promise\`\\<\`OktaUser\` \\| \`null\`\\> = \`profileOps.getUserRaw\`

Fetch one user by id as a **whole, validated** OktaUser.

#### Parameters

##### userId

\`string\`

User id to look up.

##### options?

\`planId\` attributes the request to a declared plan;
\`reason\` overrides the default activity-bar label.

###### planId?

\`string\`

###### reason?

\`string\`

#### Returns

\`Promise\`\\<\`OktaUser\` \\| \`null\`\\>

The validated user, or \`null\` when the request fails, returns no
data, or returns a payload that does not validate. Never throws.

#### Remarks

Separate from \`userOperations.getUserById\`, which returns a flat
six-field projection; an editor needs the whole \`profile\` object plus
\`credentials.provider\` to decide what is editable.

Validation is strict, not lenient: this value seeds an edit form whose diff
becomes a write, so \`null\` beats a half-understood profile.
\`oktaUserSchema\`'s \`credentials\` block is not \`.passthrough()\`, so
\`credentials.password\` / \`recovery_question\` never reach React state.

### loadQualificationSubject

> **loadQualificationSubject**: (\`userId\`) => \`Promise\`\\<\`QualificationSubjectResult\`\\> = \`qualificationSubjectOps.loadQualificationSubject\`

Load a user and their complete group list under one two-leg plan.

#### Parameters

##### userId

\`string\`

#### Returns

\`Promise\`\\<\`QualificationSubjectResult\`\\>

The validated user and every group they hold, or the leg that
  failed. \`user-not-found\` also covers a payload that did not validate —
  \`getUserRaw\` folds both into \`null\` and logs which.

### updateUserProfile

> **updateUserProfile**: (\`userId\`, \`patch\`) => \`Promise\`\\<\`UpdateProfileResult\`\\> = \`profileOps.updateUserProfile\`

Write a **sparse patch** of profile attributes onto a user.

#### Parameters

##### userId

\`string\`

User to update.

##### patch

\`Record\`\\<\`string\`, \`unknown\`\\>

Attribute name → new value, containing **only** the changed
attributes.

#### Returns

\`Promise\`\\<\`UpdateProfileResult\`\\>

An UpdateProfileResult — \`'saved'\`, \`'failed'\`, or
\`'unknown'\`. See the module header; \`'unknown'\` means the write may have
applied and must never be shown as a plain failure.

#### Throws

Before issuing any request, when \`patch\` is empty or contains a
security-sensitive key (see assertNoExcludedKeys). Both rejections
are strictly pre-flight, so neither can be confused with \`'unknown'\`.

#### Remarks

**Merge semantics.** Okta documents \`POST /api/v1/users/{id}\` with
\`{ profile: patch }\` as a partial update: absent attributes are left
untouched. This repo has not exercised that against a live org. Were it to
replace instead, the fix is confined to this function body — send the full
profile merged with the patch, minus every attribute whose schema
\`mutability !== 'READ_WRITE'\`.

The response is validated with \`oktaUserSchema\`; the returned user is what
the caller renders as the new truth.

### searchApps

> **searchApps**: (\`query\`) => \`Promise\`\\<\`AppSummary\`[]\\> = \`appOps.searchApps\`

Type-ahead search over apps by name/label (\`q=\` prefix match).

#### Parameters

##### query

\`string\`

The search text; queries shorter than 2 chars return \`[]\`.

#### Returns

\`Promise\`\\<\`AppSummary\`[]\\>

Up to 20 matching app summaries; \`[]\` on error (never throws).

### suspendUser

> **suspendUser**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.suspendUser\`

Suspend an active user, preventing them from signing in.

#### Parameters

##### userId

\`string\`

User to suspend.

#### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

#### Remarks

Only valid for users in \`ACTIVE\` status.

### unsuspendUser

> **unsuspendUser**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.unsuspendUser\`

Unsuspend a suspended user, restoring their ability to sign in.

#### Parameters

##### userId

\`string\`

User to unsuspend.

#### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

#### Remarks

Only valid for users in \`SUSPENDED\` status.

### resetPassword

> **resetPassword**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.resetPassword\`

Trigger a password-reset email for the user.

#### Parameters

##### userId

\`string\`

User to send the reset link to.

#### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

#### Remarks

Sends an email with a one-time reset link (\`sendEmail=true\`). Valid
for \`ACTIVE\` and \`RECOVERY\` status users.

### setUserPassword

> **setUserPassword**: (\`userId\`, \`password\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.setUserPassword\`

Set a user's password directly, without validating the current one.

The administrative set — the operation for an account whose mailbox cannot
be reached, which is what a reset email assumes. Takes effect immediately.

#### Parameters

##### userId

\`string\`

User whose password to set.

##### password

\`string\`

The new value. Never logged, never returned, never stored.

#### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult.

#### Remarks

Rejected values come back as \`'failed'\` carrying Okta's own policy
message, which names the rule that was broken.

### expirePassword

> **expirePassword**: (\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePassword\`

Expire a user's password, forcing a change at next sign-in.

#### Parameters

##### userId

\`string\`

User whose password to expire.

#### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult; never carries a temporary password.

#### Remarks

Paired after setUserPassword when the value typed is a
handoff rather than a permanent password.

### expirePasswordWithTempPassword

> **expirePasswordWithTempPassword**: (\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePasswordWithTempPassword\`

Expire a user's password and have Okta generate a one-time replacement.

#### Parameters

##### userId

\`string\`

User whose password to expire.

#### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult; \`'saved-with-temp'\` carries the value.

#### Remarks

The returned value is shown once and never persisted. An accepted
call that names no value is \`'unknown'\`, not success — there is nothing to
read out.

### getAppById

> **getAppById**: (\`appId\`) => \`Promise\`\\<\`AppLookup\`\\> = \`appOps.getAppById\`

Fetch one app by id.

#### Parameters

##### appId

\`string\`

App instance id to look up.

#### Returns

\`Promise\`\\<\`AppLookup\`\\>

An AppLookup saying which of the four outcomes happened.
Never throws.

#### Remarks

Strict parseOkta against the lenient list-item schema,
logging the outcome only. A 404 is the only answer that earns \`missing\`; a
401 is \`session-expired\` (via isSessionExpired, so 403 and 429 are
not mistaken for it); everything else, validation failure included, is
\`failed\` with the status that caused it.

### getAppAssignmentCounts

> **getAppAssignmentCounts**: (\`appId\`) => \`Promise\`\\<\`AppAssignmentCounts\` \\| \`null\`\\> = \`appOps.getAppAssignmentCounts\`

Count the users and groups assigned to an app.

#### Parameters

##### appId

\`string\`

App to size.

#### Returns

\`Promise\`\\<\`AppAssignmentCounts\` \\| \`null\`\\>

\`{ users, groups }\`, or \`null\` if either count could not be
obtained. Never throws.

#### Remarks

Each collection is counted independently by
countAssignments, so one may probe while the other falls back.
Issued at \`low\` priority so this bulk read yields to interactive work.

A walked count reflects *validated* rows; a probed count is Okta's own total
and is not filtered that way, so the two paths can disagree by however many
rows an org sends that fail validation.

### getAppGroupAssignments

> **getAppGroupAssignments**: (\`appId\`, \`planId?\`) => \`Promise\`\\<\`string\`[] \\| \`null\`\\> = \`appOps.getAppGroupAssignments\`

List the ids of every group assigned to an app.

**Fallback only.** The primary answer to "which group grants this app?" is
\`grantGroupId\` off \`userOperations.getUserApps\`, for zero extra requests.
This answers a strictly weaker question — the groups assigned to the app,
not the group that granted it to a particular user — so intersecting it with
a user's memberships narrows candidates without naming the grantor.

**Gate it behind an explicit, per-row action.** It costs at least one
request per app (more past 200 assigned groups), so firing it across a
user's app list is linear in app count.

#### Parameters

##### appId

\`string\`

App whose group assignments to list.

##### planId?

\`string\`

#### Returns

\`Promise\`\\<\`string\`[] \\| \`null\`\\>

Every assigned group id across all pages, or \`null\` when the walk
failed. Never throws.

#### Remarks

\`null\` and \`[]\` are different answers: \`[]\` is Okta reporting **no
groups assigned**, \`null\` is **no answer**. Rows are validated with
oktaAppGroupAssignmentSchema, so a malformed row is dropped rather
than failing the walk. Issued at \`low\` priority. Cache under
\`cacheKeys.appGroups(appId)\`.

### fetchAppAssertion

> **fetchAppAssertion**: (\`appId\`, \`oktaOrigin?\`) => \`Promise\`\\<\`SamlTraceResult\`\\> = \`samlOps.fetchAppAssertion\`

#### Parameters

##### appId

\`string\`

##### oktaOrigin?

\`string\`

#### Returns

\`Promise\`\\<\`SamlTraceResult\`\\>

### listPolicies

> **listPolicies**: (\`type\`) => \`Promise\`\\<\`PolicyListResult\`\\> = \`policyOps.listPolicies\`

List every policy of one type, following \`Link\` pagination (200 per page).

#### Parameters

##### type?

\`"ACCESS_POLICY"\` \\| \`"OKTA_SIGN_ON"\` \\| \`"MFA_ENROLL"\` \\| \`"PASSWORD"\`

Policy type to list; defaults to \`'ACCESS_POLICY'\`.

#### Returns

\`Promise\`\\<\`PolicyListResult\`\\>

A PolicyListResult — never throws. \`listed\` carries every
validated policy across all pages (an empty array meaning Okta reported
none); \`forbidden\` means the admin role may not read policies; \`failed\`
carries the message for anything else.

#### Remarks

Issued at \`normal\` priority. Each page is validated with
oktaPolicyListItemSchema, so malformed rows are dropped leniently
rather than thrown on. The 403 costs nothing to detect: the status rode in on
the response that failed the walk.

### getPolicyRules

> **getPolicyRules**: (\`policyId\`) => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`conditions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`actions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\> = \`policyOps.getPolicyRules\`

Read the rules attached to one policy.

#### Parameters

##### policyId

\`string\`

Policy whose rules to read.

#### Returns

\`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`conditions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`actions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\>

The validated rules; \`[]\` on failure (never throws).

#### Remarks

Single request at \`normal\` priority — the rules endpoint is not
paginated in practice (a policy holds a handful of rules).

### getAppAccessPolicyId

> **getAppAccessPolicyId**: (\`appId\`) => \`Promise\`\\<\`string\` \\| \`null\`\\> = \`policyOps.getAppAccessPolicyId\`

Resolve the id of the access policy attached to an app.

#### Parameters

##### appId

\`string\`

App to inspect.

#### Returns

\`Promise\`\\<\`string\` \\| \`null\`\\>

The access policy id, or \`null\` when the app has no access policy
link, the link is unparseable, the extracted id does not look like an Okta
policy id, or the request fails. Never throws.

#### Remarks

Okta exposes the attachment only as \`_links.accessPolicy.href\` on
\`GET /api/v1/apps/{id}\`; parsing and validation live in the pure
extractAccessPolicyId. Prefer that helper when the app record is
already in hand — this wrapper costs a request.

### fetchExportRows

> **fetchExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`, \`onPage?\`) => \`Promise\`\\<\`FetchAllResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchAllRows\`

Fetch every row for a resolved endpoint, paginating on the \`Link\` header.

Uses \`'low'\` priority so bulk export reads never starve interactive UI, checks
cancellation between pages, and validates each page in the side panel.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

The entity descriptor (supplies the schema and cap).

##### resolvedEndpoint

\`string\`

First-page endpoint from \`buildExportEndpoint\`.

##### onPage?

(\`rowsSoFar\`) => \`void\`

Optional callback with the running row count after each page.

#### Returns

\`Promise\`\\<\`FetchAllResult\`\\<\`Row\`\\>\\>

Validated rows plus dropped/capped diagnostics.

### fetchSelectionExportRows

> **fetchSelectionExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`basket\`, \`onProgress?\`) => \`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchSelectionRows\`

Read a \`from-selection\` export: one request per ticked entity, in the
basket's pick order, over the rate-limited fan-out.

Every request goes through \`coreApi.runOperation\`, so the scheduler bounds
the concurrency, the activity bar carries the exact cost up front (the item
list is in hand — nothing is estimated), and cancellation is honoured
between ticks. A \`rows: 'list'\` tick walks its own \`Link\` header.

**A ticked entity that is gone is counted, never dropped.** A 404/410 (or a
response that fails the descriptor's zod schema) resolves that tick as
SelectionOutcome \`missing\`; any other failure throws, because a
smaller CSV produced by an expired session would be a confidently-wrong
answer rather than a shortfall.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

A \`from-selection\` descriptor.

##### basket

\`SelectionBasket\`

The current selection basket.

##### onProgress?

(\`rowsSoFar\`) => \`void\`

Optional callback with the running row count.

#### Returns

\`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\>

The de-duplicated rows, how many ticks were requested, and which of
  them could not be read.

#### Throws

If the operation was cancelled.

### countExportRows

> **countExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`) => \`Promise\`\\<\`CountResult\`\\> = \`exportEngineOps.countRows\`

Probe the first page for the live match-count under the filter box.

Deliberately fetches a single page (cheap on every keystroke); a \`count\` of 0
surfaces a filter typo, and \`hasMore\` signals the true total is larger.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### descriptor

\`EntityExport\`\\<\`Row\`\\>

The entity descriptor (for its schema).

##### resolvedEndpoint

\`string\`

First-page endpoint from \`buildExportEndpoint\`.

#### Returns

\`Promise\`\\<\`CountResult\`\\>

First-page count and whether more pages exist.

### runExport

> **runExport**: \\<\`Row\`\\>(\`args\`) => \`Promise\`\\<\`void\`\\> = \`exportEngineOps.runExport\`

Project rows through the enabled columns, download the CSV, and audit it.

#### Type Parameters

##### Row

\`Row\`

#### Parameters

##### args

\`RunExportArgs\`\\<\`Row\`\\>

Descriptor, fetched rows, enabled column ids, optional label.

#### Returns

\`Promise\`\\<\`void\`\\>

### compareGroups

> **compareGroups**: (\`groups\`, \`onProgress?\`, \`memberCache?\`) => \`Promise\`\\<\`GroupComparisonResult\`\\> = \`groupAnalysisOps.compareGroups\`

Compare 2-5 groups to find overlapping and unique members.

#### Parameters

##### groups

\`object\`[]

The 2-5 \`{ id, name }\` groups to compare (throws outside that range).

##### onProgress?

(\`current\`, \`total\`, \`message?\`) => \`void\`

Called per group as members load with \`(index, total, message)\`.

##### memberCache?

\`Map\`\\<\`string\`, \`OktaUser\`[]\\>

Optional id → members cache; hits skip the fetch and misses populate it.

#### Returns

\`Promise\`\\<\`GroupComparisonResult\`\\>

A GroupComparisonResult with the full intersection, per-group
uniques, and total distinct user count.

#### Remarks

The only API cost is one paginated member fetch per uncached group.

### searchUserAcrossGroups

> **searchUserAcrossGroups**: (\`query\`, \`groupMembersCache\`, \`groupNames\`) => \`object\`[] = \`groupAnalysisOps.searchUserAcrossGroups\`

Find users matching a query across an already-loaded group-members cache.

#### Parameters

##### query

\`string\`

Case-insensitive substring matched against email/login/first/last/full name.

##### groupMembersCache

\`Map\`\\<\`string\`, \`OktaUser\`[]\\>

Map of groupId → members to search.

##### groupNames

\`Map\`\\<\`string\`, \`string\`\\>

Map of groupId → display name for labeling results.

#### Returns

\`object\`[]

One \`{ groupId, groupName, user }\` per user-in-group match, de-duplicated per pair.

#### Remarks

Pure in-memory operation — no API calls.

### captureRuleImpact

> **captureRuleImpact**: (\`rule\`, \`opts?\`) => \`Promise\`\\<\`RuleImpactSummary\`\\> = \`ruleImpactOps.captureRuleImpact\`

#### Parameters

##### rule

\`RuleImpactInput\`

##### opts?

\`CaptureRuleImpactOptions\`

#### Returns

\`Promise\`\\<\`RuleImpactSummary\`\\>

### getRawGroupRule

> **getRawGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`OktaGroupRule\` \\| \`null\`\\> = \`ruleWriteOps.getRawGroupRule\`

#### Parameters

##### ruleId

\`string\`

#### Returns

\`Promise\`\\<\`OktaGroupRule\` \\| \`null\`\\>

### createGroupRule

> **createGroupRule**: (\`payload\`) => \`Promise\`\\<\`CreateRuleResult\`\\> = \`ruleWriteOps.createGroupRule\`

#### Parameters

##### payload

\`CreateRulePayload\`

#### Returns

\`Promise\`\\<\`CreateRuleResult\`\\>

### updateGroupRule

> **updateGroupRule**: (\`ruleId\`, \`body\`) => \`Promise\`\\<\`RuleUpdateResult\`\\> = \`ruleWriteOps.updateGroupRule\`

#### Parameters

##### ruleId

\`string\`

##### body

\`UpdateRulePayload\`

#### Returns

\`Promise\`\\<\`RuleUpdateResult\`\\>

### deleteGroupRule

> **deleteGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deleteGroupRule\`

#### Parameters

##### ruleId

\`string\`

#### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

### activateGroupRule

> **activateGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.activateGroupRule\`

#### Parameters

##### ruleId

\`string\`

#### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

### deactivateGroupRule

> **deactivateGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deactivateGroupRule\`

#### Parameters

##### ruleId

\`string\`

#### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

## Remarks

The options (see \`UseOktaApiOptions\`) scope every operation to \`targetTabId\`'s
content script and wire the result/progress callbacks. The optional \`oktaOrigin\`
scopes the operations that read the org snapshot imperatively; omitting it costs
those a fetch rather than changing what they answer.

\`onResult\` reports messages as one \`{ message, type }\` object, so a one-argument
handler cannot silently drop \`type\`. Both \`onResult\` and \`onProgress\` must be
stable (\`useCallback\`): they are memo dependencies, and an unstable value gives
every returned function a new identity each render.

## Example

\`\`\`tsx
const api = useOktaApi({ targetTabId, onResult, onProgress });
await api.addUserToGroup(userId, groupId);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaApi/qualificationSubject / createQualificationSubjectOperations

# Function: createQualificationSubjectOperations()

> **createQualificationSubjectOperations**(\`coreApi\`, \`getUserRaw\`): \`object\`

Defined in: [src/sidepanel/hooks/useOktaApi/qualificationSubject.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaApi/qualificationSubject.ts#L52)

Build the subject-loading operation.

## Parameters

### coreApi

\`CoreApi\`

The scheduler-routed core.

### getUserRaw

\`GetUserRaw\`

\`profileOperations.getUserRaw\`, the strict whole-user read.

## Returns

### loadQualificationSubject

> **loadQualificationSubject**: (\`userId\`) => \`Promise\`\\<\`QualificationSubjectResult\`\\>

Load a user and their complete group list under one two-leg plan.

#### Parameters

##### userId

\`string\`

#### Returns

\`Promise\`\\<\`QualificationSubjectResult\`\\>

The validated user and every group they hold, or the leg that
  failed. \`user-not-found\` also covers a payload that did not validate —
  \`getUserRaw\` folds both into \`null\` and logs which.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaApi/qualificationSubject / QualificationSubjectFailure

# Type Alias: QualificationSubjectFailure

> **QualificationSubjectFailure** = \`"user-not-found"\` \\| \`"groups-failed"\`

Defined in: [src/sidepanel/hooks/useOktaApi/qualificationSubject.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaApi/qualificationSubject.ts#L30)

Which leg of the subject load did not answer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaApi/qualificationSubject / QualificationSubjectResult

# Type Alias: QualificationSubjectResult

> **QualificationSubjectResult** = \\{ \`ok\`: \`true\`; \`user\`: \`OktaUser\`; \`groups\`: readonly \`OktaGroup\`[]; \\} \\| \\{ \`ok\`: \`false\`; \`reason\`: \`QualificationSubjectFailure\`; \\}

Defined in: [src/sidepanel/hooks/useOktaApi/qualificationSubject.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaApi/qualificationSubject.ts#L33)

The subject, or the leg that failed — never a partial subject.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaPageContext / useOktaPageContext

# Function: useOktaPageContext()

> **useOktaPageContext**(\`enabled?\`): \`OktaPageContext\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L75)

Detects which kind of Okta entity page (group / user / app / policy) the active
tab is on by probing the content script for all four in parallel. Falls back to
\`admin\` when none match **and the probe succeeded**.

## Parameters

### enabled?

\`boolean\` = \`true\`

When \`false\`, live re-detection on navigation is suspended and
  a resync is deferred until re-enabled while the panel is visible. Defaults to
  \`true\`, which is what \`App\` uses; nothing in the panel passes \`false\`. It is
  not gated on any tab — \`ContextBar\` renders above every one of them — and the
  single engine also carries connection health, so freezing it would freeze the
  health readout with it.

## Returns

\`OktaPageContext\`

The detected \`pageType\` with the corresponding \`groupInfo\` /
  \`userInfo\` / \`appInfo\` / \`policyInfo\` (the others \`null\`), plus shared
  connection state. \`pageType\` is only meaningful while
  \`connectionStatus === 'connected'\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaPageContext / OktaPageContext

# Interface: OktaPageContext

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L41)

Detected page entity merged with the shared tab-context connection state.

## Extends

- \`PageDetection\`

## Properties

### pageType

> **pageType**: \`PageType\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L33)

#### Inherited from

\`PageDetection.pageType\`

***

### groupInfo

> **groupInfo**: \`GroupInfo\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L34)

#### Inherited from

\`PageDetection.groupInfo\`

***

### userInfo

> **userInfo**: \`UserInfo\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L35)

#### Inherited from

\`PageDetection.userInfo\`

***

### appInfo

> **appInfo**: \`AppInfo\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L36)

#### Inherited from

\`PageDetection.appInfo\`

***

### policyInfo

> **policyInfo**: \`PolicyInfo\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L37)

#### Inherited from

\`PageDetection.policyInfo\`

***

### connectionStatus

> **connectionStatus**: \`ConnectionStatus\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L42)

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L43)

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L44)

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L45)

***

### refetch

> **refetch**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L46)

#### Returns

\`Promise\`\\<\`void\`\\>

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L47)

***

### resyncPending

> **resyncPending**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L49)

See OktaTabContext.resyncPending.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaPageContext / PageType

# Type Alias: PageType

> **PageType** = \`"group"\` \\| \`"user"\` \\| \`"app"\` \\| \`"policy"\` \\| \`"admin"\` \\| \`"unknown"\`

Defined in: [src/sidepanel/hooks/useOktaPageContext.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaPageContext.ts#L29)

Kind of Okta page the side panel detects for the active tab.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaTabContext / useOktaTabContext

# Function: useOktaTabContext()

> **useOktaTabContext**\\<\`T\`\\>(\`config\`): \`OktaTabContext\`\\<\`T\`\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L103)

Shared machinery for the side panel's page-context hooks. The per-entity hooks
(\`useGroupContext\`, \`useUserContext\`, \`useOktaPageContext\`) are thin wrappers that
supply \`loadEntity\` and rename \`data\`.

## Type Parameters

### T

\`T\`

## Parameters

### config

\`OktaTabContextConfig\`\\<\`T\`\\>

Every field must be stable per hook instance; they are effect
  dependencies.

## Returns

\`OktaTabContext\`\\<\`T\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaTabContext / EntityLoadContext

# Interface: EntityLoadContext

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L26)

Tools handed to an entity loader so it can talk to the content script.

## Properties

### tabId

> **tabId**: \`number\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L27)

***

### sendToTab

> **sendToTab**: \\<\`R\`\\>(\`action\`) => \`Promise\`\\<\`MessageResponse\`\\<\`R\`\\>\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L29)

Send an action to the content script in the target tab.

#### Type Parameters

##### R

\`R\`

#### Parameters

##### action

\`string\`

#### Returns

\`Promise\`\\<\`MessageResponse\`\\<\`R\`\\>\\>

***

### isStale

> **isStale**: () => \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L31)

True once a newer fetch has superseded this one — bail early if so.

#### Returns

\`boolean\`

***

### log

> **log**: \`Logger\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L32)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaTabContext / OktaTabContext

# Interface: OktaTabContext\\<T\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L57)

What useOktaTabContext returns to a per-entity wrapper hook.

## Type Parameters

### T

\`T\`

## Properties

### data

> **data**: \`T\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L58)

***

### connectionStatus

> **connectionStatus**: \`ConnectionStatus\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L59)

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L60)

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L61)

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L62)

***

### refetch

> **refetch**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L63)

#### Returns

\`Promise\`\\<\`void\`\\>

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L64)

***

### resyncPending

> **resyncPending**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L69)

\`true\` when a navigation to a different entity was observed while detection was
suppressed and has not been applied. Cleared once a fetch runs.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaTabContext / OktaTabContextConfig

# Interface: OktaTabContextConfig\\<T\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L36)

Per-entity configuration for useOktaTabContext.

## Type Parameters

### T

\`T\`

## Properties

### scope

> **scope**: \`string\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L38)

Logger scope, e.g. 'useGroupContext'.

***

### initialData

> **initialData**: \`T\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L40)

Initial data, also restored when no Okta tab is reachable (hard error).

***

### commsFailedData

> **commsFailedData**: \`T\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L42)

Data to store after content-script comms fail past the retry budget.

***

### loadEntity

> **loadEntity**: (\`ctx\`) => \`Promise\`\\<\`T\`\\>

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L48)

Fetch the entity-specific state from the content script. Runs after a tab is
selected and the Okta origin has been resolved. Throwing triggers the retry
path; returning stores the data and marks the connection as connected.

#### Parameters

##### ctx

\`EntityLoadContext\`

#### Returns

\`Promise\`\\<\`T\`\\>

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L53)

When \`false\`, navigation events only record that a resync is owed, run once the
hook is enabled again and the panel is visible. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOktaTabContext / ConnectionStatus

# Type Alias: ConnectionStatus

> **ConnectionStatus** = \`"connecting"\` \\| \`"connected"\` \\| \`"error"\`

Defined in: [src/sidepanel/hooks/useOktaTabContext.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOktaTabContext.ts#L23)

Liveness of the side panel's link to the target Okta tab.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOperationResultBus / useOperationResultBus

# Function: useOperationResultBus()

> **useOperationResultBus**(): \`OperationResultBus\`

Defined in: [src/sidepanel/hooks/useOperationResultBus.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOperationResultBus.ts#L50)

Creates the rung's single operation-result channel.

## Returns

\`OperationResultBus\`

A stable \`onResult\` to pass to \`useOktaApi\`, and a stable \`subscribe\`
  for the surfaces that read results off it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOperationResultBus / OperationResultBus

# Interface: OperationResultBus

Defined in: [src/sidepanel/hooks/useOperationResultBus.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOperationResultBus.ts#L30)

What useOperationResultBus hands the rung.

## Properties

### onResult

> **onResult**: \`OperationResultListener\`

Defined in: [src/sidepanel/hooks/useOperationResultBus.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOperationResultBus.ts#L36)

The rung's \`onResult\`, for its one \`useOktaApi\` call. Stable for the life
of the rung — \`useOktaApi\` lists it in the deps of the memo that builds
every operation it returns.

***

### subscribe

> **subscribe**: (\`listener\`) => () => \`void\`

Defined in: [src/sidepanel/hooks/useOperationResultBus.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOperationResultBus.ts#L41)

Adds a listener and returns its removal. Stable, so it is safe in a
\`useCallback\` dependency list.

#### Parameters

##### listener

\`OperationResultListener\`

#### Returns

() => \`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOperationResultBus / OperationResultListener

# Type Alias: OperationResultListener

> **OperationResultListener** = (\`result\`) => \`void\`

Defined in: [src/sidepanel/hooks/useOperationResultBus.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOperationResultBus.ts#L27)

A listener on the rung's operation-result channel.

## Parameters

### result

\`OperationResult\`

## Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / ruleSearchSecondary

# Function: ruleSearchSecondary()

> **ruleSearchSecondary**(\`status\`): \`string\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L45)

Whether a rule is actually running, as the secondary line of its jump-result row.

Exhaustive over GroupRuleStatus, never a two-way ternary (D-085): a
ternary has no arm for \`INVALID\` and defaults a rule Okta can no longer evaluate
into *Active*. The word for \`INVALID\` comes from ruleStatusBadge, the one
place that names a rule's status; \`ACTIVE\`/\`INACTIVE\` keep this surface's
sentence-case prose wording.

## Parameters

### status

\`GroupRuleStatus\`

The rule's status exactly as Okta reported it.

## Returns

\`string\`

The secondary line for the rule's jump-result row.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / useOrgEntityIndexSource

# Function: useOrgEntityIndexSource()

> **useOrgEntityIndexSource**(\`options\`): \`OrgEntityIndex\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:186](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L186)

Index one org's groups, rules and apps from the local snapshot.

Call this from \`OrgEntityIndexProvider\` and nowhere else: it is the mount — four
\`useOrgSnapshot\` subscriptions and the id Maps derived from them. Surfaces read the
provider's published value with \`useOrgEntityIndex\` — see
module:sidepanel/contexts/OrgEntityIndexContext.

## Parameters

### options

\`UseOrgEntityIndexSourceOptions\`

See UseOrgEntityIndexSourceOptions.

## Returns

\`OrgEntityIndex\`

See OrgEntityIndex.

## Example

\`\`\`tsx
// In the provider, once per panel:
const index = useOrgEntityIndexSource({ oktaOrigin, targetTabId, enabled });
// In a surface:
const index = useOrgEntityIndex();
const found = index.lookup('group', '00gFAKE0000000000001');
if (found.status === 'hit') showRow(found.entity);          // zero requests
else if (found.status !== 'miss') await fetchFromOkta();    // 'unknown'
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / IndexedEntity

# Interface: IndexedEntity

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L57)

A resolved entity, flattened to what a jump result row needs.

## Properties

### kind

> **kind**: \`IndexedKind\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L59)

Which collection the row came from.

***

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L61)

The Okta id.

***

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L63)

Display name — a group's profile name, a rule's name, an app's label.

***

### secondary?

> \`optional\` **secondary?**: \`string\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L69)

One extra fact worth showing, when the collection cheaply carries one: a
rule's \`ACTIVE\`/\`INACTIVE\` status, an app's sign-on mode. \`undefined\` when
the row has nothing useful to add.

***

### appName?

> \`optional\` **appName?**: \`string\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L76)

An app row's Okta \`name\` — the app type key (\`oidc_client\`, \`salesforce\`),
which name hides behind the human label. Only \`kind: 'app'\` rows carry
it, and only when the snapshot row reported one. The Admin Console's app route
is \`/admin/app/{appName}/instance/{id}\`, which cannot be built from the id.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / OrgEntityIndex

# Interface: OrgEntityIndex

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L90)

What useOrgEntityIndex exposes.

## Properties

### lookup

> **lookup**: (\`kind\`, \`id\`) => \`LocalLookup\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L100)

Resolve an id locally.

#### Parameters

##### kind

\`OktaIdKind\`

Which collection to look in. \`user\` is not indexed and always
answers \`'unknown'\`.

##### id

\`string\`

The Okta id.

#### Returns

\`LocalLookup\`

A hit, a supported miss, or \`'unknown'\` when the snapshot is not
authoritative enough to deny the id exists.

***

### searchByName

> **searchByName**: (\`kind\`, \`query\`, \`limit?\`) => \`IndexedEntity\`[]

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:115](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L115)

Search one collection by name, locally.

Scans the same flattened IndexedEntity rows lookup returns, so
a row found by name and one found by id carry the same fallbacks. Returns rows
and nothing else: it cannot report absence, because a collection whose walk
never finished still matches what it has — see isAuthoritative.

#### Parameters

##### kind

\`IndexedKind\`

Which collection to scan.

##### query

\`string\`

Case-insensitive substring of the entity's name. Blank
returns \`[]\` rather than the whole org.

##### limit?

\`number\`

Most rows to return. Defaults to 20, matching what Okta's own
type-ahead searches cap at, so a local section and a live one are the same size.

#### Returns

\`IndexedEntity\`[]

***

### isAuthoritative

> **isAuthoritative**: (\`kind\`) => \`boolean\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:120](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L120)

Whether a collection's last walk finished, so a miss in it means "absent"
rather than "not fetched yet".

#### Parameters

##### kind

\`IndexedKind\`

#### Returns

\`boolean\`

***

### groups

> **groups**: \`UseOrgSnapshotResult\`\\<\`RawOktaGroup\`\\>

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:122](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L122)

The raw snapshot handles, for consumers that need counts or freshness.

***

### rules

> **rules**: \`UseOrgSnapshotResult\`\\<\`OktaGroupRule\`\\>

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:123](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L123)

***

### apps

> **apps**: \`UseOrgSnapshotResult\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`label\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`status\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`signOnMode\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \`created\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>\\>; \`lastUpdated\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`_embedded\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`features\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodArray\`\\<\`ZodString\`, \`"many"\`\\>\\>\\>; \`orn\`: \`ZodCatch\`\\<\`ZodOptional\`\\<\`ZodString\`\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L124)

***

### appGroups

> **appGroups**: \`UseOrgSnapshotResult\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`priority\`: \`ZodOptional\`\\<\`ZodNumber\`\\>; \`profile\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodObject\`\\<\\{ \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`groupName\`: \`ZodOptional\`\\<\`ZodString\`\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`groupName\`: \`ZodOptional\`\\<\`ZodString\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`groupName\`: \`ZodOptional\`\\<\`ZodString\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`group\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`href\`: \`ZodOptional\`\\<\`ZodString\`\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`href\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`href\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`group\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`href\`: \`ZodOptional\`\\<...\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`href\`: ...; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`href\`: ...; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`group\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`href\`: \`ZodOptional\`\\<...\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`href\`: ...; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`href\`: ...; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:131](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L131)

App-group assignments, keyed \`\${appId}::\${groupId}\`. Read through
UseOrgSnapshotResult.records, never \`rows\` — Okta returns only the
group's id on an assignment, so which app it belongs to exists in the key
alone.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / UseOrgEntityIndexSourceOptions

# Interface: UseOrgEntityIndexSourceOptions

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L135)

Options for useOrgEntityIndexSource.

## Extended by

- \`OrgEntityIndexProviderProps\`

## Properties

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L137)

Connected org origin; \`null\` reads nothing rather than another org's rows.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L139)

Live Okta tab the background routes through; \`null\` disables syncing.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L144)

When \`false\` the store is still read and broadcasts still tracked, but no
sync is issued — a hidden tab must not drive org-wide traffic.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / IndexedKind

# Type Alias: IndexedKind

> **IndexedKind** = \`Extract\`\\<\`OktaIdKind\`, \`"group"\` \\| \`"rule"\` \\| \`"app"\`\\>

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L31)

The collections this index covers. \`user\` is deliberately absent — see below.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOrgEntityIndex / LocalLookup

# Type Alias: LocalLookup

> **LocalLookup** = \\{ \`status\`: \`"hit"\`; \`entity\`: \`IndexedEntity\`; \\} \\| \\{ \`status\`: \`"miss"\`; \\} \\| \\{ \`status\`: \`"unknown"\`; \\}

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L86)

The answer to a local lookup.

\`'unknown'\` is a third state on purpose: it separates "this org has no such
entity" from "this snapshot cannot say", and only the first is safe to show a
reader.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOwedLoad / useOwedLoad

# Function: useOwedLoad()

> **useOwedLoad**(\`identity\`, \`ready\`, \`run\`): \`void\`

Defined in: [src/sidepanel/hooks/useOwedLoad.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOwedLoad.ts#L45)

Run \`run\` once for each distinct \`identity\`, but only while \`ready\`.

While \`ready\` is \`false\` the work is deferred, not dropped: an \`identity\` change is
remembered and runs once \`ready\` becomes \`true\`. A \`null\`/\`undefined\` identity means
"no meaningful input yet" and never runs, which keeps the "is the target known" test
out of every caller's \`ready\` expression.

\`run\` is read through a ref, so an inline closure is fine and does not re-trigger.
\`identity\` is the only thing that causes a second run — if another value should too,
it belongs *in* the identity.

## Parameters

### identity

\`OwedIdentity\`

### ready

\`boolean\`

Whether the work may run now, typically a tab's \`isActive\`.

### run

() => \`void\`

## Returns

\`void\`

## Example

\`\`\`ts
useOwedLoad(targetTabId == null ? null : \`\${targetTabId}:\${groupId}\`, isActive, () => {
  void loadReferences();
});
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useOwedLoad / OwedIdentity

# Type Alias: OwedIdentity

> **OwedIdentity** = \`string\` \\| \`number\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useOwedLoad.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOwedLoad.ts#L22)

A value identifying which input this work was done for. Compared with \`===\`, so it
must be a primitive: compose a multi-part identity into a string at the call site
rather than passing an object, whose identity changes every render.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / PolicyReadForbiddenError

# Class: PolicyReadForbiddenError

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L89)

Signals a 403 out of the cache fetcher.

A refusal has to leave \`getOrFetch\` as a throw (so nothing is stored) while
still being told apart from a transport failure at the catch — which is a
distinct type, not a parsed message (\`docs/claims.md\`).

## Extends

- \`Error\`

## Constructors

### Constructor

> **new PolicyReadForbiddenError**(): \`PolicyReadForbiddenError\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L90)

#### Returns

\`PolicyReadForbiddenError\`

#### Overrides

\`Error.constructor\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / fetchPolicyList

# Function: fetchPolicyList()

> **fetchPolicyList**(\`listPolicies\`, \`force?\`): \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`type\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`description\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`created\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`lastUpdated\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\>

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:111](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L111)

Read the shared policy list through POLICIES\\_CACHE\\_KEY, storing an
answer and nothing else.

The one place the caching rule is written, because three surfaces share the key
— this tab, the multi-entity search, and the collection loader — and a refusal
cached by any of them would be served to the others as "the org has no
policies". Non-answers leave as a throw, which \`getOrFetch\` does not store.

## Parameters

### listPolicies

(\`type?\`) => \`Promise\`\\<\`PolicyListResult\`\\>

The bound \`useOktaApi\` operation.

### force?

\`boolean\` = \`false\`

Bypass the cache and any in-flight coalescing (manual refresh).

## Returns

\`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`type\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`description\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`created\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`lastUpdated\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\>

The policies Okta listed.

## Throws

when the admin role may not read policies.

## Throws

carrying the failure message for anything else.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / usePoliciesData

# Function: usePoliciesData()

> **usePoliciesData**(\`options\`): \`UsePoliciesDataReturn\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:148](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L148)

Manage the Auth Policies tab's data: the app authentication policy list, its
loading flag, the last-fetch timestamp, and the cache-first \`loadPolicies\`.

## Parameters

### options

\`UsePoliciesDataOptions\`

See UsePoliciesDataOptions.

## Returns

\`UsePoliciesDataReturn\`

The policy data plus a stable \`loadPolicies\`.

## Remarks

\`listPolicies\` never throws; it reports which of three things happened
and this hook keeps that distinction in UsePoliciesDataReturn.readState
rather than flattening it into an empty array. A refusal is **not** pushed
through \`onError\`: it is not a transient failure to retry past but a standing
fact about the signed-in role, and the empty state is where a standing fact
belongs. Nor is it cached — the fetcher throws, which \`getOrFetch\` does not
store, so a role change is picked up by the next load rather than outliving it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / UsePoliciesDataOptions

# Interface: UsePoliciesDataOptions

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L54)

Options for usePoliciesData.

## Properties

### targetTabId?

> \`optional\` **targetTabId?**: \`number\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L56)

Connected Okta tab id; loading reports an error when absent.

***

### onError

> **onError**: (\`message\`) => \`void\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L58)

Surface a message in the tab's banner; \`''\` clears it.

#### Parameters

##### message

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / UsePoliciesDataReturn

# Interface: UsePoliciesDataReturn

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L62)

Return shape of usePoliciesData.

## Properties

### policies

> **policies**: \`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`type\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`description\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`created\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`lastUpdated\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodString\`\\>\\>; \`_links\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L64)

The loaded policies (validated \`ACCESS_POLICY\` rows).

***

### readState

> **readState**: \`PolicyReadState\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L66)

Which of the three things an empty \`policies\` means. See PolicyReadState.

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L68)

\`true\` while a load is in flight.

***

### lastFetchTime

> **lastFetchTime**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L70)

ISO timestamp of the last completed load, or \`null\`.

***

### loadPolicies

> **loadPolicies**: (\`force?\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L72)

Load the policy list; \`force\` bypasses the cache (manual refresh).

#### Parameters

##### force?

\`boolean\`

#### Returns

\`Promise\`\\<\`void\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / PolicyReadState

# Type Alias: PolicyReadState

> **PolicyReadState** = \`"unread"\` \\| \`"listed"\` \\| \`"forbidden"\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L51)

What the tab knows about the policy list.

- \`unread\` — no load has completed. The list on screen is whatever the cache
  held, and nothing may be claimed about the org.
- \`listed\` — Okta answered. An empty list now means the org has no policies of
  this type, which is an answer rather than an absence.
- \`forbidden\` — Okta refused the read for this admin role (403). Not a shorter
  list; a different fact, and the one the empty state has to name instead of
  offering the reader a choice of two (\`docs/claims.md\`).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / AUTH\\_POLICY\\_TYPE

# Variable: AUTH\\_POLICY\\_TYPE

> \`const\` **AUTH\\_POLICY\\_TYPE**: \`OktaPolicyType\` = \`'ACCESS_POLICY'\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L35)

The only policy type the Auth Policies tab reads this release: app
authentication (sign-on) policies.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePoliciesData / POLICIES\\_CACHE\\_KEY

# Variable: POLICIES\\_CACHE\\_KEY

> \`const\` **POLICIES\\_CACHE\\_KEY**: \`EntityKey\`

Defined in: [src/sidepanel/hooks/usePoliciesData.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePoliciesData.ts#L38)

Entity-cache key holding the fetched AUTH\\_POLICY\\_TYPE list.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayConfig / useProfileDisplayConfig

# Function: useProfileDisplayConfig()

> **useProfileDisplayConfig**(\`oktaOrigin\`, \`knownAttributeNames\`): \`UseProfileDisplayConfig\`

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:157](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L157)

Load, reconcile, and persist one admin's profile display configuration for an
Okta org.

## Parameters

### oktaOrigin

\`string\` \\| \`null\` \\| \`undefined\`

The org origin the config belongs to. With no origin the
  hook returns defaults and never touches storage.

### knownAttributeNames

readonly \`string\`[]

The profile attributes that currently exist, in the
  order they should be appended when they have no saved placement. Memoized
  internally on the joined names, so a fresh array each render is fine.

## Returns

\`UseProfileDisplayConfig\`

The reconciled config plus load state and mutators
  (see UseProfileDisplayConfig).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayConfig / UseProfileDisplayConfig

# Interface: UseProfileDisplayConfig

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L30)

What useProfileDisplayConfig returns.

## Properties

### config

> **config**: \`ProfileDisplayConfig\`

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L35)

The reconciled config — never \`null\`, and never containing an attribute that
is not in \`knownAttributeNames\`. Defaults until a saved config loads.

***

### isLoaded

> **isLoaded**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L40)

\`false\` only while the org's saved config is being read. \`true\` immediately
when there is no origin, since there is then nothing to wait for.

***

### update

> **update**: (\`patch\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L42)

Apply a partial change and persist it (coalesced).

#### Parameters

##### patch

\`Partial\`\\<\`ProfileDisplayConfig\`\\>

#### Returns

\`void\`

***

### reset

> **reset**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayConfig.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayConfig.ts#L44)

Discard the org's config and return to DEFAULT\\_PROFILE\\_DISPLAY\\_CONFIG.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / useProfileDisplayEditor

# Function: useProfileDisplayEditor()

> **useProfileDisplayEditor**(\`options\`): \`ProfileDisplayEditorApi\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:248](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L248)

Own customize mode's draft configuration and its reorder machine.

## Parameters

### options

\`UseProfileDisplayEditorOptions\`

The profile being edited and the two exits from the editor.

## Returns

\`ProfileDisplayEditorApi\`

The draft, the verbs that change it, and the drag/lift state the
  editor's components render.

## Example

\`\`\`tsx
const editor = useProfileDisplayEditor({ attributes, config, onCommit, onCancel });
<IconButton onPointerDown={(event) => editor.beginDrag('attr', name, event)} … />
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / EditorDrag

# Interface: EditorDrag

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L54)

The lift currently in progress.

## Properties

### kind

> **kind**: \`EditorDragKind\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L56)

Whether an attribute row or a section is lifted.

***

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L58)

The attribute's Okta name, or the category's stable key.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L60)

The lifted thing's human label — what the ghost and the announcement say.

***

### keyboard

> **keyboard**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L62)

\`true\` when the lift came from the keyboard, so arrow keys drive it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / EditorDropTarget

# Interface: EditorDropTarget

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L66)

Where the lifted thing would land if it were dropped right now.

## Properties

### kind

> **kind**: \`EditorDragKind\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L68)

Whether the target describes an attribute position or a section position.

***

### key

> **key**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L73)

For an attribute, the destination category key (UNCATEGORIZED for the
trailing block). For a section, the key of the section being moved.

***

### index

> **index**: \`number\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L75)

Zero-based destination position within that list.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / EditorGhost

# Interface: EditorGhost

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L79)

Viewport coordinates the drag ghost follows.

## Properties

### x

> **x**: \`number\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L81)

Client X of the pointer.

***

### y

> **y**: \`number\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L83)

Client Y of the pointer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / ProfileDisplayEditorApi

# Interface: ProfileDisplayEditorApi

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L90)

What useProfileDisplayEditor hands its components.

## Properties

### draft

> **draft**: \`ProfileDisplayConfig\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L92)

The configuration being edited. Nothing is persisted until \`commit\`.

***

### sections

> **sections**: readonly \`ProfileDisplayCategory\`[]

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L94)

The draft's categories with Uncategorized pinned last — what the editor maps over.

***

### setOption

> **setOption**: \\<\`K\`\\>(\`key\`, \`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L96)

Set one display toggle on the draft.

#### Type Parameters

##### K

\`K\` *extends* \`ProfileDisplayOptionKey\`

#### Parameters

##### key

\`K\`

##### value

\`ProfileDisplayConfig\`\\[\`K\`\\]

#### Returns

\`void\`

***

### rename

> **rename**: (\`key\`, \`name\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L98)

Give a category a new label; its key, and so its membership, is untouched.

#### Parameters

##### key

\`string\`

##### name

\`string\`

#### Returns

\`void\`

***

### add

> **add**: (\`name\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L100)

Append a category. A blank name adds nothing.

#### Parameters

##### name

\`string\`

#### Returns

\`void\`

***

### remove

> **remove**: (\`key\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L102)

Delete a category, returning its attributes to Uncategorized.

#### Parameters

##### key

\`string\`

#### Returns

\`void\`

***

### toggleHidden

> **toggleHidden**: (\`name\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L104)

Flip one attribute's visibility. Its row stays in the editor either way.

#### Parameters

##### name

\`string\`

#### Returns

\`void\`

***

### place

> **place**: (\`name\`, \`key\`, \`index\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:106](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L106)

Move one attribute into a section at a position, and say where it landed.

#### Parameters

##### name

\`string\`

##### key

\`string\`

##### index

\`number\`

#### Returns

\`void\`

***

### moveSection

> **moveSection**: (\`key\`, \`index\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L108)

Move one category to a position among the categories, and say where it landed.

#### Parameters

##### key

\`string\`

##### index

\`number\`

#### Returns

\`void\`

***

### commit

> **commit**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L110)

Hand the whole draft to the caller.

#### Returns

\`void\`

***

### cancel

> **cancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:112](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L112)

Discard the draft.

#### Returns

\`void\`

***

### resetToDefault

> **resetToDefault**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:114](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L114)

Replace the draft with the shipped default, reconciled onto this profile.

#### Returns

\`void\`

***

### drag

> **drag**: \`EditorDrag\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:116](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L116)

The lift in progress, or \`null\`.

***

### dropTarget

> **dropTarget**: \`EditorDropTarget\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:118](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L118)

Where a drop would land right now, or \`null\`.

***

### ghost

> **ghost**: \`EditorGhost\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:120](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L120)

Pointer position for the ghost, or \`null\` while no pointer drag is active.

***

### reducedMotion

> **reducedMotion**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:122](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L122)

\`true\` when the ghost must not animate its follow.

***

### beginDrag

> **beginDrag**: (\`kind\`, \`id\`, \`event\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L124)

Start a pointer drag; nothing lifts until the pointer travels 4px.

#### Parameters

##### kind

\`EditorDragKind\`

##### id

\`string\`

##### event

\`PointerEvent\`\\<\`Element\`\\>

#### Returns

\`void\`

***

### lift

> **lift**: (\`kind\`, \`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:130](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L130)

Lift with the keyboard, from a grip handle that keeps focus.

#### Parameters

##### kind

\`EditorDragKind\`

##### id

\`string\`

#### Returns

\`void\`

***

### step

> **step**: (\`direction\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:132](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L132)

Move the lifted thing one step. Ignored when nothing is lifted.

#### Parameters

##### direction

\`AttributeStep\`

#### Returns

\`void\`

***

### drop

> **drop**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:134](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L134)

Commit the lift where it stands.

#### Returns

\`void\`

***

### cancelDrag

> **cancelDrag**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L136)

Abandon the lift and restore the draft to its pre-lift state.

#### Returns

\`void\`

***

### announcement

> **announcement**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:138](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L138)

The sentence for the editor's \`aria-live\` region. Empty before the first move.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / UseProfileDisplayEditorOptions

# Interface: UseProfileDisplayEditorOptions

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L142)

Arguments to useProfileDisplayEditor.

## Properties

### attributes

> **attributes**: readonly \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L144)

Every attribute on this profile — the set \`assign\` and \`hidden\` must cover.

***

### config

> **config**: \`ProfileDisplayConfig\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:146](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L146)

The reconciled configuration the draft starts from.

***

### onCommit

> **onCommit**: (\`config\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:148](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L148)

Called with the whole draft when the admin presses Done.

#### Parameters

##### config

\`ProfileDisplayConfig\`

#### Returns

\`void\`

***

### onCancel

> **onCancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:150](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L150)

Called when the admin presses Cancel.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / EditorDragKind

# Type Alias: EditorDragKind

> **EditorDragKind** = \`"attr"\` \\| \`"section"\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L48)

What is being reordered: one attribute row, or a whole section.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileDisplayEditor / ProfileDisplayOptionKey

# Type Alias: ProfileDisplayOptionKey

> **ProfileDisplayOptionKey** = \`"layout"\` \\| \`"showApiNames"\` \\| \`"showRuleChips"\` \\| \`"showEmpty"\`

Defined in: [src/sidepanel/hooks/useProfileDisplayEditor.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileDisplayEditor.ts#L87)

The four display toggles the editor can change on the draft.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileEdit / useProfileEdit

# Function: useProfileEdit()

> **useProfileEdit**(\`__namedParameters\`): \`UseProfileEditReturn\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:239](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L239)

Editing state for one user's profile, on one surface.

## Parameters

### \\_\\_namedParameters

\`UseProfileEditOptions\`

## Returns

\`UseProfileEditReturn\`

## Example

\`\`\`tsx
const edit = useProfileEdit({ user, attributes, targetTabId, onUserUpdated, enabled });
const cell = edit.cells[attribute.name];
// …render \`cell?.onChange\` as the control's handler…
if (edit.pendingSave) return <SaveModal changes={edit.pendingSave} onConfirm={edit.confirmSave} />;
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileEdit / AttributeEditCell

# Interface: AttributeEditCell

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L61)

Everything one attribute's control needs to render itself and report a change.

## Properties

### name

> \`readonly\` **name**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L63)

The attribute's bare Okta name — the key of the draft, the patch and this map.

***

### editability

> \`readonly\` **editability**: \`AttributeEditability\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L65)

Whether it may be edited here, or why it may not.

***

### draft?

> \`readonly\` \`optional\` **draft?**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L67)

In-flight value. Absent means no edit made; the cell shows the saved value.

***

### dirty

> \`readonly\` **dirty**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L69)

\`true\` when the draft differs from the value saved in Okta.

***

### invalid?

> \`readonly\` \`optional\` **invalid?**: \`string\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L71)

Validation message; blocks save.

***

### onChange?

> \`readonly\` \`optional\` **onChange?**: (\`value\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L73)

Absent when the attribute is locked.

#### Parameters

##### value

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileEdit / UseProfileEditOptions

# Interface: UseProfileEditOptions

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:88](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L88)

Options for useProfileEdit.

## Properties

### user

> \`readonly\` **user**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L90)

The user being edited; every action no-ops when \`null\`.

***

### attributes

> \`readonly\` **attributes**: readonly \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L96)

The attribute inventory, exactly as the surface renders it. Taken rather
than derived, so the editor cannot offer a control for an attribute the
reader cannot see.

***

### targetTabId

> \`readonly\` **targetTabId**: \`number\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L98)

Tab whose scheduler runs the write.

***

### onUserUpdated

> \`readonly\` **onUserUpdated**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L100)

Lifts the user Okta returned, so every surface sees the new truth.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### enabled

> \`readonly\` **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L102)

Whether the surface is visible. \`false\` blocks entering edit mode and blocks the write.

***

### mastering?

> \`readonly\` \`optional\` **mastering?**: \`ProfileMastering\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L108)

Which profile sources are attached to this user, for the editability gate.
Taken rather than derived, for the reason \`attributes\` is. Omitting it locks
every \`PROFILE_MASTER\` attribute, which is safe.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileEdit / UseProfileEditReturn

# Interface: UseProfileEditReturn

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:112](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L112)

What useProfileEdit returns.

## Properties

### isEditing

> \`readonly\` **isEditing**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:114](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L114)

Whether the surface is in edit mode.

***

### begin

> \`readonly\` **begin**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:116](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L116)

Enters edit mode with a clean draft. No-op without a user, or when disabled.

#### Returns

\`void\`

***

### cancel

> \`readonly\` **cancel**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:118](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L118)

Leaves edit mode, discarding every draft.

#### Returns

\`void\`

***

### cells

> \`readonly\` **cells**: \`Readonly\`\\<\`Record\`\\<\`string\`, \`AttributeEditCell\`\\>\\>

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:120](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L120)

name → cell. Empty when not editing, so callers may index unconditionally.

***

### changes

> \`readonly\` **changes**: readonly \`DraftChange\`[]

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:122](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L122)

Every attribute whose draft differs from what Okta has, in display order.

***

### hasChanges

> \`readonly\` **hasChanges**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:124](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L124)

Whether anything would actually be written.

***

### hasInvalid

> \`readonly\` **hasInvalid**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:126](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L126)

Whether any drafted value fails client-side validation; blocks save.

***

### pendingSave

> \`readonly\` **pendingSave**: readonly \`DraftChange\`[] \\| \`null\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:131](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L131)

The changes awaiting confirmation, or \`null\`. One nullable discriminant, so
the modal renders the exact list the write will use.

***

### requestSave

> \`readonly\` **requestSave**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:133](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L133)

Arms the confirmation. No-op with nothing to save, or with a validation error outstanding.

#### Returns

\`void\`

***

### dismissSave

> \`readonly\` **dismissSave**: () => \`void\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L135)

Dismisses the confirmation, leaving the draft and edit mode untouched.

#### Returns

\`void\`

***

### confirmSave

> \`readonly\` **confirmSave**: () => \`Promise\`\\<\`ProfileSaveOutcome\`\\>

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L137)

Performs the armed write.

#### Returns

\`Promise\`\\<\`ProfileSaveOutcome\`\\>

***

### isSaving

> \`readonly\` **isSaving**: \`boolean\`

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L139)

\`true\` while a confirmed write is in flight.

***

### draftPatch

> \`readonly\` **draftPatch**: \`Readonly\`\\<\`Record\`\\<\`string\`, \`unknown\`\\>\\>

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:146](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L146)

The patch this draft *would* send — name → coerced raw value — for the
blast-radius engine, which must answer "what would this change break?"
before the admin commits to anything. Built through the same gate as the
real patch, so the hypothetical and the actual can never disagree.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useProfileEdit / ProfileSaveOutcome

# Type Alias: ProfileSaveOutcome

> **ProfileSaveOutcome** = \\{ \`kind\`: \`"saved"\`; \`user\`: \`OktaUser\`; \\} \\| \\{ \`kind\`: \`"failed"\`; \`error\`: \`string\`; \\} \\| \\{ \`kind\`: \`"unknown"\`; \\}

Defined in: [src/sidepanel/hooks/useProfileEdit.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useProfileEdit.ts#L82)

What a confirmed save concluded — the three-state result of
module:sidepanel/hooks/useOktaApi/profileOperations.UpdateProfileResult,
narrowed to what a surface needs to say. \`'unknown'\` carries no message; the
surface owns that copy.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePublishedHeight / usePublishedHeight

# Function: usePublishedHeight()

> **usePublishedHeight**(\`ref\`, \`variable\`, \`options?\`): \`void\`

Defined in: [src/sidepanel/hooks/usePublishedHeight.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePublishedHeight.ts#L45)

Measure \`ref\`'s height and keep \`variable\` in sync with it on an ancestor element. The
property is removed on cleanup, so a band that unmounts leaves no stale offset behind.

## Parameters

### ref

\`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

### variable

\`string\`

Custom property name to write, including the leading \`--\`.

### options?

\`UsePublishedHeightOptions\` = \`{}\`

## Returns

\`void\`

## Example

\`\`\`tsx
usePublishedHeight(barRef, '--activity-h'); // singleton: document root
usePublishedHeight(headerRef, '--header-h', { scopeSelector: '[data-header-scope]' });
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/usePublishedHeight / UsePublishedHeightOptions

# Interface: UsePublishedHeightOptions

Defined in: [src/sidepanel/hooks/usePublishedHeight.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePublishedHeight.ts#L20)

Options for usePublishedHeight.

## Properties

### scopeSelector?

> \`optional\` **scopeSelector?**: \`string\`

Defined in: [src/sidepanel/hooks/usePublishedHeight.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePublishedHeight.ts#L25)

CSS selector for the ancestor to publish onto, e.g. \`'[data-header-scope]'\`. Omit to
publish on the document root, which is correct only for a band there is exactly one of.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/usePublishedHeight.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/usePublishedHeight.ts#L30)

Whether to measure at all. Defaults to \`true\`. Pass the tab's \`isActive\` (or a feature
flag) to keep a hidden panel from attaching an observer it cannot usefully feed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useQualificationSubject / useQualificationSubject

# Function: useQualificationSubject()

> **useQualificationSubject**(\`__namedParameters\`): \`UseQualificationSubjectReturn\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L83)

Hold a qualification subject for one rung identity.

## Parameters

### \\_\\_namedParameters

\`UseQualificationSubjectOptions\`

## Returns

\`UseQualificationSubjectReturn\`

## Example

\`\`\`tsx
const subject = useQualificationSubject({ targetTabId, scopeKey: rule.id });
<UserPickerModal onSelect={(user) => subject.load(user.id)} />
{subject.state.status === 'loaded' && <RuleUserReport … />}
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useQualificationSubject / UseQualificationSubjectOptions

# Interface: UseQualificationSubjectOptions

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L47)

Options for useQualificationSubject.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L49)

The tab whose content script serves the two requests; \`null\` when none.

***

### scopeKey

> **scopeKey**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L54)

The rung identity this subject belongs to. A change retracts the subject
in the same render — nothing about the previous rule or group survives.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useQualificationSubject / UseQualificationSubjectReturn

# Interface: UseQualificationSubjectReturn

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L58)

What useQualificationSubject returns.

## Properties

### state

> **state**: \`QualificationSubjectState\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L59)

***

### load

> **load**: (\`userId\`) => \`void\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L61)

Load a user as the subject. A later call supersedes one still in flight.

#### Parameters

##### userId

\`string\`

#### Returns

\`void\`

***

### clear

> **clear**: () => \`void\`

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L63)

Back to \`idle\`.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useQualificationSubject / QualificationSubjectState

# Type Alias: QualificationSubjectState

> **QualificationSubjectState** = \\{ \`status\`: \`"idle"\`; \\} \\| \\{ \`status\`: \`"loading"\`; \`userId\`: \`string\`; \\} \\| \\{ \`status\`: \`"loaded"\`; \`userId\`: \`string\`; \`user\`: \`OktaUser\`; \`groups\`: readonly \`OktaGroup\`[]; \`groupContext\`: \`RuleGroupContext\`; \\} \\| \\{ \`status\`: \`"failed"\`; \`userId\`: \`string\`; \`reason\`: \`QualificationSubjectFailure\` \\| \`"no-tab"\`; \\}

Defined in: [src/sidepanel/hooks/useQualificationSubject.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useQualificationSubject.ts#L29)

Where the subject load stands. Never a partial subject.

## Union Members

### Type Literal

\\{ \`status\`: \`"idle"\`; \\}

***

### Type Literal

\\{ \`status\`: \`"loading"\`; \`userId\`: \`string\`; \\}

***

### Type Literal

\\{ \`status\`: \`"loaded"\`; \`userId\`: \`string\`; \`user\`: \`OktaUser\`; \`groups\`: readonly \`OktaGroup\`[]; \`groupContext\`: \`RuleGroupContext\`; \\}

#### status

> \`readonly\` **status**: \`"loaded"\`

#### userId

> \`readonly\` **userId**: \`string\`

#### user

> \`readonly\` **user**: \`OktaUser\`

#### groups

> \`readonly\` **groups**: readonly \`OktaGroup\`[]

#### groupContext

> \`readonly\` **groupContext**: \`RuleGroupContext\`

The complete list, in the evaluator's shape.

***

### Type Literal

\\{ \`status\`: \`"failed"\`; \`userId\`: \`string\`; \`reason\`: \`QualificationSubjectFailure\` \\| \`"no-tab"\`; \\}


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useReducedMotion / useReducedMotion

# Function: useReducedMotion()

> **useReducedMotion**(): \`boolean\`

Defined in: [src/sidepanel/hooks/useReducedMotion.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useReducedMotion.ts#L26)

Subscribe to whether the user has requested reduced motion.

## Returns

\`boolean\`

\`true\` when \`prefers-reduced-motion: reduce\` currently matches,
\`false\` otherwise. Updates live if the OS setting changes.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRefreshSubject / useAppRefresh

# Function: useAppRefresh()

> **useAppRefresh**(\`refetchPageContext\`): \`object\`

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:143](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L143)

Compose the app-level refresh press: the context half and the data half.

The two halves are independent: re-probing page context says nothing about
whether the roster on screen is current, so both halves run on every press.

## Parameters

### refetchPageContext

() => \`void\` \\| \`Promise\`\\<\`unknown\`\\>

The page-context engine's \`refetch\`.

## Returns

\`object\`

\`subjectName\` for the control's accessible name (\`null\` when no rung
  has claimed it) and \`refresh\`, the press handler.

### subjectName

> **subjectName**: \`string\` \\| \`null\`

### refresh

> **refresh**: () => \`void\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRefreshSubject / useCurrentRefreshSubject

# Function: useCurrentRefreshSubject()

> **useCurrentRefreshSubject**(): \`RefreshSubject\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L129)

The subject the app-level refresh control is currently pointed at.

## Returns

\`RefreshSubject\` \\| \`null\`

The current subject, or \`null\` when no rung has claimed the control,
  in which case a press is the context re-probe alone.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRefreshSubject / useRefreshSubject

# Function: useRefreshSubject()

> **useRefreshSubject**(\`name\`, \`run\`, \`enabled?\`): \`void\`

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L105)

Declare what the app-level refresh control means on this rung.

Registration is a stack entry for as long as \`enabled\` holds; the chrome acts
on the most recent one. \`run\` is read through a ref at press time, so an
inline closure is fine and does not churn the registration — only \`name\` and
\`enabled\` do.

## Parameters

### name

\`string\` \\| \`null\`

The subject, in the reader's words. See RefreshSubject.name.
  Pass \`null\` to register nothing (a rung with no answer yet).

### run

() => \`void\`

Re-read whatever this rung is showing.

### enabled?

\`boolean\` = \`true\`

Whether this rung is the one on screen. Gate it on the same
  \`isActive\` the rung's fetches are gated on, or a hidden tab re-reads data
  nobody is looking at. Defaults to \`true\`.

## Returns

\`void\`

## Example

\`\`\`ts
useRefreshSubject('the apps list', () => void loadApps(true), isActive);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRefreshSubject / RefreshSubject

# Interface: RefreshSubject

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L25)

What the app-level refresh control acts on right now.

## Properties

### name

> **name**: \`string\`

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L34)

What the control is pointed at, in the reader's words — \`Payments Team\`,
\`the apps list\`.

Used **only** for the control's tooltip and accessible name
(\`Refresh Payments Team\`), never as visible label text in the chrome band:
that band describes the live Okta tab, not the entity being browsed.

***

### run

> **run**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRefreshSubject.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRefreshSubject.ts#L36)

Re-read whatever the rung is showing. Fired on press; never called on its own.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleImpact / useRuleImpact

# Function: useRuleImpact()

> **useRuleImpact**(\`captureRuleImpact\`): \`UseRuleImpactReturn\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L63)

Manage the rule-impact-preview modal lifecycle.

## Parameters

### captureRuleImpact

\`CaptureRuleImpact\`

The read-only capture operation from \`useOktaApi\`.

## Returns

\`UseRuleImpactReturn\`

State and \`open\`/\`close\` controls for a RuleImpactModal.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleImpact / RuleImpactProgress

# Interface: RuleImpactProgress

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L25)

Progress of the target-group member load.

## Properties

### current

> **current**: \`number\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L26)

***

### total

> **total**: \`number\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L27)

***

### message

> **message**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L28)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleImpact / UseRuleImpactReturn

# Interface: UseRuleImpactReturn

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L38)

Return shape of useRuleImpact.

## Properties

### rule

> **rule**: \`RuleImpactInput\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L40)

The rule currently under examination, or null when the modal is closed.

***

### mode

> **mode**: \`RuleImpactMode\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L42)

Preview vs deactivation-confirmation intent.

***

### status

> **status**: \`RuleImpactStatus\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L44)

Async status of the capture.

***

### summary

> **summary**: \`RuleImpactSummary\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L46)

The captured summary once \`status === 'done'\`.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L48)

Human-readable error when \`status === 'error'\`.

***

### progress

> **progress**: \`RuleImpactProgress\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:50](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L50)

Load progress while \`status === 'loading'\`.

***

### open

> **open**: (\`rule\`, \`mode\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L52)

Open the modal for a rule and immediately capture its impact.

#### Parameters

##### rule

\`RuleImpactInput\`

##### mode

\`RuleImpactMode\`

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L54)

Close the modal and reset state.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleImpact / RuleImpactMode

# Type Alias: RuleImpactMode

> **RuleImpactMode** = \`"preview"\` \\| \`"deactivate"\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L19)

Why the impact modal is open: a read-only look, or a deactivation gate.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleImpact / RuleImpactStatus

# Type Alias: RuleImpactStatus

> **RuleImpactStatus** = \`"idle"\` \\| \`"loading"\` \\| \`"done"\` \\| \`"error"\`

Defined in: [src/sidepanel/hooks/useRuleImpact.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleImpact.ts#L22)

Lifecycle of the impact capture.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleLifecycle / useRuleLifecycle

# Function: useRuleLifecycle()

> **useRuleLifecycle**(\`__namedParameters\`): \`UseRuleLifecycleReturn\`

Defined in: [src/sidepanel/hooks/useRuleLifecycle.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleLifecycle.ts#L87)

Build the rule activate/deactivate actions, each logging an undo entry and an
audit-trail record and reloading the rule list on success.

## Parameters

### \\_\\_namedParameters

\`UseRuleLifecycleOptions\`

## Returns

\`UseRuleLifecycleReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / mergeOutcome

# Function: mergeOutcome()

> **mergeOutcome**(\`result\`): \`VerbOutcome\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L125)

The results for a merge that ran, without its follow-ups.

## Parameters

### result

\`RuleMergeResult\`

## Returns

\`VerbOutcome\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / useRuleMerge

# Function: useRuleMerge()

> **useRuleMerge**(\`options\`): \`RuleMerge\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:334](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L334)

Drive merges of duplicate rules through one \`VerbRunner\`.

## Parameters

### options

\`UseRuleMergeOptions\`

See UseRuleMergeOptions.

## Returns

\`RuleMerge\`

The run machine, its basket, the opener, and the merged sets.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / MergeSetRequest

# Interface: MergeSetRequest

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L68)

What the rung asks to merge.

## Extends

- \`RuleMergeRequest\`

## Properties

### ruleIds

> **ruleIds**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L67)

Every rule in the set, the kept one included.

#### Inherited from

\`RuleMergeRequest\`.\`ruleIds\`

***

### keptRuleId

> **keptRuleId**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L69)

The rule to keep.

#### Inherited from

\`RuleMergeRequest\`.\`keptRuleId\`

***

### nextName?

> \`optional\` **nextName?**: \`string\`

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L71)

The kept rule's new name, or omitted to leave it.

#### Inherited from

\`RuleMergeRequest\`.\`nextName\`

***

### takenNames?

> \`optional\` **takenNames?**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/ruleMergeRun.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/ruleMergeRun.ts#L73)

Names of every other loaded rule, for the \`name-taken\` check.

#### Inherited from

\`RuleMergeRequest\`.\`takenNames\`

***

### setKey

> **setKey**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L70)

The set's key, so the rung can show the merged summary in its place.

***

### rules

> **rules**: readonly \`FormattedRule\`[]

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L72)

The set's rules, for names before anything is read.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / MergedSummary

# Interface: MergedSummary

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L76)

What the rung shows in a merged set's place.

## Properties

### setKey

> **setKey**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L77)

***

### keptName

> **keptName**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L78)

***

### groupCount

> **groupCount**: \`number\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L79)

***

### retiredNames

> **retiredNames**: \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L80)

***

### unretiredNames

> **unretiredNames**: \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L81)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / RuleMerge

# Interface: RuleMerge

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:97](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L97)

What useRuleMerge hands the rung.

## Properties

### run

> **run**: \`VerbRun\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:99](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L99)

The run machine, for \`VerbRunner\`.

***

### basket

> **basket**: \`SelectionBasket\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L101)

The empty basket the one-off verb runs against. Also \`VerbRunner\`'s \`basket\`.

***

### startMerge

> **startMerge**: (\`request\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:103](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L103)

Open the merge confirm for one set.

#### Parameters

##### request

\`MergeSetRequest\`

#### Returns

\`void\`

***

### merged

> **merged**: readonly \`MergedSummary\`[]

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L105)

Sets merged in this visit, newest last.

***

### actorNotice

> **actorNotice**: \`AlertMessageData\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L110)

Non-blocking notice when the last run could not name the acting admin
(\`D-013c\`). The merge ran either way; the audit entry carries no actor.

***

### dismissActorNotice

> **dismissActorNotice**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:112](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L112)

Dismiss RuleMerge.actorNotice.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleMerge / UseRuleMergeOptions

# Interface: UseRuleMergeOptions

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L85)

Options for useRuleMerge.

## Properties

### api

> **api**: \`object\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L87)

The rung's one Okta client — shared, never a second instance.

#### isLoading

> **isLoading**: \`boolean\`

#### isCancelled

> **isCancelled**: \`boolean\`

#### cancelOperation

> **cancelOperation**: () => \`void\`

##### Returns

\`void\`

#### makeApiRequest

> **makeApiRequest**: (\`endpoint\`, \`options\`) => \`Promise\`\\<\`RequestResult\`\\> = \`coreApi.makeApiRequest\`

##### Parameters

###### endpoint

\`string\`

###### options

\`MakeApiRequestOptions\`

##### Returns

\`Promise\`\\<\`RequestResult\`\\>

#### runOperation

> **runOperation**: \\<\`T\`, \`R\`\\>(\`name\`, \`items\`, \`task\`, \`options?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`T\`, \`R\`\\>\\> = \`coreApi.runOperation\`

##### Type Parameters

###### T

\`T\`

###### R

\`R\`

##### Parameters

###### name

\`string\`

###### items

\`T\`[]

###### task

(\`item\`, \`index\`, \`planId?\`) => \`Promise\`\\<\`R\`\\>

###### options?

\`RunOperationOptions\`\\<\`T\`\\>

##### Returns

\`Promise\`\\<\`BatchOutcome\`\\<\`T\`, \`R\`\\>\\>

#### getCurrentUser

> **getCurrentUser**: () => \`Promise\`\\<\`Actor\`\\> = \`coreApi.getCurrentUser\`

##### Returns

\`Promise\`\\<\`Actor\`\\>

#### getAllGroupMembers

> **getAllGroupMembers**: (\`groupId\`, \`options\`) => \`Promise\`\\<\`OktaUser\`[]\\> = \`groupMemberOps.getAllGroupMembers\`

Fetch every member of a group, following \`Link\` pagination (200 per page).

##### Parameters

###### groupId

\`string\`

Group whose members to load.

###### options?

###### memberCount?

\`number\`

###### planId?

\`string\`

###### onPage?

(\`membersSoFar\`) => \`void\`

##### Returns

\`Promise\`\\<\`OktaUser\`[]\\>

All members across all pages. Each row carries Okta's own rule
attribution under \`_embedded['group-rules']\` — see
module:shared/membership/memberRuleAttribution.

##### Remarks

Emits per-page \`onResult\` progress. Throws on the first failed page.

Requests \`expand=group-rules\`, the private parameter the Okta admin console
uses for its own "assigned by rule" column. It rides on the listing this
method already issues, so attribution costs **no extra requests** — pinned by
\`useGroupSource.requestCount.test.ts\`.

\`options.onPage\` receives every member read so far, as a new array, after each
page — a prefix of the roster for a list to paint, never the roster. It costs
no request; the walk is the same walk.

#### getMembershipRuleProof

> **getMembershipRuleProof**: (\`groupId\`, \`userId\`) => \`Promise\`\\<\`MemberRuleAttribution\`\\> = \`groupMemberOps.getMembershipRuleProof\`

Ask Okta which rules manage **one** user's membership of **one** group.

\`GET /api/v1/groups/{groupId}/users/{userId}/group-rules\` is the documented
per-membership counterpart to the \`expand=group-rules\` embed
getAllGroupMembers rides on, and the user-detail page's only route to
an authoritative answer — \`GET /api/v1/users/{id}/groups\` carries no embed.

**One call per membership, so never run it for a whole list.** A 40-group
user would be 40 requests; callers gate it behind an explicit per-row action.

##### Parameters

###### groupId

\`string\`

The group whose membership is in question.

###### userId

\`string\`

The member.

##### Returns

\`Promise\`\\<\`MemberRuleAttribution\`\\>

The three-state MemberRuleAttribution, read through the same
interpreter as the embed so \`no-rules\` (Okta asserting a manual add) can
never collapse into \`unknown\`. A failed request is \`unknown\` — the absence of
an answer, never an answer.

##### Remarks

Never throws: the caller is a UI affordance and the honest failure
mode is "Okta did not answer".

#### removeUserFromGroup

> **removeUserFromGroup**: (\`groupId\`, \`groupName\`, \`user\`, \`skipUndoLog\`, \`planId?\`) => \`Promise\`\\<\`RequestResult\`\\> = \`groupMemberOps.removeUserFromGroup\`

Remove a single user from a group (DELETE membership).

##### Parameters

###### groupId

\`string\`

Target group id.

###### groupName

\`string\`

Human-readable name, used in the undo-log description.

###### user

\`OktaUser\`

The member to remove.

###### skipUndoLog?

\`boolean\` = \`false\`

When \`true\`, suppresses the per-user undo entry; bulk
callers set this and log one aggregate undo action at the end.

###### planId?

\`string\`

##### Returns

\`Promise\`\\<\`RequestResult\`\\>

The raw \`RequestResult\`; inspect \`success\`/\`status\` for outcome.

#### removeUserFromGroups

> **removeUserFromGroups**: (\`userId\`, \`groupIds\`, \`onProgress?\`) => \`Promise\`\\<\`BatchOutcome\`\\<\`string\`, \`void\`\\>\\> = \`groupMemberOps.removeUserFromGroups\`

Remove one user from several groups as a single tracked, cancellable
operation (CoreApi.runOperation → activity bar + Cancel).

##### Parameters

###### userId

\`string\`

The user to remove.

###### groupIds

\`string\`[]

Groups to remove the user from, processed in order.

###### onProgress?

(\`completed\`, \`total\`) => \`void\`

Optional \`(completed, total)\` callback fired after each
successful removal.

##### Returns

\`Promise\`\\<\`BatchOutcome\`\\<\`string\`, \`void\`\\>\\>

The full BatchOutcome (never throws for control flow —
inspect \`results\` / \`cancelled\`); callers that need the legacy
throw-on-first-rejection contract re-raise from \`results\`.

##### Remarks

Semantics pinned by GroupsTab characterization tests — do not
"fix" here:
- DELETEs run sequentially (\`concurrency: 1\`) in the given group order.
- The first *rejected* request halts the remaining groups (\`stopOnError\`).
- A \`success: false\` response (no throw) still counts as processed and the
  run carries on.
- No per-group undo entry is logged.

#### addUserToGroup

> **addUserToGroup**: (\`groupId\`, \`groupName\`, \`user\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`groupMemberOps.addUserToGroup\`

Add a user to a group (PUT membership) and log an undo action on success.

##### Parameters

###### groupId

\`string\`

Target group id.

###### groupName

\`string\`

Human-readable name for undo/result messages.

###### user

The user to add (id + profile fields).

###### id

\`string\`

###### profile

\\{ \`login\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`email\`: \`string\`; \\}

###### profile.login

\`string\`

###### profile.firstName

\`string\`

###### profile.lastName

\`string\`

###### profile.email

\`string\`

##### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\` distilled from the underlying request.

#### removeDeprovisioned

> **removeDeprovisioned**: (...\`args\`) => \`Promise\`\\<\`void\`\\>

##### Parameters

###### args

...\\[\`string\`\\]

##### Returns

\`Promise\`\\<\`void\`\\>

#### getAllGroups

> **getAllGroups**: (\`onProgress?\`) => \`Promise\`\\<\`OktaGroup\`[]\\> = \`groupDiscoveryOps.getAllGroups\`

List every group, following \`Link\` pagination (200 per page, \`expand=stats\`).

##### Parameters

###### onProgress?

(\`loaded\`, \`total\`) => \`void\`

Called after each page with the running loaded count.

##### Returns

\`Promise\`\\<\`OktaGroup\`[]\\>

All groups across all pages.

##### Remarks

Throws on the first failed page.

#### getGroupMemberCount

> **getGroupMemberCount**: (\`groupId\`) => \`Promise\`\\<\`number\`\\> = \`groupDiscoveryOps.getGroupMemberCount\`

Approximate a group's member count from the first page of members.

##### Parameters

###### groupId

\`string\`

Group to size.

##### Returns

\`Promise\`\\<\`number\`\\>

The first-page member count (max 200), or \`0\` on failure.

##### Remarks

Intentionally does NOT walk pagination — for groups larger than one
page this returns the page size (200), i.e. a floor, not the exact total.

#### ensureGroupRulesLoaded

> **ensureGroupRulesLoaded**: () => \`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\> = \`groupDiscoveryOps.ensureGroupRulesLoaded\`

The org's display rules, read through the panel's one org-rules source.

Exists for callers that attribute rules across many groups: without it, a
cold start leaves every row's \`hasRules\`/\`ruleCount\` reading \`0\` —
indistinguishable from "no rule feeds this group".

##### Returns

\`Promise\`\\<\`FormattedRule\`[] \\| \`null\`\\>

The org-wide display rules, or \`null\` when they could not be read
(logged, never thrown) so callers can carry on without rule attribution
rather than failing the whole load. \`null\` is never \`[]\`: an org with no
rules is a real answer, a failed read is not.

##### Remarks

Costs nothing when the snapshot can answer and at most one
paginated rules listing for the whole org otherwise — never one request per
group.

#### getGroupRulesForGroup

> **getGroupRulesForGroup**: (\`groupId\`) => \`Promise\`\\<\`FormattedRule\`[]\\> = \`groupDiscoveryOps.getGroupRulesForGroup\`

Resolve the group rules that assign users to a given group.

##### Parameters

###### groupId

\`string\`

Group whose inbound assignment rules to find.

##### Returns

\`Promise\`\\<\`FormattedRule\`[]\\>

Matching rules in the FormattedRule display shape, or \`[]\`
on failure/none.

##### Remarks

Filters the org-wide payload from loadOrgRules, so two
concurrent lookups — a group open issues two — share one read, and a cold
org costs one rules walk between them. The payload is the *formatted* shape:
\`userAttributes\` is synthesised during formatting, and
\`membershipAnalysis.inferBestMatchRule\` degrades to a positional guess
without it.

#### executeBulkOperation

> **executeBulkOperation**: (\`operation\`, \`onProgress?\`) => \`Promise\`\\<\`BulkGroupResult\`[]\\> = \`groupBulkOps.executeBulkOperation\`

Apply one BulkOperation across each of its target groups.

##### Parameters

###### operation

\`BulkOperation\`

The operation type + target group ids (+ optional config).

###### onProgress?

(\`current\`, \`total\`, \`currentGroupName\`) => \`void\`

Called per group with \`(index, total, currentGroupName)\`.

##### Returns

\`Promise\`\\<\`BulkGroupResult\`[]\\>

One \`BulkGroupResult\` per target group, in input order.

##### Remarks

Groups are processed sequentially; within a group,
\`cleanup_inactive\` removals run through CoreApi.runOperation, so they
are rate-limited, activity-bar visible, and cancellable. Supported \`type\`s:
\`cleanup_inactive\` (remove
\`DEPROVISIONED\`/\`SUSPENDED\`/\`LOCKED_OUT\` members), \`export_all\` (attach the
member list to the result), and \`remove_user\` (drop one user by
\`config.userId\`); unknown types yield a \`failed\` result. A thrown error for
one group is captured as that group's failed result and does not abort the rest.

#### searchGroups

> **searchGroups**: (\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`groupDiscoveryOps.searchGroups\`

Search groups by name via Okta's \`q\` query (capped at 20 results).

##### Parameters

###### query

\`string\`

Search text; queries shorter than 2 chars short-circuit to \`[]\`.

##### Returns

\`Promise\`\\<\`object\`[]\\>

Lightweight \`{ id, name, description, type }\` records; \`[]\` on error.

#### getGroupById

> **getGroupById**: (\`groupId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description\`: \`string\`; \`type\`: \`string\`; \\} \\| \`null\`\\> = \`groupDiscoveryOps.getGroupById\`

Fetch one group by id.

##### Parameters

###### groupId

\`string\`

Group id to look up.

##### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`name\`: \`string\`; \`description\`: \`string\`; \`type\`: \`string\`; \\} \\| \`null\`\\>

A lightweight \`{ id, name, description, type }\` record, or \`null\` if
not found / on error.

#### getUserLastLogin

> **getUserLastLogin**: (\`userId\`) => \`Promise\`\\<\`Date\` \\| \`null\`\\> = \`userOps.getUserLastLogin\`

Read a user's last-login timestamp.

##### Parameters

###### userId

\`string\`

User to inspect.

##### Returns

\`Promise\`\\<\`Date\` \\| \`null\`\\>

The \`lastLogin\` as a \`Date\`, or \`null\` if never logged in / on error.

#### getUserApps

> **getUserApps**: (\`userId\`) => \`Promise\`\\<\`UserAppsResult\`\\> = \`userOps.getUserApps\`

List all apps assigned to a user (id + display label + assignment scope).

##### Parameters

###### userId

\`string\`

User whose apps to list.

##### Returns

\`Promise\`\\<\`UserAppsResult\`\\>

A UserAppsResult. A failed or part-way-failed walk resolves
with \`complete: false\` and whatever was collected — it never rejects, and
never reports a failure as an empty list. Each entry carries an optional
AppAssignmentScope; Okta reports one scope per app-user and prefers
\`'USER'\` when both paths exist, so \`'USER'\` must never be rendered as
"direct only".

##### Remarks

Reflects effective assignments (direct + via group) from the apps
filter endpoint, following \`Link\` pagination (200 per page).

\`expand=user/{userId}\` embeds the app-user object on each row at no extra
request (\`appLinks\` does not support \`expand\`). A missing or malformed embed
leaves \`scope\` undefined and never drops the app. Pages 2+ are re-issued from
Okta's \`rel="next"\` cursor, which carries the embed only if Okta echoes
\`expand\` back; if it stops, the consequence is \`scope: undefined\` past page 1
and no lost apps, so the cursor URL is not rewritten.

#### batchGetUserDetails

> **batchGetUserDetails**: (\`userIds\`, \`onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`OktaUser\`\\>\\> = \`userOps.batchGetUserDetails\`

Fetch full details for many users, keyed by id.

##### Parameters

###### userIds

\`string\`[]

Users to load.

###### onProgress?

(\`current\`, \`total\`) => \`void\`

Called with \`(processed, total)\` every third settled user
and at completion.

##### Returns

\`Promise\`\\<\`Map\`\\<\`string\`, \`OktaUser\`\\>\\>

Map of userId → OktaUser; ids that fail to load **or fail
validation** are omitted, so every value in the map is a parsed user rather
than whatever Okta happened to return.

##### Remarks

Runs through CoreApi.runOperation at \`low\` priority so it
never starves interactive work. A cancel returns the partial map; a per-user
failure is logged and its id omitted, never thrown.

Each response is parsed with \`oktaUserSchema\` — the same treatment
\`profileOperations.getUserRaw\` gives this endpoint — because a value read
here can reach a write (the bulk membership verb preflights through it). A
row that fails is dropped and logged by id, issue path and issue code only;
the body is never logged.

#### scanGroupMfa

> **scanGroupMfa**: (\`userIds\`, \`_onProgress?\`) => \`Promise\`\\<\`Map\`\\<\`string\`, \`MemberMfaResult\`\\>\\> = \`userOps.scanGroupMfa\`

Scan MFA factor enrollment for a list of users.

##### Parameters

###### userIds

\`string\`[]

Users to scan.

###### \\_onProgress?

(\`current\`, \`total\`) => \`void\`

##### Returns

\`Promise\`\\<\`Map\`\\<\`string\`, \`MemberMfaResult\`\\>\\>

Map of userId → MemberMfaResult (summarized via summarizeFactors).

##### Remarks

Costs one API call per user (\`GET /api/v1/users/{id}/factors\`), run
through CoreApi.runOperation at \`low\` priority. Responses are
validated with oktaFactorSchema: a malformed row is dropped and a
non-array response degrades to zero factors, same as a fetch failure.

#### getUserGroupMemberships

> **getUserGroupMemberships**: (\`userId\`) => \`Promise\`\\<\`number\`\\> = \`userOps.getUserGroupMemberships\`

Count a user's group memberships.

##### Parameters

###### userId

\`string\`

User to inspect.

##### Returns

\`Promise\`\\<\`number\`\\>

Exact membership count, read from the \`x-total-count\` header of a
\`limit=1\` request (avoids paging the full list); \`0\` on error.

#### searchUsers

> **searchUsers**: (\`query\`) => \`Promise\`\\<\`object\`[]\\> = \`userOps.searchUsers\`

Search users by name, email, or login via Okta's \`q\` query (capped at 20).

##### Parameters

###### query

\`string\`

Search text; queries shorter than 2 chars short-circuit to \`[]\`.

##### Returns

\`Promise\`\\<\`object\`[]\\>

Flattened \`{ id, email, firstName, lastName, login, status }\` records; \`[]\` on error.

#### getUserById

> **getUserById**: (\`userId\`) => \`Promise\`\\<\\{ \`id\`: \`string\`; \`email\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`login\`: \`string\`; \`status\`: \`string\`; \\} \\| \`null\`\\> = \`userOps.getUserById\`

Fetch one user by id.

##### Parameters

###### userId

\`string\`

User id to look up.

##### Returns

\`Promise\`\\<\\{ \`id\`: \`string\`; \`email\`: \`string\`; \`firstName\`: \`string\`; \`lastName\`: \`string\`; \`login\`: \`string\`; \`status\`: \`string\`; \\} \\| \`null\`\\>

A flattened \`{ id, email, firstName, lastName, login, status }\`
record, or \`null\` if not found / on error.

#### getUserProfileSchema

> **getUserProfileSchema**: () => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`definitions\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`base\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \`custom\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \`properties\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`profile\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\> \\| \`null\`\\> = \`profileOps.getUserProfileSchema\`

Read the org's user-profile schema — the definition of every base and
org-defined (custom) profile attribute.

##### Returns

\`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`definitions\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`base\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \`custom\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`base\`: \`ZodOptional\`\\<...\\>; \`custom\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \`properties\`: \`ZodOptional\`\\<\`ZodObject\`\\<\\{ \`profile\`: \`ZodOptional\`\\<\`ZodObject\`\\<..., ..., ..., ..., ...\\>\\>; \\}, \`"passthrough"\`, \`ZodTypeAny\`, \`objectOutputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>, \`objectInputType\`\\<\\{ \`profile\`: \`ZodOptional\`\\<...\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>\\>\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\> \\| \`null\`\\>

The validated OktaUserProfileSchema, or \`null\` when the
request fails, returns no data, or returns a payload that does not validate.
Never throws.

##### Remarks

One org-wide \`GET /api/v1/meta/schemas/user/default\`, the only way
to learn about an attribute that is **unset** on the user being viewed — such
an attribute is absent from that user's \`profile\` object. Cache under
\`cacheKeys.userSchema(oktaOrigin)\` (org-wide, \`TTL_LONG\`).

\`null\` is a first-class answer: the caller falls back to
\`BASE_PROFILE_ATTRIBUTES\`, so a schema failure costs custom-attribute
discovery, never the view. Validation is lenient — a malformed property is
dropped and the rest kept. Nothing about the response body is logged.

#### getUserRaw

> **getUserRaw**: (\`userId\`, \`options\`) => \`Promise\`\\<\`OktaUser\` \\| \`null\`\\> = \`profileOps.getUserRaw\`

Fetch one user by id as a **whole, validated** OktaUser.

##### Parameters

###### userId

\`string\`

User id to look up.

###### options?

\`planId\` attributes the request to a declared plan;
\`reason\` overrides the default activity-bar label.

###### planId?

\`string\`

###### reason?

\`string\`

##### Returns

\`Promise\`\\<\`OktaUser\` \\| \`null\`\\>

The validated user, or \`null\` when the request fails, returns no
data, or returns a payload that does not validate. Never throws.

##### Remarks

Separate from \`userOperations.getUserById\`, which returns a flat
six-field projection; an editor needs the whole \`profile\` object plus
\`credentials.provider\` to decide what is editable.

Validation is strict, not lenient: this value seeds an edit form whose diff
becomes a write, so \`null\` beats a half-understood profile.
\`oktaUserSchema\`'s \`credentials\` block is not \`.passthrough()\`, so
\`credentials.password\` / \`recovery_question\` never reach React state.

#### loadQualificationSubject

> **loadQualificationSubject**: (\`userId\`) => \`Promise\`\\<\`QualificationSubjectResult\`\\> = \`qualificationSubjectOps.loadQualificationSubject\`

Load a user and their complete group list under one two-leg plan.

##### Parameters

###### userId

\`string\`

##### Returns

\`Promise\`\\<\`QualificationSubjectResult\`\\>

The validated user and every group they hold, or the leg that
  failed. \`user-not-found\` also covers a payload that did not validate —
  \`getUserRaw\` folds both into \`null\` and logs which.

#### updateUserProfile

> **updateUserProfile**: (\`userId\`, \`patch\`) => \`Promise\`\\<\`UpdateProfileResult\`\\> = \`profileOps.updateUserProfile\`

Write a **sparse patch** of profile attributes onto a user.

##### Parameters

###### userId

\`string\`

User to update.

###### patch

\`Record\`\\<\`string\`, \`unknown\`\\>

Attribute name → new value, containing **only** the changed
attributes.

##### Returns

\`Promise\`\\<\`UpdateProfileResult\`\\>

An UpdateProfileResult — \`'saved'\`, \`'failed'\`, or
\`'unknown'\`. See the module header; \`'unknown'\` means the write may have
applied and must never be shown as a plain failure.

##### Throws

Before issuing any request, when \`patch\` is empty or contains a
security-sensitive key (see assertNoExcludedKeys). Both rejections
are strictly pre-flight, so neither can be confused with \`'unknown'\`.

##### Remarks

**Merge semantics.** Okta documents \`POST /api/v1/users/{id}\` with
\`{ profile: patch }\` as a partial update: absent attributes are left
untouched. This repo has not exercised that against a live org. Were it to
replace instead, the fix is confined to this function body — send the full
profile merged with the patch, minus every attribute whose schema
\`mutability !== 'READ_WRITE'\`.

The response is validated with \`oktaUserSchema\`; the returned user is what
the caller renders as the new truth.

#### searchApps

> **searchApps**: (\`query\`) => \`Promise\`\\<\`AppSummary\`[]\\> = \`appOps.searchApps\`

Type-ahead search over apps by name/label (\`q=\` prefix match).

##### Parameters

###### query

\`string\`

The search text; queries shorter than 2 chars return \`[]\`.

##### Returns

\`Promise\`\\<\`AppSummary\`[]\\>

Up to 20 matching app summaries; \`[]\` on error (never throws).

#### suspendUser

> **suspendUser**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.suspendUser\`

Suspend an active user, preventing them from signing in.

##### Parameters

###### userId

\`string\`

User to suspend.

##### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

##### Remarks

Only valid for users in \`ACTIVE\` status.

#### unsuspendUser

> **unsuspendUser**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.unsuspendUser\`

Unsuspend a suspended user, restoring their ability to sign in.

##### Parameters

###### userId

\`string\`

User to unsuspend.

##### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

##### Remarks

Only valid for users in \`SUSPENDED\` status.

#### resetPassword

> **resetPassword**: (\`userId\`) => \`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\> = \`userOps.resetPassword\`

Trigger a password-reset email for the user.

##### Parameters

###### userId

\`string\`

User to send the reset link to.

##### Returns

\`Promise\`\\<\\{ \`success\`: \`boolean\`; \`error?\`: \`string\`; \\}\\>

\`{ success, error? }\`.

##### Remarks

Sends an email with a one-time reset link (\`sendEmail=true\`). Valid
for \`ACTIVE\` and \`RECOVERY\` status users.

#### setUserPassword

> **setUserPassword**: (\`userId\`, \`password\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.setUserPassword\`

Set a user's password directly, without validating the current one.

The administrative set — the operation for an account whose mailbox cannot
be reached, which is what a reset email assumes. Takes effect immediately.

##### Parameters

###### userId

\`string\`

User whose password to set.

###### password

\`string\`

The new value. Never logged, never returned, never stored.

##### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult.

##### Remarks

Rejected values come back as \`'failed'\` carrying Okta's own policy
message, which names the rule that was broken.

#### expirePassword

> **expirePassword**: (\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePassword\`

Expire a user's password, forcing a change at next sign-in.

##### Parameters

###### userId

\`string\`

User whose password to expire.

##### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult; never carries a temporary password.

##### Remarks

Paired after setUserPassword when the value typed is a
handoff rather than a permanent password.

#### expirePasswordWithTempPassword

> **expirePasswordWithTempPassword**: (\`userId\`) => \`Promise\`\\<\`PasswordWriteResult\`\\> = \`passwordOps.expirePasswordWithTempPassword\`

Expire a user's password and have Okta generate a one-time replacement.

##### Parameters

###### userId

\`string\`

User whose password to expire.

##### Returns

\`Promise\`\\<\`PasswordWriteResult\`\\>

PasswordWriteResult; \`'saved-with-temp'\` carries the value.

##### Remarks

The returned value is shown once and never persisted. An accepted
call that names no value is \`'unknown'\`, not success — there is nothing to
read out.

#### getAppById

> **getAppById**: (\`appId\`) => \`Promise\`\\<\`AppLookup\`\\> = \`appOps.getAppById\`

Fetch one app by id.

##### Parameters

###### appId

\`string\`

App instance id to look up.

##### Returns

\`Promise\`\\<\`AppLookup\`\\>

An AppLookup saying which of the four outcomes happened.
Never throws.

##### Remarks

Strict parseOkta against the lenient list-item schema,
logging the outcome only. A 404 is the only answer that earns \`missing\`; a
401 is \`session-expired\` (via isSessionExpired, so 403 and 429 are
not mistaken for it); everything else, validation failure included, is
\`failed\` with the status that caused it.

#### getAppAssignmentCounts

> **getAppAssignmentCounts**: (\`appId\`) => \`Promise\`\\<\`AppAssignmentCounts\` \\| \`null\`\\> = \`appOps.getAppAssignmentCounts\`

Count the users and groups assigned to an app.

##### Parameters

###### appId

\`string\`

App to size.

##### Returns

\`Promise\`\\<\`AppAssignmentCounts\` \\| \`null\`\\>

\`{ users, groups }\`, or \`null\` if either count could not be
obtained. Never throws.

##### Remarks

Each collection is counted independently by
countAssignments, so one may probe while the other falls back.
Issued at \`low\` priority so this bulk read yields to interactive work.

A walked count reflects *validated* rows; a probed count is Okta's own total
and is not filtered that way, so the two paths can disagree by however many
rows an org sends that fail validation.

#### getAppGroupAssignments

> **getAppGroupAssignments**: (\`appId\`, \`planId?\`) => \`Promise\`\\<\`string\`[] \\| \`null\`\\> = \`appOps.getAppGroupAssignments\`

List the ids of every group assigned to an app.

**Fallback only.** The primary answer to "which group grants this app?" is
\`grantGroupId\` off \`userOperations.getUserApps\`, for zero extra requests.
This answers a strictly weaker question — the groups assigned to the app,
not the group that granted it to a particular user — so intersecting it with
a user's memberships narrows candidates without naming the grantor.

**Gate it behind an explicit, per-row action.** It costs at least one
request per app (more past 200 assigned groups), so firing it across a
user's app list is linear in app count.

##### Parameters

###### appId

\`string\`

App whose group assignments to list.

###### planId?

\`string\`

##### Returns

\`Promise\`\\<\`string\`[] \\| \`null\`\\>

Every assigned group id across all pages, or \`null\` when the walk
failed. Never throws.

##### Remarks

\`null\` and \`[]\` are different answers: \`[]\` is Okta reporting **no
groups assigned**, \`null\` is **no answer**. Rows are validated with
oktaAppGroupAssignmentSchema, so a malformed row is dropped rather
than failing the walk. Issued at \`low\` priority. Cache under
\`cacheKeys.appGroups(appId)\`.

#### fetchAppAssertion

> **fetchAppAssertion**: (\`appId\`, \`oktaOrigin?\`) => \`Promise\`\\<\`SamlTraceResult\`\\> = \`samlOps.fetchAppAssertion\`

##### Parameters

###### appId

\`string\`

###### oktaOrigin?

\`string\`

##### Returns

\`Promise\`\\<\`SamlTraceResult\`\\>

#### listPolicies

> **listPolicies**: (\`type\`) => \`Promise\`\\<\`PolicyListResult\`\\> = \`policyOps.listPolicies\`

List every policy of one type, following \`Link\` pagination (200 per page).

##### Parameters

###### type?

\`"ACCESS_POLICY"\` \\| \`"OKTA_SIGN_ON"\` \\| \`"MFA_ENROLL"\` \\| \`"PASSWORD"\`

Policy type to list; defaults to \`'ACCESS_POLICY'\`.

##### Returns

\`Promise\`\\<\`PolicyListResult\`\\>

A PolicyListResult — never throws. \`listed\` carries every
validated policy across all pages (an empty array meaning Okta reported
none); \`forbidden\` means the admin role may not read policies; \`failed\`
carries the message for anything else.

##### Remarks

Issued at \`normal\` priority. Each page is validated with
oktaPolicyListItemSchema, so malformed rows are dropped leniently
rather than thrown on. The 403 costs nothing to detect: the status rode in on
the response that failed the walk.

#### getPolicyRules

> **getPolicyRules**: (\`policyId\`) => \`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`conditions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`actions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\> = \`policyOps.getPolicyRules\`

Read the rules attached to one policy.

##### Parameters

###### policyId

\`string\`

Policy whose rules to read.

##### Returns

\`Promise\`\\<\`objectOutputType\`\\<\\{ \`id\`: \`ZodString\`; \`name\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`status\`: \`ZodOptional\`\\<\`ZodString\`\\>; \`priority\`: \`ZodOptional\`\\<\`ZodNullable\`\\<\`ZodNumber\`\\>\\>; \`system\`: \`ZodOptional\`\\<\`ZodBoolean\`\\>; \`conditions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \`actions\`: \`ZodOptional\`\\<\`ZodUnknown\`\\>; \\}, \`ZodTypeAny\`, \`"passthrough"\`\\>[]\\>

The validated rules; \`[]\` on failure (never throws).

##### Remarks

Single request at \`normal\` priority — the rules endpoint is not
paginated in practice (a policy holds a handful of rules).

#### getAppAccessPolicyId

> **getAppAccessPolicyId**: (\`appId\`) => \`Promise\`\\<\`string\` \\| \`null\`\\> = \`policyOps.getAppAccessPolicyId\`

Resolve the id of the access policy attached to an app.

##### Parameters

###### appId

\`string\`

App to inspect.

##### Returns

\`Promise\`\\<\`string\` \\| \`null\`\\>

The access policy id, or \`null\` when the app has no access policy
link, the link is unparseable, the extracted id does not look like an Okta
policy id, or the request fails. Never throws.

##### Remarks

Okta exposes the attachment only as \`_links.accessPolicy.href\` on
\`GET /api/v1/apps/{id}\`; parsing and validation live in the pure
extractAccessPolicyId. Prefer that helper when the app record is
already in hand — this wrapper costs a request.

#### fetchExportRows

> **fetchExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`, \`onPage?\`) => \`Promise\`\\<\`FetchAllResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchAllRows\`

Fetch every row for a resolved endpoint, paginating on the \`Link\` header.

Uses \`'low'\` priority so bulk export reads never starve interactive UI, checks
cancellation between pages, and validates each page in the side panel.

##### Type Parameters

###### Row

\`Row\`

##### Parameters

###### descriptor

\`EntityExport\`\\<\`Row\`\\>

The entity descriptor (supplies the schema and cap).

###### resolvedEndpoint

\`string\`

First-page endpoint from \`buildExportEndpoint\`.

###### onPage?

(\`rowsSoFar\`) => \`void\`

Optional callback with the running row count after each page.

##### Returns

\`Promise\`\\<\`FetchAllResult\`\\<\`Row\`\\>\\>

Validated rows plus dropped/capped diagnostics.

#### fetchSelectionExportRows

> **fetchSelectionExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`basket\`, \`onProgress?\`) => \`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\> = \`exportEngineOps.fetchSelectionRows\`

Read a \`from-selection\` export: one request per ticked entity, in the
basket's pick order, over the rate-limited fan-out.

Every request goes through \`coreApi.runOperation\`, so the scheduler bounds
the concurrency, the activity bar carries the exact cost up front (the item
list is in hand — nothing is estimated), and cancellation is honoured
between ticks. A \`rows: 'list'\` tick walks its own \`Link\` header.

**A ticked entity that is gone is counted, never dropped.** A 404/410 (or a
response that fails the descriptor's zod schema) resolves that tick as
SelectionOutcome \`missing\`; any other failure throws, because a
smaller CSV produced by an expired session would be a confidently-wrong
answer rather than a shortfall.

##### Type Parameters

###### Row

\`Row\`

##### Parameters

###### descriptor

\`EntityExport\`\\<\`Row\`\\>

A \`from-selection\` descriptor.

###### basket

\`SelectionBasket\`

The current selection basket.

###### onProgress?

(\`rowsSoFar\`) => \`void\`

Optional callback with the running row count.

##### Returns

\`Promise\`\\<\`SelectionFetchResult\`\\<\`Row\`\\>\\>

The de-duplicated rows, how many ticks were requested, and which of
  them could not be read.

##### Throws

If the operation was cancelled.

#### countExportRows

> **countExportRows**: \\<\`Row\`\\>(\`descriptor\`, \`resolvedEndpoint\`) => \`Promise\`\\<\`CountResult\`\\> = \`exportEngineOps.countRows\`

Probe the first page for the live match-count under the filter box.

Deliberately fetches a single page (cheap on every keystroke); a \`count\` of 0
surfaces a filter typo, and \`hasMore\` signals the true total is larger.

##### Type Parameters

###### Row

\`Row\`

##### Parameters

###### descriptor

\`EntityExport\`\\<\`Row\`\\>

The entity descriptor (for its schema).

###### resolvedEndpoint

\`string\`

First-page endpoint from \`buildExportEndpoint\`.

##### Returns

\`Promise\`\\<\`CountResult\`\\>

First-page count and whether more pages exist.

#### runExport

> **runExport**: \\<\`Row\`\\>(\`args\`) => \`Promise\`\\<\`void\`\\> = \`exportEngineOps.runExport\`

Project rows through the enabled columns, download the CSV, and audit it.

##### Type Parameters

###### Row

\`Row\`

##### Parameters

###### args

\`RunExportArgs\`\\<\`Row\`\\>

Descriptor, fetched rows, enabled column ids, optional label.

##### Returns

\`Promise\`\\<\`void\`\\>

#### compareGroups

> **compareGroups**: (\`groups\`, \`onProgress?\`, \`memberCache?\`) => \`Promise\`\\<\`GroupComparisonResult\`\\> = \`groupAnalysisOps.compareGroups\`

Compare 2-5 groups to find overlapping and unique members.

##### Parameters

###### groups

\`object\`[]

The 2-5 \`{ id, name }\` groups to compare (throws outside that range).

###### onProgress?

(\`current\`, \`total\`, \`message?\`) => \`void\`

Called per group as members load with \`(index, total, message)\`.

###### memberCache?

\`Map\`\\<\`string\`, \`OktaUser\`[]\\>

Optional id → members cache; hits skip the fetch and misses populate it.

##### Returns

\`Promise\`\\<\`GroupComparisonResult\`\\>

A GroupComparisonResult with the full intersection, per-group
uniques, and total distinct user count.

##### Remarks

The only API cost is one paginated member fetch per uncached group.

#### searchUserAcrossGroups

> **searchUserAcrossGroups**: (\`query\`, \`groupMembersCache\`, \`groupNames\`) => \`object\`[] = \`groupAnalysisOps.searchUserAcrossGroups\`

Find users matching a query across an already-loaded group-members cache.

##### Parameters

###### query

\`string\`

Case-insensitive substring matched against email/login/first/last/full name.

###### groupMembersCache

\`Map\`\\<\`string\`, \`OktaUser\`[]\\>

Map of groupId → members to search.

###### groupNames

\`Map\`\\<\`string\`, \`string\`\\>

Map of groupId → display name for labeling results.

##### Returns

\`object\`[]

One \`{ groupId, groupName, user }\` per user-in-group match, de-duplicated per pair.

##### Remarks

Pure in-memory operation — no API calls.

#### captureRuleImpact

> **captureRuleImpact**: (\`rule\`, \`opts?\`) => \`Promise\`\\<\`RuleImpactSummary\`\\> = \`ruleImpactOps.captureRuleImpact\`

##### Parameters

###### rule

\`RuleImpactInput\`

###### opts?

\`CaptureRuleImpactOptions\`

##### Returns

\`Promise\`\\<\`RuleImpactSummary\`\\>

#### getRawGroupRule

> **getRawGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`OktaGroupRule\` \\| \`null\`\\> = \`ruleWriteOps.getRawGroupRule\`

##### Parameters

###### ruleId

\`string\`

##### Returns

\`Promise\`\\<\`OktaGroupRule\` \\| \`null\`\\>

#### createGroupRule

> **createGroupRule**: (\`payload\`) => \`Promise\`\\<\`CreateRuleResult\`\\> = \`ruleWriteOps.createGroupRule\`

##### Parameters

###### payload

\`CreateRulePayload\`

##### Returns

\`Promise\`\\<\`CreateRuleResult\`\\>

#### updateGroupRule

> **updateGroupRule**: (\`ruleId\`, \`body\`) => \`Promise\`\\<\`RuleUpdateResult\`\\> = \`ruleWriteOps.updateGroupRule\`

##### Parameters

###### ruleId

\`string\`

###### body

\`UpdateRulePayload\`

##### Returns

\`Promise\`\\<\`RuleUpdateResult\`\\>

#### deleteGroupRule

> **deleteGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deleteGroupRule\`

##### Parameters

###### ruleId

\`string\`

##### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

#### activateGroupRule

> **activateGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.activateGroupRule\`

##### Parameters

###### ruleId

\`string\`

##### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

#### deactivateGroupRule

> **deactivateGroupRule**: (\`ruleId\`) => \`Promise\`\\<\`RuleLifecycleResult\`\\> = \`ruleWriteOps.deactivateGroupRule\`

##### Parameters

###### ruleId

\`string\`

##### Returns

\`Promise\`\\<\`RuleLifecycleResult\`\\>

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L89)

The connected org's origin, or \`null\` when no tab is connected.

***

### groupName

> **groupName**: \`GroupNameLookup\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L91)

Group-name lookup for the confirm's target rows.

***

### onSettled

> **onSettled**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleMerge.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleMerge.ts#L93)

Called after every run that reached Okta, so the rules reload.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / editBlock

# Function: editBlock()

> **editBlock**(\`status\`, \`currentIds\`, \`nextIds\`): \`EditBlock\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:111](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L111)

Why a draft cannot be reviewed, checked in \`planTargetEdit\`'s order.

## Parameters

### status

\`GroupRuleStatus\`

The rule's loaded status.

### currentIds

readonly \`string\`[]

Its loaded target ids.

### nextIds

readonly \`string\`[]

The ids the draft would save.

## Returns

\`EditBlock\` \\| \`null\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / useRuleTargetEdit

# Function: useRuleTargetEdit()

> **useRuleTargetEdit**(\`rule\`, \`seed?\`): \`RuleTargetEdit\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:131](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L131)

Hold one rule's target-group draft.

Mount it keyed by the rule id, so a different rule starts with a clean draft.

## Parameters

### rule

\`FormattedRule\`

The rule on screen, as loaded.

### seed?

\`RuleTargetEditSeed\`

An initial draft, for a story or a test. Read once.

## Returns

\`RuleTargetEdit\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / RuleTargetEdit

# Interface: RuleTargetEdit

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L58)

What useRuleTargetEdit returns.

## Properties

### editMode

> **editMode**: \`boolean\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L60)

Whether the card is in edit mode.

***

### rows

> **rows**: readonly \`TargetRow\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L62)

Every row, in display order.

***

### added

> **added**: readonly \`TargetGroup\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L64)

Groups staged to add, in the order they were picked.

***

### removed

> **removed**: readonly \`TargetGroup\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L66)

Groups staged to remove, in the rule's order.

***

### nextGroupIds

> **nextGroupIds**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L68)

The rule's target group ids as they would be saved.

***

### blockedReason

> **blockedReason**: \`EditBlock\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L70)

Why the draft cannot be reviewed, or \`null\` when it can.

***

### takenIds

> **takenIds**: \`ReadonlySet\`\\<\`string\`\\>

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L72)

Ids already on the rule or staged, so a picker can leave them out.

***

### names

> **names**: \`Readonly\`\\<\`Record\`\\<\`string\`, \`string\`\\>\\>

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L74)

Display names for every id the draft mentions, keyed by id.

***

### begin

> **begin**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L76)

Enter edit mode.

#### Returns

\`void\`

***

### end

> **end**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L78)

Leave edit mode, dropping anything staged.

#### Returns

\`void\`

***

### discard

> **discard**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L80)

Drop everything staged, staying in edit mode.

#### Returns

\`void\`

***

### add

> **add**: (\`group\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L82)

Stage a group to add. A group already on the rule or staged is ignored.

#### Parameters

##### group

\`TargetGroup\`

#### Returns

\`void\`

***

### remove

> **remove**: (\`groupId\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L84)

Stage a removal, or unstage an addition.

#### Parameters

##### groupId

\`string\`

#### Returns

\`void\`

***

### restore

> **restore**: (\`groupId\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L86)

Put a staged removal back.

#### Parameters

##### groupId

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / RuleTargetEditSeed

# Interface: RuleTargetEditSeed

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:51](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L51)

A seed for a story or a test — the draft as if the reader had already staged it.

## Properties

### editMode?

> \`optional\` **editMode?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L52)

***

### added?

> \`optional\` **added?**: readonly \`TargetGroup\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L53)

***

### removedIds?

> \`optional\` **removedIds?**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L54)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / TargetGroup

# Interface: TargetGroup

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L22)

One target group as the editor knows it.

## Properties

### id

> **id**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L24)

Okta group id.

***

### name?

> \`optional\` **name?**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:26](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L26)

Display name, when one was loaded. Absent is stated, never replaced by the id.

***

### missing?

> \`optional\` **missing?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L31)

Set when the rule's loader established that the group no longer exists in
Okta (D-061). Only a kept or removed row can carry it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / TargetRow

# Interface: TargetRow

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L38)

One row of the editor, in display order: the rule's own groups, then additions.

## Properties

### group

> **group**: \`TargetGroup\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L39)

***

### change

> **change**: \`TargetRowChange\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L40)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / EditBlock

# Type Alias: EditBlock

> **EditBlock** = \`Extract\`\\<\`BlockReason\`, \`"broken"\` \\| \`"zero"\` \\| \`"over-limit"\` \\| \`"unchanged"\`\\>

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L48)

The block the editor can determine from the loaded rule alone. A subset of
BlockReason: the name checks belong to a rename, which this editor
does not offer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetEdit / TargetRowChange

# Type Alias: TargetRowChange

> **TargetRowChange** = \`"kept"\` \\| \`"added"\` \\| \`"removed"\`

Defined in: [src/sidepanel/hooks/useRuleTargetEdit.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetEdit.ts#L35)

Where one row stands in the draft.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / executeRuleTargetWrite

# Function: executeRuleTargetWrite()

> **executeRuleTargetWrite**(\`api\`, \`input\`): \`Promise\`\\<\`RuleTargetWriteResult\`\\>

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:209](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L209)

Re-read, check, plan, write and record one edit of a rule's target groups.

## Parameters

### api

\`RuleTargetWriteApi\`

The Okta client slice (see RuleTargetWriteApi).

### input

\`RuleTargetWriteInput\`

See RuleTargetWriteInput.

## Returns

\`Promise\`\\<\`RuleTargetWriteResult\`\\>

A RuleTargetWriteResult. Never throws for an Okta outcome.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / useRuleTargetWrite

# Function: useRuleTargetWrite()

> **useRuleTargetWrite**(\`options\`): \`UseRuleTargetWriteReturn\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:398](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L398)

Bind executeRuleTargetWrite to the rung's Okta client and raise
the actor notice when the run could not name the admin.

## Parameters

### options

\`UseRuleTargetWriteOptions\`

See UseRuleTargetWriteOptions.

## Returns

\`UseRuleTargetWriteReturn\`

## Example

\`\`\`ts
const { writeTargets } = useRuleTargetWrite({ api });
const result = await writeTargets({
  ruleId, expectedGroupIds: rule.groupIds, nextGroupIds,
});
if (result.kind === 'ran' && result.groups === 'saved') flash();
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / RuleTargetWriteInput

# Interface: RuleTargetWriteInput

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:134](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L134)

Input to executeRuleTargetWrite.

## Properties

### ruleId

> **ruleId**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L135)

***

### expectedGroupIds

> **expectedGroupIds**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L137)

The groups the editor started from. A rule that no longer has them is refused.

***

### expectedName?

> \`optional\` **expectedName?**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L139)

The name the editor started from. Omitted, the name is not checked.

***

### nextGroupIds

> **nextGroupIds**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:141](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L141)

The groups the rule should hold afterwards.

***

### nextName?

> \`optional\` **nextName?**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:143](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L143)

A new name, for a rename.

***

### takenNames?

> \`optional\` **takenNames?**: readonly \`string\`[]

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L145)

Names of the other loaded rules, for the \`name-taken\` check.

***

### undoOfActionId?

> \`optional\` **undoOfActionId?**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:147](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L147)

Set when this write undoes an earlier history entry.

***

### onStep?

> \`optional\` **onStep?**: (\`step\`, \`status\`) => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:149](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L149)

Called as each step starts (\`active\`) and settles — for the running stage's lines.

#### Parameters

##### step

\`TargetEditStep\`

##### status

\`"active"\` \\| \`StepStatus\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / StepReport

# Interface: StepReport

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L73)

One step's outcome, in run order.

## Properties

### step

> **step**: \`TargetEditStep\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:74](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L74)

***

### status

> **status**: \`StepStatus\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L75)

***

### error?

> \`optional\` **error?**: \`string\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L77)

Okta's reason, for \`rejected\`; the unconfirmed-write sentence, for \`unknown\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / UseRuleTargetWriteOptions

# Interface: UseRuleTargetWriteOptions

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:365](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L365)

Options for useRuleTargetWrite.

## Properties

### api

> **api**: \`RuleTargetWriteApi\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:370](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L370)

The rung's one Okta client. Passed in rather than mounted here: a second
client is a second \`wrapOperation\` island (\`docs/selection-verbs.md\`).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / UseRuleTargetWriteReturn

# Interface: UseRuleTargetWriteReturn

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:374](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L374)

What useRuleTargetWrite returns.

## Properties

### writeTargets

> **writeTargets**: (\`input\`) => \`Promise\`\\<\`RuleTargetWriteResult\`\\>

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:376](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L376)

Run one edit. See executeRuleTargetWrite.

#### Parameters

##### input

\`RuleTargetWriteInput\`

#### Returns

\`Promise\`\\<\`RuleTargetWriteResult\`\\>

***

### actorNotice

> **actorNotice**: \`AlertMessageData\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:378](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L378)

Non-blocking notice when the last run could not name the acting admin (\`D-013c\`).

***

### dismissActorNotice

> **dismissActorNotice**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:380](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L380)

Dismiss UseRuleTargetWriteReturn.actorNotice.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / GroupsOutcome

# Type Alias: GroupsOutcome

> **GroupsOutcome** = \`"saved"\` \\| \`"unchanged"\` \\| \`"unknown"\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L87)

What happened to the rule's target groups.

- \`saved\`     — Okta confirmed the save.
- \`unchanged\` — the save was rejected or never sent; the groups are as found.
- \`unknown\`   — the save was sent and not confirmed; it may have applied.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / RuleStatusOutcome

# Type Alias: RuleStatusOutcome

> **RuleStatusOutcome** = \`"as-before"\` \\| \`"paused"\` \\| \`"unknown"\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L98)

Whether the rule is active or inactive as it was found.

- \`as-before\` — the rule's status is what it was (it was never paused, or it
  was paused and resumed).
- \`paused\`    — it was paused and the resume was rejected or never sent; it
  adds no one until it is resumed.
- \`unknown\`   — the pause or the resume was not confirmed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / RuleTargetWriteApi

# Type Alias: RuleTargetWriteApi

> **RuleTargetWriteApi** = \`Pick\`\\<\`ReturnType\`\\<*typeof* \`useOktaApi\`\\>, \`"getRawGroupRule"\` \\| \`"updateGroupRule"\` \\| \`"activateGroupRule"\` \\| \`"deactivateGroupRule"\` \\| \`"runOperation"\` \\| \`"getCurrentUser"\`\\>

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L56)

The slice of the Okta client an edit needs.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / RuleTargetWriteResult

# Type Alias: RuleTargetWriteResult

> **RuleTargetWriteResult** = \\{ \`kind\`: \`"unreadable"\`; \\} \\| \\{ \`kind\`: \`"changed-since"\`; \`current\`: \`RuleTargetsState\`; \`expected\`: \\{ \`groupIds\`: readonly \`string\`[]; \`name?\`: \`string\`; \\}; \`added\`: \`string\`[]; \`removed\`: \`string\`[]; \`nameChanged\`: \`boolean\`; \\} \\| \\{ \`kind\`: \`"blocked"\`; \`reason\`: \`BlockReason\`; \\} \\| \\{ \`kind\`: \`"ran"\`; \`steps\`: \`StepReport\`[]; \`groups\`: \`GroupsOutcome\`; \`ruleStatus\`: \`RuleStatusOutcome\`; \`before\`: \`RuleTargetsState\`; \`after\`: \`RuleTargetsState\`; \`entry\`: \`UndoAction\` \\| \`null\`; \`actor\`: \`Actor\`; \\}

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:101](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L101)

The result of executeRuleTargetWrite.

## Union Members

### Type Literal

\\{ \`kind\`: \`"unreadable"\`; \\}

The re-read failed, so nothing was written.

***

### Type Literal

\\{ \`kind\`: \`"changed-since"\`; \`current\`: \`RuleTargetsState\`; \`expected\`: \\{ \`groupIds\`: readonly \`string\`[]; \`name?\`: \`string\`; \\}; \`added\`: \`string\`[]; \`removed\`: \`string\`[]; \`nameChanged\`: \`boolean\`; \\}

The rule no longer matches what the editor started from; nothing was
written. \`added\`/\`removed\` are relative to \`expected\`.

***

### Type Literal

\\{ \`kind\`: \`"blocked"\`; \`reason\`: \`BlockReason\`; \\}

The fresh read made the edit impossible; nothing was written.

***

### Type Literal

\\{ \`kind\`: \`"ran"\`; \`steps\`: \`StepReport\`[]; \`groups\`: \`GroupsOutcome\`; \`ruleStatus\`: \`RuleStatusOutcome\`; \`before\`: \`RuleTargetsState\`; \`after\`: \`RuleTargetsState\`; \`entry\`: \`UndoAction\` \\| \`null\`; \`actor\`: \`Actor\`; \\}

The plan ran. Read \`groups\` and \`ruleStatus\`; \`steps\` carries the detail.

#### kind

> **kind**: \`"ran"\`

#### steps

> **steps**: \`StepReport\`[]

#### groups

> **groups**: \`GroupsOutcome\`

#### ruleStatus

> **ruleStatus**: \`RuleStatusOutcome\`

#### before

> **before**: \`RuleTargetsState\`

#### after

> **after**: \`RuleTargetsState\`

The groups and name the rule has now — as Okta returned them when it confirmed the save.

#### entry

> **entry**: \`UndoAction\` \\| \`null\`

The undo-history entry, or \`null\` when the groups did not change.

#### actor

> **actor**: \`Actor\`

Who the write was attributed to.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleTargetWrite / StepStatus

# Type Alias: StepStatus

> **StepStatus** = \`"done"\` \\| \`"rejected"\` \\| \`"unknown"\` \\| \`"not-run"\`

Defined in: [src/sidepanel/hooks/useRuleTargetWrite.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleTargetWrite.ts#L70)

How one step ended. \`not-run\` means it was never sent: an earlier step halted
the run, or the run was cancelled before it started.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleUserCheck / useRuleUserCheck

# Function: useRuleUserCheck()

> **useRuleUserCheck**(\`__namedParameters\`): \`UseRuleUserCheckReturn\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L41)

Hook behind the rule rung's "Evaluate user" verb and its section.

## Parameters

### \\_\\_namedParameters

\`UseRuleUserCheckOptions\`

## Returns

\`UseRuleUserCheckReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleUserCheck / UseRuleUserCheckOptions

# Interface: UseRuleUserCheckOptions

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L20)

Options for useRuleUserCheck.

## Properties

### rule

> **rule**: \`FormattedRule\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L21)

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L23)

\`null\` when no Okta tab is available; the verb is then not offered.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L25)

Whether the owning tab is visible; gates the picker's search.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRuleUserCheck / UseRuleUserCheckReturn

# Interface: UseRuleUserCheckReturn

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L29)

Return shape of useRuleUserCheck.

## Properties

### picker

> **picker**: \`UseUserPickerReturn\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L30)

***

### subject

> **subject**: \`QualificationSubjectState\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L31)

***

### verdict

> **verdict**: \`RuleUserVerdict\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L33)

Present exactly when the subject is loaded.

***

### openPicker

> **openPicker**: (() => \`void\`) \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L35)

Open the picker. \`undefined\` with no tab — the verb is omitted, never disabled.

***

### clear

> **clear**: () => \`void\`

Defined in: [src/sidepanel/hooks/useRuleUserCheck.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRuleUserCheck.ts#L37)

Drop the subject and its verdict.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRulesData / useRulesData

# Function: useRulesData()

> **useRulesData**(\`__namedParameters\`): \`UseRulesDataReturn\`

Defined in: [src/sidepanel/hooks/useRulesData.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRulesData.ts#L75)

Manage the Rules tab's data: the rule list, stats, load-cost metadata, and the
\`loadRules\` pipeline over the panel's one org-rules source.

## Parameters

### \\_\\_namedParameters

\`UseRulesDataOptions\`

## Returns

\`UseRulesDataReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useRulesData / RulesDataSnapshot

# Interface: RulesDataSnapshot

Defined in: [src/sidepanel/hooks/useRulesData.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRulesData.ts#L30)

State restored from persistence on mount (persisted fields may be null).

## Properties

### rules?

> \`optional\` **rules?**: \`FormattedRule\`[] \\| \`null\`

Defined in: [src/sidepanel/hooks/useRulesData.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRulesData.ts#L31)

***

### stats?

> \`optional\` **stats?**: \`RuleStats\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRulesData.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRulesData.ts#L32)

***

### lastFetchTime?

> \`optional\` **lastFetchTime?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useRulesData.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useRulesData.ts#L33)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSamlTrace / useSamlTrace

# Function: useSamlTrace()

> **useSamlTrace**(\`options\`): \`UseSamlTraceResult\`

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L42)

Fetch an assertion for one app.

## Parameters

### options

\`UseSamlTraceOptions\`

See UseSamlTraceOptions.

## Returns

\`UseSamlTraceResult\`

## Example

\`\`\`tsx
const { trace, isTracing } = useSamlTrace({ targetTabId, oktaOrigin });
const result = await trace('0oaFAKE000000000000');
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSamlTrace / UseSamlTraceOptions

# Interface: UseSamlTraceOptions

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L25)

Options for useSamlTrace.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L27)

Connected Okta tab, or \`null\`.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\`

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L29)

Org origin, used to require the sign-on link belongs to this org.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSamlTrace / UseSamlTraceResult

# Interface: UseSamlTraceResult

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L17)

What useSamlTrace exposes.

## Properties

### trace

> **trace**: (\`appId\`) => \`Promise\`\\<\`SamlTraceResult\`\\>

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L19)

Run a trace against one app.

#### Parameters

##### appId

\`string\`

#### Returns

\`Promise\`\\<\`SamlTraceResult\`\\>

***

### isTracing

> **isTracing**: \`boolean\`

Defined in: [src/sidepanel/hooks/useSamlTrace.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSamlTrace.ts#L21)

Whether a trace is running.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useScrollPreservation / useScrollPreservation

# Function: useScrollPreservation()

> **useScrollPreservation**(\`scrollRef\`, \`visible\`): () => \`void\`

Defined in: [src/sidepanel/hooks/useScrollPreservation.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useScrollPreservation.ts#L43)

Preserve a scroll container's offset across a hide/show cycle.

## Parameters

### scrollRef

\`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

Ref on the scrolling element, owned by the consumer. Passed
**in** rather than returned so consumers can read the hook's result during
render without tripping React Compiler's \`react-hooks/refs\` rule.

### visible

\`boolean\`

Whether the container is currently shown. Restoration runs on
every \`false\` → \`true\` transition, and the passive \`scroll\` mirror is attached
only while it is \`true\`.

## Returns

\`capture()\` — records the current \`scrollTop\`. Call it immediately
before the state update that hides the container; it is a no-op when the ref is
unset, leaving the previously captured offset intact.

() => \`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSearchWithDropdown / useSearchWithDropdown

# Function: useSearchWithDropdown()

> **useSearchWithDropdown**\\<\`T\`\\>(\`__namedParameters\`): \`UseSearchWithDropdownReturn\`\\<\`T\`\\>

Defined in: [src/sidepanel/hooks/useSearchWithDropdown.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSearchWithDropdown.ts#L81)

Debounced search with dropdown visibility and selection.

## Type Parameters

### T

\`T\`

The result/item type returned by \`searchFn\`.

## Parameters

### \\_\\_namedParameters

\`UseSearchWithDropdownOptions\`\\<\`T\`\\>

## Returns

\`UseSearchWithDropdownReturn\`\\<\`T\`\\>

## Example

\`\`\`tsx
const userSearch = useSearchWithDropdown({
  searchFn: async (q) => oktaApi.searchUsers(q),
  debounceMs: 300,
  minQueryLength: 2,
  onSelect: (user) => console.log('Selected:', user),
});

return (
  <SearchDropdown
    query={userSearch.query}
    onQueryChange={userSearch.setQuery}
    results={userSearch.results}
    isSearching={userSearch.isSearching}
    showDropdown={userSearch.showDropdown}
    onSelect={userSearch.selectItem}
    selectedItem={userSearch.selectedItem}
    onClear={userSearch.clearSearch}
  />
);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSessionExpiry / useSessionExpiry

# Function: useSessionExpiry()

> **useSessionExpiry**(\`targetTabId\`): \`boolean\`

Defined in: [src/sidepanel/hooks/useSessionExpiry.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSessionExpiry.ts#L25)

Has the Okta session for \`targetTabId\` expired?

## Parameters

### targetTabId

\`number\` \\| \`null\`

The Okta tab the panel is driving, or \`null\` when none has been
detected. A \`null\` tab is never reported as expired: nothing is known about a session
the panel is not talking to.

## Returns

\`boolean\`

\`true\` only while the scheduler is holding requests for that tab.

## Remarks

Recovery needs no call here — the scheduler clears the tab as soon as a
request for it succeeds, so the banner unmounts on the same broadcast.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSlotSearch / useSlotSearch

# Function: useSlotSearch()

> **useSlotSearch**(\`searcher\`, \`query\`, \`enabled\`): \`SlotSearch\`

Defined in: [src/sidepanel/hooks/useSlotSearch.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSlotSearch.ts#L28)

Search one kind as the reader types.

## Parameters

### searcher

((\`query\`) => \`Promise\`\\<\`JumpResult\`[]\\>) \\| \`undefined\`

The kind's name search, or \`undefined\` when this build has none.

### query

\`string\`

The text typed so far.

### enabled

\`boolean\`

Whether the picker is on screen.

## Returns

\`SlotSearch\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSlotSearch / SlotSearch

# Type Alias: SlotSearch

> **SlotSearch** = \\{ \`status\`: \`"idle"\`; \\} \\| \\{ \`status\`: \`"searching"\`; \\} \\| \\{ \`status\`: \`"done"\`; \`query\`: \`string\`; \`results\`: \`JumpResult\`[]; \\} \\| \\{ \`status\`: \`"failed"\`; \`query\`: \`string\`; \\}

Defined in: [src/sidepanel/hooks/useSlotSearch.ts:15](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSlotSearch.ts#L15)

Where a slot search has got to.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSnapshotTopUp / useSnapshotTopUp

# Function: useSnapshotTopUp()

> **useSnapshotTopUp**(\`options\`): \`void\`

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L41)

Top the snapshot up once per mount, when it is stale.

## Parameters

### options

\`UseSnapshotTopUpOptions\`

See UseSnapshotTopUpOptions.

## Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSnapshotTopUp / UseSnapshotTopUpOptions

# Interface: UseSnapshotTopUpOptions

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L27)

Options for useSnapshotTopUp.

## Properties

### index

> **index**: \`OrgEntityIndex\`

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L29)

The already-mounted snapshot handles.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L31)

Whether Home is the tab on screen.

***

### connected

> **connected**: \`boolean\`

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L33)

Whether a live Okta tab is connected; without one nothing can sync.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useSnapshotTopUp / SNAPSHOT\\_TOP\\_UP\\_MAX\\_AGE\\_MS

# Variable: SNAPSHOT\\_TOP\\_UP\\_MAX\\_AGE\\_MS

> \`const\` **SNAPSHOT\\_TOP\\_UP\\_MAX\\_AGE\\_MS**: \`number\`

Defined in: [src/sidepanel/hooks/useSnapshotTopUp.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useSnapshotTopUp.ts#L24)

How old the snapshot may be before Home tops it up on activation. Decides
*whether to ask at all*, so passing through Home does not cost a drift check
every time.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useStaggerReveal / useStaggerReveal

# Function: useStaggerReveal()

> **useStaggerReveal**(\`enabled?\`): (\`node\`) => \`void\`

Defined in: [src/sidepanel/hooks/useStaggerReveal.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useStaggerReveal.ts#L53)

Hold \`.rise-in-stagger\` children until they scroll into view, then cascade them.

Attach the returned **callback ref** to the element carrying \`.rise-in-stagger\`.
Children are revealed once and never re-animated, so scrolling back up doesn't
replay the list.

A callback ref, not a \`RefObject\`: a stagger container is rendered conditionally,
so on the commit where the consumer mounts a ref object's \`.current\` is still
\`null\` and the effect bails — and its stable identity means the effect never
re-runs. A callback ref puts the element in state, which is a real dependency.

Failure is safe: the container is marked \`data-stagger-reveal="on"\` — the
attribute the CSS keys its hold on — only after the \`IntersectionObserver\`
exists. Missing API, unrun effect or reduced motion all leave the attribute
absent and fall back to the plain CSS stagger. No path leaves a row invisible.

## Parameters

### enabled?

\`boolean\` = \`true\`

Set false to leave the CSS stagger in charge. Defaults to true.

## Returns

A ref callback to place on the \`.rise-in-stagger\` element.

(\`node\`) => \`void\`

## Example

\`\`\`tsx
const setStaggerRef = useStaggerReveal();
return <div ref={setStaggerRef} className="space-y-3 rise-in-stagger">{rows}</div>;
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useStuck / useStuck

# Function: useStuck()

> **useStuck**(\`sentinelRef\`, \`stickyRef\`, \`enabled?\`): \`boolean\`

Defined in: [src/sidepanel/hooks/useStuck.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useStuck.ts#L35)

Track whether \`stickyRef\`'s element is currently pinned.

## Parameters

### sentinelRef

\`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

A zero-height element in normal flow, immediately before the sticky
  element. It must not itself be sticky or absolutely positioned.

### stickyRef

\`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

The sticky element, read for its resolved \`top\` offset.

### enabled?

\`boolean\` = \`true\`

Whether to observe at all. Pass the tab's \`isActive\`: a hidden panel is
  \`display: none\`, so its sentinel never intersects and would otherwise report a
  permanently pinned header.

## Returns

\`boolean\`

\`true\` once the element has reached its pinned position.

## Example

\`\`\`tsx
const sentinelRef = useRef<HTMLDivElement>(null);
const headerRef = useRef<HTMLDivElement>(null);
const pinned = useStuck(sentinelRef, headerRef, isActive);
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTabRail / useTabRail

# Function: useTabRail()

> **useTabRail**(\`__namedParameters\`): \`TabRailState\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L102)

Measure the overflow affordances for an icon-rail tab strip.

## Parameters

### \\_\\_namedParameters

\`UseTabRailOptions\`

## Returns

\`TabRailState\`

The current TabRailState. \`edge\` and \`indicator\` stay
referentially stable while their measured values are unchanged, so a scroll that
crosses no edge boundary triggers no re-render.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTabRail / TabRailIndicator

# Interface: TabRailIndicator

Defined in: [src/sidepanel/hooks/useTabRail.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L30)

Geometry of the sliding active-tab indicator, in pixels.

## Properties

### left

> **left**: \`number\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L32)

Offset of the active tab's left edge from the strip's padding box.

***

### width

> **width**: \`number\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L34)

Width of the active tab. \`0\` before the first measurement.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTabRail / TabRailState

# Interface: TabRailState

Defined in: [src/sidepanel/hooks/useTabRail.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L53)

What useTabRail hands back for rendering.

## Properties

### edge

> **edge**: \`TabRailEdge\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L55)

Discrete overflow state; render it as \`data-overflow\` on the strip.

***

### indicator

> **indicator**: \`TabRailIndicator\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L57)

Geometry for the absolutely-positioned indicator inside the strip.

***

### sliding

> **sliding**: \`boolean\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L63)

\`true\` for the \`--dur-move\` window after a selection change. Apply the
indicator's \`left\`/\`width\` transition **only** while this is set; outside it the
geometry tracks a live reflow. Always \`false\` under reduced motion.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTabRail / UseTabRailOptions

# Interface: UseTabRailOptions

Defined in: [src/sidepanel/hooks/useTabRail.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L38)

Options for useTabRail.

## Properties

### listRef

> **listRef**: \`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useTabRail.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L43)

Ref on the scrolling tab strip. A \`null\` ref disables every effect, which is how
the non-rail \`Tabs\` variants opt out without a conditional hook call.

***

### activeKey

> **activeKey**: \`string\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:45](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L45)

Key of the active tab. Changing it re-measures and scrolls it into view.

***

### tabCount

> **tabCount**: \`number\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L47)

Number of tabs; re-measures when the tab set itself changes shape.

***

### reducedMotion

> **reducedMotion**: \`boolean\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:49](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L49)

When \`true\`, scroll-into-view jumps instead of animating.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTabRail / TabRailEdge

# Type Alias: TabRailEdge

> **TabRailEdge** = \`"none"\` \\| \`"start"\` \\| \`"end"\` \\| \`"both"\`

Defined in: [src/sidepanel/hooks/useTabRail.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTabRail.ts#L27)

Which sides of the tab strip have content scrolled out of view and want an edge fade.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTypewriter / useTypewriter

# Function: useTypewriter()

> **useTypewriter**(\`text\`, \`options?\`): \`UseTypewriterResult\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:57](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L57)

Type \`text\` out at one character per \`step\` once \`start\` is true.

A changed \`text\` restarts the reveal; an unchanged one never does, so a
re-render mid-sentence does not stutter.

## Parameters

### text

\`string\`

The full string. It is also what the caller announces.

### options?

\`UseTypewriterOptions\` = \`{}\`

See UseTypewriterOptions.

## Returns

\`UseTypewriterResult\`

See UseTypewriterResult.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTypewriter / UseTypewriterOptions

# Interface: UseTypewriterOptions

Defined in: [src/sidepanel/hooks/useTypewriter.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L27)

Options for useTypewriter.

## Properties

### start?

> \`optional\` **start?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L32)

Hold the reveal until this turns \`true\` — how a second line waits for the
first. While \`false\` nothing is visible. Defaults to \`true\`.

***

### step?

> \`optional\` **step?**: \`"--stagger-word"\` \\| \`"--stagger-char"\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L34)

The per-character step. A headline types slower than a sentence.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useTypewriter / UseTypewriterResult

# Interface: UseTypewriterResult

Defined in: [src/sidepanel/hooks/useTypewriter.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L38)

What useTypewriter returns each render.

## Properties

### visible

> **visible**: \`string\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L40)

The characters revealed so far.

***

### done

> **done**: \`boolean\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L42)

\`true\` once the whole string is visible, by typing or by skip.

***

### skip

> **skip**: () => \`void\`

Defined in: [src/sidepanel/hooks/useTypewriter.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useTypewriter.ts#L44)

Reveal the rest at once — wired to Escape and a tap anywhere.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUndoAction / useUndoAction

# Function: useUndoAction()

> **useUndoAction**(\`options\`): \`UseUndoActionReturn\`

Defined in: [src/sidepanel/hooks/useUndoAction.ts:534](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L534)

Undo one recorded profile write, as a new, drift-checked forward write.

## Parameters

### options

\`UseUndoActionOptions\`

See UseUndoActionOptions.

## Returns

\`UseUndoActionReturn\`

UseUndoActionReturn — the executor, the in-flight id, and the
pure eligibility test a row uses to decide whether to offer the action at all.

## Example

\`\`\`tsx
const { undo, undoingActionId, undoability } = useUndoAction({ targetTabId });

if (undoability(action).undoable) {
  const outcome = await undo(action);
  if (outcome.kind === 'drifted') showDrift(outcome.attributeNames);
}
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUndoAction / UseUndoActionOptions

# Interface: UseUndoActionOptions

Defined in: [src/sidepanel/hooks/useUndoAction.ts:178](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L178)

Options for useUndoAction.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUndoAction.ts:184](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L184)

Tab hosting the live Okta session every request is scoped to. Accepts \`null\` as
well as \`undefined\`, and normalises to the facade's \`number | null\` here rather
than at every call site.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUndoAction / UseUndoActionReturn

# Interface: UseUndoActionReturn

Defined in: [src/sidepanel/hooks/useUndoAction.ts:188](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L188)

What useUndoAction returns.

## Properties

### undo

> **undo**: (\`action\`) => \`Promise\`\\<\`UndoOutcome\`\\>

Defined in: [src/sidepanel/hooks/useUndoAction.ts:190](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L190)

Re-read, drift-check, restore, and record — see UndoOutcome.

#### Parameters

##### action

\`UndoAction\`

#### Returns

\`Promise\`\\<\`UndoOutcome\`\\>

***

### undoingActionId

> **undoingActionId**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUndoAction.ts:192](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L192)

Id of the action currently being undone, or null.

***

### undoability

> **undoability**: (\`action\`) => \\{ \`undoable\`: \`true\`; \`restorable\`: \`number\`; \`total\`: \`number\`; \\} \\| \\{ \`undoable\`: \`false\`; \`reason\`: \`string\`; \\}

Defined in: [src/sidepanel/hooks/useUndoAction.ts:194](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L194)

Pure: can this entry be undone at all, and if not, why?

#### Parameters

##### action

\`UndoAction\`

#### Returns

\\{ \`undoable\`: \`true\`; \`restorable\`: \`number\`; \`total\`: \`number\`; \\} \\| \\{ \`undoable\`: \`false\`; \`reason\`: \`string\`; \\}


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUndoAction / UndoOutcome

# Type Alias: UndoOutcome

> **UndoOutcome** = \\{ \`kind\`: \`"undone"\`; \`restored\`: \`number\`; \`skipped\`: \`number\`; \`unit\`: \`"attribute"\` \\| \`"user"\` \\| \`"target group"\`; \`actionId\`: \`string\`; \`ruleStatus?\`: \`"paused"\` \\| \`"unknown"\`; \\} \\| \\{ \`kind\`: \`"not-undoable"\`; \`reason\`: \`string\`; \\} \\| \\{ \`kind\`: \`"drifted"\`; \`attributeNames\`: readonly \`string\`[]; \`rule?\`: \\{ \`now\`: \`RuleTargetsState\`; \`added\`: readonly \`string\`[]; \`removed\`: readonly \`string\`[]; \`nameChanged\`: \`boolean\`; \\}; \\} \\| \\{ \`kind\`: \`"already-undone"\`; \\} \\| \\{ \`kind\`: \`"failed"\`; \`error\`: \`string\`; \\}

Defined in: [src/sidepanel/hooks/useUndoAction.ts:113](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUndoAction.ts#L113)

The outcome of an undo attempt. Five cases rather than a boolean because each
calls for something different from the admin: nothing (\`not-undoable\`), a look at
who else edited the user (\`drifted\`), a refresh (\`already-undone\`), a retry
(\`failed\`), or a note that some attributes were left alone (\`undone\` with
\`skipped > 0\`).

## Union Members

### Type Literal

\\{ \`kind\`: \`"undone"\`; \`restored\`: \`number\`; \`skipped\`: \`number\`; \`unit\`: \`"attribute"\` \\| \`"user"\` \\| \`"target group"\`; \`actionId\`: \`string\`; \`ruleStatus?\`: \`"paused"\` \\| \`"unknown"\`; \\}

The restoring write landed.

\`restored\` and \`skipped\` count whatever \`unit\` names: a single-user profile
undo restores **attributes** on one person, a bulk undo restores one
attribute on **users**. The unit is carried in the type rather than left for
the copy to guess, because a sentence that reads "Restored 12 attributes"
over twelve people is simply wrong (\`docs/claims.md\`).

#### kind

> **kind**: \`"undone"\`

#### restored

> **restored**: \`number\`

#### skipped

> **skipped**: \`number\`

#### unit

> **unit**: \`"attribute"\` \\| \`"user"\` \\| \`"target group"\`

#### actionId

> **actionId**: \`string\`

#### ruleStatus?

> \`optional\` **ruleStatus?**: \`"paused"\` \\| \`"unknown"\`

Set only for a rule-target undo whose rule did not end as it was found:
\`paused\` when the resume was rejected, \`unknown\` when it was not
confirmed. Absent means the rule's status is as it was.

***

### Type Literal

\\{ \`kind\`: \`"not-undoable"\`; \`reason\`: \`string\`; \\}

This kind of entry has no undo path. \`reason\` is a sentence for the UI.

***

### Type Literal

\\{ \`kind\`: \`"drifted"\`; \`attributeNames\`: readonly \`string\`[]; \`rule?\`: \\{ \`now\`: \`RuleTargetsState\`; \`added\`: readonly \`string\`[]; \`removed\`: readonly \`string\`[]; \`nameChanged\`: \`boolean\`; \\}; \\}

At least one attribute is no longer what the original write set, so undoing
would overwrite someone else's change. Names only: a value never leaves this
hook in a string.

#### kind

> **kind**: \`"drifted"\`

#### attributeNames

> **attributeNames**: readonly \`string\`[]

#### rule?

> \`optional\` **rule?**: \`object\`

For a rule-target undo, what the rule holds now and how it differs from
what the edit left (\`added\`/\`removed\` are relative to the edit's result).
Ids only; the surface resolves names.

##### rule.now

> **now**: \`RuleTargetsState\`

##### rule.added

> **added**: readonly \`string\`[]

##### rule.removed

> **removed**: readonly \`string\`[]

##### rule.nameChanged

> **nameChanged**: \`boolean\`

***

### Type Literal

\\{ \`kind\`: \`"already-undone"\`; \\}

The entry was already undone; nothing was requested from Okta.

***

### Type Literal

\\{ \`kind\`: \`"failed"\`; \`error\`: \`string\`; \\}

The read or the restoring write did not succeed.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUnpinUndo / useUnpinUndo

# Function: useUnpinUndo()

> **useUnpinUndo**(\`target\`): \`UnpinUndo\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L44)

Unpin with Undo.

## Parameters

### target

\`UnpinTarget\`

The working set to release from and restore into.

## Returns

\`UnpinUndo\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUnpinUndo / UnpinTarget

# Interface: UnpinTarget

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:18](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L18)

What useUnpinUndo reads and writes.

## Properties

### pinned

> **pinned**: \`WorkingSetRef\`[]

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L20)

The org's pins, in order.

***

### forget

> **forget**: (\`kind\`, \`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L22)

Release one entity.

#### Parameters

##### kind

\`WorkingSetKind\`

##### id

\`string\`

#### Returns

\`void\`

***

### restorePin

> **restorePin**: (\`ref\`, \`index\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L24)

Put a released pin back at its position.

#### Parameters

##### ref

\`WorkingSetRef\`

##### index

\`number\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUnpinUndo / UnpinUndo

# Interface: UnpinUndo

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L28)

What useUnpinUndo returns.

## Properties

### released

> **released**: \`WorkingSetRef\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L30)

The pin just released, while Undo is on offer; \`null\` otherwise.

***

### unpin

> **unpin**: (\`ref\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L32)

Release a pin and offer Undo.

#### Parameters

##### ref

\`WorkingSetRef\`

#### Returns

\`void\`

***

### undo

> **undo**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L34)

Put the released pin back.

#### Returns

\`void\`

***

### dismiss

> **dismiss**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L36)

Withdraw the offer.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUnpinUndo / UNDO\\_WINDOW\\_MS

# Variable: UNDO\\_WINDOW\\_MS

> \`const\` **UNDO\\_WINDOW\\_MS**: \`5000\` = \`5000\`

Defined in: [src/sidepanel/hooks/useUnpinUndo.ts:15](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUnpinUndo.ts#L15)

How long Undo is offered after an unpin.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserApps / useUserApps

# Function: useUserApps()

> **useUserApps**(\`userId\`, \`options\`): \`UseUserAppsResult\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:267](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L267)

Load a user's apps and name the group behind each assignment.

## Parameters

### userId

\`string\` \\| \`null\`

The user whose apps to list, or \`null\` when no user is open.

### options

\`UseUserAppsOptions\`

See UseUserAppsOptions.

## Returns

\`UseUserAppsResult\`

See UseUserAppsResult.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserApps / UseUserAppsOptions

# Interface: UseUserAppsOptions

Defined in: [src/sidepanel/hooks/useUserApps.ts:46](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L46)

Inputs to useUserApps beyond the user id.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L48)

Tab whose content script holds the live Okta session.

***

### memberships

> **memberships**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L61)

The user's group memberships, as the detail rung already holds them. Taken as
an argument rather than fetched, so no second
\`GET /api/v1/users/{id}/groups\` can disagree with the Groups pane. Used only
to name a group Okta already credited and to narrow the fallback's
candidates, never to infer a source Okta did not report.

\`undefined\` when the list has not been read. This is the one consumer where
treating that as empty is honest, and only because of the sentence above: an
unread list costs a group *name* and a narrower fallback, never a claimed
source. Every other consumer must withhold instead.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L67)

Connected org origin, which scopes the snapshot the fallback consults first.
Omitting it costs correctness nothing: the fallback then walks every
unresolved app.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L76)

Whether the Apps pane is the visible one. Defaults to \`true\`.

The **deferred re-arm** gate from \`docs/state-management.md\`: \`enabled\` sits
in the guard *and* in the dependency array below, so entering the pane late
runs the deferred work rather than dropping it, and returning to the pane is
not a refetch.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserApps / UseUserAppsResult

# Interface: UseUserAppsResult

Defined in: [src/sidepanel/hooks/useUserApps.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L80)

What useUserApps returns.

## Properties

### apps

> **apps**: \`UserAppAssignment\`[]

Defined in: [src/sidepanel/hooks/useUserApps.ts:85](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L85)

The user's assignments, with \`grantGroupId\` filled in wherever it is known —
from the zero-cost embed, or from a fallback walk that has since resolved.

***

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L87)

\`true\` while the app list is loading with nothing cached to show.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L89)

Message from the last failed load, or \`null\`.

***

### complete

> **complete**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L96)

\`false\` when the pagination walk did not finish, so the list is short by an
unknown amount. The pane must say so rather than presenting a partial walk as
a complete answer. \`true\` before anything has loaded, since nothing has
failed yet.

***

### hasLoaded

> **hasLoaded**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L102)

Whether a walk has actually returned. \`apps.length === 0\` means either
nothing has loaded yet or the user genuinely has none; a consumer that
collapses the two flashes a \`0\` it has not earned or hides a real one.

***

### appsByGroupId

> **appsByGroupId**: \`AppsByGroupId\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L110)

Group id → the labels of the apps this user gets through that group — the
inverse of the pane, for the Groups pane's \`Also grants:\` line.

Only groups Okta actually credited appear; a row whose source is unknown is
filed under nothing.

***

### isResolvingSources

> **isResolvingSources**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserApps.ts:116](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserApps.ts#L116)

\`true\` while the granting-group fallback is walking. The work is already
visible in the ActivityBar; this lets the pane caveat the rows it has not
finished resolving.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserApps / AppsByGroupId

# Type Alias: AppsByGroupId

> **AppsByGroupId** = \`Record\`\\<\`string\`, \`string\`[]\\>

Defined in: [src/sidepanel/components/users/appSourceSummary.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/components/users/appSourceSummary.ts#L39)

Group id → the labels of the apps this user gets **through** that group. Only
rows whose granting group is known appear.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserComparison / useUserComparison

# Function: useUserComparison()

> **useUserComparison**(\`options\`): \`object\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:172](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L172)

Orchestrates the two-user comparison: composes search, memberships, apps and the
group-copy concern; owns \`comparedUser\` (the phase switch) and \`activeTab\`, the
two reset paths, and the derived buckets and similarity.

## Parameters

### options

\`UseUserComparisonOptions\`

See \`UseUserComparisonOptions\`.

## Returns

\`object\`

The comparison view model — see UserComparisonState. Four
  properties of it are contracts rather than data:

  - \`loadError\` is the group side and is blocking: without memberships there is
    no comparison, so the view replaces the tabs with it. \`appsIncomplete\` is the
    app side and is advisory: the view caveats instead of blanking,
    \`appSimilarity\` becomes \`null\`, and \`similarityScope\` reports \`'groups-only'\`.
  - \`attributeParity\` is a value diff over both users' profile attributes, split
    into the rows the display config shows and the rows it hides (kept and
    counted). It feeds no similarity figure.
  - \`attributeEdit\` is always present; a column that may not be edited says so
    through \`canEdit\` rather than by being absent, and the context column is
    read-only unless the host supplied \`onContextUserUpdated\`.
  - \`causes\` is \`undefined\` until the org rule inventory resolves — "not
    computed", which consumers must not render as a finding.
  - \`attributeRuleReads\` is \`undefined\` on the same grounds, plus whenever either
    user's group list is unread: an empty map is the finding *no rule reads any
    of these attributes*, and nothing established that.

### comparedUser

> **comparedUser**: \`OktaUser\` \\| \`null\`

### searchQuery

> **searchQuery**: \`string\`

### setSearchQuery

> **setSearchQuery**: (\`query\`) => \`void\`

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

### searchResults

> **searchResults**: \`OktaUser\`[]

### isSearching

> **isSearching**: \`boolean\`

### resultsTruncated

> **resultsTruncated**: \`boolean\`

### activeTab

> **activeTab**: \`TabKey\`

### setActiveTab

> **setActiveTab**: \`Dispatch\`\\<\`SetStateAction\`\\<\`TabKey\`\\>\\>

### groupBuckets

> **groupBuckets**: \`GroupBuckets\`

### appBuckets

> **appBuckets**: \`AppBuckets\`

### causes

> **causes**: \`AccessCause\`[] \\| \`undefined\`

### attributeParity

> **attributeParity**: \`AttributeParityResult\`

### attributeConfig

> **attributeConfig**: \`ProfileDisplayConfig\`

### attributeRuleReads

> **attributeRuleReads**: \`ProfileRuleReads\` \\| \`undefined\`

### attributeEdit

> **attributeEdit**: \`UseComparisonProfileEditReturn\`

### groupSimilarity

> **groupSimilarity**: \`number\`

### appSimilarity

> **appSimilarity**: \`number\` \\| \`null\`

### overallSimilarity

> **overallSimilarity**: \`number\`

### similarityScope

> **similarityScope**: \`"both"\` \\| \`"groups-only"\`

### appsIncomplete

> **appsIncomplete**: \`boolean\`

### isLoading

> **isLoading**: \`boolean\`

### loadError

> **loadError**: \`string\` \\| \`null\`

### addingGroupId

> **addingGroupId**: \`string\` \\| \`null\`

### addError

> **addError**: \`string\` \\| \`null\`

### setAddError

> **setAddError**: (\`v\`) => \`void\`

#### Parameters

##### v

\`string\` \\| \`null\`

#### Returns

\`void\`

### addToContext

> **addToContext**: (\`group\`) => \`Promise\`\\<\`void\`\\>

#### Parameters

##### group

\`OktaGroup\`

#### Returns

\`Promise\`\\<\`void\`\\>

### addToCompared

> **addToCompared**: (\`group\`) => \`Promise\`\\<\`void\`\\>

#### Parameters

##### group

\`OktaGroup\`

#### Returns

\`Promise\`\\<\`void\`\\>

### contextName

> **contextName**: \`string\`

### comparedName

> **comparedName**: \`string\`

### resolveGroupName

> **resolveGroupName**: \`GroupNameResolver\`

### selectUser

> **selectUser**: (\`user\`) => \`void\`

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

### changeUser

> **changeUser**: () => \`void\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserComparison / UseUserComparisonOptions

# Interface: UseUserComparisonOptions

Defined in: [src/sidepanel/hooks/useUserComparison.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L89)

Options for useUserComparison.

## Properties

### isActive

> **isActive**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L95)

Whether the comparison surface is on screen — \`isOpen\` for the dialog host,
"a comparison view is pushed" for the Users tab's view-stack host. Going false
triggers a full reset, so the next open/push starts pristine.

***

### searchEnabled?

> \`optional\` **searchEnabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L102)

Whether the surface may issue background user-search requests. Defaults to
UseUserComparisonOptions.isActive; the Users tab narrows it further with
its own tab-level \`isActive\`, since a hidden tab stays mounted and must not
spend scheduler budget.

***

### contextUser

> **contextUser**: \`OktaUser\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L104)

The anchor user being compared against (left-hand side).

***

### contextGroups

> **contextGroups**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:118](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L118)

The context user's memberships, used to build the group buckets, or
\`undefined\` when nobody has read them — which here means the read **failed**:
the host disables *Compare* while the load is in flight, so this surface is
never entered mid-load.

It is never substituted with \`[]\`. The rule evaluator answers every
\`isMemberOf*\` clause two-valued over the list it is given, so an empty list
is the claim *this user is in no groups* — and the cause worklist would go on
to recommend adding them to groups they may already hold. \`undefined\` makes
the comparison blocking instead, through the same \`loadError\` the compared
side already uses.

***

### targetTabId

> **targetTabId**: \`number\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:120](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L120)

Tab whose content script performs all comparison API calls.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:127](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L127)

The connected org's origin: the profile schema is cached under
\`cacheKeys.userSchema(oktaOrigin)\` and the display configuration is stored per
org. Absent, both degrade rather than fail — the inventory falls back to the
user's own profile keys plus \`BASE_PROFILE_ATTRIBUTES\`.

***

### onGroupsChanged

> **onGroupsChanged**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L129)

Called after groups are copied so the parent can refresh context data.

#### Returns

\`void\`

***

### onContextUserUpdated?

> \`optional\` **onContextUserUpdated?**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L137)

Publishes a context user the Attributes tab just saved, so every other surface
showing that person sees the new values. The context user is a prop, so only
the host that owns it can publish it. Absent, the context column offers no edit
affordance at all — a save nobody publishes leaves the panel rendering values
Okta no longer holds.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### presetComparedUserId?

> \`optional\` **presetComparedUserId?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserComparison.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L144)

A second user already chosen upstream — a forwarded answer that named both
people. Fetched once when the surface opens and selected as if picked, so the
search phase is skipped. A fetch that fails leaves the search phase in place:
the reader picks, rather than seeing a comparison against nobody.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserComparison / UserComparisonState

# Type Alias: UserComparisonState

> **UserComparisonState** = \`ReturnType\`\\<*typeof* \`useUserComparison\`\\>

Defined in: [src/sidepanel/hooks/useUserComparison.ts:610](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserComparison.ts#L610)

The comparison view model produced by useUserComparison. Passed whole
into the presentational UserComparisonView; the hook is instantiated by
the host, so its mount lifetime is the host's, not the visible surface's.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserContext / useUserContext

# Function: useUserContext()

> **useUserContext**(\`enabled?\`): \`UseUserContextReturn\`

Defined in: [src/sidepanel/hooks/useUserContext.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserContext.ts#L39)

Tracks the Okta user (if any) shown in the active tab. Thin wrapper over
useOktaTabContext.

## Parameters

### enabled?

\`boolean\` = \`true\`

When \`false\`, live re-detection on navigation is suspended
  (a resync is deferred until re-enabled while the panel is visible). Defaults
  to \`true\`.

## Returns

\`UseUserContextReturn\`

\`userInfo\` (the current page's user, or \`null\` when the tab is not a
  user page) plus shared connection state (\`connectionStatus\`, \`targetTabId\`,
  \`error\`, \`isLoading\`, \`refetch\`, \`oktaOrigin\`).


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserDetailPanes / useUserDetailPanes

# Function: useUserDetailPanes()

> **useUserDetailPanes**(\`options\`): \`UseUserDetailPanesReturn\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:155](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L155)

Owns the user-detail rung's pane selection and the two loads that hang off it.

## Parameters

### options

\`UseUserDetailPanesOptions\`

See UseUserDetailPanesOptions.

## Returns

\`UseUserDetailPanesReturn\`

The pane selector plus the apps and profile data — see
  UseUserDetailPanesReturn.

## Example

\`\`\`tsx
const panes = useUserDetailPanes({
  user: selectedUser,
  targetTabId,
  oktaOrigin,
  memberships,
  rules,
  enabled: isActive,
});
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserDetailPanes / UseUserDetailPanesOptions

# Interface: UseUserDetailPanesOptions

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L58)

Options for useUserDetailPanes.

## Properties

### user

> **user**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L60)

The user whose detail rung is open, or \`null\` when none is selected.

***

### targetTabId?

> \`optional\` **targetTabId?**: \`number\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L62)

Chrome tab id of the connected Okta tab; nothing loads without one.

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L64)

Okta org origin — the key both the schema and the display config are held under.

***

### memberships

> **memberships**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L71)

The user's analysed memberships, as the rung already holds them, or
\`undefined\` when nobody has read them — before the first load, or after one
that failed. Never substituted with \`[]\`: that is the claim *this user is in
no groups*, which every rule clause below would then answer from.

***

### rules

> **rules**: \`RuleInventoryState\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L78)

The org-wide group-rule inventory from
sidepanel/hooks/useUserMemberships.useUserMemberships. Only the
\`available\` state produces rule marks: \`unresolved\` and \`unavailable\` both
render as *no* marks, never as "no rule reads this".

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:83](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L83)

Whether the Users tab is the visible one. Gates both loads, so a hidden tab
spends no scheduler budget. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserDetailPanes / UseUserDetailPanesReturn

# Interface: UseUserDetailPanesReturn

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L87)

What useUserDetailPanes returns.

## Properties

### pane

> **pane**: \`UserDetailPane\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:89](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L89)

Which pane is on screen.

***

### setPane

> **setPane**: (\`pane\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L91)

Selects a pane. Loads gated on that pane run on the first switch to it.

#### Parameters

##### pane

\`UserDetailPane\`

#### Returns

\`void\`

***

### apps

> **apps**: \`UserAppAssignment\`[]

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L94)

The user's app assignments, granting group filled in wherever it is known.

***

### isLoadingApps

> **isLoadingApps**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:96](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L96)

\`true\` while the apps list is loading with nothing cached to show.

***

### appsComplete

> **appsComplete**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:98](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L98)

\`false\` when the app pagination walk did not finish; the pane must say so.

***

### appsByGroupId

> **appsByGroupId**: \`AppsByGroupId\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L100)

Group id → the labels of the apps that group grants — the Groups pane's \`Also grants:\` line.

***

### appCount?

> \`optional\` **appCount?**: \`number\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:105](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L105)

How many apps the user has, for the header's metric — \`undefined\` until the
list has loaded something. See the module header for why zero is omitted.

***

### attributes

> **attributes**: \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:108](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L108)

Every attribute of this user's profile, empty ones included.

***

### isLoadingProfile

> **isLoadingProfile**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:110](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L110)

\`true\` while the org's profile schema is loading with nothing cached.

***

### profileConfig

> **profileConfig**: \`ProfileDisplayConfig\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:112](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L112)

The admin's reconciled profile-display configuration for this org.

***

### updateProfileConfig

> **updateProfileConfig**: (\`patch\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:114](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L114)

Applies one patch to the configuration and persists it (coalesced).

#### Parameters

##### patch

\`Partial\`\\<\`ProfileDisplayConfig\`\\>

#### Returns

\`void\`

***

### ruleReads

> **ruleReads**: \`ProfileRuleReads\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L125)

Attribute Okta name → the names of the rules that read it *and* currently
grant this user access. Attributes no qualifying rule reads are absent from
the map.

\`undefined\` is the third value and means **not computed** — the org rule
inventory has not resolved, or this user's memberships have not been read, so
no rule was consulted about any attribute. \`{}\` would say the opposite: that
every attribute was checked and no rule reads any of them.

***

### mastering

> **mastering**: \`ProfileMastering\`

Defined in: [src/sidepanel/hooks/useUserDetailPanes.ts:133](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserDetailPanes.ts#L133)

Which profile sources are attached to this user, for the editability gate.

Empty (\`{}\`) until the Profile pane's app walk has finished, which reads as
"cannot say" and leaves every externally-mastered attribute locked — the
conservative direction.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserLifecycleActions / useUserLifecycleActions

# Function: useUserLifecycleActions()

> **useUserLifecycleActions**(\`__namedParameters\`): \`UseUserLifecycleActionsReturn\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:135](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L135)

Hook backing the Users tab's lifecycle actions and their confirmation modal.

## Parameters

### \\_\\_namedParameters

\`UseUserLifecycleActionsOptions\`

## Returns

\`UseUserLifecycleActionsReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserLifecycleActions / LifecycleResult

# Interface: LifecycleResult

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L76)

Outcome message emitted by a lifecycle action (a subset of the shared alert data).

## Properties

### text

> **text**: \`string\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:77](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L77)

***

### type

> **type**: \`"success"\` \\| \`"danger"\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L78)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserLifecycleActions / PasswordConfirmInput

# Interface: PasswordConfirmInput

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L70)

What the confirm button hands back for a \`'resetPassword'\` action.

\`password\` is required by \`'set'\` and \`'set-and-expire'\` and meaningless to
the other two; the modal is what enforces that, because it is the only thing
that knows whether the field was filled in.

## Properties

### mode

> **mode**: \`PasswordChangeMode\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:71](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L71)

***

### password?

> \`optional\` **password?**: \`string\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:72](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L72)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserLifecycleActions / LifecycleAction

# Type Alias: LifecycleAction

> **LifecycleAction** = \`"suspend"\` \\| \`"unsuspend"\` \\| \`"resetPassword"\`

Defined in: [src/sidepanel/hooks/useUserLifecycleActions.ts:61](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserLifecycleActions.ts#L61)

User lifecycle operation triggered from the profile card.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserMemberships / useUserMemberships

# Function: useUserMemberships()

> **useUserMemberships**(\`options\`): \`UseUserMembershipsReturn\`

Defined in: [src/sidepanel/hooks/useUserMemberships.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserMemberships.ts#L145)

Load a user's group memberships and classify each as DIRECT or RULE_BASED,
deriving the org rule inventory from the snapshot and listing rules only when the
snapshot has no completed walk for the connected org.

## Parameters

### options

\`UseUserMembershipsOptions\`

See \`UseUserMembershipsOptions\`.

## Returns

\`UseUserMembershipsReturn\`

\`memberships\` (each annotated with its inferred type, or \`undefined\`
  when they have not been read), \`isLoading\`,
  \`error\`, \`rules\` (the org rule inventory as a three-state
  RuleInventoryState — not yet resolved, obtained, or could-not-obtain),
  \`loadMemberships(user)\` to (re)load for a user, and \`clearMemberships\` to
  reset.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserMemberships / RuleInventoryState

# Type Alias: RuleInventoryState

> **RuleInventoryState** = \\{ \`status\`: \`"unresolved"\`; \\} \\| \\{ \`status\`: \`"available"\`; \`rules\`: \`FormattedRule\`[]; \\} \\| \\{ \`status\`: \`"unavailable"\`; \\}

Defined in: [src/sidepanel/hooks/useUserMemberships.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserMemberships.ts#L64)

What is known about the org's group-rule inventory. Three answers that must never
collapse into two:

- \`unresolved\` — no attempt has completed yet. Nothing may be concluded and
  nothing reported; a consumer renders it as "not computed", never as a finding.
- \`available\` — the inventory was obtained. \`rules\` may legitimately be empty,
  meaning the org genuinely has no rules.
- \`unavailable\` — an attempt completed and failed. A real, reportable answer.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserPicker / useUserPicker

# Function: useUserPicker()

> **useUserPicker**(\`__namedParameters\`): \`UseUserPickerReturn\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:47](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L47)

Hook behind \`UserPickerModal\`.

## Parameters

### \\_\\_namedParameters

\`UseUserPickerOptions\`

## Returns

\`UseUserPickerReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserPicker / UseUserPickerOptions

# Interface: UseUserPickerOptions

Defined in: [src/sidepanel/hooks/useUserPicker.ts:20](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L20)

Options for useUserPicker.

## Properties

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L22)

Tab whose scheduler runs the search; \`null\` when none.

***

### onPick

> **onPick**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L24)

Called with the picked user; the modal closes and its query clears.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L29)

Whether the owning view is the visible one. The debounced search is
suspended while hidden. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserPicker / UseUserPickerReturn

# Interface: UseUserPickerReturn

Defined in: [src/sidepanel/hooks/useUserPicker.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L33)

Return shape of useUserPicker.

## Properties

### isOpen

> **isOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L34)

***

### open

> **open**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L35)

#### Returns

\`void\`

***

### close

> **close**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L36)

#### Returns

\`void\`

***

### query

> **query**: \`string\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L37)

***

### setQuery

> **setQuery**: (\`query\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L38)

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

***

### results

> **results**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/useUserPicker.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L39)

***

### isSearching

> **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L40)

***

### searchError

> **searchError**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L41)

***

### pick

> **pick**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserPicker.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserPicker.ts#L43)

Pick a user: closes the modal, clears the query, fires \`onPick\`.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserQualification / useUserQualification

# Function: useUserQualification()

> **useUserQualification**(\`__namedParameters\`): \`UseUserQualificationReturn\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L86)

Hook behind \`UserQualificationSurface\` and the strip's two check verbs.

## Parameters

### \\_\\_namedParameters

\`UseUserQualificationOptions\`

## Returns

\`UseUserQualificationReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserQualification / UseUserQualificationOptions

# Interface: UseUserQualificationOptions

Defined in: [src/sidepanel/hooks/useUserQualification.ts:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L28)

Options for useUserQualification.

## Properties

### user

> **user**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L30)

The rung's user, or \`null\` on the search rung.

***

### memberships

> **memberships**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L32)

The user's complete, classified memberships; \`undefined\` until loaded.

***

### rules

> **rules**: \`RuleInventoryState\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L34)

The org's rule inventory, three-state.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:36](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L36)

\`null\` when no tab can serve the group search.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:38](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L38)

Whether the rung is visible; gates the group picker's search.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserQualification / UseUserQualificationReturn

# Interface: UseUserQualificationReturn

Defined in: [src/sidepanel/hooks/useUserQualification.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L54)

Return shape of useUserQualification.

## Properties

### rulePicker

> **rulePicker**: \`object\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L56)

The rule picker's open state and the inventory it filters — \`[]\` until available.

#### isOpen

> **isOpen**: \`boolean\`

#### open

> **open**: () => \`void\`

##### Returns

\`void\`

#### close

> **close**: () => \`void\`

##### Returns

\`void\`

#### rules

> **rules**: readonly \`FormattedRule\`[]

***

### groupPicker

> **groupPicker**: \`UseGroupPickerReturn\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L62)

***

### check

> **check**: \`UserQualificationCheck\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:63](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L63)

***

### openRulePicker

> **openRulePicker**: (() => \`void\`) \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:65](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L65)

Open the rule picker. \`undefined\` until the inventory is available — the verb is omitted.

***

### openGroupPicker

> **openGroupPicker**: (() => \`void\`) \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:67](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L67)

Open the group picker. \`undefined\` with no tab — the verb is omitted.

***

### pickRule

> **pickRule**: (\`rule\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L68)

#### Parameters

##### rule

\`FormattedRule\`

#### Returns

\`void\`

***

### checkGroup

> **checkGroup**: (\`group\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L73)

Check the user against a group the reader did not pick here — a forwarded
link that already names it. Takes only what the verdict reads.

#### Parameters

##### group

\`QualificationGroup\`

#### Returns

\`void\`

***

### clear

> **clear**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUserQualification.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L75)

Drop the check.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserQualification / QualificationGroup

# Type Alias: QualificationGroup

> **QualificationGroup** = \`Pick\`\\<\`GroupSearchResult\`, \`"id"\` \\| \`"name"\` \\| \`"type"\`\\>

Defined in: [src/sidepanel/hooks/useUserQualification.ts:79](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L79)

The fields of a group a membership check reads: identity, a name to show, and its type.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserQualification / UserQualificationCheck

# Type Alias: UserQualificationCheck

> **UserQualificationCheck** = \\{ \`kind\`: \`"none"\`; \\} \\| \\{ \`kind\`: \`"pending"\`; \`reason\`: \`"memberships"\` \\| \`"inventory"\`; \\} \\| \\{ \`kind\`: \`"rule"\`; \`rule\`: \`FormattedRule\`; \`verdict\`: \`RuleUserVerdict\`; \\} \\| \\{ \`kind\`: \`"group"\`; \`group\`: \`QualificationGroup\`; \`verdict\`: \`GroupUserVerdict\`; \\}

Defined in: [src/sidepanel/hooks/useUserQualification.ts:42](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserQualification.ts#L42)

What the rung has been asked, and what it can say.

## Union Members

### Type Literal

\\{ \`kind\`: \`"none"\`; \\}

***

### Type Literal

\\{ \`kind\`: \`"pending"\`; \`reason\`: \`"memberships"\` \\| \`"inventory"\`; \\}

Asked, but an input has not loaded. Never a verdict.

***

### Type Literal

\\{ \`kind\`: \`"rule"\`; \`rule\`: \`FormattedRule\`; \`verdict\`: \`RuleUserVerdict\`; \\}

***

### Type Literal

\\{ \`kind\`: \`"group"\`; \`group\`: \`QualificationGroup\`; \`verdict\`: \`GroupUserVerdict\`; \\}


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUserSearch / useUserSearch

# Function: useUserSearch()

> **useUserSearch**(\`__namedParameters\`): \`UseUserSearchReturn\`

Defined in: [src/sidepanel/hooks/useUserSearch.ts:53](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUserSearch.ts#L53)

Hook for searching Okta users with debouncing, a minimum query length, and an
\`enabled\` gate for hosts that stay mounted while hidden.

## Parameters

### \\_\\_namedParameters

\`UseUserSearchOptions\`

## Returns

\`UseUserSearchReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabProfileEdit / useUsersTabProfileEdit

# Function: useUsersTabProfileEdit()

> **useUsersTabProfileEdit**(\`options\`): \`UserProfileEditing\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:223](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L223)

Everything the Users tab needs to make its Profile pane editable.

## Parameters

### options

\`UseUsersTabProfileEditOptions\`

See UseUsersTabProfileEditOptions.

## Returns

\`UserProfileEditing\`

The bundle sidepanel/components/users/UserDetailPanel takes as
  its \`profileEdit\` prop — the header controls, the per-attribute cells, and
  the save confirmation's props.

## Example

\`\`\`tsx
const profileEdit = useUsersTabProfileEdit({
  user: selectedUser,
  attributes: panes.attributes,
  memberships,
  rules,
  targetTabId,
  enabled: isActive && panes.pane === 'profile',
  onUserUpdated: setSelectedUser,
  onResult: setResultMessage,
});

<UserDetailPanel profileEdit={profileEdit} … />;
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabProfileEdit / UseUsersTabProfileEditOptions

# Interface: UseUsersTabProfileEditOptions

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L137)

Options for useUsersTabProfileEdit.

## Properties

### user

> **user**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L139)

The tab's selected user; every verb no-ops without one.

***

### attributes

> **attributes**: readonly \`AttributeDescriptor\`[]

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:145](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L145)

The attribute inventory as \`useUserDetailPanes\` resolved it — the same array
the pane renders, so the editor cannot offer a control for something the
reader cannot see.

***

### memberships

> **memberships**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:156](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L156)

The user's memberships, or \`undefined\` when they have not been read. Passed
straight to useBlastRadius, which reports \`not-computed\` rather than
judging an edit against a list nobody fetched.

***

### rules

> **rules**: \`RuleInventoryState\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:158](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L158)

The org's rule inventory, three-state. \`unresolved\` predicts nothing at all.

***

### oktaOrigin?

> \`optional\` **oktaOrigin?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:160](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L160)

Connected org origin, so the blast-radius report can label group ids.

***

### mastering?

> \`optional\` **mastering?**: \`ProfileMastering\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:166](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L166)

Which profile sources are attached to the user, as \`useUserDetailPanes\`
resolved them. Decides whether an org-wide \`PROFILE_MASTER\` attribute is
mastered for *this* person; absent, every one of them stays locked.

***

### targetTabId

> **targetTabId**: \`number\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:168](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L168)

Tab whose scheduler runs the write.

***

### enabled

> **enabled**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:174](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L174)

Whether the Profile pane is actually on screen — \`isActive && pane ===
'profile'\`. \`false\` blocks entering edit mode and blocks the write, so a
hidden tab never writes to a profile out of view.

***

### onUserUpdated

> **onUserUpdated**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:176](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L176)

Lifts a refreshed user into the tab's state. See the module header for why this is mandatory.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### onMembershipsChanged

> **onMembershipsChanged**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:190](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L190)

Re-reads the user's group memberships, because a profile write may have moved
them.

\`useProfileEdit\` invalidates the cached analysis on a confirmed save, but that
is not enough on its own: the Groups pane stays mounted and holds the analysis
it last loaded, so dropping the cache behind it leaves pre-write memberships on
screen after the save modal predicted, by name, which groups would move.

Takes the user the write produced, never the one on screen. Membership analysis
evaluates the org's rules against the user's attributes, so a reload handed the
pre-write user fetches the right groups and then badges them \`Direct\`.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### onResult

> **onResult**: (\`message\`, \`action?\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:196](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L196)

Publishes the tab's result banner. The optional second argument is the
banner's inline action — there is no toast primitive in this panel, and
\`AlertMessage\`'s action slot is where an inline Undo belongs.

#### Parameters

##### message

\`AlertMessageData\`

##### action?

\`AlertAction\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabProfileEdit / UserProfileEditing

# Interface: UserProfileEditing

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L60)

Everything the Profile pane needs to be editable, as one bundle —
module:sidepanel/components/users/UserDetailPanel's \`profileEdit\` prop.
One prop rather than fifteen because the three parts are only correct together:
the header's \`changeCount\`, the \`cells\`, and the \`save\` confirmation all describe
one draft.

## Properties

### controls

> **controls**: \`ProfileEditControls\`

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L62)

The pane-level verbs: Edit, or Cancel + Save with a dirty count.

***

### cells

> **cells**: \`Readonly\`\\<\`Record\`\\<\`string\`, \`AttributeEditCell\`\\>\\>

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L64)

Attribute Okta name → its edit cell. Empty outside edit mode.

***

### save

> **save**: \`Omit\`\\<\`ProfileSaveModalProps\`, \`"userName"\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabProfileEdit.ts:70](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabProfileEdit.ts#L70)

The save confirmation's props, less \`userName\` — the panel already holds the
user, and deriving the name there is what stops the dialog naming somebody
other than the profile behind it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabSearch / useUsersTabSearch

# Function: useUsersTabSearch()

> **useUsersTabSearch**(\`__namedParameters\`): \`UseUsersTabSearchReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabSearch.ts:69](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabSearch.ts#L69)

Hook backing the Users tab search box: debounced, tab-scoped user search wired into the
orchestrator's merged error channel and selection reset.

## Parameters

### \\_\\_namedParameters

\`UseUsersTabSearchOptions\`

## Returns

\`UseUsersTabSearchReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabState / useUsersTabState

# Function: useUsersTabState()

> **useUsersTabState**(\`__namedParameters\`): \`UseUsersTabStateReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:241](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L241)

Hook owning all Users-tab state and the wiring between its feature hooks.

## Parameters

### \\_\\_namedParameters

\`UseUsersTabStateOptions\`

## Returns

\`UseUsersTabStateReturn\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabState / UseUsersTabStateOptions

# Interface: UseUsersTabStateOptions

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:60](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L60)

Options for useUsersTabState.

## Properties

### targetTabId?

> \`optional\` **targetTabId?**: \`number\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:62](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L62)

Chrome tab id of the connected Okta tab; required for all user/group API calls.

***

### selectedUserId?

> \`optional\` **selectedUserId?**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:68](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L68)

One-shot request to open a specific user (e.g. from the Overview's "View all
groups"): the hook fetches that user + their memberships, then calls
UseUsersTabStateOptions.onUserSelected to clear the request.

***

### selectedUserDestination?

> \`optional\` **selectedUserDestination?**: \`UserDestination\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L73)

Where inside the requested user to land. Held until that user has loaded,
then applied once — a pane cannot be opened on a rung that is not there yet.

***

### onUserSelected?

> \`optional\` **onUserSelected?**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:75](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L75)

Invoked once UseUsersTabStateOptions.selectedUserId has been consumed.

#### Returns

\`void\`

***

### isActive?

> \`optional\` **isActive?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:81](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L81)

Whether the Users tab is the selected top-level tab. Gates live page-context
re-detection, the search debounce and the Add-to-Group type-ahead so a hidden
tab spends no scheduler budget. Defaults to \`true\`.

***

### compareViewRef?

> \`optional\` **compareViewRef?**: \`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:87](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L87)

Ref on the pushed view's container, owned by the tab. Handed to
sidepanel/hooks/useViewStack.useViewStack so focus moves into a pushed
comparison; passed **in** rather than returned, per that hook's contract.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabState / UseUsersTabStateReturn

# Interface: UseUsersTabStateReturn

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:111](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L111)

Return shape of useUsersTabState.

## Properties

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:113](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L113)

Okta org origin from the page context; used to build admin deep links.

***

### selectedUser

> **selectedUser**: \`OktaUser\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:115](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L115)

The user whose profile + memberships the tab is showing, or \`null\`.

***

### memberships

> **memberships**: \`GroupMembership\`[] \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:121](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L121)

The selected user's memberships, each classified DIRECT vs RULE_BASED, or
\`undefined\` when nobody has read them — before a user is picked, and after a
load that failed. See useUserMemberships for why this is not \`[]\`.

***

### isLoadingMemberships

> **isLoadingMemberships**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:123](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L123)

True while a user's memberships are being loaded/analysed.

***

### error

> **error**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:125](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L125)

The tab's single merged error channel (search / load / membership failures).

***

### dismissError

> **dismissError**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:127](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L127)

Dismisses the merged error banner.

#### Returns

\`void\`

***

### resultMessage

> **resultMessage**: \`AlertMessageData\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L129)

Result banner for lifecycle / add-to-group / profile-save outcomes.

***

### resultAction

> **resultAction**: \`AlertAction\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:136](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L136)

The result banner's inline action, when the outcome offers one — today only
the \`Undo\` after a confirmed profile save. Written only together with the
message, through one setter that clears it, so a lifecycle result cannot
inherit the previous save's Undo button.

***

### dismissResultMessage

> **dismissResultMessage**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:138](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L138)

Dismisses the result banner and its action.

#### Returns

\`void\`

***

### searchQuery

> **searchQuery**: \`string\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:140](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L140)

Current search box value.

***

### setSearchQuery

> **setSearchQuery**: (\`query\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:142](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L142)

Updates the search box, (re)arming the 600ms debounce.

#### Parameters

##### query

\`string\`

#### Returns

\`void\`

***

### searchResults

> **searchResults**: \`OktaUser\`[]

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L144)

Latest committed search results.

***

### isSearching

> **isSearching**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:146](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L146)

True while a debounced search is in flight.

***

### resultsTruncated

> **resultsTruncated**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:152](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L152)

Whether Okta held matches back from \`searchResults\` — its own answer, from the
search response's \`Link\` header. The results list needs it so one capped page
is never rendered as the number of people who match.

***

### selectUser

> **selectUser**: (\`user\`) => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:155](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L155)

Selects a user from the search results and loads their memberships.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`Promise\`\\<\`void\`\\>

***

### clearSearch

> **clearSearch**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:157](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L157)

Clears the search, selection, memberships and both banners.

#### Returns

\`void\`

***

### nav

> **nav**: \`ViewStack\`\\<\`UsersViewEntry\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:159](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L159)

The tab's sub-navigation stack: search → a user's detail → their comparison.

***

### isDetailOpen

> **isDetailOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:161](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L161)

Whether a user's detail page is the view on screen.

***

### isCompareOpen

> **isCompareOpen**: \`boolean\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:163](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L163)

Whether a comparison is the view on screen (the stack's second rung).

***

### proveMembershipSource?

> \`optional\` **proveMembershipSource?**: (\`groupId\`) => \`Promise\`\\<\`MemberRuleAttribution\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:170](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L170)

Asks Okta which rules manage one of the selected user's memberships.
\`undefined\` when there is no selected user or no connected tab, which hides
the per-row "Prove it" action rather than offering one that cannot work.
One request per call, so it is only ever invoked from that press.

#### Parameters

##### groupId

\`string\`

#### Returns

\`Promise\`\\<\`MemberRuleAttribution\`\\>

***

### openCompare

> **openCompare**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:172](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L172)

Pushes the comparison view for the selected user. No-op without one.

#### Returns

\`void\`

***

### closeCompare

> **closeCompare**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:174](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L174)

Pops the comparison view, returning to the search + profile body.

#### Returns

\`void\`

***

### comparePreset

> **comparePreset**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:179](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L179)

The second user a forwarded comparison arrived with, for the comparison to
load in place of its search phase; \`null\` once that comparison is closed.

***

### refreshSelectedUserMemberships

> **refreshSelectedUserMemberships**: () => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:185](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L185)

Reloads the selected user's memberships in place after the comparison view
copies a group onto them. Deliberately does NOT touch the selected user or the
view stack, so adding a group never closes the comparison.

#### Returns

\`void\`

***

### lifecycle

> **lifecycle**: \`UseUserLifecycleActionsReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:187](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L187)

Lifecycle actions (suspend / unsuspend / reset password) and their confirm modal.

***

### addToGroup

> **addToGroup**: \`UseAddToGroupReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:189](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L189)

The Add-to-Group modal's state machine (type-ahead, selection, add).

***

### panes

> **panes**: \`UseUserDetailPanesReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:195](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L195)

The detail rung's three panes: which one is on screen, and the apps and
profile data each loads on first entry
(sidepanel/hooks/useUserDetailPanes.useUserDetailPanes).

***

### qualification

> **qualification**: \`UseUserQualificationReturn\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:201](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L201)

The rung's two zero-request qualification checks — *Check rule* over the
inventory, *Check membership* over a searched group — and the check in scope
(sidepanel/hooks/useUserQualification.useUserQualification).

***

### profileEdit

> **profileEdit**: \`UserProfileEditing\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:208](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L208)

Everything that makes the Profile pane editable — the header's verbs, the
per-attribute cells and the save confirmation's props. Composed in
sidepanel/hooks/useUsersTabProfileEdit.useUsersTabProfileEdit so this
orchestrator gains one field rather than three hooks' worth of state.

***

### applySelectedUserUpdate

> **applySelectedUserUpdate**: (\`user\`) => \`void\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:215](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L215)

Publishes a profile save made *outside* the Profile pane — today the Compare
rung's left column, which edits this same \`selectedUser\`. There is no \`user\`
cache key, so an unlifted save leaves every surface showing values Okta no
longer holds; the Compare view refuses to edit that column without this.

#### Parameters

##### user

\`OktaUser\`

#### Returns

\`void\`

***

### confirmAddToGroup

> **confirmAddToGroup**: () => \`Promise\`\\<\`void\`\\>

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:222](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L222)

The Add-to-Group modal's confirm handler — use this in place of
UseUsersTabStateReturn.addToGroup's own \`confirmAddToGroup\`. It snapshots
the group being confirmed before delegating, so the row for that group can flash
once the add resolves; every other \`addToGroup\` member is passed through unchanged.

#### Returns

\`Promise\`\\<\`void\`\\>

***

### recentlyAddedGroupId

> **recentlyAddedGroupId**: \`string\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:227](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L227)

Id of the group most recently added via the Add-to-Group modal, so its row in the
membership list can play a one-shot success flash; \`null\` once the flash is over.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useUsersTabState / UsersViewEntry

# Type Alias: UsersViewEntry

> **UsersViewEntry** = \\{ \`kind\`: \`"detail"\`; \`userId\`: \`string\`; \`userName\`: \`string\`; \\} \\| \\{ \`kind\`: \`"compare"\`; \`userId\`: \`string\`; \`userName\`: \`string\`; \\}

Defined in: [src/sidepanel/hooks/useUsersTabState.ts:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useUsersTabState.ts#L94)

One pushed view of the Users tab's stack: a user's **detail** page, then a
**comparison** anchored on that user.

## Union Members

### Type Literal

\\{ \`kind\`: \`"detail"\`; \`userId\`: \`string\`; \`userName\`: \`string\`; \\}

#### kind

> **kind**: \`"detail"\`

#### userId

> **userId**: \`string\`

Id of the user whose profile + memberships are shown.

#### userName

> **userName**: \`string\`

That user's display name at push time, for the breadcrumb/title.

***

### Type Literal

\\{ \`kind\`: \`"compare"\`; \`userId\`: \`string\`; \`userName\`: \`string\`; \\}

#### kind

> **kind**: \`"compare"\`

#### userId

> **userId**: \`string\`

Id of the user the comparison is anchored on (its left-hand side).

#### userName

> **userName**: \`string\`

That user's display name at push time, for the breadcrumb/subtitle.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useViewStack / useViewStack

# Function: useViewStack()

> **useViewStack**\\<\`TEntry\`\\>(\`__namedParameters\`): \`ViewStack\`\\<\`TEntry\`\\>

Defined in: [src/sidepanel/hooks/useViewStack.ts:115](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L115)

Owns a tab's push/pop sub-navigation stack: the pushed entries, the breadcrumb
trail, and focus move/restore across a push and pop.

Instantiate it once per tab shell, and render the detail view as a sibling of the
list rather than in place of it (see the module docs).

## Type Parameters

### TEntry

\`TEntry\`

A small descriptor identifying a pushed view (\`{ id, name }\`)
rather than a whole loaded entity, so the detail view owns its own fetching.

## Parameters

### \\_\\_namedParameters

\`UseViewStackOptions\`\\<\`TEntry\`\\>

## Returns

\`ViewStack\`\\<\`TEntry\`\\>


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useViewStack / UseViewStackOptions

# Interface: UseViewStackOptions\\<TEntry\\>

Defined in: [src/sidepanel/hooks/useViewStack.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L52)

Configuration for useViewStack.

## Type Parameters

### TEntry

\`TEntry\`

## Properties

### rootLabel

> **rootLabel**: \`string\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:54](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L54)

Label for the root (list) view — the first crumb of the trail.

***

### getLabel

> **getLabel**: (\`entry\`) => \`string\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L56)

Projects a pushed entry to its breadcrumb label.

#### Parameters

##### entry

\`TEntry\`

#### Returns

\`string\`

***

### getKey?

> \`optional\` **getKey?**: (\`entry\`, \`depth\`) => \`string\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L58)

Projects a pushed entry to a stable React key. Defaults to the entry's depth.

#### Parameters

##### entry

\`TEntry\`

##### depth

\`number\`

#### Returns

\`string\`

***

### viewRef?

> \`optional\` **viewRef?**: \`RefObject\`\\<\`HTMLElement\` \\| \`null\`\\>

Defined in: [src/sidepanel/hooks/useViewStack.ts:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L64)

Ref on the pushed view's container, owned by the consumer. Give that element
\`tabIndex={-1}\` so it can take focus when it holds no focusable child. Omit it to
skip moving focus into the pushed view; restoration on \`pop\` still works.

***

### manageFocus?

> \`optional\` **manageFocus?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:66](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L66)

Set \`false\` when the consumer manages focus itself. Defaults to \`true\`.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useViewStack / ViewStack

# Interface: ViewStack\\<TEntry\\>

Defined in: [src/sidepanel/hooks/useViewStack.ts:76](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L76)

Navigation state and mutators returned by useViewStack.

## Type Parameters

### TEntry

\`TEntry\`

## Properties

### entries

> **entries**: readonly \`TEntry\`[]

Defined in: [src/sidepanel/hooks/useViewStack.ts:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L78)

The pushed entries, root-first. Empty at the root.

***

### currentEntry

> **currentEntry**: \`TEntry\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:80](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L80)

The entry currently on screen, or \`undefined\` at the root (list) view.

***

### depth

> **depth**: \`number\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:82](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L82)

Number of pushed entries; \`0\` at the root.

***

### isRoot

> **isRoot**: \`boolean\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:84](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L84)

Convenience for \`depth === 0\` — render the list when true.

***

### trail

> **trail**: \`ViewStackCrumb\`[]

Defined in: [src/sidepanel/hooks/useViewStack.ts:86](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L86)

Root crumb plus one crumb per pushed entry, in order.

***

### transition

> **transition**: \`ViewStackTransition\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L91)

Direction of the most recent navigation. Apply \`animate-push-in\` /
\`animate-pop-in\` to the arriving surface; a CSS hint only, it never gates focus.

***

### push

> **push**: (\`entry\`) => \`void\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L93)

Pushes a new entry on top of the stack and moves focus into the pushed view.

#### Parameters

##### entry

\`TEntry\`

#### Returns

\`void\`

***

### pop

> **pop**: () => \`void\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L95)

Pops one level, restoring focus to whatever triggered that push. No-op at the root.

#### Returns

\`void\`

***

### popTo

> **popTo**: (\`depth\`) => \`void\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:100](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L100)

Pops back to a given depth (\`0\` = root), restoring focus to the element that
triggered the first popped push.

#### Parameters

##### depth

\`number\`

#### Returns

\`void\`

***

### reset

> **reset**: () => \`void\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:102](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L102)

Clears the whole stack back to the root view. Equivalent to \`popTo(0)\`.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useViewStack / ViewStackCrumb

# Interface: ViewStackCrumb

Defined in: [src/sidepanel/hooks/useViewStack.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L35)

One rung of the breadcrumb trail returned by useViewStack.

## Properties

### key

> **key**: \`string\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L37)

Stable React key for the crumb.

***

### label

> **label**: \`string\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L39)

Human-readable label — \`rootLabel\` for the root, \`getLabel(entry)\` otherwise.

***

### depth

> **depth**: \`number\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L41)

Stack depth this crumb represents; \`0\` is the root (list) view.

***

### isCurrent

> **isCurrent**: \`boolean\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L43)

True for the last crumb, i.e. the view currently on screen.

***

### onSelect?

> \`optional\` **onSelect?**: () => \`void\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:48](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L48)

Navigates back to this crumb. \`undefined\` on the current crumb, which is not
actionable — render it as plain text with \`aria-current="page"\`.

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useViewStack / ViewStackTransition

# Type Alias: ViewStackTransition

> **ViewStackTransition** = \`"push"\` \\| \`"pop"\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useViewStack.ts:73](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useViewStack.ts#L73)

Direction of the most recent navigation, for picking an entrance animation. \`null\`
before the first push, so the tab's initial render does not animate.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useWorkingSet / useWorkingSet

# Function: useWorkingSet()

> **useWorkingSet**(\`origin\`): \`UseWorkingSetResult\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:58](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L58)

Subscribe to one org's working set.

## Parameters

### origin

\`string\` \\| \`null\` \\| \`undefined\`

Okta org origin. \`null\` reads nothing rather than another
org's rows, and both writes become no-ops.

## Returns

\`UseWorkingSetResult\`

See UseWorkingSetResult.

## Example

\`\`\`tsx
const workingSet = useWorkingSet(oktaOrigin);
<WorkingSetPinButton
  pinned={workingSet.isPinned('group', group.id)}
  onToggle={() => workingSet.togglePin({ kind: 'group', id: group.id, name: group.name })}
/>
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useWorkingSet / UseWorkingSetResult

# Interface: UseWorkingSetResult

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L25)

What useWorkingSet exposes.

## Properties

### pinned

> **pinned**: \`WorkingSetRef\`[]

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L27)

Entities the reader chose to keep.

***

### recent

> **recent**: \`WorkingSetRef\`[]

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L29)

Entities recently opened, most recent first.

***

### isReading

> **isReading**: \`boolean\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L31)

\`true\` until the first read settles, so a cold panel can hold its copy.

***

### isPinned

> **isPinned**: (\`kind\`, \`id\`) => \`boolean\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L33)

Whether one entity is currently pinned.

#### Parameters

##### kind

\`WorkingSetKind\`

##### id

\`string\`

#### Returns

\`boolean\`

***

### togglePin

> **togglePin**: (\`ref\`) => \`void\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L35)

Pin an entity, or release it if it is already pinned.

#### Parameters

##### ref

\`Omit\`\\<\`WorkingSetRef\`, \`"lastSeenAt"\`\\>

#### Returns

\`void\`

***

### forget

> **forget**: (\`kind\`, \`id\`) => \`void\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L37)

Drop an entity from both lists.

#### Parameters

##### kind

\`WorkingSetKind\`

##### id

\`string\`

#### Returns

\`void\`

***

### restorePin

> **restorePin**: (\`ref\`, \`index\`) => \`void\`

Defined in: [src/sidepanel/hooks/useWorkingSet.ts:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSet.ts#L39)

Put a released pin back at the position it held.

#### Parameters

##### ref

\`WorkingSetRef\`

##### index

\`number\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useWorkingSetEntry / useWorkingSetEntry

# Function: useWorkingSetEntry()

> **useWorkingSetEntry**(\`__namedParameters\`): \`void\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:52](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L52)

Record the entity this rung has open, and keep its pane up to date.

## Parameters

### \\_\\_namedParameters

\`UseWorkingSetEntryOptions\`

## Returns

\`void\`

## Example

\`\`\`ts
useWorkingSetEntry({
  origin: oktaOrigin,
  kind: 'group',
  id: group?.id,
  name: group?.name,
  pane: activePane,
  enabled: isActive,
});
\`\`\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/hooks/useWorkingSetEntry / UseWorkingSetEntryOptions

# Interface: UseWorkingSetEntryOptions

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:15](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L15)

Options for useWorkingSetEntry.

## Properties

### origin

> **origin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:17](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L17)

Okta org origin. \`null\` records nothing.

***

### kind

> **kind**: \`WorkingSetKind\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:19](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L19)

Which detail rung this is.

***

### id

> **id**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L21)

Okta id of the open entity, or \`null\`/\`undefined\` on a rung with none.

***

### name

> **name**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:23](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L23)

Display name, as the header shows it.

***

### pane?

> \`optional\` **pane?**: \`string\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L29)

Which pane is open, when the rung has panes. Changing it rewrites the
entry, so a returning reader lands where they left off. Omit on a rung
without panes rather than inventing a location.

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useWorkingSetEntry.ts:34](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useWorkingSetEntry.ts#L34)

Whether to record. Pass the tab's \`isActive\`: tabs stay mounted, so a hidden
rung would otherwise keep re-asserting itself as "most recent".`;function t(e){return n.jsxs(n.Fragment,{children:[`
`,n.jsx(a,{title:"Internals/Hooks"}),`
`,n.jsx(r,{children:i})]})}function h(e={}){const{wrapper:s}={...o(),...e.components};return s?n.jsx(s,{...e,children:n.jsx(t,{...e})}):t()}export{h as default};
