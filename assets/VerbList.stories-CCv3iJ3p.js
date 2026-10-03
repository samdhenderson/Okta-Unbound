import{V as l}from"./VerbList-PjFxvbpL.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./costSentence-BaIgeJiz.js";import"./registry-eze4JS1O.js";import"./userDisplay-xpx41Abi.js";import"./groupRuleIndex-Bp-Lo1-T.js";import"./fetchGroupRulesRequest-MG6-n1WX.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-o9TWva_3.js";import"./index-Dob3nYDb.js";import"./ruleUtils-D89ADPfb.js";import"./ruleOrphans-3tiaw57A.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./selectionStore-CJ3uIvus.js";import"./memberRuleAttribution-CYi3LQ2b.js";import"./profile-2bQoJYBZ.js";import"./undoManager-CK5SBv_l.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-gQdhFMYq.js";import"./membershipAnalysis-PgI-DSyi.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-n2BbpwtB.js";import"./sourceLine-BFeciPo3.js";import"./profileAttributes-dOD8gkOj.js";import"./dateFormat-Db8QGh5_.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-tPH-giHi.js";import"./types-UQE3j1TH.js";const{expect:n,fn:h,within:c}=__STORYBOOK_MODULE_TEST__,p=e=>({picked:e.map((t,s)=>({kind:t,id:`${t}-${s}`,name:`${t} ${s}`,pickedAt:17e11+s}))}),u=e=>{const t={};for(const s of e.picked)t[s.kind]=(t[s.kind]??0)+1;return t},m=e=>({label:e.id,path:"write",cost:()=>({requests:1,writes:1}),run:async()=>({status:"done",summary:"Done."}),...e}),g=m({id:"turn-off",label:"Turn these rules off",title:"Turn these rules off, so they stop assigning members",needs:["rule"]}),b=m({id:"overlap",label:"Members these groups share",title:"Report which members these groups share",path:"read",needs:["group"],isAvailable:e=>e.picked.filter(t=>t.kind==="group").length>=2,unavailableReason:"Needs at least two groups — an overlap of one group is not a question.",cost:()=>({requests:1,writes:0})}),d=m({id:"add-users",label:"Add to these groups",title:"Add these users to these groups",needs:["user","group"],cost:e=>{const t=e.picked.filter(i=>i.kind==="user").length,s=e.picked.filter(i=>i.kind==="group").length;return{requests:t*s,writes:t*s}}}),H={title:"Selection/panes/VerbList",component:l,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"One row per verb, naming what it acts on and what it costs. The panes’ own stories cover the two headline absences; this covers what only a list can show — several verbs held back for **different** reasons at once, and a combination verb appearing the moment its second partition fills."}}},args:{onRun:h(),emptyIcon:"bolt",emptyTitle:"No actions yet",emptyDescription:"None are wired yet."}},o={args:(()=>{const e=p(["group"]);return{verbs:[g,b],basket:e,counts:u(e)}})(),play:async({canvasElement:e})=>{const t=c(e);await n(t.getByText(/Tick some rules and these appear\./)).toBeInTheDocument(),await n(t.getByText(/Needs at least two groups/)).toBeInTheDocument()}},a={args:(()=>{const e=p(["user"]);return{verbs:[d],basket:e,counts:u(e)}})(),play:async({canvasElement:e})=>{const t=c(e);await n(t.getByText(/Tick some groups and these appear\./)).toBeInTheDocument(),await n(t.queryByRole("button")).not.toBeInTheDocument()}},r={args:(()=>{const e=p(["user","user","user","group","group"]);return{verbs:[d],basket:e,counts:u(e)}})(),play:async({canvasElement:e})=>{const t=c(e);await n(t.getByText("Add these users to these groups")).toBeInTheDocument(),await n(t.getByText("Takes 6 requests. Changes 6 entities in Okta.")).toBeInTheDocument()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: (() => {
    const basket = basketOf(['group']);
    return {
      verbs: [NEEDS_RULES, NEEDS_TWO],
      basket,
      counts: countsOf(basket)
    };
  })(),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Tick some rules and these appear\\./)).toBeInTheDocument();
    await expect(canvas.getByText(/Needs at least two groups/)).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:`Two verbs, held back for two different reasons. Both are reported: an empty
partition explains itself by name, and an extra condition quotes the verb's
own sentence. Collapsing them into one "nothing here" would lose the reason.`,...o.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: (() => {
    const basket = basketOf(['user']);
    return {
      verbs: [COMBO],
      basket,
      counts: countsOf(basket)
    };
  })(),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Tick some groups and these appear\\./)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"One partition is ticked — the combination verb is still absent, not disabled.",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: (() => {
    const basket = basketOf(['user', 'user', 'user', 'group', 'group']);
    return {
      verbs: [COMBO],
      basket,
      counts: countsOf(basket)
    };
  })(),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Add these users to these groups')).toBeInTheDocument();
    await expect(canvas.getByText('Takes 6 requests. Changes 6 entities in Okta.')).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"Both partitions are ticked — it appears, quoting the real N×M cost.",...r.parameters?.docs?.description}}};const J=["BothReasonsAtOnce","ComboWaitsForItsSecondPartition","ComboAppearsAndPricesItself"];export{o as BothReasonsAtOnce,r as ComboAppearsAndPricesItself,a as ComboWaitsForItsSecondPartition,J as __namedExportsOrder,H as default};
