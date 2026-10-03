import{j as S,U as W,a3 as F,a4 as K,a5 as V,V as L}from"./iframe-Pee757m_.js";import{H as M}from"./HomeTab-KC-9Vm6-.js";import{O as $}from"./OrgEntityIndexContext-BFom55Rl.js";import{u as D,m as O}from"./useOktaApi.mock-CyMgmY7X.js";import{o as m}from"./orgSnapshotStore-o9TWva_3.js";import{W as Y}from"./workingSetStore-Bq1mYBWN.js";import"./preload-helper-PPVm8Dsz.js";import"./JumpBar-f4sJYw3Z.js";import"./JumpResultRow-B_-D67Tg.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./PinnedCard-KpMYf2Pn.js";import"./PinDetailCard-TDIpSHeo.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./dateFormat-Db8QGh5_.js";import"./status-Bn0B6Ou-.js";import"./groupIdentity-DrhSobdh.js";import"./PinRail-Dr8sHgux.js";import"./GuideLinkRow-DMEgghEE.js";import"./githubLinks-BfCtNl-2.js";import"./AskCard-CBibybTo.js";import"./VerbStrip-CFQur6FV.js";import"./verbIcons-BnCRhW9A.js";import"./Sentence-f34hhmJK.js";import"./SlotPill-eK_fGwgC.js";import"./reducer-C7bPglpv.js";import"./SlotPicker-0ZR16Ogn.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./oktaId-BKuZMWJR.js";import"./AttributePicker-DcO3jn5g.js";import"./GrantingGroupPicker-BEsEc4BK.js";import"./HeldValuePicker-BwShd0te.js";import"./RunningLine-BJSVlGYi.js";import"./CompareAnswerView-BjeNLZd8.js";import"./AnswerHeadline-1rdFjlxA.js";import"./AccessAnswerView-BHrNNcuO.js";import"./AccessPathList-xYLLiYDM.js";import"./BuildAnswerView-BHoBH5yx.js";import"./ComposeAnswerView-CFFjt3lz.js";import"./ComposeAttributeRow-FpGF-y2V.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./FindAnswerView-BXotIyHx.js";import"./ThenChips-Bh2ZPFuf.js";import"./EarlierList-xEe-rROv.js";import"./ConciergeGreeting-Ci6otbaj.js";import"./motion-DWPTjLhl.js";import"./GuideInvite-D_pp1wv2.js";import"./Orb-DQZsh7BJ.js";import"./RecommendationCard-DJVvo1S8.js";import"./concierge-CFpCju1p.js";import"./then-JFpS9G1J.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./getUserGroupsRequest-CmjbBB-j.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./registry-Dm1g-4iX.js";import"./costSentence-BaIgeJiz.js";import"./useHomePinned-_hJ7nIvc.js";import"./useEntityQuery-D64bDfY8.js";import"./profileFields-BZvCtc6D.js";import"./qualification-Bb8ctTg-.js";import"./membershipAnalysis-PgI-DSyi.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-DrFMC5PN.js";import"./groupContext-D0LcfWax.js";import"./fetchGroupRulesRequest-MG6-n1WX.js";import"./ruleUtils-D89ADPfb.js";import"./ruleOrphans-3tiaw57A.js";import"./groupAttributeIndex-BuDwZvlB.js";import"./useWorkingSet-C9n2kiNz.js";import"./useEntitySearchSources-D0W3NNMV.js";import"./usePoliciesData-BDVwvkFr.js";import"./policyFilters-0Alm462X.js";import"./useStaggerReveal-B8AfVumu.js";import"./useOrgSnapshot-BCrwHhej.js";import"./index-Dob3nYDb.js";const{expect:a,fn:s,userEvent:d,waitFor:G,within:o}=__STORYBOOK_MODULE_TEST__,c="https://example.okta.com",i="00gFAKE0000000000001",P="00uFAKE0000000000001",C=[{id:i,type:"OKTA_GROUP",profile:{name:"Engineering",description:"All engineers"}},{id:"00gFAKE0000000000002",type:"OKTA_GROUP",profile:{name:"Engineering — On-call"}}],H=[{id:"0prFAKE0000000000001",name:"Eng — All ICs",status:"INACTIVE",type:"group_rule",created:"2026-01-04T09:00:00.000Z",lastUpdated:"2026-05-11T09:00:00.000Z"}],_=[{id:"0oaFAKE0000000000001",name:"salesforce",label:"Salesforce",status:"ACTIVE"}];async function N({complete:e=!0,walkedAt:t=Date.now()}={}){await m.clearOrigin(c),await m.upsertMany("groups",c,C.map(n=>({id:n.id,entity:n})),Date.now()),await m.upsertMany("rules",c,H.map(n=>({id:n.id,entity:n})),Date.now()),await m.patchMeta("groups",c,{complete:e,lastFullWalkAt:e?t:null,itemCount:C.length}),await m.upsertMany("apps",c,_.map(n=>({id:n.id,entity:n})),Date.now()),await m.patchMeta("rules",c,{complete:e,lastFullWalkAt:e?t:null,itemCount:H.length}),await m.patchMeta("apps",c,{complete:!0,lastFullWalkAt:Date.now(),itemCount:_.length})}function q(){return{searchGroups:s(async e=>e.toLowerCase().startsWith("eng")?[{id:i,name:"Engineering",description:"All engineers"}]:[]).mockName("searchGroups"),searchUsers:s(async()=>[{id:P,firstName:"Ada",lastName:"Lovelace",login:"ada@example.com",email:"ada@example.com"}]).mockName("searchUsers"),getGroupById:s(async e=>({id:e,name:"Engineering",description:"All engineers"})).mockName("getGroupById"),getUserById:s(async e=>({id:e,firstName:"Ada",lastName:"Lovelace",login:"ada@example.com",email:"ada@example.com"})).mockName("getUserById")}}let r=q(),b=0;const p=e=>o(e).getByLabelText("Search groups, apps, users, rules"),ft={title:"Home/HomeTab",component:M,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:'The side panel’s first tab: the concierge, Search, Ask and Pinned. Home has no `PageHeader` — one could only say "Home".\n\nMost stories below are about cost, which is the part a screenshot cannot show: each asserts the number of Okta requests its interaction spends. An id already in the local org snapshot resolves at zero, a user id costs one because user records are deliberately kept out of local storage, and an incomplete snapshot spends one rather than reporting an absence it cannot support.'}}},decorators:[(e,{args:t})=>S.jsx(K,{handlers:{group:s(),user:s()},children:S.jsx($,{oktaOrigin:t.oktaOrigin??null,targetTabId:t.targetTabId,enabled:t.isActive,children:S.jsx(e,{})})})],argTypes:{isActive:{description:"Whether Home is the tab on screen. A hidden Home issues no traffic."},targetTabId:{description:"Chrome tab id of the connected Okta tab."},oktaOrigin:{description:"Okta org origin — scopes the snapshot and builds deep links."}},args:{isActive:!0,targetTabId:1,oktaOrigin:c,firstRun:{greeting:"played",invite:"answered",markPlayed:s(),dismissInvite:s(),openGuide:s(),replay:s()}},beforeEach:async()=>{W(),F(),r=q(),D.mockReturnValue(O(r)),await N()}},l={play:async({canvasElement:e})=>{await a(p(e)).toHaveValue(""),await a(p(e)).toHaveAttribute("placeholder","Search groups, apps, users, rules, etc.")}},u={play:async({canvasElement:e})=>{const t=o(e);await d.type(p(e),`${i}{Enter}`),await a(await t.findByText("Engineering")).toBeInTheDocument(),await a(t.getByText(/no request/)).toBeInTheDocument(),await a(r.getGroupById).not.toHaveBeenCalled()}},g={play:async({canvasElement:e})=>{const t=o(e);await d.type(p(e),`${P}{Enter}`),await a(await t.findByText("Ada Lovelace")).toBeInTheDocument(),await a(t.getByText(/1 request/)).toBeInTheDocument(),await a(r.getUserById).toHaveBeenCalledTimes(1)}},h={play:async({canvasElement:e})=>{const t=o(e);await d.type(p(e),"00gFAKE0000000000009{Enter}"),await a(await t.findByText("Nothing matched")).toBeInTheDocument(),await a(r.getGroupById).not.toHaveBeenCalled()}},y={beforeEach:async()=>{await N({complete:!1})},play:async({canvasElement:e})=>{await d.type(p(e),"00gFAKE0000000000009{Enter}"),await G(()=>a(r.getGroupById).toHaveBeenCalledTimes(1))}},w={play:async({canvasElement:e})=>{const t=o(e);await d.type(p(e),"eng"),await a(await t.findByText("Engineering")).toBeInTheDocument(),await a(await t.findByText("Ada Lovelace")).toBeInTheDocument(),await a(r.searchGroups).not.toHaveBeenCalledWith("e"),await a(r.searchGroups).not.toHaveBeenCalledWith("en")}},v={play:async({canvasElement:e})=>{await d.type(p(e),i),await a(r.searchGroups).not.toHaveBeenCalled(),await a(r.getGroupById).not.toHaveBeenCalled()}},E={args:{isActive:!1},play:async({canvasElement:e})=>{await d.type(p(e),"eng"),await a(r.searchGroups).not.toHaveBeenCalled()}};let x=s();const B={beforeEach:async()=>{V({[Y]:{version:1,origins:{[c]:{pinned:[{kind:"group",id:i,name:"Engineering",lastPane:"Members",lastSeenAt:Date.now()}],recent:[]}}}}),x=s(async e=>e===`/api/v1/groups/${i}?expand=stats`?{success:!0,status:200,data:{id:i,type:"OKTA_GROUP",profile:{name:"Engineering"},_embedded:{stats:{usersCount:1284}}}}:{success:!0,status:200,data:[]}).mockName("makeApiRequest"),D.mockReturnValue(O({...r,makeApiRequest:x}))},play:async({canvasElement:e})=>{const t=o(await o(e).findByRole("region",{name:"Pinned"}));await a(t.getByRole("button",{name:/Engineering/,pressed:!0})).toBeInTheDocument(),await a(await t.findByText("1,284")).toBeInTheDocument(),await a(t.getByText(/^Read at /)).toBeInTheDocument();const n=x.mock.calls.filter(([R])=>String(R).startsWith(`/api/v1/groups/${i}`));await a(n).toHaveLength(1)}},f={play:async({canvasElement:e})=>{const t=o(e);await a(await t.findByRole("region",{name:"Ask"})).toBeInTheDocument(),await a(t.queryByRole("region",{name:"Pinned"})).not.toBeInTheDocument()}},U=async()=>{L(async()=>(b+=1,{success:!0})),b=0},T={beforeEach:U,play:async({canvasElement:e})=>{await o(e).findByRole("region",{name:"Ask"}),await new Promise(t=>setTimeout(t,50)),await a(b).toBe(0)}},A={beforeEach:async()=>{await N({walkedAt:Date.now()-7200*1e3}),await U()},play:async()=>{await G(()=>a(b).toBe(1))}},I={args:{tabEntity:{kind:"group",id:i,label:"Engineering"}},beforeEach:()=>{x=s(async e=>e===`/api/v1/groups/${i}?expand=stats`?{success:!0,status:200,data:{id:i,type:"OKTA_GROUP",profile:{name:"Engineering"},_embedded:{stats:{usersCount:1284}}}}:{success:!0,status:200,data:[]}).mockName("makeApiRequest"),D.mockReturnValue(O({...r,makeApiRequest:x}))},play:async({canvasElement:e})=>{const t=o(e),n=o(await t.findByRole("region",{name:"Welcome"}));await a(await n.findByText("You’re on Engineering, a group of 1,284 members. What would you like to know?",{ignore:'[aria-hidden="true"], script, style'})).toBeInTheDocument(),await d.click(n.getByRole("button",{name:"Pin Engineering"}));const R=o(await t.findByRole("region",{name:"Pinned"}));await a(R.getByRole("button",{name:/Engineering/,pressed:!0})).toBeInTheDocument(),await a(n.queryByRole("button",{name:"Pin Engineering"})).toBeNull()}},k={play:async({canvasElement:e})=>{const t=await o(e).findByTestId("home-card-stack");await G(()=>a(t).toHaveAttribute("data-stagger-reveal","on"))}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(field(canvasElement)).toHaveValue('');
    await expect(field(canvasElement)).toHaveAttribute('placeholder', 'Search groups, apps, users, rules, etc.');
  }
}`,...l.parameters?.docs?.source},description:{story:"Resting state: one empty field, and the placeholder naming what it reaches.",...l.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), \`\${ENG_ID}{Enter}\`);
    await expect(await canvas.findByText('Engineering')).toBeInTheDocument();
    await expect(canvas.getByText(/no request/)).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source},description:{story:"A pasted group id, resolved out of the local snapshot: `getGroupById` is never called.",...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), \`\${ADA_ID}{Enter}\`);
    await expect(await canvas.findByText('Ada Lovelace')).toBeInTheDocument();
    await expect(canvas.getByText(/1 request/)).toBeInTheDocument();
    await expect(ops.getUserById).toHaveBeenCalledTimes(1);
  }
}`,...g.parameters?.docs?.source},description:{story:"A user id: kept out of local storage on purpose, so this one costs a read, and says so.",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(field(canvasElement), '00gFAKE0000000000009{Enter}');
    await expect(await canvas.findByText('Nothing matched')).toBeInTheDocument();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...h.parameters?.docs?.source},description:{story:"An id absent from a finished walk: the snapshot can deny it, at zero requests.",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:'The same id against an interrupted walk: a miss means "not fetched yet", so Home asks.',...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:"Typing a name: search holds until the third character, so a two-letter pause costs nothing.",...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await userEvent.type(field(canvasElement), ENG_ID);
    await expect(ops.searchGroups).not.toHaveBeenCalled();
    await expect(ops.getGroupById).not.toHaveBeenCalled();
  }
}`,...v.parameters?.docs?.source},description:{story:"A well-formed id while still typing: every prefix matches nothing, so the bar waits.",...v.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    isActive: false
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.type(field(canvasElement), 'eng');
    await expect(ops.searchGroups).not.toHaveBeenCalled();
  }
}`,...E.parameters?.docs?.source},description:{story:"Home while another tab is on screen: the field renders, and the resolver is inert.",...E.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
            recent: []
          }
        }
      }
    });
    pinTransport = fn(async (endpoint: string) => endpoint === \`/api/v1/groups/\${ENG_ID}?expand=stats\` ? {
      success: true,
      status: 200,
      data: {
        id: ENG_ID,
        type: 'OKTA_GROUP',
        profile: {
          name: 'Engineering'
        },
        _embedded: {
          stats: {
            usersCount: 1284
          }
        }
      }
    } : {
      success: true,
      status: 200,
      data: []
    }).mockName('makeApiRequest');
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      ...ops,
      makeApiRequest: pinTransport
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const pinned = within(await within(canvasElement).findByRole('region', {
      name: 'Pinned'
    }));
    await expect(pinned.getByRole('button', {
      name: /Engineering/,
      pressed: true
    })).toBeInTheDocument();
    await expect(await pinned.findByText('1,284')).toBeInTheDocument();
    await expect(pinned.getByText(/^Read at /)).toBeInTheDocument();
    const pinReads = pinTransport.mock.calls.filter(([endpoint]) => String(endpoint).startsWith(\`/api/v1/groups/\${ENG_ID}\`));
    await expect(pinReads).toHaveLength(1);
  }
}`,...B.parameters?.docs?.source},description:{story:`A pin: the Pinned card selects it and reads it once — the group itself, with
its exact member count — and states when that read happened.`,...B.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('region', {
      name: 'Ask'
    })).toBeInTheDocument();
    await expect(canvas.queryByRole('region', {
      name: 'Pinned'
    })).not.toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source},description:{story:"Nothing pinned: the section does not exist until something is.",...f.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  beforeEach: countSyncs,
  play: async ({
    canvasElement
  }) => {
    await within(canvasElement).findByRole('region', {
      name: 'Ask'
    });
    await new Promise(resolve => setTimeout(resolve, 50));
    await expect(syncRequests).toBe(0);
  }
}`,...T.parameters?.docs?.source},description:{story:"A snapshot walked minutes ago: a visit to Home tops nothing up.",...T.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedSnapshot({
      walkedAt: Date.now() - 2 * 60 * 60 * 1000
    });
    await countSyncs();
  },
  play: async () => {
    await waitFor(() => expect(syncRequests).toBe(1));
  }
}`,...A.parameters?.docs?.source},description:{story:"A snapshot walked two hours ago: Home asks for one cheap top-up, once.",...A.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    tabEntity: {
      kind: 'group',
      id: ENG_ID,
      label: 'Engineering'
    }
  },
  beforeEach: () => {
    pinTransport = fn(async (endpoint: string) => endpoint === \`/api/v1/groups/\${ENG_ID}?expand=stats\` ? {
      success: true,
      status: 200,
      data: {
        id: ENG_ID,
        type: 'OKTA_GROUP',
        profile: {
          name: 'Engineering'
        },
        _embedded: {
          stats: {
            usersCount: 1284
          }
        }
      }
    } : {
      success: true,
      status: 200,
      data: []
    }).mockName('makeApiRequest');
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      ...ops,
      makeApiRequest: pinTransport
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const welcome = within(await canvas.findByRole('region', {
      name: 'Welcome'
    }));
    await expect(await welcome.findByText('You’re on Engineering, a group of 1,284 members. What would you like to know?', {
      ignore: '[aria-hidden="true"], script, style'
    })).toBeInTheDocument();
    await userEvent.click(welcome.getByRole('button', {
      name: 'Pin Engineering'
    }));
    const pinned = within(await canvas.findByRole('region', {
      name: 'Pinned'
    }));
    await expect(pinned.getByRole('button', {
      name: /Engineering/,
      pressed: true
    })).toBeInTheDocument();
    await expect(welcome.queryByRole('button', {
      name: 'Pin Engineering'
    })).toBeNull();
  }
}`,...I.parameters?.docs?.source},description:{story:`On a group's page the concierge names it, with its member count once read,
and its Pin card pins it — the Pinned section appears holding it.`,...I.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const stack = await within(canvasElement).findByTestId('home-card-stack');
    await waitFor(() => expect(stack).toHaveAttribute('data-stagger-reveal', 'on'));
  }
}`,...k.parameters?.docs?.source},description:{story:'The bands arrive as one cascade. `data-stagger-reveal="on"` appears only once\nthe `IntersectionObserver` exists, so the attribute is proof the hook engaged.',...k.parameters?.docs?.description}}};const Tt=["Default","IdResolvesWithoutARequest","UserIdCostsOneRequest","AbsentIdCostsNothing","IncompleteSnapshotFallsThroughToOkta","NameSearch","IdTypedNotYetSubmitted","Inactive","WithAPin","NothingPinned","AFreshSnapshotCostsNothing","AStaleSnapshotIsToppedUpOnce","ConciergeOnAGroup","CardStackCascades"];export{T as AFreshSnapshotCostsNothing,A as AStaleSnapshotIsToppedUpOnce,h as AbsentIdCostsNothing,k as CardStackCascades,I as ConciergeOnAGroup,l as Default,u as IdResolvesWithoutARequest,v as IdTypedNotYetSubmitted,E as Inactive,y as IncompleteSnapshotFallsThroughToOkta,w as NameSearch,f as NothingPinned,g as UserIdCostsOneRequest,B as WithAPin,Tt as __namedExportsOrder,ft as default};
