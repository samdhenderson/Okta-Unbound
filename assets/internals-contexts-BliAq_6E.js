import{j as n}from"./iframe-Pee757m_.js";import{u as o,M as a,c as i}from"./blocks-CbycfW6w.js";import"./preload-helper-PPVm8Dsz.js";const r=`# Contexts



---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / useEntityNavigation

# Function: useEntityNavigation()

> **useEntityNavigation**(): \`EntityNavigation\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:165](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L165)

Access cross-entity navigation. Never throws: outside a
NavigationProvider every entity kind reports as unreachable, so a
component in a story or unit test needs no wrapper.

## Returns

\`EntityNavigation\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / EntityNavigation

# Interface: EntityNavigation

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:99](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L99)

The context value returned by useEntityNavigation.

## Properties

### navigateTo

> **navigateTo**: (\`intent\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:104](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L104)

Open the referenced entity on its own tab, at the destination the intent
names when it names one. A no-op for an unreachable type.

#### Parameters

##### intent

\`NavigationIntent\`

#### Returns

\`void\`

***

### canNavigateTo

> **canNavigateTo**: (\`type\`) => \`boolean\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:106](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L106)

Whether this build can currently navigate to that entity kind.

#### Parameters

##### type

\`EntityType\`

#### Returns

\`boolean\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / EntityRef

# Interface: EntityRef

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:28](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L28)

A navigable reference: an entity kind plus its Okta id.

## Properties

### type

> **type**: \`EntityType\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L30)

Which kind of entity, deciding both the destination tab and the glyph.

***

### id

> **id**: \`string\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L32)

The Okta id to open.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / NavigationHandlers

# Interface: NavigationHandlers

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L90)

Per-type jump handlers. A type whose handler is omitted is reported as
unreachable rather than silently doing nothing — see the module note.

A handler is called with the destination only when the intent carried one, so
a handler written for \`(id)\` sees exactly that for a plain link.

## Properties

### rule?

> \`optional\` **rule?**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:91](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L91)

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### group?

> \`optional\` **group?**: (\`id\`, \`destination?\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:92](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L92)

#### Parameters

##### id

\`string\`

##### destination?

\`GroupDestination\`

#### Returns

\`void\`

***

### user?

> \`optional\` **user?**: (\`id\`, \`destination?\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:93](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L93)

#### Parameters

##### id

\`string\`

##### destination?

\`UserDestination\`

#### Returns

\`void\`

***

### app?

> \`optional\` **app?**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:94](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L94)

#### Parameters

##### id

\`string\`

#### Returns

\`void\`

***

### policy?

> \`optional\` **policy?**: (\`id\`) => \`void\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:95](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L95)

#### Parameters

##### id

\`string\`

#### Returns

\`void\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / NavigationProviderProps

# Interface: NavigationProviderProps

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:122](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L122)

Props for NavigationProvider.

## Properties

### handlers

> **handlers**: \`NavigationHandlers\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:128](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L128)

The jump handlers this build can honour. Omit a type that has no destination
yet; \`EntityLink\` will render its name as plain text rather than as a dead
control.

***

### children

> **children**: \`ReactNode\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:129](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L129)


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / EntityType

# Type Alias: EntityType

> **EntityType** = \`"rule"\` \\| \`"group"\` \\| \`"user"\` \\| \`"app"\` \\| \`"policy"\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L25)

The entity kinds one surface can send a reader to another surface to see.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / GroupDestination

# Type Alias: GroupDestination

> **GroupDestination** = \\{ \`pane?\`: \`GroupDetailTab\`; \`memberFilter?\`: \`undefined\`; \`draftRule?\`: \`undefined\`; \\} \\| \\{ \`pane\`: \`"members"\`; \`memberFilter\`: \`MemberFilter\`; \`draftRule?\`: \`undefined\`; \\} \\| \\{ \`pane\`: \`"rules"\`; \`draftRule\`: \`string\`; \`memberFilter?\`: \`undefined\`; \\}

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:44](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L44)

Where inside a group to land. Omitted, a group link lands on the group's row in
the list, as it always has; with a \`pane\`, it opens the group's detail rung at
that pane. A \`memberFilter\` opens the Members pane already narrowed to one
attribute value — only that pane has a roster to filter, so the type allows it
nowhere else. A \`draftRule\` opens the Rules pane with the create-a-feeding-rule
dialog already open on that expression: the write still happens there, behind
that dialog's confirm, never at the surface that drafted it.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / NavigationIntent

# Type Alias: NavigationIntent

> **NavigationIntent** = \`EntityRef\` \\| \`object\` & \`GroupDestination\` \\| \`object\` & \`UserDestination\`

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:78](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L78)

A reference plus, for the kinds that have one, where inside the entity to land.
Every EntityRef is one, so existing callers pass what they always did.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / QualificationTarget

# Type Alias: QualificationTarget

> **QualificationTarget** = \\{ \`kind\`: \`"group"\`; \`id\`: \`string\`; \`name\`: \`string\`; \`groupType\`: \`string\`; \\} \\| \\{ \`kind\`: \`"rule"\`; \`id\`: \`string\`; \\}

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:55](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L55)

What a user's rung is asked to check them against on arrival — *why is (or
isn't) this user in that group*, or *does this rule match them*. A group is
carried whole enough to assess (its type decides how membership can arise); a
rule is resolved from the org's rule inventory by id once that has loaded.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / UserDestination

# Type Alias: UserDestination

> **UserDestination** = \\{ \`pane\`: \`UserDetailPane\`; \`check?\`: \`undefined\`; \`compareWith?\`: \`undefined\`; \\} \\| \\{ \`check\`: \`QualificationTarget\`; \`pane?\`: \`undefined\`; \`compareWith?\`: \`undefined\`; \\} \\| \\{ \`compareWith\`: \`string\`; \`pane?\`: \`undefined\`; \`check?\`: \`undefined\`; \\}

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:64](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L64)

Where inside a user to land. Omitted, a user link opens the user's detail
rung on its Groups pane, as it always has. One destination at a time: a pane,
a qualification check opened above the panes, or a comparison with a second
user already chosen.

## Union Members

### Type Literal

\\{ \`pane\`: \`UserDetailPane\`; \`check?\`: \`undefined\`; \`compareWith?\`: \`undefined\`; \\}

***

### Type Literal

\\{ \`check\`: \`QualificationTarget\`; \`pane?\`: \`undefined\`; \`compareWith?\`: \`undefined\`; \\}

***

### Type Literal

\\{ \`compareWith\`: \`string\`; \`pane?\`: \`undefined\`; \`check?\`: \`undefined\`; \\}

#### compareWith

> **compareWith**: \`string\`

The id of the user to compare against, chosen by the reader upstream.

#### pane?

> \`optional\` **pane?**: \`undefined\`

#### check?

> \`optional\` **check?**: \`undefined\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/NavigationContext / NavigationProvider

# Variable: NavigationProvider

> \`const\` **NavigationProvider**: \`React.FC\`\\<\`NavigationProviderProps\`\\>

Defined in: [src/sidepanel/contexts/NavigationContext.tsx:133](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/NavigationContext.tsx#L133)

Publishes the app's cross-entity jump handlers to the whole tree.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/OrgEntityIndexContext / useOrgEntityIndex

# Function: useOrgEntityIndex()

> **useOrgEntityIndex**(): \`OrgEntityIndex\`

Defined in: [src/sidepanel/contexts/OrgEntityIndexContext.tsx:56](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/OrgEntityIndexContext.tsx#L56)

Read the panel's one org snapshot index. The reads and listeners belong to the
provider, so any number of surfaces may call this.

## Returns

\`OrgEntityIndex\`

## Throws

If called outside an OrgEntityIndexProvider.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/OrgEntityIndexContext / OrgEntityIndexProviderProps

# Interface: OrgEntityIndexProviderProps

Defined in: [src/sidepanel/contexts/OrgEntityIndexContext.tsx:30](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/OrgEntityIndexContext.tsx#L30)

Props for OrgEntityIndexProvider.

## Extends

- \`UseOrgEntityIndexSourceOptions\`

## Properties

### children

> **children**: \`ReactNode\`

Defined in: [src/sidepanel/contexts/OrgEntityIndexContext.tsx:32](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/OrgEntityIndexContext.tsx#L32)

The subtree that may call useOrgEntityIndex.

***

### oktaOrigin

> **oktaOrigin**: \`string\` \\| \`null\` \\| \`undefined\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:137](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L137)

Connected org origin; \`null\` reads nothing rather than another org's rows.

#### Inherited from

\`UseOrgEntityIndexSourceOptions\`.\`oktaOrigin\`

***

### targetTabId

> **targetTabId**: \`number\` \\| \`null\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:139](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L139)

Live Okta tab the background routes through; \`null\` disables syncing.

#### Inherited from

\`UseOrgEntityIndexSourceOptions\`.\`targetTabId\`

***

### enabled?

> \`optional\` **enabled?**: \`boolean\`

Defined in: [src/sidepanel/hooks/useOrgEntityIndex.ts:144](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/hooks/useOrgEntityIndex.ts#L144)

When \`false\` the store is still read and broadcasts still tracked, but no
sync is issued — a hidden tab must not drive org-wide traffic.

#### Inherited from

\`UseOrgEntityIndexSourceOptions\`.\`enabled\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/OrgEntityIndexContext / OrgEntityIndexProvider

# Variable: OrgEntityIndexProvider

> \`const\` **OrgEntityIndexProvider**: \`React.FC\`\\<\`OrgEntityIndexProviderProps\`\\>

Defined in: [src/sidepanel/contexts/OrgEntityIndexContext.tsx:40](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/OrgEntityIndexContext.tsx#L40)

Mount the org snapshot index once and publish it. Belongs at the shell, above
both the tab panels and the ⌘K palette — they are siblings, so no lower node can
serve both.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/ProgressContext / useProgress

# Function: useProgress()

> **useProgress**(): \`ProgressContextType\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:225](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L225)

Access progress state and controls.

## Returns

\`ProgressContextType\`

## Throws

If called outside a ProgressProvider.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/ProgressContext / useProgressOptional

# Function: useProgressOptional()

> **useProgressOptional**(): \`ProgressContextType\` \\| \`undefined\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:238](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L238)

Access the progress context if one is mounted, else \`undefined\`. Never throws,
so utilities that only optionally participate in global progress — \`useOktaApi\`
falls back to a local cancellation token — can call it outside a provider.

## Returns

\`ProgressContextType\` \\| \`undefined\`


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/ProgressContext / ProgressState

# Interface: ProgressState

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:21](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L21)

The current state of an ongoing operation.

## Properties

### isLoading

> **isLoading**: \`boolean\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:22](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L22)

***

### current

> **current**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:24](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L24)

Items processed so far.

***

### total

> **total**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:25](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L25)

***

### message

> **message**: \`string\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:27](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L27)

Human-readable status message.

***

### operationName?

> \`optional\` **operationName?**: \`string\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:29](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L29)

e.g. "Removing Users".

***

### apiCalls?

> \`optional\` **apiCalls?**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:31](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L31)

API calls made during the operation.

***

### startTime?

> \`optional\` **startTime?**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:33](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L33)

Epoch millis the operation started, for the duration readout.

***

### canCancel?

> \`optional\` **canCancel?**: \`boolean\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:35](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L35)

Whether the user may cancel.

***

### isCancelling?

> \`optional\` **isCancelling?**: \`boolean\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:37](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L37)

True from the moment the user cancels until the operation unwinds.

***

### completed?

> \`optional\` **completed?**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:39](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L39)

Items settled successfully in the current batch operation.

***

### active?

> \`optional\` **active?**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:41](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L41)

Items currently in flight in the current batch operation.

***

### failed?

> \`optional\` **failed?**: \`number\`

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:43](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L43)

Items settled with an error in the current batch operation.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/ProgressContext / ProgressProvider

# Variable: ProgressProvider

> \`const\` **ProgressProvider**: \`React.FC\`\\<\\{ \`children\`: \`ReactNode\`; \\}\\>

Defined in: [src/sidepanel/contexts/ProgressContext.tsx:90](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/ProgressContext.tsx#L90)

Provides progress tracking state and controls to the subtree.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/SchedulerContext / useScheduler

# Function: useScheduler()

> **useScheduler**(): \`SchedulerContextType\`

Defined in: [src/sidepanel/contexts/SchedulerContext.tsx:187](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/SchedulerContext.tsx#L187)

Access the scheduler state and controls.

## Returns

\`SchedulerContextType\`

The \`SchedulerContextType\` value from the nearest SchedulerProvider.

## Throws

If called outside a SchedulerProvider.


---

**Okta Unbound Internals v0.8.1-beta.4**

***

Okta Unbound Internals / sidepanel/contexts/SchedulerContext / SchedulerProvider

# Variable: SchedulerProvider

> \`const\` **SchedulerProvider**: \`React.FC\`\\<\\{ \`children\`: \`ReactNode\`; \\}\\>

Defined in: [src/sidepanel/contexts/SchedulerContext.tsx:59](https://github.com/samdhenderson/Okta-Unbound-Dev/blob/main/src/sidepanel/contexts/SchedulerContext.tsx#L59)

Provides scheduler state and controls to the side panel: one fetch on mount,
then \`schedulerStateChanged\` push messages keep queue depth and cooldown current.`;function s(e){return n.jsxs(n.Fragment,{children:[`
`,n.jsx(a,{title:"Internals/Contexts"}),`
`,n.jsx(i,{children:r})]})}function x(e={}){const{wrapper:t}={...o(),...e.components};return t?n.jsx(t,{...e,children:n.jsx(s,{...e})}):s()}export{x as default};
