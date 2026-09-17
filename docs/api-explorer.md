# API Explorer

The Explorer is a rail-hidden tab, reached from ⌘K. It sends one same-origin Okta
request and shows the response three ways. This doc covers the two things about it
that are not obvious from the code: **the catalog the path field suggests from**,
and **how a `{hole}` in a path gets filled**.

Everything it sends goes through the ordinary path — `useOktaApi.makeApiRequest`,
the scheduler, the content script's guards. The Explorer adds no message action and
no transport of its own.

## The catalog

`src/sidepanel/apiCatalog/` is data about the Okta API, not about this app. No
React, no request code, no component imports.

| File              | Holds                                                             |
| ----------------- | ----------------------------------------------------------------- |
| `types.ts`        | `CatalogEndpoint`, `CatalogParam`, `ParamScope`                   |
| `groups.ts`       | The browse headings, as a closed ordered set                      |
| `endpoints/*.ts`  | One file per Okta family, default-exporting its endpoints         |
| `params/*.ts`     | The parameter library, each entry scoped to the endpoints it fits |
| `registry.ts`     | Assembles both by `import.meta.glob`, sorted deterministically    |
| `resolve.ts`      | `resolveParams(endpointId)` — the only place scope is worked out  |
| `pathTemplate.ts` | Holes, hole kinds, and matching a typed path to a template        |
| `suggest.ts`      | The pure suggester: `(value, caret, candidates) => Suggestion`    |

**Adding an endpoint is adding a row to a file.** Adding a family is adding a file.
Nothing in `registry.ts` changes either way; duplicate ids throw at module load
rather than being silently dropped by glob order.

### Three rules the catalog is written to

- **Scope lives on the parameter, not on the endpoint.** `limit` and `after` apply
  to every collection in the API; restating them forty times is how a catalog goes
  stale in one place and not the others. Per-endpoint corrections ride on the
  endpoint as `paramOverrides` — `limit` is 200 generally, **1000** on a group's
  members, and **100 with a 1000 maximum** on the System Log.
- **No risk or provenance field.** Documented and undocumented parameters sit side
  by side. A stored `source: 'undocumented'` is an invitation to render a badge
  later, and a badge is a claim this app cannot stand behind for an arbitrary org.
  Where an entry came from is in the owning file's module JSDoc.
- **The references are the source.** Every file names the
  `.claude/skills/okta-api/references/*.md` it was transcribed from, and **a change
  to a reference updates the matching catalog file in the same commit.** They are
  not parsed at build time: `.claude/` is not in the extension bundle, and those
  tables carry caveats a parser would flatten.

## The field

`explorer/PathCombobox` renders it; `apiCatalog/suggest` decides what it says. All
parsing is pure, so the awkward cases — a caret in the middle of a parameter name,
a value already typed, a query string the reader moved back into — are function
calls in a test rather than typing simulations.

The field is read as regions, decided by the caret and the first `?`:

| Caret                                     | Mode          | Offers                                             |
| ----------------------------------------- | ------------- | -------------------------------------------------- |
| At or before the `?`                      | `path`        | Endpoints, under their browse headings             |
| In a segment that a template calls a hole | `hole`        | Ids for that hole (see below)                      |
| After the `?`, before a segment's `=`     | `param-name`  | That endpoint's parameters                         |
| After that `=`                            | `param-value` | Enum values, or the endpoint's default and maximum |

**A path still being completed is a path, not a hole.** `/api/v1/groups/rules`
matches the `{groupId}` template as surely as an id does; the tie is broken by
asking whether any catalog path still starts with what has been typed. A literal
`{token}` is exempt — braces never begin a real path.

### Why combobox ARIA here and roving focus in ⌘K

The palette moves real focus onto a real `<button>` and is right to: activating a
row there navigates and closes. Here, accepting a row **edits the text and the
reader keeps typing**, and the suggester's entire input is `selectionStart`. Roving
focus would move focus out of the field on every arrow press and destroy the state
the list is derived from. So focus never leaves the field, the active row is
pointed at with `aria-activedescendant`, and options are non-interactive `<li>`.
Headings are `<li role="presentation">` **inside** the listbox, which keeps the rows
one flat array and `activeIndex` plain arithmetic. `docs/components.md` records the
rule; the two component files record the argument.

## Filling a hole

`useHoleCandidates` answers "which ids could go here", from the cheapest source
that has one:

1. **The tab you have open.** Zero requests. Detected in `App`, passed to the
   Explorer as `tabEntity` — the Explorer does not re-detect the page.
2. **The org snapshot.** Zero requests. Groups, rules and apps only.
3. **A name search.** One request, debounced, past two characters. **Users live
   here and nowhere else** — they are deliberately not indexed, so a user hole
   always costs a call.

The **selection basket is deliberately not a source.** The basket gathers entities
to act on together; the Explorer is one request against one id. Wiring them
together would make each surface's contents a side effect of the other's.

An empty list means nothing was found. It is never a claim that the org has no such
group — a snapshot collection whose walk never finished still matches only what it
has (`docs/claims.md`).

## Validating what goes in a path

Two layers, and only one of them is a gate.

`oktaIdKind()` (`shared/utils/oktaId.ts`) is an **affirmation**: it says a value is
a recognised Okta id. It is the wrong gate here, because `me`, a login, and a policy
id are all legitimate path values it does not claim.

The gate is `shared/utils/apiPath.ts`, which asks about **harm** instead:

- `isSafePathSegment(value)` — refuses anything that could end the segment and
  start something else (`/ ? # % \`), whitespace, control characters, `.` and `..`,
  the empty string, and anything absurdly long.
- `substitutePathHoles(template, values)` — fills every hole, `encodeURIComponent`s
  each accepted value, and returns a **reason code** (`unfilled` / `unsafe`) naming
  the token that refused. An unfilled hole is an error, not an empty segment: a path
  with a hole silently removed addresses a different resource.
- `isNormalizedPath(endpoint)` — the path must survive a parse unchanged. This one
  runs in the **content script**, in front of every Okta call the extension makes,
  because the fetched URL is built by concatenation and `/api/v1/../admin/users` is
  same-origin. Only the path is normalised; `search` and `filter` expressions carry
  spaces and quotes that a round-trip over the query would reject. See
  `docs/security.md` § 5.

## The SAML pane

The Explorer has two panes. **Request** is everything above. **SAML** decodes a
`SAMLResponse` and says what it claims.

It reports; it does not diagnose. A signature is **present or absent, never
valid** — verifying one needs the IdP's certificate, which the panel does not
have — and a fact the assertion omits renders as absent, never as a guess
(`docs/claims.md`). Refusals are reason codes (`not-base64`, `not-saml`, …) with
the copy held in the component, so a sentence can be rewritten without moving a
gate.

A decoded assertion is a **bearer credential inside its validity window and PII
throughout**. It lives in component state and nowhere else: not `chrome.storage`,
not IndexedDB, not the logger, not the audit trail. Clearing the field drops it,
and so does leaving the tab.

### Two ways an assertion arrives

**Paste** is the ordinary route: the base64 field copied out of the network tab.
Decoding is pure and local (`sidepanel/saml/decodeSaml.ts`) — a real XML parser,
bounded input, no entity resolution, every value rendered through React's
escaping.

**Fetch by app** picks an app from the org snapshot and follows its sign-on link.
Two requests of two different kinds (`useOktaApi/samlOperations.ts`):

1. `GET /api/v1/apps/{appId}` through `makeApiRequest`, like every other read, to
   find `_links.appLinks[].href`.
2. That link, through the `extractSamlResponse` content-script action.

The second one is not an API call, and that is why it needs its own action:
`makeApiRequest` parses a body only when the content type is JSON, and a sign-on
link answers with an HTML form. Rather than loosen that for everyone,
`content/samlRequest.ts` fetches the page and returns **only the base64 token**.
The HTML never crosses the message boundary. It goes through the same same-origin
and normalisation guards as every other fetch there, and it stays off the
scheduler deliberately: the scheduler manages Okta's `/api/v1` rate-limit buckets,
and this is a page load — user-initiated, one at a time, never looped or batched.

Only a **path** is ever messaged. Okta returns an absolute URL and
`ssoPathFrom()` strips it to `pathname + search`, refusing any link that is not an
absolute `http(s)` URL on the org's own origin — `_links` is an Okta response, and
every Okta response is untrusted. A message that could name an origin would be a
message that could redirect an authenticated fetch.

### Fetching is a write-shaped act

Following an app's sign-on link **signs in to that app** as whoever holds the
session. Okta mints a real assertion and records an app sign-on in the org's
System Log. The UI states that above the picker — before the control that causes
it, not in a toast afterwards — and a second press is refused while one is in
flight, because each press is a real sign-on.
