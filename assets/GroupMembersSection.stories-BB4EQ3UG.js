import{G as S}from"./GroupMembersSection-BKpsYSzP.js";import{b as B,s as x}from"./memberSourceIndex-CkwB4-85.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./MemberExplorer-D48Y8X7H.js";import"./useMemberMfaScan-DDIteC8-.js";import"./useOktaApi.mock-CyMgmY7X.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./selectionStore-CJ3uIvus.js";import"./useRungSelection-BGSFmNn2.js";import"./useSelection-DhS6cLGA.js";import"./userDisplay-xpx41Abi.js";import"./MemberSearchBar-DCBROPEN.js";import"./useMemberFilters-CH4ZffMy.js";import"./MemberFilterPanel-DVDBhlv1.js";import"./MfaScanButton-BbYeplt_.js";import"./MemberSourceFilterBar-B0QlPjZd.js";import"./AttributeFilterList-D7pEIXlN.js";import"./memberAnalytics-tPH-giHi.js";import"./ActiveFilterChips-D94GmeWq.js";import"./CopyMembersModal-ByyW8k39.js";import"./BreakdownDetailsModal-DQqzWMBw.js";import"./BreakdownReport-DLC4-fAg.js";import"./MemberList-CIeZUsdj.js";import"./useStaggerReveal-B8AfVumu.js";import"./MemberRow-B55ZfjcI.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";import"./MembershipRuleEvidence-CHHoN_E7.js";import"./ruleExpression-YtJDU2CF.js";import"./GroupMembershipsListProof-TM5UMh63.js";import"./sourceLine-BFeciPo3.js";import"./membershipAnalysis-PgI-DSyi.js";import"./provenance-C1K7H2p2.js";import"./membershipVerdict-n2BbpwtB.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./memberSourceBuckets-DVHQYQgQ.js";import"./chartPalette-Byit8206.js";import"./MemberSourceNotes-DBVhIfyN.js";import"./RuleLinkRow-kfGlECBs.js";import"./memberRuleAttribution-CYi3LQ2b.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";const{expect:a,fn:o,userEvent:T,within:w}=__STORYBOOK_MODULE_TEST__,t=(r,e,s,f)=>({id:r,status:"ACTIVE",profile:{login:`${e.toLowerCase()}@example.com`,email:`${e.toLowerCase()}@example.com`,firstName:e,lastName:s,...f?{department:f}:{}}}),n=[t("00uFAKE1","Ada","Lovelace"),t("00uFAKE2","Grace","Hopper"),t("00uFAKE3","Katherine","Johnson")],E={id:"00gFAKE1",name:"Engineering",type:"OKTA_GROUP"},A=[{id:"0prFAKE1",name:"Engineering department",status:"ACTIVE",conditionExpression:'user.department == "Engineering"',actions:{assignUserToGroups:{groupIds:["00gFAKE1"]}}},{id:"0prFAKE2",name:"Platform department",status:"ACTIVE",conditionExpression:'user.department == "Platform"',actions:{assignUserToGroups:{groupIds:["00gFAKE1"]}}}],v=[t("00uFAKE1","Ada","Lovelace","Engineering"),t("00uFAKE2","Grace","Hopper","Engineering"),t("00uFAKE3","Katherine","Johnson","Engineering"),t("00uFAKE4","Annie","Easley","Platform"),t("00uFAKE5","Mary","Jackson","Support"),t("00uFAKE6","Dorothy","Vaughan")],R=x(E,v,A),C=B(E,v,A),we={title:"Groups/GroupMembersSection",component:S,tags:["autodocs"],parameters:{a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:'The Group Detail view\'s roster: who is in the group, why, and — per row — a confirm-gated remove. Before the shared member analysis has run it shows a gated prompt, never an empty list: an empty list would read as "this group has no members," a different fact.\n\nThe roster itself is `MemberExplorer`. What stays here is the part the explorer must not learn: the `SourceStatus` gate, the read-only reason for an `APP_GROUP`/`BUILT_IN` group, and the remove confirmation. Pass `breakdown` **and** `memberSourceIndex` to get the membership-source meter whose segments double as filters.'}}},argTypes:{groupType:{description:"Determines whether the per-row remove control renders at all."},memberCount:{description:"The group's member count, used for the pre-load cost estimate."},members:{description:"The roster, once the shared member analysis has populated it."},status:{description:"Status of the shared member-source analysis ('idle'/'loading'/'done'/'error')."}},args:{groupType:"OKTA_GROUP",memberCount:3,members:null,status:"idle",error:null,onAnalyze:o(),canAnalyze:!0,breakdown:null,memberSourceIndex:null,mfaResults:null,scanStatus:"idle",onRunScan:o(),onRequestConfirm:o(),onCancelConfirm:o(),removeTarget:null,onRequestRemove:o(),onCancelRemove:o(),onConfirmRemove:o(),removeStatus:"idle",removeError:null}},i={play:async({args:r,canvasElement:e})=>{const s=w(e);await T.click(s.getByRole("button",{name:"Load members"})),await a(r.onAnalyze).toHaveBeenCalledTimes(1)}},m={args:{status:"loading"}},c={args:{status:"loading",memberCount:450,provisional:{kind:"streaming",members:n}},play:async({canvasElement:r})=>{const e=w(r);await a(e.getByText(/loaded 3 of 450/)).toBeInTheDocument(),await a(e.queryByRole("button",{name:/remove/i})).not.toBeInTheDocument()}},p={args:{status:"loading",provisional:{kind:"stale",members:n,readAt:Date.UTC(2026,0,5,15,42)}},play:async({canvasElement:r})=>{const e=w(r);await a(e.getByText(/as read at .*, refreshing/)).toHaveAttribute("aria-live","polite"),await a(e.queryByRole("button",{name:/remove/i})).not.toBeInTheDocument()}},d={args:{status:"error",error:"Members could not be read."}},l={args:{memberCount:0}},u={args:{status:"done",members:n}},g={args:{status:"done",members:n,removeTarget:n[0]},play:async({args:r,canvasElement:e})=>{const s=w(e.ownerDocument.body);await a(await s.findByRole("dialog")).toBeInTheDocument(),await T.click(s.getByRole("button",{name:"Cancel"})),await a(r.onCancelRemove).toHaveBeenCalledTimes(1)}},h={args:{groupType:"APP_GROUP",status:"done",members:n}},y={args:{groupType:"BUILT_IN",status:"done",members:n}},b={args:{status:"done",members:v,memberCount:v.length,breakdown:R,memberSourceIndex:C}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Load members'
    }));
    await expect(args.onAnalyze).toHaveBeenCalledTimes(1);
  }
}`,...i.parameters?.docs?.source},description:{story:"Not loaded yet: the gate states what loading costs. `GroupDetailView` auto-loads any\ngroup at or under 1,000 members, so `idle` only persists for a larger group or a\ndisconnected Okta tab.",...i.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'loading'
  }
}`,...m.parameters?.docs?.source},description:{story:"Loading the roster (or waiting on the shared analysis).",...m.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'loading',
    memberCount: 450,
    provisional: {
      kind: 'streaming',
      members
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/loaded 3 of 450/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: /remove/i
    })).not.toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:`The walk's first page has landed and the rest are still loading: those rows
paint at once, as a plain list with no remove control, and the count row says
how many of the group's members have loaded. No source meter and no facets —
those wait for the whole roster.`,...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'loading',
    provisional: {
      kind: 'stale',
      members,
      readAt: Date.UTC(2026, 0, 5, 15, 42)
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/as read at .*, refreshing/)).toHaveAttribute('aria-live', 'polite');
    await expect(canvas.queryByRole('button', {
      name: /remove/i
    })).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:`A revisit whose roster has passed its TTL: that roster paints at once — no
skeleton — and its count row says when it was read and that it is refreshing.
No meter, facets or remove until the fresh walk lands.`,...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'error',
    error: 'Members could not be read.'
  }
}`,...d.parameters?.docs?.source},description:{story:"The underlying member-source read failed; offers a retry.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    memberCount: 0
  }
}`,...l.parameters?.docs?.source},description:{story:"An empty group: nothing to add or remove, and no gate on offer.",...l.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'done',
    members
  }
}`,...u.parameters?.docs?.source},description:{story:"Loaded: the roster with per-member remove.",...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'done',
    members,
    removeTarget: members[0]
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByRole('dialog')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(args.onCancelRemove).toHaveBeenCalledTimes(1);
  }
}`,...g.parameters?.docs?.source},description:{story:"A remove is armed: the confirm modal is open, and cancelling is the way back.",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    groupType: 'APP_GROUP',
    status: 'done',
    members
  }
}`,...h.parameters?.docs?.source},description:{story:"An app-imported group: read-only, with the one-line reason why.",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    groupType: 'BUILT_IN',
    status: 'done',
    members
  }
}`,...y.parameters?.docs?.source},description:{story:"A built-in Okta group (e.g. Everyone): read-only, with the one-line reason why.",...y.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'done',
    members: mixedMembers,
    memberCount: mixedMembers.length,
    breakdown: mixedBreakdown,
    memberSourceIndex: mixedIndex
  }
}`,...b.parameters?.docs?.source},description:{story:`The membership-source meter, with the same split offered as filters. Three members
match the Engineering rule, one matches Platform, and two match nothing. The bar is
never the click target — the pills beside it are.`,...b.parameters?.docs?.description}}};const fe=["Default","Loading","Streaming","RefreshingStale","ErrorState","Empty","Loaded","RemoveConfirm","AppGroupReadOnly","BuiltInReadOnly","WithSourceMeter"];export{h as AppGroupReadOnly,y as BuiltInReadOnly,i as Default,l as Empty,d as ErrorState,u as Loaded,m as Loading,p as RefreshingStale,g as RemoveConfirm,c as Streaming,b as WithSourceMeter,fe as __namedExportsOrder,we as default};
