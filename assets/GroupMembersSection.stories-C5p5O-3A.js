import{G as T}from"./GroupMembersSection-I-BkDn6A.js";import{b as A,s as S}from"./memberSourceIndex-DDCaAYM6.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./MemberExplorer-BKD7JD5I.js";import"./useMemberMfaScan-DUPqhcGw.js";import"./useOktaApi.mock-B7ApM7uM.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./selectionStore-CrmbAKHN.js";import"./useRungSelection-DArsUsD0.js";import"./useSelection-BI2UGOh3.js";import"./userDisplay-xpx41Abi.js";import"./MemberSearchBar-B_3eZ9Iv.js";import"./useMemberFilters-ep1-dWk0.js";import"./MemberFilterPanel-CeCEICON.js";import"./MfaScanButton-DLDb-bBw.js";import"./MemberSourceFilterBar-DdI6OYZB.js";import"./AttributeFilterList-DhovFxtk.js";import"./memberAnalytics-_apwJWix.js";import"./ActiveFilterChips-Zrsnhmaa.js";import"./CopyMembersModal-WM65Dbmm.js";import"./BreakdownDetailsModal-CuUXwlYR.js";import"./BreakdownReport-8ktuwLFZ.js";import"./MemberList-DkcHGPXY.js";import"./useStaggerReveal-CSztixYY.js";import"./MemberRow-D1-4_GbG.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";import"./MembershipRuleEvidence-6HIgEdU2.js";import"./ruleExpression-YtJDU2CF.js";import"./GroupMembershipsListProof-Bws-X1xf.js";import"./sourceLine-6HOHdWfm.js";import"./membershipAnalysis-BZfvnwXl.js";import"./provenance-C1K7H2p2.js";import"./membershipVerdict-DUrEZuW9.js";import"./useDebouncedValue-DavO1uKb.js";import"./memberSourceBuckets-DVHQYQgQ.js";import"./chartPalette-Byit8206.js";import"./MemberSourceNotes-CaVMVWG0.js";import"./RuleLinkRow-BPHokEim.js";import"./memberRuleAttribution-DwskNnmH.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:y,fn:o,userEvent:w,within:E}=__STORYBOOK_MODULE_TEST__,e=(a,r,t,b)=>({id:a,status:"ACTIVE",profile:{login:`${r.toLowerCase()}@example.com`,email:`${r.toLowerCase()}@example.com`,firstName:r,lastName:t,...b?{department:b}:{}}}),g=[e("00uFAKE1","Ada","Lovelace"),e("00uFAKE2","Grace","Hopper"),e("00uFAKE3","Katherine","Johnson")],v={id:"00gFAKE1",name:"Engineering",type:"OKTA_GROUP"},f=[{id:"0prFAKE1",name:"Engineering department",status:"ACTIVE",conditionExpression:'user.department == "Engineering"',actions:{assignUserToGroups:{groupIds:["00gFAKE1"]}}},{id:"0prFAKE2",name:"Platform department",status:"ACTIVE",conditionExpression:'user.department == "Platform"',actions:{assignUserToGroups:{groupIds:["00gFAKE1"]}}}],h=[e("00uFAKE1","Ada","Lovelace","Engineering"),e("00uFAKE2","Grace","Hopper","Engineering"),e("00uFAKE3","Katherine","Johnson","Engineering"),e("00uFAKE4","Annie","Easley","Platform"),e("00uFAKE5","Mary","Jackson","Support"),e("00uFAKE6","Dorothy","Vaughan")],R=S(v,h,f),x=A(v,h,f),be={title:"Groups/GroupMembersSection",component:T,tags:["autodocs"],parameters:{a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:'The Group Detail view\'s roster: who is in the group, why, and — per row — a confirm-gated remove. Before the shared member analysis has run it shows a gated prompt, never an empty list: an empty list would read as "this group has no members," a different fact.\n\nThe roster itself is `MemberExplorer`. What stays here is the part the explorer must not learn: the `SourceStatus` gate, the read-only reason for an `APP_GROUP`/`BUILT_IN` group, and the remove confirmation. Pass `breakdown` **and** `memberSourceIndex` to get the membership-source meter whose segments double as filters.'}}},argTypes:{groupType:{description:"Determines whether the per-row remove control renders at all."},memberCount:{description:"The group's member count, used for the pre-load cost estimate."},members:{description:"The roster, once the shared member analysis has populated it."},status:{description:"Status of the shared member-source analysis ('idle'/'loading'/'done'/'error')."}},args:{groupType:"OKTA_GROUP",memberCount:3,members:null,status:"idle",error:null,onAnalyze:o(),canAnalyze:!0,breakdown:null,memberSourceIndex:null,mfaResults:null,scanStatus:"idle",onRunScan:o(),onRequestConfirm:o(),onCancelConfirm:o(),removeTarget:null,onRequestRemove:o(),onCancelRemove:o(),onConfirmRemove:o(),removeStatus:"idle",removeError:null}},s={play:async({args:a,canvasElement:r})=>{const t=E(r);await w.click(t.getByRole("button",{name:"Load members"})),await y(a.onAnalyze).toHaveBeenCalledTimes(1)}},n={args:{status:"loading"}},i={args:{status:"error",error:"Members could not be read."}},m={args:{memberCount:0}},p={args:{status:"done",members:g}},c={args:{status:"done",members:g,removeTarget:g[0]},play:async({args:a,canvasElement:r})=>{const t=E(r.ownerDocument.body);await y(await t.findByRole("dialog")).toBeInTheDocument(),await w.click(t.getByRole("button",{name:"Cancel"})),await y(a.onCancelRemove).toHaveBeenCalledTimes(1)}},d={args:{groupType:"APP_GROUP",status:"done",members:g}},u={args:{groupType:"BUILT_IN",status:"done",members:g}},l={args:{status:"done",members:h,memberCount:h.length,breakdown:R,memberSourceIndex:x}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source},description:{story:"Not loaded yet: the gate states what loading costs. `GroupDetailView` auto-loads any\ngroup at or under 1,000 members, so `idle` only persists for a larger group or a\ndisconnected Okta tab.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'loading'
  }
}`,...n.parameters?.docs?.source},description:{story:"Loading the roster (or waiting on the shared analysis).",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'error',
    error: 'Members could not be read.'
  }
}`,...i.parameters?.docs?.source},description:{story:"The underlying member-source read failed; offers a retry.",...i.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    memberCount: 0
  }
}`,...m.parameters?.docs?.source},description:{story:"An empty group: nothing to add or remove, and no gate on offer.",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'done',
    members
  }
}`,...p.parameters?.docs?.source},description:{story:"Loaded: the roster with per-member remove.",...p.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:"A remove is armed: the confirm modal is open, and cancelling is the way back.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    groupType: 'APP_GROUP',
    status: 'done',
    members
  }
}`,...d.parameters?.docs?.source},description:{story:"An app-imported group: read-only, with the one-line reason why.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    groupType: 'BUILT_IN',
    status: 'done',
    members
  }
}`,...u.parameters?.docs?.source},description:{story:"A built-in Okta group (e.g. Everyone): read-only, with the one-line reason why.",...u.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'done',
    members: mixedMembers,
    memberCount: mixedMembers.length,
    breakdown: mixedBreakdown,
    memberSourceIndex: mixedIndex
  }
}`,...l.parameters?.docs?.source},description:{story:`The membership-source meter, with the same split offered as filters. Three members
match the Engineering rule, one matches Platform, and two match nothing. The bar is
never the click target — the pills beside it are.`,...l.parameters?.docs?.description}}};const we=["Default","Loading","ErrorState","Empty","Loaded","RemoveConfirm","AppGroupReadOnly","BuiltInReadOnly","WithSourceMeter"];export{d as AppGroupReadOnly,u as BuiltInReadOnly,s as Default,m as Empty,i as ErrorState,p as Loaded,n as Loading,c as RemoveConfirm,l as WithSourceMeter,we as __namedExportsOrder,be as default};
