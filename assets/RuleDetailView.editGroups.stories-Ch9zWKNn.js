import{j as B,a4 as S,r as C}from"./iframe-Pee757m_.js";import{R as x}from"./RuleDetailView-C_wWST-z.js";import{u as w,m as A}from"./useOktaApi.mock-CyMgmY7X.js";import"./preload-helper-PPVm8Dsz.js";import"./RuleActionBar-BbkaDxBE.js";import"./RuleLifecycleActions-BqS1mFt3.js";import"./useRuleTargetEdit-DadjPkB0.js";import"./MissingGroupChip-Bjj4npQI.js";import"./RuleTargetRow-UTy4fshw.js";import"./ruleTargetFacts-DKSE0DP8.js";import"./RuleTargetPicker-Ddrs_JwX.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./ruleTargets-hCG7hfyY.js";import"./RuleUserCheckSection-B6eWGBPl.js";import"./QualificationSubjectStatus-CU6lZAdE.js";import"./RuleUserReport-ByhXsGqL.js";import"./userDisplay-xpx41Abi.js";import"./UserPickerModal-BlV7bmM-.js";import"./VerbRunner-C8BUgmCE.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./memberAnalytics-tPH-giHi.js";import"./BreakdownReport-DLC4-fAg.js";import"./PreflightSections-DS2OyTQC.js";import"./RunSteps-B3-vvI0R.js";import"./costSentence-BaIgeJiz.js";import"./csvUtils-DgNWYp8m.js";import"./qualification-Bb8ctTg-.js";import"./membershipAnalysis-PgI-DSyi.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-DrFMC5PN.js";import"./useUserPicker-CyfeOeo7.js";import"./groupContext-D0LcfWax.js";import"./useDebouncedUserSearch-CwOzP0tx.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./selectionStore-CJ3uIvus.js";import"./useSelection-DhS6cLGA.js";import"./useUndoAction-CXuSt7jT.js";import"./undoManager-CK5SBv_l.js";import"./profileAttributes-dOD8gkOj.js";import"./dateFormat-Db8QGh5_.js";import"./profileFields-BZvCtc6D.js";import"./auditStore-Drtcd6o6.js";import"./index-Dob3nYDb.js";import"./useActorNotice-qzPG2tVV.js";import"./useVerbRun-DT7B4Jtv.js";import"./types-UQE3j1TH.js";import"./RuleMovePicker-CcVHYBbz.js";import"./DuplicateSetParts-AUAlRlyx.js";import"./ruleUtils-D89ADPfb.js";const{expect:a,fn:n,userEvent:o,within:s}=__STORYBOOK_MODULE_TEST__,R="00rFAKE0000000000002",T="00gFAKE00000000ENG01",f="00gFAKE00000000CON01",E="00gFAKE00000000SEC01",O={rule:n(),group:n(),user:n(),app:n(),policy:n()},k=(t={})=>({id:R,name:"Engineering by department",status:"ACTIVE",condition:'user.department == "Engineering"',conditionExpression:'user.department == "Engineering"',groupIds:[T,f],groupNames:["Engineering - All","Contractors"],userAttributes:["department"],created:"2024-01-15T09:00:00.000Z",lastUpdated:"2026-06-01T14:30:00.000Z",...t}),b=(t,e="ACTIVE")=>({id:R,name:"Engineering by department",status:e,type:"group_rule",conditions:{expression:{value:'user.department == "Engineering"',type:""}},actions:{assignUserToGroups:{groupIds:t}}}),v=(t={})=>A({getRawGroupRule:n(async()=>b([T,f])),getCurrentUser:n(async()=>({kind:"resolved",email:"admin@example.com",id:""})),...t});async function i(t){const e=s(t);await o.click(e.getByRole("button",{name:"Edit groups"})),await o.click(e.getByRole("button",{name:"Remove Contractors from this rule"})),await o.click(e.getByRole("button",{name:"Review change"}));const r=s(t.ownerDocument.body);return await r.findByRole("button",{name:"Save groups"}),r}const Ae={title:"Rules/RuleDetailView/Edit groups",component:x,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"The *Edit groups* flow, run through the house `VerbRunner` over a one-rule basket. The confirm is `primary` — an edit is undoable — and quotes the measured cost: the run’s re-read, then pause, save and resume for an active rule. The results offer **Undo** after a clean save, **Resume rule** when the rule was left paused, and **Back to edit** when Okta rejected the change, keeping the staged diff."}}},decorators:[t=>B.jsx(S,{handlers:O,children:B.jsx("div",{className:"p-(--sp-gutter)",children:B.jsx(t,{})})})],args:{rule:k(),oktaOrigin:"https://example.okta.com",targetTabId:1,onPreviewImpact:n(),tierOpen:!1,onTierOpenChange:n(),isConfirmingActivate:!1,onRequestActivate:n(),onCancelActivate:n(),onConfirmActivate:n(),onRequestDeactivate:n(),onTargetsSaved:n(),onResumeRule:n(),sticky:!1},argTypes:{targetTabId:{description:"The tab the write goes through. `null` offers no edit."},onTargetsSaved:{description:"Reload the rules after a write. Required for the edit."},onResumeRule:{description:"Resume a rule an edit left paused. Required for the edit."}},beforeEach:()=>{w.mockReturnValue(v())}},c={play:async({canvasElement:t})=>{await a(s(t).getByRole("button",{name:"Edit groups"})).toBeInTheDocument()}},u={args:{rule:k({status:"INVALID"})},play:async({canvasElement:t})=>{const e=s(t);await a(e.getByText(/This rule is Broken/)).toBeInTheDocument(),await a(e.queryByRole("button",{name:"Edit groups"})).not.toBeInTheDocument()}},d={play:async({canvasElement:t})=>{const e=await i(t);await a(e.getByRole("dialog",{name:"Edit target groups"})).toBeVisible(),await a(e.getByText("Contractors — People this rule added to Contractors are removed from Contractors.")).toBeInTheDocument(),await a(e.getByText(/^This rule pauses while its groups are saved/)).toBeInTheDocument(),await a(e.getByText("Takes 4 requests. Changes 1 entity in Okta.")).toBeInTheDocument(),await a(e.getByText("You can undo this from the results, or later by editing the groups back.")).toBeInTheDocument()}},p={beforeEach:()=>{w.mockReturnValue(v({updateGroupRule:n(()=>new Promise(()=>{}))}))},play:async({canvasElement:t})=>{const e=await i(t);await o.click(e.getByRole("button",{name:"Save groups"})),await a(await e.findByText("Saving 1 target group…")).toBeInTheDocument(),await a(e.getByText(`Paused ${R}`)).toBeInTheDocument(),await a(e.getByText("Resume — starts after the save")).toBeInTheDocument()}},m={play:async({canvasElement:t,args:e})=>{const r=await i(t);await o.click(r.getByRole("button",{name:"Save groups"})),await a(await r.findByText("Saved 1 target group on Engineering by department.")).toBeInTheDocument(),await a(r.getByText("1 group removed: Contractors.")).toBeInTheDocument(),await a(r.getByRole("button",{name:"Undo"})).toBeInTheDocument(),await a(e.onTargetsSaved).toHaveBeenCalled()}},l={render:function(e){const[r,I]=C.useState(e.rule);return B.jsx(x,{...e,rule:r,onTargetsSaved:()=>I(D=>({...D,status:"INACTIVE"}))})},beforeEach:()=>{w.mockReturnValue(v({activateGroupRule:n(async()=>({kind:"failed",error:"Rule could not be activated."}))}))},play:async({canvasElement:t})=>{const e=await i(t);await o.click(e.getByRole("button",{name:"Save groups"})),await a(await e.findByText(/rejected resuming the rule/)).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Close"})),await a(s(t).getByText("The groups were saved. This rule adds no one until it is resumed.")).toBeInTheDocument()}},g={beforeEach:()=>{w.mockReturnValue(v({updateGroupRule:n(async()=>({kind:"failed",error:"Group Contractors is managed by an app and can’t be a target of a rule."}))}))},play:async({canvasElement:t})=>{const e=await i(t);await o.click(e.getByRole("button",{name:"Save groups"})),await a(await e.findByText("Nothing changed. Okta rejected the edit, and the rule still has its 2 previous groups and is Active.")).toBeInTheDocument(),await o.click(e.getByRole("button",{name:"Back to edit"})),await a(s(t).getByText("Removed")).toBeInTheDocument()}},y={beforeEach:()=>{let t=0;w.mockReturnValue(v({getRawGroupRule:n(async()=>(t+=1,t<=2?b([T,f]):b([T,E])))}))},play:async({canvasElement:t})=>{const e=await i(t);await o.click(e.getByRole("button",{name:"Save groups"})),await o.click(await e.findByRole("button",{name:"Undo"})),await a(await e.findByText(/^This rule changed after your edit/)).toBeInTheDocument(),await a(e.getByText("Now: 2 target groups. Your edit left 1.")).toBeInTheDocument(),await a(e.getByText(`${E} was added since.`)).toBeInTheDocument()}},h={parameters:{viewport:{value:"sidepanelDefault"}},play:async({canvasElement:t})=>{await o.click(s(t).getByRole("button",{name:"Edit groups"}))}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('button', {
      name: 'Edit groups'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Read-only, with **Edit groups** in the card's header and the strip unchanged.",...c.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      status: 'INVALID'
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/This rule is Broken/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Edit groups'
    })).not.toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:"A Broken rule: the reason under the strip, and no *Edit groups* at all.",...u.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const body = await reviewRemoval(canvasElement);
    await expect(body.getByRole('dialog', {
      name: 'Edit target groups'
    })).toBeVisible();
    await expect(body.getByText('Contractors — People this rule added to Contractors are removed from Contractors.')).toBeInTheDocument();
    await expect(body.getByText(/^This rule pauses while its groups are saved/)).toBeInTheDocument();
    await expect(body.getByText('Takes 4 requests. Changes 1 entity in Okta.')).toBeInTheDocument();
    await expect(body.getByText('You can undo this from the results, or later by editing the groups back.')).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"The confirm: one line per changed group, the pause sentence, the cost, the undo line.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    useOktaApi.mockReturnValue(writable({
      updateGroupRule: fn(() => new Promise(() => undefined))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const body = await reviewRemoval(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Save groups'
    }));
    await expect(await body.findByText('Saving 1 target group…')).toBeInTheDocument();
    await expect(body.getByText(\`Paused \${RULE_ID}\`)).toBeInTheDocument();
    await expect(body.getByText('Resume — starts after the save')).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Running: three text lines — done, active, waiting — while the save is in flight.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const body = await reviewRemoval(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Save groups'
    }));
    await expect(await body.findByText('Saved 1 target group on Engineering by department.')).toBeInTheDocument();
    await expect(body.getByText('1 group removed: Contractors.')).toBeInTheDocument();
    await expect(body.getByRole('button', {
      name: 'Undo'
    })).toBeInTheDocument();
    await expect(args.onTargetsSaved).toHaveBeenCalled();
  }
}`,...m.parameters?.docs?.source},description:{story:"Saved: what happened, bulleted, with **Undo**; the host reloads the rule.",...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: function LeftPausedRender(args) {
    const [current, setCurrent] = useState(args.rule);
    return <RuleDetailView {...args} rule={current}
    // The reload, as the tab would answer it: the rule now reads Inactive.
    onTargetsSaved={() => setCurrent(r => ({
      ...r,
      status: 'INACTIVE'
    }))} />;
  },
  beforeEach: () => {
    useOktaApi.mockReturnValue(writable({
      activateGroupRule: fn(async () => ({
        kind: 'failed',
        error: 'Rule could not be activated.'
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const body = await reviewRemoval(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Save groups'
    }));
    await expect(await body.findByText(/rejected resuming the rule/)).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', {
      name: 'Close'
    }));
    await expect(within(canvasElement).getByText('The groups were saved. This rule adds no one until it is resumed.')).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:`Saved, but Okta rejected the resume: the results lead with **Resume rule**, and once the
reloaded rule reads Inactive the rung carries the danger banner with the same verb.`,...l.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    useOktaApi.mockReturnValue(writable({
      updateGroupRule: fn(async () => ({
        kind: 'failed',
        error: 'Group Contractors is managed by an app and can’t be a target of a rule.'
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const body = await reviewRemoval(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Save groups'
    }));
    await expect(await body.findByText('Nothing changed. Okta rejected the edit, and the rule still has its 2 previous groups and is Active.')).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', {
      name: 'Back to edit'
    }));
    // The staged removal is still there to fix or retry.
    await expect(within(canvasElement).getByText('Removed')).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"Okta rejected the save: nothing changed, its reason quoted, and the diff kept.",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    let reads = 0;
    useOktaApi.mockReturnValue(writable({
      // The edit's preflight and run read the rule as loaded; by the undo, someone
      // else has added Security Reviewers.
      getRawGroupRule: fn(async () => {
        reads += 1;
        return reads <= 2 ? raw([ENG, CON]) : raw([ENG, SEC]);
      })
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const body = await reviewRemoval(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Save groups'
    }));
    await userEvent.click(await body.findByRole('button', {
      name: 'Undo'
    }));
    await expect(await body.findByText(/^This rule changed after your edit/)).toBeInTheDocument();
    await expect(body.getByText('Now: 2 target groups. Your edit left 1.')).toBeInTheDocument();
    await expect(body.getByText(\`\${SEC} was added since.\`)).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:"The rule changed after the edit: Undo refuses, and says what moved.",...y.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelDefault'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Edit groups'
    }));
  }
}`,...h.parameters?.docs?.source},description:{story:"The 480px default panel, in edit mode.",...h.parameters?.docs?.description}}};const Oe=["Entry","Broken","Confirm","Running","Saved","LeftPaused","Rejected","UndoRefusedDrifted","EditMode480"];export{u as Broken,d as Confirm,h as EditMode480,c as Entry,l as LeftPaused,g as Rejected,p as Running,m as Saved,y as UndoRefusedDrifted,Oe as __namedExportsOrder,Ae as default};
