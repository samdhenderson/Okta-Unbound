import{j as f,r as S}from"./iframe-Pee757m_.js";import{A as R}from"./AuditLogRow-jOWg2zBX.js";import"./preload-helper-PPVm8Dsz.js";import"./undoManager-CK5SBv_l.js";const{expect:a,fn:U,userEvent:O,within:r}=__STORYBOOK_MODULE_TEST__,L=Date.now()-300*1e3,o=(n,e,t,s="completed")=>({id:n,type:t.type,timestamp:L,description:e,status:s,metadata:t}),x=(n,e,t)=>({name:n,label:n,beforeDisplay:e,beforeRaw:e,afterDisplay:t,restorable:!0}),A=(n,e,t)=>({name:n,label:n,afterDisplay:e,restorable:!1,omitted:t}),B=o("action_profile","Updated department, title on Ada Lovelace",{type:"UPDATE_USER_PROFILE",userId:"00uFAKE0000000000001",userLogin:"user@example.com",userName:"Ada Lovelace",changes:[x("department","Platform","Engineering"),x("title","Intern","Engineer")]}),T=o("action_mixed","Updated department and 4 more on Ada Lovelace",{type:"UPDATE_USER_PROFILE",userId:"00uFAKE0000000000001",userLogin:"user@example.com",userName:"Ada Lovelace",changes:[x("department","Platform","Engineering"),A("bio","A long biography that exceeded the capture cap","too-large"),x("title","Intern","Engineer"),A("notes","Another long note","too-many"),x("city","","Berlin")]}),F=o("action_removal","Removed Ada Lovelace from Engineering",{type:"REMOVE_USER_FROM_GROUP",userId:"00uFAKE0000000000001",userEmail:"user@example.com",userName:"Ada Lovelace",groupId:"00gFAKE0000000000001",groupName:"Engineering"}),I=o("action_consolidation","Consolidated 2 rules into Engineering — all",{type:"CONSOLIDATE_RULE",createdRuleId:"0prFAKE0000000000009",createdRuleName:"Engineering — all",createdGroupIds:["00gFAKE0000000000001","00gFAKE0000000000002"],retiredRules:[{id:"0prFAKE0000000000001",name:"Engineers by department",expression:'user.department=="Engineering"',groupIds:["00gFAKE0000000000001"]},{id:"0prFAKE0000000000002",name:"Engineers by title",expression:'user.title=="Engineer"',groupIds:["00gFAKE0000000000002"]}]}),V=o("action_rule_merge","Merged 2 rules into Engineering - all; 1 not retired",{type:"CONSOLIDATE_RULE",keptRuleId:"0prFAKE0000000000001",before:{groupIds:["00gFAKE0000000000001"],name:"Engineering - US"},after:{groupIds:["00gFAKE0000000000001","00gFAKE0000000000002"],name:"Engineering - all"},retiredRules:[{id:"0prFAKE0000000000002",name:"Engineering - EU",expression:'user.department=="Engineering"',groupIds:["00gFAKE0000000000002"]}],unretiredRules:[{id:"0prFAKE0000000000003",name:"Engineering - APAC"}]},"partial"),K=o("action_rule_targets","Renamed rule Engineers by department to Engineering — all and edited its target groups",{type:"UPDATE_RULE_TARGETS",ruleId:"0prFAKE0000000000001",before:{groupIds:["00gFAKE0000000000001"],name:"Engineers by department"},after:{groupIds:["00gFAKE0000000000001","00gFAKE0000000000002"],name:"Engineering — all"}}),N={...B,id:"action_undone",status:"undone",undoneByActionId:"action_undo"},D={...B,id:"action_partial",status:"partial"},k=n=>{if(n.status==="undone")return{undoable:!1,reason:"This action has already been undone."};if(n.status==="partial")return{undoable:!1,reason:"This write was never confirmed, so we do not know which values it actually set — and therefore cannot know what to restore."};if(n.status==="failed")return{undoable:!1,reason:"This action failed, so there is nothing to put back."};if(n.metadata.type==="UPDATE_RULE_TARGETS")return{undoable:!0,restorable:1,total:1};if(n.metadata.type!=="UPDATE_USER_PROFILE")return{undoable:!1,reason:"Only profile edits can be undone here. Every other action would need a new operation of its own rather than a restore."};const e=n.metadata.changes.length,t=n.metadata.changes.filter(s=>s.restorable).length;return t===0?{undoable:!1,reason:"No previous values were captured for this edit, so there is nothing to restore."}:{undoable:!0,restorable:t,total:e}},q={title:"Sidepanel/AuditLogRow",component:R,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"One recorded action: what happened, its type, when — and, for a profile write whose prior values were captured, an **Undo** button.\n\nUndo is offered or absent, never disabled; the reason an entry cannot be undone is a line inside the expanded body. An entry already undone wears `Undone`, and one whose outcome was never confirmed wears `Outcome unknown` and is never offered a restore."}}},decorators:[n=>f.jsx("div",{className:"bg-canvas p-4",children:f.jsx(n,{})})],args:{action:B,isExpanded:!1,onToggle:U(),onUndo:U(),undoability:k},argTypes:{action:{description:"The history entry this row is about."},isExpanded:{description:"Whether the disclosure is open. Owned by the list, so a refresh cannot close a row."},onToggle:{description:"Toggles this row's disclosure, by action id."},onUndo:{description:"Opens the undo confirmation. Omitted, no Undo button is rendered at all."},undoability:{description:"The pure eligibility test from `useUndoAction` — the row asks rather than deciding."}}},i={},d={args:{isExpanded:!1}},c={args:{isExpanded:!0}},l={args:{isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByRole("button",{name:"Undo"})).toBeVisible()}},p={args:{action:F,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.queryByRole("button",{name:"Undo"})).toBeNull(),await a(e.getByText(/Only profile edits can be undone/)).toBeVisible()}},u={args:{action:N,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByText("Undone")).toBeVisible(),await a(e.queryByRole("button",{name:"Undo"})).toBeNull()}},g={args:{action:D,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByText("Outcome unknown")).toBeVisible(),await a(e.queryByRole("button",{name:"Undo"})).toBeNull()}},m={args:{action:T,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getAllByText("(previous value not captured)")).toHaveLength(2),await a(e.getByRole("button",{name:"Undo"})).toBeVisible()}},y={args:{action:I,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByText("New rule:")).toBeVisible()}},E={args:{action:V,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByText("Rules Merged")).toBeVisible(),await a(e.getByText("Engineering - US → Engineering - all")).toBeVisible(),await a(e.getByText("Engineering - APAC")).toBeVisible(),await a(e.queryByRole("button",{name:"Undo"})).not.toBeInTheDocument()}},w={args:{action:K,isExpanded:!0},play:async({canvasElement:n})=>{const e=r(n);await a(e.getByText("Rule Groups Edited")).toBeVisible(),await a(e.getByText("1 → 2")).toBeVisible(),await a(e.getByRole("button",{name:"Undo"})).toBeVisible()}},h={args:{onUndo:void 0},play:async({canvasElement:n})=>{const e=r(n);await a(e.queryByRole("button",{name:"Undo"})).toBeNull()}},v={args:{isExpanded:!1},render:n=>{const e=()=>{const[t,s]=S.useState(!1);return f.jsx(R,{...n,isExpanded:t,onToggle:()=>s(_=>!_)})};return f.jsx(e,{})},play:async({canvasElement:n})=>{const e=r(n),t=e.getByRole("button",{name:"Show details for Updated department, title on Ada Lovelace"});await a(t).toHaveAttribute("aria-expanded","false"),await O.click(t),await a(e.getByRole("button",{name:"Hide details for Updated department, title on Ada Lovelace"})).toHaveAttribute("aria-expanded","true")}},b={args:{action:T},parameters:{viewport:{value:"sidepanelCompact"}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source},description:{story:"A profile write, collapsed: description, type mark, relative time, and Undo.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    isExpanded: false
  }
}`,...d.parameters?.docs?.source},description:{story:"Closed, which is how every row starts — a history of thirty open bodies is unscannable.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    isExpanded: true
  }
}`,...c.parameters?.docs?.source},description:{story:"Open: who was edited, and every attribute this write changed, `before → after`.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Undo'
    })).toBeVisible();
  }
}`,...l.parameters?.docs?.source},description:{story:"The undoable case. Every attribute here has a captured prior value.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    action: groupRemoval,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Undo'
    })).toBeNull();
    await expect(canvas.getByText(/Only profile edits can be undone/)).toBeVisible();
  }
}`,...p.parameters?.docs?.source},description:{story:"A group removal: no Undo button at all, with the reason stated in the body.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    action: undone,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Undone')).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: 'Undo'
    })).toBeNull();
  }
}`,...u.parameters?.docs?.source},description:{story:"Already undone: marked, and never offered a second restore.",...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    action: partial,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Outcome unknown')).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: 'Undo'
    })).toBeNull();
  }
}`,...g.parameters?.docs?.source},description:{story:"The write's transport threw, so undo is withheld — we cannot say what it set.",...g.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    action: profileUpdateMixed,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('(previous value not captured)')).toHaveLength(2);
    await expect(canvas.getByRole('button', {
      name: 'Undo'
    })).toBeVisible();
  }
}`,...m.parameters?.docs?.source},description:{story:"Two prior values were never captured: they are annotated in place, and the other three still restore.",...m.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    action: consolidation,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('New rule:')).toBeVisible();
  }
}`,...y.parameters?.docs?.source},description:{story:"A consolidation left by the retired create-and-retire flow, still readable.",...y.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    action: ruleMerge,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Rules Merged')).toBeVisible();
    await expect(canvas.getByText('Engineering - US → Engineering - all')).toBeVisible();
    await expect(canvas.getByText('Engineering - APAC')).toBeVisible();
    await expect(canvas.queryByRole('button', {
      name: 'Undo'
    })).not.toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source},description:{story:`An in-place merge: the kept rule, its rename, the group counts, what was
retired and what was not. Never offered for undo.`,...E.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    action: ruleTargetsEdit,
    isExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Rule Groups Edited')).toBeVisible();
    await expect(canvas.getByText('1 → 2')).toBeVisible();
    await expect(canvas.getByRole('button', {
      name: 'Undo'
    })).toBeVisible();
  }
}`,...w.parameters?.docs?.source},description:{story:"A rule target-group edit: the rename and the group counts, with Undo offered.",...w.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    onUndo: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Undo'
    })).toBeNull();
  }
}`,...h.parameters?.docs?.source},description:{story:"The row on a surface that cannot undo anything: the button is absent, not disabled.",...h.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    isExpanded: false
  },
  render: args => {
    const Harness = () => {
      const [expanded, setExpanded] = useState(false);
      return <AuditLogRow {...args} isExpanded={expanded} onToggle={() => setExpanded(prev => !prev)} />;
    };
    return <Harness />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Show details for Updated department, title on Ada Lovelace'
    });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(canvas.getByRole('button', {
      name: 'Hide details for Updated department, title on Ada Lovelace'
    })).toHaveAttribute('aria-expanded', 'true');
  }
}`,...v.parameters?.docs?.source},description:{story:`The disclosure wired to real state, so the chevron actually opens the body the
way a reader does.`,...v.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    action: profileUpdateMixed
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...b.parameters?.docs?.source},description:{story:"The 360px floor: the badge cluster wraps and the description truncates rather than pushing the controls off.",...b.parameters?.docs?.description}}};const j=["Default","Collapsed","Expanded","Undoable","NotUndoable","Undone","OutcomeUnknown","MixedRestorability","Consolidation","RulesMerged","RuleTargetsEdited","WithoutUndoHandler","OpeningTheDisclosure","Compact"];export{d as Collapsed,b as Compact,y as Consolidation,i as Default,c as Expanded,m as MixedRestorability,p as NotUndoable,v as OpeningTheDisclosure,g as OutcomeUnknown,w as RuleTargetsEdited,E as RulesMerged,l as Undoable,u as Undone,h as WithoutUndoHandler,j as __namedExportsOrder,q as default};
