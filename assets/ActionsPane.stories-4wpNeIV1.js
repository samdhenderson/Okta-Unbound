import{A as l}from"./ActionsPane-2Oxfs5ej.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./VerbList-PjFxvbpL.js";import"./costSentence-BaIgeJiz.js";import"./registry-eze4JS1O.js";import"./userDisplay-xpx41Abi.js";import"./groupRuleIndex-Bp-Lo1-T.js";import"./fetchGroupRulesRequest-MG6-n1WX.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-o9TWva_3.js";import"./index-Dob3nYDb.js";import"./ruleUtils-D89ADPfb.js";import"./ruleOrphans-3tiaw57A.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./selectionStore-CJ3uIvus.js";import"./memberRuleAttribution-CYi3LQ2b.js";import"./profile-2bQoJYBZ.js";import"./undoManager-CK5SBv_l.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-gQdhFMYq.js";import"./membershipAnalysis-PgI-DSyi.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-n2BbpwtB.js";import"./sourceLine-BFeciPo3.js";import"./profileAttributes-dOD8gkOj.js";import"./dateFormat-Db8QGh5_.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-tPH-giHi.js";import"./types-UQE3j1TH.js";const{expect:o,fn:h,userEvent:y,within:p}=__STORYBOOK_MODULE_TEST__,d=t=>({picked:t.map((e,n)=>({kind:e,id:`${e}-${n}`,name:`${e} ${n}`,pickedAt:17e11+n}))}),m=t=>{const e={};for(const n of t.picked)e[n.kind]=(e[n.kind]??0)+1;return e},i={id:"remove-inactive",label:"Remove inactive members",title:"Remove deactivated, suspended and locked-out members from these groups",path:"write",needs:["group"],cost:t=>({requests:0,walks:[{count:t.picked.filter(e=>e.kind==="group").length,kind:"membership"}],writes:0}),run:async()=>({status:"done",summary:"Done."})},c=d(["group","group"]),u=d(["user"]),F={title:"Selection/panes/ActionsPane",component:l,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Renders `write` verbs from the registry. Three states, and the pane says which one it is in: no verbs wired at all, verbs that do not apply to what is ticked (naming the partitions they wait on), or the runnable list. Reporting the first two with one sentence would lose the reason for the absence (`docs/claims.md`)."}}},args:{onRun:h()}},a={args:{verbs:[],basket:c,counts:m(c)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("No actions yet")).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},s={args:{verbs:[i],basket:u,counts:m(u)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("Nothing here applies yet")).toBeInTheDocument(),await o(e.getByText(/Tick some groups/)).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},r={args:{verbs:[i],basket:c,counts:m(c)},play:async({canvasElement:t,args:e})=>{const n=p(t);await o(n.getByText(i.title)).toBeInTheDocument(),await o(n.getByText("Takes 2 membership walks.")).toBeInTheDocument(),await y.click(n.getByRole("button",{name:i.title})),await o(e.onRun).toHaveBeenCalledWith(i)}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [],
    basket: GROUPS,
    counts: countsOf(GROUPS)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No actions yet')).toBeInTheDocument();
    // A verb with no handler is omitted, never shipped disabled (\`docs/claims.md\`).
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Nothing wired yet — the seat is held and names what belongs in it.",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [REMOVE_INACTIVE],
    basket: USERS_ONLY,
    counts: countsOf(USERS_ONLY)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing here applies yet')).toBeInTheDocument();
    await expect(canvas.getByText(/Tick some groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:`Verbs exist but none applies. The pane names the partition they are waiting
on — the reader's next action rather than a bare "nothing here".`,...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [REMOVE_INACTIVE],
    basket: GROUPS,
    counts: countsOf(GROUPS)
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(REMOVE_INACTIVE.title)).toBeInTheDocument();
    // The cost is a count of requests, never an estimate of seconds.
    await expect(canvas.getByText('Takes 2 membership walks.')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: REMOVE_INACTIVE.title
    }));
    await expect(args.onRun).toHaveBeenCalledWith(REMOVE_INACTIVE);
  }
}`,...r.parameters?.docs?.source},description:{story:"The verb's object is ticked — it appears, stating what it will spend.",...r.parameters?.docs?.description}}};const J=["NoVerbsWired","NothingApplies","Runnable"];export{a as NoVerbsWired,s as NothingApplies,r as Runnable,J as __namedExportsOrder,F as default};
