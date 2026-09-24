import{A as l}from"./ActionsPane-W4XO7aBW.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./VerbList-DOZ6GAGz.js";import"./types-CedNKx8Z.js";import"./registry-l4mQzsmW.js";import"./userDisplay-xpx41Abi.js";import"./groupRuleIndex-CUdSMoPG.js";import"./fetchGroupRulesRequest-DgNCr2VU.js";import"./ruleUtils-Vt2BA8lQ.js";import"./oktaPagination-DzUnd2oi.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleOrphans-w7zgihHR.js";import"./selectionStore-CrmbAKHN.js";import"./memberRuleAttribution-DwskNnmH.js";import"./profile-Bul2VYbY.js";import"./undoManager-Db5dJWVO.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-qVcYAhdY.js";import"./membershipAnalysis-BZfvnwXl.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-DUrEZuW9.js";import"./sourceLine-6HOHdWfm.js";import"./profileAttributes-D7zGcuAf.js";import"./dateFormat-C9yVDsck.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-_apwJWix.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";const{expect:o,fn:h,userEvent:y,within:p}=__STORYBOOK_MODULE_TEST__,d=t=>({picked:t.map((e,n)=>({kind:e,id:`${e}-${n}`,name:`${e} ${n}`,pickedAt:17e11+n}))}),m=t=>{const e={};for(const n of t.picked)e[n.kind]=(e[n.kind]??0)+1;return e},i={id:"remove-inactive",label:"Remove inactive members",title:"Remove deactivated, suspended and locked-out members from these groups",path:"write",needs:["group"],cost:t=>({requests:0,walks:[{count:t.picked.filter(e=>e.kind==="group").length,kind:"membership"}],writes:0}),run:async()=>({status:"done",summary:"Done."})},c=d(["group","group"]),u=d(["user"]),F={title:"Selection/panes/ActionsPane",component:l,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Renders `write` verbs from the registry. Three states, and the pane says which one it is in: no verbs wired at all, verbs that do not apply to what is ticked (naming the partitions they wait on), or the runnable list. Reporting the first two with one sentence would lose the reason for the absence (`docs/claims.md`)."}}},args:{onRun:h()}},a={args:{verbs:[],basket:c,counts:m(c)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("No actions yet")).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},s={args:{verbs:[i],basket:u,counts:m(u)},play:async({canvasElement:t})=>{const e=p(t);await o(e.getByText("Nothing here applies yet")).toBeInTheDocument(),await o(e.getByText(/Tick some groups/)).toBeInTheDocument(),await o(e.queryByRole("button")).not.toBeInTheDocument()}},r={args:{verbs:[i],basket:c,counts:m(c)},play:async({canvasElement:t,args:e})=>{const n=p(t);await o(n.getByText(i.title)).toBeInTheDocument(),await o(n.getByText("Takes 2 membership walks.")).toBeInTheDocument(),await y.click(n.getByRole("button",{name:i.title})),await o(e.onRun).toHaveBeenCalledWith(i)}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
