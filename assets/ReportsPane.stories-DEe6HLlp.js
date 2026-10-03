import{R as d}from"./ReportsPane-DPvPyRae.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./VerbList-PjFxvbpL.js";import"./costSentence-BaIgeJiz.js";import"./registry-eze4JS1O.js";import"./userDisplay-xpx41Abi.js";import"./groupRuleIndex-Bp-Lo1-T.js";import"./fetchGroupRulesRequest-MG6-n1WX.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-o9TWva_3.js";import"./index-Dob3nYDb.js";import"./ruleUtils-D89ADPfb.js";import"./ruleOrphans-3tiaw57A.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./selectionStore-CJ3uIvus.js";import"./memberRuleAttribution-CYi3LQ2b.js";import"./profile-2bQoJYBZ.js";import"./undoManager-CK5SBv_l.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-gQdhFMYq.js";import"./membershipAnalysis-PgI-DSyi.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-n2BbpwtB.js";import"./sourceLine-BFeciPo3.js";import"./profileAttributes-dOD8gkOj.js";import"./dateFormat-Db8QGh5_.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-tPH-giHi.js";import"./types-UQE3j1TH.js";const{expect:o,fn:h,userEvent:g,within:p}=__STORYBOOK_MODULE_TEST__,l=t=>({picked:t.map((e,n)=>({kind:e,id:`${e}-${n}`,name:`${e} ${n}`,pickedAt:17e11+n}))}),m=t=>{const e={};for(const n of t.picked)e[n.kind]=(e[n.kind]??0)+1;return e},i={id:"group-overlap",label:"Report shared members",title:"Report which members these groups share",path:"read",needs:["group"],isAvailable:t=>t.picked.filter(e=>e.kind==="group").length>=2,unavailableReason:"Needs at least two groups — an overlap of one group is not a question.",cost:t=>({requests:0,walks:[{count:t.picked.filter(e=>e.kind==="group").length,kind:"membership"}],writes:0}),run:async()=>({status:"done",summary:"Done."})},c=l(["group","group"]),u=l(["group"]),F={title:"Selection/panes/ReportsPane",component:d,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Renders `read` verbs from the registry. A report answers in a CSV rather than a table on screen: a 400px pane cannot hold a wide table honestly, and a truncated preview is a claim about a set the reader cannot see."}}},args:{onRun:h()}},a={args:{verbs:[],basket:c,counts:m(c)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("No reports yet")).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},s={args:{verbs:[i],basket:u,counts:m(u)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("Nothing here applies yet")).toBeInTheDocument(),await o(e.getByText(/Needs at least two groups/)).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},r={args:{verbs:[i],basket:c,counts:m(c)},play:async({canvasElement:t,args:e})=>{const n=p(t);await o(n.getByText(i.title)).toBeInTheDocument(),await g.click(n.getByRole("button",{name:i.title})),await o(e.onRun).toHaveBeenCalledWith(i)}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [],
    basket: TWO_GROUPS,
    counts: countsOf(TWO_GROUPS)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No reports yet')).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Nothing wired yet — the seat is held and names what belongs in it.",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [OVERLAP],
    basket: ONE_GROUP,
    counts: countsOf(ONE_GROUP)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing here applies yet')).toBeInTheDocument();
    await expect(canvas.getByText(/Needs at least two groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:`One group is ticked, and an overlap of one group is not a question. The
verb's extra condition withholds it rather than offering a report that would
have nothing to compare.`,...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    verbs: [OVERLAP],
    basket: TWO_GROUPS,
    counts: countsOf(TWO_GROUPS)
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(OVERLAP.title)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: OVERLAP.title
    }));
    await expect(args.onRun).toHaveBeenCalledWith(OVERLAP);
  }
}`,...r.parameters?.docs?.source},description:{story:"Two groups — the question is answerable, so it is offered.",...r.parameters?.docs?.description}}};const J=["NoVerbsWired","ExtraConditionWithholdsIt","Runnable"];export{s as ExtraConditionWithholdsIt,a as NoVerbsWired,r as Runnable,J as __namedExportsOrder,F as default};
