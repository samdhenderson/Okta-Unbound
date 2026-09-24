import{j as e}from"./iframe-mmN7AxbW.js";import{u as o,M as s,c as r}from"./blocks-6hb-cuWT.js";import"./preload-helper-PPVm8Dsz.js";const i=`# 0009 — A password change is recorded, and cannot be undone

Status: Accepted — 2026-09-16

## Context

Every mutating operation in this app records an audit entry, and
\`docs/features-plan.md\` states the rule the entries are built to serve:

> **Every mutation audits, and every destructive mutation confirms.** Capture
> prior state.

Prior state is what makes the audit trail more than a diary. A profile write
stores each attribute's previous value, so \`useUndoAction\` can offer a restore
that actually restores. Where a restore is not on offer, the reason has so far
always been a fact about **reversal**: re-adding a user to a group records a
direct membership they may not have held that way, reactivating a rule
re-evaluates it against the whole org. Those are judgements about whether
putting something back is the same as never having removed it.

Setting a password is the first write where the question does not arise, because
the material to answer it does not exist. Okta does not return a password — not
in the user object, not on the write response, not anywhere. There is no API
call, no cost, and no permission level at which the previous value becomes
readable. \`oktaUserSchema\` goes further and strips \`credentials\` at the boundary
on purpose, so even the shape of it does not enter the panel.

So the app acquires a write that is auditable and permanently unreversible, and
the audit trail's promise quietly changes for one row from _we can put this back_
to _we can tell you it happened_. That change is worth writing down, because the
next person to add a write will look at what the history does and infer the rule
from it.

Three shapes were considered and rejected:

- **Refuse the feature.** The break-glass case is real: an admin account whose
  mail routes through the thing that is broken, a service account with no
  mailbox, a person standing next to you. A reset email cannot answer it, and
  the alternative is an admin keeping a second tool open to do the same write
  with less scrutiny.
- **Capture "something" so the row looks like the others** — a hash, a length, a
  timestamp of the previous change. A hash and a length are both leaks that
  restore nothing, and a row that looks restorable and is not is worse than one
  that says plainly that it is not.
- **Record nothing, on the grounds that an entry with no prior state is not an
  audit entry.** This is exactly backwards. _Who changed this account's password,
  and when_ is the question an incident actually asks, and it is answerable
  without the value.

## Decision

**A password change is recorded in full and refused an undo explicitly.**

1. **One \`ActionType\`, four modes.** \`CHANGE_USER_PASSWORD\` covers all four
   operations — the reset email, the direct set, the one-time set, and Okta's
   generated temporary value. \`ChangeUserPasswordMetadata.mode\` is a reason code,
   not a sentence, so the history row's prose can be reworded without moving
   anything that branches (\`docs/claims.md\`). The reset email is included even
   though it is not a password _write_, because the question the history answers
   is "what happened to this account's password", and splitting the answer across
   two vocabularies makes it unanswerable in one place.

2. **The refusal is declared, not inferred.** \`useUndoAction\`'s \`NOT_UNDOABLE\`
   table is a \`Record\` over \`Exclude<ActionType, …>\` precisely so a new action
   type breaks the build until someone writes down what undoing it would mean.
   \`CHANGE_USER_PASSWORD\`'s entry says what the others cannot: not that a
   reversal would be misleading, but that no previous value was captured and
   none can be.

3. **The entry never carries a value.** Not the password an admin typed, not the
   temporary one Okta generated, not a length or a prefix of either.
   \`logPasswordChangeAction\` takes no value argument at all, which is the real
   guarantee — \`chrome.storage.local\` is plaintext (\`docs/security.md\`).

4. **Recording can never change the outcome.** The write has already happened by
   the time the entry is composed. A history entry that cannot be saved is a
   bookkeeping failure, and reporting it as though the password change had failed
   would tell an admin the opposite of what is true about the account. The
   logging call is wrapped and its failure is logged, not surfaced.

5. **Two legs, two facts.** \`'set-and-expire'\` is a set followed by an expiry.
   When the second leg does not land, the metadata records \`expired: false\` and
   the result says so — the password is in force as a permanent one, which is a
   materially different end state from the one the admin asked for.

## Consequences

- The Audit tab shows a Password Changed row that names the person and the
  operation, with an Undo control that is present and refused with a reason —
  the same treatment seven other action types already get, so nothing new appears
  in the UI vocabulary.
- \`docs/action-bars.md\` now states the rule directly: a verb may ship without an
  undo when no prior state exists to capture, provided the refusal is declared in
  \`NOT_UNDOABLE\` and the confirm says the change cannot be undone.
- A future write with the same property — revoking a session, rotating a
  credential — has a precedent to follow rather than a decision to re-make.
- The panel's audit story is now two-tier, and honest about it: some entries can
  restore, and some can only testify. That distinction is visible to the reader
  rather than implied by an Undo button that happens not to work.

## Alternatives considered

**Put the four modes behind four verbs in the action strip.** Rejected on
\`docs/action-bars.md\`'s own grounds: the admin's question is one question, and
four buttons ask them to choose between operations before any of the consequences
are in front of them. The fork belongs inside the confirm, where each choice can
carry the sentence that distinguishes it.

**Make \`'set-and-expire'\` a single \`runOperation\`.** Rejected as ceremony. Two
sequential calls against one user is not a batch; wrapping them would buy a
progress bar nobody needs and obscure which leg failed.
`;function a(t){return e.jsxs(e.Fragment,{children:[`
`,e.jsx(s,{title:"Documentation/ADRs/0009 A Write With No Prior State"}),`
`,e.jsx(r,{children:i})]})}function u(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a()}export{u as default};
