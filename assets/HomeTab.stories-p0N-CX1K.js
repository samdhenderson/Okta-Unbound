import{j as I,V as H,a3 as O,a4 as R,a5 as N,W as _}from"./iframe-mmN7AxbW.js";import{H as F}from"./HomeTab-CKr6Slwz.js";import{O as W}from"./OrgEntityIndexContext-DK-zeuDH.js";import{u as q,m as K}from"./useOktaApi.mock-B7ApM7uM.js";import{o as c}from"./orgSnapshotStore-CqR6Bu-g.js";import{W as L}from"./workingSetStore-CgXQHluq.js";import"./preload-helper-PPVm8Dsz.js";import"./JumpBar-iQ5L7rJM.js";import"./JumpResultRow-DbMKZd7j.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./WorkingSet-fss6F8mJ.js";import"./WorkingSetRow-BIARlDpF.js";import"./dateFormat-C9yVDsck.js";import"./OrgSnapshotCard-DpYaYYPJ.js";import"./ReportsCard-B-NiNAM-.js";import"./EntityChooser-Du1Aqvt_.js";import"./FigureNumber-L-zgAkk2.js";import"./MfaCoverageLauncher-BQGg_dgJ.js";import"./ReportRow-oZ49qSL0.js";import"./homeReports-DENgM1_q.js";import"./orgFigures-Z-hvuRoQ.js";import"./GuideLinkRow-Dd4iUFjj.js";import"./githubLinks-BfCtNl-2.js";import"./useWorkingSet-BrB7VJIe.js";import"./groupRuleIndex-CUdSMoPG.js";import"./ruleOrphans-w7zgihHR.js";import"./types-aoYpQiYS.js";import"./useDebouncedValue-DavO1uKb.js";import"./useEntitySearchSources-C0IDcNC-.js";import"./usePoliciesData-oY6cZYph.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./policyFilters-0Alm462X.js";import"./useStaggerReveal-CSztixYY.js";import"./useOrgSnapshot-BR7he6Mh.js";import"./ruleUtils-Vt2BA8lQ.js";import"./index-Dob3nYDb.js";const{expect:t,fn:o,userEvent:p,waitFor:x,within:i}=__STORYBOOK_MODULE_TEST__,s="https://example.okta.com",E="00gFAKE0000000000001",b="00uFAKE0000000000001",S=[{id:E,type:"OKTA_GROUP",profile:{name:"Engineering",description:"All engineers"}},{id:"00gFAKE0000000000002",type:"OKTA_GROUP",profile:{name:"Engineering — On-call"}}],D=[{id:"0prFAKE0000000000001",name:"Eng — All ICs",status:"INACTIVE",type:"group_rule",created:"2026-01-04T09:00:00.000Z",lastUpdated:"2026-05-11T09:00:00.000Z"}],k=[{id:"0oaFAKE0000000000001",name:"salesforce",label:"Salesforce",status:"ACTIVE"}];async function C({complete:e=!0}={}){await c.clearOrigin(s),await c.upsertMany("groups",s,S.map(a=>({id:a.id,entity:a})),Date.now()),await c.upsertMany("rules",s,D.map(a=>({id:a.id,entity:a})),Date.now()),await c.patchMeta("groups",s,{complete:e,lastFullWalkAt:e?Date.now():null,itemCount:S.length}),await c.upsertMany("apps",s,k.map(a=>({id:a.id,entity:a})),Date.now()),await c.patchMeta("rules",s,{complete:e,lastFullWalkAt:e?Date.now():null,itemCount:D.length}),await c.patchMeta("apps",s,{complete:!0,lastFullWalkAt:Date.now(),itemCount:k.length})}function G(){return{searchGroups:o(async e=>e.toLowerCase().startsWith("eng")?[{id:E,name:"Engineering",description:"All engineers"}]:[]).mockName("searchGroups"),searchUsers:o(async()=>[{id:b,firstName:"Ada",lastName:"Lovelace",login:"ada@example.com",email:"ada@example.com"}]).mockName("searchUsers"),getGroupById:o(async e=>({id:e,name:"Engineering",description:"All engineers"})).mockName("getGroupById"),getUserById:o(async e=>({id:e,firstName:"Ada",lastName:"Lovelace",login:"ada@example.com",email:"ada@example.com"})).mockName("getUserById")}}let n=G(),A=0;const r=e=>i(e).getByLabelText("Search groups, apps, users, rules"),be={title:"Home/HomeTab",component:F,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:'The side panel’s first tab. The reader says what they want, and every fact either arrives free, arrives in one list request, or is a button. Home has no `PageHeader` — one could only say "Home" — so the jump bar is the first thing in the scroller.\n\nThe stories below are about that cost rule, which is the part a screenshot cannot show: each asserts the number of Okta requests its interaction spends. An id already in the local org snapshot resolves at zero, a user id costs one because user records are deliberately kept out of local storage, and an incomplete snapshot spends one rather than reporting an absence it cannot support.'}}},decorators:[(e,{args:a})=>I.jsx(R,{handlers:{group:o(),user:o()},children:I.jsx(W,{oktaOrigin:a.oktaOrigin??null,targetTabId:a.targetTabId,enabled:a.isActive,children:I.jsx(e,{})})})],argTypes:{isActive:{description:"Whether Home is the tab on screen. A hidden Home issues no traffic."},targetTabId:{description:"Chrome tab id of the connected Okta tab."},oktaOrigin:{description:"Okta org origin — scopes the snapshot and builds deep links."}},args:{isActive:!0,targetTabId:1,oktaOrigin:s,onOpenListView:o(),onOpenTab:o(),onScanGroupMfa:o()},beforeEach:async()=>{H(),O(),n=G(),q.mockReturnValue(K(n)),await C()}},d={play:async({canvasElement:e})=>{await t(r(e)).toHaveValue(""),await t(r(e)).toHaveAttribute("placeholder","Search groups, apps, users, rules, etc.")}},l={play:async({canvasElement:e})=>{const a=i(e);await p.type(r(e),`${E}{Enter}`),await t(await a.findByText("Engineering")).toBeInTheDocument(),await t(a.getByText(/no request/)).toBeInTheDocument(),await t(n.getGroupById).not.toHaveBeenCalled()}},m={play:async({canvasElement:e})=>{const a=i(e);await p.type(r(e),`${b}{Enter}`),await t(await a.findByText("Ada Lovelace")).toBeInTheDocument(),await t(a.getByText(/1 request/)).toBeInTheDocument(),await t(n.getUserById).toHaveBeenCalledTimes(1)}},u={play:async({canvasElement:e})=>{const a=i(e);await p.type(r(e),"00gFAKE0000000000009{Enter}"),await t(await a.findByText("Nothing matched")).toBeInTheDocument(),await t(n.getGroupById).not.toHaveBeenCalled()}},h={beforeEach:async()=>{await C({complete:!1})},play:async({canvasElement:e})=>{await p.type(r(e),"00gFAKE0000000000009{Enter}"),await x(()=>t(n.getGroupById).toHaveBeenCalledTimes(1))}},y={play:async({canvasElement:e})=>{const a=i(e);await p.type(r(e),"eng"),await t(await a.findByText("Engineering")).toBeInTheDocument(),await t(await a.findByText("Ada Lovelace")).toBeInTheDocument(),await t(n.searchGroups).not.toHaveBeenCalledWith("e"),await t(n.searchGroups).not.toHaveBeenCalledWith("en")}},g={play:async({canvasElement:e})=>{await p.type(r(e),E),await t(n.searchGroups).not.toHaveBeenCalled(),await t(n.getGroupById).not.toHaveBeenCalled()}},w={args:{isActive:!1},play:async({canvasElement:e})=>{await p.type(r(e),"eng"),await t(n.searchGroups).not.toHaveBeenCalled()}},v={beforeEach:async()=>{N({[L]:{version:1,origins:{[s]:{pinned:[{kind:"group",id:E,name:"Engineering",lastPane:"Members",lastSeenAt:Date.now()}],recent:[{kind:"user",id:b,name:"Ada Lovelace",lastPane:"Profile",lastSeenAt:Date.now()-864e5}]}}}})},play:async({canvasElement:e})=>{const a=i(e);await t(await a.findByText("Engineering")).toBeInTheDocument(),await t(await a.findByText("Ada Lovelace")).toBeInTheDocument(),await t(n.getGroupById).not.toHaveBeenCalled(),await t(n.getUserById).not.toHaveBeenCalled()}},f={play:async({canvasElement:e})=>{await t(await i(e).findByText(/Nothing pinned yet/)).toBeInTheDocument()}},B={beforeEach:async()=>{_(async()=>(A+=1,{success:!0})),A=0},play:async({canvasElement:e})=>{const a=i(e);await t(await a.findByRole("button",{name:"Groups with no members that no rule fills — 2"})).toBeInTheDocument(),await t(await a.findByRole("button",{name:"2 groups"})).toBeInTheDocument(),await t(await a.findByText("App access no rule maintains")).toBeInTheDocument(),await x(()=>t(A).toBe(0))}},T={play:async({canvasElement:e})=>{const a=await i(e).findByTestId("home-card-stack");await x(()=>t(a).toHaveAttribute("data-stagger-reveal","on"))}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(field(canvasElement)).toHaveValue('');
    await expect(field(canvasElement)).toHaveAttribute('placeholder', 'Search groups, apps, users, rules, etc.');
  }
}`,...d.parameters?.docs?.source},description:{story:"Resting state: one empty field, and the placeholder naming what it reaches.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), \`\${ENG_ID}{Enter}\`);
    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(canvas.getByText(/no request/)).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...l.parameters?.docs?.source},description:{story:"A pasted group id, resolved out of the local snapshot: `getGroupById` is never called.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), \`\${ADA_ID}{Enter}\`);
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    await expect(canvas.getByText(/1 request/)).toBeInTheDocument();
    await expect(ops.getUserById).toHaveBeenCalledTimes(1);
  }
}`,...m.parameters?.docs?.source},description:{story:"A user id: kept out of local storage on purpose, so this one costs a read, and says so.",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), '00gFAKE0000000000009{Enter}');
    await expect(await canvas.findByText('Nothing matched')).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source},description:{story:"An id absent from a finished walk: the snapshot can deny it, at zero requests.",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedSnapshot({
      complete: false
    });
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.type(field(canvasElement), '00gFAKE0000000000009{Enter}');
    await waitFor(() => expect(ops.getGroupById).toHaveBeenCalledTimes(1));
  }
}`,...h.parameters?.docs?.source},description:{story:'The same id against an interrupted walk: a miss means "not fetched yet", so Home asks.',...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), 'eng');
    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    // The floor, stated as the absence it is: 'e' and 'en' passed through the
    // field on the way to 'eng' and neither bought a request.
    await expect(ops.searchGroups).not.toHaveBeenCalledWith('e');
    await expect(ops.searchGroups).not.toHaveBeenCalledWith('en');
  }
}`,...y.parameters?.docs?.source},description:{story:"Typing a name: search holds until the third character, so a two-letter pause costs nothing.",...y.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await userEvent.type(field(canvasElement), ENG_ID);
    await expect(ops.searchGroups).not.toHaveBeenCalled();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...g.parameters?.docs?.source},description:{story:"A well-formed id while still typing: every prefix matches nothing, so the bar waits.",...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    isActive: false
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.type(field(canvasElement), 'eng');
    await expect(ops.searchGroups).not.toHaveBeenCalled();
  }
}`,...w.parameters?.docs?.source},description:{story:"Home while another tab is on screen: the field renders, and the resolver is inert.",...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    setStorageSeed({
      [WORKING_SET_STORAGE_KEY]: {
        version: 1,
        origins: {
          [ORIGIN]: {
            pinned: [{
              kind: 'group',
              id: ENG_ID,
              name: 'Engineering',
              lastPane: 'Members',
              lastSeenAt: Date.now()
            }],
            recent: [{
              kind: 'user',
              id: ADA_ID,
              name: 'Ada Lovelace',
              lastPane: 'Profile',
              lastSeenAt: Date.now() - 86_400_000
            }]
          }
        }
      }
    });
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    // Pinned and recent are read from storage, not fetched.
    await expect(ops.getGroupById).not.toHaveBeenCalled();
    await expect(ops.getUserById).not.toHaveBeenCalled();
  }
}`,...v.parameters?.docs?.source},description:{story:"What the reader pinned and last looked at: one press, and no request at all.",...v.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText(/Nothing pinned yet/)).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source},description:{story:"Nothing remembered: `Pinned` holds its space and says how to fill it.",...f.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    setSyncSnapshotResponder(async () => {
      syncRequests += 1;
      return {
        success: true
      };
    });
    syncRequests = 0;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The findings and the totals caption both come out of rows already on
    // disk, so a warm org paints the whole card without issuing a request. The
    // row is the control now — \`ListRow as="button"\` — and it names its own
    // count, so this pins the figure as well as the row's existence.
    await expect(await canvas.findByRole('button', {
      name: 'Groups with no members that no rule fills — 2'
    })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', {
      name: '2 groups'
    })).toBeInTheDocument();
    // And so does the report, off the same handles — no second mount, no second
    // sync ladder. Its presence in the same story is what pins that.
    await expect(await canvas.findByText('App access no rule maintains')).toBeInTheDocument();
    await waitFor(() => expect(syncRequests).toBe(0));
  }
}`,...B.parameters?.docs?.source},description:{story:"The org snapshot region: counts come from rows on disk, so no `syncSnapshot` is issued.",...B.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const stack = await within(canvasElement).findByTestId('home-card-stack');
    await waitFor(() => expect(stack).toHaveAttribute('data-stagger-reveal', 'on'));
  }
}`,...T.parameters?.docs?.source},description:{story:'The four regions arrive as one cascade. `data-stagger-reveal="on"` appears only once\nthe `IntersectionObserver` exists, so the attribute is proof the hook engaged.',...T.parameters?.docs?.description}}};const Se=["Default","IdResolvesWithoutARequest","UserIdCostsOneRequest","AbsentIdCostsNothing","IncompleteSnapshotFallsThroughToOkta","NameSearch","IdTypedNotYetSubmitted","Inactive","WithWorkingSet","ColdWorkingSet","OrgFiguresAreFree","CardStackCascades"];export{u as AbsentIdCostsNothing,T as CardStackCascades,f as ColdWorkingSet,d as Default,l as IdResolvesWithoutARequest,g as IdTypedNotYetSubmitted,w as Inactive,h as IncompleteSnapshotFallsThroughToOkta,y as NameSearch,B as OrgFiguresAreFree,m as UserIdCostsOneRequest,v as WithWorkingSet,Se as __namedExportsOrder,be as default};
