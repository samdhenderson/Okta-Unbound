import{r as f,j as O}from"./iframe-mmN7AxbW.js";import{U as v}from"./UserActionBar-D4hX_F1n.js";import{m as C}from"./fixtures-CsAiPaTu.js";import"./preload-helper-PPVm8Dsz.js";import"./UserLifecycleActions-Dz_OlyWD.js";import"./PasswordChangeFields-CrZFAhNM.js";import"./userDisplay-xpx41Abi.js";const{expect:s,fn:n,userEvent:y,within:b}=__STORYBOOK_MODULE_TEST__,w=(t={})=>({...C[10],status:"ACTIVE",...t}),R={title:"Users/UserActionBar",component:v,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Every verb whose object is the whole user, ranked rather than flattened. The row holds what you reach for while reading — *Add group* (the primary) and *Compare* — and the disclosure tier holds the account-state verbs, so suspending someone is one press further away than comparing them.\n\nThe disclosure belongs to the shared `ActionBar`: it renders **More**, owns the region and owns that region’s `aria-controls` target, which is why there is no disclosure button in this component’s source. Gating follows status — Suspend for `ACTIVE`, Unsuspend for `SUSPENDED`, and a notice instead of the band for `DEPROVISIONED`.\n\n*Check rule* and *Check membership* are zero-request checks over the user the rung already holds; each is offered only when wired (the inventory, a tab) and omitted otherwise (ADR-0010)."}}},args:{user:w(),onCompare:n(),onAddToGroup:n(),onCheckRule:n(),onWhyNotMember:n(),isLoadingMemberships:!1,tierOpen:!1,onTierOpenChange:n(),isLifecycleLoading:!1,pendingLifecycleAction:null,onRequestLifecycleAction:n(),onCancelLifecycleAction:n(),onConfirmLifecycleAction:n(),sticky:!1},argTypes:{user:{description:"The user every verb in the strip acts on."},onCompare:{description:"Opens the comparison rung."},onAddToGroup:{description:"Opens the Add-to-Group modal."},onCheckRule:{description:"Opens the rule picker. Omitted until the inventory is available."},onWhyNotMember:{description:"Opens the group picker. Omitted with no tab."},isLoadingMemberships:{description:"True while memberships load — both row verbs need them, so both disable."},tierOpen:{description:"Whether the disclosure tier is showing. Owned by the tab, so a rung change collapses it."},onTierOpenChange:{description:"Called with the tier’s next open state when **More** is pressed."},isLifecycleLoading:{description:"True while a confirmed lifecycle action is in flight."},pendingLifecycleAction:{description:"The action awaiting confirmation, or `null`."},sticky:{description:"Pin the strip below the header. `false` in stories — nothing scrolls."}}},a={},o={play:async({canvasElement:t,args:e})=>{const r=b(t);await y.click(r.getByRole("button",{name:"Check rule"})),await s(e.onCheckRule).toHaveBeenCalledTimes(1),await y.click(r.getByRole("button",{name:"Check membership"})),await s(e.onWhyNotMember).toHaveBeenCalledTimes(1)}},i={args:{onCheckRule:void 0,onWhyNotMember:void 0},play:async({canvasElement:t})=>{const e=b(t);await s(e.queryByRole("button",{name:"Check rule"})).not.toBeInTheDocument(),await s(e.queryByRole("button",{name:"Check membership"})).not.toBeInTheDocument()}},c={args:{isLoadingMemberships:!0}},p={args:{tierOpen:!0}},d={args:{tierOpen:!0,user:w({status:"SUSPENDED"})}},u={args:{tierOpen:!0,user:w({status:"DEPROVISIONED"})}},l={args:{tierOpen:!0,isLifecycleLoading:!0}},m={args:{tierOpen:!0,pendingLifecycleAction:"suspend"}},h={render:t=>{const[e,r]=f.useState(!1);return O.jsx(v,{...t,tierOpen:e,onTierOpenChange:r})},play:async({canvasElement:t})=>{const e=b(t),r=e.getByRole("button",{name:"More"});await s(r).toHaveAttribute("aria-expanded","false"),await y.click(r),await s(r).toHaveAttribute("aria-expanded","true"),await s(e.getByRole("button",{name:/Suspend user/})).toBeVisible(),await y.click(r),await s(r).toHaveAttribute("aria-expanded","false")}},g={args:{tierOpen:!0},parameters:{viewport:{value:"sidepanelCompact"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"The row only: the everyday verbs, with the tier closed behind **More**.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Check rule'
    }));
    await expect(args.onCheckRule).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Check membership'
    }));
    await expect(args.onWhyNotMember).toHaveBeenCalledTimes(1);
  }
}`,...o.parameters?.docs?.source},description:{story:"Both checks in the row, after *Compare*, and neither is `primary`.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    onCheckRule: undefined,
    onWhyNotMember: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Check rule'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Check membership'
    })).not.toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:"Inventory not yet available and no tab: both checks omitted, never disabled.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    isLoadingMemberships: true
  }
}`,...c.parameters?.docs?.source},description:{story:"Memberships are still loading, so Compare and Add group are both unavailable.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  }
}`,...p.parameters?.docs?.source},description:{story:"An ACTIVE user with the tier open: reset password above the rule, suspend below it.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    user: user({
      status: 'SUSPENDED'
    })
  }
}`,...d.parameters?.docs?.source},description:{story:"A SUSPENDED user: the destructive row becomes the restorative one.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    user: user({
      status: 'DEPROVISIONED'
    })
  }
}`,...u.parameters?.docs?.source},description:{story:"A DEPROVISIONED user: the tier carries the notice rather than a row of disabled buttons.",...u.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    isLifecycleLoading: true
  }
}`,...l.parameters?.docs?.source},description:{story:"A lifecycle action is in flight — every verb in the tier is disabled.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true,
    pendingLifecycleAction: 'suspend'
  }
}`,...m.parameters?.docs?.source},description:{story:"The suspend action is armed, so its confirmation modal is open.",...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a story render fn is a component
    const [open, setOpen] = useState(false);
    return <UserActionBar {...args} tierOpen={open} onTierOpenChange={setOpen} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const manage = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(manage).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(manage);
    await expect(manage).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', {
      name: /Suspend user/
    })).toBeVisible();
    await userEvent.click(manage);
    await expect(manage).toHaveAttribute('aria-expanded', 'false');
  }
}`,...h.parameters?.docs?.source},description:{story:"More is a real disclosure: `aria-expanded` flips and the tier it reveals is reachable.",...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`The 360px floor with the tier open — the width this strip's shape was designed
against, and the reason the label is *Add group* rather than "Add to Group". The
viewport preset resizes the explorer preview only; \`actionBarFit\`'s own tests are
what verify the arithmetic.`,...g.parameters?.docs?.description}}};const x=["Default","QualificationChecks","ChecksNotWired","LoadingMemberships","TierOpenActive","TierOpenSuspended","TierOpenDeprovisioned","TierOpenLifecycleRunning","ConfirmingSuspend","MoreIsADisclosure","NarrowTierOpen"];export{i as ChecksNotWired,m as ConfirmingSuspend,a as Default,c as LoadingMemberships,h as MoreIsADisclosure,g as NarrowTierOpen,o as QualificationChecks,p as TierOpenActive,u as TierOpenDeprovisioned,l as TierOpenLifecycleRunning,d as TierOpenSuspended,x as __namedExportsOrder,R as default};
