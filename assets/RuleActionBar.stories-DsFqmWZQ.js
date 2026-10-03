import{r as f,j as A}from"./iframe-Pee757m_.js";import{R as T}from"./RuleActionBar-BbkaDxBE.js";import"./preload-helper-PPVm8Dsz.js";import"./RuleLifecycleActions-BqS1mFt3.js";const{expect:a,fn:r,userEvent:w,within:s}=__STORYBOOK_MODULE_TEST__,y=(t={})=>({id:"00rFAKE0000000000001",name:"Engineering – Auto-assign by department",status:"ACTIVE",condition:'user.department == "Engineering"',conditionExpression:'user.department == "Engineering"',groupIds:["00g1a2b3c4d5e6f7g8h9","00g9z8y7x6w5v4u3t2s1"],groupNames:["Engineering – All","Slack – Eng Channel"],userAttributes:["department"],created:"2024-01-15T09:00:00.000Z",lastUpdated:"2026-06-01T14:30:00.000Z",...t}),k={title:"Rules/RuleActionBar",component:T,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Every verb whose object is the whole rule. The row holds only what is read-only — *Preview impact*, which works out who would stop being attributed and writes nothing, and which is therefore also the `primary`.\n\nActivate and deactivate look like a reversible pair and are not: Okta’s rule engine only ever adds, so activating writes memberships deactivating will not take back, and deactivating strands memberships reactivating will not re-attribute. Both start behind **More**, with the consequence stated beside the control. There is no Delete and no Edit condition because neither has a live handler, and no *Edit groups*: its object is the target-groups card, so it lives in that card’s header (`RuleTargetsEditor`).\n\n*Evaluate user* is read-only too, so it sits in the row — but it fetches a subject (two requests), so it is never `primary` and names its cost in its tooltip. With no Okta tab it is omitted, never disabled (ADR-0010)."}}},args:{rule:y(),onPreviewImpact:r(),onCheckUser:r(),tierOpen:!1,onTierOpenChange:r(),isLifecycleLoading:!1,isConfirmingActivate:!1,onRequestActivate:r(),onCancelActivate:r(),onConfirmActivate:r(),onRequestDeactivate:r(),sticky:!1},argTypes:{rule:{description:"The rule every verb in the strip acts on."},onPreviewImpact:{description:"Opens the read-only impact preview."},onCheckUser:{description:"Opens the user picker for a qualification check. Omitted with no tab."},tierOpen:{description:"Whether the disclosure tier is showing. Owned by the tab."},onTierOpenChange:{description:"Called with the tier’s next open state."},isLifecycleLoading:{description:"True while a confirmed lifecycle write is in flight."},isConfirmingActivate:{description:"Whether the activation confirm is armed."},sticky:{description:"Pin the strip below the header."}}},o={},i={args:{tierOpen:!0}},c={args:{tierOpen:!0,rule:y({status:"INACTIVE"})}},p={args:{tierOpen:!0,rule:y({status:"INACTIVE"}),isConfirmingActivate:!0},play:async({canvasElement:t,args:e})=>{const n=s(t.ownerDocument.body);await a(n.getByRole("dialog")).toBeVisible(),await w.click(n.getByRole("button",{name:"Activate"})),await a(e.onConfirmActivate).toHaveBeenCalledTimes(1)}},u={args:{tierOpen:!0,isLifecycleLoading:!0}},d={args:{tierOpen:!0},play:async({canvasElement:t})=>{const e=s(t);await a(e.queryByRole("button",{name:"Add target group"})).not.toBeInTheDocument(),await a(e.getByRole("button",{name:/Deactivate rule/})).toBeInTheDocument()}},l={play:async({canvasElement:t,args:e})=>{const b=s(t).getByRole("button",{name:"Evaluate user"});await a(b).toHaveAttribute("title",a.stringMatching(/two requests/)),await w.click(b),await a(e.onCheckUser).toHaveBeenCalledTimes(1)}},m={args:{onCheckUser:void 0},play:async({canvasElement:t})=>{const e=s(t);await a(e.queryByRole("button",{name:"Evaluate user"})).not.toBeInTheDocument(),await a(e.getByRole("button",{name:"Preview impact"})).toBeInTheDocument()}},h={args:{rule:y({groupIds:[],groupNames:[]}),onPreviewImpact:void 0},play:async({canvasElement:t})=>{const e=s(t);await a(e.queryByRole("button",{name:"Preview impact"})).not.toBeInTheDocument(),await a(e.getByRole("button",{name:"More"})).toBeInTheDocument()}},v={render:t=>{const[e,n]=f.useState(!1);return A.jsx(T,{...t,tierOpen:e,onTierOpenChange:n})},play:async({canvasElement:t})=>{const e=s(t),n=e.getByRole("button",{name:"More"});await a(n).toHaveAttribute("aria-expanded","false"),await w.click(n),await a(n).toHaveAttribute("aria-expanded","true"),await a(e.getByRole("button",{name:/Deactivate rule/})).toBeVisible(),await w.click(n),await a(n).toHaveAttribute("aria-expanded","false")}},g={args:{tierOpen:!0},parameters:{viewport:{value:"sidepanelCompact"}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source},description:{story:"The row only: one read-only verb, with everything that writes behind **More**.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  }
}`,...i.parameters?.docs?.source},description:{story:"An ACTIVE rule with the tier open — the lifecycle verb is the destructive one.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    rule: rule({
      status: 'INACTIVE'
    })
  }
}`,...c.parameters?.docs?.source},description:{story:"An INACTIVE rule: the same row offers activation, and says what activating costs.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    rule: rule({
      status: 'INACTIVE'
    }),
    isConfirmingActivate: true
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Activate'
    }));
    await expect(args.onConfirmActivate).toHaveBeenCalledTimes(1);
  }
}`,...p.parameters?.docs?.source},description:{story:"The activation confirm is armed, so its modal is open and states the consequence.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    isLifecycleLoading: true
  }
}`,...u.parameters?.docs?.source},description:{story:"A lifecycle write is in flight — every verb in the tier is disabled.",...u.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Add target group'
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: /Deactivate rule/
    })).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:`The tier holds the lifecycle verb and nothing else. *Add target group* is gone with the
replacement-rule flow it fronted; groups are edited in place, from the card.`,...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const check = canvas.getByRole('button', {
      name: 'Evaluate user'
    });
    await expect(check).toHaveAttribute('title', expect.stringMatching(/two requests/));
    await userEvent.click(check);
    await expect(args.onCheckUser).toHaveBeenCalledTimes(1);
  }
}`,...l.parameters?.docs?.source},description:{story:"*Evaluate user* is in the row, not `primary`, and states its cost.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    onCheckUser: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Evaluate user'
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Preview impact'
    })).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"No Okta tab to read a subject from: the verb is omitted, never disabled.",...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupIds: [],
      groupNames: []
    }),
    onPreviewImpact: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Preview impact'
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'More'
    })).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"A rule assigning to no groups: *Preview impact* is omitted rather than disabled.",...h.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a story render fn is a component
    const [open, setOpen] = useState(false);
    return <RuleActionBar {...args} tierOpen={open} onTierOpenChange={setOpen} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', {
      name: /Deactivate rule/
    })).toBeVisible();
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
  }
}`,...v.parameters?.docs?.source},description:{story:"**More** is a real disclosure: `aria-expanded` flips and the tier it controls appears.",...v.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...g.parameters?.docs?.source},description:{story:"The 360px floor with the tier open: consequence sentences wrap beside their buttons.",...g.parameters?.docs?.description}}};const I=["Default","TierOpenActive","TierOpenInactive","ConfirmingActivate","TierOpenLifecycleRunning","TierWithoutAddTargetGroup","CheckAUserInTheRow","NoTabToCheckFrom","NoTargetGroups","MoreIsADisclosure","NarrowTierOpen"];export{l as CheckAUserInTheRow,p as ConfirmingActivate,o as Default,v as MoreIsADisclosure,g as NarrowTierOpen,m as NoTabToCheckFrom,h as NoTargetGroups,i as TierOpenActive,c as TierOpenInactive,u as TierOpenLifecycleRunning,d as TierWithoutAddTargetGroup,I as __namedExportsOrder,k as default};
