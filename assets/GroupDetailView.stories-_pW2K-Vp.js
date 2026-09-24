import{G as v}from"./GroupDetailView-CMeW8DrO.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./GroupOverviewPane-B_Tg-Xnx.js";import"./GroupMembersSection-I-BkDn6A.js";import"./MemberExplorer-BKD7JD5I.js";import"./useMemberMfaScan-DUPqhcGw.js";import"./useOktaApi.mock-B7ApM7uM.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./selectionStore-CrmbAKHN.js";import"./useRungSelection-DArsUsD0.js";import"./useSelection-BI2UGOh3.js";import"./userDisplay-xpx41Abi.js";import"./MemberSearchBar-B_3eZ9Iv.js";import"./useMemberFilters-ep1-dWk0.js";import"./MemberFilterPanel-CeCEICON.js";import"./MfaScanButton-DLDb-bBw.js";import"./MemberSourceFilterBar-DdI6OYZB.js";import"./AttributeFilterList-DhovFxtk.js";import"./memberAnalytics-_apwJWix.js";import"./ActiveFilterChips-Zrsnhmaa.js";import"./CopyMembersModal-WM65Dbmm.js";import"./BreakdownDetailsModal-CuUXwlYR.js";import"./BreakdownReport-8ktuwLFZ.js";import"./MemberList-DkcHGPXY.js";import"./useStaggerReveal-CSztixYY.js";import"./MemberRow-D1-4_GbG.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";import"./MembershipRuleEvidence-6HIgEdU2.js";import"./ruleExpression-YtJDU2CF.js";import"./GroupMembershipsListProof-Bws-X1xf.js";import"./sourceLine-6HOHdWfm.js";import"./membershipAnalysis-BZfvnwXl.js";import"./provenance-C1K7H2p2.js";import"./membershipVerdict-DUrEZuW9.js";import"./useDebouncedValue-DavO1uKb.js";import"./memberSourceBuckets-DVHQYQgQ.js";import"./chartPalette-Byit8206.js";import"./MemberSourceNotes-CaVMVWG0.js";import"./RuleLinkRow-BPHokEim.js";import"./GroupAccessSection-DKSV4VyY.js";import"./GroupAppRow-f8gyNTFC.js";import"./dateFormat-C9yVDsck.js";import"./groupAppSource-CTFKsLFt.js";import"./appFilters-CTS9Q_fJ.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";import"./GroupRulesSection-DfA5lG3D.js";import"./RuleCard-C3IkE9DY.js";import"./ruleUtils-Vt2BA8lQ.js";import"./GroupPushSection-zp5uMgAL.js";import"./GroupInsightsPane-B2DJfGbf.js";import"./GroupMetadataSection-D9m6YoX5.js";import"./AttributeSpreadSection-B_djK0rR.js";import"./AttributeHealthCard-Dq_LhHQP.js";import"./AttributeSpreadBar-QNQoFo_X.js";import"./GroupMfaCoverageSection-B5Vy0FpQ.js";import"./mfaSpread-BX5KQvwL.js";import"./VerbRunner-CK-T3KUd.js";import"./types-CedNKx8Z.js";import"./csvUtils-DgNWYp8m.js";import"./profile-Bul2VYbY.js";import"./undoManager-Db5dJWVO.js";import"./profileDraft-qVcYAhdY.js";import"./groupContext-D0LcfWax.js";import"./profileAttributes-D7zGcuAf.js";import"./profileFields-BZvCtc6D.js";import"./useVerbRun-BFNt5FEp.js";import"./GroupActionBar-DkXV5tMw.js";import"./GroupUserCheckSection-VdiqvWze.js";import"./GroupUserReport-Dksj59Lj.js";import"./RuleUserReport-Dw4FGkEi.js";import"./MissingGroupChip-BPaj6mVy.js";import"./QualificationSubjectStatus-C8GNQ5uy.js";import"./UserPickerModal-Bowp8-d3.js";import"./qualification-cO_gjK9U.js";import"./ruleAssessment-CTkD-VAM.js";import"./useUserPicker-tI0it3Ef.js";import"./useDebouncedUserSearch-BiN1eoTU.js";import"./oktaPagination-DzUnd2oi.js";import"./AddGroupMemberModal-CWUdiIEH.js";import"./CompareGroupModal-G5gK1FR8.js";import"./CreateFeedingRuleModal-BWZ7mWt-.js";import"./GroupComparisonModal-CbWTZjD9.js";import"./memberSourceIndex-DDCaAYM6.js";import"./memberRuleAttribution-DwskNnmH.js";import"./memberSourceCache-C1Bgnwa1.js";import"./useOwedLoad-DMyi27pQ.js";import"./groupRuleIndex-CUdSMoPG.js";import"./useGroupNameResolver-jqqq-jTv.js";import"./fetchGroupRulesRequest-DgNCr2VU.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleOrphans-w7zgihHR.js";import"./groupSummary-DeRt4Uax.js";import"./consolidation-JtCo9PAQ.js";import"./useWorkingSetEntry-BgCc6f1u.js";import"./workingSetStore-CgXQHluq.js";import"./useRefreshSubject-CLFXuOV-.js";const{expect:d,fn:u,userEvent:b,within:y}=__STORYBOOK_MODULE_TEST__,g={id:"00gFAKEGROUP0001",name:"Engineering — All",description:"Everyone in the Engineering org, fed by the department rule.",type:"OKTA_GROUP",memberCount:412,hasRules:!0,ruleCount:1,created:new Date("2024-01-15T09:00:00Z"),lastUpdated:new Date("2026-06-01T14:30:00Z")},w={...g,id:"00gFAKEGROUP0002",name:"Platform Leads",memberCount:6,hasRules:!1,ruleCount:0},gt={title:"Groups/GroupDetailView",component:v,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:"The container half of the Group Detail rung: five panes behind one `Tabs` strip — Overview, Members, Access, Rules and Insights — none gated behind another, with `activeTab` as page-local state rather than sub-navigation.\n\nIt owns the read-only loads and hands their state to pure sections. `initialPane` only chooses where a caller lands; nothing costly runs unasked, and the Insights pane leaves its per-member MFA scan armed and un-run."}}},argTypes:{group:{description:"The group to explain; changing its identity re-opens the loads."},targetTabId:{description:"Connected Okta tab id; reads are disabled when null."},oktaOrigin:{description:'Org origin behind every "View in Okta" affordance.'},onNavigateToRule:{description:"Deep-links a rule in the Rules tab."},initialPane:{description:"Which pane the caller asked to land on."},isActive:{description:"Whether the Groups tab is the visible one; hidden defers the loads."},onExportGroup:{description:"Opens the Export tab scoped to this group; omitting it omits the action."}},args:{group:g,targetTabId:42,oktaOrigin:"https://example.okta.com",onNavigateToRule:u(),onExportGroup:u(),isActive:!0}},e={},t={args:{initialPane:"members"}},r={args:{initialPane:"access"}},a={args:{initialPane:"rules"}},o={args:{initialPane:"insights"}},i={args:{group:w}},s={args:{targetTabId:null}},n={args:{onExportGroup:void 0}},p={args:{isActive:!1}},c={play:async({canvasElement:h})=>{const m=y(h),l=m.getByRole("tab",{name:"Overview"});await d(l).toHaveAttribute("aria-selected","true"),await b.click(m.getByRole("tab",{name:"Access"})),await d(m.getByRole("tab",{name:"Access"})).toHaveAttribute("aria-selected","true"),await d(l).toHaveAttribute("aria-selected","false")}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source},description:{story:"A plain drill-in: the Overview pane, with the other four one tap away.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    initialPane: 'members'
  }
}`,...t.parameters?.docs?.source},description:{story:"Landed on Members — the one pane a caller can ask for that also runs its analysis.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    initialPane: 'access'
  }
}`,...r.parameters?.docs?.source},description:{story:"Landed on Access: what membership grants, plus app push.",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    initialPane: 'rules'
  }
}`,...a.parameters?.docs?.source},description:{story:"Landed on Rules: the two rule relationships, listed apart.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    initialPane: 'insights'
  }
}`,...o.parameters?.docs?.source},description:{story:"Landed on Insights, whose MFA scan stays armed and un-run until asked.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    group: smallGroup
  }
}`,...i.parameters?.docs?.source},description:{story:"A small group, where the roster is inside the auto-load budget.",...i.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null
  }
}`,...s.parameters?.docs?.source},description:{story:"No Okta tab connected: every read is disabled rather than failing quietly.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    onExportGroup: undefined
  }
}`,...n.parameters?.docs?.source},description:{story:"No export wired by the host, so the action is omitted rather than shipped disabled.",...n.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    isActive: false
  }
}`,...p.parameters?.docs?.source},description:{story:"Another top-level tab is on screen: the rung stays mounted and defers its loads.",...p.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', {
      name: 'Overview'
    });
    await expect(overview).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', {
      name: 'Access'
    }));
    await expect(canvas.getByRole('tab', {
      name: 'Access'
    })).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('aria-selected', 'false');
  }
}`,...c.parameters?.docs?.source},description:{story:`The pane strip driven the way a reader drives it: selecting Access moves the
body without leaving the rung.`,...c.parameters?.docs?.description}}};const ht=["Default","MembersPane","AccessPane","RulesPane","InsightsPane","SmallGroup","Disconnected","WithoutExport","Inactive","SwitchingPanes"];export{r as AccessPane,e as Default,s as Disconnected,p as Inactive,o as InsightsPane,t as MembersPane,a as RulesPane,i as SmallGroup,c as SwitchingPanes,n as WithoutExport,ht as __namedExportsOrder,gt as default};
