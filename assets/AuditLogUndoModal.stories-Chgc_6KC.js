import{A as R}from"./AuditLogUndoModal-_ARcPi0P.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./ruleTargets-hCG7hfyY.js";import"./ruleTargetFacts-DKSE0DP8.js";const{expect:a,fn:v,userEvent:B,within:o}=__STORYBOOK_MODULE_TEST__,r=(t,e,n)=>({name:t,label:t,beforeDisplay:e,beforeRaw:e,afterDisplay:n,restorable:!0}),h=(t,e,n)=>({name:t,label:t,afterDisplay:e,restorable:!1,omitted:n}),b=t=>({id:"action_profile",type:"UPDATE_USER_PROFILE",timestamp:Date.now()-300*1e3,description:"Updated department, title on Ada Lovelace",status:"completed",metadata:{type:"UPDATE_USER_PROFILE",userId:"00uFAKE0000000000001",userLogin:"user@example.com",userName:"Ada Lovelace",changes:t}}),T=b([r("department","Platform","Engineering"),r("title","Intern","Engineer")]),f=b([r("department","Platform","Engineering"),h("bio","A long biography that exceeded the capture cap","too-large"),r("title","Intern","Engineer"),h("notes","Another long note","too-many"),r("city","","Berlin")]),E={id:"action_rule_targets",type:"UPDATE_RULE_TARGETS",timestamp:Date.now()-300*1e3,description:"Renamed rule Engineers to Engineering — all and edited its target groups",status:"completed",metadata:{type:"UPDATE_RULE_TARGETS",ruleId:"0prFAKE0000000000001",before:{groupIds:["00gFAKE0000000000001"],name:"Engineers"},after:{groupIds:["00gFAKE0000000000001","00gFAKE0000000000002"],name:"Engineering — all"}}},A={title:"Sidepanel/AuditLogUndoModal",component:R,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"The confirmation for undoing a recorded profile write, and the place a refusal is explained. Undo here is a forward write — Okta has no rollback, so restoring an attribute issues a new update that happens to set the old value, and the dialog says so.\n\nThe confirm body lists every attribute `after → before`, naming any whose prior value was never captured. The `drifted` body is a refusal with no confirm button, and shows attribute names only, never values."}}},args:{action:T,onClose:v(),onConfirm:v(),isUndoing:!1},argTypes:{action:{description:"The entry being undone. `null` closes the dialog."},onClose:{description:"Called on Cancel, Escape, overlay click, or the header close button."},onConfirm:{description:"Runs the restoring write. The dialog never calls Okta itself."},isUndoing:{description:"Whether the restoring write is in flight; drives the confirm spinner."},drifted:{description:"Attributes changed in Okta since the original write; present means refused."},error:{description:"Message from a restore that was attempted and did not succeed."}}},s={play:async({canvasElement:t,args:e})=>{const n=o(t.ownerDocument.body);await a(n.getByRole("dialog",{name:"Restore previous values"})).toBeVisible(),await B.click(n.getByRole("button",{name:"Restore"})),await a(e.onConfirm).toHaveBeenCalledTimes(1)}},i={play:async({canvasElement:t,args:e})=>{const n=o(t.ownerDocument.body);await B.click(n.getByRole("button",{name:"Cancel"})),await a(e.onClose).toHaveBeenCalledTimes(1),await a(e.onConfirm).not.toHaveBeenCalled()}},c={args:{action:f},play:async({canvasElement:t})=>{const e=o(t.ownerDocument.body);await a(e.getByText("3 of 5 attributes can be restored.")).toBeVisible(),await a(e.getByText("Previous value was not captured (too large)")).toBeVisible(),await a(e.getByText("Previous value was not captured (too many attributes changed at once)")).toBeVisible()}},l={args:{action:b([r("city","","Berlin")])}},d={args:{drifted:["department","title"]},play:async({canvasElement:t})=>{const e=o(t.ownerDocument.body);await a(e.getByRole("dialog",{name:"Undo refused"})).toBeVisible(),await a(e.queryByRole("button",{name:"Restore"})).toBeNull(),await a(e.getByRole("button",{name:"Close"})).toBeVisible(),await a(e.queryByText(/Platform/)).toBeNull(),await a(e.queryByText(/Engineering/)).toBeNull()}},p={args:{isUndoing:!0}},u={args:{error:"Okta rejected the profile update."},play:async({canvasElement:t})=>{const e=o(t.ownerDocument.body);await a(e.getByRole("alert")).toHaveTextContent("Okta rejected the profile update."),await a(e.getByRole("button",{name:"Restore"})).toBeVisible()}},m={args:{action:null}},g={args:{action:f},parameters:{viewport:{value:"sidepanelCompact"}}},y={args:{action:E},play:async({canvasElement:t})=>{const e=o(t.ownerDocument.body);await a(e.getByText("Engineering — all will be set back to the 1 target group it had before this edit, which removes 1 target group.")).toBeVisible(),await a(e.getByText("Its name will be set back to Engineers.")).toBeVisible(),await a(e.getByRole("button",{name:"Restore"})).toBeVisible()}},w={args:{action:E,drifted:["Target groups"]},play:async({canvasElement:t})=>{const e=o(t.ownerDocument.body);await a(e.getByRole("dialog",{name:"Undo refused"})).toBeVisible(),await a(e.getByText("Nothing was written. This rule is no longer what this edit left.")).toBeVisible(),await a(e.queryByRole("button",{name:"Restore"})).toBeNull()}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', {
      name: 'Restore previous values'
    })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Restore'
    }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  }
}`,...s.parameters?.docs?.source},description:{story:"Everything can be put back: two attributes, each `after → before`. Restore confirms.",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(args.onConfirm).not.toHaveBeenCalled();
  }
}`,...i.parameters?.docs?.source},description:{story:"Cancel leaves the write unmade: the dialog closes and nothing is confirmed.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    action: partiallyRestorable
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('3 of 5 attributes can be restored.')).toBeVisible();
    await expect(canvas.getByText('Previous value was not captured (too large)')).toBeVisible();
    await expect(canvas.getByText('Previous value was not captured (too many attributes changed at once)')).toBeVisible();
  }
}`,...c.parameters?.docs?.source},description:{story:"Three of five: the two the capture policy dropped are named, with why.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    action: entry([captured('city', '', 'Berlin')])
  }
}`,...l.parameters?.docs?.source},description:{story:"A genuinely empty prior value reads as empty, never as blank space.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    drifted: ['department', 'title']
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', {
      name: 'Undo refused'
    })).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: 'Restore'
    })).toBeNull();
    await expect(canvas.getByRole('button', {
      name: 'Close'
    })).toBeVisible();
    // Names only: no captured or current value is rendered.
    await expect(canvas.queryByText(/Platform/)).toBeNull();
    await expect(canvas.queryByText(/Engineering/)).toBeNull();
  }
}`,...d.parameters?.docs?.source},description:{story:"The refusal: attributes changed in Okta since the write. No confirm button, no values.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    isUndoing: true
  }
}`,...p.parameters?.docs?.source},description:{story:"The restoring write is in flight; the confirm button carries its own spinner.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Okta rejected the profile update.'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Okta rejected the profile update.');
    await expect(canvas.getByRole('button', {
      name: 'Restore'
    })).toBeVisible();
  }
}`,...u.parameters?.docs?.source},description:{story:"A restore that was attempted and rejected, retryable without reopening.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    action: null
  }
}`,...m.parameters?.docs?.source},description:{story:"`action: null` — the shared `Modal` renders nothing at all.",...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    action: partiallyRestorable
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...g.parameters?.docs?.source},description:{story:"The 360px floor, where an attribute's `after → before` pair has to wrap.",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    action: ruleTargetsEdit
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('Engineering — all will be set back to the 1 target group it had before this edit, which removes 1 target group.')).toBeVisible();
    await expect(canvas.getByText('Its name will be set back to Engineers.')).toBeVisible();
    await expect(canvas.getByRole('button', {
      name: 'Restore'
    })).toBeVisible();
  }
}`,...y.parameters?.docs?.source},description:{story:"A rule target-group edit: the count going back, what that removes, and the previous name.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    action: ruleTargetsEdit,
    drifted: ['Target groups']
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', {
      name: 'Undo refused'
    })).toBeVisible();
    await expect(canvas.getByText('Nothing was written. This rule is no longer what this edit left.')).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: 'Restore'
    })).toBeNull();
  }
}`,...w.parameters?.docs?.source},description:{story:"A rule target-group undo refused: the rule changed after the edit.",...w.parameters?.docs?.description}}};const U=["Default","CancelMakesNoWrite","PartialRestore","RestoringToEmpty","Drifted","Undoing","ErrorState","Closed","Compact","RuleTargets","RuleTargetsDrifted"];export{i as CancelMakesNoWrite,m as Closed,g as Compact,s as Default,d as Drifted,u as ErrorState,c as PartialRestore,l as RestoringToEmpty,y as RuleTargets,w as RuleTargetsDrifted,p as Undoing,U as __namedExportsOrder,A as default};
