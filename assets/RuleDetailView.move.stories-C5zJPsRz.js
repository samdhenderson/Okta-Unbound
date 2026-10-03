import{j as l,a4 as R}from"./iframe-Pee757m_.js";import{R as f}from"./RuleDetailView-C_wWST-z.js";import{u as h,m as k}from"./useOktaApi.mock-CyMgmY7X.js";import"./preload-helper-PPVm8Dsz.js";import"./RuleActionBar-BbkaDxBE.js";import"./RuleLifecycleActions-BqS1mFt3.js";import"./useRuleTargetEdit-DadjPkB0.js";import"./MissingGroupChip-Bjj4npQI.js";import"./RuleTargetRow-UTy4fshw.js";import"./ruleTargetFacts-DKSE0DP8.js";import"./RuleTargetPicker-Ddrs_JwX.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./ruleTargets-hCG7hfyY.js";import"./RuleUserCheckSection-B6eWGBPl.js";import"./QualificationSubjectStatus-CU6lZAdE.js";import"./RuleUserReport-ByhXsGqL.js";import"./userDisplay-xpx41Abi.js";import"./UserPickerModal-BlV7bmM-.js";import"./VerbRunner-C8BUgmCE.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./memberAnalytics-tPH-giHi.js";import"./BreakdownReport-DLC4-fAg.js";import"./PreflightSections-DS2OyTQC.js";import"./RunSteps-B3-vvI0R.js";import"./costSentence-BaIgeJiz.js";import"./csvUtils-DgNWYp8m.js";import"./qualification-Bb8ctTg-.js";import"./membershipAnalysis-PgI-DSyi.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-DrFMC5PN.js";import"./useUserPicker-CyfeOeo7.js";import"./groupContext-D0LcfWax.js";import"./useDebouncedUserSearch-CwOzP0tx.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./selectionStore-CJ3uIvus.js";import"./useSelection-DhS6cLGA.js";import"./useUndoAction-CXuSt7jT.js";import"./undoManager-CK5SBv_l.js";import"./profileAttributes-dOD8gkOj.js";import"./dateFormat-Db8QGh5_.js";import"./profileFields-BZvCtc6D.js";import"./auditStore-Drtcd6o6.js";import"./index-Dob3nYDb.js";import"./useActorNotice-qzPG2tVV.js";import"./useVerbRun-DT7B4Jtv.js";import"./types-UQE3j1TH.js";import"./RuleMovePicker-CcVHYBbz.js";import"./DuplicateSetParts-AUAlRlyx.js";import"./ruleUtils-D89ADPfb.js";const{expect:a,fn:o,userEvent:r,within:i}=__STORYBOOK_MODULE_TEST__,v="00rFAKE0000000000002",w="00rFAKE0000000000003",A="00gFAKE00000000ENG01",b="00gFAKE00000000CON01",E="00gFAKE00000000VPN01",x={rule:o(),group:o(),user:o(),app:o(),policy:o()},g={id:v,name:"Engineering by department",status:"ACTIVE",condition:'user.department == "Engineering"',conditionExpression:'user.department == "Engineering"',groupIds:[A,b],groupNames:["Engineering - All","Contractors"],userAttributes:["department"],created:"2024-01-15T09:00:00.000Z",lastUpdated:"2026-06-01T14:30:00.000Z"},u={id:w,name:"EMEA contractors",status:"ACTIVE",condition:'user.employeeType == "CONTRACTOR"',conditionExpression:'user.employeeType == "CONTRACTOR"',groupIds:[E],groupNames:["VPN"],userAttributes:["employeeType"],created:"2023-03-02T09:00:00.000Z",lastUpdated:"2026-05-11T10:00:00.000Z"},M=[g,u,{...u,id:"00rFAKE0000000000004",name:"AMER contractors",groupIds:[E,b]}],C=e=>({id:e.id,name:e.name,status:e.status,type:"group_rule",conditions:{expression:{value:e.condition,type:""}},actions:{assignUserToGroups:{groupIds:e.groupIds}}}),T=(e={})=>k({getRawGroupRule:o(async t=>C(t===w?u:g)),getCurrentUser:o(async()=>({kind:"resolved",email:"admin@example.com",id:""})),...e});async function y(e){const t=i(e);await r.click(t.getByRole("button",{name:"Edit groups"})),await r.click(t.getByRole("button",{name:"Move Contractors to another rule…"}));const n=i(e.ownerDocument.body);return await r.click(n.getByRole("radio",{name:"Move to EMEA contractors"})),await r.click(n.getByRole("button",{name:"Review move"})),await n.findByRole("button",{name:"Move group"}),n}const Me={title:"Rules/RuleDetailView/Move a group",component:f,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"**Move to another rule…** from an edit-mode row. The picker filters the rules the tab loaded, sending nothing. The confirm re-reads both rules and stacks the destination’s diff above the source’s, because it is written first; the run adds to the destination and only then removes from the source, so the group is always on at least one rule. A removal Okta did not confirm is named, with **Retry removal**."}}},decorators:[e=>l.jsx(R,{handlers:x,children:l.jsx("div",{className:"p-(--sp-gutter)",children:l.jsx(e,{})})})],args:{rule:g,rules:M,oktaOrigin:"https://example.okta.com",targetTabId:1,onPreviewImpact:o(),tierOpen:!1,onTierOpenChange:o(),isConfirmingActivate:!1,onRequestActivate:o(),onCancelActivate:o(),onConfirmActivate:o(),onRequestDeactivate:o(),onTargetsSaved:o(),onResumeRule:o(),sticky:!1},argTypes:{rules:{description:"The loaded rules — the move’s destinations. Omitted, no move."},targetTabId:{description:"The tab the writes go through. `null` offers no edit."}},beforeEach:()=>{h.mockReturnValue(T())}},s={play:async({canvasElement:e})=>{const t=i(e);await r.click(t.getByRole("button",{name:"Edit groups"})),await r.click(t.getByRole("button",{name:"Move Contractors to another rule…"}));const n=i(e.ownerDocument.body);await a(n.getByRole("dialog",{name:"Move Contractors"})).toBeVisible(),await a(n.getAllByRole("radio")).toHaveLength(1),await a(n.getByText("Not offered: 1 already adds to Contractors.")).toBeInTheDocument()}},c={play:async({canvasElement:e})=>{const t=await y(e),n=t.getByRole("dialog",{name:"Move Contractors"});await a(n).toBeVisible(),await a(t.getByText("Adds to EMEA contractors first, then removes from Engineering by department, so nobody is left out of both.")).toBeInTheDocument();const p=i(n).getAllByRole("region");await a(p.map(B=>B.getAttribute("aria-label"))).toEqual(["EMEA contractors","Engineering by department"]),await a(i(p[0]).getByText("Added")).toBeInTheDocument(),await a(i(p[1]).getByText("Removed")).toBeInTheDocument(),await a(t.getByText("Takes 8 requests. Changes 2 entities in Okta.")).toBeInTheDocument()}},d={play:async({canvasElement:e,args:t})=>{const n=await y(e);await r.click(n.getByRole("button",{name:"Move group"})),await a(await n.findByText("Moved Contractors from Engineering by department to EMEA contractors.")).toBeInTheDocument(),await a(n.getByRole("button",{name:"Move it back"})).toBeInTheDocument(),await a(t.onTargetsSaved).toHaveBeenCalled()}},m={beforeEach:()=>{h.mockReturnValue(T({updateGroupRule:o(async(e,t)=>e===v?{kind:"unknown",error:"Okta did not confirm the change."}:{kind:"saved",rule:{...t,id:e,status:"INACTIVE"}})}))},play:async({canvasElement:e})=>{const t=await y(e);await r.click(t.getByRole("button",{name:"Move group"})),await a(await t.findByText("Added Contractors to EMEA contractors.")).toBeInTheDocument(),await a(t.getByText("Engineering by department: the removal is unknown. Okta didn’t confirm it.")).toBeInTheDocument(),await a(t.getByRole("button",{name:"Retry removal"})).toBeInTheDocument()}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Edit groups'
    }));
    await userEvent.click(canvas.getByRole('button', {
      name: 'Move Contractors to another rule…'
    }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('dialog', {
      name: 'Move Contractors'
    })).toBeVisible();
    await expect(body.getAllByRole('radio')).toHaveLength(1);
    await expect(body.getByText('Not offered: 1 already adds to Contractors.')).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"The picker: the source is not offered, and the rule that already adds the group is counted.",...s.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const body = await reviewMove(canvasElement);
    const dialog = body.getByRole('dialog', {
      name: 'Move Contractors'
    });
    await expect(dialog).toBeVisible();
    await expect(body.getByText('Adds to EMEA contractors first, then removes from Engineering by department, so nobody is left out of both.')).toBeInTheDocument();
    const sections = within(dialog).getAllByRole('region');
    await expect(sections.map(s => s.getAttribute('aria-label'))).toEqual(['EMEA contractors', 'Engineering by department']);
    await expect(within(sections[0]).getByText('Added')).toBeInTheDocument();
    await expect(within(sections[1]).getByText('Removed')).toBeInTheDocument();
    await expect(body.getByText('Takes 8 requests. Changes 2 entities in Okta.')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"The confirm: the order sentence, both diffs stacked destination-first, and the cost.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const body = await reviewMove(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Move group'
    }));
    await expect(await body.findByText('Moved Contractors from Engineering by department to EMEA contractors.')).toBeInTheDocument();
    await expect(body.getByRole('button', {
      name: 'Move it back'
    })).toBeInTheDocument();
    await expect(args.onTargetsSaved).toHaveBeenCalled();
  }
}`,...d.parameters?.docs?.source},description:{story:"Both edits landed: moved, with **Move it back**; the host reloads the rules.",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    useOktaApi.mockReturnValue(writable({
      updateGroupRule: fn(async (ruleId: string, body: Record<string, unknown>) => ruleId === SOURCE ? {
        kind: 'unknown',
        error: 'Okta did not confirm the change.'
      } : {
        kind: 'saved',
        rule: {
          ...body,
          id: ruleId,
          status: 'INACTIVE'
        }
      })
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const body = await reviewMove(canvasElement);
    await userEvent.click(body.getByRole('button', {
      name: 'Move group'
    }));
    await expect(await body.findByText('Added Contractors to EMEA contractors.')).toBeInTheDocument();
    await expect(body.getByText('Engineering by department: the removal is unknown. Okta didn’t confirm it.')).toBeInTheDocument();
    await expect(body.getByRole('button', {
      name: 'Retry removal'
    })).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"The addition landed and Okta did not confirm the removal: named, with **Retry removal**.",...m.parameters?.docs?.description}}};const Ce=["Picker","Confirm","Moved","RemovalUnknown"];export{c as Confirm,d as Moved,s as Picker,m as RemovalUnknown,Ce as __namedExportsOrder,Me as default};
